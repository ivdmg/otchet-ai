import functools
import httpx
from typing import Callable, Any, TypeVar, ParamSpec
from tenacity import (
    AsyncRetrying,
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
    before_sleep_log,
)
import logging

from app.services.llm.client import LLMRateLimitError, LLMServerError, LLMAPIError

logger = logging.getLogger(__name__)

RETRYABLE_EXCEPTIONS = (
    LLMRateLimitError,
    LLMServerError,
    httpx.RequestError,
)

P = ParamSpec("P")
T = TypeVar("T")


def create_llm_retry(
    max_attempts: int = 5,
    min_wait: float = 1.0,
    max_wait: float = 10.0,
    multiplier: float = 1.0,
) -> Callable[[Callable[P, Any]], Callable[P, Any]]:
    """
    Creates a tenacity async retry decorator configured for LLM requests with exponential backoff.
    
    Default behavior:
    - Retries up to 5 times.
    - Retries on 429 (Rate Limit), 503/5xx (Server Error), and httpx.RequestError (Network issues).
    - Exponential backoff (1s, 2s, 4s, 8s, up to 10s max).
    - Fails fast on authentication errors (401/403) or 400 Bad Request.
    """
    def decorator(fn: Callable[P, Any]) -> Callable[P, Any]:
        @functools.wraps(fn)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> Any:
            async for attempt in AsyncRetrying(
                stop=stop_after_attempt(max_attempts),
                wait=wait_exponential(min=min_wait, max=max_wait, multiplier=multiplier),
                retry=retry_if_exception_type(RETRYABLE_EXCEPTIONS),
                reraise=True,
            ):
                with attempt:
                    return await fn(*args, **kwargs)
        return wrapper
    return decorator


# Pre-configured default retry decorator for general use
with_llm_retry = create_llm_retry(max_attempts=5, min_wait=1.0, max_wait=10.0)
