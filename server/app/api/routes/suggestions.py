from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.suggestion_service import get_suggestions

router = APIRouter(prefix="/suggestions", tags=["Suggestions"])

@router.get("")
async def list_suggestions(db: Session = Depends(get_db)):
    """Return deterministic wardrobe suggestions."""
    return await get_suggestions(db)
