import { api } from "../lib/api";


export async function getOutfits() {
  const response = await api.get("/outfits");
  return response.data;
}


export async function createOutfit(outfit) {
  const formData = new FormData();
  const pieces = outfit.pieces.map((piece) => ({
    name: piece.name,
    category: piece.category,
    color: piece.color,
    slot: piece.slot || piece.role,
    style: piece.style || outfit.style || null,
    formality_level: piece.formality_level || null,
  }));

  formData.append("occasion", outfit.occasion);
  formData.append("season", outfit.season);
  formData.append("pieces", JSON.stringify(pieces));

  if (outfit.title) {
    formData.append("title", outfit.title);
  }

  if (outfit.description) {
    formData.append("description", outfit.description);
  }

  if (outfit.style) {
    formData.append("style", outfit.style);
  }

  if (outfit.imageFile) {
    formData.append("image", outfit.imageFile);
  }

  const response = await api.post("/outfits", formData);
  return response.data;
}
