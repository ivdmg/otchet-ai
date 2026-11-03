from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    DATABASE_URL: str
    PROTOTYPE_KEY: str
    APP_ENV: str = "development"
    ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    AI_PROVIDER: str = "groq"
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "openrouter/free"
    OPENROUTER_REASONING_EFFORT: str = ""
    YUKASSA_SHOP_ID: str = ""
    YUKASSA_SECRET_KEY: str = ""
    RETURN_URL: str = "http://localhost:5173/"
    COOKIE_SECURE: bool = False
    STORAGE: str = "disk"
    DATA_DIR: Path = Path(".local/private")
    DAILY_TOKENS: int = 160000
    TPM: int = 7000
    JOB_BUDGET: int = 24000
    MOCK_PAYMENTS: bool = False
    MOCK_EMAIL: bool = False
    AI_MAX_ATTEMPTS: int = 5
    MAX_DOCS: int = 200
    PLAN_HOURLY: int = 3
    PLAN_DAILY: int = 5
    REFERRAL_STANDARD_PRICE: int = 19900
    REFERRAL_VERSION: str = "personal-mock-v2"
    CASHBACK_BPS: int = 500
    CASHBACK_VERSION: str = "cashback-5-v1"
    PDF_CONVERTER: str = "word"
    SOFFICE: str = "C:/Program Files/LibreOffice/program/soffice.exe"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def ai_model(self):
        return 'openrouter:' + self.OPENROUTER_MODEL if self.AI_PROVIDER == 'openrouter' else self.GROQ_MODEL

    @property
    def ai_key(self):
        return self.OPENROUTER_API_KEY if self.AI_PROVIDER == 'openrouter' else self.GROQ_API_KEY

    def validate_private(self):
        if self.OPENROUTER_REASONING_EFFORT not in ('', 'none', 'minimal', 'low', 'medium', 'high'):
            raise ValueError('Invalid OPENROUTER_REASONING_EFFORT')
        if self.AI_PROVIDER not in ('groq', 'openrouter'):
            raise ValueError('AI_PROVIDER must be groq or openrouter')
        if len(self.ai_model) > 80:
            raise ValueError('AI model identifier must fit 80 characters')
        if len(self.PROTOTYPE_KEY) < 32:
            raise ValueError("PROTOTYPE_KEY must contain at least 32 characters")
        if self.APP_ENV not in ("development", "test"):
            raise ValueError("This personal sandbox has no production mode")
        if not self.DATABASE_URL.startswith("postgresql+psycopg://"):
            raise ValueError("PostgreSQL with psycopg is required")
        if self.STORAGE not in ("disk", "bytea"):
            raise ValueError("STORAGE must be disk or bytea")


cfg = Config()
cfg.validate_private()
