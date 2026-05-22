import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Heart,
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
import {
  formatCategoryLabel,
  formatColorLabel,
  formatFormalityLabel,
  formatOccasionLabel,
  formatSeasonLabel,
  formatStyleLabel,
} from "../utils/wardrobeTaxonomy";

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

function getOutfitHeroImage(outfit) {
  if (outfit?.image_url) {
    return getImageUrl(outfit.image_url);
  }

  const linkedImage = (outfit?.outfit_items || []).find(
    (item) => item?.clothing_item?.image_url,
  );

  return linkedImage ? getImageUrl(linkedImage.clothing_item.image_url) : "";
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
      ? "border-red-100 bg-white text-red-600 hover:bg-red-50"
      : active
        ? "border-transparent bg-charcoal text-ivory hover:bg-black"
        : "border-black/8 bg-white text-charcoal hover:bg-ivory";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-[var(--touch-target-min)] items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${toneClass}`}
    >
      <Icon className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
      {label}
    </button>
  );
}

function OutfitHero({ outfit }) {
  const imageUrl = getOutfitHeroImage(outfit);
  const outfitItems = outfit.outfit_items || [];

  return (
    <section className="section-surface overflow-hidden p-3 sm:p-4">
      <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#f8f4eb_0%,#fdfbf7_100%)]">
        <div className="relative aspect-[4/4.75] min-h-[16rem] overflow-hidden sm:min-h-[20rem] lg:min-h-[22rem]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={outfit.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#efe6d8_0%,#faf7f1_100%)] p-6">
              <div className="relative flex h-full w-full max-w-[26rem] items-center justify-center overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/58 shadow-inner backdrop-blur-md">
                {outfitItems.length > 0 ? (
                  outfitItems.slice(0, 4).map((item, index) => (
                    <div
                      key={item.id}
                      className="absolute inset-6 flex items-center justify-center opacity-80"
                      style={{
                        transform: `rotate(${index * 4 - 6}deg) translateY(${index * 10}px)`,
                      }}
                    >
                      {item.clothing_item?.image_url ? (
                        <img
                          src={getImageUrl(item.clothing_item.image_url)}
                          alt={item.clothing_item.name}
                          className="h-28 w-28 object-contain mix-blend-multiply sm:h-32 sm:w-32"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-[1.6rem] bg-white text-sage shadow-soft">
                          <Shirt className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-sage shadow-soft sm:h-28 sm:w-28">
                    <Sparkles className="h-10 w-10" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-charcoal shadow-soft backdrop-blur sm:left-5 sm:top-5">
            Saved look
          </div>
        </div>
      </div>
    </section>
  );
}

function PieceLinkCard({ piece }) {
  const pieceImage = getImageUrl(piece?.image_url);

  return (
    <Link
      to={`/pieces/${piece?.id}`}
      className="block rounded-[1.5rem] bg-white/92 p-2.5 transition hover:-translate-y-0.5 hover:shadow-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-sage/20"
    >
      <div className="aspect-square overflow-hidden rounded-[1.15rem] bg-[linear-gradient(135deg,#f4efe6_0%,#fbf8f2_100%)]">
        {pieceImage ? (
          <img
            src={pieceImage}
            alt={piece?.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sage shadow-soft">
              <Shirt className="h-6 w-6" />
            </div>
          </div>
        )}
      </div>
      <div className="px-1 pb-1 pt-3">
        <p className="line-clamp-1 text-sm font-medium text-charcoal">
          {piece?.name}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone">
          {[formatColorLabel(piece?.color), formatCategoryLabel(piece?.category)]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </Link>
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
      <main className="page-shell max-w-[56rem]">
        <section className="section-surface p-5 sm:p-6">
          <div className="mx-auto max-w-lg py-8 text-center sm:py-10">
            <p className="font-serif text-2xl text-charcoal">
              Finding this outfit memory
            </p>
            <p className="mt-2 text-sm leading-6 text-stone">
              Pulling the saved look, pieces, and context back into view.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (loadError === "This saved look could not be found.") {
    return (
      <main className="page-shell max-w-[56rem]">
        <EmptyState
          title="This saved look could not be found."
          description="The outfit memory may have been removed, or the link may no longer be valid."
        />
      </main>
    );
  }

  if (!outfit && outfitsError) {
    return (
      <main className="page-shell max-w-[56rem]">
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
      <main className="page-shell max-w-[56rem]">
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
      <main className="page-shell max-w-[56rem]">
        <EmptyState
          title="This saved look could not be found."
          description="The outfit memory may have been removed, or the link may no longer be valid."
        />
      </main>
    );
  }

  const memoryDetails = [
    { label: "Season", value: formatSeasonLabel(outfit.season || "all") },
    { label: "Occasion", value: formatOccasionLabel(outfit.occasion || "casual") },
    { label: "Style", value: outfit.style ? formatStyleLabel(outfit.style) : null },
    {
      label: "Formality",
      value: outfit.formality_level
        ? formatFormalityLabel(outfit.formality_level)
        : null,
    },
  ].filter((entry) => entry.value);

  return (
    <main className="page-shell max-w-[56rem]">
      {actionError ? (
        <div className="mb-5 sm:mb-6">
          <ErrorState title="That action did not stick" message={actionError} />
        </div>
      ) : null}

      <section className="section-surface overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
        <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#fbf8f2_0%,#f7f1e8_100%)] px-4 py-7 sm:px-6 sm:py-8">
          <div className="pointer-events-none absolute inset-x-[-12%] top-[-14rem] h-[17rem] rounded-b-[50%] border border-[rgba(182,144,91,0.24)] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(255,255,255,0.28)_70%)]" />
          <div className="relative flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex h-11 min-h-[var(--touch-target-min)] w-11 min-w-[var(--touch-target-min)] items-center justify-center rounded-full bg-white/86 text-charcoal shadow-soft transition hover:bg-white"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone">
                Outfit Memory
              </p>
              <h1 className="mt-3 font-serif text-[2.05rem] leading-none text-charcoal sm:text-[2.45rem]">
                {outfit.title}
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone">
                {outfit.description ||
                  "A saved look worth returning to when you want the day to feel familiar."}
              </p>
            </div>
            <div className="h-11 w-11 shrink-0" />
          </div>
        </div>
      </section>

      <div className="mt-5 space-y-5 sm:mt-7 sm:space-y-7">
        <section className="section-surface overflow-hidden p-3 sm:p-4">
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <OutfitHero outfit={outfit} />

            <section className="section-surface overflow-hidden p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
                Saved look
              </p>
              <h2 className="mt-3 font-serif text-[1.8rem] leading-tight text-charcoal sm:text-[2.05rem]">
                {outfit.title}
              </h2>
              <p className="mt-4 text-sm leading-6 text-stone">
                {outfit.description ||
                  "Pulled from your wardrobe memory with the pieces and context that still make it worth returning to."}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {memoryDetails.map((detail) => (
                  <span
                    key={detail.label}
                    className="rounded-full bg-ivory px-3 py-1.5 text-[11px] font-medium text-stone"
                  >
                    {detail.value}
                  </span>
                ))}
              </div>

              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                <div className="rounded-[1.35rem] bg-ivory p-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
                    Saved
                  </p>
                  <p className="mt-2 text-sm font-medium text-charcoal">
                    {formatSavedDate(outfit.created_at)}
                  </p>
                </div>
                <div className="rounded-[1.35rem] bg-ivory p-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
                    Last worn
                  </p>
                  <p className="mt-2 text-sm font-medium text-charcoal">
                    {formatDate(outfit.last_worn_date)}
                  </p>
                </div>
                <div className="rounded-[1.35rem] bg-ivory p-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
                    Source
                  </p>
                  <p className="mt-2 text-sm font-medium text-charcoal">
                    {formatValue(outfit.source_type || "saved")}
                  </p>
                </div>
                <div className="rounded-[1.35rem] bg-ivory p-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
                    Piece count
                  </p>
                  <p className="mt-2 text-sm font-medium text-charcoal">
                    {(outfit.outfit_items || []).length} piece
                    {(outfit.outfit_items || []).length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section className="section-surface overflow-hidden p-4 sm:p-5">
          <div className="rounded-[1.75rem] border border-black/5 bg-[linear-gradient(180deg,#fbf8f2_0%,#f7f1e8_100%)] p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
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
          </div>
        </section>

        <section className="section-surface overflow-hidden p-4 sm:p-5">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
                Pieces in this outfit
              </p>
              <h2 className="mt-2 font-serif text-[1.85rem] leading-none text-charcoal">
                Built from your wardrobe
              </h2>
            </div>
            <span className="rounded-full bg-ivory px-3 py-1.5 text-xs font-medium text-stone">
              {(outfit.outfit_items || []).length} saved
            </span>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedPieces).map(([section, items]) =>
              items.length > 0 ? (
                <div key={section}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
                    {section}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {items.map((item) => (
                      <PieceLinkCard
                        key={item.id}
                        piece={item.clothing_item || { id: item.clothing_item_id }}
                      />
                    ))}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </section>
      </div>

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
