import { Plus, Search, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ClothingCard from "../components/ClothingCard";
import ErrorState from "../components/ErrorState";
import OutfitEditModal from "../components/OutfitEditModal";
import OutfitShowcaseCard from "../components/OutfitShowcaseCard";
import { useWardrobeData } from "../context/WardrobeDataProvider.jsx";
import { getWardrobeSection, wardrobeSections } from "../utils/outfitUtils";
import {
  formatCategoryLabel,
  getCategorySection,
  normalizeCategory,
} from "../utils/wardrobeTaxonomy";

function RailSection({
  id,
  title,
  description,
  items,
  emptyMessage,
  renderItem,
  cardClassName = "memory-rail-card",
}) {
  return (
    <section id={id} className="section-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-stone">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone">{description}</p>
          ) : null}
        </div>
        <span className="text-xs font-medium text-stone/60">
          {items.length} saved
        </span>
      </div>

      {items.length > 0 ? (
        <div className="memory-rail pt-2">
          {items.map((item, index) => (
            <div key={item.id || index} className={cardClassName}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-black/10 bg-white px-5 py-6 text-sm leading-6 text-stone">
          {emptyMessage}
        </div>
      )}
    </section>
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
  const normalizedCategory = normalizeCategory(item.category);
  const categoryLabel = formatCategoryLabel(item.category);
  const section = getCategorySection(item.category);

  return [
    item.name,
    item.category,
    normalizedCategory,
    categoryLabel,
    section,
    item.color,
    item.season,
    item.occasion,
    item.style,
    item.formality_level,
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
        clothingItem.category,
        normalizeCategory(clothingItem.category),
        formatCategoryLabel(clothingItem.category),
        getCategorySection(clothingItem.category),
        clothingItem.color,
      ];
    })
    .filter(Boolean)
    .join(" ");

  return [
    outfit.title,
    outfit.description,
    outfit.occasion,
    outfit.season,
    outfit.style,
    outfit.source_type,
    pieceSearchText,
  ]
    .filter(Boolean)
    .join(" ");
}

function sectionIdForLabel(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
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

  const groupedItems = useMemo(() => {
    const base = Object.fromEntries(
      wardrobeSections.map((section) => [section, []]),
    );

    clothingItems.forEach((item) => {
      base[getWardrobeSection(item.category)].push(item);
    });

    return base;
  }, [clothingItems]);

  const favoriteOutfits = outfits.filter((outfit) => outfit.is_favorite);
  const allOutfitMemories = outfits;
  const trimmedSearch = searchQuery.trim();
  const isSearchActive = trimmedSearch.length > 0;
  const matchingOutfits = useMemo(
    () =>
      outfits.filter((outfit) =>
        matchesSearch(collectOutfitSearchText(outfit), trimmedSearch),
      ),
    [outfits, trimmedSearch],
  );
  const matchingPieces = useMemo(
    () =>
      clothingItems.filter((item) =>
        matchesSearch(collectPieceSearchText(item), trimmedSearch),
      ),
    [clothingItems, trimmedSearch],
  );
  const hasSearchMatches =
    matchingOutfits.length > 0 || matchingPieces.length > 0;
  const sectionLinks = [
    { id: "favorite-fits", label: "Favorite Fits" },
    { id: "outfit-memories", label: "Outfit Memories" },
    ...wardrobeSections.map((section) => ({
      id: sectionIdForLabel(section),
      label: section,
    })),
  ];

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
    <main className="page-shell">
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
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-linen px-3 py-2 text-sm font-medium text-charcoal">
            <Sparkles className="h-4 w-4 text-brass" />
            Digital closet
          </div>
          <h1 className="font-serif text-[2rem] text-charcoal sm:text-4xl">Wardrobe</h1>
          <p className="mt-2 text-stone">
            Saved outfit memories come first. Individual pieces support the closet
            without taking over the whole experience.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/outfit-memory"
            className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory shadow-soft transition hover:bg-softblack"
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

      <section className="section-surface mb-5 p-4 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search outfits, pieces, colors, categories..."
            className="h-12 min-h-[var(--touch-target-min)] w-full rounded-full border border-black/10 bg-white pl-11 pr-12 text-sm text-charcoal shadow-soft outline-none transition placeholder:text-stone/70 focus:border-sage/40 focus:ring-4 focus:ring-sage/10"
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
          Search by outfit title, color, category, season, occasion, or the pieces
          inside a saved look.
        </p>
      </section>

      {!isSearchActive ? (
        <div className="sticky top-3 z-20 mb-5 -mx-4 bg-ivory/95 px-4 py-2 backdrop-blur sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-0">
          <div className="memory-rail pb-1 lg:pb-3">
            {sectionLinks.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() =>
                  document.getElementById(section.id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className="flex h-10 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-white px-4 text-xs font-medium text-charcoal shadow-soft"
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-5 rounded-[1.5rem] bg-linen px-4 py-3 text-sm text-stone">
          {matchingOutfits.length} outfit
          {matchingOutfits.length === 1 ? "" : "s"} and {matchingPieces.length} piece
          {matchingPieces.length === 1 ? "" : "s"} match "
          <span className="font-medium text-charcoal">{trimmedSearch}</span>".
        </div>
      )}

      {isSearchActive ? (
        hasSearchMatches ? (
          <div className="space-y-5 sm:space-y-6">
            <RailSection
              id="matching-outfits"
              title="Matching Outfit Memories"
              description="Saved looks that match your search through titles, notes, occasions, seasons, styles, or the pieces inside them."
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

            <RailSection
              id="matching-pieces"
              title="Matching Wardrobe Pieces"
              description="Pieces that match by name, color, category, section, season, occasion, style, or formality."
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
          </div>
        ) : (
          <section className="section-surface p-5 sm:p-6">
            <div className="rounded-[1.5rem] border border-dashed border-black/10 bg-white px-5 py-8 text-center">
              <h2 className="font-serif text-2xl text-charcoal">
                No matching wardrobe memories.
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone">
                Try a color, category, outfit title, or occasion.
              </p>
            </div>
          </section>
        )
      ) : (
        <div className="space-y-5 sm:space-y-6">
          <RailSection
            id="favorite-fits"
            title="Favorite Fits"
            description="The combinations you already trust most, featured here without removing them from the rest of your saved outfit memories."
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

          <RailSection
            id="outfit-memories"
            title="All Outfit Memories"
            description="Your full saved rotation lives here. Favorites stay featured above, but they still belong to the main wardrobe memory flow."
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

          {wardrobeSections.map((section) => (
            <RailSection
              key={section}
              id={sectionIdForLabel(section)}
              title={section}
              description="Supporting pieces grouped calmly by section, so the closet stays easy to scan on mobile."
              items={groupedItems[section]}
              emptyMessage={`No ${section.toLowerCase()} saved yet. Add pieces through outfit memory and DigiCloset will place them here automatically.`}
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
          ))}
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
