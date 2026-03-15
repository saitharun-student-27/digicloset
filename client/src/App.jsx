import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Closet from "./pages/Closet";
import OutfitPage from "./pages/OutfitPage";
import TryOnPage from "./pages/TryOnPage";

const navStyle = ({ isActive }) => ({
  padding: "0.45rem 1rem",
  fontSize: "0.75rem",
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  borderRadius: "20px",
  textDecoration: "none",
  transition: "all 0.2s",
  background: isActive ? "var(--dark)" : "transparent",
  color: isActive ? "var(--cream)" : "var(--muted)",
});

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 2rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--cream)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.4rem",
            letterSpacing: "0.02em",
          }}
        >
          Digi<span style={{ color: "var(--warm)" }}>Closet</span>
        </span>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <NavLink to="/" style={navStyle} end>Home</NavLink>
          <NavLink to="/closet" style={navStyle}>Wardrobe</NavLink>
          <NavLink to="/outfit" style={navStyle}>Outfit</NavLink>
          <NavLink to="/tryon" style={navStyle}>Try-On</NavLink>
        </div>
      </nav>

      <main style={{ flex: 1, padding: "2rem", maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/closet" element={<Closet />} />
          <Route path="/outfit" element={<OutfitPage />} />
          <Route path="/tryon" element={<TryOnPage />} />
        </Routes>
      </main>
    </div>
  );
}
