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
    categories: [
      "dupatta",
      "stole",
      "scarf",
      "shawl",
      "saree_pallu",
    ],
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

const aliasEntries = {
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

const labelOverrides = {
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

const canonicalCategorySet = new Set(
  categoryGroups.flatMap((group) => group.categories),
);

const categorySectionMap = Object.fromEntries(
  categoryGroups.flatMap((group) =>
    group.categories.map((category) => [category, group.label]),
  ),
);

function sanitizeCategoryInput(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[\/]+/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

function slugifyCategory(value) {
  return sanitizeCategoryInput(value).replace(/\s+/g, "_");
}

function buildSearchTerms(category) {
  const label = formatCategoryLabel(category).toLowerCase();
  const baseTerms = [
    category,
    category.replace(/_/g, " "),
    label,
  ];
  const aliasTerms = Object.entries(aliasEntries)
    .filter(([, canonical]) => canonical === category)
    .map(([alias]) => alias);

  return [...new Set([...baseTerms, ...aliasTerms])];
}

export function normalizeCategory(value) {
  const cleaned = sanitizeCategoryInput(value);
  if (!cleaned) {
    return "other";
  }

  const directCanonical = cleaned.replace(/\s+/g, "_");
  if (canonicalCategorySet.has(directCanonical)) {
    return directCanonical;
  }

  if (aliasEntries[cleaned]) {
    return aliasEntries[cleaned];
  }

  return slugifyCategory(cleaned);
}

export function getCategorySection(value) {
  const normalized = normalizeCategory(value);
  return categorySectionMap[normalized] || "Other";
}

export function formatCategoryLabel(value) {
  const normalized = normalizeCategory(value);

  if (labelOverrides[normalized]) {
    return labelOverrides[normalized];
  }

  return normalized
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
  const cleanedInput = sanitizeCategoryInput(input);
  const options = getCategoryOptions().map((category) => ({
    value: category,
    label: formatCategoryLabel(category),
    section: getCategorySection(category),
    terms: buildSearchTerms(category),
  }));

  if (!cleanedInput) {
    return options;
  }

  return options
    .map((option) => {
      const directAlias = aliasEntries[cleanedInput] === option.value;
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

export const wardrobeSections = categoryGroups.map((group) => group.label);
