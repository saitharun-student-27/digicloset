from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.clothing_item import ClothingItem
    from app.models.user import User


class Outfit(Base):
    __tablename__ = "outfits"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    occasion: Mapped[str] = mapped_column(String(50), nullable=False)
    season: Mapped[str] = mapped_column(String(50), nullable=False)
    style: Mapped[str | None] = mapped_column(String(80), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    is_favorite: Mapped[bool] = mapped_column(default=False, nullable=False)
    last_worn_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    outfit_items: Mapped[list["OutfitItem"]] = relationship(
        "OutfitItem",
        back_populates="outfit",
        cascade="all, delete-orphan",
    )
    user: Mapped["User"] = relationship("User", back_populates="outfits")


class OutfitItem(Base):
    __tablename__ = "outfit_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    outfit_id: Mapped[int] = mapped_column(
        ForeignKey("outfits.id", ondelete="CASCADE"),
        nullable=False,
    )
    clothing_item_id: Mapped[int] = mapped_column(
        ForeignKey("clothing_items.id", ondelete="CASCADE"),
        nullable=False,
    )
    slot: Mapped[str] = mapped_column(String(50), nullable=False)
    layer_order: Mapped[int | None] = mapped_column(nullable=True)

    outfit: Mapped[Outfit] = relationship("Outfit", back_populates="outfit_items")
    clothing_item: Mapped["ClothingItem"] = relationship(
        "ClothingItem",
        back_populates="outfit_items",
    )
