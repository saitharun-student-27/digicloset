import { useState } from "react";
import { uploadClothing } from "../api";

const CATEGORIES = ["Tops", "Bottoms", "Shoes", "Jackets", "Accessories"];
const SEASONS = ["All Season", "Summer", "Winter", "Monsoon"];
const OCCASIONS = ["Casual", "Formal", "Smart Casual", "Festive", "Sports"];
const COLORS = ["White", "Black", "Blue", "Gray", "Brown", "Red", "Green", "Multi"];

export default function Upload({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    name: "", category: "Tops", color: "White",
    season: "All Season", occasion: "Casual",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    if (!form.name) setForm((p) => ({ ...p, name: f.name.replace(/\.[^.]+$/, "") }));
  };

  const handleSubmit = async () => {
    if (!file) return setStatus("⚠ Please select an image first.");
    setLoading(true);
    setStatus("");
    const fd = new FormData();
    fd.append("file", file);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    try {
      await uploadClothing(fd);
      setStatus("✓ Added to your wardrobe!");
      setFile(null); setPreview(null);
      setForm({ name: "", category: "Tops", color: "White", season: "All Season", occasion: "Casual" });
      onSuccess?.();
    } catch {
      setStatus("✗ Upload failed. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const Chip = ({ value, options, field }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => setForm((p) => ({ ...p, [field]: o }))}
          style={{
            padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem",
            fontWeight: 500, cursor: "pointer", border: "1px solid var(--border)",
            background: form[field] === o ? "var(--dark)" : "var(--tag-bg)",
            color: form[field] === o ? "var(--cream)" : "var(--dark)",
            transition: "all 0.2s",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Drop zone */}
      <label
        style={{
          display: "block", border: "1.5px dashed var(--warm)", borderRadius: 16,
          padding: "2.5rem 2rem", textAlign: "center", background: "var(--warm-light)",
          cursor: "pointer", marginBottom: "1.5rem", transition: "background 0.2s",
        }}
      >
        {preview ? (
          <img src={preview} alt="preview" style={{ maxHeight: 200, borderRadius: 8, objectFit: "cover" }} />
        ) : (
          <>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📎</div>
            <strong style={{ fontSize: "1rem" }}>Drop your clothing image here</strong>
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.3rem" }}>
              JPG · PNG · WEBP · max 10 MB
            </p>
          </>
        )}
        <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      </label>

      {/* Name */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Label>Item name</Label>
        <input
          value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="e.g. White Linen Shirt"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: "1.25rem" }}><Label>Category</Label><Chip field="category" options={CATEGORIES} /></div>
      <div style={{ marginBottom: "1.25rem" }}><Label>Color</Label><Chip field="color" options={COLORS} /></div>
      <div style={{ marginBottom: "1.25rem" }}><Label>Season</Label><Chip field="season" options={SEASONS} /></div>
      <div style={{ marginBottom: "1.75rem" }}><Label>Occasion</Label><Chip field="occasion" options={OCCASIONS} /></div>

      <button onClick={handleSubmit} disabled={loading} style={btnStyle}>
        {loading ? "Uploading…" : "Add to Wardrobe →"}
      </button>
      {status && <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--warm)", fontWeight: 500 }}>{status}</p>}
    </div>
  );
}

const Label = ({ children }) => (
  <p style={{ fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.6rem" }}>
    {children}
  </p>
);

const inputStyle = {
  width: "100%", padding: "0.65rem 0.9rem", border: "1px solid var(--border)",
  borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem",
  background: "white", color: "var(--dark)",
};

const btnStyle = {
  width: "100%", padding: "0.9rem", background: "var(--dark)", color: "var(--cream)",
  border: "none", borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.05em", cursor: "pointer",
};
