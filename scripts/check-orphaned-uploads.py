"""Local development utility only. Assumes filesystem-backed uploads."""

from __future__ import annotations

import os
import sys
from pathlib import Path

from sqlalchemy import text


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SERVER_ROOT = PROJECT_ROOT / "server"

sys.path.insert(0, str(SERVER_ROOT))
os.chdir(SERVER_ROOT)

from app.core.config import settings  # noqa: E402
from app.db.database import engine  # noqa: E402
from app.utils.upload import ensure_upload_dir, resolve_local_upload_path  # noqa: E402


def collect_db_image_urls() -> set[str]:
    queries = [
        "SELECT image_url FROM outfits WHERE image_url IS NOT NULL AND image_url != ''",
        "SELECT image_url FROM clothing_items WHERE image_url IS NOT NULL AND image_url != ''",
    ]
    urls: set[str] = set()

    with engine.connect() as connection:
        for query in queries:
            rows = connection.execute(text(query)).fetchall()
            urls.update(row[0] for row in rows if row[0])

    return urls


def main() -> int:
    if settings.is_production:
        raise RuntimeError(
            "scripts/check-orphaned-uploads.py is a local-only utility and must not run with APP_ENV=production."
        )
    if not settings.uses_local_storage:
        raise RuntimeError(
            "scripts/check-orphaned-uploads.py only checks local filesystem uploads and should not run when IMAGE_STORAGE_BACKEND is not 'local'."
        )

    upload_dir = ensure_upload_dir()
    disk_files = {
        path.resolve()
        for path in upload_dir.rglob("*")
        if path.is_file() and path.name != ".gitkeep"
    }
    image_urls = collect_db_image_urls()

    referenced_paths = {
        resolved_path
        for image_url in image_urls
        if (resolved_path := resolve_local_upload_path(image_url)) is not None
    }
    external_urls = sorted(
        image_url
        for image_url in image_urls
        if image_url.startswith("http://") or image_url.startswith("https://")
    )
    missing_files = sorted(
        str(path)
        for path in referenced_paths
        if not path.exists()
    )
    orphaned_files = sorted(
        str(path)
        for path in disk_files
        if path not in referenced_paths
    )

    print("Upload directory:", upload_dir)
    print("Referenced DB image URLs:", len(image_urls))
    print("Local referenced files:", len(referenced_paths))
    print("External image URLs:", len(external_urls))
    print("Missing local files referenced by DB:", len(missing_files))
    for path in missing_files:
        print("  MISSING:", path)
    print("Orphaned local upload files:", len(orphaned_files))
    for path in orphaned_files:
        print("  ORPHAN:", path)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
