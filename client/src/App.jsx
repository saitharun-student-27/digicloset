import { Route, Routes } from "react-router-dom";

import AppShell from "./components/AppShell";
import Suggestions from "./pages/Suggestions";
import Capture from "./pages/Capture";
import Home from "./pages/Home";
import Vault from "./pages/Vault";

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
        path="/vault"
        element={
          <AppRoute>
            <Vault />
          </AppRoute>
        }
      />
      <Route
        path="/capture"
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
    </Routes>
  );
}

export default App;
