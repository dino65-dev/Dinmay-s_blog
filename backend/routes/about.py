from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from utils.auth import verify_token
from utils.proxy_client import is_proxy_enabled, proxy_get, proxy_put, ProxyFallback
from datetime import datetime
import logging

from utils.redis_cache import get_cached, set_cached, invalidate
from database import db

logger = logging.getLogger(__name__)
router = APIRouter()
about_collection = db.about

class AboutContent(BaseModel):
    content: str
    updatedAt: datetime = None

@router.get("/about")
async def get_about():
    if is_proxy_enabled():
        try:
            return await proxy_get("/about")
        except ProxyFallback:
            logger.warning("[FALLBACK] VPS Proxy unreachable for GET /about, using direct DB")

    # Direct DB Fallback
    cached = await get_cached("about:content")
    if cached is not None:
        return cached
    about = await about_collection.find_one({})
    if not about:
        result = AboutContent(content="# About\n\nWelcome to the blog!", updatedAt=datetime.utcnow()).dict()
    else:
        result = AboutContent(**about).dict()
    await set_cached("about:content", result, ttl=600)
    return result

@router.put("/about")
async def update_about(about_data: AboutContent, token: dict = Depends(verify_token)):
    about_data.updatedAt = datetime.utcnow()
    
    if is_proxy_enabled():
        try:
            return await proxy_put("/about", about_data.dict())
        except ProxyFallback:
            logger.warning("[FALLBACK] VPS Proxy unreachable for PUT /about, using direct DB")

    # Direct DB Fallback
    await about_collection.delete_many({})
    await about_collection.insert_one(about_data.dict())
    await invalidate("about:content")
    return about_data
