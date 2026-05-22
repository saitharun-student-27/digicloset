import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Heart,
  Pencil,
  Sparkles,
  Thermometer,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ClothingCard from "../components/ClothingCard";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import OutfitEditModal from "../components/OutfitEditModal";
import OutfitShowcaseCard from "../components/OutfitShowcaseCard";
import { useWardrobeData } from "../context/WardrobeDataProvider.jsx";
import { api } from "../lib/api";
import { getImageUrl } from "../services/clothingService";
import {
  formatOccasionLabel,
  formatSeasonLabel,
  formatStyleLabel,
} from "../utils/wardrobeTaxonomy";

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

function getConditionLabel(condition) {
  return {
    hot: "Hot and sunny",
    cold: "Cold and chilly",
    rainy: "Rainy",
    pleasant: "Pleasant",
  }[condition] || "Gentle weather";
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

function buildOccasionNote(outfit) {
  const occasion = formatOccasionLabel(outfit.occasion || "casual").toLowerCase();
  return `A saved look worth returning to when ${occasion} is on the plan.`;
}

function buildFeatureReason(outfit, weather) {
  const season = formatSeasonLabel(outfit.season || "all");
  const occasion = formatOccasionLabel(outfit.occasion || "casual");

  if (weather?.condition === "rainy") {
    return `A calm ${season.toLowerCase()} look that still makes sense for rainy weather.`;
  }

  if (weather?.condition === "cold") {
    return `A steadier ${occasion.toLowerCase()} option when the day calls for extra warmth.`;
  }

  if (outfit.is_favorite) {
    return "A trusted saved look from your wardrobe, easy to return to today.";
  }

  if (outfit.last_worn_date) {
    const days = getDaysSince(outfit.last_worn_date);
    return `Worth revisiting today after sitting quietly for ${days} day${days === 1 ? "" : "s"}.`;
  }

  return "Pulled from your wardrobe as a gentle starting point for today.";
}

function getOutfitHeroImage(outfit) {
  if (outfit?.image_url || outfit?.imagePreviewUrl) {
    return getImageUrl(outfit.image_url || outfit.imagePreviewUrl);
  }

  const linkedImage = (outfit?.outfit_items || []).find(
    (item) => item?.clothing_item?.image_url,
  );

  return linkedImage ? getImageUrl(linkedImage.clothing_item.image_url) : "";
}

function pickTopSuggestion(candidates) {
  const seen = new Set();

  const unique = candidates.filter((outfit) => {
    if (!outfit?.id || seen.has(outfit.id)) {
      return false;
    }

    seen.add(outfit.id);
    return true;
  });

  return (
    unique.find((outfit) => getOutfitHeroImage(outfit)) ||
    unique.find(Boolean) ||
    null
  );
}

function SurfaceHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 font-serif text-[1.7rem] leading-none text-charcoal sm:text-[1.95rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function SuggestionRail({
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
    <section className="section-surface overflow-hidden p-4 sm:p-5">
      <SurfaceHeader eyebrow={eyebrow} title={title} description={description} />

      {items.length > 0 ? (
        <div className="memory-rail pb-1">
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

function FeatureAction({
  icon: Icon,
  label,
  onClick,
  active = false,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-[var(--touch-target-min)] items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-55 ${
        danger
          ? "border-red-100 bg-white text-red-600 hover:bg-red-50"
          : active
            ? "border-transparent bg-charcoal text-ivory"
            : "border-black/8 bg-white/90 text-charcoal hover:bg-white"
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${active ? "fill-current" : ""}`} />
      {label}
    </button>
  );
}

function FeatureSuggestionCard({
  outfit,
  weather,
  onFavorite,
  onMarkWorn,
  onEdit,
  onDelete,
  isBusy,
}) {
  const imageUrl = getOutfitHeroImage(outfit);
  const weatherLabel = weather ? getConditionLabel(weather.condition) : null;
  const featureReason = buildFeatureReason(outfit, weather);

  return (
      <section className="section-surface overflow-hidden p-2 sm:p-2.5">
      <div className="rounded-[1.85rem] bg-[linear-gradient(135deg,#f8f4eb_0%,#fdfbf7_100%)] p-3 sm:p-3.5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone">
              For today
            </p>
            <h2 className="mt-2 font-serif text-[1.8rem] leading-none text-charcoal sm:text-[2rem]">
              Worth returning to
            </h2>
          </div>
          <div className="rounded-full border border-black/8 bg-white/88 px-3 py-2 text-xs font-medium text-stone shadow-soft">
            {outfit.is_favorite ? "Trusted look" : "Saved memory"}
          </div>
        </div>

        <article className="overflow-hidden rounded-[1.7rem] border border-black/5 bg-white/92 shadow-soft">
          <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
            <Link
              to={`/outfits/${outfit.id}`}
              className="relative block aspect-[4/4.1] min-h-[14.75rem] overflow-hidden bg-[linear-gradient(135deg,#ede4d7_0%,#faf7f1_100%)] focus:outline-none focus-visible:ring-4 focus-visible:ring-sage/20 sm:min-h-[17.5rem]"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={outfit.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-8">
                  <div className="rounded-[1.4rem] border border-white/60 bg-white/70 px-6 py-5 text-center shadow-soft backdrop-blur">
                    <p className="font-serif text-2xl text-charcoal">Saved look</p>
                    <p className="mt-2 text-sm leading-6 text-stone">
                      Open this outfit memory to see the full pieces again.
                    </p>
                  </div>
                </div>
              )}
            </Link>

            <div className="flex flex-col justify-between p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
                  Today&apos;s suggestion
                </p>
                <h3 className="mt-3 font-serif text-[1.7rem] leading-tight text-charcoal">
                  {outfit.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-stone">
                  {outfit.description || featureReason}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-ivory px-3 py-1.5 text-[11px] font-medium text-stone">
                    {formatSeasonLabel(outfit.season || "all")}
                  </span>
                  <span className="rounded-full bg-ivory px-3 py-1.5 text-[11px] font-medium text-stone">
                    {formatOccasionLabel(outfit.occasion || "casual")}
                  </span>
                  {outfit.style ? (
                    <span className="rounded-full bg-ivory px-3 py-1.5 text-[11px] font-medium text-stone">
                      {formatStyleLabel(outfit.style)}
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 space-y-2.5 text-sm text-stone">
                  {weatherLabel ? (
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-brass" />
                      <span>
                        {Math.round(weather.temperature)}
                        {"\u00B0"}C and {weatherLabel.toLowerCase()}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-brass" />
                    <span>{featureReason}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  to={`/outfits/${outfit.id}`}
                  className="inline-flex min-h-[var(--touch-target-min)] items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-medium text-ivory transition hover:bg-black"
                >
                  View Outfit
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="flex flex-wrap gap-2">
                  <FeatureAction
                    icon={Heart}
                    label={outfit.is_favorite ? "Unfavorite" : "Favorite"}
                    active={outfit.is_favorite}
                    onClick={() => onFavorite(outfit)}
                    disabled={isBusy}
                  />
                  <FeatureAction
                    icon={CheckCircle2}
                    label="Mark worn"
                    onClick={() => onMarkWorn(outfit)}
                    disabled={isBusy}
                  />
                  <FeatureAction
                    icon={Pencil}
                    label="Edit"
                    onClick={() => onEdit(outfit)}
                    disabled={isBusy}
                  />
                  <FeatureAction
                    icon={Trash2}
                    label="Delete"
                    onClick={() => onDelete(outfit)}
                    danger
                    disabled={isBusy}
                  />
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default function Suggestions() {
  const navigate = useNavigate();
  const {
    outfits,
    clothingItems,
    outfitsLoading,
    clothingLoading,
    outfitsError,
    clothingError,
    favoriteOutfit,
    markOutfitWorn,
    updateOutfit,
    deleteOutfit,
    deletePiece,
    refreshAll,
    isOutfitPending,
    isPiecePending,
  } = useWardrobeData();
  const [suggestions, setSuggestions] = useState(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  async function loadSuggestions() {
    setIsLoadingSuggestions(true);
    setError("");

    const suggestionsResult = await Promise.allSettled([api.get("/suggestions")]);

    try {
      setSuggestions(
        suggestionsResult[0].status === "fulfilled"
          ? suggestionsResult[0].value.data
          : null,
      );

      if (suggestionsResult[0].status === "rejected") {
        throw suggestionsResult[0].reason;
      }
    } catch (loadError) {
      console.error("Failed to load suggestions", loadError);
      setError("Could not load suggestions right now.");
    } finally {
      setIsLoadingSuggestions(false);
    }
  }

  async function handleFavorite(outfit) {
    try {
      setActionError("");
      await favoriteOutfit(outfit.id);
    } catch (favoriteError) {
      setActionError(
        favoriteError?.response?.data?.detail ||
          "Could not update favorites right now.",
      );
    }
  }

  async function handleMarkWorn(outfit) {
    try {
      setActionError("");
      await markOutfitWorn(outfit.id);
    } catch (wornError) {
      setActionError(
        wornError?.response?.data?.detail ||
          "Could not mark that outfit worn right now.",
      );
    }
  }

  async function handleDeleteOutfit(outfit) {
    if (!window.confirm(`Delete "${outfit.title}"?`)) {
      return;
    }

    try {
      setActionError("");
      await deleteOutfit(outfit.id);
    } catch (deleteError) {
      setActionError(
        deleteError?.response?.data?.detail || "Could not delete that outfit.",
      );
    }
  }

  async function handleSaveEdit(payload) {
    setIsSavingEdit(true);
    try {
      await updateOutfit(editingOutfit.id, payload);
      setEditingOutfit(null);
      setActionError("");
    } catch (saveError) {
      setActionError(
        saveError?.response?.data?.detail || "Could not save outfit changes.",
      );
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDeletePiece(item) {
    if (!window.confirm(`Delete "${item.name}"?`)) {
      return;
    }

    try {
      setActionError("");
      await deletePiece(item.id);
    } catch (deleteError) {
      setActionError(
        deleteError?.response?.data?.detail ||
          "This piece could not be deleted safely.",
      );
    }
  }

  const weather = suggestions?.weather;
  const outfitCount = outfits.length;
  const wornOutfitCount = outfits.filter((outfit) => outfit.last_worn_date).length;
  const hasMeaningfulHistory = outfitCount >= 8 && wornOutfitCount >= 3;
  const clothingById = useMemo(
    () => new Map(clothingItems.map((item) => [item.id, item])),
    [clothingItems],
  );

  const weatherSupport = useMemo(
    () =>
      (suggestions?.weather_picks || [])
        .map((piece) => {
          const currentPiece = clothingById.get(piece.id);
          return currentPiece ? { ...currentPiece, message: piece.message } : null;
        })
        .filter(Boolean),
    [clothingById, suggestions],
  );

  const reusedPieces = useMemo(
    () =>
      (suggestions?.reused_items || [])
        .map((piece) => {
          const currentPiece = clothingById.get(piece.id);
          return currentPiece ? { ...currentPiece, message: piece.message } : null;
        })
        .filter(Boolean),
    [clothingById, suggestions],
  );

  const favoriteFits = useMemo(
    () => outfits.filter((outfit) => outfit.is_favorite).slice(0, 6),
    [outfits],
  );

  const recentlyWorn = useMemo(() => {
    return [...outfits]
      .filter((outfit) => outfit.last_worn_date)
      .sort(
        (left, right) =>
          parseDate(right.last_worn_date) - parseDate(left.last_worn_date),
      )
      .slice(0, 6);
  }, [outfits]);

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
      .slice(0, 6);
  }, [outfits, weather]);

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
      .slice(0, 6);
  }, [hasMeaningfulHistory, outfits]);

  const occasionIdeas = useMemo(() => {
    const seen = new Set();

    return [...outfits]
      .filter((outfit) => outfit.occasion)
      .sort((left, right) => {
        if (Boolean(right.is_favorite) !== Boolean(left.is_favorite)) {
          return Number(Boolean(right.is_favorite)) - Number(Boolean(left.is_favorite));
        }

        return (parseDate(right.last_worn_date)?.getTime() || 0) -
          (parseDate(left.last_worn_date)?.getTime() || 0);
      })
      .filter((outfit) => {
        const key = String(outfit.occasion || "casual").toLowerCase();
        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      })
      .slice(0, 6);
  }, [outfits]);

  const topSuggestion = pickTopSuggestion([
    ...seasonalRotation,
    ...favoriteFits,
    ...occasionIdeas,
    ...recentlyWorn,
    ...quietRediscovery,
    ...outfits,
  ]);

  const weatherSupportPreview = weatherSupport.slice(0, 3);
  const hasAnyContent =
    Boolean(topSuggestion) ||
    weatherSupport.length > 0 ||
    favoriteFits.length > 0 ||
    recentlyWorn.length > 0 ||
    seasonalRotation.length > 0 ||
    quietRediscovery.length > 0 ||
    reusedPieces.length > 0 ||
    occasionIdeas.length > 0;

  const isLoading = outfitsLoading || clothingLoading || isLoadingSuggestions;
  const pageError = error || outfitsError || clothingError;

  if (isLoading) {
    return (
      <main className="page-shell max-w-[56rem]">
        <section className="section-surface overflow-hidden p-4 sm:p-5">
          <div className="mx-auto max-w-xl py-12 text-center sm:py-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ivory text-brass shadow-soft">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="mt-5 font-serif text-2xl text-charcoal">
              Gathering quiet suggestions
            </p>
            <p className="mt-2 text-sm leading-6 text-stone">
              Pulling from your saved looks and wardrobe pieces.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell max-w-[56rem]">
      <section className="section-surface overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
        <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#fbf8f2_0%,#f7f1e8_100%)] px-4 py-7 sm:px-6 sm:py-8">
          <div className="pointer-events-none absolute inset-x-[-12%] top-[-14rem] h-[17rem] rounded-b-[50%] border border-[rgba(182,144,91,0.24)] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(255,255,255,0.28)_70%)]" />
          <div className="relative text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-black/6 bg-white/80 text-charcoal shadow-soft">
              <Sparkles className="h-5 w-5 text-brass" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone">
              DigiCloset
            </p>
            <h1 className="mt-3 font-serif text-[2.05rem] leading-none text-charcoal sm:text-[2.45rem]">
              Suggestions
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone sm:text-[15px]">
              Thoughtful ideas from your wardrobe, curated for today.
            </p>
          </div>
        </div>
      </section>

      {pageError ? (
        <div className="mt-5 sm:mt-6">
          <ErrorState
            title="Could not load suggestions right now"
            message={pageError}
            onRetry={() => {
              refreshAll().catch(() => {});
              loadSuggestions();
            }}
          />
        </div>
      ) : null}

      {actionError ? (
        <div className="mt-5 sm:mt-6">
          <ErrorState title="That action did not stick" message={actionError} />
        </div>
      ) : null}

      {!pageError ? (
        <div className="mt-5 space-y-5 sm:mt-7 sm:space-y-7">
          {topSuggestion ? (
            <FeatureSuggestionCard
              outfit={topSuggestion}
              weather={weather}
              onFavorite={handleFavorite}
              onMarkWorn={handleMarkWorn}
              onEdit={setEditingOutfit}
              onDelete={handleDeleteOutfit}
              isBusy={isOutfitPending(topSuggestion.id)}
            />
          ) : (
            <section className="section-surface overflow-hidden p-4 sm:p-5">
              <div className="rounded-[1.85rem] bg-[linear-gradient(180deg,#fbf8f2_0%,#f7f1e8_100%)] px-5 py-10 text-center sm:px-6 sm:py-12">
                <p className="font-serif text-3xl text-charcoal">
                  Suggestions grow from your saved looks
                </p>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone">
                  Save a few outfit memories and DigiCloset will have more to
                  quietly bring back.
                </p>
                <Link
                  to="/outfit-memory"
                  className="mt-6 inline-flex min-h-[var(--touch-target-min)] items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-medium text-ivory transition hover:bg-black"
                >
                  Save your first outfit memory
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          )}

          {(weather || weatherSupportPreview.length > 0) && topSuggestion ? (
            <section className="section-surface overflow-hidden p-4 sm:p-5">
              <div className="rounded-[1.7rem] border border-black/5 bg-[linear-gradient(135deg,#faf6ef_0%,#fffdf9_100%)] p-4 sm:p-5">
                <div className="flex flex-wrap items-start gap-4 sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brass shadow-soft">
                      <Thermometer className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
                        Wear support
                      </p>
                      <p className="mt-1 text-sm leading-6 text-charcoal">
                        {weather
                          ? `${Math.round(weather.temperature)}${"\u00B0"}C and ${getConditionLabel(
                              weather.condition,
                            ).toLowerCase()}.`
                          : "Pulled from the pieces you already use."}
                      </p>
                    </div>
                  </div>

                  {weatherSupportPreview.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {weatherSupportPreview.map((piece) => (
                        <span
                          key={piece.id}
                          className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-stone shadow-soft"
                        >
                          {piece.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          <SuggestionRail
            eyebrow="Occasion"
            title="Occasion ideas"
            description="Saved outfit memories that still make sense when a familiar kind of day comes around again."
            items={occasionIdeas.filter((outfit) => outfit.id !== topSuggestion?.id)}
            emptyTitle={null}
            emptyDescription={null}
            renderItem={(outfit) => (
              <OutfitShowcaseCard
                outfit={outfit}
                onFavorite={handleFavorite}
                onMarkWorn={handleMarkWorn}
                onEdit={setEditingOutfit}
                onDelete={handleDeleteOutfit}
                isBusy={isOutfitPending(outfit.id)}
                showMeta={false}
                supportingText={buildOccasionNote(outfit)}
              />
            )}
          />

          <div className="grid gap-5 xl:grid-cols-2">
            <SuggestionRail
              eyebrow="Season"
              title="Seasonal rotation"
              description="Saved looks that still fit the weather and season you are actually in."
              items={seasonalRotation.filter((outfit) => outfit.id !== topSuggestion?.id)}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => (
                <OutfitShowcaseCard
                  outfit={outfit}
                  onFavorite={handleFavorite}
                  onMarkWorn={handleMarkWorn}
                  onEdit={setEditingOutfit}
                  onDelete={handleDeleteOutfit}
                  isBusy={isOutfitPending(outfit.id)}
                  showMeta={false}
                  supportingText={
                    outfit.season === "all"
                      ? "Flexible enough to work across more than one kind of day."
                      : `A ${formatSeasonLabel(outfit.season).toLowerCase()} look still worth keeping nearby.`
                  }
                />
              )}
            />

            <SuggestionRail
              eyebrow="Favorites"
              title="Favorite combinations"
              description="The looks you already trust, kept near the surface without turning this into a feed."
              items={favoriteFits.filter((outfit) => outfit.id !== topSuggestion?.id)}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => (
                <OutfitShowcaseCard
                  outfit={outfit}
                  onFavorite={handleFavorite}
                  onMarkWorn={handleMarkWorn}
                  onEdit={setEditingOutfit}
                  onDelete={handleDeleteOutfit}
                  isBusy={isOutfitPending(outfit.id)}
                  showMeta={false}
                  supportingText="A trusted outfit memory you already know works."
                />
              )}
            />
          </div>

          {quietRediscovery.length > 0 ? (
            <SuggestionRail
              eyebrow="Rediscovery"
              title="Worth returning to"
              description="Older outfit memories that make sense to bring back once your history is rich enough to trust."
              items={quietRediscovery.filter((outfit) => outfit.id !== topSuggestion?.id)}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => (
                <OutfitShowcaseCard
                  outfit={outfit}
                  onFavorite={handleFavorite}
                  onMarkWorn={handleMarkWorn}
                  onEdit={setEditingOutfit}
                  onDelete={handleDeleteOutfit}
                  isBusy={isOutfitPending(outfit.id)}
                  showMeta={false}
                  supportingText={buildRediscoveryNote(outfit)}
                />
              )}
            />
          ) : null}

          <div className="grid gap-5 xl:grid-cols-2">
            <SuggestionRail
              eyebrow="History"
              title="Recently worn"
              description="A quieter look at what has actually been in motion lately."
              items={recentlyWorn.filter((outfit) => outfit.id !== topSuggestion?.id)}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => (
                <OutfitShowcaseCard
                  outfit={outfit}
                  onFavorite={handleFavorite}
                  onMarkWorn={handleMarkWorn}
                  onEdit={setEditingOutfit}
                  onDelete={handleDeleteOutfit}
                  isBusy={isOutfitPending(outfit.id)}
                  showMeta={false}
                  supportingText={buildRecentNote(outfit)}
                />
              )}
            />

            <SuggestionRail
              eyebrow="Reuse"
              title="Pieces you already use"
              description="The quiet core of your closet, surfaced from the pieces that keep appearing in saved looks."
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
                  isBusy={isPiecePending(piece.id)}
                />
              )}
            />
          </div>

          {!hasAnyContent ? (
            <section className="section-surface overflow-hidden p-4 sm:p-5">
              <div className="rounded-[1.85rem] bg-[linear-gradient(180deg,#fbf8f2_0%,#f7f1e8_100%)] px-5 py-10 text-center sm:px-6 sm:py-12">
                <p className="font-serif text-3xl text-charcoal">
                  Suggestions grow from real use
                </p>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone">
                  Save a few outfit memories, favorite the ones you trust, or
                  mark them worn so DigiCloset has more to quietly bring back.
                </p>
              </div>
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
