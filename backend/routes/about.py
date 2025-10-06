from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from utils.auth import verify_token
from datetime import datetime

router = APIRouter()

def get_about_collection():
    from motor.motor_asyncio import AsyncIOMotorClient
    import os
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    return db.about

class AboutContent(BaseModel):
    content: str
    updatedAt: datetime = None

@router.get("/about")
async def get_about():
    """Get about page content"""
    about_collection = get_about_collection()
    about = await about_collection.find_one({})
    if not about:
        # Return default content if none exists
        return AboutContent(content="# About\n\nWelcome to the blog!", updatedAt=datetime.utcnow())
    return AboutContent(**about)

@router.put("/about")
async def update_about(about_data: AboutContent, token: dict = Depends(verify_token)):
    """Update about page content (requires authentication)"""
    about_collection = get_about_collection()
    about_data.updatedAt = datetime.utcnow()
    await about_collection.delete_many({})  # Remove old content
    await about_collection.insert_one(about_data.dict())
    return about_data
