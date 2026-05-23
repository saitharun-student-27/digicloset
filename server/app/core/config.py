from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.db.url import normalize_database_url


class Settings(BaseSettings):
    APP_NAME: str = "DigiCloset API"
    APP_ENV: str = "development"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = "sqlite:///./digicloset.db"
    CORS_ORIGINS: str = (
        "http://127.0.0.1:5173,"
        "http://localhost:5173,"
        "http://127.0.0.1:5174,"
        "http://localhost:5174"
    )
    UPLOAD_DIR: str = "uploads"
    UPLOAD_URL_PREFIX: str = "/uploads"
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024
    GEMINI_API_KEY: str | None = None
    SECRET_KEY: str | None = None
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    JWT_ALGORITHM: str = "HS256"
    ENABLE_API_DOCS: bool | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")

    @model_validator(mode="after")
    def validate_environment(self) -> "Settings":
        if self.APP_ENV not in {"development", "production"}:
            raise ValueError("APP_ENV must be either 'development' or 'production'.")

        if self.is_production:
            if (
                not self.SECRET_KEY
                or self.SECRET_KEY in self.disallowed_production_secret_values
            ):
                raise ValueError(
                    "SECRET_KEY must be explicitly set to a non-development value when APP_ENV=production."
                )
            if not self.cors_origins or self.has_only_local_cors_origins:
                raise ValueError(
                    "CORS_ORIGINS must be explicitly configured with non-local frontend origins when APP_ENV=production."
                )

        return self

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def development_secret_key(self) -> str:
        return "dev-only-local-secret-change-me-before-hosting"

    @property
    def secret_key_resolved(self) -> str:
        if self.SECRET_KEY:
            return self.SECRET_KEY
        return self.development_secret_key

    @property
    def disallowed_production_secret_values(self) -> set[str]:
        return {
            self.development_secret_key,
            "change-me-in-production",
            "replace-this-for-hosting",
            "dev-only-change-me-for-hosting",
        }

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def has_only_local_cors_origins(self) -> bool:
        if not self.cors_origins:
            return False

        def _is_local_origin(origin: str) -> bool:
            return (
                "localhost" in origin
                or "127.0.0.1" in origin
                or origin.startswith("http://0.0.0.0")
            )

        return all(_is_local_origin(origin) for origin in self.cors_origins)

    @property
    def enable_api_docs(self) -> bool:
        if self.ENABLE_API_DOCS is not None:
            return self.ENABLE_API_DOCS
        return self.is_development

    @property
    def should_run_local_bootstrap(self) -> bool:
        return self.is_development

    @property
    def should_mount_local_uploads(self) -> bool:
        return True

    @property
    def base_dir(self) -> Path:
        return Path(__file__).resolve().parents[2]

    @property
    def upload_dir_path(self) -> Path:
        upload_dir = Path(self.UPLOAD_DIR)
        if not upload_dir.is_absolute():
            upload_dir = self.base_dir / upload_dir
        return upload_dir.resolve()

    @property
    def database_url_resolved(self) -> str:
        return normalize_database_url(self.DATABASE_URL, self.base_dir)


settings = Settings()
