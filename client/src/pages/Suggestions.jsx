import { Sparkles, Thermometer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ClothingCard from "../components/ClothingCard";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import OutfitEditModal from "../components/OutfitEditModal";
import OutfitShowcaseCard from "../components/OutfitShowcaseCard";
import { api } from "../lib/api";
import { deleteClothingItem } from "../services/clothingService";
import {
  deleteOutfit,
  getOutfits,
  markOutfitWorn,
  toggleFavoriteOutfit,
  updateOutfit,
} from "../services/outfitService";

function parseDate(value) {
  return value ? new Date(value) : null;
}

function getDaysSince(value) {
  const date = parseDate(value);
  if (!date) {
    return null;
  }

  return Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function RailSurface({
  eyebrow,
  title,
  description,
  items,
  emptyTitle,
  emptyDescription,
  renderItem,
  cardClassName = "memory-rail-card",
}) {
  if (items.length === 0 && !emptyTitle) {
    return null;
  }

  return (
    <section className="section-surface p-4 sm:p-5">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-charcoal sm:text-2xl">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone">
            {description}
          </p>
        </div>
        <span className="rounded-full bg-ivory px-3 py-1 text-xs font-medium text-stone">
          {items.length} saved
        </span>
      </div>

      {items.length > 0 ? (
        <div className="memory-rail">
          {items.map((item) => (
            <div key={item.id} className={cardClassName}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </section>
  );
}

function buildRediscoveryNote(outfit) {
  const days = getDaysSince(outfit.last_worn_date);

  if (days === null) {
    return "Saved, but still waiting for its first worn moment.";
  }

  if (outfit.season === "winter") {
    return `You wore this more around colder days, but it has been quiet for ${days} days.`;
  }

  return `Quietly out of rotation for ${days} days.`;
}

function buildRecentNote(outfit) {
  const days = Math.max(0, getDaysSince(outfit.last_worn_date) || 0);

  if (outfit.occasion === "college") {
    return `Still close at hand from ${days} day${days === 1 ? "" : "s"} ago on campus.`;
  }

  return `You reached for this combination ${days} day${days === 1 ? "" : "s"} ago.`;
}

export default function Suggestions() {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState(null);
  const [outfits, setOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  async function loadSuggestions() {
    setIsLoading(true);
    setError("");

    const [suggestionsResult, outfitsResult] = await Promise.allSettled([
      api.get("/suggestions"),
      getOutfits(),
    ]);

    try {
      setSuggestions(
        suggestionsResult.status === "fulfilled"
          ? suggestionsResult.value.data
          : null,
      );
      setOutfits(outfitsResult.status === "fulfilled" ? outfitsResult.value : []);

      if (
        suggestionsResult.status === "rejected" &&
        outfitsResult.status === "rejected"
      ) {
        throw suggestionsResult.reason || outfitsResult.reason;
      }
    } catch (loadError) {
      console.error("Failed to load suggestions", loadError);
      setError("Could not load suggestions right now.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFavorite(outfit) {
    await toggleFavoriteOutfit(outfit.id);
    await loadSuggestions();
  }

  async function handleMarkWorn(outfit) {
    await markOutfitWorn(outfit.id);
    await loadSuggestions();
  }

  async function handleDeleteOutfit(outfit) {
    if (!window.confirm(`Delete "${outfit.title}"?`)) {
      return;
    }

    await deleteOutfit(outfit.id);
    await loadSuggestions();
  }

  async function handleSaveEdit(payload) {
    setIsSavingEdit(true);
    try {
      await updateOutfit(editingOutfit.id, payload);
      setEditingOutfit(null);
      await loadSuggestions();
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDeletePiece(item) {
    if (!window.confirm(`Delete "${item.name}"?`)) {
      return;
    }

    try {
      await deleteClothingItem(item.id);
      await loadSuggestions();
    } catch (deleteError) {
      alert(
        deleteError?.response?.data?.detail ||
          "This piece could not be deleted safely.",
      );
    }
  }

  const weather = suggestions?.weather;
  const conditionLabel = {
    hot: "Hot & Sunny",
    cold: "Cold & Chilly",
    rainy: "Rainy",
    pleasant: "Pleasant",
  };

  const outfitCount = outfits.length;
  const wornOutfitCount = outfits.filter((outfit) => outfit.last_worn_date).length;
  const hasMeaningfulHistory = outfitCount >= 8 && wornOutfitCount >= 3;
  const weatherSupport = suggestions?.weather_picks || [];
  const reusedPieces = suggestions?.reused_items || [];

  const quietRediscovery = useMemo(() => {
    if (!hasMeaningfulHistory) {
      return [];
    }

    return [...outfits]
      .filter((outfit) => outfit.last_worn_date)
      .sort(
        (left, right) =>
          parseDate(left.last_worn_date) - parseDate(right.last_worn_date),
      )
      .slice(0, 5);
  }, [hasMeaningfulHistory, outfits]);

  const recentlyWorn = useMemo(() => {
    return [...outfits]
      .filter((outfit) => outfit.last_worn_date)
      .sort(
        (left, right) =>
          parseDate(right.last_worn_date) - parseDate(left.last_worn_date),
      )
      .slice(0, 5);
  }, [outfits]);

  const favoriteFits = useMemo(
    () => outfits.filter((outfit) => outfit.is_favorite).slice(0, 5),
    [outfits],
  );

  const seasonalRotation = useMemo(() => {
    const preferredSeason =
      weather?.condition === "cold"
        ? "winter"
        : weather?.condition === "rainy"
          ? "rainy"
          : "summer";

    return outfits
      .filter(
        (outfit) =>
          outfit.season === preferredSeason || outfit.season === "all",
      )
      .slice(0, 5);
  }, [outfits, weather]);

  const hasAnyContent =
    weatherSupport.length > 0 ||
    favoriteFits.length > 0 ||
    recentlyWorn.length > 0 ||
    seasonalRotation.length > 0 ||
    quietRediscovery.length > 0 ||
    reusedPieces.length > 0;

  if (isLoading) {
    return (
      <main className="page-shell flex min-h-[calc(100dvh-10rem)] max-w-6xl flex-col">
        <div className="flex h-full items-center justify-center">
          <p className="text-stone">Loading suggestions...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell max-w-6xl">
      <section className="section-surface p-4 sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal text-brass">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl text-charcoal">
                Suggestions
              </h1>
              <p className="text-sm leading-6 text-stone">
                Home helps with today. This page keeps the quieter rotation,
                resurfacing, and dependable repeats in one calmer place.
              </p>
            </div>
          </div>

          {weather ? (
            <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,#f8f5ee_0%,#eee6d9_100%)] p-5">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-soft">
                  <Thermometer className="h-7 w-7 text-brass" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
                    Today&apos;s weather
                  </p>
                  <p className="mt-2 font-serif text-3xl text-charcoal">
                    {Math.round(weather.temperature)}
                    {"\u00B0"}C
                  </p>
                  <p className="text-sm text-stone">
                    {conditionLabel[weather.condition] || weather.condition}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {error ? (
        <div className="mt-6">
          <ErrorState
            title="Could not load suggestions right now"
            message={error}
            onRetry={loadSuggestions}
          />
        </div>
      ) : null}

      {!error ? (
        <div className="mt-5 space-y-5 sm:mt-7 sm:space-y-7">
          <RailSurface
            eyebrow="Today"
            title="Useful for today"
            description="Pieces that make sense for the day, kept practical and quiet rather than turned into a recommendation show."
            items={weatherSupport}
            emptyTitle={null}
            emptyDescription={null}
            cardClassName="piece-rail-card"
            renderItem={(piece) => (
              <ClothingCard
                item={piece}
                supportingText={piece.message}
                onEdit={() => navigate(`/pieces/${piece.id}`)}
                onDelete={handleDeletePiece}
              />
            )}
          />

          <div className="grid gap-5 xl:grid-cols-2">
            <RailSurface
              eyebrow="Favorites"
              title="Favorite Fits"
              description="The looks you already trust, kept easy to reach without pretending they live in a separate world."
              items={favoriteFits}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => (
                <OutfitShowcaseCard
                  outfit={outfit}
                  onFavorite={handleFavorite}
                  onMarkWorn={handleMarkWorn}
                  onEdit={setEditingOutfit}
                  onDelete={handleDeleteOutfit}
                  showMeta={false}
                  supportingText="A trusted outfit memory you already know works."
                />
              )}
            />

            <RailSurface
              eyebrow="History"
              title="Recently Worn"
              description="The looks that have actually been in motion lately, so repeat wear still feels intentional."
              items={recentlyWorn}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => (
                <OutfitShowcaseCard
                  outfit={outfit}
                  onFavorite={handleFavorite}
                  onMarkWorn={handleMarkWorn}
                  onEdit={setEditingOutfit}
                  onDelete={handleDeleteOutfit}
                  showMeta={false}
                  supportingText={buildRecentNote(outfit)}
                />
              )}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <RailSurface
              eyebrow="Season"
              title="Seasonal Rotation"
              description="Saved looks that still make sense for the season you are in, using lightweight and explainable logic."
              items={seasonalRotation}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => (
                <OutfitShowcaseCard
                  outfit={outfit}
                  onFavorite={handleFavorite}
                  onMarkWorn={handleMarkWorn}
                  onEdit={setEditingOutfit}
                  onDelete={handleDeleteOutfit}
                  showMeta={false}
                  supportingText={
                    outfit.season === "all"
                      ? "Flexible enough to work across more than one kind of day."
                      : `Saved as a ${outfit.season} look that still fits the season.`
                  }
                />
              )}
            />

            <RailSurface
              eyebrow="Rediscovery"
              title="Quiet Rediscovery"
              description="Older saved looks only come forward once your history is rich enough to make resurfacing feel believable."
              items={quietRediscovery}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => (
                <OutfitShowcaseCard
                  outfit={outfit}
                  onFavorite={handleFavorite}
                  onMarkWorn={handleMarkWorn}
                  onEdit={setEditingOutfit}
                  onDelete={handleDeleteOutfit}
                  showMeta={false}
                  supportingText={buildRediscoveryNote(outfit)}
                />
              )}
            />
          </div>

          <RailSurface
            eyebrow="Reuse"
            title="Most Reused Pieces"
            description="Pieces that keep showing up in your saved looks, which helps reveal the quiet core of your closet."
            items={reusedPieces}
            emptyTitle={null}
            emptyDescription={null}
            cardClassName="piece-rail-card"
            renderItem={(piece) => (
              <ClothingCard
                item={piece}
                supportingText={piece.message}
                onEdit={() => navigate(`/pieces/${piece.id}`)}
                onDelete={handleDeletePiece}
              />
            )}
          />

          {!hasAnyContent ? (
            <section className="section-surface p-4 sm:p-5">
              <EmptyState
                title="Suggestions grow from real use"
                description="Home will help first. Once you save a few looks, mark them worn, or favorite the ones you trust, this page becomes much more useful."
              />
            </section>
          ) : null}
        </div>
      ) : null}

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

