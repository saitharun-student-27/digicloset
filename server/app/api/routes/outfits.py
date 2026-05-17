from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.outfit import OutfitRead, OutfitUpdate
from app.services import outfit_service


router = APIRouter(prefix="/outfits", tags=["Outfits"])


@router.post("", response_model=OutfitRead, status_code=status.HTTP_201_CREATED)
async def create_outfit(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        outfit_in = await outfit_service.build_outfit_from_request(
            request,
            user_id=current_user.id,
        )
        return outfit_service.create_outfit(db, outfit_in, current_user.id)
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
    except LookupError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.get("", response_model=list[OutfitRead])
def list_outfits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return outfit_service.list_outfits(db, current_user.id)


@router.get("/{outfit_id}", response_model=OutfitRead)
def get_outfit(
    outfit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    outfit = outfit_service.get_outfit(db, outfit_id, current_user.id)
    if outfit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outfit not found",
        )
    return outfit


@router.put("/{outfit_id}", response_model=OutfitRead)
def update_outfit(
    outfit_id: int,
    outfit_in: OutfitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    outfit = outfit_service.update_outfit(db, outfit_id, outfit_in, current_user.id)
    if outfit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outfit not found",
        )
    return outfit


@router.delete("/{outfit_id}")
def delete_outfit(
    outfit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    was_deleted = outfit_service.delete_outfit(db, outfit_id, current_user.id)
    if not was_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outfit not found",
        )
    return {"message": "Outfit deleted"}


@router.post("/{outfit_id}/favorite", response_model=OutfitRead)
def toggle_favorite(
    outfit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    outfit = outfit_service.toggle_favorite(db, outfit_id, current_user.id)
    if not outfit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outfit not found",
        )
    return outfit


@router.post("/{outfit_id}/worn", response_model=OutfitRead)
def mark_worn(
    outfit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    outfit = outfit_service.mark_worn(db, outfit_id, current_user.id)
    if not outfit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outfit not found",
        )
    return outfit
