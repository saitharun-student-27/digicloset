from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field


ClothingCategory = Annotated[str, Field(min_length=1, max_length=50)]
ClothingSeason = Literal["summer", "winter", "rainy", "all"]
ClothingOccasion = Literal[
    "casual",
    "formal",
    "college",
    "party",
    "sports",
    "travel",
    "traditional",
]
ClothingSourceType = Literal[
    "manual_piece",
    "outfit_breakdown",
    "image_upload",
    "text_parse",
]


class ClothingItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    category: ClothingCategory
    color: str = Field(..., min_length=1, max_length=50)
    season: ClothingSeason | None = None
    occasion: ClothingOccasion | None = None
    style: str | None = Field(default=None, max_length=80)
    formality_level: str | None = Field(default=None, max_length=50)
    image_url: str | None = Field(default=None, max_length=500)
    source_type: ClothingSourceType = "manual_piece"


class ClothingItemCreate(ClothingItemBase):
    pass


class ClothingItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    category: ClothingCategory | None = None
    color: str | None = Field(default=None, min_length=1, max_length=50)
    season: ClothingSeason | None = None
    occasion: ClothingOccasion | None = None
    style: str | None = Field(default=None, max_length=80)
    formality_level: str | None = Field(default=None, max_length=50)
    image_url: str | None = Field(default=None, max_length=500)
    source_type: ClothingSourceType | None = None


class ClothingItemRead(ClothingItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
