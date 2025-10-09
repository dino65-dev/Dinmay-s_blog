from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Import routes
from routes import blog_posts, auth, about, comments, github, upload

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
# Ensure environment variables are loaded
load_dotenv('/app/backend/.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Add your routes to the router instead of directly to app
# Health check endpoint - supports both GET and HEAD requests
@api_router.get("/")
@api_router.head("/")
async def root():
    return {"message": "Dinmay's Blog API"}

# Dedicated health check endpoint for monitoring services
@api_router.get("/health")
@api_router.head("/health")
async def health_check():
    return {"status": "ok", "message": "Backend is healthy"}

# Include all route modules
api_router.include_router(blog_posts.router, tags=["blog"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(about.router, tags=["about"])
api_router.include_router(comments.router, tags=["comments"])
api_router.include_router(github.router, tags=["github"])
api_router.include_router(upload.router, tags=["upload"])

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
