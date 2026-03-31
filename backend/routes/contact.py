from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.contact import ContactMessage, ContactMessageCreate
from utils.auth import verify_token
from utils.proxy_client import is_proxy_enabled, proxy_get, proxy_post, proxy_put, proxy_delete, ProxyFallback
import logging

from database import db

logger = logging.getLogger(__name__)
router = APIRouter()
contact_collection = db.contact_messages

@router.post("/contact", response_model=ContactMessage)
async def create_contact_message(message: ContactMessageCreate):
    if is_proxy_enabled():
        try:
            message_obj = ContactMessage(**message.dict())
            return await proxy_post("/contact", message_obj.dict())
        except ProxyFallback:
            logger.warning("[FALLBACK] VPS Proxy unreachable for POST /contact")

    message_obj = ContactMessage(**message.dict())
    await contact_collection.insert_one(message_obj.dict())
    return message_obj

@router.get("/contact/messages", response_model=List[ContactMessage])
async def get_all_messages(token: dict = Depends(verify_token)):
    if is_proxy_enabled():
        try:
            return await proxy_get("/contact/messages")
        except ProxyFallback:
            logger.warning("[FALLBACK] VPS Proxy unreachable for GET /contact/messages")

    messages = await contact_collection.find().sort("createdAt", -1).to_list(1000)
    return [ContactMessage(**msg) for msg in messages]

@router.put("/contact/messages/{message_id}/read")
async def mark_message_read(message_id: str, token: dict = Depends(verify_token)):
    if is_proxy_enabled():
        try:
            return await proxy_put(f"/contact/messages/{message_id}/read", {})
        except ProxyFallback:
            logger.warning(f"[FALLBACK] VPS Proxy unreachable for PUT /contact/messages/{message_id}/read")

    result = await contact_collection.update_one({"id": message_id}, {"$set": {"read": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message marked as read"}

@router.delete("/contact/messages/{message_id}")
async def delete_message(message_id: str, token: dict = Depends(verify_token)):
    if is_proxy_enabled():
        try:
            return await proxy_delete(f"/contact/messages/{message_id}")
        except ProxyFallback:
            logger.warning(f"[FALLBACK] VPS Proxy unreachable for DELETE /contact/messages/{message_id}")

    result = await contact_collection.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted successfully"}

@router.get("/contact/unread-count")
async def get_unread_count(token: dict = Depends(verify_token)):
    if is_proxy_enabled():
        try:
            return await proxy_get("/contact/unread-count")
        except ProxyFallback:
            logger.warning("[FALLBACK] VPS Proxy unreachable for GET /contact/unread-count")

    count = await contact_collection.count_documents({"read": False})
    return {"unreadCount": count}
