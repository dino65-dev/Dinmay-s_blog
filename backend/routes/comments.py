from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.comment import Comment, CommentCreate
from utils.auth import verify_token
from utils.proxy_client import is_proxy_enabled, proxy_get, proxy_post, proxy_delete, ProxyFallback
import logging

from utils.redis_cache import get_cached, set_cached, invalidate
from database import db

logger = logging.getLogger(__name__)
router = APIRouter()
comments_collection = db.comments

@router.get("/posts/{post_id}/comments", response_model=List[Comment])
async def get_comments_for_post(post_id: str):
    if is_proxy_enabled():
        try:
            result = await proxy_get(f"/posts/{post_id}/comments")
            return result or []
        except ProxyFallback:
            logger.warning(f"[FALLBACK] VPS Proxy unreachable for GET comments on {post_id}")

    cached = await get_cached(f"comments:{post_id}")
    if cached is not None:
        return cached
    comments = await comments_collection.find({"post_id": post_id}).sort("created_at", 1).to_list(1000)
    result = [Comment(**comment).dict() for comment in comments]
    await set_cached(f"comments:{post_id}", result, ttl=120)
    return result

@router.post("/posts/{post_id}/comments", response_model=Comment)
async def create_comment(post_id: str, comment: CommentCreate):
    if comment.post_id != post_id:
        raise HTTPException(status_code=400, detail="Post ID mismatch")
        
    if is_proxy_enabled():
        try:
            comment_obj = Comment(**comment.dict())
            return await proxy_post(f"/posts/{post_id}/comments", comment_obj.dict())
        except ProxyFallback:
            logger.warning(f"[FALLBACK] VPS Proxy unreachable for POST comment on {post_id}")

    if comment.parent_id:
        parent_comment = await comments_collection.find_one({"id": comment.parent_id})
        if not parent_comment:
            raise HTTPException(status_code=404, detail="Parent comment not found")
            
    comment_obj = Comment(**comment.dict())
    await comments_collection.insert_one(comment_obj.dict())
    await invalidate(f"comments:{post_id}")
    return comment_obj

@router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str, token: dict = Depends(verify_token)):
    if is_proxy_enabled():
        try:
            return await proxy_delete(f"/comments/{comment_id}")
        except ProxyFallback:
            logger.warning(f"[FALLBACK] VPS Proxy unreachable for DELETE comment {comment_id}")

    comment_doc = await comments_collection.find_one({"id": comment_id})
    if not comment_doc:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    post_id = comment_doc.get("post_id")
    await comments_collection.delete_one({"id": comment_id})
    await comments_collection.delete_many({"parent_id": comment_id})
    if post_id:
        await invalidate(f"comments:{post_id}")
    return {"message": "Comment and replies deleted successfully"}
