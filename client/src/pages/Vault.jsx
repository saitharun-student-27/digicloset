import { ArrowUpDown, ChevronDown, Plus, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ClothingCard from "../components/ClothingCard";
import ErrorState from "../components/ErrorState";
import OutfitEditModal from "../components/OutfitEditModal";
import OutfitShowcaseCard from "../components/OutfitShowcaseCard";
import { useWardrobeData } from "../context/WardrobeDataProvider.jsx";
import { getImageUrl } from "../services/clothingService";
import { getWardrobeSection, wardrobeSections } from "../utils/outfitUtils";
import {
  formatCategoryLabel,
  getCategorySearchTerms,
  getCategorySection,
  getFieldSearchTerms,
  normalizeSeason,
  wardrobeSections as taxonomyWardrobeSections,
} from "../utils/wardrobeTaxonomy";

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[2.5rem] items-center justify-center rounded-full border px-3.5 py-2 text-[13px] font-medium whitespace-nowrap transition sm:min-h-[2.625rem] ${
        active
          ? "border-charcoal bg-charcoal text-ivory shadow-soft"
          : "border-[#e5dac9] bg-white/88 text-charcoal hover:bg-linen"
      }`}
    >
      {label}
    </button>
  );
}

function FilterRow({ label, options, value, onChange, formatLabel = (item) => item.label }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone">
        {label}
      </p>
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex min-w-max gap-2 pr-1">
          {options.map((option) => (
            <FilterChip
              key={option.value}
              label={formatLabel(option)}
              active={value === option.value}
              onClick={() => onChange(option.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");
}

function buildSearchTerms(query) {
  return normalizeSearchText(query)
    .split(" ")
    .filter(Boolean);
}

function matchesSearch(haystack, query) {
  const normalizedHaystack = normalizeSearchText(haystack);
  const terms = buildSearchTerms(query);

  if (terms.length === 0) {
    return true;
  }

  return terms.every((term) => normalizedHaystack.includes(term));
}

function collectPieceSearchText(item) {
  return [
    item.name,
    ...getCategorySearchTerms(item.category),
    getCategorySection(item.category),
    item.color,
    ...getFieldSearchTerms("color", item.color),
    item.season,
    ...getFieldSearchTerms("season", item.season),
    item.occasion,
    ...getFieldSearchTerms("occasion", item.occasion),
    item.style,
    ...getFieldSearchTerms("style", item.style),
    item.formality_level,
    ...getFieldSearchTerms("formality", item.formality_level),
    item.source_type,
  ]
    .filter(Boolean)
    .join(" ");
}

function collectOutfitSearchText(outfit) {
  const pieceSearchText = (outfit.outfit_items || [])
    .flatMap((piece) => {
      const clothingItem = piece?.clothing_item || {};
      return [
        clothingItem.name,
        ...getCategorySearchTerms(clothingItem.category),
        getCategorySection(clothingItem.category),
        clothingItem.color,
        ...getFieldSearchTerms("color", clothingItem.color),
      ];
    })
    .filter(Boolean)
    .join(" ");

  return [
    outfit.title,
    outfit.description,
    outfit.occasion,
    ...getFieldSearchTerms("occasion", outfit.occasion),
    outfit.season,
    ...getFieldSearchTerms("season", outfit.season),
    outfit.style,
    ...getFieldSearchTerms("style", outfit.style),
    outfit.source_type,
    pieceSearchText,
  ]
    .filter(Boolean)
    .join(" ");
}

function sectionIdForLabel(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function getSortableDateValue(value) {
  const parsed = Date.parse(value || "");
  return Number.isNaN(parsed) ? null : parsed;
}

function sortOutfits(outfits, sortBy) {
  const withIndex = outfits.map((outfit, index) => ({ outfit, index }));

  withIndex.sort((left, right) => {
    if (sortBy === "favorites") {
      if (Boolean(left.outfit.is_favorite) !== Boolean(right.outfit.is_favorite)) {
        return left.outfit.is_favorite ? -1 : 1;
      }
    }

    if (sortBy === "recently_worn") {
      const leftWorn = getSortableDateValue(left.outfit.last_worn_date);
      const rightWorn = getSortableDateValue(right.outfit.last_worn_date);

      if (leftWorn !== rightWorn) {
        if (leftWorn === null) return 1;
        if (rightWorn === null) return -1;
        return rightWorn - leftWorn;
      }
    }

    if (sortBy === "alphabetical") {
      return (left.outfit.title || "").localeCompare(right.outfit.title || "");
    }

    const leftCreated = getSortableDateValue(left.outfit.created_at);
    const rightCreated = getSortableDateValue(right.outfit.created_at);

    if (leftCreated !== rightCreated) {
      if (leftCreated === null) return 1;
      if (rightCreated === null) return -1;
      return rightCreated - leftCreated;
    }

    return left.index - right.index;
  });

  return withIndex.map((entry) => entry.outfit);
}

function sortPieces(items, sortBy) {
  const withIndex = items.map((item, index) => ({ item, index }));

  withIndex.sort((left, right) => {
    if (sortBy === "alphabetical") {
      return (left.item.name || "").localeCompare(right.item.name || "");
    }

    if (sortBy === "recently_worn") {
      const leftWorn = getSortableDateValue(left.item.last_worn_date);
      const rightWorn = getSortableDateValue(right.item.last_worn_date);

      if (leftWorn !== rightWorn) {
        if (leftWorn === null) return 1;
        if (rightWorn === null) return -1;
        return rightWorn - leftWorn;
      }
    }

    const leftCreated = getSortableDateValue(left.item.created_at);
    const rightCreated = getSortableDateValue(right.item.created_at);

    if (leftCreated !== rightCreated) {
      if (leftCreated === null) return 1;
      if (rightCreated === null) return -1;
      return rightCreated - leftCreated;
    }

    return left.index - right.index;
  });

  return withIndex.map((entry) => entry.item);
}

function outfitMatchesSection(outfit, section) {
  if (section === "all_sections") {
    return true;
  }

  return (outfit.outfit_items || []).some(
    (item) => getCategorySection(item?.clothing_item?.category) === section,
  );
}

function pieceMatchesSection(item, section) {
  if (section === "all_sections") {
    return true;
  }

  return getCategorySection(item.category) === section;
}

function matchesSeasonFilter(value, seasonFilter) {
  if (seasonFilter === "all_seasons") {
    return true;
  }

  return normalizeSeason(value) === seasonFilter;
}

function getSectionPreviewImages(items) {
  return items
    .map((item) => item?.image_url)
    .filter(Boolean)
    .slice(0, 3)
    .map((url) => getImageUrl(url));
}

function EditorialRailSection({
  id,
  eyebrow,
  title,
  description,
  items,
  emptyMessage,
  renderItem,
  cardClassName = "memory-rail-card",
}) {
  return (
    <section id={id} className="section-surface overflow-hidden p-4 sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1.5 font-serif text-[1.45rem] leading-tight text-charcoal sm:text-[1.65rem]">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone">{description}</p>
          ) : null}
        </div>
        <span className="rounded-full bg-ivory px-3 py-1 text-[11px] font-medium text-stone">
          {items.length}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="memory-rail pb-1 pt-1">
          {items.map((item, index) => (
            <div key={item.id || index} className={cardClassName}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.65rem] border border-dashed border-[#ddd0bc] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(248,245,238,0.98)_100%)] px-5 py-6 text-sm leading-6 text-stone">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}

function WardrobeZoneSection({
  id,
  title,
  description,
  items,
  emptyMessage,
  onEdit,
  onDelete,
  isBusy,
}) {
  const previewImages = getSectionPreviewImages(items);
  const leadImage = previewImages[0] || "";
  const leadItem = items[0] || null;

  return (
    <section id={id} className="section-surface overflow-hidden p-3 sm:p-4">
      <div className="grid gap-4 rounded-[1.7rem] border border-[#e6dac7] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,245,238,0.98)_100%)] p-4 md:grid-cols-[14rem_minmax(0,1fr)] md:items-start">
        <div className="space-y-3.5">
          <div className="overflow-hidden rounded-[1.65rem] border border-[#e7dccb] bg-[linear-gradient(135deg,#f5efe5_0%,#fbf8f3_100%)]">
            <div className="relative grid min-h-[8.5rem] grid-cols-[7.75rem_minmax(0,1fr)] overflow-hidden md:block md:aspect-[4/4.45] md:min-h-0">
              {leadImage ? (
                <img
                  src={leadImage}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-sm leading-6 text-stone">
                  Pieces you save here will gather into a calmer closet zone.
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 hidden bg-[linear-gradient(180deg,transparent_0%,rgba(29,29,27,0.42)_100%)] px-4 py-4 md:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                  Closet zone
                </p>
                <p className="mt-1 font-serif text-[1.2rem] leading-tight text-white">
                  {title}
                </p>
              </div>
              <div className="flex flex-col justify-center px-4 py-3 md:hidden">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
                  Closet zone
                </p>
                <p className="mt-1 font-serif text-[1.15rem] leading-tight text-charcoal">
                  {title}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm leading-6 text-stone">{description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-stone shadow-sm">
                {items.length} saved
              </span>
              {leadItem ? (
                <span className="rounded-full bg-ivory px-3 py-1.5 text-[11px] font-medium text-stone shadow-sm">
                  {formatCategoryLabel(leadItem.category)}
                </span>
              ) : null}
            </div>

            {previewImages.length > 1 ? (
              <div className="flex items-center gap-2">
                {previewImages.slice(0, 3).map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#e1d5c3] bg-white shadow-sm"
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {items.length > 0 ? (
          <div className="memory-rail pb-1 pt-1">
            {items.map((item) => (
              <div key={item.id} className="piece-rail-card">
                <ClothingCard
                  item={item}
                  onEdit={() => onEdit(item)}
                  onDelete={onDelete}
                  isBusy={isBusy(item.id)}
                  showActions={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center">
            <div className="w-full rounded-[1.6rem] border border-dashed border-[#ddd0bc] bg-white/92 px-5 py-6 text-sm leading-6 text-stone">
              {emptyMessage}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Vault() {
  const navigate = useNavigate();
  const {
    clothingItems,
    outfits,
    clothingLoading,
    outfitsLoading,
    clothingError,
    outfitsError,
    deletePiece,
    deleteOutfit,
    favoriteOutfit,
    markOutfitWorn,
    updateOutfit,
    refreshAll,
    isOutfitPending,
    isPiecePending,
  } = useWardrobeData();
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [pageError, setPageError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [contentFilter, setContentFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all_sections");
  const [seasonFilter, setSeasonFilter] = useState("all_seasons");
  const [sortBy, setSortBy] = useState("recent");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterPanelRef = useRef(null);
  const filterButtonRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!isFilterOpen) {
        return;
      }

      if (filterPanelRef.current?.contains(event.target)) {
        return;
      }

      if (filterButtonRef.current?.contains(event.target)) {
        return;
      }

      setIsFilterOpen(false);
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsFilterOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isFilterOpen]);

  async function handleDeleteClothing(item) {
    if (!window.confirm(`Delete "${item.name}"?`)) {
      return;
    }

    try {
      setPageError("");
      await deletePiece(item.id);
    } catch (error) {
      setPageError(
        error?.response?.data?.detail ||
          "This piece could not be deleted safely.",
      );
    }
  }

  async function handleDeleteOutfit(outfit) {
    if (!window.confirm(`Delete "${outfit.title}"?`)) {
      return;
    }

    try {
      setPageError("");
      await deleteOutfit(outfit.id);
    } catch (error) {
      setPageError(
        error?.response?.data?.detail || "Could not delete that outfit.",
      );
    }
  }

  async function handleFavorite(outfit) {
    try {
      setPageError("");
      await favoriteOutfit(outfit.id);
    } catch (error) {
      setPageError(
        error?.response?.data?.detail ||
          "Could not update favorites right now.",
      );
    }
  }

  async function handleMarkWorn(outfit) {
    try {
      setPageError("");
      await markOutfitWorn(outfit.id);
    } catch (error) {
      setPageError(
        error?.response?.data?.detail ||
          "Could not mark that outfit worn right now.",
      );
    }
  }

  async function handleSaveEdit(payload) {
    setIsSavingEdit(true);
    try {
      await updateOutfit(editingOutfit.id, payload);
      setEditingOutfit(null);
      setPageError("");
    } catch (error) {
      setPageError(
        error?.response?.data?.detail || "Could not save outfit changes.",
      );
    } finally {
      setIsSavingEdit(false);
    }
  }

  const sortedOutfits = useMemo(() => sortOutfits(outfits, sortBy), [outfits, sortBy]);
  const sortedClothingItems = useMemo(
    () => sortPieces(clothingItems, sortBy),
    [clothingItems, sortBy],
  );

  const groupedItems = useMemo(() => {
    const base = Object.fromEntries(
      wardrobeSections.map((section) => [section, []]),
    );

    sortedClothingItems.forEach((item) => {
      base[getWardrobeSection(item.category)].push(item);
    });

    return base;
  }, [sortedClothingItems]);

  const favoriteOutfits = useMemo(
    () => sortedOutfits.filter((outfit) => outfit.is_favorite),
    [sortedOutfits],
  );
  const allOutfitMemories = sortedOutfits;
  const visibleWardrobeSections = useMemo(
    () => wardrobeSections.filter((section) => groupedItems[section].length > 0),
    [groupedItems],
  );
  const trimmedSearch = searchQuery.trim();
  const isSearchActive = trimmedSearch.length > 0;
  const hasActiveFilters =
    contentFilter !== "all" ||
    sectionFilter !== "all_sections" ||
    seasonFilter !== "all_seasons";
  const activeFilterCount = Number(contentFilter !== "all") +
    Number(sectionFilter !== "all_sections") +
    Number(seasonFilter !== "all_seasons");
  const hasNonDefaultControls = hasActiveFilters || sortBy !== "recent" || isSearchActive;
  const isFilteredMode = isSearchActive || hasActiveFilters;
  const contentOptions = [
    { value: "all", label: "All" },
    { value: "outfits", label: "Outfit memories" },
    { value: "pieces", label: "Wardrobe pieces" },
  ];
  const sectionOptions = [
    { value: "all_sections", label: "All sections" },
    ...taxonomyWardrobeSections
      .filter((section) => section !== "Base layers")
      .map((section) => ({ value: section, label: section })),
  ];
  const seasonOptions = [
    { value: "all_seasons", label: "All seasons" },
    { value: "summer", label: "Summer" },
    { value: "winter", label: "Winter" },
    { value: "rainy", label: "Rainy" },
    { value: "spring", label: "Spring" },
    { value: "autumn", label: "Autumn" },
  ];
  const sortOptions = [
    { value: "recent", label: "Recently added" },
    { value: "recently_worn", label: "Recently worn" },
    { value: "favorites", label: "Favorites first" },
    { value: "alphabetical", label: "A-Z" },
  ];

  const matchingOutfits = useMemo(
    () =>
      sortedOutfits.filter((outfit) => {
        if (isSearchActive && !matchesSearch(collectOutfitSearchText(outfit), trimmedSearch)) {
          return false;
        }

        if (!outfitMatchesSection(outfit, sectionFilter)) {
          return false;
        }

        if (!matchesSeasonFilter(outfit.season, seasonFilter)) {
          return false;
        }

        return true;
      }),
    [sortedOutfits, isSearchActive, trimmedSearch, sectionFilter, seasonFilter],
  );
  const matchingPieces = useMemo(
    () =>
      sortedClothingItems.filter((item) => {
        if (isSearchActive && !matchesSearch(collectPieceSearchText(item), trimmedSearch)) {
          return false;
        }

        if (!pieceMatchesSection(item, sectionFilter)) {
          return false;
        }

        if (!matchesSeasonFilter(item.season, seasonFilter)) {
          return false;
        }

        return true;
      }),
    [sortedClothingItems, isSearchActive, trimmedSearch, sectionFilter, seasonFilter],
  );
  const showOutfitResults = contentFilter !== "pieces";
  const showPieceResults = contentFilter !== "outfits";
  const visibleOutfitCount = showOutfitResults ? matchingOutfits.length : 0;
  const visiblePieceCount = showPieceResults ? matchingPieces.length : 0;
  const hasVisibleMatches = visibleOutfitCount > 0 || visiblePieceCount > 0;
  const isLoading = outfitsLoading || clothingLoading;
  const loadError = pageError || outfitsError || clothingError;

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100dvh-10rem)] items-center justify-center px-4">
        <p className="text-stone">Loading your wardrobe...</p>
      </div>
    );
  }

  return (
    <main className="page-shell max-w-[54rem]">
      {loadError ? (
        <div className="mb-6">
          <ErrorState
            title="Something needs attention"
            message={loadError}
            onRetry={() => {
              setPageError("");
              refreshAll().catch(() => {});
            }}
          />
        </div>
      ) : null}

      <section className="section-surface overflow-hidden p-3 sm:p-4">
        <div className="rounded-[1.95rem] border border-[#e6dac8] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,245,238,0.98)_100%)] px-4 py-4 text-center sm:px-6 sm:py-5">
          <div className="mx-auto max-w-[30rem]">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/88 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-stone shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-brass" />
              Wardrobe
            </div>
            <h1 className="mt-3.5 font-serif text-[1.75rem] leading-[1.04] text-charcoal sm:text-[2rem]">
              Your closet, remembered.
            </h1>
            <p className="mt-2.5 text-sm leading-6 text-stone">
              Saved outfit memories stay close, while individual pieces settle into
              calmer closet zones around them.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/outfit-memory"
              className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition hover:bg-softblack"
            >
              <Sparkles className="h-4 w-4" /> Save Outfit Memory
            </Link>
            <Link
              to="/outfit-memory"
              className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-charcoal shadow-soft transition hover:bg-linen"
            >
              <Plus className="h-4 w-4" /> Quick Add Piece
            </Link>
          </div>
        </div>
      </section>

      <section className="section-surface mt-4 overflow-visible p-3 sm:p-4">
        <div className="rounded-[1.85rem] border border-[#e7dccb] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,245,238,0.98)_100%)] p-4 sm:p-5">
          <div className="space-y-4">
            <div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search outfits, pieces, colors, categories..."
                  className="h-12 min-h-[var(--touch-target-min)] w-full rounded-full border border-[#e0d4c0] bg-white pl-11 pr-12 text-sm text-charcoal shadow-soft outline-none transition placeholder:text-stone/70 focus:border-sage/40 focus:ring-4 focus:ring-sage/10"
                  aria-label="Search outfits, pieces, colors, and categories"
                />
                {isSearchActive ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1.5 top-1/2 flex h-9 min-h-[var(--touch-target-min)] w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ivory text-charcoal transition hover:bg-linen"
                    aria-label="Clear wardrobe search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-6 text-stone">
                Search by outfit title, color, category, season, occasion, or the
                pieces inside a saved look.
              </p>
            </div>

            <div className="relative border-t border-[#eadfce] pt-4" ref={filterPanelRef}>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  ref={filterButtonRef}
                  type="button"
                  onClick={() => setIsFilterOpen((value) => !value)}
                  className={`inline-flex h-10 min-h-[var(--touch-target-min)] items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition ${
                    isFilterOpen || activeFilterCount > 0
                      ? "border-charcoal bg-charcoal text-ivory shadow-soft"
                      : "border-[#e0d4c0] bg-white text-charcoal hover:bg-linen"
                  }`}
                  aria-expanded={isFilterOpen}
                  aria-controls="wardrobe-filter-panel"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilterCount > 0 ? `Filter · ${activeFilterCount}` : "Filter"}
                  <ChevronDown
                    className={`h-4 w-4 transition ${isFilterOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="h-10 min-h-[var(--touch-target-min)] min-w-0 flex-1 rounded-full border border-[#e0d4c0] bg-white px-4 text-sm text-charcoal shadow-soft outline-none transition focus:border-sage/40 focus:ring-4 focus:ring-sage/10 sm:max-w-[14rem]"
                    aria-label="Sort wardrobe content"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {hasNonDefaultControls ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setContentFilter("all");
                      setSectionFilter("all_sections");
                      setSeasonFilter("all_seasons");
                      setSortBy("recent");
                      setIsFilterOpen(false);
                    }}
                    className="inline-flex h-10 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-ivory px-3.5 text-sm font-medium text-charcoal transition hover:bg-linen"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>

                {isFilterOpen ? (
                  <div
                    id="wardrobe-filter-panel"
                    className="z-30 mt-3 rounded-[1.55rem] border border-[#e7dccb] bg-white/95 p-4 shadow-soft backdrop-blur sm:absolute sm:left-0 sm:right-auto sm:mt-2 sm:w-[min(32rem,calc(100vw-3rem))]"
                  >
                  <div className="space-y-4">
                    <FilterRow
                      label="Content"
                      options={contentOptions}
                      value={contentFilter}
                      onChange={setContentFilter}
                    />
                    <FilterRow
                      label="Section"
                      options={sectionOptions}
                      value={sectionFilter}
                      onChange={setSectionFilter}
                    />
                    <FilterRow
                      label="Season"
                      options={seasonOptions}
                      value={seasonFilter}
                      onChange={setSeasonFilter}
                    />

                    <div className="flex items-center justify-between border-t border-[#eadfce] pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setContentFilter("all");
                          setSectionFilter("all_sections");
                          setSeasonFilter("all_seasons");
                        }}
                        className="text-sm font-medium text-stone transition hover:text-charcoal"
                      >
                        Clear filters
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFilterOpen(false)}
                        className="inline-flex h-10 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-charcoal px-4 text-sm font-medium text-ivory transition hover:bg-softblack"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {isFilteredMode ? (
        <section className="mt-4 section-surface overflow-hidden p-3 sm:p-4">
          <div className="rounded-[1.65rem] bg-linen px-4 py-3 text-sm leading-6 text-stone">
            {visibleOutfitCount} outfit
            {visibleOutfitCount === 1 ? "" : "s"} and {visiblePieceCount} piece
            {visiblePieceCount === 1 ? "" : "s"}
            {isSearchActive ? (
              <>
                {" "}match{" "}
                <span className="font-medium text-charcoal">{`"${trimmedSearch}"`}</span>.
              </>
            ) : (
              <> fit your current filters.</>
            )}
          </div>
        </section>
      ) : null}

      {isFilteredMode ? (
        hasVisibleMatches ? (
          <div className="mt-5 space-y-5 sm:space-y-6">
            {showOutfitResults ? (
              <EditorialRailSection
                id="matching-outfits"
                eyebrow="Filtered view"
                title="Matching Outfit Memories"
                description="Saved looks that match your current search, filters, and sort without losing the calm closet rhythm."
                items={matchingOutfits}
                emptyMessage="No matching outfit memories."
                cardClassName="memory-rail-card"
                renderItem={(outfit) => (
                  <OutfitShowcaseCard
                    outfit={outfit}
                    onFavorite={handleFavorite}
                    onMarkWorn={handleMarkWorn}
                    onEdit={setEditingOutfit}
                    onDelete={handleDeleteOutfit}
                    isBusy={isOutfitPending(outfit.id)}
                    showMeta={false}
                  />
                )}
              />
            ) : null}

            {showPieceResults ? (
              <EditorialRailSection
                id="matching-pieces"
                eyebrow="Filtered view"
                title="Matching Wardrobe Pieces"
                description="Pieces matching by name, color, category, section, season, occasion, style, or formality."
                items={matchingPieces}
                emptyMessage="No matching wardrobe pieces."
                cardClassName="piece-rail-card"
                renderItem={(item) => (
                  <ClothingCard
                    item={item}
                    onEdit={() => navigate(`/pieces/${item.id}`)}
                    onDelete={handleDeleteClothing}
                    isBusy={isPiecePending(item.id)}
                    showActions={false}
                  />
                )}
              />
            ) : null}
          </div>
        ) : (
          <section className="section-surface mt-5 p-5 sm:p-6">
            <div className="rounded-[1.6rem] border border-dashed border-[#ddd0bc] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(248,245,238,0.98)_100%)] px-5 py-8 text-center">
              <h2 className="font-serif text-2xl text-charcoal">
                {contentFilter === "outfits"
                  ? "No matching outfit memories."
                  : contentFilter === "pieces"
                    ? "No matching wardrobe pieces."
                    : "No matching wardrobe memories."}
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone">
                Try clearing a filter or searching by color, category, outfit title, or occasion.
              </p>
            </div>
          </section>
        )
      ) : (
        <div className="mt-5 space-y-5 sm:space-y-6">
          <EditorialRailSection
            id="favorite-fits"
            eyebrow="Memories"
            title="Favorite Fits"
            description="The combinations you already trust most, kept close before the rest of the closet opens up."
            items={favoriteOutfits}
            emptyMessage="Favorite a few outfit memories and this rail will quietly keep them within easy reach."
            cardClassName="memory-rail-card"
            renderItem={(outfit) => (
              <OutfitShowcaseCard
                outfit={outfit}
                onFavorite={handleFavorite}
                onMarkWorn={handleMarkWorn}
                onEdit={setEditingOutfit}
                onDelete={handleDeleteOutfit}
                isBusy={isOutfitPending(outfit.id)}
                showMeta={false}
                supportingText="Saved as a trusted combination."
              />
            )}
          />

          <EditorialRailSection
            id="outfit-memories"
            eyebrow="Memories"
            title="Saved Outfit Memories"
            description="Your full saved outfit rotation stays visible here, so real combinations keep leading the closet."
            items={allOutfitMemories}
            emptyMessage="No outfit memories yet. Save a complete look first and the wardrobe will organize itself around real combinations."
            cardClassName="memory-rail-card"
            renderItem={(outfit) => (
              <OutfitShowcaseCard
                outfit={outfit}
                onFavorite={handleFavorite}
                onMarkWorn={handleMarkWorn}
                onEdit={setEditingOutfit}
                onDelete={handleDeleteOutfit}
                isBusy={isOutfitPending(outfit.id)}
                showMeta={false}
              />
            )}
          />

          {visibleWardrobeSections.length > 0 ? (
            visibleWardrobeSections.map((section, index) => (
              <WardrobeZoneSection
                key={section}
                id={sectionIdForLabel(section)}
                title={section}
                description={
                  index === 0
                    ? "Your wardrobe opens into calmer sections here, using real saved pieces instead of dashboard categories."
                    : "Supporting pieces grouped calmly by section, so the closet stays easy to browse without drifting into inventory mode."
                }
                items={groupedItems[section]}
                emptyMessage={`No ${section.toLowerCase()} saved yet. Add pieces through outfit memory and DigiCloset will place them here automatically.`}
                onEdit={(item) => navigate(`/pieces/${item.id}`)}
                onDelete={handleDeleteClothing}
                isBusy={isPiecePending}
              />
            ))
          ) : (
            <section className="section-surface overflow-hidden p-5 sm:p-6">
              <div className="rounded-[1.65rem] border border-dashed border-[#ddd0bc] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(248,245,238,0.98)_100%)] px-5 py-8 text-center">
                <h2 className="font-serif text-2xl text-charcoal">
                  Your closet is still waiting for its first pieces.
                </h2>
                <p className="mt-3 text-sm leading-6 text-stone">
                  Save a look or add a piece, and DigiCloset will begin arranging
                  your wardrobe into calmer sections here.
                </p>
              </div>
            </section>
          )}
        </div>
      )}

      <OutfitEditModal
        outfit={editingOutfit}
        isOpen={Boolean(editingOutfit)}
        isSaving={isSavingEdit}
        onClose={() => setEditingOutfit(null)}
        onSubmit={handleSaveEdit}
      />
    </main>
  );
}
