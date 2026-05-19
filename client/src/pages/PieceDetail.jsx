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
    isPiecePending,
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
      <main className="page-shell">
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

  return (
    <main className="page-shell max-w-5xl">
      {actionError ? (
        <div className="mb-6">
          <ErrorState
            title="That action did not stick"
            message={actionError}
          />
        </div>
      ) : null}

      <Link
        to="/wardrobe"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone transition hover:text-charcoal"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to wardrobe
      </Link>

      <div className="mt-5 grid gap-5 lg:mt-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
        <section className="rounded-[2rem] border border-black/5 bg-white p-5 shadow-soft">
          <div className="flex aspect-square min-h-[280px] items-center justify-center rounded-[1.5rem] bg-[linear-gradient(135deg,#f4efe6_0%,#fbf8f2_100%)] p-4 sm:min-h-[320px]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-sage shadow-soft">
                <Shirt className="h-9 w-9" />
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/5 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
                Piece detail
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-charcoal">
                {item.name}
              </h1>
              <p className="mt-2 text-sm leading-6 text-stone">
                Section: {getWardrobeSection(item.category)}
              </p>
            </div>
            <span className="w-fit rounded-full bg-ivory px-4 py-2 text-sm font-medium text-charcoal">
              {formatColorLabel(item.color)}
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Category", formatCategoryLabel(item.category)],
              ["Season", formatSeasonLabel(item.season || "all")],
              ["Occasion", formatOccasionLabel(item.occasion || "casual")],
              ["Style", item.style ? formatStyleLabel(item.style) : "Not set"],
              [
                "Formality",
                item.formality_level
                  ? formatFormalityLabel(item.formality_level)
                  : "Not set",
              ],
              ["Source", formatValue(item.source_type)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-ivory p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
                  {label}
                </p>
                <p className="mt-2 text-sm font-medium text-charcoal">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => setIsEditingPiece(true)}
              className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition hover:bg-softblack"
            >
              <Pencil className="h-4 w-4" />
              Edit piece
            </button>
            <button
              type="button"
              onClick={handleDeletePiece}
              className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete piece
            </button>
          </div>
        </section>
      </div>

      <section className="mt-8 sm:mt-10">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
            Related outfits
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-charcoal">
            Outfit memories using this piece
          </h2>
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
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No related outfits yet"
            description="This piece is saved in the wardrobe, but it is not linked to any outfit memories yet."
          />
        )}
      </section>

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

