from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.suggestion_service import get_suggestions

router = APIRouter(prefix="/suggestions", tags=["Suggestions"])

@router.get("")
async def list_suggestions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return deterministic wardrobe suggestions."""
    return await get_suggestions(db, current_user.id)
