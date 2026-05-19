const categoryGroups = [
  {
    key: "western_upperwear",
    label: "Western upperwear",
    categories: [
      "shirt",
      "t_shirt",
      "top",
      "blouse",
      "crop_top",
      "tank_top",
      "camisole",
      "polo",
      "sweatshirt",
      "hoodie",
      "sweater",
      "cardigan",
      "corset_top",
      "tunic",
      "bodysuit",
    ],
  },
  {
    key: "western_lowerwear",
    label: "Western lowerwear",
    categories: [
      "pants",
      "jeans",
      "trousers",
      "shorts",
      "skirt",
      "leggings",
      "joggers",
      "cargo_pants",
      "palazzo",
      "culottes",
      "track_pants",
    ],
  },
  {
    key: "one_piece",
    label: "One-piece / Full body",
    categories: [
      "dress",
      "gown",
      "jumpsuit",
      "romper",
      "suit",
      "co_ord_set",
      "playsuit",
      "dungaree",
      "overalls",
    ],
  },
  {
    key: "outerwear",
    label: "Outerwear",
    categories: [
      "jacket",
      "blazer",
      "coat",
      "shrug",
      "denim_jacket",
      "leather_jacket",
      "trench_coat",
      "waistcoat",
      "vest",
      "overshirt",
    ],
  },
  {
    key: "indian_upperwear",
    label: "Indian upperwear",
    categories: [
      "kurta",
      "kurti",
      "anarkali_top",
      "choli",
      "saree_blouse",
      "ethnic_top",
      "angrakha",
      "sherwani",
      "nehru_jacket",
    ],
  },
  {
    key: "indian_lowerwear",
    label: "Indian lowerwear",
    categories: [
      "churidar",
      "salwar",
      "patiala",
      "dhoti_pants",
      "ethnic_pants",
      "lehenga_skirt",
      "ghagra",
      "sharara",
      "gharara",
      "ethnic_palazzo",
    ],
  },
  {
    key: "indian_full_outfit",
    label: "Indian full outfit",
    categories: [
      "saree",
      "lehenga",
      "salwar_suit",
      "churidar_set",
      "kurta_set",
      "kurti_set",
      "anarkali",
      "sharara_set",
      "gharara_set",
      "dhoti_set",
      "sherwani_set",
      "indo_western_set",
      "ethnic_gown",
    ],
  },
  {
    key: "drapes",
    label: "Drapes",
    categories: ["dupatta", "stole", "scarf", "shawl", "saree_pallu"],
  },
  {
    key: "footwear",
    label: "Footwear",
    categories: [
      "sneakers",
      "shoes",
      "sandals",
      "boots",
      "loafers",
      "heels",
      "flats",
      "slippers",
      "flip_flops",
      "formal_shoes",
      "ethnic_footwear",
      "juttis",
      "kolhapuris",
      "mojaris",
    ],
  },
  {
    key: "accessories",
    label: "Accessories",
    categories: [
      "watch",
      "belt",
      "bag",
      "handbag",
      "backpack",
      "clutch",
      "wallet",
      "cap",
      "hat",
      "sunglasses",
      "jewelry",
      "necklace",
      "earrings",
      "bracelet",
      "ring",
      "anklet",
      "hair_accessory",
      "brooch",
      "tie",
      "bow_tie",
      "accessory",
    ],
  },
  {
    key: "base_layers",
    label: "Base layers",
    categories: [
      "innerwear",
      "undershirt",
      "thermal",
      "slip",
      "camisole_inner",
      "shapewear",
    ],
  },
  {
    key: "activewear",
    label: "Activewear",
    categories: [
      "sports_tshirt",
      "sports_bra",
      "gym_top",
      "gym_shorts",
      "jersey",
      "tracksuit",
    ],
  },
  {
    key: "other",
    label: "Other",
    categories: ["other"],
  },
];

