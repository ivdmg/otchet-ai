import pytest
import httpx
from unittest.mock import patch, AsyncMock

from app.services.llm.client import (
    LLMClient,
    LLMAuthenticationError,
    LLMRateLimitError,
    LLMServerError,
    LLMAPIError,
)


@pytest.mark.asyncio
async def test_llm_client_provider_urls():
    client_deepseek = LLMClient(provider="deepseek")
    assert client_deepseek.base_url == "https://api.deepseek.com/v1"

    client_openai = LLMClient(provider="openai")
    assert client_openai.base_url == "https://api.openai.com/v1"

    client_openrouter = LLMClient(provider="openrouter")
    assert client_openrouter.base_url == "https://openrouter.ai/api/v1"

    client_custom = LLMClient(base_url="https://custom.llm.com/v1/")
    assert client_custom.base_url == "https://custom.llm.com/v1"


@pytest.mark.asyncio
async def test_llm_client_headers():
    client_openai = LLMClient(provider="openai", api_key="secret-key")
    headers = client_openai._get_headers()
    assert headers["Authorization"] == "Bearer secret-key"
    assert "HTTP-Referer" not in headers

    client_openrouter = LLMClient(provider="openrouter", api_key="or-key")
    or_headers = client_openrouter._get_headers()
    assert or_headers["Authorization"] == "Bearer or-key"
    assert or_headers["HTTP-Referer"] == "https://aigostdoc.ru"
    assert or_headers["X-Title"] == "AI GostDoc"


@pytest.mark.asyncio
async def test_llm_client_generate_success():
    mock_response = {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": "{\"status\": \"ok\"}"
                }
            }
        ]
    }

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url == "https://api.deepseek.com/v1/chat/completions"
        assert request.headers["Authorization"] == "Bearer mock-key"
        return httpx.Response(200, json=mock_response)

    transport = httpx.MockTransport(handler)

    client = LLMClient(provider="deepseek", api_key="mock-key")
    with patch("httpx.AsyncClient", return_value=httpx.AsyncClient(transport=transport)):
        res = await client.generate(
            messages=[{"role": "user", "content": "Hello"}],
            json_mode=True
        )
        assert res == "{\"status\": \"ok\"}"


@pytest.mark.asyncio
async def test_llm_client_rate_limit_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(429, text="Rate limit exceeded")

    transport = httpx.MockTransport(handler)
    client = LLMClient(provider="deepseek", api_key="mock-key")

    with patch("httpx.AsyncClient", return_value=httpx.AsyncClient(transport=transport)):
        with pytest.raises(LLMRateLimitError):
            await client.generate(messages=[{"role": "user", "content": "Test"}])


@pytest.mark.asyncio
async def test_llm_client_server_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(503, text="Service Unavailable")

    transport = httpx.MockTransport(handler)
    client = LLMClient(provider="deepseek", api_key="mock-key")

    with patch("httpx.AsyncClient", return_value=httpx.AsyncClient(transport=transport)):
        with pytest.raises(LLMServerError):
            await client.generate(messages=[{"role": "user", "content": "Test"}])


@pytest.mark.asyncio
async def test_llm_client_auth_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(401, text="Unauthorized")

    transport = httpx.MockTransport(handler)
    client = LLMClient(provider="deepseek", api_key="invalid-key")

    with patch("httpx.AsyncClient", return_value=httpx.AsyncClient(transport=transport)):
        with pytest.raises(LLMAuthenticationError):
            await client.generate(messages=[{"role": "user", "content": "Test"}])


@pytest.mark.asyncio
async def test_llm_client_malformed_response():
    mock_response = {"invalid": "structure"}

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json=mock_response)

    transport = httpx.MockTransport(handler)
    client = LLMClient(provider="deepseek", api_key="mock-key")

    with patch("httpx.AsyncClient", return_value=httpx.AsyncClient(transport=transport)):
        with pytest.raises(LLMAPIError):
            await client.generate(messages=[{"role": "user", "content": "Test"}])
