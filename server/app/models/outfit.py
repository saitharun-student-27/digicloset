from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Outfit(Base):
    __tablename__ = "outfits"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    occasion: Mapped[str] = mapped_column(String(50), nullable=False)
    season: Mapped[str] = mapped_column(String(50), nullable=False)
    style: Mapped[str | None] = mapped_column(String(80), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
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

    outfit: Mapped[Outfit] = relationship("Outfit", back_populates="outfit_items")
    clothing_item: Mapped["ClothingItem"] = relationship(
        "ClothingItem",
        back_populates="outfit_items",
    )
