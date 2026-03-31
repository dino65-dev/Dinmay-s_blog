"""
Async HTTP client for the VPS proxy.
All DB reads/writes go through the proxy which owns Redis + MongoDB connections.
If VPS_PROXY_URL is not set, falls back to direct DB access.
"""
from dotenv import load_dotenv
from pathlib import Path
import os
import httpx
import logging

# Load .env FIRST so VPS_PROXY_URL is available at import time
load_dotenv(Path(__file__).parent.parent / '.env')

logger = logging.getLogger(__name__)

PROXY_URL = os.environ.get('VPS_PROXY_URL', '').rstrip('/')
API_SECRET = os.environ.get('SECRET_KEY', '')

# Persistent async client with connection pooling
_client = None


def is_proxy_enabled() -> bool:
    """Check if VPS proxy mode is enabled."""
    return bool(PROXY_URL)


class ProxyFallback(Exception):
    """Raised when the proxy is unreachable or returns 5xx. Direct DB fallback should be triggered."""
    pass

async def _get_client() -> httpx.AsyncClient:
    """Get or create the persistent HTTP client."""
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            base_url=PROXY_URL,
            timeout=httpx.Timeout(5.0, connect=3.0), # Aggressive timeout so fallback is fast
            headers={'X-Api-Secret': API_SECRET},
            limits=httpx.Limits(max_connections=10, max_keepalive_connections=5),
        )
    return _client

async def proxy_get(path: str, params: dict = None):
    """GET request to proxy. Returns parsed JSON or None on 404."""
    client = await _get_client()
    try:
        resp = await client.get(path, params=params)
        if resp.status_code == 404:
            return None
        if resp.status_code >= 500:
            raise ProxyFallback()
        resp.raise_for_status()
        return resp.json()
    except httpx.RequestError:
        raise ProxyFallback()

async def proxy_post(path: str, data: dict):
    client = await _get_client()
    try:
        resp = await client.post(path, json=data)
        if resp.status_code >= 500:
            raise ProxyFallback()
        resp.raise_for_status()
        return resp.json()
    except httpx.RequestError:
        raise ProxyFallback()

async def proxy_put(path: str, data: dict):
    client = await _get_client()
    try:
        resp = await client.put(path, json=data)
        if resp.status_code == 404:
            return None
        if resp.status_code >= 500:
            raise ProxyFallback()
        resp.raise_for_status()
        return resp.json()
    except httpx.RequestError:
        raise ProxyFallback()

async def proxy_delete(path: str):
    client = await _get_client()
    try:
        resp = await client.delete(path)
        if resp.status_code >= 500:
            raise ProxyFallback()
        resp.raise_for_status()
        return resp.json()
    except httpx.RequestError:
        raise ProxyFallback()


async def close():
    """Close the HTTP client."""
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None
