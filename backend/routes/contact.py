from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.contact import ContactMessage, ContactMessageCreate
from utils.auth import verify_token

router = APIRouter()

def get_contact_collection():
    from motor.motor_asyncio import AsyncIOMotorClient
    import os
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    return db.contact_messages

@router.post("/contact", response_model=ContactMessage)
async def create_contact_message(message: ContactMessageCreate):
    """Submit a contact message (public endpoint)"""
    contact_collection = get_contact_collection()
    message_obj = ContactMessage(**message.dict())
    await contact_collection.insert_one(message_obj.dict())
    return message_obj

@router.get("/contact/messages", response_model=List[ContactMessage])
async def get_all_messages(token: dict = Depends(verify_token)):
    """Get all contact messages (requires authentication)"""
    contact_collection = get_contact_collection()
    messages = await contact_collection.find().sort("createdAt", -1).to_list(1000)
    return [ContactMessage(**msg) for msg in messages]

@router.put("/contact/messages/{message_id}/read")
async def mark_message_read(message_id: str, token: dict = Depends(verify_token)):
    """Mark a message as read (requires authentication)"""
    contact_collection = get_contact_collection()
    result = await contact_collection.update_one(
        {"id": message_id},
        {"$set": {"read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message marked as read"}

@router.delete("/contact/messages/{message_id}")
async def delete_message(message_id: str, token: dict = Depends(verify_token)):
    """Delete a contact message (requires authentication)"""
    contact_collection = get_contact_collection()
    result = await contact_collection.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted successfully"}

@router.get("/contact/unread-count")
async def get_unread_count(token: dict = Depends(verify_token)):
    """Get count of unread messages (requires authentication)"""
    contact_collection = get_contact_collection()
    count = await contact_collection.count_documents({"read": False})
    return {"unreadCount": count}
