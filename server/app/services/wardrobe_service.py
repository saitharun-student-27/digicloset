from fastapi import Request
from pydantic import ValidationError
from starlette.datastructures import UploadFile as StarletteUploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.clothing_item import ClothingItem
from app.models.outfit import Outfit, OutfitItem
from app.schemas.clothing_item import ClothingItemCreate, ClothingItemUpdate
from app.services.storage_service import delete_image, save_upload


FORM_FIELDS = [
    "name",
    "category",
    "color",
    "season",
    "occasion",
    "style",
    "formality_level",
]


def _clean_optional(value: object) -> object:
    if isinstance(value, str) and value.strip() == "":
        return None
    return value


async def build_clothing_item_from_request(
    request: Request,
    user_id: int | None = None,
) -> ClothingItemCreate:
    content_type = request.headers.get("content-type", "")

    if content_type.startswith("multipart/form-data"):
        form = await request.form()
        item_data = {
            field: _clean_optional(form.get(field))
            for field in FORM_FIELDS
            if form.get(field) is not None
        }
        item_in = ClothingItemCreate.model_validate(item_data)

        image = form.get("image")
        if isinstance(image, StarletteUploadFile) and image.filename:
            image_info = await save_upload(image, user_id=user_id, context="clothing")
            item_in = item_in.model_copy(
                update={
                    "image_url": image_info.image_url,
                    "image_public_id": image_info.image_public_id,
                }
            )

        return item_in

    if content_type.startswith("application/json") or content_type == "":
        payload = await request.json()
        return ClothingItemCreate.model_validate(payload)

    raise ValueError("Content-Type must be application/json or multipart/form-data.")


def create_clothing_item(
    db: Session,
    item_in: ClothingItemCreate,
    user_id: int,
) -> ClothingItem:
    item_data = item_in.model_dump()
    item_data["season"] = item_data.get("season") or "all"
    item_data["occasion"] = item_data.get("occasion") or "casual"
    item_data["user_id"] = user_id
    item_data["image_public_id"] = item_in.image_public_id

    clothing_item = ClothingItem(**item_data)
    db.add(clothing_item)
    db.commit()
    db.refresh(clothing_item)
    return clothing_item


def list_clothing_items(db: Session, user_id: int) -> list[ClothingItem]:
    return (
        db.query(ClothingItem)
        .filter(ClothingItem.user_id == user_id)
        .order_by(ClothingItem.created_at.desc())
        .all()
    )


def get_clothing_item(db: Session, item_id: int, user_id: int) -> ClothingItem | None:
    return (
        db.query(ClothingItem)
        .filter(ClothingItem.id == item_id, ClothingItem.user_id == user_id)
        .first()
    )


def get_outfits_for_clothing_item(db: Session, item_id: int, user_id: int):
    clothing_item = get_clothing_item(db, item_id, user_id)
    if clothing_item is None:
        return None

    return (
        db.query(Outfit)
        .join(OutfitItem, OutfitItem.outfit_id == Outfit.id)
        .options(
            joinedload(Outfit.outfit_items).joinedload(OutfitItem.clothing_item),
        )
        .filter(OutfitItem.clothing_item_id == item_id, Outfit.user_id == user_id)
        .order_by(Outfit.created_at.desc())
        .all()
    )


def update_clothing_item(
    db: Session,
    item_id: int,
    item_in: ClothingItemUpdate,
    user_id: int,
) -> ClothingItem | None:
    clothing_item = get_clothing_item(db, item_id, user_id)
    if clothing_item is None:
        return None

    previous_image_url = clothing_item.image_url
    previous_image_public_id = clothing_item.image_public_id
    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(clothing_item, field, value)

    if "image_url" in update_data and update_data.get("image_url") != previous_image_url:
        clothing_item.image_public_id = None

    db.commit()
    db.refresh(clothing_item)
    if previous_image_url != clothing_item.image_url:
        delete_image(previous_image_url, previous_image_public_id)
    return clothing_item


def delete_clothing_item(db: Session, item_id: int, user_id: int) -> bool:
    clothing_item = get_clothing_item(db, item_id, user_id)
    if clothing_item is None:
        return False

    linked_outfit_count = (
        db.query(func.count(OutfitItem.id))
        .join(Outfit, Outfit.id == OutfitItem.outfit_id)
        .filter(
            OutfitItem.clothing_item_id == item_id,
            Outfit.user_id == user_id,
        )
        .scalar()
        or 0
    )

    if linked_outfit_count > 0:
        raise ValueError(
            "This clothing piece is linked to one or more outfit memories and cannot be deleted safely.",
        )

    image_url = clothing_item.image_url
    image_public_id = clothing_item.image_public_id
    db.delete(clothing_item)
    db.commit()
    delete_image(image_url, image_public_id)
    return True
