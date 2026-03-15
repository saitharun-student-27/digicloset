import { useState, useEffect } from "react";
import { getWardrobe, deleteClothing } from "../api";

const FILTERS = ["All", "Tops", "Bottoms", "Shoes", "Jackets", "Accessories"];

const EMOJI_MAP = {
  Tops: "👕", Bottoms: "👖", Shoes: "👟", Jackets: "🧥", Accessories: "👜",
};

export default function Wardrobe({ refresh }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getWardrobe(filter === "All" ? null : filter);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter, refresh]);

  const handleDelete = async (id) => {
    await deleteClothing(id);
    load();
  };

  return (
    <div>
      {/* Filter chips */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "0.35rem 0.9rem", borderRadius: "20px", fontSize: "0.75rem",
              fontWeight: 500, cursor: "pointer", border: "1px solid var(--border)",
              background: filter === f ? "var(--dark)" : "var(--tag-bg)",
              color: filter === f ? "var(--cream)" : "var(--dark)",
              transition: "all 0.2s",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading wardrobe…</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🧺</div>
          <p>No items yet. Upload some clothes to get started!</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))",
            gap: "1rem",
          }}
        >
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, onDelete }) {
  const [hover, setHover] = useState(false);
  const imgSrc = item.filename ? `/api/uploads/${item.filename}` : null;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)",
        background: "white", cursor: "pointer", position: "relative",
        transform: hover ? "translateY(-3px)" : "none",
        boxShadow: hover ? "0 8px 24px rgba(0,0,0,0.08)" : "none",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Image or emoji fallback */}
      <div
        style={{
          width: "100%", height: 120, background: "var(--warm-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "3rem",
        }}
      >
        {imgSrc ? (
          <img src={imgSrc} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          EMOJI_MAP[item.category] || "🎁"
        )}
      </div>

      <div style={{ padding: "0.6rem 0.7rem" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--dark)" }}>{item.name}</p>
        <p style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 2 }}>{item.category}</p>
        <div style={{ marginTop: 4 }}>
          <Tag>{item.season}</Tag>
          <Tag>{item.occasion}</Tag>
        </div>
      </div>

      {hover && (
        <button
          onClick={() => onDelete(item.id)}
          style={{
            position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.55)",
            color: "white", border: "none", borderRadius: "50%", width: 22, height: 22,
            fontSize: "0.7rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

const Tag = ({ children }) => (
  <span
    style={{
      display: "inline-block", padding: "0.15rem 0.5rem", borderRadius: 20,
      fontSize: "0.6rem", fontWeight: 500, background: "var(--tag-bg)",
      color: "var(--dark)", margin: 2,
    }}
  >
    {children}
  </span>
);
