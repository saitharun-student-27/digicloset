import asyncio
import os
from dotenv import load_dotenv

# Load env before importing app services
load_dotenv()

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.services.ai_service import scan_clothing_image
from app.models.clothing_item import ClothingItem
from app.models.outfit import Outfit, OutfitItem
from datetime import datetime, timezone, timedelta


def category_to_slot(category: str) -> str:
    if category in {"shirt", "t_shirt", "dress"}:
        return "upper"
    if category in {"pant", "jeans", "shorts"}:
        return "lower"
    if category in {"jacket", "hoodie"}:
        return "outerwear"
    if category == "shoes":
        return "footwear"
    return "accessory"


async def seed_database():
    db: Session = SessionLocal()
    upload_dir = "uploads"
    images = [f for f in os.listdir(upload_dir) if f.endswith(".jpg") or f.endswith(".png")]
    
    if not images:
        print("No images found to process.")
        return

    print(f"Found {len(images)} images to process...")
    
    clothing_items = []
    
    for filename in images:
        filepath = os.path.join(upload_dir, filename)
        print(f"Processing {filename} via AI Scan...")
        
        with open(filepath, "rb") as f:
            contents = f.read()
            
        try:
            scan_result = await scan_clothing_image(contents, "image/jpeg")
            
            item = ClothingItem(
                name=scan_result.get("name", "Unknown Item"),
                category=scan_result.get("category", "accessory"),
                color=scan_result.get("color", "unknown"),
                season=scan_result.get("season", "all"),
                occasion=scan_result.get("occasion", "casual"),
                style=scan_result.get("style", ""),
                image_url=f"/uploads/{filename}",
                source_type="image_upload"
            )
            db.add(item)
            db.commit()
            db.refresh(item)
            clothing_items.append(item)
            print(f"[SUCCESS] Added {item.color} {item.name} to Wardrobe!")
            
        except Exception as e:
            print(f"[ERROR] Failed to process {filename}: {e}")

    # Now create some outfits to test the rails and suggestions
    if clothing_items:
        print("Creating Outfit Memory...")
        outfit = Outfit(
            title="Vintage Fall Casual",
            description="Perfect for a chilly evening or casual meetup.",
            occasion="casual",
            season="all",
            style="vintage",
            source_type="manual_build",
            is_favorite=True,
            # Set a really old worn date so it shows up in "Recently Unworn" suggestions
            last_worn_date=datetime.now(timezone.utc) - timedelta(days=15)
        )
        db.add(outfit)
        db.flush()
        
        for idx, item in enumerate(clothing_items):
            outfit_item = OutfitItem(
                outfit_id=outfit.id,
                clothing_item_id=item.id,
                slot=category_to_slot(item.category),
                layer_order=idx
            )
            db.add(outfit_item)
            
        db.commit()
        print("[SUCCESS] Added 'Vintage Fall Casual' Outfit!")

    print("Database sync complete!")
    db.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
