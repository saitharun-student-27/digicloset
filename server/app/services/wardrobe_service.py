from fastapi import Request
from pydantic import ValidationError
from starlette.datastructures import UploadFile as StarletteUploadFile
from sqlalchemy.orm import Session

from app.models.clothing_item import ClothingItem
from app.schemas.clothing_item import ClothingItemCreate, ClothingItemUpdate
from app.utils.upload import save_clothing_image


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


async def build_clothing_item_from_request(request: Request) -> ClothingItemCreate:
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
            image_url = await save_clothing_image(image)
            item_in = item_in.model_copy(update={"image_url": image_url})

        return item_in

    if content_type.startswith("application/json") or content_type == "":
        payload = await request.json()
        return ClothingItemCreate.model_validate(payload)

    raise ValueError("Content-Type must be application/json or multipart/form-data.")


def create_clothing_item(db: Session, item_in: ClothingItemCreate) -> ClothingItem:
    clothing_item = ClothingItem(**item_in.model_dump())
    db.add(clothing_item)
    db.commit()
    db.refresh(clothing_item)
    return clothing_item


def list_clothing_items(db: Session) -> list[ClothingItem]:
    return db.query(ClothingItem).order_by(ClothingItem.created_at.desc()).all()


def get_clothing_item(db: Session, item_id: int) -> ClothingItem | None:
    return db.query(ClothingItem).filter(ClothingItem.id == item_id).first()


def update_clothing_item(
    db: Session,
    item_id: int,
    item_in: ClothingItemUpdate,
) -> ClothingItem | None:
    clothing_item = get_clothing_item(db, item_id)
    if clothing_item is None:
        return None

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(clothing_item, field, value)

    db.commit()
    db.refresh(clothing_item)
    return clothing_item


def delete_clothing_item(db: Session, item_id: int) -> bool:
    clothing_item = get_clothing_item(db, item_id)
    if clothing_item is None:
        return False

    db.delete(clothing_item)
    db.commit()
    return True
