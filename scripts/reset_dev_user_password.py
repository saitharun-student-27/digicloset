"""Development utility only. Do not use in production."""

from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
SERVER_DIR = ROOT / "server"
if str(SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(SERVER_DIR))

from app.core.security import hash_password  # noqa: E402
from app.db.database import (  # noqa: E402
    DEFAULT_DEV_USER_DISPLAY_NAME,
    DEFAULT_DEV_USER_EMAIL,
    DEFAULT_DEV_USER_PASSWORD,
    SessionLocal,
    create_db_tables,
)
from app.models.user import User  # noqa: E402


def main() -> None:
    create_db_tables()

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == DEFAULT_DEV_USER_EMAIL).first()
        if user is None:
            user = User(
                email=DEFAULT_DEV_USER_EMAIL,
                display_name=DEFAULT_DEV_USER_DISPLAY_NAME,
                password_hash=hash_password(DEFAULT_DEV_USER_PASSWORD),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            action = "created"
        else:
            user.password_hash = hash_password(DEFAULT_DEV_USER_PASSWORD)
            if not user.display_name:
                user.display_name = DEFAULT_DEV_USER_DISPLAY_NAME
            db.commit()
            db.refresh(user)
            action = "updated"
    finally:
        db.close()

    print(f"dev_user_action: {action}")
    print(f"user_id: {user.id}")
    print(f"email: {user.email}")
    print("password_reset: true")


if __name__ == "__main__":
    main()
