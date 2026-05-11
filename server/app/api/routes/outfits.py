from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.outfit import OutfitRead, OutfitUpdate
from app.services import outfit_service


router = APIRouter(prefix="/outfits", tags=["Outfits"])


@router.post("", response_model=OutfitRead, status_code=status.HTTP_201_CREATED)
async def create_outfit(request: Request, db: Session = Depends(get_db)):
    try:
        outfit_in = await outfit_service.build_outfit_from_request(request)
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

    return outfit_service.create_outfit(db, outfit_in)


@router.get("", response_model=list[OutfitRead])
def list_outfits(db: Session = Depends(get_db)):
    return outfit_service.list_outfits(db)


@router.get("/{outfit_id}", response_model=OutfitRead)
def get_outfit(outfit_id: int, db: Session = Depends(get_db)):
    outfit = outfit_service.get_outfit(db, outfit_id)
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
):
    outfit = outfit_service.update_outfit(db, outfit_id, outfit_in)
    if outfit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outfit not found",
        )
    return outfit


@router.delete("/{outfit_id}")
def delete_outfit(outfit_id: int, db: Session = Depends(get_db)):
    was_deleted = outfit_service.delete_outfit(db, outfit_id)
    if not was_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outfit not found",
        )
    return {"message": "Outfit deleted"}