const categoryAliases = {
  tee: "t_shirt",
  tshirt: "t_shirt",
  "t-shirt": "t_shirt",
  "t shirt": "t_shirt",
  "tee shirt": "t_shirt",
  pant: "pants",
  trouser: "trousers",
  jean: "jeans",
  lower: "pants",
  bottom: "pants",
  bottoms: "pants",
  topwear: "top",
  upper: "shirt",
  frock: "dress",
  "one piece": "dress",
  "one-piece": "dress",
  coords: "co_ord_set",
  coord: "co_ord_set",
  "co ord": "co_ord_set",
  "co-ord": "co_ord_set",
  "co ord set": "co_ord_set",
  "co-ord set": "co_ord_set",
  "jumpsuit dress": "jumpsuit",
  shoe: "shoes",
  sneaker: "sneakers",
  trainer: "sneakers",
  trainers: "sneakers",
  slipper: "slippers",
  "flip flop": "flip_flops",
  "flip-flop": "flip_flops",
  "formal shoe": "formal_shoes",
  jutti: "juttis",
  juti: "juttis",
  mojari: "mojaris",
  kolhapuri: "kolhapuris",
  sari: "saree",
  "saree blouse": "saree_blouse",
  "blouse piece": "saree_blouse",
  pallu: "saree_pallu",
  chunni: "dupatta",
  dupata: "dupatta",
  "dupatta scarf": "dupatta",
  kurthi: "kurti",
  "kurta pajama": "kurta_set",
  "kurta pyjama": "kurta_set",
  "kurta set": "kurta_set",
  "kurti set": "kurti_set",
  "suit set": "salwar_suit",
  "salwar kameez": "salwar_suit",
  "salwar suit": "salwar_suit",
  chudidar: "churidar",
  "churidar set": "churidar_set",
  "anarkali dress": "anarkali",
  "anarkali suit": "anarkali",
  "lehenga choli": "lehenga",
  lengha: "lehenga",
  "ghagra choli": "lehenga",
  ghaghra: "ghagra",
  "sharara suit": "sharara_set",
  "gharara suit": "gharara_set",
  "dhoti kurta": "dhoti_set",
  "dhoti pants": "dhoti_pants",
  "sherwani kurta": "sherwani",
  "sherwani set": "sherwani_set",
  "nehru coat": "nehru_jacket",
  "ethnic gown": "ethnic_gown",
  "indo western": "indo_western_set",
  "indo-western": "indo_western_set",
  specs: "sunglasses",
  shades: "sunglasses",
  chain: "necklace",
  bangle: "bracelet",
  bangles: "bracelet",
  purse: "handbag",
  "hand bag": "handbag",
  "sling bag": "handbag",
  "clutch bag": "clutch",
};

const categoryLabelOverrides = {
  t_shirt: "T-shirt",
  crop_top: "Crop top",
  tank_top: "Tank top",
  co_ord_set: "Co-ord set",
  saree_blouse: "Saree blouse",
  saree_pallu: "Saree pallu",
  salwar_suit: "Salwar suit",
  kurta_set: "Kurta set",
  kurti_set: "Kurti set",
  churidar_set: "Churidar set",
  sharara_set: "Sharara set",
  gharara_set: "Gharara set",
  dhoti_set: "Dhoti set",
  indo_western_set: "Indo-western set",
  ethnic_gown: "Ethnic gown",
  lehenga_skirt: "Lehenga skirt",
  ethnic_footwear: "Ethnic footwear",
  sports_tshirt: "Sports T-shirt",
  sports_bra: "Sports bra",
  gym_top: "Gym top",
  gym_shorts: "Gym shorts",
  track_pants: "Track pants",
  cargo_pants: "Cargo pants",
  formal_shoes: "Formal shoes",
  flip_flops: "Flip-flops",
  camisole_inner: "Camisole inner",
  leather_jacket: "Leather jacket",
  denim_jacket: "Denim jacket",
  trench_coat: "Trench coat",
  nehru_jacket: "Nehru jacket",
  anarkali_top: "Anarkali top",
  ethnic_top: "Ethnic top",
  dhoti_pants: "Dhoti pants",
  ethnic_pants: "Ethnic pants",
  ethnic_palazzo: "Ethnic palazzo",
  bow_tie: "Bow tie",
  hair_accessory: "Hair accessory",
};

