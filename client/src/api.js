import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const uploadClothing = (formData) =>
  api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });

export const getWardrobe = (category) =>
  api.get("/wardrobe", { params: category ? { category } : {} });

export const deleteClothing = (id) => api.delete(`/wardrobe/${id}`);

export const generateOutfit = () => api.get("/generate-outfit");

export const virtualTryOn = (formData) =>
  api.post("/tryon", formData, { headers: { "Content-Type": "multipart/form-data" } });

export default api;
