import httpx
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.models.outfit import Outfit
from app.models.clothing_item import ClothingItem


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

            # Determine condition label
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
    except Exception as e:
        print(f"Weather API error: {e}")
        return {"temperature": 30, "condition": "pleasant", "weathercode": 0}


def _season_for_condition(condition: str) -> list[str]:
    """Map weather condition to DB season values."""
    if condition == "rainy":
        return ["rainy", "all"]
    elif condition == "cold":
        return ["winter", "all"]
    elif condition == "hot":
        return ["summer", "all"]
    else:
        return ["summer", "all"]


async def get_suggestions(db: Session):
    """
    Returns deterministic wardrobe suggestions based on rules + live weather.
    """
    now = datetime.now(timezone.utc)
    one_week_ago = now - timedelta(days=7)

    # 1. Live Weather
    weather = await get_current_weather()
    matching_seasons = _season_for_condition(weather["condition"])

    # 2. Weather-matched clothing
    weather_items = (
        db.query(ClothingItem)
        .filter(ClothingItem.season.in_(matching_seasons))
        .limit(6)
        .all()
    )

    # 3. Recently Unworn Outfits
    unworn_outfits = (
        db.query(Outfit)
        .filter(
            (Outfit.last_worn_date == None) | (Outfit.last_worn_date < one_week_ago)
        )
        .limit(3)
        .all()
    )

    # 4. Frequently Reused Pieces
    all_clothing = db.query(ClothingItem).all()
    all_clothing.sort(key=lambda x: len(x.outfit_items), reverse=True)
    frequent_pieces = all_clothing[:3]

    # Format for the frontend
    return {
        "weather": weather,
        "weather_picks": [
            {
                "id": c.id,
                "name": c.name,
                "image_url": c.image_url,
                "category": c.category,
                "message": f"Great for {weather['condition']} weather ({weather['temperature']}°C).",
            }
            for c in weather_items
        ],
        "unworn_outfits": [
            {
                "id": o.id,
                "title": o.title,
                "image_url": o.image_url,
                "message": (
                    "You haven't worn this fit recently."
                    if o.last_worn_date
                    else "You've never worn this saved fit."
                ),
            }
            for o in unworn_outfits
        ],
        "frequent_pieces": [
            {
                "id": c.id,
                "name": c.name,
                "image_url": c.image_url,
                "message": f"Used in {len(c.outfit_items)} outfits.",
            }
            for c in frequent_pieces
            if len(c.outfit_items) > 0
        ],
    }
