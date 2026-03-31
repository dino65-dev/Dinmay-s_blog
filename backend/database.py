"""
Shared database connection module.
Single AsyncIOMotorClient instance reused across all routes.
Optimized for Cosmos DB MongoDB API with low-RAM VPS.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import logging

logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']

client = AsyncIOMotorClient(
    mongo_url,
    maxPoolSize=5,         # Keep pool small for 1GB RAM
    minPoolSize=2,         # Keep 2 connections warm for fast first-query
    maxIdleTimeMS=45000,   # Close idle connections after 45s
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
    socketTimeoutMS=15000,
    retryWrites=True,
    retryReads=True,
    compressors="zstd,zlib",  # Compress data over the wire — big speed boost
    w=1,                      # Don't wait for replication ack (faster writes)
)

db = client[os.environ['DB_NAME']]


async def ensure_indexes():
    """Create indexes for fast queries. Safe to call multiple times (idempotent)."""
    try:
        # Blog posts — most queried collection
        await db.blog_posts.create_index("slug", unique=True)
        await db.blog_posts.create_index([("publishedDate", -1)])
        await db.blog_posts.create_index("id")
        await db.blog_posts.create_index("tags")

        # Comments — queried by post_id
        await db.comments.create_index("post_id")
        await db.comments.create_index("id")
        await db.comments.create_index([("created_at", 1)])

        # Contact messages
        await db.contact_messages.create_index([("createdAt", -1)])
        await db.contact_messages.create_index("id")
        await db.contact_messages.create_index("read")

        logger.warning("MongoDB indexes ensured ✅")
    except Exception as e:
        # Cosmos DB may not support all index operations — that's OK
        logger.warning(f"Index creation (some may already exist): {e}")
