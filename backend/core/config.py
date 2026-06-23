import secrets

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration, loaded from environment variables / the .env file.

    Sensitive values (SECRET_KEY, DATABASE_URL) live in backend/.env — which is
    git-ignored — rather than in source. See .env.example for the template.
    Field names map case-insensitively to env vars (e.g. ``secret_key`` ← ``SECRET_KEY``).
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Generated per-process if unset so the app still boots in dev, but this means
    # tokens are invalidated on every restart — always set SECRET_KEY in .env.
    secret_key: str = Field(default_factory=lambda: secrets.token_hex(32))
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    database_url: str = "sqlite:///./chess_mentor.db"
    # Comma-separated list of allowed frontend origins for CORS.
    frontend_origins: str = "http://localhost:5173,http://localhost:5174"


settings = Settings()

# Backwards-compatible module-level constants (existing imports rely on these names).
SECRET_KEY: str = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
REFRESH_TOKEN_EXPIRE_DAYS = settings.refresh_token_expire_days
DATABASE_URL = settings.database_url
FRONTEND_ORIGINS = [origin.strip() for origin in settings.frontend_origins.split(",") if origin.strip()]
