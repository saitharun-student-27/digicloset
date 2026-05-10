from sqlalchemy.orm import Session

from app.models.clothing_item import ClothingItem
from app.schemas.clothing_item import ClothingItemCreate, ClothingItemUpdate


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
