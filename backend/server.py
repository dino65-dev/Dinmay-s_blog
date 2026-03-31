from fastapi import FastAPI, APIRouter, Request, Response
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.cors import CORSMiddleware
from utils.proxy_client import is_proxy_enabled
from utils import proxy_client
import os
import logging
import time

# Always import DB/Redis for safety fallback
from database import client, db, ensure_indexes
from utils import redis_cache

# Import routes
from routes import blog_posts, auth, about, comments, github, upload, contact, site_settings

# Create the main app with optimized settings
app = FastAPI(
    title="Dinmay's Blog API",
    description="Optimized blog API with Cloudinary image storage and smart caching proxy",
    version="4.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Add GZip compression middleware for faster responses
app.add_middleware(GZipMiddleware, minimum_size=500)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {
        "message": "Dinmay's Blog API",
        "version": "4.0.0",
        "mode": "proxy" if is_proxy_enabled() else "direct",
        "proxy_url": os.environ.get('VPS_PROXY_URL', 'not set'),
    }

@api_router.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        if is_proxy_enabled():
            # Check proxy health
            result = await proxy_client.proxy_get("/health")
            return {
                "status": "healthy",
                "mode": "proxy",
                "proxy": result,
            }
        else:
            await db.command('ping')
            redis_status = "disabled"
            try:
                r = await redis_cache._get_redis()
                if r is not None:
                    await r.ping()
                    redis_status = "connected"
            except Exception:
                redis_status = "unavailable"
            return {
                "status": "healthy",
                "mode": "direct",
                "database": "connected",
                "redis": redis_status,
                "cloudinary": bool(os.environ.get('CLOUDINARY_CLOUD_NAME'))
            }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# Include all route modules
api_router.include_router(blog_posts.router, tags=["blog"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(about.router, tags=["about"])
api_router.include_router(comments.router, tags=["comments"])
api_router.include_router(github.router, tags=["github"])
api_router.include_router(upload.router, tags=["upload"])
api_router.include_router(contact.router, tags=["contact"])
api_router.include_router(site_settings.router, tags=["settings"])

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request timing middleware — logs slow requests
@app.middleware("http")
async def add_timing(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000

    if elapsed_ms > 200 and request.method == "GET":
        logger.warning(f"SLOW {request.method} {request.url.path} → {elapsed_ms:.0f}ms")

    response.headers["X-Response-Time"] = f"{elapsed_ms:.0f}ms"
    return response

# Add caching headers middleware
@app.middleware("http")
async def add_cache_headers(request: Request, call_next):
    response = await call_next(request)
    if request.method == "GET":
        path = request.url.path
        if "/uploads/" in path:
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        elif path == "/api/posts":
            response.headers["Cache-Control"] = "public, max-age=60"
        elif "/api/posts/" in path:
            response.headers["Cache-Control"] = "public, max-age=300"
        elif path == "/api/about":
            response.headers["Cache-Control"] = "public, max-age=600"
    return response

# Configure logging (minimal for low RAM)
logging.basicConfig(
    level=logging.WARNING,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    mode = "PROXY (with Direct DB fallback)" if is_proxy_enabled() else "DIRECT DB"
    logger.warning(f"Starting in {mode} mode")
    # Always init DB/Redis for fallback
    await redis_cache._get_redis()
    await ensure_indexes()

@app.on_event("shutdown")
async def shutdown():
    if is_proxy_enabled():
        await proxy_client.close()
    await redis_cache.close()
    client.close()
