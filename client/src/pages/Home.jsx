import { Link } from "react-router-dom";

const features = [
  { emoji: "👗", title: "Digital Wardrobe", desc: "Upload and organise your entire clothing collection in one place.", to: "/closet" },
  { emoji: "✦", title: "Outfit Generator", desc: "Let AI suggest outfit combinations from your wardrobe.", to: "/outfit" },
  { emoji: "🪞", title: "Virtual Try-On", desc: "See how clothes look on you before you wear them.", to: "/tryon" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "4rem 1rem 3rem" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--warm)", marginBottom: "1rem" }}>
          AI-Powered Digital Wardrobe
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            lineHeight: 1.1,
            marginBottom: "1.25rem",
            color: "var(--dark)",
          }}
        >
          Your wardrobe,<br />
          <em style={{ color: "var(--warm)" }}>beautifully organised.</em>
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--muted)", maxWidth: 480, margin: "0 auto 2rem" }}>
          Upload your clothes, generate matching outfits, and virtually try them on — all in one place.
        </p>
        <Link
          to="/closet"
          style={{
            display: "inline-block",
            padding: "0.8rem 2rem",
            background: "var(--dark)",
            color: "var(--cream)",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 500,
            fontSize: "0.9rem",
            letterSpacing: "0.05em",
          }}
        >
          Open My Closet →
        </Link>
      </div>

      {/* Feature cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {features.map(({ emoji, title, desc, to }) => (
          <Link
            key={title}
            to={to}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "1.75rem 1.5rem",
              background: "white",
              textDecoration: "none",
              color: "var(--dark)",
              transition: "transform 0.2s, box-shadow 0.2s",
              display: "block",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{emoji}</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              {title}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6 }}>{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
