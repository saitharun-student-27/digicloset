import { api } from "../lib/api";


export async function getOutfits() {
  const response = await api.get("/outfits");
  return response.data;
}

export async function getOutfit(id) {
  const response = await api.get(`/outfits/${id}`);
  return response.data;
}


export async function createOutfit(outfit) {
  const formData = new FormData();
  const pieces = (outfit.pieces || []).map((piece) => ({
    name: piece.name,
    category: piece.category,
    color: piece.color,
    slot: piece.slot || piece.role,
    season: piece.season || null,
    occasion: piece.occasion || null,
    style: piece.style || outfit.style || null,
    formality_level: piece.formality_level || null,
    source_type: piece.source_type || null,
    layer_order: piece.layer_order ?? null,
  }));

  formData.append("occasion", outfit.occasion);
  formData.append("season", outfit.season);
  formData.append("pieces", JSON.stringify(pieces));
  formData.append(
    "clothing_item_ids",
    JSON.stringify(outfit.clothing_item_ids || []),
  );

  if (outfit.source_type) {
    formData.append("source_type", outfit.source_type);
  }

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

export async function updateOutfit(id, outfit) {
  const response = await api.put(`/outfits/${id}`, outfit);
  return response.data;
}

export async function deleteOutfit(id) {
  const response = await api.delete(`/outfits/${id}`);
  return response.data;
}

export async function toggleFavoriteOutfit(id) {
  const response = await api.post(`/outfits/${id}/favorite`);
  return response.data;
}

export async function markOutfitWorn(id) {
  const response = await api.post(`/outfits/${id}/worn`);
  return response.data;
}
