import {
  getOccasionOptions,
  getSeasonOptions,
  formatCategoryLabel,
  getCategoryOptions,
  getCategorySection,
  normalizeCategory,
  wardrobeSections,
} from "./wardrobeTaxonomy";

export const seasons = getSeasonOptions();

export const occasions = getOccasionOptions();

export const categories = getCategoryOptions();

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
    aliases: ["dress", "gown", "frock", "one piece", "one-piece"],
  },
  {
    category: "top",
    slot: "upper",
    name: "Top",
    aliases: ["top"],
  },
  {
    category: "kurta",
    slot: "upper",
    name: "Kurta",
    aliases: ["kurta", "kurta set", "kurta pajama", "kurta pyjama"],
  },
  {
    category: "kurti",
    slot: "upper",
    name: "Kurti",
    aliases: ["kurti", "kurthi"],
  },
  {
    category: "blouse",
    slot: "upper",
    name: "Blouse",
    aliases: ["blouse"],
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
    aliases: ["t shirt", "tee", "t-shirt", "tshirt", "tee shirt"],
  },
  {
    category: "pants",
    slot: "lower",
    name: "Pants",
    aliases: ["pant", "pants", "slacks", "bottoms", "lower"],
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
    category: "skirt",
    slot: "lower",
    name: "Skirt",
    aliases: ["skirt"],
  },
  {
    category: "lehenga",
    slot: "lower",
    name: "Lehenga",
    aliases: ["lehenga", "lehenga choli", "lengha", "ghagra choli"],
  },
  {
    category: "dupatta",
    slot: "accessory",
    name: "Dupatta",
    aliases: ["dupatta", "dupata", "chunni"],
  },
  {
    category: "trousers",
    slot: "lower",
    name: "Trousers",
    aliases: ["trousers"],
  },
  {
    category: "jacket",
    slot: "outerwear",
    name: "Jacket",
    aliases: ["jacket"],
  },
  {
    category: "hoodie",
    slot: "outerwear",
    name: "Hoodie",
    aliases: ["hoodie", "sweatshirt"],
  },
  {
    category: "blazer",
    slot: "outerwear",
    name: "Blazer",
    aliases: ["blazer"],
  },
  {
    category: "coat",
    slot: "outerwear",
    name: "Coat",
    aliases: ["coat"],
  },
  {
    category: "sweater",
    slot: "outerwear",
    name: "Sweater",
    aliases: ["sweater", "cardigan"],
  },
  {
    category: "shoes",
    slot: "footwear",
    name: "Shoes",
    aliases: ["shoes", "shoe", "heels", "formal shoe"],
  },
  {
    category: "sneakers",
    slot: "footwear",
    name: "Sneakers",
    aliases: ["sneakers", "sneaker"],
  },
  {
    category: "sandals",
    slot: "footwear",
    name: "Sandals",
    aliases: ["sandals", "sandal"],
  },
  {
    category: "juttis",
    slot: "footwear",
    name: "Juttis",
    aliases: ["juttis", "jutti", "juti"],
  },
  {
    category: "boots",
    slot: "footwear",
    name: "Boots",
    aliases: ["boots", "boot"],
  },
  {
    category: "loafers",
    slot: "footwear",
    name: "Loafers",
    aliases: ["loafers", "loafer"],
  },
  {
    category: "accessory",
    slot: "accessory",
    name: "Accessory",
    aliases: ["accessory", "glasses", "sunglasses", "necklace"],
  },
  {
    category: "watch",
    slot: "accessory",
    name: "Watch",
    aliases: ["watch"],
  },
  {
    category: "belt",
    slot: "accessory",
    name: "Belt",
    aliases: ["belt"],
  },
  {
    category: "bag",
    slot: "accessory",
    name: "Bag",
    aliases: ["bag", "purse", "backpack"],
  },
  {
    category: "cap",
    slot: "accessory",
    name: "Cap",
    aliases: ["cap"],
  },
  {
    category: "hat",
    slot: "accessory",
    name: "Hat",
    aliases: ["hat"],
  },
  {
    category: "scarf",
    slot: "accessory",
    name: "Scarf",
    aliases: ["scarf"],
  },
];

