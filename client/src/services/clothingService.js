import { api } from "../lib/api";


export async function getClothingItems() {
  const response = await api.get("/clothing");
  return response.data;
}


export async function createClothingItem(item) {
  const response = await api.post("/clothing", item);
  return response.data;
}
