from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.clothing_item import (
    ClothingItemRead,
    ClothingItemUpdate,
)
from app.schemas.outfit import OutfitRead
from app.services import wardrobe_service


router = APIRouter(prefix="/clothing", tags=["Clothing"])


@router.post(
    "",
    response_model=ClothingItemRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_clothing_item(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        item_in = await wardrobe_service.build_clothing_item_from_request(
            request,
            user_id=current_user.id,
        )
    except ValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=error.errors(),
        ) from error
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    return wardrobe_service.create_clothing_item(db, item_in, current_user.id)


@router.get("", response_model=list[ClothingItemRead])
def list_clothing_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return wardrobe_service.list_clothing_items(db, current_user.id)


@router.get("/{item_id}", response_model=ClothingItemRead)
def get_clothing_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    clothing_item = wardrobe_service.get_clothing_item(db, item_id, current_user.id)
    if clothing_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found",
        )
    return clothing_item


@router.get("/{item_id}/outfits", response_model=list[OutfitRead])
def get_outfits_for_clothing_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    outfits = wardrobe_service.get_outfits_for_clothing_item(db, item_id, current_user.id)
    if outfits is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found",
        )
    return outfits


@router.put("/{item_id}", response_model=ClothingItemRead)
def update_clothing_item(
    item_id: int,
    item_in: ClothingItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    clothing_item = wardrobe_service.update_clothing_item(
        db,
        item_id,
        item_in,
        current_user.id,
    )
    if clothing_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found",
        )
    return clothing_item


@router.delete("/{item_id}")
def delete_clothing_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        was_deleted = wardrobe_service.delete_clothing_item(db, item_id, current_user.id)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error

    if not was_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found",
        )
    return {"message": "Clothing item deleted"}
