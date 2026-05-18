import { api } from "../lib/api";

export async function signup(payload) {
  const response = await api.post("/auth/signup", payload, {
    skipAuthHandling: true,
  });
  return response.data;
}

export async function login(payload) {
  const response = await api.post("/auth/login", payload, {
    skipAuthHandling: true,
  });
  return response.data;
}

export async function getMe() {
  const response = await api.get("/auth/me");
  return response.data;
}
