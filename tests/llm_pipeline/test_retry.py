import pytest
from unittest.mock import AsyncMock

from app.services.llm.client import (
    LLMRateLimitError,
    LLMServerError,
    LLMAuthenticationError,
)
from app.services.llm.retry import create_llm_retry, with_llm_retry


@pytest.mark.asyncio
async def test_retry_succeeds_on_second_attempt():
    mock_func = AsyncMock(side_effect=[
        LLMRateLimitError("Rate limit"),
        "Success result"
    ])

    test_retry = create_llm_retry(max_attempts=3, min_wait=0.01, max_wait=0.05)
    decorated = test_retry(mock_func)

    result = await decorated()
    assert result == "Success result"
    assert mock_func.call_count == 2


@pytest.mark.asyncio
async def test_retry_exceeds_max_attempts():
    mock_func = AsyncMock(side_effect=LLMServerError("Server down"))

    test_retry = create_llm_retry(max_attempts=3, min_wait=0.01, max_wait=0.05)
    decorated = test_retry(mock_func)

    with pytest.raises(LLMServerError):
        await decorated()

    assert mock_func.call_count == 3


@pytest.mark.asyncio
async def test_no_retry_on_auth_error():
    mock_func = AsyncMock(side_effect=LLMAuthenticationError("Bad token"))

    test_retry = create_llm_retry(max_attempts=5, min_wait=0.01, max_wait=0.05)
    decorated = test_retry(mock_func)

    with pytest.raises(LLMAuthenticationError):
        await decorated()

    assert mock_func.call_count == 1
