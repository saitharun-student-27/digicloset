from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings
from app.utils.upload import (
    _safe_filename_stem,
    delete_local_uploaded_file,
    is_local_upload_url,
    read_validated_image,
    resolve_local_upload_path,
    save_local_image_for_user,
)


@dataclass(slots=True)
class StoredImageInfo:
    image_url: str
    image_public_id: str | None = None


def is_cloudinary_url(image_url: str | None) -> bool:
    if not image_url:
        return False
    return image_url.startswith("https://res.cloudinary.com/")


def is_local_upload_image_url(image_url: str | None) -> bool:
    return is_local_upload_url(image_url)


def _build_cloudinary_public_id(
    original_name: str,
    user_id: int | None,
    context: str,
) -> str:
    safe_stem = _safe_filename_stem(original_name)
    scope = f"u_{user_id}" if user_id is not None else "shared"
    folder_prefix = settings.cloudinary_folder_prefix or "digicloset"
    return f"{folder_prefix}/{scope}/{context}/{uuid4().hex}-{safe_stem}"


def _import_cloudinary_modules():
    try:
        import cloudinary  # type: ignore
        import cloudinary.uploader  # type: ignore
    except ImportError as error:
        raise RuntimeError(
            "Cloudinary support requires the 'cloudinary' package to be installed."
        ) from error

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )
    return cloudinary.uploader


async def _save_cloudinary_image_for_user(
    upload_file: UploadFile,
    context: str,
    user_id: int | None = None,
) -> StoredImageInfo:
    contents = await read_validated_image(upload_file)
    original_name = Path(upload_file.filename or "").name or f"{context}-image"
    public_id = _build_cloudinary_public_id(original_name, user_id, context)
    uploader = _import_cloudinary_modules()
    upload_result = uploader.upload(
        contents,
        public_id=public_id,
        resource_type="image",
        overwrite=False,
    )

    secure_url = upload_result.get("secure_url")
    if not secure_url:
        raise RuntimeError("Cloudinary upload succeeded without returning a secure_url.")

    return StoredImageInfo(
        image_url=secure_url,
        image_public_id=upload_result.get("public_id"),
    )


async def save_upload(
    upload_file: UploadFile,
    user_id: int | None,
    context: str,
) -> StoredImageInfo:
    if settings.uses_cloudinary_storage:
        return await _save_cloudinary_image_for_user(
            upload_file,
            context=context,
            user_id=user_id,
        )

    image_url = await save_local_image_for_user(upload_file, user_id=user_id)
    return StoredImageInfo(image_url=image_url, image_public_id=None)


def _is_app_owned_cloudinary_public_id(public_id: str | None) -> bool:
    if not public_id:
        return False

    folder_prefix = settings.cloudinary_folder_prefix
    if not folder_prefix:
        return False

    return public_id.startswith(f"{folder_prefix}/")


def delete_image(image_url: str | None, public_id: str | None = None) -> bool:
    if is_local_upload_image_url(image_url):
        return delete_local_uploaded_file(image_url)

    if not is_cloudinary_url(image_url):
        return False

    if not _is_app_owned_cloudinary_public_id(public_id):
        return False

    uploader = _import_cloudinary_modules()
    destroy_result = uploader.destroy(public_id, resource_type="image")
    return destroy_result.get("result") in {"ok", "not found"}


__all__ = [
    "StoredImageInfo",
    "delete_image",
    "is_cloudinary_url",
    "is_local_upload_image_url",
    "resolve_local_upload_path",
    "save_upload",
]
