from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.clothing_item import (
    ClothingCategory,
    ClothingOccasion,
    ClothingSeason,
    ClothingItemRead,
    ClothingSourceType,
)


OutfitSlot = Literal["upper", "lower", "footwear", "outerwear", "accessory"]
OutfitSourceType = Literal["image_upload", "text_input", "manual_build"]


class OutfitPieceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    category: ClothingCategory
    color: str = Field(..., min_length=1, max_length=50)
    slot: OutfitSlot
    season: ClothingSeason | None = None
    occasion: ClothingOccasion | None = None
    style: str | None = Field(default=None, max_length=80)
    formality_level: str | None = Field(default=None, max_length=50)
    source_type: ClothingSourceType | None = None
    layer_order: int | None = Field(default=None, ge=0)


class OutfitCreate(BaseModel):
    title: str | None = Field(default=None, max_length=160)
    description: str | None = None
    occasion: ClothingOccasion
    season: ClothingSeason
    style: str | None = Field(default=None, max_length=80)
    image_url: str | None = Field(default=None, max_length=500)
    source_type: OutfitSourceType | None = None
    pieces: list[OutfitPieceCreate] = Field(..., min_length=1)


class OutfitUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=160)
    description: str | None = None
    occasion: ClothingOccasion | None = None
    season: ClothingSeason | None = None
    style: str | None = Field(default=None, max_length=80)


class OutfitItemRead(BaseModel):
    id: int
    slot: OutfitSlot
    layer_order: int | None
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
    source_type: OutfitSourceType
    created_at: datetime
    updated_at: datetime
    outfit_items: list[OutfitItemRead]

    model_config = ConfigDict(from_attributes=True)
