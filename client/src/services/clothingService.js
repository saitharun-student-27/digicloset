import { api } from "../lib/api";


export async function getClothingItems() {
  const response = await api.get("/clothing");
  return response.data;
}

export async function getClothingItem(id) {
  const response = await api.get(`/clothing/${id}`);
  return response.data;
}

export async function getClothingItemOutfits(id) {
  const response = await api.get(`/clothing/${id}/outfits`);
  return response.data;
}


export async function createClothingItem(item) {
  const response = await api.post("/clothing", item);
  return response.data;
}


export async function updateClothingItem(id, data) {
  const response = await api.put(`/clothing/${id}`, data);
  return response.data;
}

export async function deleteClothingItem(id) {
  const response = await api.delete(`/clothing/${id}`);
  return response.data;
}

export function getImageUrl(imageUrl) {
  if (!imageUrl) {
    return "";
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  const apiBaseUrl = api.defaults.baseURL || "";
  const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");
  const normalizedPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;

  return `${serverBaseUrl}${normalizedPath}`;
}
