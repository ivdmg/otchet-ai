from typing import Optional
import redis
import redis.asyncio as aioredis
from app.core.config import settings


def get_redis_client() -> redis.Redis:
    """Returns a synchronous Redis client."""
    return redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)


def get_async_redis_client() -> aioredis.Redis:
    """Returns an asynchronous Redis client."""
    return aioredis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
