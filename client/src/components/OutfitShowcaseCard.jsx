import {
  CalendarDays,
  CheckCircle,
  Heart,
  Layers3,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { getImageUrl } from "../services/clothingService";
import { formatValue } from "../utils/outfitUtils";

function ActionButton({
  icon: Icon,
  label,
  active = false,
  onClick,
  tone = "default",
  compact = false,
  disabled = false,
}) {
  const toneClass =
    tone === "danger"
      ? "text-red-600 hover:bg-red-50"
      : active
        ? "text-red-500 hover:bg-white"
        : "text-charcoal hover:bg-white";

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex h-10 min-h-[var(--touch-target-min)] items-center gap-2 rounded-full bg-ivory px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-55 ${toneClass}`}
      >
        <Icon className={`h-3.5 w-3.5 ${active ? "fill-current" : ""}`} />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/92 shadow-lg backdrop-blur-sm transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55 ${toneClass}`}
      title={label}
      aria-label={label}
    >
      <Icon className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
    </button>
  );
}

export default function OutfitShowcaseCard({
  outfit,
  onFavorite,
  onMarkWorn,
  onDelete,
  onEdit,
  linkTo,
  showActions = true,
  showMeta = true,
  showDescription = true,
  supportingText = "",
  isBusy = false,
}) {
  const [showMobileActions, setShowMobileActions] = useState(false);
  const imageUrl = getImageUrl(outfit.image_url || outfit.imagePreviewUrl);
  const outfitItems = outfit.outfit_items || [];
  const hasActions = showActions && (onFavorite || onMarkWorn || onEdit || onDelete);
  const resolvedLink =
    linkTo === undefined
      ? outfit?.id && !outfit?.synthetic
        ? `/outfits/${outfit.id}`
        : null
      : linkTo;

  function withAction(callback) {
    return (event) => {
      event.preventDefault();
      callback?.(outfit);
      setShowMobileActions(false);
    };
  }

  function PreviewSurface({ children, className = "" }) {
    if (!resolvedLink) {
      return <div className={className}>{children}</div>;
    }

    return (
      <Link
        to={resolvedLink}
        className={className}
      >
        {children}
      </Link>
    );
  }

  return (
    <article
      className={`group relative h-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
        isBusy ? "opacity-80" : ""
      }`}
      aria-busy={isBusy}
    >
      <div className="relative aspect-[4/5] min-h-[14.5rem] bg-linen sm:min-h-[15rem]">
        <PreviewSurface className="block h-full rounded-t-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-sage/20">
          <div className="absolute left-3 top-3 z-10 rounded-full bg-white/88 px-3 py-1 text-[11px] font-medium tracking-[0.08em] text-charcoal shadow-soft backdrop-blur">
            Saved look
          </div>
          {imageUrl ? (
            <div className="h-full bg-[linear-gradient(135deg,#eee6d9_0%,#f8f5ee_100%)] p-2.5 sm:p-3">
              <img
                src={imageUrl}
                alt={outfit.title}
                className="h-full w-full rounded-[1.15rem] object-cover transition duration-500 group-hover:scale-[1.015]"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#eee6d9_0%,#f8f5ee_100%)]">
              <div className="relative m-4 flex h-[180px] flex-1 items-center justify-center rounded-xl border border-white/50 bg-white/50 shadow-inner backdrop-blur-md">
                {outfitItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="absolute inset-4 flex items-center justify-center opacity-70"
                    style={{
                      transform: `rotate(${index * 4 - 4}deg) translateY(${index * 8}px)`,
                    }}
                  >
                    {item.clothing_item.image_url ? (
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
        </PreviewSurface>

        {hasActions ? (
          <div className="pointer-events-none absolute inset-0 hidden items-end justify-between bg-gradient-to-t from-black/35 via-black/5 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 sm:flex">
            <div className="pointer-events-auto mb-2 flex gap-2">
              <ActionButton
                icon={Heart}
                label={outfit.is_favorite ? "Unfavorite outfit" : "Favorite outfit"}
                active={outfit.is_favorite}
                onClick={withAction(onFavorite)}
                disabled={isBusy}
              />
              <ActionButton
                icon={CheckCircle}
                label="Mark outfit as worn"
                onClick={withAction(onMarkWorn)}
                disabled={isBusy}
              />
              <ActionButton
                icon={Pencil}
                label="Edit outfit"
                onClick={withAction(onEdit)}
                disabled={isBusy}
              />
              <ActionButton
                icon={Trash2}
                label="Delete outfit"
                tone="danger"
                onClick={withAction(onDelete)}
                disabled={isBusy}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <PreviewSurface className="min-w-0 flex-1 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-sage/20">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-base font-semibold leading-6 text-charcoal sm:text-lg">
                {outfit.title}
              </h3>
              {showDescription ? (
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-stone">
                  {outfit.description || "Saved outfit memory"}
                </p>
              ) : null}
            </div>
          </PreviewSurface>

          <div className="flex items-center gap-2">
            {outfit.is_favorite ? (
              <Heart className="hidden h-5 w-5 shrink-0 fill-current text-red-500 sm:block" />
            ) : null}
            {hasActions ? (
              <button
                type="button"
                onClick={() => {
                  setShowMobileActions((current) => !current);
                }}
                disabled={isBusy}
                className="flex h-10 min-h-[var(--touch-target-min)] w-10 min-w-[var(--touch-target-min)] items-center justify-center rounded-full bg-ivory text-charcoal transition hover:bg-linen sm:hidden"
                aria-label={showMobileActions ? "Hide outfit actions" : "Show outfit actions"}
              >
                {showMobileActions ? (
                  <X className="h-4 w-4" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </button>
            ) : null}
          </div>
        </div>

        {showMobileActions && hasActions ? (
          <div className="mt-4 flex flex-wrap gap-2 sm:hidden">
            <ActionButton
              icon={Heart}
              label={outfit.is_favorite ? "Unfavorite" : "Favorite"}
              active={outfit.is_favorite}
              onClick={withAction(onFavorite)}
              compact
              disabled={isBusy}
            />
            <ActionButton
              icon={CheckCircle}
              label="Worn"
              onClick={withAction(onMarkWorn)}
              compact
              disabled={isBusy}
            />
            <ActionButton
              icon={Pencil}
              label="Edit"
              onClick={withAction(onEdit)}
              compact
              disabled={isBusy}
            />
            <ActionButton
              icon={Trash2}
              label="Delete"
              tone="danger"
              onClick={withAction(onDelete)}
              compact
              disabled={isBusy}
            />
          </div>
        ) : null}

        {showMeta ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-ivory p-3">
              <CalendarDays className="h-4 w-4 text-sage" />
              <p className="mt-2 text-xs uppercase tracking-[0.12em] text-stone">
                Season
              </p>
              <p className="text-sm font-medium capitalize text-charcoal">
                {formatValue(outfit.season)}
              </p>
            </div>
            <div className="rounded-2xl bg-ivory p-3">
              <Layers3 className="h-4 w-4 text-sage" />
              <p className="mt-2 text-xs uppercase tracking-[0.12em] text-stone">
                Occasion
              </p>
              <p className="text-sm font-medium capitalize text-charcoal">
                {formatValue(outfit.occasion)}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-ivory px-3 py-1 text-[11px] font-medium capitalize text-stone">
              {formatValue(outfit.season || "all")}
            </span>
            <span className="rounded-full bg-ivory px-3 py-1 text-[11px] font-medium capitalize text-stone">
              {formatValue(outfit.occasion || "casual")}
            </span>
          </div>
        )}

        {supportingText ? (
          <p className="mt-3 text-xs leading-5 text-stone">{supportingText}</p>
        ) : null}
      </div>
    </article>
  );
}
