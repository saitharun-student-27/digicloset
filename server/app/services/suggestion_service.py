from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy.orm import Session, joinedload

from app.models.clothing_item import ClothingItem
from app.models.outfit import Outfit, OutfitItem


async def get_current_weather():
    """
    Fetch current weather from Open-Meteo (no API key required).
    Uses Hyderabad, India coordinates by default.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": 17.385,
                    "longitude": 78.4867,
                    "current_weather": "true",
                },
            )
            data = resp.json()
            current = data.get("current_weather", {})
            temp = current.get("temperature", 30)
            weathercode = current.get("weathercode", 0)

            if weathercode in (61, 63, 65, 80, 81, 82, 95, 96, 99):
                condition = "rainy"
            elif temp < 18:
                condition = "cold"
            elif temp > 32:
                condition = "hot"
            else:
                condition = "pleasant"

            return {
                "temperature": temp,
                "condition": condition,
                "weathercode": weathercode,
            }
    except Exception as error:
        print(f"Weather API error: {error}")
        return {"temperature": 30, "condition": "pleasant", "weathercode": 0}


def _season_for_condition(condition: str) -> list[str]:
    if condition == "rainy":
        return ["rainy", "all"]
    if condition == "cold":
        return ["winter", "all"]
    if condition == "hot":
        return ["summer", "all"]
    return ["summer", "all"]


async def get_suggestions(db: Session):
    """
    Returns deterministic wardrobe suggestions based on rules + live weather.
    """
    now = datetime.now(timezone.utc)
    one_week_ago = now - timedelta(days=7)

    weather = await get_current_weather()
    matching_seasons = _season_for_condition(weather["condition"])

    weather_items = (
        db.query(ClothingItem)
        .filter(ClothingItem.season.in_(matching_seasons))
        .limit(6)
        .all()
    )

    unworn_outfits = (
        db.query(Outfit)
        .options(joinedload(Outfit.outfit_items).joinedload(OutfitItem.clothing_item))
        .filter((Outfit.last_worn_date == None) | (Outfit.last_worn_date < one_week_ago))
        .limit(3)
        .all()
    )

    all_clothing = db.query(ClothingItem).all()
    all_clothing.sort(key=lambda item: len(item.outfit_items), reverse=True)
    frequent_pieces = all_clothing[:3]

    return {
        "weather": weather,
        "weather_picks": [
            {
                "id": item.id,
                "name": item.name,
                "image_url": item.image_url,
                "category": item.category,
                "color": item.color,
                "season": item.season,
                "occasion": item.occasion,
                "style": item.style,
                "formality_level": item.formality_level,
                "source_type": item.source_type,
                "message": f"Useful for {weather['condition']} weather ({weather['temperature']}°C).",
            }
            for item in weather_items
        ],
        "unworn_outfits": [
            {
                "id": outfit.id,
                "title": outfit.title,
                "description": outfit.description,
                "occasion": outfit.occasion,
                "season": outfit.season,
                "style": outfit.style,
                "image_url": outfit.image_url,
                "is_favorite": outfit.is_favorite,
                "last_worn_date": outfit.last_worn_date,
                "outfit_items": [
                    {
                        "id": outfit_item.id,
                        "slot": outfit_item.slot,
                        "layer_order": outfit_item.layer_order,
                        "clothing_item": {
                            "id": outfit_item.clothing_item.id,
                            "name": outfit_item.clothing_item.name,
                            "category": outfit_item.clothing_item.category,
                            "color": outfit_item.clothing_item.color,
                            "season": outfit_item.clothing_item.season,
                            "occasion": outfit_item.clothing_item.occasion,
                            "style": outfit_item.clothing_item.style,
                            "formality_level": outfit_item.clothing_item.formality_level,
                            "image_url": outfit_item.clothing_item.image_url,
                            "source_type": outfit_item.clothing_item.source_type,
                            "created_at": outfit_item.clothing_item.created_at,
                            "updated_at": outfit_item.clothing_item.updated_at,
                        },
                    }
                    for outfit_item in outfit.outfit_items
                ],
                "message": (
                    "You haven't worn this fit recently."
                    if outfit.last_worn_date
                    else "You saved this fit but have not marked it worn yet."
                ),
            }
            for outfit in unworn_outfits
        ],
        "frequent_pieces": [
            {
                "id": item.id,
                "name": item.name,
                "image_url": item.image_url,
                "category": item.category,
                "color": item.color,
                "season": item.season,
                "occasion": item.occasion,
                "style": item.style,
                "formality_level": item.formality_level,
                "source_type": item.source_type,
                "outfit_count": len(item.outfit_items),
                "message": f"You keep coming back to this across {len(item.outfit_items)} outfit memories.",
            }
            for item in frequent_pieces
            if len(item.outfit_items) > 0
        ],
    }
