from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings

PROVIDER_BASE_URLS = {
    "deepseek": "https://api.deepseek.com/v1",
    "openai": "https://api.openai.com/v1",
    "openrouter": "https://openrouter.ai/api/v1",
}


class LLMError(Exception):
    """Base exception for LLM errors."""
    pass


class LLMAuthenticationError(LLMError):
    """Raised when authentication fails (401/403)."""
    pass


class LLMRateLimitError(LLMError):
    """Raised when rate limit is exceeded (429)."""
    pass


class LLMServerError(LLMError):
    """Raised on server errors (500/502/503/504)."""
    pass


class LLMAPIError(LLMError):
    """Raised on general API errors."""
    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code


class LLMClient:
    """
    Unified LLM Client supporting DeepSeek, OpenAI, and OpenRouter.
    Uses OpenAI-compatible REST API (/v1/chat/completions).
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: Optional[float] = None,
    ):
        self.provider = (provider or settings.LLM_PROVIDER).lower()
        self.api_key = api_key or settings.LLM_API_KEY
        self.model = model or settings.LLM_MODEL
        self.timeout = timeout or settings.LLM_TIMEOUT
        
        if base_url:
            self.base_url = base_url.rstrip("/")
        else:
            self.base_url = PROVIDER_BASE_URLS.get(
                self.provider, "https://api.deepseek.com/v1"
            ).rstrip("/")

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        if self.provider == "openrouter":
            headers["HTTP-Referer"] = "https://aigostdoc.ru"
            headers["X-Title"] = "AI GostDoc"
        return headers

    async def generate(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, Any]] = None,
        json_mode: bool = False,
    ) -> str:
        """
        Send a chat completion request to the LLM provider.

        :param messages: List of message objects e.g. [{"role": "user", "content": "..."}]
        :param temperature: Sampling temperature
        :param max_tokens: Max completion tokens
        :param response_format: Dict e.g. {"type": "json_object"}
        :param json_mode: If True, automatically adds response_format={"type": "json_object"}
        :return: Generated text content from assistant message
        """
        endpoint = f"{self.base_url}/chat/completions"
        headers = self._get_headers()

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature if temperature is not None else settings.LLM_TEMPERATURE,
            "max_tokens": max_tokens if max_tokens is not None else settings.LLM_MAX_TOKENS,
        }

        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        elif response_format:
            payload["response_format"] = response_format

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(endpoint, json=payload, headers=headers)
            except httpx.RequestError as exc:
                raise LLMAPIError(f"HTTP connection failed: {exc}") from exc

            if response.status_code == 401 or response.status_code == 403:
                raise LLMAuthenticationError(f"Authentication failed: {response.text}")
            elif response.status_code == 429:
                raise LLMRateLimitError(f"Rate limit exceeded: {response.text}")
            elif response.status_code >= 500:
                raise LLMServerError(f"Server error {response.status_code}: {response.text}")
            elif response.status_code != 200:
                raise LLMAPIError(
                    f"API call failed with status {response.status_code}: {response.text}",
                    status_code=response.status_code,
                )

            data = response.json()
            try:
                content = data["choices"][0]["message"]["content"]
                return content
            except (KeyError, IndexError) as exc:
                raise LLMAPIError(f"Invalid response structure from LLM provider: {data}") from exc
