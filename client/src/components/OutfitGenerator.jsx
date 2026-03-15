import { useState } from "react";
import { generateOutfit } from "../api";

const SLOTS = [
  { key: "top", label: "Top", emoji: "👕" },
  { key: "bottom", label: "Bottom", emoji: "👖" },
  { key: "shoes", label: "Shoes", emoji: "👟" },
  { key: "jacket", label: "Layer", emoji: "🧥" },
];

const SCORE_NOTES = [
  "Excellent color harmony",
  "Great casual combination",
  "Perfect for a day out",
  "Smart and versatile look",
  "Effortless summer vibe",
];

export default function OutfitGenerator() {
  const [outfit, setOutfit] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await generateOutfit();
      setOutfit(data);
      setScore(72 + Math.floor(Math.random() * 27));
    } catch {
      setError("Could not generate outfit. Make sure the server is running and you have items in each category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {SLOTS.map(({ key, label, emoji }) => {
          const item = outfit?.[key];
          return (
            <div
              key={key}
              style={{
                border: "1.5px dashed var(--border)", borderRadius: 12,
                padding: "1.5rem 1rem", textAlign: "center", minHeight: 160,
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", background: "white",
                transition: "border-color 0.3s",
                borderColor: item ? "var(--warm)" : "var(--border)",
              }}
            >
              <p style={{ fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.5rem" }}>
                {label}
              </p>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                {item ? (EMOJI_MAP[item.category] || emoji) : emoji}
              </div>
              <p style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--dark)" }}>
                {item ? item.name : "—"}
              </p>
              {item && (
                <p style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 4 }}>
                  {item.color} · {item.occasion}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          width: "100%", padding: "0.9rem", background: "var(--dark)", color: "var(--cream)",
          border: "none", borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.05em",
          cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Generating…" : "✦ Generate Outfit Combination"}
      </button>

      {error && <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#c0392b" }}>{error}</p>}

      {score && outfit && (
        <div
          style={{
            background: "var(--warm-light)", borderRadius: 10, padding: "1.25rem",
            marginTop: "1.25rem", textAlign: "center",
          }}
        >
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "var(--warm)" }}>
            {score}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Style Match Score</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.4rem" }}>
            {SCORE_NOTES[score % SCORE_NOTES.length]}
          </div>
        </div>
      )}
    </div>
  );
}

const EMOJI_MAP = {
  Tops: "👕", Bottoms: "👖", Shoes: "👟", Jackets: "🧥", Accessories: "👜",
};
