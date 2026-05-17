from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.db.base import Base


engine = create_engine(settings.database_url_resolved, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _sync_sqlite_schema() -> None:
    if not settings.database_url_resolved.startswith("sqlite"):
        return

    inspector = inspect(engine)

    existing_tables = set(inspector.get_table_names())

    with engine.begin() as connection:
        if "outfits" in existing_tables:
            outfit_columns = {
                column["name"] for column in inspector.get_columns("outfits")
            }

            if "source_type" not in outfit_columns:
                connection.execute(
                    text(
                        "ALTER TABLE outfits "
                        "ADD COLUMN source_type VARCHAR(50) "
                        "NOT NULL DEFAULT 'manual_build'"
                    ),
                )

        if "outfit_items" in existing_tables:
            outfit_item_columns = {
                column["name"] for column in inspector.get_columns("outfit_items")
            }

            if "layer_order" not in outfit_item_columns:
                connection.execute(
                    text(
                        "ALTER TABLE outfit_items "
                        "ADD COLUMN layer_order INTEGER"
                    ),
                )

        if "clothing_items" in existing_tables:
            connection.execute(
                text(
                    "UPDATE clothing_items "
                    "SET source_type = 'manual_piece' "
                    "WHERE source_type = 'manual'"
                ),
            )
            connection.execute(
                text(
                    "UPDATE clothing_items "
                    "SET source_type = 'outfit_breakdown' "
                    "WHERE source_type = 'outfit'"
                ),
            )


def create_db_tables() -> None:
    from app.models.clothing_item import ClothingItem  # noqa: F401
    from app.models.outfit import Outfit, OutfitItem  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _sync_sqlite_schema()
