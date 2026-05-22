import {
  ArrowRight,
  Check,
  CloudRain,
  CloudSun,
  Heart,
  MoreHorizontal,
  Pencil,
  Snowflake,
  Sparkles,
  Sun,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import OutfitEditModal from "../components/OutfitEditModal";
import { useWardrobeData } from "../context/WardrobeDataProvider.jsx";
import { api } from "../lib/api";
import { getImageUrl } from "../services/clothingService";
import {
  generateOutfitNote,
  generateOutfitTitle,
  getWardrobeSection,
  wardrobeSections,
} from "../utils/outfitUtils";
import {
  formatOccasionLabel,
  formatSeasonLabel,
} from "../utils/wardrobeTaxonomy";

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

  return Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)),
  );
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

function formatMemoryDate(value) {
  const date = parseDate(value);
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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
  return items.reduce(
    (groups, item) => {
      const section = getWardrobeSection(item.category);
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(item);
      return groups;
    },
    Object.fromEntries(wardrobeSections.map((section) => [section, []])),
  );
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
    const accessory =
      accessories[index % Math.max(accessories.length, 1)] || null;

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
      created_at: new Date().toISOString(),
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

function getOutfitPreviewImages(outfit) {
  const fromPieces = (outfit?.outfit_items || [])
    .map((item) => item?.clothing_item?.image_url)
    .filter(Boolean)
    .map((url) => getImageUrl(url));

  if (outfit?.image_url) {
    return [getImageUrl(outfit.image_url), ...fromPieces];
  }

  return fromPieces;
}

function HomeEditorialHeader() {
  return (
    <section className="px-2 pt-0.5 text-center sm:px-3">
      <div className="mx-auto max-w-[30rem]">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/72 px-3 py-2 text-xs font-medium text-charcoal shadow-sm backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-brass" />
          Home
        </div>
        <p className="mt-4 font-serif text-[1.15rem] leading-none text-charcoal">
          DigiCloset
        </p>
        <h1 className="mt-2 font-serif text-[1.62rem] leading-[1.04] text-charcoal sm:text-[1.82rem]">
          Looks worth returning to
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone">
          Saved outfits, weather support, and quiet reminders from your closet.
        </p>
      </div>
    </section>
  );
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
  const previewImages = getOutfitPreviewImages(outfit);
  const primaryImageUrl = previewImages[0] || "";
  const detailLink = !isStarterLook && outfit?.id ? `/outfits/${outfit.id}` : null;
  const hasActions = !isStarterLook;

  if (!outfit) {
    return (
      <section className="section-surface overflow-hidden p-2">
        <div className="rounded-[2rem] border border-[#e2d6c4] bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(248,245,238,0.98)_100%)] p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
            {"Today's wardrobe memory"}
          </p>
          <h2 className="mt-3 font-serif text-[1.7rem] leading-tight text-charcoal sm:text-[1.95rem]">
            Your wardrobe memory starts with one saved look.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone">
            Save an outfit you wore recently and DigiCloset will help you
            return to it. If you add a few pieces first, it can still begin
            with calm starting combinations from your closet.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/outfit-memory"
              className="inline-flex h-12 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition hover:bg-softblack"
            >
              Save Outfit Memory
            </Link>
            <Link
              to="/wardrobe"
              className="inline-flex h-12 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-ivory px-5 text-sm font-medium text-charcoal transition hover:bg-linen"
            >
              Open Wardrobe
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
      <section className="section-surface overflow-hidden p-2">
      <div className="rounded-[2rem] border border-[#dccfb9] bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(248,245,238,0.98)_100%)] p-3.5 sm:p-4">
        <div className="grid gap-3.5 rounded-[1.8rem] border border-[#e6dac8] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(246,241,232,0.98))] p-3.5 sm:p-4 md:grid-cols-[0.82fr_1.18fr] md:items-center">
          <div className="order-1">
            <div className="relative flex min-h-[15.75rem] items-end justify-center overflow-hidden rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(232,223,207,0.92)_100%)] px-3 pt-4 sm:min-h-[19.5rem] sm:px-4">
              {primaryImageUrl ? (
                <img
                  src={primaryImageUrl}
                  alt={outfit.title}
                  className="max-h-[15rem] w-auto max-w-full object-contain drop-shadow-[0_18px_35px_rgba(79,60,34,0.14)] sm:max-h-[18.25rem]"
                />
              ) : (
                <div className="relative flex h-full w-full items-center justify-center">
                  {previewImages.slice(0, 3).map((url, index) => (
                    <img
                      key={`${url}-${index}`}
                      src={url}
                      alt={outfit.title}
                      className="absolute h-32 w-32 object-contain mix-blend-multiply drop-shadow-[0_14px_24px_rgba(79,60,34,0.12)] sm:h-40 sm:w-40"
                      style={{
                        transform: `translate(${index * 18 - 18}px, ${index * 18}px) rotate(${index * 6 - 6}deg)`,
                      }}
                    />
                  ))}
                  {previewImages.length === 0 ? (
                    <div className="rounded-[1.4rem] border border-white/65 bg-white/60 px-6 py-8 text-center text-sm text-stone shadow-inner">
                      Saved pieces will gather here once you keep a look.
                    </div>
                  ) : null}
                </div>
              )}

              {previewImages.length > 1 ? (
                <div className="absolute right-3 top-3 hidden flex-col gap-2 sm:flex">
                  {previewImages.slice(0, 4).map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e2d4c0] bg-white/82 shadow-sm backdrop-blur"
                    >
                      <img
                        src={url}
                        alt=""
                        className="h-7 w-7 object-contain mix-blend-multiply"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

            <div className="order-2 flex flex-col justify-between md:min-h-[19.5rem]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone">
                  {isStarterLook ? "From your closet" : "Today's best fit"}
                </p>
              <h2 className="mt-3 font-serif text-[1.8rem] leading-[0.98] text-charcoal sm:text-[2.1rem]">
                  {outfit.title}
                </h2>
              <p className="mt-3 max-w-[18rem] text-sm leading-6 text-stone sm:max-w-[20rem]">
                  {outfit.description ||
                  `A strong starting point for ${weatherLabel.toLowerCase()}.`}
                </p>
              </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-stone shadow-sm">
                  {formatOccasionLabel(outfit.occasion || "casual")}
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-stone shadow-sm">
                  {formatSeasonLabel(outfit.season || "all")}
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-stone shadow-sm">
                  {isStarterLook ? "Starting look" : "Saved memory"}
                </span>
              </div>

              <div className="mt-3.5 flex flex-col gap-3">
                {detailLink ? (
                  <Link
                    to={detailLink}
                    className="inline-flex h-12 min-h-[var(--touch-target-min)] items-center justify-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition hover:bg-softblack sm:w-fit"
                  >
                    View Outfit
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    to="/outfit-memory"
                    className="inline-flex h-12 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition hover:bg-softblack sm:w-fit"
                  >
                    Save Outfit Memory
                  </Link>
                )}

                {hasActions ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onFavorite?.(outfit)}
                      disabled={isBusy}
                      className="inline-flex h-10 min-h-[var(--touch-target-min)] items-center justify-center gap-1.5 rounded-full bg-white px-3 text-xs font-medium text-charcoal transition hover:bg-ivory"
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${
                          outfit.is_favorite ? "fill-current text-red-500" : ""
                        }`}
                      />
                      {outfit.is_favorite ? "Saved" : "Favorite"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onMarkWorn?.(outfit)}
                      disabled={isBusy}
                      className="inline-flex h-10 min-h-[var(--touch-target-min)] items-center justify-center gap-1.5 rounded-full bg-white px-3 text-xs font-medium text-charcoal transition hover:bg-ivory"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Worn
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit?.(outfit)}
                      disabled={isBusy}
                      className="inline-flex h-10 min-h-[var(--touch-target-min)] items-center justify-center gap-1.5 rounded-full bg-white px-3 text-xs font-medium text-charcoal transition hover:bg-ivory"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(outfit)}
                      disabled={isBusy}
                      className="inline-flex h-10 min-h-[var(--touch-target-min)] items-center justify-center gap-1.5 rounded-full bg-white px-3 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/wardrobe"
                      className="inline-flex h-10 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-white px-3 text-xs font-medium text-charcoal transition hover:bg-ivory"
                    >
                      Open Wardrobe
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WeatherSupportCard({
  weatherAdvice,
  tempDisplay,
  weatherLabel,
  preferredSeason,
  WeatherIcon,
}) {
  return (
    <section className="section-surface overflow-hidden p-2">
      <div className="rounded-[1.6rem] border border-[#e4d9c8] bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(246,241,232,0.98)_100%)] px-4 py-3.5 sm:px-5">
        <div className="grid gap-3 sm:grid-cols-[auto_auto_1fr] sm:items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brass shadow-sm">
            <WeatherIcon className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="font-serif text-[1.7rem] leading-none text-charcoal">
              {tempDisplay.replace("°C", "°")}
            </p>
            <p className="text-xs font-medium text-stone">{weatherLabel}</p>
          </div>
          <div className="pt-0.5 sm:border-l sm:border-[#e4d9c8] sm:pl-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone">
              Wear support
            </p>
            <p className="mt-1.5 text-sm leading-6 text-stone">
              {weatherAdvice}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-stone shadow-sm">
                Feels like {tempDisplay}
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-stone shadow-sm">
                {formatSeasonLabel(preferredSeason)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeMemoryRailCard({ outfit, supportingText = "" }) {
  const previewImages = getOutfitPreviewImages(outfit);
  const imageUrl = previewImages[0] || "";

  return (
    <article className="overflow-hidden rounded-[1.4rem] border border-black/5 bg-white shadow-soft">
      <Link
        to={outfit?.synthetic ? "/wardrobe" : `/outfits/${outfit.id}`}
        className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-sage/20"
      >
        <div className="aspect-[4/4.7] overflow-hidden bg-[linear-gradient(135deg,#eee6d9_0%,#f8f5ee_100%)]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={outfit.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-xs text-stone">
              Saved look
            </div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-stone">
              {formatMemoryDate(outfit.created_at) ||
                formatSeasonLabel(outfit.season || "all")}
            </p>
            <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-charcoal">
              {outfit.title}
            </h3>
          </div>
          {outfit.is_favorite ? (
            <Heart className="h-4 w-4 shrink-0 fill-current text-red-500" />
          ) : (
            <MoreHorizontal className="h-4 w-4 shrink-0 text-stone/70" />
          )}
        </div>
        {supportingText ? (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone">
            {supportingText}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function HomeCombinationRailCard({ outfit, supportingText = "" }) {
  const previewImages = getOutfitPreviewImages(outfit);
  const imageUrl = previewImages[0] || "";

  return (
    <article className="overflow-hidden rounded-[1.4rem] border border-black/5 bg-white shadow-soft">
      <Link
        to={outfit?.synthetic ? "/wardrobe" : `/outfits/${outfit.id}`}
        className="grid min-h-[7.75rem] grid-cols-[0.9fr_1.1fr] focus:outline-none focus-visible:ring-4 focus-visible:ring-sage/20"
      >
        <div className="overflow-hidden bg-[linear-gradient(135deg,#eee6d9_0%,#f8f5ee_100%)]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={outfit.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-xs text-stone">
              Favorite look
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between p-3">
          <div>
            <h3 className="line-clamp-2 text-base font-medium leading-6 text-charcoal">
              {outfit.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone">
              {supportingText ||
                (outfit.last_worn_date
                  ? `${Math.max(getDaysSince(outfit.last_worn_date) || 0, 0)} wears ago`
                  : "Saved favorite combination")}
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone">
              {formatMemoryDate(outfit.created_at) ||
                formatSeasonLabel(outfit.season || "all")}
            </span>
            <Heart
              className={`h-4 w-4 ${
                outfit.is_favorite
                  ? "fill-current text-red-500"
                  : "text-stone/70"
              }`}
            />
          </div>
        </div>
      </Link>
    </article>
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
  compact = false,
}) {
  if (items.length === 0 && !emptyTitle) {
    return null;
  }

  return (
    <section className="section-surface overflow-hidden p-4 sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
            {eyebrow}
          </p>
          <h2 className="mt-1.5 font-serif text-[1.45rem] leading-tight text-charcoal sm:text-[1.6rem]">
            {title}
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-stone">
            {description}
          </p>
        </div>
        <span className="rounded-full bg-ivory px-3 py-1 text-[11px] font-medium text-stone">
          {items.length}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="memory-rail">
          {items.map((item) => (
            <div
              key={item.id}
              className={
                compact
                  ? "piece-rail-card !w-[18.5rem]"
                  : "piece-rail-card !w-[12.75rem] sm:!w-[13.5rem]"
              }
            >
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
        const imageDifference =
          Number(Boolean(right.image_url)) - Number(Boolean(left.image_url));
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
    outfits.length === 0 ? "From Your Closet" : "Looks Worth Returning To";
  const startingPointsDescription =
    outfits.length === 0
      ? "Simple combinations built from the pieces you already own, so the app still helps before your outfit history gets deep."
      : "Saved outfits, weather support, and quiet reminders from your closet.";

  return (
    <main className="page-shell max-w-[56rem]">
      <HomeEditorialHeader />

      {error ? (
        <div className="mt-5">
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
        <div className="mt-5">
          <ErrorState title="That action did not stick" message={actionError} />
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-5">
          <LoadingState />
        </div>
      ) : null}

      {!isLoading && !error ? (
        <div className="mx-auto mt-4 w-full max-w-[54rem] space-y-4 sm:mt-5 sm:space-y-5">
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

          <WeatherSupportCard
            weatherAdvice={weatherAdvice}
            tempDisplay={tempDisplay}
            weatherLabel={weatherLabel}
            preferredSeason={preferredSeason}
            WeatherIcon={WeatherIcon}
          />

          {goodStartingPoints.length > 0 ? (
            <RailSurface
              eyebrow="Today"
              title={startingPointsTitle}
              description={startingPointsDescription}
              items={goodStartingPoints}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => (
                <HomeMemoryRailCard
                  outfit={outfit}
                  supportingText={buildStartingPointNote(outfit, weatherLabel)}
                />
              )}
            />
          ) : null}

          {recentMemories.length > 0 ? (
            <RailSurface
              eyebrow="Memory"
              title="Recent Memories"
              description="The saved looks you added most recently, kept visible so your wardrobe memory feels alive and easy to revisit."
              items={recentMemories}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => <HomeMemoryRailCard outfit={outfit} />}
            />
          ) : null}

          {favoriteFits.length > 0 && homeState !== "empty" ? (
            <RailSurface
              eyebrow="Favorites"
              title="Favorite Combinations"
              description="Looks you already trust, kept close without turning Home into a dashboard."
              items={favoriteFits}
              emptyTitle={null}
              emptyDescription={null}
              compact
              renderItem={(outfit) => (
                <HomeCombinationRailCard
                  outfit={outfit}
                  supportingText="Saved as one of your dependable favorites."
                />
              )}
            />
          ) : null}

          {seasonalStaples.length > 0 && homeState !== "empty" ? (
            <RailSurface
              eyebrow="Season"
              title="Seasonal Staples"
              description="Saved looks that still make sense for the season, kept present without turning Home into a system dashboard."
              items={seasonalStaples}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => (
                <HomeMemoryRailCard
                  outfit={outfit}
                  supportingText={buildSeasonalNote(outfit)}
                />
              )}
            />
          ) : null}

          {showQuietRediscovery && quietRediscovery.length > 0 ? (
            <RailSurface
              eyebrow="Rediscovery"
              title="Quiet Rediscovery"
              description="Older saved looks that come back into view once your outfit history is rich enough to make resurfacing feel natural."
              items={quietRediscovery}
              emptyTitle={null}
              emptyDescription={null}
              renderItem={(outfit) => (
                <HomeMemoryRailCard
                  outfit={outfit}
                  supportingText={buildQuietRediscoveryNote(outfit)}
                />
              )}
            />
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
