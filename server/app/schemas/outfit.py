from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.clothing_item import (
    ClothingCategory,
    ClothingOccasion,
    ClothingSeason,
    ClothingItemRead,
)


OutfitSlot = Literal["upper", "lower", "footwear", "outerwear", "accessory"]


class OutfitPieceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    category: ClothingCategory
    color: str = Field(..., min_length=1, max_length=50)
    slot: OutfitSlot
    style: str | None = Field(default=None, max_length=80)
    formality_level: str | None = Field(default=None, max_length=50)


class OutfitCreate(BaseModel):
    title: str | None = Field(default=None, max_length=160)
    description: str | None = None
    occasion: ClothingOccasion
    season: ClothingSeason
    style: str | None = Field(default=None, max_length=80)
    image_url: str | None = Field(default=None, max_length=500)
    pieces: list[OutfitPieceCreate] = Field(..., min_length=1)


class OutfitItemRead(BaseModel):
    id: int
    slot: OutfitSlot
    clothing_item: ClothingItemRead

    model_config = ConfigDict(from_attributes=True)


class OutfitRead(BaseModel):
    id: int
    title: str
    description: str
    occasion: ClothingOccasion
    season: ClothingSeason
    style: str | None
    image_url: str | None
    created_at: datetime
    updated_at: datetime
    outfit_items: list[OutfitItemRead]

    model_config = ConfigDict(from_attributes=True)
