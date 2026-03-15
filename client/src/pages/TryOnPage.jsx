import VirtualTryOn from "../components/VirtualTryOn";

export default function TryOnPage() {
  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", marginBottom: "0.5rem" }}>
        Virtual Try-On
      </h2>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>
        Upload a model photo and a clothing image to see how the outfit looks.
      </p>
      <VirtualTryOn />
    </div>
  );
}
