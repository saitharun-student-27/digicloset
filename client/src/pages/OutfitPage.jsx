import OutfitGenerator from "../components/OutfitGenerator";

export default function OutfitPage() {
  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", marginBottom: "0.5rem" }}>
        Outfit Generator
      </h2>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>
        Automatically mix and match items from your wardrobe into a complete outfit.
      </p>
      <OutfitGenerator />
    </div>
  );
}
