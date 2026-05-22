import { ArrowLeft, Pencil, Shirt, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import AutosuggestField from "../components/AutosuggestField.jsx";
import CategoryPicker from "../components/CategoryPicker.jsx";
import ChipSelect from "../components/ChipSelect.jsx";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import OutfitEditModal from "../components/OutfitEditModal";
import OutfitShowcaseCard from "../components/OutfitShowcaseCard";
import { useWardrobeData } from "../context/WardrobeDataProvider.jsx";
import { getImageUrl } from "../services/clothingService";
import { formatValue, getWardrobeSection, seasons } from "../utils/outfitUtils";
import {
  formatCategoryLabel,
  formatColorLabel,
  formatFormalityLabel,
  formatOccasionLabel,
  formatSeasonLabel,
  formatStyleLabel,
  normalizeCategory,
  normalizeColor,
  normalizeFormality,
  normalizeOccasion,
  normalizeSeason,
  normalizeStyle,
} from "../utils/wardrobeTaxonomy";

const inputClass =
  "h-11 min-h-[var(--touch-target-min)] w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-charcoal outline-none transition focus:border-sage focus:ring-4 focus:ring-sage/10";

function PieceEditModal({ item, isOpen, isSaving, onClose, onSubmit }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (!item) {
      return;
    }

    setFormData({
      name: item.name || "",
      category: item.category || "shirt",
      color: item.color || "",
      season: item.season || "all",
      occasion: item.occasion || "casual",
      style: item.style || "",
      formality_level: item.formality_level || "",
      source_type: item.source_type || "manual_piece",
    });
  }, [item]);

  if (!isOpen || !item || !formData) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/35 px-3 py-3 sm:items-center sm:px-4 sm:py-8">
      <div className="max-h-[min(92dvh,760px)] w-full max-w-xl overflow-y-auto rounded-[1.75rem] bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
              Edit piece
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-charcoal">
              Update piece details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 min-h-[var(--touch-target-min)] w-10 min-w-[var(--touch-target-min)] items-center justify-center rounded-full bg-ivory text-charcoal transition hover:bg-linen"
            aria-label="Close piece edit"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              X
            </span>
          </button>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({
              ...formData,
              category: normalizeCategory(formData.category),
              color: normalizeColor(formData.color),
              season: normalizeSeason(formData.season),
              occasion: normalizeOccasion(formData.occasion),
              style: normalizeStyle(formData.style),
              formality_level: normalizeFormality(formData.formality_level),
            });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Name
              </label>
              <input
                className={inputClass}
                value={formData.name}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Color
              </label>
              <AutosuggestField
                field="color"
                value={formData.color}
                onChange={(color) =>
                  setFormData((current) => ({
                    ...current,
                    color,
                  }))
                }
                placeholder="Search color"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Category
              </label>
              <CategoryPicker
                className="bg-white"
                value={formData.category}
                onChange={(category) =>
                  setFormData((current) => ({
                    ...current,
                    category,
                  }))
                }
                placeholder="Search category"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Season
              </label>
              <ChipSelect
                value={formData.season}
                onChange={(season) =>
                  setFormData((current) => ({
                    ...current,
                    season,
                  }))
                }
                options={seasons}
                formatOption={formatSeasonLabel}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Occasion
              </label>
              <AutosuggestField
                field="occasion"
                value={formData.occasion}
                onChange={(occasion) =>
                  setFormData((current) => ({
                    ...current,
                    occasion,
                  }))
                }
                placeholder="Search occasion"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Formality level
              </label>
              <ChipSelect
                value={formData.formality_level}
                onChange={(formality_level) =>
                  setFormData((current) => ({
                    ...current,
                    formality_level,
                  }))
                }
                options={["", "low", "medium", "high"]}
                formatOption={formatFormalityLabel}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-charcoal">
              Style
            </label>
            <AutosuggestField
              field="style"
              value={formData.style}
              onChange={(style) =>
                setFormData((current) => ({
                  ...current,
                  style,
                }))
              }
              placeholder="Search style"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-ivory px-5 text-sm font-medium text-charcoal transition hover:bg-linen"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition hover:bg-softblack disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save piece"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailActionButton({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}) {
  const toneClass =
    tone === "danger"
      ? "border-[rgba(185,28,28,0.16)] bg-white text-red-700 hover:bg-red-50"
      : "border-transparent bg-charcoal text-ivory hover:bg-black";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[var(--touch-target-min)] items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition ${toneClass}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export default function PieceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    clothingItems,
    outfits,
    clothingLoading,
    outfitsLoading,
    clothingError,
    outfitsError,
    updatePiece,
    deletePiece,
    favoriteOutfit,
    markOutfitWorn,
    updateOutfit,
    deleteOutfit,
    isOutfitPending,
  } = useWardrobeData();
  const [isEditingPiece, setIsEditingPiece] = useState(false);
  const [isSavingPiece, setIsSavingPiece] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [isSavingOutfit, setIsSavingOutfit] = useState(false);
  const [actionError, setActionError] = useState("");

  const pieceId = Number(id);
  const loadError = clothingError || outfitsError;
  const item = useMemo(
    () => clothingItems.find((entry) => entry.id === pieceId) || null,
    [clothingItems, pieceId],
  );
  const relatedOutfits = useMemo(
    () =>
      outfits.filter((outfit) =>
        (outfit.outfit_items || []).some(
          (outfitItem) =>
            outfitItem.clothing_item?.id === pieceId ||
            outfitItem.clothing_item_id === pieceId,
        ),
      ),
    [outfits, pieceId],
  );

  async function handleDeletePiece() {
    if (!window.confirm(`Delete "${item.name}"?`)) {
      return;
    }

    try {
      setActionError("");
      await deletePiece(item.id);
      navigate("/wardrobe");
    } catch (deleteError) {
      setActionError(
        deleteError?.response?.data?.detail ||
          "This piece could not be deleted safely.",
      );
    }
  }

  async function handleSavePiece(payload) {
    setIsSavingPiece(true);
    try {
      setActionError("");
      await updatePiece(item.id, payload);
      setIsEditingPiece(false);
    } catch (saveError) {
      setActionError(
        saveError?.response?.data?.detail ||
          "Could not save piece changes right now.",
      );
    } finally {
      setIsSavingPiece(false);
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
    } catch (markError) {
      setActionError(
        markError?.response?.data?.detail ||
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

  async function handleSaveOutfit(payload) {
    setIsSavingOutfit(true);
    try {
      await updateOutfit(editingOutfit.id, payload);
      setEditingOutfit(null);
      setActionError("");
    } catch (saveError) {
      setActionError(
        saveError?.response?.data?.detail ||
          "Could not save outfit changes right now.",
      );
    } finally {
      setIsSavingOutfit(false);
    }
  }

  const isLoading = clothingLoading || outfitsLoading;

  if (isLoading) {
    return <LoadingState />;
  }

  if (loadError || !item) {
    return (
      <main className="page-shell max-w-[56rem]">
        {loadError ? (
          <EmptyState title="Piece not available" description={loadError} />
        ) : (
          <EmptyState
            title="Piece not available"
            description="This clothing piece could not be found."
          />
        )}
      </main>
    );
  }

  const imageUrl = getImageUrl(item.image_url);
  const sectionLabel = getWardrobeSection(item.category);
  const metadataPills = [
    { label: "Category", value: formatCategoryLabel(item.category) },
    { label: "Section", value: sectionLabel },
    { label: "Color", value: item.color ? formatColorLabel(item.color) : null },
    { label: "Season", value: formatSeasonLabel(item.season || "all") },
    {
      label: "Occasion",
      value: formatOccasionLabel(item.occasion || "casual"),
    },
    { label: "Style", value: item.style ? formatStyleLabel(item.style) : null },
    {
      label: "Formality",
      value: item.formality_level
        ? formatFormalityLabel(item.formality_level)
        : null,
    },
  ].filter((entry) => entry.value);

  return (
    <main className="page-shell max-w-[56rem]">
      {actionError ? (
        <div className="mb-5 sm:mb-6">
          <ErrorState
            title="That action did not stick"
            message={actionError}
          />
        </div>
      ) : null}

      <section className="section-surface overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
        <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#fbf8f2_0%,#f7f1e8_100%)] px-4 py-7 sm:px-6 sm:py-8">
          <div className="pointer-events-none absolute inset-x-[-12%] top-[-14rem] h-[17rem] rounded-b-[50%] border border-[rgba(182,144,91,0.24)] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(255,255,255,0.28)_70%)]" />
          <div className="relative flex items-start justify-between gap-3">
            <Link
              to="/wardrobe"
              className="inline-flex h-11 min-h-[var(--touch-target-min)] w-11 min-w-[var(--touch-target-min)] items-center justify-center rounded-full bg-white/86 text-charcoal shadow-soft transition hover:bg-white"
              aria-label="Back to wardrobe"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0 flex-1 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone">
                Wardrobe Piece
              </p>
              <h1 className="mt-3 font-serif text-[2.05rem] leading-none text-charcoal sm:text-[2.45rem]">
                {item.name}
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone">
                Used in {relatedOutfits.length} outfit memor
                {relatedOutfits.length === 1 ? "y" : "ies"} from your closet.
              </p>
            </div>
            <div className="h-11 w-11 shrink-0" />
          </div>
        </div>
      </section>

      <div className="mt-5 space-y-5 sm:mt-7 sm:space-y-7">
        <section className="section-surface overflow-hidden p-3 sm:p-4">
          <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#f9f5ee_0%,#fffdf9_100%)]">
            <div className="relative aspect-[4/4.5] min-h-[16rem] overflow-hidden sm:min-h-[19rem]">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f0e7d9_0%,#faf7f1_100%)] p-6">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-sage shadow-soft sm:h-32 sm:w-32">
                    <Shirt className="h-12 w-12" />
                  </div>
                </div>
              )}
            </div>

            <div className="-mt-9 rounded-t-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,#fbf8f2_100%)] px-5 pb-5 pt-7 shadow-[0_-18px_40px_rgba(29,29,27,0.05)] sm:px-6 sm:pb-6 sm:pt-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(182,144,91,0.26)] bg-white text-brass shadow-soft">
                <Shirt className="h-5 w-5" />
              </div>

              <div className="mt-4 text-center">
                <h2 className="font-serif text-[1.8rem] leading-none text-charcoal sm:text-[2.05rem]">
                  {item.name}
                </h2>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone">
                  Used in {relatedOutfits.length} outfit memor
                  {relatedOutfits.length === 1 ? "y" : "ies"}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {metadataPills.map((detail) => (
                  <span
                    key={detail.label}
                    className="rounded-full bg-ivory px-3 py-1.5 text-[11px] font-medium text-stone"
                  >
                    {detail.value}
                  </span>
                ))}
              </div>

              <div className="mt-5 rounded-[1.35rem] bg-white/78 p-4">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
                      Category
                    </p>
                    <p className="mt-2 text-sm font-medium text-charcoal">
                      {formatCategoryLabel(item.category)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
                      Section
                    </p>
                    <p className="mt-2 text-sm font-medium text-charcoal">
                      {sectionLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
                      Source
                    </p>
                    <p className="mt-2 text-sm font-medium text-charcoal">
                      {formatValue(item.source_type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
                      Closet role
                    </p>
                    <p className="mt-2 text-sm font-medium text-charcoal">
                      {sectionLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-surface overflow-hidden p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <DetailActionButton
              icon={Pencil}
              label="Edit Piece"
              onClick={() => setIsEditingPiece(true)}
            />
            <DetailActionButton
              icon={Trash2}
              label="Remove from Closet"
              onClick={handleDeletePiece}
              tone="danger"
            />
          </div>
        </section>

        <section className="section-surface overflow-hidden p-4 sm:p-5">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
                Related looks
              </p>
              <h2 className="mt-2 font-serif text-[1.85rem] leading-none text-charcoal">
                Outfit memories using this piece
              </h2>
            </div>
            <span className="rounded-full bg-ivory px-3 py-1.5 text-xs font-medium text-stone">
              {relatedOutfits.length} saved
            </span>
          </div>

          {relatedOutfits.length > 0 ? (
            <div className="memory-rail">
              {relatedOutfits.map((outfit) => (
                <div key={outfit.id} className="memory-rail-card">
                  <OutfitShowcaseCard
                    outfit={outfit}
                    onFavorite={handleFavorite}
                    onMarkWorn={handleMarkWorn}
                    onEdit={setEditingOutfit}
                    onDelete={handleDeleteOutfit}
                    isBusy={isOutfitPending(outfit.id)}
                    showMeta={false}
                    supportingText="Pulled from your saved looks that already rely on this piece."
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No related outfits yet"
              description="This piece is saved in your wardrobe, but it has not been linked to an outfit memory yet."
            />
          )}
        </section>
      </div>

      <PieceEditModal
        item={item}
        isOpen={isEditingPiece}
        isSaving={isSavingPiece}
        onClose={() => setIsEditingPiece(false)}
        onSubmit={handleSavePiece}
      />

      <OutfitEditModal
        outfit={editingOutfit}
        isOpen={Boolean(editingOutfit)}
        isSaving={isSavingOutfit}
        onClose={() => setEditingOutfit(null)}
        onSubmit={handleSaveOutfit}
      />
    </main>
  );
}
