from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from models.blog_post import BlogPost, BlogPostCreate, BlogPostUpdate
from utils.auth import verify_token
from utils.proxy_client import is_proxy_enabled, proxy_get, proxy_post, proxy_put, proxy_delete, ProxyFallback
from datetime import datetime
import logging

from utils.redis_cache import get_cached, set_cached, invalidate
from database import db

logger = logging.getLogger(__name__)
router = APIRouter()
posts_collection = db.blog_posts

@router.get("/posts")
async def get_all_posts():
    if is_proxy_enabled():
        try:
            return await proxy_get("/posts")
        except ProxyFallback:
            logger.warning("[FALLBACK] VPS Proxy unreachable for GET /posts, using direct DB")

    cached = await get_cached("posts:all")
    if cached is not None:
        return cached
    projection = {"content": 0, "_id": 0}
    posts = await posts_collection.find({}, projection).sort("publishedDate", -1).to_list(1000)
    await set_cached("posts:all", posts, ttl=60)
    return posts

@router.get("/search/posts")
async def search_posts(
    q: Optional[str] = Query(None),
    content_type: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("date"),
    order: Optional[str] = Query("desc"),
):
    if is_proxy_enabled():
        try:
            params = {k: v for k, v in {
                "q": q, "content_type": content_type, "tag": tag,
                "start_date": start_date, "end_date": end_date,
                "sort_by": sort_by, "order": order,
            }.items() if v is not None}
            return await proxy_get("/search/posts", params=params)
        except ProxyFallback:
            logger.warning("[FALLBACK] VPS Proxy unreachable for GET /search/posts")

    query_filter = {}
    if q:
        query_filter["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"content": {"$regex": q, "$options": "i"}},
            {"excerpt": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}},
        ]
    if content_type and content_type in ["markdown", "html"]:
        query_filter["contentType"] = content_type
    if tag:
        query_filter["tags"] = {"$regex": tag, "$options": "i"}
    date_filter = {}
    if start_date:
        try:
            date_filter["$gte"] = datetime.strptime(start_date, "%Y-%m-%d")
        except ValueError:
            pass
    if end_date:
        try:
            end = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
            date_filter["$lte"] = end
        except ValueError:
            pass
    if date_filter:
        query_filter["publishedDate"] = date_filter
    sort_field = "publishedDate" if sort_by == "date" else "title"
    sort_order = -1 if order == "desc" else 1
    posts = await posts_collection.find(query_filter).sort(sort_field, sort_order).to_list(1000)
    return [BlogPost(**post).dict() for post in posts]

@router.get("/tags", response_model=List[str])
async def get_all_tags():
    if is_proxy_enabled():
        try:
            return await proxy_get("/tags")
        except ProxyFallback:
            logger.warning("[FALLBACK] VPS Proxy unreachable for GET /tags")

    cached = await get_cached("tags:all")
    if cached is not None:
        return cached
    posts = await posts_collection.find({}, {"tags": 1}).to_list(1000)
    all_tags = set()
    for post in posts:
        if post.get("tags"):
            all_tags.update(post["tags"])
    result = sorted(list(all_tags))
    await set_cached("tags:all", result, ttl=300)
    return result

@router.get("/posts/{slug}")
async def get_post_by_slug(slug: str):
    if is_proxy_enabled():
        try:
            result = await proxy_get(f"/posts/{slug}")
            if result is None:
                raise HTTPException(status_code=404, detail="Post not found")
            return result
        except ProxyFallback:
            logger.warning(f"[FALLBACK] VPS Proxy unreachable for GET /posts/{slug}")

    cached = await get_cached(f"posts:slug:{slug}")
    if cached is not None:
        return cached
    post = await posts_collection.find_one({"slug": slug})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    result = BlogPost(**post).dict()
    await set_cached(f"posts:slug:{slug}", result, ttl=300)
    return result

@router.post("/posts", response_model=BlogPost)
async def create_post(post: BlogPostCreate, token: dict = Depends(verify_token)):
    if is_proxy_enabled():
        try:
            post_obj = BlogPost(**post.dict())
            return await proxy_post("/posts", post_obj.dict())
        except Exception as e:
            if "400" in str(e):
                raise HTTPException(status_code=400, detail="A post with this slug already exists")
            elif isinstance(e, ProxyFallback):
                logger.warning("[FALLBACK] VPS Proxy unreachable for POST /posts")
            else:
                raise

    existing = await posts_collection.find_one({"slug": post.slug})
    if existing:
        raise HTTPException(status_code=400, detail="A post with this slug already exists")
    post_obj = BlogPost(**post.dict())
    await posts_collection.insert_one(post_obj.dict())
    await invalidate("posts:all", "tags:all")
    return post_obj

@router.put("/posts/{post_id}", response_model=BlogPost)
async def update_post(post_id: str, post_update: BlogPostUpdate, token: dict = Depends(verify_token)):
    if is_proxy_enabled():
        try:
            update_data = {k: v for k, v in post_update.dict().items() if v is not None}
            result = await proxy_put(f"/posts/{post_id}", update_data)
            if result is None:
                raise HTTPException(status_code=404, detail="Post not found")
            return result
        except ProxyFallback:
            logger.warning(f"[FALLBACK] VPS Proxy unreachable for PUT /posts/{post_id}")

    existing_post = await posts_collection.find_one({"id": post_id})
    if not existing_post:
        raise HTTPException(status_code=404, detail="Post not found")
    update_data = {k: v for k, v in post_update.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    await posts_collection.update_one({"id": post_id}, {"$set": update_data})
    updated_post = await posts_collection.find_one({"id": post_id})
    slug = existing_post.get("slug", "")
    await invalidate("posts:all", "tags:all", f"posts:slug:{slug}")
    if post_update.slug and post_update.slug != slug:
        await invalidate(f"posts:slug:{post_update.slug}")
    return BlogPost(**updated_post)

@router.delete("/posts/{post_id}")
async def delete_post(post_id: str, token: dict = Depends(verify_token)):
    if is_proxy_enabled():
        try:
            result = await proxy_delete(f"/posts/{post_id}")
            if result is None:
                raise HTTPException(status_code=404, detail="Post not found")
            return result
        except ProxyFallback:
            logger.warning(f"[FALLBACK] VPS Proxy unreachable for DELETE /posts/{post_id}")

    existing_post = await posts_collection.find_one({"id": post_id})
    if not existing_post:
        raise HTTPException(status_code=404, detail="Post not found")
    slug = existing_post.get("slug", "")
    result = await posts_collection.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    await invalidate("posts:all", "tags:all", f"posts:slug:{slug}")
    await invalidate(f"comments:{post_id}")
    return {"message": "Post deleted successfully"}
