import { api } from "../lib/api";


export async function getClothingItems() {
  const response = await api.get("/clothing");
  return response.data;
}


export async function createClothingItem(item) {
  const response = await api.post("/clothing", item);
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
