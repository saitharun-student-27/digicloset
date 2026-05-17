import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/AppShell";
import LoadingState from "./components/LoadingState";

const Home = lazy(() => import("./pages/Home"));
const Vault = lazy(() => import("./pages/Vault"));
const Capture = lazy(() => import("./pages/Capture"));
const Suggestions = lazy(() => import("./pages/Suggestions"));
const PieceDetail = lazy(() => import("./pages/PieceDetail"));
const OutfitDetail = lazy(() => import("./pages/OutfitDetail"));

function AppRoute({ children }) {
  return (
    <AppShell>
      <Suspense fallback={<LoadingState />}>{children}</Suspense>
    </AppShell>
  );
}

function App() {
  return (
    <Routes>
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
    </Routes>
  );
}

export default App;
