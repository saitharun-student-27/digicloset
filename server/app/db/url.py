from pathlib import Path


SQLITE_PREFIX = "sqlite:///"
POSTGRES_ALIAS_PREFIX = "postgresql://"
POSTGRES_PSYCOPG_PREFIX = "postgresql+psycopg://"


def normalize_database_url(database_url: str, base_dir: Path) -> str:
    if database_url.startswith(POSTGRES_ALIAS_PREFIX) and not database_url.startswith(
        POSTGRES_PSYCOPG_PREFIX
    ):
        return database_url.replace(
            POSTGRES_ALIAS_PREFIX,
            POSTGRES_PSYCOPG_PREFIX,
            1,
        )

    if not database_url.startswith(SQLITE_PREFIX):
        return database_url

    database_path = database_url[len(SQLITE_PREFIX) :]
    if Path(database_path).is_absolute():
        return database_url

    resolved_path = (base_dir / database_path).resolve()
    return f"{SQLITE_PREFIX}{resolved_path.as_posix()}"


def is_sqlite_url(database_url: str) -> bool:
    return database_url.startswith("sqlite")