const colorOptions = [
  "black",
  "white",
  "off_white",
  "cream",
  "beige",
  "brown",
  "tan",
  "camel",
  "grey",
  "charcoal",
  "navy",
  "blue",
  "sky_blue",
  "denim_blue",
  "green",
  "olive",
  "sage",
  "mint",
  "red",
  "maroon",
  "burgundy",
  "pink",
  "blush",
  "peach",
  "yellow",
  "mustard",
  "orange",
  "purple",
  "lavender",
  "gold",
  "silver",
  "multicolor",
];

const colorAliases = {
  gray: "grey",
  "dark grey": "charcoal",
  "dark gray": "charcoal",
  "navy blue": "navy",
  "light blue": "sky_blue",
  denim: "denim_blue",
  "off white": "off_white",
  "off-white": "off_white",
  ivory: "off_white",
  neutral: "beige",
  nude: "beige",
  wine: "burgundy",
  mehroon: "maroon",
  "mehroon color": "maroon",
  golden: "gold",
  multi: "multicolor",
  "multi color": "multicolor",
  "multi-colour": "multicolor",
};

const seasonOptions = ["all", "summer", "winter", "rainy", "spring", "autumn"];

const seasonAliases = {
  "all season": "all",
  "all seasons": "all",
  everyday: "all",
  "year round": "all",
  monsoon: "rainy",
  rain: "rainy",
  fall: "autumn",
};

const occasionOptions = [
  "casual",
  "daily",
  "college",
  "formal",
  "interview",
  "office",
  "dinner",
  "party",
  "travel",
  "sports",
  "gym",
  "wedding",
  "festival",
  "traditional",
  "date",
  "vacation",
];

const occasionAliases = {
  everyday: "daily",
  "daily wear": "daily",
  "casual wear": "casual",
  campus: "college",
  class: "college",
  work: "office",
  workplace: "office",
  job: "office",
  marriage: "wedding",
  festive: "festival",
  ethnic: "traditional",
  function: "traditional",
  workout: "gym",
  "date night": "date",
  trip: "travel",
  holiday: "vacation",
};

const styleOptions = [
  "minimal",
  "classic",
  "streetwear",
  "ethnic",
  "traditional",
  "indo_western",
  "smart_casual",
  "sporty",
  "relaxed",
  "layered",
  "formal",
  "casual",
  "elegant",
  "boho",
  "vintage",
  "modern",
  "monochrome",
];

const styleAliases = {
  "smart casual": "smart_casual",
  "smart-casual": "smart_casual",
  "indo western": "indo_western",
  "indo-western": "indo_western",
  indian: "ethnic",
  desi: "ethnic",
  "traditional wear": "traditional",
  classy: "elegant",
  sports: "sporty",
  comfy: "relaxed",
  comfort: "relaxed",
  "black white": "monochrome",
  "black and white": "monochrome",
};

const formalityOptions = ["low", "medium", "high"];

const formalityAliases = {
  casual: "low",
  relaxed: "low",
  "semi formal": "medium",
  "semi-formal": "medium",
  "smart casual": "medium",
  formal: "high",
  "very formal": "high",
};

const fieldConfigs = {
  color: {
    options: colorOptions,
    aliases: colorAliases,
    labelOverrides: {
      off_white: "Off white",
      sky_blue: "Sky blue",
      denim_blue: "Denim blue",
    },
  },
  season: {
    options: seasonOptions,
    aliases: seasonAliases,
    labelOverrides: {
      all: "All season",
    },
  },
  occasion: {
    options: occasionOptions,
    aliases: occasionAliases,
  },
  style: {
    options: styleOptions,
    aliases: styleAliases,
    labelOverrides: {
      indo_western: "Indo-western",
      smart_casual: "Smart casual",
    },
  },
  formality: {
    options: formalityOptions,
    aliases: formalityAliases,
  },
};

const canonicalCategorySet = new Set(
  categoryGroups.flatMap((group) => group.categories),
);

