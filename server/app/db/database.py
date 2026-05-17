from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base


engine = create_engine(settings.database_url_resolved, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
DEFAULT_DEV_USER_EMAIL = "dev@digicloset.local"
DEFAULT_DEV_USER_DISPLAY_NAME = "Dev User"
DEFAULT_DEV_USER_PASSWORD = "devpassword123"


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

            if "user_id" not in outfit_columns:
                connection.execute(
                    text(
                        "ALTER TABLE outfits "
                        "ADD COLUMN user_id INTEGER REFERENCES users(id)"
                    ),
                )
            connection.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS ix_outfits_user_id "
                    "ON outfits (user_id)"
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
            clothing_columns = {
                column["name"] for column in inspector.get_columns("clothing_items")
            }
            if "user_id" not in clothing_columns:
                connection.execute(
                    text(
                        "ALTER TABLE clothing_items "
                        "ADD COLUMN user_id INTEGER REFERENCES users(id)"
                    ),
                )
            connection.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS ix_clothing_items_user_id "
                    "ON clothing_items (user_id)"
                ),
            )
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


def ensure_default_dev_user(db: Session) -> int:
    from app.models.user import User

    default_user = db.query(User).filter(User.email == DEFAULT_DEV_USER_EMAIL).first()
    if default_user is None:
        default_user = User(
            email=DEFAULT_DEV_USER_EMAIL,
            password_hash=hash_password(DEFAULT_DEV_USER_PASSWORD),
            display_name=DEFAULT_DEV_USER_DISPLAY_NAME,
        )
        db.add(default_user)
        db.commit()
        db.refresh(default_user)

    return default_user.id


def backfill_user_ownership(db: Session) -> dict[str, int]:
    default_user_id = ensure_default_dev_user(db)

    outfits_backfilled = (
        db.execute(
            text(
                "UPDATE outfits "
                "SET user_id = :user_id "
                "WHERE user_id IS NULL"
            ),
            {"user_id": default_user_id},
        ).rowcount
        or 0
    )
    clothing_backfilled = (
        db.execute(
            text(
                "UPDATE clothing_items "
                "SET user_id = :user_id "
                "WHERE user_id IS NULL"
            ),
            {"user_id": default_user_id},
        ).rowcount
        or 0
    )
    db.commit()

    cross_user_links = (
        db.execute(
            text(
                "SELECT COUNT(*) "
                "FROM outfit_items oi "
                "JOIN outfits o ON o.id = oi.outfit_id "
                "JOIN clothing_items c ON c.id = oi.clothing_item_id "
                "WHERE o.user_id IS NOT NULL "
                "AND c.user_id IS NOT NULL "
                "AND o.user_id != c.user_id"
            ),
        ).scalar_one()
    )

    return {
        "default_dev_user_id": default_user_id,
        "outfits_backfilled": outfits_backfilled,
        "clothing_items_backfilled": clothing_backfilled,
        "cross_user_links": int(cross_user_links or 0),
    }


def create_db_tables() -> None:
    from app.models.clothing_item import ClothingItem  # noqa: F401
    from app.models.outfit import Outfit, OutfitItem  # noqa: F401
    from app.models.user import User  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _sync_sqlite_schema()
    db = SessionLocal()
    try:
        backfill_user_ownership(db)
    finally:
        db.close()
