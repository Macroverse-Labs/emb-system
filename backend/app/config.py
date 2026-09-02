"""Application configuration loaded from environment variables."""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Project settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    app_name: str = "emb-system backend"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/emb_system"

    @field_validator("database_url")
    @classmethod
    def _ensure_asyncpg_driver(cls, v: str) -> str:
        """Railway's Postgres plugin injects a plain postgresql:// URL; SQLAlchemy needs +asyncpg."""
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+asyncpg://", 1)
        if v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    # GC console seed. The dataset loads on startup so a fresh deployment has
    # something to show; the credentials MUST be overridden for any deployment that
    # is reachable by anyone else.
    gc_seed_on_startup: bool = True
    gc_admin_email: str = "gc@mail.com"
    gc_admin_password: str = "admin12345"

    # The site's own timezone. Access records are read by people standing at a gate,
    # so every timestamp the console shows must be in site time, not UTC.
    site_timezone: str = "Asia/Kuala_Lumpur"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # CORS (comma-separated origins)
    cors_origins: str = "http://localhost:3000"

    # JWT
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Mailtrap SMTP
    smtp_host: str = "sandbox.smtp.mailtrap.io"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "noreply@emb-system.local"
    smtp_from_name: str = "emb-system"
    smtp_starttls: bool = True


settings = Settings()
