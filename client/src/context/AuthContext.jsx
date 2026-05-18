import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
  setUnauthorizedHandler,
} from "../lib/api";
import { getMe, login as loginRequest, signup as signupRequest } from "../services/authService";

const AuthContext = createContext(null);

function getAuthErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.detail || fallbackMessage;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredAccessToken());
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const clearSession = useCallback((message = "") => {
    clearStoredAccessToken();
    setToken("");
    setUser(null);
    setAuthError(message);
  }, []);

  const refreshMe = useCallback(async () => {
    const currentUser = await getMe();
    setUser(currentUser);
    return currentUser;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const storedToken = getStoredAccessToken();

      if (!storedToken) {
        if (isMounted) {
          setToken("");
          setUser(null);
          setIsAuthLoading(false);
        }
        return;
      }

      setIsAuthLoading(true);
      try {
        const currentUser = await getMe();
        if (!isMounted) {
          return;
        }

        setToken(storedToken);
        setUser(currentUser);
        setAuthError("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        clearSession("");
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    }

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [clearSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession("Your session ended. Please sign in again.");
      setIsAuthLoading(false);
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [clearSession]);

  const login = useCallback(async (payload) => {
    setAuthError("");
    const response = await loginRequest(payload);
    setStoredAccessToken(response.access_token);
    setToken(response.access_token);
    setUser(response.user);
    return response.user;
  }, []);

  const signup = useCallback(async (payload) => {
    setAuthError("");
    const response = await signupRequest(payload);
    setStoredAccessToken(response.access_token);
    setToken(response.access_token);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(() => {
    clearSession("");
    setIsAuthLoading(false);
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isAuthLoading,
      authError,
      login,
      signup,
      logout,
      refreshMe,
      clearAuthError: () => setAuthError(""),
    }),
    [authError, isAuthLoading, login, logout, refreshMe, signup, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
