import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Heart,
  Layers3,
  Pencil,
  Shirt,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import OutfitEditModal from "../components/OutfitEditModal";
import { useWardrobeData } from "../context/WardrobeDataProvider.jsx";
import { getImageUrl } from "../services/clothingService";
import { formatValue } from "../utils/outfitUtils";
import { formatCategoryLabel } from "../utils/wardrobeTaxonomy";

const pieceSectionMap = {
  upper: "Upperwear",
  lower: "Lowerwear",
  footwear: "Footwear",
  outerwear: "Outerwear",
  accessory: "Accessories",
  manual_select: "Other",
};

function formatDate(value) {
  if (!value) {
    return "Not marked worn yet";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatSavedDate(value) {
  if (!value) {
    return "Saved recently";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function groupPiecesBySection(outfitItems) {
  const base = {
    Upperwear: [],
    Lowerwear: [],
    Footwear: [],
    Outerwear: [],
    Accessories: [],
    Other: [],
  };

  outfitItems.forEach((item) => {
    const section = pieceSectionMap[item.slot] || "Other";
    base[section].push(item);
  });

  return base;
}

function MemorySurface({ outfit }) {
  const imageUrl = getImageUrl(outfit.image_url);
  const outfitItems = outfit.outfit_items || [];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-soft">
      <div className="aspect-[4/5] min-h-[17rem] bg-[linear-gradient(135deg,#eee6d9_0%,#f8f5ee_100%)] p-3 sm:aspect-[5/4] sm:min-h-[20rem]">
        <div className="relative h-full overflow-hidden rounded-[1.5rem]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={outfit.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-[1.5rem] bg-white/60 text-stone">
              <div className="relative mx-4 flex h-[220px] w-full max-w-[20rem] items-center justify-center rounded-[1.35rem] border border-white/70 bg-white/55 shadow-inner backdrop-blur-md">
                {outfitItems.length > 0 ? (
                  outfitItems.slice(0, 4).map((item, index) => (
                    <div
                      key={item.id}
                      className="absolute inset-4 flex items-center justify-center opacity-80"
                      style={{
                        transform: `rotate(${index * 4 - 6}deg) translateY(${index * 8}px)`,
                      }}
                    >
                      {item.clothing_item?.image_url ? (
                        <img
                          src={getImageUrl(item.clothing_item.image_url)}
                          alt={item.clothing_item.name}
                          className="h-24 w-24 object-contain mix-blend-multiply"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-sage shadow-soft">
                          <Shirt className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-sage shadow-soft">
                    <Sparkles className="h-10 w-10" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  tone = "default",
  disabled = false,
  active = false,
}) {
  const toneClass =
    tone === "danger"
      ? "bg-white text-red-600 hover:bg-red-50"
      : active
        ? "bg-charcoal text-ivory hover:bg-softblack"
        : "bg-ivory text-charcoal hover:bg-linen";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${toneClass}`}
    >
      <Icon className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
      {label}
    </button>
  );
}

export default function OutfitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const outfitId = Number(id);
  const {
    outfitsLoading,
    outfitsError,
    getOutfitById,
    fetchOutfitById,
    favoriteOutfit,
    markOutfitWorn,
    updateOutfit,
    deleteOutfit,
    isOutfitPending,
  } = useWardrobeData();
  const [isFetchingOutfit, setIsFetchingOutfit] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const requestedOutfitIdRef = useRef(null);

  const outfit = getOutfitById(outfitId);
  const groupedPieces = useMemo(
    () => groupPiecesBySection(outfit?.outfit_items || []),
    [outfit],
  );

  useEffect(() => {
    requestedOutfitIdRef.current = null;
    setLoadError("");
    setIsFetchingOutfit(false);
  }, [outfitId]);

  useEffect(() => {
    async function hydrateOutfit() {
      if (
        !Number.isFinite(outfitId) ||
        outfit ||
        outfitsLoading ||
        isDeleting ||
        loadError ||
        requestedOutfitIdRef.current === outfitId
      ) {
        return;
      }

      requestedOutfitIdRef.current = outfitId;
      setIsFetchingOutfit(true);
      setLoadError("");

      try {
        await fetchOutfitById(outfitId);
      } catch (error) {
        setLoadError(
          error?.response?.status === 404
            ? "This saved look could not be found."
            : error?.response?.data?.detail ||
                "We could not load this outfit right now.",
        );
      } finally {
        setIsFetchingOutfit(false);
      }
    }

    hydrateOutfit();
  }, [
    fetchOutfitById,
    isDeleting,
    loadError,
    outfit,
    outfitId,
    outfitsLoading,
  ]);

  const isBusy = isOutfitPending(outfitId);
  const isLoading = (outfitsLoading && !outfit) || isFetchingOutfit;

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/wardrobe");
  }

  async function handleFavorite() {
    try {
      setActionError("");
      await favoriteOutfit(outfit.id);
    } catch (error) {
      setActionError(
        error?.response?.data?.detail ||
          "Could not update favorites right now.",
      );
    }
  }

  async function handleMarkWorn() {
    try {
      setActionError("");
      await markOutfitWorn(outfit.id);
    } catch (error) {
      setActionError(
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
      setActionError("");
    } catch (error) {
      setActionError(
        error?.response?.data?.detail || "Could not save outfit changes.",
      );
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this outfit memory? This will remove the saved look but keep reusable wardrobe pieces unless they are managed separately.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionError("");
      setIsDeleting(true);
      await deleteOutfit(outfit.id);
      navigate("/wardrobe");
    } catch (error) {
      setIsDeleting(false);
      setActionError(
        error?.response?.data?.detail || "Could not delete that outfit.",
      );
    }
  }

  if (isLoading) {
    return (
      <main className="page-shell max-w-5xl">
        <section className="section-surface p-5 sm:p-6">
          <p className="text-sm font-medium text-stone">
            Finding this outfit memory...
          </p>
        </section>
      </main>
    );
  }

  if (loadError === "This saved look could not be found.") {
    return (
      <main className="page-shell max-w-5xl">
        <EmptyState
          title="This saved look could not be found."
          description="The outfit memory may have been removed, or the link may no longer be valid."
        />
      </main>
    );
  }

  if (!outfit && outfitsError) {
    return (
      <main className="page-shell max-w-5xl">
        <ErrorState
          title="We could not load this outfit right now."
          message={outfitsError}
          onRetry={() => {
            requestedOutfitIdRef.current = null;
            setLoadError("");
            fetchOutfitById(outfitId).catch((error) => {
              setLoadError(
                error?.response?.data?.detail ||
                  "We could not load this outfit right now.",
              );
            });
          }}
        />
      </main>
    );
  }

  if (!outfit && loadError) {
    return (
      <main className="page-shell max-w-5xl">
        <ErrorState
          title="We could not load this outfit right now."
          message={loadError}
          onRetry={() => {
            requestedOutfitIdRef.current = null;
            setLoadError("");
            fetchOutfitById(outfitId).catch((error) => {
              setLoadError(
                error?.response?.data?.detail ||
                  "We could not load this outfit right now.",
              );
            });
          }}
        />
      </main>
    );
  }

  if (!outfit) {
    return (
      <main className="page-shell max-w-5xl">
        <EmptyState
          title="This saved look could not be found."
          description="The outfit memory may have been removed, or the link may no longer be valid."
        />
      </main>
    );
  }

  return (
    <main className="page-shell max-w-5xl">
      {actionError ? (
        <div className="mb-6">
          <ErrorState title="That action did not stick" message={actionError} />
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleBack}
        className="inline-flex h-10 min-h-[var(--touch-target-min)] items-center gap-2 text-sm font-medium text-stone transition hover:text-charcoal"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <section className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
        <MemorySurface outfit={outfit} />

        <div className="space-y-5">
          <section className="rounded-[2rem] border border-black/5 bg-white p-5 shadow-soft sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
              Saved look
            </p>
            <h1 className="mt-2 text-[2rem] font-semibold leading-tight text-charcoal sm:text-[2.3rem]">
              {outfit.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone">
              {outfit.description || "A saved outfit memory worth coming back to."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-ivory px-3 py-1 text-[11px] font-medium capitalize text-stone">
                {formatValue(outfit.occasion)}
              </span>
              <span className="rounded-full bg-ivory px-3 py-1 text-[11px] font-medium capitalize text-stone">
                {formatValue(outfit.season)}
              </span>
              {outfit.style ? (
                <span className="rounded-full bg-ivory px-3 py-1 text-[11px] font-medium capitalize text-stone">
                  {formatValue(outfit.style)}
                </span>
              ) : null}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-ivory p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
                  Saved
                </p>
                <p className="mt-2 text-sm font-medium text-charcoal">
                  {formatSavedDate(outfit.created_at)}
                </p>
              </div>
              <div className="rounded-2xl bg-ivory p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
                  Last worn
                </p>
                <p className="mt-2 text-sm font-medium text-charcoal">
                  {formatDate(outfit.last_worn_date)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/5 bg-white p-5 shadow-soft sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
              Actions
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <ActionButton
                icon={Heart}
                label={outfit.is_favorite ? "Unfavorite" : "Favorite"}
                onClick={handleFavorite}
                disabled={isBusy}
                active={outfit.is_favorite}
              />
              <ActionButton
                icon={CheckCircle2}
                label="Mark worn"
                onClick={handleMarkWorn}
                disabled={isBusy}
              />
              <ActionButton
                icon={Pencil}
                label="Edit"
                onClick={() => setEditingOutfit(outfit)}
                disabled={isBusy}
              />
              <ActionButton
                icon={Trash2}
                label="Delete"
                onClick={handleDelete}
                disabled={isBusy}
                tone="danger"
              />
            </div>
          </section>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-black/5 bg-white p-5 shadow-soft sm:mt-10 sm:p-6">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
            Piece breakdown
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-charcoal">
            Built from these wardrobe pieces
          </h2>
        </div>

        <div className="space-y-5">
          {Object.entries(groupedPieces).map(([section, items]) =>
            items.length > 0 ? (
              <div key={section}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
                  {section}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {items.map((item) => {
                    const piece = item.clothing_item;
                    const pieceImage = getImageUrl(piece?.image_url);

                    return (
                      <Link
                        key={item.id}
                        to={`/pieces/${piece?.id}`}
                        className="flex items-center gap-3 rounded-[1.5rem] bg-ivory p-3 transition hover:bg-linen focus:outline-none focus-visible:ring-4 focus-visible:ring-sage/20"
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
                          {pieceImage ? (
                            <img
                              src={pieceImage}
                              alt={piece?.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Shirt className="h-6 w-6 text-sage" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-charcoal">
                            {piece?.name}
                          </p>
                          <p className="mt-1 text-xs capitalize leading-5 text-stone">
                            {[piece?.color, formatCategoryLabel(piece?.category)]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null,
          )}
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-black/5 bg-white p-5 shadow-soft sm:mt-10 sm:p-6">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
            Memory context
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-charcoal">
            Context that still matters
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Occasion",
              value: formatValue(outfit.occasion),
              icon: Layers3,
            },
            {
              label: "Season",
              value: formatValue(outfit.season),
              icon: CalendarDays,
            },
            {
              label: "Style",
              value: outfit.style ? formatValue(outfit.style) : "Not set",
              icon: Sparkles,
            },
            {
              label: "Source",
              value: formatValue(outfit.source_type || "saved"),
              icon: Sparkles,
            },
            {
              label: "Saved on",
              value: formatSavedDate(outfit.created_at),
              icon: CalendarDays,
            },
            {
              label: "Wear status",
              value: outfit.last_worn_date
                ? `Last worn ${formatDate(outfit.last_worn_date)}`
                : "Not marked worn yet",
              icon: CheckCircle2,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl bg-ivory p-4">
              <Icon className="h-4 w-4 text-sage" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone">
                {label}
              </p>
              <p className="mt-2 text-sm font-medium text-charcoal">{value}</p>
            </div>
          ))}
        </div>
      </section>

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
