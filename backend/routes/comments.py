from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.comment import Comment, CommentCreate
from utils.auth import verify_token

router = APIRouter()

def get_comments_collection():
    from motor.motor_asyncio import AsyncIOMotorClient
    import os
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    return db.comments

@router.get("/posts/{post_id}/comments", response_model=List[Comment])
async def get_comments_for_post(post_id: str):
    """Get all comments for a specific blog post"""
    comments_collection = get_comments_collection()
    comments = await comments_collection.find({"post_id": post_id}).sort("created_at", 1).to_list(1000)
    return [Comment(**comment) for comment in comments]

@router.post("/posts/{post_id}/comments", response_model=Comment)
async def create_comment(post_id: str, comment: CommentCreate):
    """Create a new comment (no authentication required)"""
    comments_collection = get_comments_collection()
    
    # Validate that post_id matches
    if comment.post_id != post_id:
        raise HTTPException(status_code=400, detail="Post ID mismatch")
    
    # If parent_id is provided, verify it exists
    if comment.parent_id:
        parent_comment = await comments_collection.find_one({"id": comment.parent_id})
        if not parent_comment:
            raise HTTPException(status_code=404, detail="Parent comment not found")
    
    comment_obj = Comment(**comment.dict())
    await comments_collection.insert_one(comment_obj.dict())
    return comment_obj

@router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str, token: dict = Depends(verify_token)):
    """Delete a comment (requires authentication)"""
    comments_collection = get_comments_collection()
    
    # Delete the comment and all its replies
    result = await comments_collection.delete_one({"id": comment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Also delete all replies to this comment
    await comments_collection.delete_many({"parent_id": comment_id})
    
    return {"message": "Comment and replies deleted successfully"}
