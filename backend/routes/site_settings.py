from fastapi import APIRouter, HTTPException, Depends
from models.site_settings import SiteSettings, SiteSettingsUpdate
from utils.auth import verify_token
from utils.proxy_client import is_proxy_enabled, proxy_get, proxy_put, ProxyFallback
from datetime import datetime
import logging

from utils.redis_cache import get_cached, set_cached, invalidate
from database import db

logger = logging.getLogger(__name__)
router = APIRouter()
settings_collection = db.site_settings

@router.get("/settings", response_model=SiteSettings)
async def get_site_settings():
    if is_proxy_enabled():
        try:
            return await proxy_get("/settings")
        except ProxyFallback:
            logger.warning("[FALLBACK] VPS Proxy unreachable for GET /settings, using direct DB")

    cached = await get_cached("settings:all")
    if cached is not None:
        return cached
    settings = await settings_collection.find_one({})
    if not settings:
        result = SiteSettings().dict()
    else:
        result = SiteSettings(**settings).dict()
    await set_cached("settings:all", result, ttl=600)
    return result

@router.put("/settings", response_model=SiteSettings)
async def update_site_settings(settings_update: SiteSettingsUpdate, token: dict = Depends(verify_token)):
    if is_proxy_enabled():
        try:
            update_data = settings_update.dict(exclude_unset=True)
            return await proxy_put("/settings", update_data)
        except ProxyFallback:
            logger.warning("[FALLBACK] VPS Proxy unreachable for PUT /settings, using direct DB")

    existing = await settings_collection.find_one({})
    if existing:
        current_settings = SiteSettings(**existing)
    else:
        current_settings = SiteSettings()
        
    update_data = settings_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(current_settings, key, value)
            
    current_settings.updated_at = datetime.utcnow()
    await settings_collection.delete_many({})
    await settings_collection.insert_one(current_settings.dict())
    await invalidate("settings:all")
    return current_settings
