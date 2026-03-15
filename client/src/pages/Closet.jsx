import { useState } from "react";
import Upload from "../components/Upload";
import Wardrobe from "../components/Wardrobe";

export default function Closet() {
  const [tab, setTab] = useState("wardrobe");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem" }}>My Wardrobe</h2>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {["wardrobe", "upload"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "0.45rem 1rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                background: tab === t ? "var(--dark)" : "var(--tag-bg)",
                color: tab === t ? "var(--cream)" : "var(--dark)",
                transition: "all 0.2s",
              }}
            >
              {t === "wardrobe" ? "Browse" : "+ Add Item"}
            </button>
          ))}
        </div>
      </div>

      {tab === "wardrobe" ? (
        <Wardrobe refresh={refreshKey} />
      ) : (
        <Upload
          onSuccess={() => {
            setRefreshKey((k) => k + 1);
            setTab("wardrobe");
          }}
        />
      )}
    </div>
  );
}
