import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/AppShell";
import LoadingState from "./components/LoadingState";
import ProtectedRoute, { PublicOnlyRoute } from "./components/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const Vault = lazy(() => import("./pages/Vault"));
const Capture = lazy(() => import("./pages/Capture"));
const Suggestions = lazy(() => import("./pages/Suggestions"));
const PieceDetail = lazy(() => import("./pages/PieceDetail"));
const OutfitDetail = lazy(() => import("./pages/OutfitDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const AuthWelcome = lazy(() => import("./pages/AuthWelcome"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));

function AppRoute({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>
        <Suspense fallback={<LoadingState />}>{children}</Suspense>
      </AppShell>
    </ProtectedRoute>
  );
}

function PublicRoute({ children }) {
  return (
    <PublicOnlyRoute>
      <Suspense fallback={<LoadingState />}>{children}</Suspense>
    </PublicOnlyRoute>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/welcome"
        element={
          <PublicRoute>
            <AuthWelcome />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <AppRoute>
            <Home />
          </AppRoute>
        }
      />
      <Route
        path="/wardrobe"
        element={
          <AppRoute>
            <Vault />
          </AppRoute>
        }
      />
      <Route
        path="/outfit-memory"
        element={
          <AppRoute>
            <Capture />
          </AppRoute>
        }
      />
      <Route
        path="/suggestions"
        element={
          <AppRoute>
            <Suggestions />
          </AppRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <AppRoute>
            <Profile />
          </AppRoute>
        }
      />
      <Route
        path="/pieces/:id"
        element={
          <AppRoute>
            <PieceDetail />
          </AppRoute>
        }
      />
      <Route
        path="/outfits/:id"
        element={
          <AppRoute>
            <OutfitDetail />
          </AppRoute>
        }
      />
      <Route path="/vault" element={<Navigate to="/wardrobe" replace />} />
      <Route
        path="/capture"
        element={<Navigate to="/outfit-memory" replace />}
      />
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
}

export default App;
