import {
  CloudRain,
  CloudSun,
  Layers3,
  Snowflake,
  Sparkles,
  Sun,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import OutfitEditModal from "../components/OutfitEditModal";
import OutfitShowcaseCard from "../components/OutfitShowcaseCard";
import { useWardrobeData } from "../context/WardrobeDataProvider.jsx";
import { api } from "../lib/api";
import { getImageUrl } from "../services/clothingService";
import {
  generateOutfitNote,
  generateOutfitTitle,
  getWardrobeSection,
  wardrobeSections,
} from "../utils/outfitUtils";

const WEATHER_ICONS = {
  hot: Sun,
  cold: Snowflake,
  rainy: CloudRain,
  pleasant: CloudSun,
};

const WEATHER_LABELS = {
  hot: "Hot & Sunny",
  cold: "Cold & Chilly",
  rainy: "Rainy",
  pleasant: "Pleasant",
};

const WEATHER_ADVICE = {
  hot: "A lighter saved fit is a good place to start today.",
  cold: "Layered looks are likely to feel better today.",
  rainy: "Protected, balanced combinations will work well today.",
  pleasant: "A dependable saved look is a good starting point today.",
};

function parseDate(value) {
  return value ? new Date(value) : null;
}

function getDaysSince(value) {
  const date = parseDate(value);
  if (!date) {
    return null;
  }

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
}

function getLocalDayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function isSameCalendarDay(value) {
  const date = parseDate(value);
  if (!date) {
    return false;
  }

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function isRecentCreation(outfit) {
  const created = parseDate(outfit.created_at);
  if (!created) {
    return false;
  }

  return Date.now() - created.getTime() < 1000 * 60 * 60 * 24 * 10;
}

function getPreferredSeason(weather) {
  if (weather?.condition === "cold") {
    return "winter";
  }
  if (weather?.condition === "rainy") {
    return "rainy";
  }
  return "summer";
}

function scoreDailyFit(outfit, preferredSeason) {
  let score = 0;

  if (outfit.is_favorite) {
    score += 5;
  }

  if (outfit.season === preferredSeason) {
    score += 4;
  } else if (outfit.season === "all") {
    score += 2;
  }

  if (outfit.last_worn_date) {
    const days = getDaysSince(outfit.last_worn_date) || 0;
    score += Math.min(days, 8);
  } else {
    score += 3;
  }

  if (isSameCalendarDay(outfit.last_worn_date)) {
    score -= 8;
  }

  return score;
}

function pickDailyOutfit(outfits, preferredSeason) {
  if (outfits.length === 0) {
    return null;
  }

  const ranked = [...outfits].sort((left, right) => {
    const scoreDifference =
      scoreDailyFit(right, preferredSeason) - scoreDailyFit(left, preferredSeason);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return (left.id || 0) - (right.id || 0);
  });

  const topScore = scoreDailyFit(ranked[0], preferredSeason);
  const candidatePool = ranked.filter(
    (outfit) => topScore - scoreDailyFit(outfit, preferredSeason) <= 2,
  );
  const rotationPool = candidatePool.slice(0, Math.min(3, candidatePool.length));

  if (rotationPool.length === 1) {
    return rotationPool[0];
  }

  const daySeed = getLocalDayKey()
    .split("-")
    .map((value) => Number(value))
    .reduce((total, value) => total + value, 0);
  const index = daySeed % rotationPool.length;
  return rotationPool[index];
}

function sortByNewest(left, right) {
  return parseDate(right.created_at) - parseDate(left.created_at);
}

function sortByVisualQuality(items) {
  return [...items].sort((left, right) => {
    const leftScore = Number(Boolean(left.image_url));
    const rightScore = Number(Boolean(right.image_url));
    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }
    return (left.name || "").localeCompare(right.name || "");
  });
}

function roleForSection(section) {
  const map = {
    "Western upperwear": "upper",
    "Indian upperwear": "upper",
    "Western lowerwear": "lower",
    "Indian lowerwear": "lower",
    "One-piece / Full body": "upper",
    "Indian full outfit": "upper",
    Footwear: "footwear",
    Outerwear: "outerwear",
    Drapes: "accessory",
    Accessories: "accessory",
    "Base layers": "upper",
    Activewear: "upper",
  };

  return map[section] || "accessory";
}

function groupPiecesBySection(items) {
  return items.reduce((groups, item) => {
    const section = getWardrobeSection(item.category);
    if (!groups[section]) {
      groups[section] = [];
    }
    groups[section].push(item);
    return groups;
  }, Object.fromEntries(wardrobeSections.map((section) => [section, []])));
}

function buildStarterLooks(clothingItems, preferredSeason) {
  const grouped = groupPiecesBySection(clothingItems);
  const uppers = sortByVisualQuality([
    ...grouped["Western upperwear"],
    ...grouped["Indian upperwear"],
    ...grouped["One-piece / Full body"],
    ...grouped["Indian full outfit"],
    ...grouped["Base layers"],
    ...grouped.Activewear,
  ]);
  const lowers = sortByVisualQuality([
    ...grouped["Western lowerwear"],
    ...grouped["Indian lowerwear"],
  ]);
  const footwear = sortByVisualQuality(grouped.Footwear);
  const outerwear = sortByVisualQuality(grouped.Outerwear);
  const accessories = sortByVisualQuality([
    ...grouped.Accessories,
    ...grouped.Drapes,
  ]);

  const candidateCount = Math.min(
    3,
    Math.max(uppers.length, lowers.length, footwear.length, 0),
  );
  const looks = [];

  for (let index = 0; index < candidateCount; index += 1) {
    const pieces = [];
    const upper = uppers[index % Math.max(uppers.length, 1)] || null;
    const lower = lowers[index % Math.max(lowers.length, 1)] || null;
    const shoe = footwear[index % Math.max(footwear.length, 1)] || null;
    const layer =
      preferredSeason !== "summer"
        ? outerwear[index % Math.max(outerwear.length, 1)] || null
        : null;
    const accessory = accessories[index % Math.max(accessories.length, 1)] || null;

    [upper, lower, shoe, layer, accessory]
      .filter(Boolean)
      .forEach((piece) => {
        const section = getWardrobeSection(piece.category);
        pieces.push({
          id: `starter-piece-${piece.id}`,
          role: roleForSection(section),
          name: piece.name,
          category: piece.category,
          color: piece.color || "",
          clothing_item: piece,
        });
      });

    if (pieces.length < 2) {
      continue;
    }

    looks.push({
      id: `starter-look-${pieces.map((piece) => piece.clothing_item.id).join("-")}`,
      title: generateOutfitTitle({
        pieces,
        occasion: "casual",
        season: preferredSeason,
        style: "",
      }),
      description: generateOutfitNote({
        pieces,
        occasion: "casual",
        season: preferredSeason,
      }),
      season: preferredSeason,
      occasion: "casual",
      style: "",
      is_favorite: false,
      source_type: "closet_start",
      synthetic: true,
      outfit_items: pieces,
    });
  }

  return looks;
}

function buildStartingPointNote(outfit, weatherLabel) {
  if (outfit.synthetic) {
    return "Built from pieces already in your closet, so you still have a strong starting point today.";
  }

  if (outfit.is_favorite) {
    return "A dependable favorite you can reach for again.";
  }

  if (outfit.season === "all") {
    return "A flexible look that works across more than one kind of day.";
  }

  return `A reliable ${outfit.season} fit for ${weatherLabel.toLowerCase()}.`;
}

function buildSeasonalNote(outfit) {
  if (outfit.synthetic) {
    return "A season-matching starting look built from pieces you already own.";
  }

  if (outfit.season === "all") {
    return "A steady all-season look from your closet.";
  }

  return `Saved as a ${outfit.season} staple worth keeping close.`;
}

function buildQuietRediscoveryNote(outfit) {
  const days = getDaysSince(outfit.last_worn_date);

  if (days === null) {
    return "Saved, but still waiting for its first worn moment.";
  }

  return `Quietly out of rotation for ${days} days.`;
}

function HeroOutfitCard({
  outfit,
  weatherLabel,
  isStarterLook = false,
  onFavorite,
  onMarkWorn,
  onEdit,
  onDelete,
  isBusy = false,
}) {
  const imageUrl = getImageUrl(outfit?.image_url);
  const detailLink = !isStarterLook && outfit?.id ? `/outfits/${outfit.id}` : null;

  if (!outfit) {
    return (
      <div className="section-surface p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
          Today&apos;s fit
        </p>
        <div className="mt-4">
          <EmptyState
            title="No strong fit yet"
            description="Save your first complete look or add a few pieces to your wardrobe, and DigiCloset will start helping you dress from what you already own."
          />
        </div>
      </div>
    );
  }

  const hasActions = !isStarterLook;

  return (
    <div className="section-surface overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="min-h-[280px] bg-[linear-gradient(135deg,#eee6d9_0%,#f8f5ee_100%)] p-3 sm:min-h-[320px]">
          {detailLink ? (
            <Link
              to={detailLink}
              className="block h-full overflow-hidden rounded-[1.5rem] focus:outline-none focus-visible:ring-4 focus-visible:ring-sage/20"
            >
              {outfit.image_url ? (
                <img
                  src={imageUrl}
                  alt={outfit.title}
                  className="h-full min-h-[280px] w-full object-cover sm:min-h-[320px]"
                />
              ) : (
                <div className="flex h-full min-h-[280px] items-center justify-center rounded-[1.5rem] bg-white/55 text-stone sm:min-h-[320px]">
                  <div className="relative m-4 flex h-[190px] w-full max-w-[18rem] items-center justify-center rounded-[1.25rem] border border-white/60 bg-white/50 shadow-inner backdrop-blur-md">
                    {(outfit.outfit_items || []).slice(0, 4).map((item, index) => (
                      <div
                        key={item.id}
                        className="absolute inset-4 flex items-center justify-center opacity-75"
                        style={{
                          transform: `rotate(${index * 4 - 4}deg) translateY(${index * 7}px)`,
                        }}
                      >
                        {item.clothing_item?.image_url ? (
                          <img
                            src={getImageUrl(item.clothing_item.image_url)}
                            alt={item.clothing_item.name}
                            className="h-24 w-24 object-contain mix-blend-multiply"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Link>
          ) : (
            <div className="h-full overflow-hidden rounded-[1.5rem]">
              {outfit.image_url ? (
                <img
                  src={imageUrl}
                  alt={outfit.title}
                  className="h-full min-h-[280px] w-full object-cover sm:min-h-[320px]"
                />
              ) : (
                <div className="flex h-full min-h-[280px] items-center justify-center rounded-[1.5rem] bg-white/55 text-stone sm:min-h-[320px]">
                  <div className="relative m-4 flex h-[190px] w-full max-w-[18rem] items-center justify-center rounded-[1.25rem] border border-white/60 bg-white/50 shadow-inner backdrop-blur-md">
                    {(outfit.outfit_items || []).slice(0, 4).map((item, index) => (
                      <div
                        key={item.id}
                        className="absolute inset-4 flex items-center justify-center opacity-75"
                        style={{
                          transform: `rotate(${index * 4 - 4}deg) translateY(${index * 7}px)`,
                        }}
                      >
                        {item.clothing_item?.image_url ? (
                          <img
                            src={getImageUrl(item.clothing_item.image_url)}
                            alt={item.clothing_item.name}
                            className="h-24 w-24 object-contain mix-blend-multiply"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
            {isStarterLook ? "Today's starting look" : "Today's fit"}
          </p>
          {detailLink ? (
            <Link
              to={detailLink}
              className="mt-2 block rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-sage/20"
            >
              <h2 className="text-2xl font-semibold text-charcoal">
                {outfit.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone">
                {outfit.description ||
                  `A strong starting point for ${weatherLabel.toLowerCase()}.`}
              </p>
            </Link>
          ) : (
            <>
              <h2 className="mt-2 text-2xl font-semibold text-charcoal">
                {outfit.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone">
                {outfit.description ||
                  `A strong starting point for ${weatherLabel.toLowerCase()}.`}
              </p>
            </>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-ivory p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone">
                Occasion
              </p>
              <p className="mt-2 text-sm font-medium capitalize text-charcoal">
                {outfit.occasion || "Waiting"}
              </p>
            </div>
            <div className="rounded-2xl bg-ivory p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone">
                Season
              </p>
              <p className="mt-2 text-sm font-medium capitalize text-charcoal">
                {outfit.season || "Waiting"}
              </p>
            </div>
            <div className="rounded-2xl bg-ivory p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone">
                Source
              </p>
              <p className="mt-2 text-sm font-medium text-charcoal">
                {isStarterLook ? "From your closet" : "Saved memory"}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {hasActions ? (
              <>
                <button
                  type="button"
                  onClick={() => onFavorite?.(outfit)}
                  disabled={isBusy}
                  className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-ivory px-4 text-sm font-medium text-charcoal transition hover:bg-linen"
                >
                  {outfit.is_favorite ? "Unfavorite" : "Favorite"}
                </button>
                <button
                  type="button"
                  onClick={() => onMarkWorn?.(outfit)}
                  disabled={isBusy}
                  className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-ivory px-4 text-sm font-medium text-charcoal transition hover:bg-linen"
                >
                  Mark worn
                </button>
                <button
                  type="button"
                  onClick={() => onEdit?.(outfit)}
                  disabled={isBusy}
                  className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-ivory px-4 text-sm font-medium text-charcoal transition hover:bg-linen"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(outfit)}
                  disabled={isBusy}
                  className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-white px-4 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/wardrobe"
                  className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-charcoal px-4 text-sm font-medium text-ivory transition hover:bg-softblack"
                >
                  Open Wardrobe
                </Link>
                <Link
                  to="/outfit-memory"
                  className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-ivory px-4 text-sm font-medium text-charcoal transition hover:bg-linen"
                >
                  Save Outfit Memory
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
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
            <div key={item.id} className="memory-rail-card">
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

export default function Home() {
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
    refreshAll,
    isOutfitPending,
  } = useWardrobeData();
  const [weather, setWeather] = useState(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");
  const [actionError, setActionError] = useState("");
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    loadWeather();
  }, []);

  async function loadWeather() {
    setIsWeatherLoading(true);
    setWeatherError("");

    try {
      const response = await api.get("/suggestions");
      setWeather(response.data.weather || null);
    } catch (error) {
      setWeatherError(
        error?.response?.data?.detail ||
          "Could not load the daily weather context right now.",
      );
    } finally {
      setIsWeatherLoading(false);
    }
  }

  async function handleFavorite(outfit) {
    setActionError("");
    try {
      await favoriteOutfit(outfit.id);
    } catch (error) {
      setActionError(
        error?.response?.data?.detail ||
          "Could not update favorites right now.",
      );
    }
  }

  async function handleMarkWorn(outfit) {
    setActionError("");
    try {
      await markOutfitWorn(outfit.id);
    } catch (error) {
      setActionError(
        error?.response?.data?.detail ||
          "Could not mark that outfit worn right now.",
      );
    }
  }

  async function handleDelete(outfit) {
    if (!window.confirm(`Delete "${outfit.title}"?`)) {
      return;
    }

    setActionError("");
    try {
      await deleteOutfit(outfit.id);
    } catch (error) {
      setActionError(
        error?.response?.data?.detail || "Could not delete that outfit.",
      );
    }
  }

  async function handleSaveEdit(payload) {
    setIsSavingEdit(true);
    try {
      await updateOutfit(editingOutfit.id, payload);
      setEditingOutfit(null);
      setActionError("");
    } catch (error) {
      setActionError(
        error?.response?.data?.detail || "Could not save outfit changes.",
      );
    } finally {
      setIsSavingEdit(false);
    }
  }

  const hasCoreData = outfits.length > 0 || clothingItems.length > 0;
  const isLoading = outfitsLoading || clothingLoading || isWeatherLoading;
  const error =
    !hasCoreData && outfitsError && clothingError && weatherError
      ? outfitsError || clothingError || weatherError
      : "";

  const preferredSeason = getPreferredSeason(weather);
  const weatherLabel = weather
    ? WEATHER_LABELS[weather.condition] || "Pleasant"
    : "Pleasant";
  const WeatherIcon = weather
    ? WEATHER_ICONS[weather.condition] || CloudSun
    : CloudSun;
  const weatherAdvice = weather
    ? WEATHER_ADVICE[weather.condition] || WEATHER_ADVICE.pleasant
    : "Saved looks become more useful once they are easy to reach again.";
  const tempDisplay = weather
    ? `${Math.round(weather.temperature)}${"\u00B0"}C`
    : `--${"\u00B0"}C`;

  const starterLooks = useMemo(
    () => buildStarterLooks(clothingItems, preferredSeason),
    [clothingItems, preferredSeason],
  );

  const closetHasSupport = clothingItems.length >= 2;
  const homeState = useMemo(() => {
    if (outfits.length === 0) {
      return closetHasSupport ? "starting-with-closet" : "empty";
    }

    if (outfits.length < 4) {
      return "starting";
    }

    const wornCount = outfits.filter((outfit) => outfit.last_worn_date).length;
    if (outfits.length < 8 || wornCount < 3) {
      return "growing";
    }

    return "mature";
  }, [closetHasSupport, outfits]);

  const todaysFit = useMemo(() => {
    const todaysUploads = [...outfits]
      .filter((outfit) => isSameCalendarDay(outfit.created_at))
      .sort((left, right) => {
        const imageDifference = Number(Boolean(right.image_url)) - Number(Boolean(left.image_url));
        if (imageDifference !== 0) {
          return imageDifference;
        }

        return sortByNewest(left, right);
      });

    if (todaysUploads.length > 0) {
      return todaysUploads[0];
    }

    return null;
  }, [outfits]);

  const recentMemories = useMemo(
    () =>
      [...outfits]
        .filter((outfit) => outfit.id !== todaysFit?.id)
        .sort(sortByNewest)
        .slice(0, 6),
    [outfits, todaysFit],
  );

  const favoriteFits = useMemo(
    () =>
      outfits
        .filter((outfit) => outfit.is_favorite)
        .filter((outfit) => outfit.id !== todaysFit?.id)
        .slice(0, 5),
    [outfits, todaysFit],
  );

  const seasonalStaples = useMemo(() => {
    const seasonalOutfits = outfits
      .filter((outfit) => outfit.id !== todaysFit?.id)
      .filter(
        (outfit) =>
          outfit.season === preferredSeason || outfit.season === "all",
      )
      .slice(0, 5);

    if (seasonalOutfits.length > 0) {
      return seasonalOutfits;
    }

    return starterLooks.slice(0, 3);
  }, [outfits, preferredSeason, starterLooks, todaysFit]);

  const showQuietRediscovery = useMemo(() => {
    if (homeState !== "mature") {
      return false;
    }

    const wornOutfits = outfits.filter((outfit) => outfit.last_worn_date);
    if (wornOutfits.length < 3) {
      return false;
    }

    return !outfits.every(isRecentCreation);
  }, [homeState, outfits]);

  const quietRediscovery = useMemo(() => {
    if (!showQuietRediscovery) {
      return [];
    }

    return [...outfits]
      .filter((outfit) => outfit.id !== todaysFit?.id)
      .filter((outfit) => outfit.last_worn_date)
      .sort(
        (left, right) =>
          parseDate(left.last_worn_date) - parseDate(right.last_worn_date),
      )
      .slice(0, 4);
  }, [outfits, todaysFit, showQuietRediscovery]);

  const goodStartingPoints = useMemo(() => {
    if (outfits.length === 0) {
      return starterLooks;
    }

    const realStartingPoints = [...outfits]
      .filter((outfit) => outfit.id !== todaysFit?.id)
      .sort(
        (left, right) =>
          scoreDailyFit(right, preferredSeason) -
          scoreDailyFit(left, preferredSeason),
      )
      .slice(0, homeState === "starting" ? 3 : 5);

    if (homeState === "starting" && starterLooks.length > 0) {
      return [...realStartingPoints, ...starterLooks].slice(0, 5);
    }

    return realStartingPoints;
  }, [homeState, outfits, preferredSeason, starterLooks, todaysFit]);

  const startingPointsTitle =
    outfits.length === 0 ? "From Your Closet" : "Good Starting Points";
  const startingPointsDescription =
    outfits.length === 0
      ? "Simple combinations built from the pieces you already own, so the app still helps before your outfit history gets deep."
      : "Useful saved looks that match today and help you get dressed without turning Home into a dashboard.";

  const heroLabel =
    homeState === "empty"
      ? "Start building outfit memory"
      : homeState === "starting-with-closet"
        ? "Your closet can still help today"
        : "Here are good looks you can wear today.";
  const heroCopy =
    homeState === "empty"
      ? "Save your first complete look to make DigiCloset useful fast. If you add a few wardrobe pieces first, it can still suggest calm starting combinations."
      : homeState === "starting-with-closet"
        ? "You do not need a deep outfit history yet. DigiCloset can start from the pieces already in your closet and help you build from there."
        : "Start from saved outfit memories, keep reliable combinations close, and let the wardrobe stay useful without feeling like a dashboard.";

  return (
    <main className="page-shell max-w-7xl">
      <section className="overflow-hidden rounded-[2.25rem] bg-charcoal text-ivory shadow-soft">
        <div className="grid gap-0 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-ivory/80">
                <Sparkles className="h-4 w-4 text-brass" />
                Daily wardrobe brief
              </div>
              <h1 className="text-[1.85rem] font-semibold tracking-normal sm:text-4xl">
                {heroLabel}
              </h1>
              <p className="mt-3 text-sm leading-6 text-ivory/70">
                {heroCopy}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  to="/outfit-memory"
                  className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-ivory px-5 text-sm font-medium text-charcoal transition hover:bg-white"
                >
                  Save Outfit Memory
                </Link>
                <Link
                  to="/wardrobe"
                  className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center rounded-full border border-white/15 px-5 text-sm font-medium text-ivory transition hover:bg-white/10"
                >
                  Open Wardrobe
                </Link>
              </div>
            </div>
          </div>

          <div className="grid border-t border-white/10 xl:border-l xl:border-t-0">
            <div className="px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ivory/55">
                    Today's weather
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-ivory">
                    {tempDisplay} {weatherLabel}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-ivory/70">
                    {weatherAdvice}
                  </p>
                </div>
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/10 text-brass">
                  <WeatherIcon className="h-7 w-7" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="mt-6">
          <ErrorState
            title="Could not load your home view"
            message={error}
            onRetry={() => {
              refreshAll().catch(() => {});
              loadWeather();
            }}
          />
        </div>
      ) : null}

      {actionError ? (
        <div className="mt-6">
          <ErrorState
            title="That action did not stick"
            message={actionError}
          />
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-6">
          <LoadingState />
        </div>
      ) : null}

      {!isLoading && !error ? (
        <div className="mt-5 space-y-5 sm:mt-7 sm:space-y-7">
          {todaysFit ? (
            <HeroOutfitCard
              outfit={todaysFit}
              weatherLabel={weatherLabel}
              isStarterLook={Boolean(todaysFit?.synthetic)}
              onFavorite={handleFavorite}
              onMarkWorn={handleMarkWorn}
              onEdit={setEditingOutfit}
              onDelete={handleDelete}
              isBusy={todaysFit?.synthetic ? false : isOutfitPending(todaysFit?.id)}
            />
          ) : null}

          {goodStartingPoints.length > 0 ? (
            <RailSurface
              eyebrow="Today"
              title={startingPointsTitle}
              description={startingPointsDescription}
              items={goodStartingPoints}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => (
                <OutfitShowcaseCard
                  outfit={outfit}
                  onFavorite={outfit.synthetic ? undefined : handleFavorite}
                  onMarkWorn={outfit.synthetic ? undefined : handleMarkWorn}
                  onEdit={outfit.synthetic ? undefined : setEditingOutfit}
                  onDelete={outfit.synthetic ? undefined : handleDelete}
                  showActions={!outfit.synthetic}
                  isBusy={outfit.synthetic ? false : isOutfitPending(outfit.id)}
                  showMeta={false}
                  supportingText={buildStartingPointNote(outfit, weatherLabel)}
                />
              )}
            />
          ) : null}

          {recentMemories.length > 0 ? (
            <RailSurface
              eyebrow="Memory"
              title="Recent Outfit Memories"
              description="The saved looks you added most recently, kept visible so the app feels alive before deeper rediscovery matters."
              items={recentMemories}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => (
                <OutfitShowcaseCard
                  outfit={outfit}
                  onFavorite={handleFavorite}
                  onMarkWorn={handleMarkWorn}
                  onEdit={setEditingOutfit}
                  onDelete={handleDelete}
                  isBusy={isOutfitPending(outfit.id)}
                  showMeta={false}
                />
              )}
            />
          ) : null}

          {favoriteFits.length > 0 && homeState !== "empty" ? (
            <RailSurface
              eyebrow="Favorites"
              title="Favorite Fits"
              description="Looks you already trust, featured without pretending they are a separate wardrobe."
              items={favoriteFits}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => (
                <OutfitShowcaseCard
                  outfit={outfit}
                  onFavorite={handleFavorite}
                  onMarkWorn={handleMarkWorn}
                  onEdit={setEditingOutfit}
                  onDelete={handleDelete}
                  isBusy={isOutfitPending(outfit.id)}
                  showMeta={false}
                  supportingText="Saved as one of your dependable favorites."
                />
              )}
            />
          ) : null}

          {seasonalStaples.length > 0 && homeState !== "empty" ? (
            <RailSurface
              eyebrow="Season"
              title="Seasonal Staples"
              description="Looks that still make sense for the season, without overexplaining your wardrobe history."
              items={seasonalStaples}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => (
                <OutfitShowcaseCard
                  outfit={outfit}
                  onFavorite={outfit.synthetic ? undefined : handleFavorite}
                  onMarkWorn={outfit.synthetic ? undefined : handleMarkWorn}
                  onEdit={outfit.synthetic ? undefined : setEditingOutfit}
                  onDelete={outfit.synthetic ? undefined : handleDelete}
                  showActions={!outfit.synthetic}
                  isBusy={outfit.synthetic ? false : isOutfitPending(outfit.id)}
                  showMeta={false}
                  supportingText={buildSeasonalNote(outfit)}
                />
              )}
            />
          ) : null}

          {showQuietRediscovery && quietRediscovery.length > 0 ? (
            <RailSurface
              eyebrow="Rediscovery"
              title="Quiet Rediscovery"
              description="Older saved looks that only come forward once your history is rich enough to make resurfacing believable."
              items={quietRediscovery}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => (
                <OutfitShowcaseCard
                  outfit={outfit}
                  onFavorite={handleFavorite}
                  onMarkWorn={handleMarkWorn}
                  onEdit={setEditingOutfit}
                  onDelete={handleDelete}
                  isBusy={isOutfitPending(outfit.id)}
                  showMeta={false}
                  supportingText={buildQuietRediscoveryNote(outfit)}
                />
              )}
            />
          ) : null}

          {homeState === "empty" ? (
            <section className="section-surface p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linen text-brass">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-charcoal">
                    Start with one complete look
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone">
                    DigiCloset gets emotionally useful once it has even a small
                    memory base. Save one outfit first, then the Home page can
                    help more naturally.
                  </p>
                </div>
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

