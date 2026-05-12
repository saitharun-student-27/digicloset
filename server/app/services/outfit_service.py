import json

from fastapi import Request
from sqlalchemy.orm import Session, joinedload
from starlette.datastructures import UploadFile as StarletteUploadFile

from app.models.clothing_item import ClothingItem
from app.models.outfit import Outfit, OutfitItem
from app.schemas.outfit import OutfitCreate, OutfitPieceCreate, OutfitUpdate
from app.utils.upload import save_clothing_image


FORM_FIELDS = ["title", "description", "occasion", "season", "style", "source_type"]


def _clean_optional(value: object) -> object:
    if isinstance(value, str) and value.strip() == "":
        return None
    return value


def _format_value(value: str) -> str:
    return value.replace("_", " ")


def _derive_outfit_source_type(
    image_url: str | None,
    explicit_source_type: str | None,
) -> str:
    if image_url:
        return "image_upload"

    if explicit_source_type:
        return explicit_source_type

    return "manual_build"


def _derive_piece_source_type(outfit_source_type: str) -> str:
    if outfit_source_type == "image_upload":
        return "image_upload"
    if outfit_source_type == "text_input":
        return "text_parse"
    return "outfit_breakdown"


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
    style: str | None = None,
) -> str:
    if len(pieces) == 0:
        style_prefix = f"{_format_value(style)} " if style else ""
        return (
            f"Saved as a {style_prefix}{_format_value(occasion)} "
            f"{_format_value(season)} outfit memory."
        )

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
    colors = [piece.color.strip().lower() for piece in outfit_in.pieces if piece.color.strip()]
    accent_color = next((color for color in colors if color not in {"white", "black", "grey", "gray", "beige", "cream", "tan", "charcoal", "brown", "navy"}), None)
    if not accent_color and colors:
        accent_color = colors[0]

    if accent_color:
        return f"{_format_value(outfit_in.occasion).title()} {_format_value(accent_color).title()} {_format_value(outfit_in.season).title()} Fit"

    if outfit_in.style:
        return f"{_format_value(outfit_in.occasion).title()} {_format_value(outfit_in.style).title()} Look"

    if len(outfit_in.pieces) == 0:
        return f"{_format_value(outfit_in.occasion).title()} Outfit Memory"

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
        if isinstance(pieces_raw, str):
            try:
                outfit_data["pieces"] = json.loads(pieces_raw)
            except json.JSONDecodeError as error:
                raise ValueError("Pieces must be valid JSON.") from error

        clothing_item_ids_raw = form.get("clothing_item_ids")
        if isinstance(clothing_item_ids_raw, str):
            try:
                outfit_data["clothing_item_ids"] = json.loads(clothing_item_ids_raw)
            except json.JSONDecodeError as error:
                raise ValueError("clothing_item_ids must be valid JSON.") from error

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
    source_type = _derive_outfit_source_type(outfit_in.image_url, outfit_in.source_type)
    title = outfit_in.title or _generate_outfit_title(outfit_in)
    description = outfit_in.description or generate_outfit_description(
        outfit_in.pieces,
        outfit_in.occasion,
        outfit_in.season,
        outfit_in.style,
    )

    outfit = Outfit(
        title=title,
        description=description,
        occasion=outfit_in.occasion,
        season=outfit_in.season,
        style=outfit_in.style,
        image_url=outfit_in.image_url,
        source_type=source_type,
    )
    db.add(outfit)
    db.flush()

    default_piece_source_type = _derive_piece_source_type(source_type)

    for index, piece in enumerate(outfit_in.pieces):
        clothing_item = ClothingItem(
            name=piece.name,
            category=piece.category,
            color=piece.color,
            season=piece.season or outfit_in.season,
            occasion=piece.occasion or outfit_in.occasion,
            style=piece.style or outfit_in.style,
            formality_level=piece.formality_level,
            source_type=piece.source_type or default_piece_source_type,
        )
        db.add(clothing_item)
        db.flush()

        db.add(
            OutfitItem(
                outfit_id=outfit.id,
                clothing_item_id=clothing_item.id,
                slot=piece.slot,
                layer_order=piece.layer_order if piece.layer_order is not None else index,
            ),
        )

    for item_id in outfit_in.clothing_item_ids:
        db.add(
            OutfitItem(
                outfit_id=outfit.id,
                clothing_item_id=item_id,
                slot="manual_select",
                layer_order=None,
            )
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


def update_outfit(
    db: Session,
    outfit_id: int,
    outfit_in: OutfitUpdate,
) -> Outfit | None:
    outfit = get_outfit(db, outfit_id)
    if outfit is None:
        return None

    update_data = outfit_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(outfit, field, value)

    db.commit()
    return get_outfit(db, outfit.id)


def delete_outfit(db: Session, outfit_id: int) -> bool:
    outfit = get_outfit(db, outfit_id)
    if outfit is None:
        return False

    db.delete(outfit)
    db.commit()
    return True


def toggle_favorite(db: Session, outfit_id: int) -> Outfit | None:
    """Toggle the favorite status of an outfit."""
    outfit = get_outfit(db, outfit_id)
    if outfit is None:
        return None

    outfit.is_favorite = not outfit.is_favorite
    db.commit()
    db.refresh(outfit)
    return get_outfit(db, outfit.id)


def mark_worn(db: Session, outfit_id: int) -> Outfit | None:
    """Mark an outfit as worn today."""
    outfit = get_outfit(db, outfit_id)
    if outfit is None:
        return None

    from datetime import datetime, timezone
    outfit.last_worn_date = datetime.now(timezone.utc)
    db.commit()
    db.refresh(outfit)
    return get_outfit(db, outfit.id)
