from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "DigiCloset API"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/digicloset"
    CORS_ORIGINS: str = "http://localhost:5173"
    UPLOAD_DIR: str = "uploads"
    UPLOAD_URL_PREFIX: str = "/uploads"
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024
    GEMINI_API_KEY: str | None = None
    SECRET_KEY: str = "dev-only-change-me-for-hosting"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    JWT_ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

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
        sqlite_prefix = "sqlite:///"
        if not self.DATABASE_URL.startswith(sqlite_prefix):
            return self.DATABASE_URL

        database_path = self.DATABASE_URL[len(sqlite_prefix) :]
        if Path(database_path).is_absolute():
            return self.DATABASE_URL

        resolved_path = (self.base_dir / database_path).resolve()
        return f"{sqlite_prefix}{resolved_path.as_posix()}"


settings = Settings()
