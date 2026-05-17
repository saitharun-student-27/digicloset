import re
from logging import getLogger
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings


logger = getLogger(__name__)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_UPLOAD_MESSAGE = "Image is too large. Please upload an image under 10 MB."


def ensure_upload_dir() -> Path:
    upload_dir = settings.upload_dir_path
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


def _safe_filename_stem(filename: str) -> str:
    stem = Path(filename).stem
    cleaned = re.sub(r"[^a-zA-Z0-9_-]+", "-", stem).strip("-").lower()
    return cleaned or "clothing-item"


async def save_clothing_image(upload_file: UploadFile) -> str:
    contents = await read_validated_image(upload_file)
    original_name = Path(upload_file.filename or "").name
    extension = Path(original_name).suffix.lower()
    upload_dir = ensure_upload_dir()
    safe_stem = _safe_filename_stem(original_name)
    filename = f"{uuid4().hex}-{safe_stem}{extension}"
    file_path = upload_dir / filename
    file_path.write_bytes(contents)

    return f"{settings.UPLOAD_URL_PREFIX.rstrip('/')}/{filename}"


async def read_validated_image(upload_file: UploadFile) -> bytes:
    original_name = Path(upload_file.filename or "").name
    extension = Path(original_name).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Image must be a JPG, JPEG, PNG, or WEBP file.")

    if upload_file.content_type not in ALLOWED_MIME_TYPES:
        raise ValueError("Image must be a JPG, JPEG, PNG, or WEBP file.")

    contents = await upload_file.read()
    if not contents:
        raise ValueError("Uploaded image is empty.")

    if len(contents) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise ValueError(MAX_UPLOAD_MESSAGE)

    await upload_file.seek(0)
    return contents


def resolve_local_upload_path(image_url: str | None) -> Path | None:
    if not image_url:
        return None

    if image_url.startswith("http://") or image_url.startswith("https://"):
        return None

    prefix = settings.UPLOAD_URL_PREFIX.rstrip("/")
    if not image_url.startswith(prefix):
        return None

    relative_path = image_url[len(prefix) :].lstrip("/\\")
    if not relative_path:
        return None

    upload_dir = ensure_upload_dir()
    candidate = (upload_dir / relative_path).resolve()

    try:
        candidate.relative_to(upload_dir)
    except ValueError:
        return None

    return candidate


def is_safe_upload_path(image_url: str | None) -> bool:
    return resolve_local_upload_path(image_url) is not None


def delete_uploaded_file(image_url: str | None) -> bool:
    file_path = resolve_local_upload_path(image_url)
    if file_path is None:
        return False

    try:
        file_path.unlink(missing_ok=True)
    except OSError as error:
        logger.warning("Could not delete uploaded file %s: %s", file_path, error)
        return False

    return True
