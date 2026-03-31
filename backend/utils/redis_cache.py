"""
Async Redis cache utility with graceful fallback.
If Redis is unavailable, all functions are no-ops — the app works without caching.
Supports passwords with special characters (like @).
Retries Redis connection periodically if it goes down.
"""
import json
import os
import logging
import time
from typing import Optional, Any

logger = logging.getLogger(__name__)

# Redis client (initialized lazily)
_redis = None
_redis_available = None  # None = unknown, True/False after first check
_last_retry_time = 0
_RETRY_INTERVAL = 30  # Retry Redis connection every 30 seconds if it's down

# Stats for logging
_hits = 0
_misses = 0


def _parse_redis_url(url: str) -> dict:
    """Parse Redis URL, handling passwords with special chars like @."""
    if url.startswith("redis://"):
        url_body = url[len("redis://"):]
        ssl = False
    elif url.startswith("rediss://"):
        url_body = url[len("rediss://"):]
        ssl = True
    else:
        url_body = url
        ssl = False

    # Split on the LAST @ to separate auth from host
    if "@" in url_body:
        last_at = url_body.rfind("@")
        auth_part = url_body[:last_at]
        host_part = url_body[last_at + 1:]
    else:
        auth_part = ""
        host_part = url_body

    # Parse password from auth_part
    password = None
    if auth_part:
        if auth_part.startswith(":"):
            password = auth_part[1:]
        elif ":" in auth_part:
            password = auth_part.split(":", 1)[1]
        else:
            password = auth_part

    # Parse host:port
    if ":" in host_part:
        host, port_str = host_part.rsplit(":", 1)
        try:
            port = int(port_str)
        except ValueError:
            host = host_part
            port = 6379
    else:
        host = host_part
        port = 6379

    return {"host": host, "port": port, "password": password, "ssl": ssl}


async def _get_redis():
    """Get or create async Redis connection with pooling and auto-reconnect."""
    global _redis, _redis_available, _last_retry_time

    if _redis_available is False:
        # Periodically retry if Redis was previously unavailable
        now = time.time()
        if now - _last_retry_time < _RETRY_INTERVAL:
            return None
        _last_retry_time = now
        _redis_available = None  # Reset to try again
        logger.warning("Retrying Redis connection...")

    if _redis is not None:
        return _redis

    redis_url = os.environ.get('REDIS_URL')
    if not redis_url:
        logger.info("REDIS_URL not set — caching disabled")
        _redis_available = False
        return None

    try:
        import redis.asyncio as aioredis

        params = _parse_redis_url(redis_url)
        _redis = aioredis.Redis(
            host=params["host"],
            port=params["port"],
            password=params["password"],
            ssl=params["ssl"],
            max_connections=10,
            decode_responses=True,
            socket_connect_timeout=3,
            socket_timeout=2,
            retry_on_timeout=True,
        )
        await _redis.ping()
        _redis_available = True
        logger.warning(f"Redis connected to {params['host']}:{params['port']} ✅")
        return _redis
    except Exception as e:
        logger.warning(f"Redis unavailable ({e}), caching disabled — app continues without cache")
        _redis_available = False
        _last_retry_time = time.time()
        _redis = None
        return None


async def get_cached(key: str) -> Optional[Any]:
    """Get cached value. Returns None on miss or if Redis is down."""
    global _hits, _misses
    try:
        r = await _get_redis()
        if r is None:
            return None
        val = await r.get(key)
        if val is not None:
            _hits += 1
            return json.loads(val)
        _misses += 1
    except Exception as e:
        logger.warning(f"Cache get error for {key}: {e}")
        # Connection might be dead — reset for retry
        await _handle_connection_error()
    return None


async def set_cached(key: str, value: Any, ttl: int = 300):
    """Store value in cache with TTL (seconds). No-op if Redis is down."""
    try:
        r = await _get_redis()
        if r is None:
            return
        serialized = json.dumps(value, default=str)
        await r.setex(key, ttl, serialized)
    except Exception as e:
        logger.warning(f"Cache set error for {key}: {e}")
        await _handle_connection_error()


async def invalidate(*keys: str):
    """Delete specific cache keys. No-op if Redis is down."""
    try:
        r = await _get_redis()
        if r is None:
            return
        if keys:
            await r.delete(*keys)
    except Exception as e:
        logger.warning(f"Cache invalidate error: {e}")
        await _handle_connection_error()


async def invalidate_pattern(pattern: str):
    """Delete all keys matching a glob pattern."""
    try:
        r = await _get_redis()
        if r is None:
            return
        cursor = 0
        while True:
            cursor, keys = await r.scan(cursor=cursor, match=pattern, count=100)
            if keys:
                await r.delete(*keys)
            if cursor == 0:
                break
    except Exception as e:
        logger.warning(f"Cache invalidate_pattern error for {pattern}: {e}")
        await _handle_connection_error()


async def _handle_connection_error():
    """Reset Redis client on connection errors so it retries."""
    global _redis, _redis_available, _last_retry_time
    if _redis is not None:
        try:
            await _redis.close()
        except Exception:
            pass
    _redis = None
    _redis_available = False
    _last_retry_time = time.time()
    logger.warning("Redis connection lost — will retry in 30s")


def get_stats() -> dict:
    """Get cache hit/miss stats."""
    total = _hits + _misses
    hit_rate = (_hits / total * 100) if total > 0 else 0
    return {"hits": _hits, "misses": _misses, "hit_rate": f"{hit_rate:.0f}%"}


async def close():
    """Close Redis connection pool."""
    global _redis, _redis_available
    if _redis is not None:
        try:
            await _redis.close()
        except Exception:
            pass
        _redis = None
        _redis_available = None
