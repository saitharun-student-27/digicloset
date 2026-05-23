import axios from "axios";

export const AUTH_TOKEN_STORAGE_KEY = "digicloset_access_token";
const LOCAL_DEV_API_URL = "http://127.0.0.1:8000/api";

let unauthorizedHandler = null;

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  if (import.meta.env.DEV) {
    return LOCAL_DEV_API_URL;
  }

  throw new Error(
    "Missing VITE_API_BASE_URL for production build. Set it to your hosted backend API origin.",
  );
}

export function getStoredAccessToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "";
}

export function setStoredAccessToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

export function clearStoredAccessToken() {
  setStoredAccessToken("");
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const shouldHandleUnauthorized =
      error?.response?.status === 401 && !error?.config?.skipAuthHandling;

    if (shouldHandleUnauthorized) {
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  },
);
