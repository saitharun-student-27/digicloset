import { Route, Routes } from "react-router-dom";

import AppShell from "./components/AppShell";
import Home from "./pages/Home";
import OutfitMemory from "./pages/OutfitMemory";
import Wardrobe from "./pages/Wardrobe";

function AppRoute({ children }) {
  return <AppShell>{children}</AppShell>;
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
        path="/outfit-memory"
        element={
          <AppRoute>
            <OutfitMemory />
          </AppRoute>
        }
      />
      <Route
        path="/wardrobe"
        element={
          <AppRoute>
            <Wardrobe />
          </AppRoute>
        }
      />
    </Routes>
  );
}

export default App;
