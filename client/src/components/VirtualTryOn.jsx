import { useState, useEffect } from "react";
import { getWardrobe, virtualTryOn } from "../api";

const MODELS = [
  { id: "casual", label: "Casual", emoji: "🧍" },
  { id: "formal", label: "Formal", emoji: "🧑‍💼" },
  { id: "athletic", label: "Athletic", emoji: "🏃" },
];

export default function VirtualTryOn() {
  const [tops, setTops] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [clothFile, setClothFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    getWardrobe("Tops")
      .then(({ data }) => setTops(data))
      .catch(() => setTops([]));
  }, []);

  const runTryon = async () => {
    if (!modelFile || !clothFile) {
      setError("Please upload both a model image and a clothing image.");
      return;
    }
    setLoading(true);
    setProgress(0);
    setResult(null);
    setError("");

    // Animate progress bar
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 12, 92));
    }, 400);

    const fd = new FormData();
    fd.append("model_image", modelFile);
    fd.append("cloth_image", clothFile);

    try {
      const { data } = await virtualTryOn(fd);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 300);
    } catch (err) {
      clearInterval(interval);
      setError(
        err.response?.data?.error ||
          "Try-On failed. Check your RAPIDAPI_KEY in server/.env"
      );
      setLoading(false);
    }
  };

  const handleFileInput = (setter) => (e) => {
    const f = e.target.files[0];
    if (f) setter(f);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1.5rem",
        alignItems: "start",
      }}
    >
      {/* Model Image Panel */}
      <Panel title="Model image">
        <FileDropZone
          file={modelFile}
          onFile={setModelFile}
          placeholder="🧍"
          hint="Upload a full-body photo"
        />
        <div style={{ padding: "0 1rem 1rem" }}>
          <p style={labelStyle}>Or pick a preset pose</p>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                style={chipStyle(selectedModel === m.id)}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {/* Clothing Panel */}
      <Panel title="Clothing item">
        <FileDropZone
          file={clothFile}
          onFile={setClothFile}
          placeholder="👕"
          hint="Upload a flat-lay clothing image"
        />
        {tops.length > 0 && (
          <div style={{ padding: "0 1rem 1rem" }}>
            <p style={labelStyle}>Or pick from wardrobe</p>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {tops.slice(0, 6).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedItem(t.id)}
                  title={t.name}
                  style={chipStyle(selectedItem === t.id)}
                >
                  👕
                </button>
              ))}
            </div>
          </div>
        )}
      </Panel>

      {/* Result Panel */}
      <Panel title="Result">
        <div
          style={{
            minHeight: 220,
            background: "var(--warm-light)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          {loading ? (
            <>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⏳</div>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Processing try-on…</p>
            </>
          ) : result ? (
            result.output_image_url ? (
              <img
                src={result.output_image_url}
                alt="Try-on result"
                style={{ maxWidth: "100%", borderRadius: 8 }}
              />
            ) : (
              <>
                <div style={{ fontSize: "4rem" }}>✨</div>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem" }}>
                  Try-on complete!
                </p>
              </>
            )
          ) : (
            <>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>✨</div>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                Your result will appear here
              </p>
            </>
          )}
        </div>

        {loading && (
          <div style={{ height: 3, background: "var(--border)", margin: "0 1rem" }}>
            <div
              style={{
                height: "100%",
                background: "var(--warm)",
                width: `${progress}%`,
                transition: "width 0.4s ease",
                borderRadius: 2,
              }}
            />
          </div>
        )}

        {error && (
          <p style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#c0392b" }}>
            {error}
          </p>
        )}

        <button
          onClick={runTryon}
          disabled={loading || (!modelFile && !selectedModel)}
          style={{
            margin: "1rem",
            padding: "0.7rem 1rem",
            background: "var(--warm)",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            width: "calc(100% - 2rem)",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Generating…" : "Generate Try-On →"}
        </button>
      </Panel>
    </div>
  );
}

function FileDropZone({ file, onFile, placeholder, hint }) {
  const preview = file ? URL.createObjectURL(file) : null;
  return (
    <label
      style={{
        display: "block",
        margin: "1rem",
        border: "1.5px dashed var(--warm)",
        borderRadius: 10,
        minHeight: 140,
        background: "var(--warm-light)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {preview ? (
        <img
          src={preview}
          alt="preview"
          style={{ maxHeight: 160, maxWidth: "100%", objectFit: "contain" }}
        />
      ) : (
        <>
          <div style={{ fontSize: "2.5rem" }}>{placeholder}</div>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.4rem" }}>{hint}</p>
        </>
      )}
      <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files[0])} style={{ display: "none" }} />
    </label>
  );
}

function Panel({ title, children }) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        background: "white",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "0.75rem 1rem",
          borderBottom: "1px solid var(--border)",
          fontSize: "0.7rem",
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

const labelStyle = {
  fontSize: "0.7rem",
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--muted)",
  marginBottom: "0.5rem",
};

const chipStyle = (active) => ({
  padding: "0.3rem 0.7rem",
  borderRadius: 20,
  fontSize: "0.75rem",
  fontWeight: 500,
  cursor: "pointer",
  border: "1px solid var(--border)",
  background: active ? "var(--dark)" : "var(--tag-bg)",
  color: active ? "var(--cream)" : "var(--dark)",
  transition: "all 0.2s",
});
