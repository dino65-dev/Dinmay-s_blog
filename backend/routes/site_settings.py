from fastapi import APIRouter, HTTPException, Depends
from models.site_settings import SiteSettings, SiteSettingsUpdate
from utils.auth import verify_token
from datetime import datetime

router = APIRouter()


def get_settings_collection():
    from motor.motor_asyncio import AsyncIOMotorClient
    import os
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    return db.site_settings


@router.get("/settings", response_model=SiteSettings)
async def get_site_settings():
    """Get site settings (public)"""
    settings_collection = get_settings_collection()
    settings = await settings_collection.find_one({})
    if not settings:
        # Return default settings if none exist
        return SiteSettings()
    return SiteSettings(**settings)


@router.put("/settings", response_model=SiteSettings)
async def update_site_settings(
    settings_update: SiteSettingsUpdate,
    token: dict = Depends(verify_token)
):
    """Update site settings (requires authentication)"""
    settings_collection = get_settings_collection()
    
    # Get existing settings or create default
    existing = await settings_collection.find_one({})
    if existing:
        current_settings = SiteSettings(**existing)
    else:
        current_settings = SiteSettings()
    
    # Update only provided fields
    update_data = settings_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(current_settings, key, value)
    
    current_settings.updated_at = datetime.utcnow()
    
    # Save to database
    await settings_collection.delete_many({})
    await settings_collection.insert_one(current_settings.dict())
    
    return current_settings
