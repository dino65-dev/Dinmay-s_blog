from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from models.blog_post import BlogPost, BlogPostCreate, BlogPostUpdate
from utils.auth import verify_token
from datetime import datetime

router = APIRouter()

def get_posts_collection():
    from motor.motor_asyncio import AsyncIOMotorClient
    import os
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    return db.blog_posts

@router.get("/posts", response_model=List[BlogPost])
async def get_all_posts():
    """Get all blog posts, sorted by published date (newest first)"""
    posts_collection = get_posts_collection()
    posts = await posts_collection.find().sort("publishedDate", -1).to_list(1000)
    return [BlogPost(**post) for post in posts]

@router.get("/search/posts", response_model=List[BlogPost])
async def search_posts(
    q: Optional[str] = Query(None, description="Search query for title and content"),
    content_type: Optional[str] = Query(None, description="Filter by content type (markdown/html)"),
    start_date: Optional[str] = Query(None, description="Filter posts from this date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filter posts until this date (YYYY-MM-DD)"),
    sort_by: Optional[str] = Query("date", description="Sort by: date, title"),
    order: Optional[str] = Query("desc", description="Sort order: asc, desc")
):
    """Advanced search for blog posts"""
    posts_collection = get_posts_collection()
    
    # Build query filter
    query_filter = {}
    
    # Text search in title and content
    if q:
        query_filter["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"content": {"$regex": q, "$options": "i"}},
            {"excerpt": {"$regex": q, "$options": "i"}}
        ]
    
    # Filter by content type
    if content_type and content_type in ["markdown", "html"]:
        query_filter["contentType"] = content_type
    
    # Date range filter
    date_filter = {}
    if start_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            date_filter["$gte"] = start
        except ValueError:
            pass
    
    if end_date:
        try:
            end = datetime.strptime(end_date, "%Y-%m-%d")
            end = end.replace(hour=23, minute=59, second=59)
            date_filter["$lte"] = end
        except ValueError:
            pass
    
    if date_filter:
        query_filter["publishedDate"] = date_filter
    
    # Determine sort field and order
    sort_field = "publishedDate" if sort_by == "date" else "title"
    sort_order = -1 if order == "desc" else 1
    
    # Execute query
    posts = await posts_collection.find(query_filter).sort(sort_field, sort_order).to_list(1000)
    return [BlogPost(**post) for post in posts]

@router.get("/posts/{slug}")
async def get_post_by_slug(slug: str):
    """Get a single blog post by slug"""
    posts_collection = get_posts_collection()
    post = await posts_collection.find_one({"slug": slug})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return BlogPost(**post)

@router.post("/posts", response_model=BlogPost)
async def create_post(post: BlogPostCreate, token: dict = Depends(verify_token)):
    """Create a new blog post (requires authentication)"""
    posts_collection = get_posts_collection()
    # Check if slug already exists
    existing = await posts_collection.find_one({"slug": post.slug})
    if existing:
        raise HTTPException(status_code=400, detail="A post with this slug already exists")
    
    post_obj = BlogPost(**post.dict())
    await posts_collection.insert_one(post_obj.dict())
    return post_obj

@router.put("/posts/{post_id}", response_model=BlogPost)
async def update_post(post_id: str, post_update: BlogPostUpdate, token: dict = Depends(verify_token)):
    """Update a blog post (requires authentication)"""
    posts_collection = get_posts_collection()
    existing_post = await posts_collection.find_one({"id": post_id})
    if not existing_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    update_data = {k: v for k, v in post_update.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    await posts_collection.update_one({"id": post_id}, {"$set": update_data})
    updated_post = await posts_collection.find_one({"id": post_id})
    return BlogPost(**updated_post)

@router.delete("/posts/{post_id}")
async def delete_post(post_id: str, token: dict = Depends(verify_token)):
    """Delete a blog post (requires authentication)"""
    posts_collection = get_posts_collection()
    result = await posts_collection.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted successfully"}
