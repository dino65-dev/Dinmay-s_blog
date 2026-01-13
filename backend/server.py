from fastapi import FastAPI, APIRouter, Request, Response
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
import time

# Import routes
from routes import blog_posts, auth, about, comments, github, upload, contact, site_settings

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
# Ensure environment variables are loaded
load_dotenv('/app/backend/.env')

# MongoDB connection with optimized settings for low RAM
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(
    mongo_url,
    maxPoolSize=5,  # Reduced pool size for 500MB RAM
    minPoolSize=1,
    maxIdleTimeMS=30000,  # Close idle connections after 30s
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
    socketTimeoutMS=10000
)
db = client[os.environ['DB_NAME']]

# Create the main app with optimized settings
app = FastAPI(
    title="Dinmay's Blog API",
    description="Optimized blog API with Cloudinary image storage",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Add GZip compression middleware for faster responses
app.add_middleware(GZipMiddleware, minimum_size=500)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Simple in-memory cache for frequently accessed data
_cache = {}
_cache_ttl = {}
CACHE_DURATION = 60  # 60 seconds cache

def get_cached(key: str):
    """Get cached value if not expired"""
    if key in _cache and key in _cache_ttl:
        if time.time() < _cache_ttl[key]:
            return _cache[key]
        else:
            del _cache[key]
            del _cache_ttl[key]
    return None

def set_cached(key: str, value, ttl: int = CACHE_DURATION):
    """Set cache with TTL"""
    _cache[key] = value
    _cache_ttl[key] = time.time() + ttl

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Dinmay's Blog API", "version": "2.0.0", "optimized": True}

@api_router.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Quick MongoDB ping
        await db.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
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

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add caching headers middleware
@app.middleware("http")
async def add_cache_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Add cache headers for GET requests to specific endpoints
    if request.method == "GET":
        path = request.url.path
        
        # Cache static assets and images for 1 year
        if "/uploads/" in path:
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        # Cache blog posts list for 60 seconds
        elif path == "/api/posts":
            response.headers["Cache-Control"] = "public, max-age=60"
        # Cache individual posts for 5 minutes
        elif "/api/posts/" in path:
            response.headers["Cache-Control"] = "public, max-age=300"
        # Cache about page for 10 minutes
        elif path == "/api/about":
            response.headers["Cache-Control"] = "public, max-age=600"
    
    return response

# Configure logging (minimal for low RAM)
logging.basicConfig(
    level=logging.WARNING,  # Only warnings and errors to reduce memory
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