const categorySectionMap = Object.fromEntries(
  categoryGroups.flatMap((group) =>
    group.categories.map((category) => [category, group.label]),
  ),
);

function sanitizeInput(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[\/]+/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

function slugifyValue(value) {
  return sanitizeInput(value).replace(/\s+/g, "_");
}

export function formatFieldLabel(value) {
  const normalized = slugifyValue(value);

  if (!normalized) {
    return "";
  }

  return normalized
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeWithConfig(value, config, emptyValue = "") {
  const cleaned = sanitizeInput(value);

  if (!cleaned) {
    return emptyValue;
  }

  const directCanonical = cleaned.replace(/\s+/g, "_");
  if (config.options.includes(directCanonical)) {
    return directCanonical;
  }

  if (config.aliases[cleaned]) {
    return config.aliases[cleaned];
  }

  return slugifyValue(cleaned);
}

function formatWithConfig(value, config, normalizeFn) {
  const normalized = normalizeFn(value);

  if (!normalized) {
    return "";
  }

  if (config.labelOverrides?.[normalized]) {
    return config.labelOverrides[normalized];
  }

  return formatFieldLabel(normalized);
}

function buildTermsForField(value, config, normalizeFn, formatFn) {
  const normalized = normalizeFn(value);

  if (!normalized) {
    return [];
  }

  const label = formatFn(normalized).toLowerCase();
  const baseTerms = [normalized, normalized.replace(/_/g, " "), label];
  const aliasTerms = Object.entries(config.aliases)
    .filter(([, canonical]) => canonical === normalized)
    .map(([alias]) => alias);

  return [...new Set([...baseTerms, ...aliasTerms])];
}

function getSuggestionsForField(input, config, normalizeFn, formatFn) {
  const cleanedInput = sanitizeInput(input);
  const options = config.options.map((option) => ({
    value: option,
    label: formatFn(option),
    terms: buildTermsForField(option, config, normalizeFn, formatFn),
  }));

  if (!cleanedInput) {
    return options;
  }

  return options
    .map((option) => {
      const directAlias = config.aliases[cleanedInput] === option.value;
      const exactTerm = option.terms.some((term) => term === cleanedInput);
      const startsWithTerm = option.terms.some((term) =>
        term.startsWith(cleanedInput),
      );
      const includesTerm = option.terms.some((term) =>
        term.includes(cleanedInput),
      );

      let score = -1;
      if (directAlias || exactTerm) {
        score = 3;
      } else if (startsWithTerm) {
        score = 2;
      } else if (includesTerm) {
        score = 1;
      }

      return { ...option, score };
    })
    .filter((option) => option.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.label.localeCompare(right.label);
    });
}

function getFieldConfig(field) {
  return fieldConfigs[field];
}

export function normalizeCategory(value) {
  const cleaned = sanitizeInput(value);
  if (!cleaned) {
    return "other";
  }

  const directCanonical = cleaned.replace(/\s+/g, "_");
  if (canonicalCategorySet.has(directCanonical)) {
    return directCanonical;
  }

  if (categoryAliases[cleaned]) {
    return categoryAliases[cleaned];
  }

  return slugifyValue(cleaned);
}

export function getCategorySection(value) {
  const normalized = normalizeCategory(value);
  return categorySectionMap[normalized] || "Other";
}

export function formatCategoryLabel(value) {
  const normalized = normalizeCategory(value);

  if (categoryLabelOverrides[normalized]) {
    return categoryLabelOverrides[normalized];
  }

  return formatFieldLabel(normalized);
}

export function getCategoryOptions() {
  return [...canonicalCategorySet];
}

export function getGroupedCategoryOptions() {
  return categoryGroups.map((group) => ({
    key: group.key,
    label: group.label,
    options: group.categories.map((category) => ({
      value: category,
      label: formatCategoryLabel(category),
      section: group.label,
    })),
  }));
}

export function getCategorySuggestions(input) {
  const cleanedInput = sanitizeInput(input);
  const options = getCategoryOptions().map((category) => ({
    value: category,
    label: formatCategoryLabel(category),
    section: getCategorySection(category),
    terms: getCategorySearchTerms(category),
  }));

  if (!cleanedInput) {
    return options;
  }

  return options
    .map((option) => {
      const directAlias = categoryAliases[cleanedInput] === option.value;
      const exactTerm = option.terms.some((term) => term === cleanedInput);
      const startsWithTerm = option.terms.some((term) =>
        term.startsWith(cleanedInput),
      );
      const includesTerm = option.terms.some((term) =>
        term.includes(cleanedInput),
      );

      let score = -1;
      if (directAlias || exactTerm) {
        score = 3;
      } else if (startsWithTerm) {
        score = 2;
      } else if (includesTerm) {
        score = 1;
      }

      return { ...option, score };
    })
    .filter((option) => option.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.label.localeCompare(right.label);
    });
}

