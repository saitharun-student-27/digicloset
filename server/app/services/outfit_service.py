import json

from fastapi import Request
from pydantic import ValidationError
from sqlalchemy.orm import Session, joinedload
from starlette.datastructures import UploadFile as StarletteUploadFile

from app.models.clothing_item import ClothingItem
from app.models.outfit import Outfit, OutfitItem
from app.schemas.outfit import OutfitCreate, OutfitPieceCreate
from app.utils.upload import save_clothing_image


FORM_FIELDS = ["title", "description", "occasion", "season", "style"]


def _clean_optional(value: object) -> object:
    if isinstance(value, str) and value.strip() == "":
        return None
    return value


def _format_value(value: str) -> str:
    return value.replace("_", " ")


def _format_piece_name(piece: OutfitPieceCreate) -> str:
    color = piece.color.strip().lower()
    name = piece.name.strip().lower()
    if name.startswith(color):
        return name
    return f"{color} {name}"


def generate_outfit_description(
    pieces: list[OutfitPieceCreate],
    occasion: str,
    season: str,
) -> str:
    piece_names = [_format_piece_name(piece) for piece in pieces]

    if len(piece_names) == 1:
        piece_text = piece_names[0]
    else:
        piece_text = f"{', '.join(piece_names[:-1])} and {piece_names[-1]}"

    return (
        f"{piece_text}, suitable for a {_format_value(occasion)} "
        f"{_format_value(season)} look."
    )


def _generate_outfit_title(outfit_in: OutfitCreate) -> str:
    first_piece = outfit_in.pieces[0].name
    return f"{_format_value(outfit_in.occasion).title()} outfit with {first_piece}"


async def build_outfit_from_request(request: Request) -> OutfitCreate:
    content_type = request.headers.get("content-type", "")

    if content_type.startswith("multipart/form-data"):
        form = await request.form()
        outfit_data = {
            field: _clean_optional(form.get(field))
            for field in FORM_FIELDS
            if form.get(field) is not None
        }

        pieces_raw = form.get("pieces")
        if not isinstance(pieces_raw, str):
            raise ValueError("Pieces must be provided as a JSON string.")

        try:
            outfit_data["pieces"] = json.loads(pieces_raw)
        except json.JSONDecodeError as error:
            raise ValueError("Pieces must be valid JSON.") from error

        outfit_in = OutfitCreate.model_validate(outfit_data)

        image = form.get("image")
        if isinstance(image, StarletteUploadFile) and image.filename:
            image_url = await save_clothing_image(image)
            outfit_in = outfit_in.model_copy(update={"image_url": image_url})

        return outfit_in

    if content_type.startswith("application/json") or content_type == "":
        payload = await request.json()
        return OutfitCreate.model_validate(payload)

    raise ValueError("Content-Type must be application/json or multipart/form-data.")


def _with_outfit_relations(query):
    return query.options(
        joinedload(Outfit.outfit_items).joinedload(OutfitItem.clothing_item),
    )


def create_outfit(db: Session, outfit_in: OutfitCreate) -> Outfit:
    title = outfit_in.title or _generate_outfit_title(outfit_in)
    description = outfit_in.description or generate_outfit_description(
        outfit_in.pieces,
        outfit_in.occasion,
        outfit_in.season,
    )

    outfit = Outfit(
        title=title,
        description=description,
        occasion=outfit_in.occasion,
        season=outfit_in.season,
        style=outfit_in.style,
        image_url=outfit_in.image_url,
    )
    db.add(outfit)
    db.flush()

    for piece in outfit_in.pieces:
        clothing_item = ClothingItem(
            name=piece.name,
            category=piece.category,
            color=piece.color,
            season=outfit_in.season,
            occasion=outfit_in.occasion,
            style=piece.style or outfit_in.style,
            formality_level=piece.formality_level,
            source_type="outfit",
        )
        db.add(clothing_item)
        db.flush()

        db.add(
            OutfitItem(
                outfit_id=outfit.id,
                clothing_item_id=clothing_item.id,
                slot=piece.slot,
            ),
        )

    db.commit()
    return get_outfit(db, outfit.id)


def list_outfits(db: Session) -> list[Outfit]:
    return (
        _with_outfit_relations(db.query(Outfit))
        .order_by(Outfit.created_at.desc())
        .all()
    )


def get_outfit(db: Session, outfit_id: int) -> Outfit | None:
    return (
        _with_outfit_relations(db.query(Outfit))
        .filter(Outfit.id == outfit_id)
        .first()
    )


def delete_outfit(db: Session, outfit_id: int) -> bool:
    outfit = get_outfit(db, outfit_id)
    if outfit is None:
        return False

    db.delete(outfit)
    db.commit()
    return True
