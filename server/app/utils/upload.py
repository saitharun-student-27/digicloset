import re
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings


ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}


def ensure_upload_dir() -> Path:
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


def _safe_filename_stem(filename: str) -> str:
    stem = Path(filename).stem
    cleaned = re.sub(r"[^a-zA-Z0-9_-]+", "-", stem).strip("-").lower()
    return cleaned or "clothing-item"


async def save_clothing_image(upload_file: UploadFile) -> str:
    original_name = Path(upload_file.filename or "").name
    extension = Path(original_name).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Image must be a jpg, jpeg, png, or webp file.")

    if upload_file.content_type not in ALLOWED_MIME_TYPES:
        raise ValueError("Image MIME type must be jpeg, png, or webp.")

    contents = await upload_file.read()
    if not contents:
        raise ValueError("Uploaded image is empty.")

    if len(contents) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise ValueError("Uploaded image must be 5MB or smaller.")

    upload_dir = ensure_upload_dir()
    safe_stem = _safe_filename_stem(original_name)
    filename = f"{uuid4().hex}-{safe_stem}{extension}"
    file_path = upload_dir / filename
    file_path.write_bytes(contents)

    return f"{settings.UPLOAD_URL_PREFIX.rstrip('/')}/{filename}"