export function getCategorySearchTerms(value) {
  const normalized = normalizeCategory(value);
  const label = formatCategoryLabel(normalized).toLowerCase();
  const baseTerms = [normalized, normalized.replace(/_/g, " "), label];
  const aliasTerms = Object.entries(categoryAliases)
    .filter(([, canonical]) => canonical === normalized)
    .map(([alias]) => alias);

  return [...new Set([...baseTerms, ...aliasTerms])];
}

export function normalizeColor(value) {
  return normalizeWithConfig(value, fieldConfigs.color);
}

export function normalizeSeason(value) {
  return normalizeWithConfig(value, fieldConfigs.season, "all");
}

export function normalizeOccasion(value) {
  return normalizeWithConfig(value, fieldConfigs.occasion, "casual");
}

export function normalizeStyle(value) {
  return normalizeWithConfig(value, fieldConfigs.style);
}

export function normalizeFormality(value) {
  return normalizeWithConfig(value, fieldConfigs.formality);
}

export function formatColorLabel(value) {
  return formatWithConfig(value, fieldConfigs.color, normalizeColor);
}

export function formatSeasonLabel(value) {
  return formatWithConfig(value, fieldConfigs.season, normalizeSeason);
}

export function formatOccasionLabel(value) {
  return formatWithConfig(value, fieldConfigs.occasion, normalizeOccasion);
}

export function formatStyleLabel(value) {
  return formatWithConfig(value, fieldConfigs.style, normalizeStyle);
}

export function formatFormalityLabel(value) {
  return formatWithConfig(value, fieldConfigs.formality, normalizeFormality);
}

export function getColorOptions() {
  return [...fieldConfigs.color.options];
}

export function getSeasonOptions() {
  return [...fieldConfigs.season.options];
}

export function getOccasionOptions() {
  return [...fieldConfigs.occasion.options];
}

export function getStyleOptions() {
  return [...fieldConfigs.style.options];
}

export function getFormalityOptions() {
  return [...fieldConfigs.formality.options];
}

export function getFieldSuggestions(field, input) {
  const config = getFieldConfig(field);

  if (!config) {
    return [];
  }

  const helpers = {
    color: [normalizeColor, formatColorLabel],
    season: [normalizeSeason, formatSeasonLabel],
    occasion: [normalizeOccasion, formatOccasionLabel],
    style: [normalizeStyle, formatStyleLabel],
    formality: [normalizeFormality, formatFormalityLabel],
  };

  const [normalizeFn, formatFn] = helpers[field];
  return getSuggestionsForField(input, config, normalizeFn, formatFn);
}

export function getFieldSearchTerms(field, value) {
  const config = getFieldConfig(field);

  if (!config) {
    return [];
  }

  const helpers = {
    color: [normalizeColor, formatColorLabel],
    season: [normalizeSeason, formatSeasonLabel],
    occasion: [normalizeOccasion, formatOccasionLabel],
    style: [normalizeStyle, formatStyleLabel],
    formality: [normalizeFormality, formatFormalityLabel],
  };

  const [normalizeFn, formatFn] = helpers[field];
  return buildTermsForField(value, config, normalizeFn, formatFn);
}

export const wardrobeSections = categoryGroups.map((group) => group.label);