export function getWardrobeSection(category) {
  return getCategorySection(category);
}

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

function getColorMood(colors) {
  if (colors.some((color) => ["cream", "beige", "tan", "brown"].includes(color))) {
    return "warm neutral";
  }

  if (colors.some((color) => ["white", "black", "grey", "gray", "charcoal"].includes(color))) {
    return "neutral";
  }

  if (colors.some((color) => ["navy", "blue"].includes(color))) {
    return "deep blue";
  }

  if (colors.some((color) => ["olive", "green"].includes(color))) {
    return "soft olive";
  }

  if (colors.some((color) => ["maroon", "red"].includes(color))) {
    return "rich tone";
  }

  return "";
}

function getOccasionPhrase(occasion) {
  const phrases = {
    casual: "easy everyday",
    formal: "polished evening",
    college: "campus",
    party: "going-out",
    sports: "active",
    travel: "travel",
    traditional: "traditional",
  };

  return phrases[occasion] || formatValue(occasion);
}

function getSeasonPhrase(season) {
  const phrases = {
    summer: "light",
    winter: "cold-weather",
    rainy: "rainy-day",
    all: "",
  };

  return phrases[season] || formatValue(season);
}

function hasLayeringPieces(pieces) {
  return pieces.some((piece) => ["outerwear", "upper"].includes(piece.role)) && pieces.length >= 3;
}

export function generateOutfitNote({ pieces, occasion, season }) {
  const validPieces = pieces.filter((piece) => piece.name.trim());
  const colors = validPieces
    .map((piece) => piece.color.trim().toLowerCase())
    .filter(Boolean);
  const colorMood = getColorMood(colors);

  if (validPieces.length === 0) {
    return "A saved look worth coming back to.";
  }

  if (occasion === "travel") {
    return "Easy travel combination that keeps things simple.";
  }

  if (occasion === "college") {
    return colorMood
      ? `Easy ${colorMood} fit for long campus days.`
      : "Easy fit for long campus days.";
  }

  if (season === "winter" || season === "rainy") {
    return hasLayeringPieces(validPieces)
      ? "Light layering for colder evenings."
      : "A steady look for colder days.";
  }

  if (occasion === "formal" || occasion === "party") {
    return "A polished combination with a calm evening feel.";
  }

  if (colorMood) {
    return `Relaxed ${colorMood} combination you can keep returning to.`;
  }

  return "Relaxed combination built from pieces that work well together.";
}

export function generateOutfitTitle({ pieces, occasion, season, style }) {
  const validPieces = pieces.filter((piece) => piece.name.trim());

  if (validPieces.length === 0) {
    return `Saved ${titleCase(occasion)} look`;
  }

  const colors = validPieces
    .map((piece) => piece.color.trim().toLowerCase())
    .filter(Boolean);
  const colorMood = getColorMood(colors);
  const seasonPhrase = getSeasonPhrase(season);
  const occasionPhrase = getOccasionPhrase(occasion);
  const styleLabel = style?.trim().toLowerCase();

  if (occasion === "college" && season === "rainy") {
    return "Rainy campus fit";
  }

  if (occasion === "travel") {
    return season !== "all" ? `Easy ${formatValue(season)} travel combo` : "Easy travel combo";
  }

  if ((occasion === "formal" || occasion === "party") && season === "winter") {
    return "Dinner look from last winter";
  }

  if (colorMood === "warm neutral" && hasLayeringPieces(validPieces)) {
    return "Warm neutral layering";
  }

  if (styleLabel) {
    return `${titleCase(styleLabel)} ${occasionPhrase} look`;
  }

  if (seasonPhrase && occasionPhrase && occasion !== "casual") {
    return `${titleCase(seasonPhrase)} ${occasionPhrase} fit`;
  }

  if (colorMood) {
    return `${titleCase(colorMood)} ${validPieces.length >= 3 ? "layering" : "look"}`;
  }

  return `${titleCase(occasionPhrase)} combo`;
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
        category: normalizeCategory(matcher.category),
        color,
        role: matcher.slot,
      };
    })
    .filter(Boolean);
}

export { formatCategoryLabel, normalizeCategory, wardrobeSections };
