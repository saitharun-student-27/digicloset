"""Local development utility only. Do not run against a hosted production database."""

from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
SERVER_DIR = ROOT / "server"
if str(SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(SERVER_DIR))

from app.core.config import settings  # noqa: E402
from app.db.database import SessionLocal, backfill_user_ownership, create_db_tables  # noqa: E402


def main() -> None:
    if settings.is_production:
        raise RuntimeError(
            "scripts/migrate_user_ownership.py is a local-only utility and must not run with APP_ENV=production."
        )

    create_db_tables()
    db = SessionLocal()
    try:
        results = backfill_user_ownership(db)
    finally:
        db.close()

    print("User ownership migration complete.")
    print(f"default_dev_user_id: {results['default_dev_user_id']}")
    print(f"outfits_backfilled: {results['outfits_backfilled']}")
    print(f"clothing_items_backfilled: {results['clothing_items_backfilled']}")
    print(f"cross_user_links: {results['cross_user_links']}")


if __name__ == "__main__":
    main()
