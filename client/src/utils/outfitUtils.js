export const seasons = ["summer", "winter", "rainy", "all"];

export const occasions = [
  "casual",
  "formal",
  "college",
  "party",
  "sports",
  "travel",
  "traditional",
];

export const categories = [
  "shirt",
  "t_shirt",
  "pant",
  "jeans",
  "shorts",
  "jacket",
  "hoodie",
  "shoes",
  "accessory",
  "dress",
];

export const roles = ["upper", "lower", "footwear", "outerwear", "accessory"];

const neutralColors = new Set([
  "white",
  "black",
  "grey",
  "gray",
  "beige",
  "cream",
  "tan",
  "charcoal",
  "brown",
  "navy",
]);

const colorWords = [
  "maroon",
  "cream",
  "white",
  "black",
  "blue",
  "navy",
  "beige",
  "brown",
  "olive",
  "green",
  "red",
  "grey",
  "gray",
  "charcoal",
  "tan",
  "pink",
  "purple",
  "yellow",
  "orange",
  "silver",
  "gold",
];

const pieceMatchers = [
  {
    category: "dress",
    slot: "upper",
    name: "Dress",
    aliases: ["dress", "gown"],
  },
  {
    category: "shirt",
    slot: "upper",
    name: "Shirt",
    aliases: ["shirt"],
  },
  {
    category: "t_shirt",
    slot: "upper",
    name: "T-Shirt",
    aliases: ["t shirt", "tee", "t-shirt"],
  },
  {
    category: "pant",
    slot: "lower",
    name: "Pants",
    aliases: ["pants", "pant", "trousers", "slacks"],
  },
  {
    category: "jeans",
    slot: "lower",
    name: "Jeans",
    aliases: ["jeans", "denim"],
  },
  {
    category: "shorts",
    slot: "lower",
    name: "Shorts",
    aliases: ["shorts"],
  },
  {
    category: "jacket",
    slot: "outerwear",
    name: "Jacket",
    aliases: ["jacket", "blazer", "coat"],
  },
  {
    category: "hoodie",
    slot: "outerwear",
    name: "Hoodie",
    aliases: ["hoodie", "sweatshirt"],
  },
  {
    category: "shoes",
    slot: "footwear",
    name: "Sneakers",
    aliases: [
      "sneakers",
      "sneaker",
      "shoes",
      "boots",
      "loafers",
      "sandals",
      "heels",
    ],
  },
  {
    category: "accessory",
    slot: "accessory",
    name: "Accessory",
    aliases: [
      "accessory",
      "bag",
      "belt",
      "watch",
      "cap",
      "hat",
      "scarf",
      "glasses",
      "sunglasses",
      "necklace",
    ],
  },
];

export const emptyPiece = {
  name: "",
  category: "shirt",
  color: "",
  role: "upper",
};

export const initialOutfitState = {
  title: "",
  occasion: "casual",
  season: "all",
  style: "",
  descriptionText: "",
};

export function formatValue(value) {
  return String(value || "").replace(/_/g, " ");
}

export function titleCase(value) {
  return formatValue(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildPieceLabel(piece) {
  const color = piece.color.trim().toLowerCase();
  const name = piece.name.trim().toLowerCase();

  if (!color) {
    return name;
  }

  return name.startsWith(color) ? name : `${color} ${name}`;
}

export function generateOutfitNote({ pieces, occasion, season }) {
  const labels = pieces
    .filter((piece) => piece.name.trim() && piece.color.trim())
    .map(buildPieceLabel);

  if (labels.length === 0) {
    return "Add or confirm a few outfit pieces to generate a memory note.";
  }

  const pieceText =
    labels.length === 1
      ? labels[0]
      : `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;

  return `${pieceText}, suitable for a ${formatValue(occasion)} ${formatValue(
    season,
  )} look.`;
}

export function generateOutfitTitle({ pieces, occasion, season, style }) {
  const validPieces = pieces.filter((piece) => piece.name.trim());

  if (validPieces.length === 0) {
    return `New ${titleCase(occasion)} Outfit`;
  }

  const colors = validPieces
    .map((piece) => piece.color.trim().toLowerCase())
    .filter(Boolean);

  const accentColor =
    colors.find((color) => !neutralColors.has(color)) || colors[0] || "styled";

  const occasionLabel = titleCase(occasion);
  const seasonLabel = season === "all" ? "" : ` ${titleCase(season)}`;
  const styleLabel = style?.trim() ? `${titleCase(style)} ` : "";

  if (styleLabel) {
    return `${occasionLabel} ${styleLabel}Look`;
  }

  if (season === "all") {
    return `${occasionLabel} ${titleCase(accentColor)} Look`;
  }

  return `${occasionLabel} ${titleCase(accentColor)}${seasonLabel} Fit`;
}

export function deriveOutfitSourceType({ hasImage, hasText }) {
  if (hasImage) {
    return "image_upload";
  }

  if (hasText) {
    return "text_input";
  }

  return "manual_build";
}

function detectColor(segment) {
  return colorWords.find((color) => segment.includes(color)) || "";
}

function detectMatcher(segment) {
  return pieceMatchers.find((matcher) =>
    matcher.aliases.some((alias) => segment.includes(alias)),
  );
}

function normalizeSegment(text) {
  return text
    .toLowerCase()
    .replace(/[.]/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseOutfitDescription(text) {
  const normalizedText = normalizeSegment(text);

  if (!normalizedText) {
    return [];
  }

  const segments = normalizedText
    .split(/\bwith\b|\band\b|,/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  return segments
    .map((segment) => {
      const matcher = detectMatcher(segment);

      if (!matcher) {
        return null;
      }

      const color = detectColor(segment);
      const displayName = color
        ? `${titleCase(color)} ${matcher.name}`
        : matcher.name;

      return {
        name: displayName,
        category: matcher.category,
        color,
        role: matcher.slot,
      };
    })
    .filter(Boolean);
}
