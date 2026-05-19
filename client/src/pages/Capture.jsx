import {
  Check,
  ChevronDown,
  Loader2,
  Plus,
  ScanFace,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import AutosuggestField from "../components/AutosuggestField.jsx";
import CategoryPicker from "../components/CategoryPicker.jsx";
import ChipSelect from "../components/ChipSelect.jsx";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import OutfitEditModal from "../components/OutfitEditModal";
import OutfitMemoryForm from "../components/OutfitMemoryForm";
import OutfitShowcaseCard from "../components/OutfitShowcaseCard";
import { useWardrobeData } from "../context/WardrobeDataProvider.jsx";
import { api } from "../lib/api";
import {
  formatCategoryLabel,
  formatColorLabel,
  formatOccasionLabel,
  formatSeasonLabel,
  formatStyleLabel,
  normalizeCategory,
  normalizeColor,
  normalizeOccasion,
  normalizeSeason,
  normalizeStyle,
} from "../utils/wardrobeTaxonomy";
import {
  ACCEPTED_IMAGE_INPUT,
  validateImageFile,
} from "../utils/uploadValidation";


function ToolPanel({
  eyebrow,
  title,
  description,
  isOpen,
  onToggle,
  children,
}) {
  return (
    <section className="rounded-[1.75rem] border border-black/5 bg-white p-5 shadow-soft">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-charcoal">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone">
            {description}
          </p>
        </div>
        <span
          className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory text-charcoal transition ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="h-5 w-5" />
        </span>
      </button>

      {isOpen ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

export default function Capture() {
  const {
    outfits,
    outfitsLoading,
    outfitsError,
    createOutfit,
    favoriteOutfit,
    markOutfitWorn,
    updateOutfit,
    deleteOutfit,
    createPiece,
    refreshOutfits,
    isOutfitPending,
  } = useWardrobeData();
  const [isSubmittingOutfit, setIsSubmittingOutfit] = useState(false);
  const [pageError, setPageError] = useState("");

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showAiScan, setShowAiScan] = useState(false);

  const [singleForm, setSingleForm] = useState({
    name: "",
    category: "shirt",
    color: "",
    season: "all",
    occasion: "casual",
    style: "",
  });
  const [singleImage, setSingleImage] = useState(null);
  const [singlePreview, setSinglePreview] = useState(null);
  const [isSavingPiece, setIsSavingPiece] = useState(false);
  const [pieceSavedMessage, setPieceSavedMessage] = useState("");
  const [singleError, setSingleError] = useState("");
  const singleFileRef = useRef(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanSaved, setScanSaved] = useState(false);
  const [scanImage, setScanImage] = useState(null);
  const [scanMessage, setScanMessage] = useState("");
  const scanFileRef = useRef(null);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    if (outfitsError) {
      setPageError(outfitsError);
    }
  }, [outfitsError]);

  async function handleCreateOutfit(payload) {
    setIsSubmittingOutfit(true);
    setPageError("");

    try {
      const createdOutfit = await createOutfit(payload);
      return createdOutfit;
    } catch (err) {
      setPageError(
        err?.response?.data?.detail ||
          "Could not save the outfit memory. Check the backend and try again.",
      );
    } finally {
      setIsSubmittingOutfit(false);
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

  async function handleDelete(outfit) {
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

  function handleSingleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validationMessage = validateImageFile(file);
    if (validationMessage) {
      setSingleImage(null);
      setSinglePreview(null);
      setSingleError(validationMessage);
      event.target.value = "";
      return;
    }

    setSingleImage(file);
    setSinglePreview(URL.createObjectURL(file));
    setPieceSavedMessage("");
    setSingleError("");
  }

  async function handleSingleSubmit(event) {
    event.preventDefault();
    if (!singleForm.name.trim() || !singleForm.color.trim()) {
      alert("Please fill in Name and Color.");
      return;
    }

    setIsSavingPiece(true);
    setPieceSavedMessage("");

    try {
      const formData = new FormData();
      formData.append("name", singleForm.name);
      formData.append("category", normalizeCategory(singleForm.category));
      formData.append("color", normalizeColor(singleForm.color));
      formData.append("season", normalizeSeason(singleForm.season));
      formData.append("occasion", normalizeOccasion(singleForm.occasion));
      formData.append("style", normalizeStyle(singleForm.style));
      formData.append("source_type", "manual_piece");

      if (singleImage) {
        formData.append("image", singleImage);
      }

      await createPiece(formData);

      setPieceSavedMessage("Piece added to wardrobe.");
      setSingleForm({
        name: "",
        category: "shirt",
        color: "",
        season: "all",
        occasion: "casual",
        style: "",
      });
      setSingleImage(null);
      setSinglePreview(null);
      setSingleError("");
      if (singleFileRef.current) {
        singleFileRef.current.value = "";
      }
    } catch (err) {
      alert(
        err?.response?.data?.detail || "Failed to save the clothing piece.",
      );
    } finally {
      setIsSavingPiece(false);
    }
  }

  async function handleAiScan(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validationMessage = validateImageFile(file);
    if (validationMessage) {
      setScanImage(null);
      setScanResult(null);
      setScanSaved(false);
      setScanMessage(validationMessage);
      event.target.value = "";
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    setScanSaved(false);
    setScanImage(file);
    setScanMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/ai/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setScanResult(response.data.data);
    } catch (err) {
      setScanMessage(
        err?.response?.data?.detail ||
          "AI scan is not available right now. You can still use Quick Add Piece below.",
      );
    } finally {
      setIsScanning(false);
    }
  }

  async function handleSaveScannedItem() {
    if (!scanResult) {
      return;
    }

    setIsSavingPiece(true);
    try {
      const formData = new FormData();
      formData.append("name", scanResult.name);
      formData.append("category", normalizeCategory(scanResult.category));
      formData.append("color", normalizeColor(scanResult.color));
      formData.append("season", normalizeSeason(scanResult.season || "all"));
      formData.append("occasion", normalizeOccasion(scanResult.occasion || "casual"));
      formData.append("style", normalizeStyle(scanResult.style || ""));
      formData.append("source_type", "image_upload");

      if (scanImage) {
        formData.append("image", scanImage);
      }

      await createPiece(formData);
      setScanSaved(true);
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to save scanned item.");
    } finally {
      setIsSavingPiece(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition focus:border-charcoal/30";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-8">
      <section className="rounded-[1.9rem] bg-charcoal px-5 py-5 text-ivory shadow-soft sm:px-6 sm:py-6">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-ivory/80">
            <Sparkles className="h-4 w-4 text-brass" />
            Outfit memory first
          </div>
          <h1 className="text-[1.75rem] font-semibold tracking-normal sm:text-[2.1rem]">
            Capture complete looks first. Add single pieces only when you need
            to support the closet.
          </h1>
          <p className="mt-3 text-sm leading-6 text-ivory/70">
            This is the main memory flow for DigiCloset. Quick Add Piece and AI
            Scan are still available, but they stay secondary to saving full
            outfit memories that feel personal enough to revisit later.
          </p>
        </div>
      </section>

      {pageError ? (
        <div className="mt-6">
          <ErrorState
            title="Something needs attention"
            message={pageError}
            onRetry={() => {
              setPageError("");
              refreshOutfits().catch(() => {});
            }}
          />
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 lg:mt-8 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:gap-6">
        <div className="space-y-5 sm:space-y-6">
          <OutfitMemoryForm
            onSubmit={handleCreateOutfit}
            isSubmitting={isSubmittingOutfit}
          />

          <ToolPanel
            eyebrow="Secondary tool"
            title="Quick Add Piece"
            description="Use this only when you need to add a standalone wardrobe piece that is not part of a saved outfit memory yet."
            isOpen={showQuickAdd}
            onToggle={() => setShowQuickAdd((current) => !current)}
          >
            <form onSubmit={handleSingleSubmit} className="space-y-5">
              <div
                className="relative flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-black/10 bg-linen/30 transition hover:bg-linen/50 sm:h-44"
                onClick={() => singleFileRef.current?.click()}
              >
                <input
                  type="file"
                  ref={singleFileRef}
                  className="hidden"
                  accept={ACCEPTED_IMAGE_INPUT}
                  onChange={handleSingleImageChange}
                />
                {singlePreview ? (
                  <img
                    src={singlePreview}
                    alt="Piece preview"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <UploadCloud className="mb-3 h-8 w-8 text-stone/40" />
                    <p className="text-sm font-medium text-charcoal">
                      Optional piece image
                    </p>
                    <p className="mt-1 text-xs text-stone">
                      JPG, PNG, or WEBP up to 10 MB
                    </p>
                  </div>
                )}
              </div>
              {singleError ? (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {singleError}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-stone">
                    Name
                  </label>
                  <input
                    className={inputClass}
                    value={singleForm.name}
                    onChange={(event) =>
                      setSingleForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Navy Polo Shirt"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-stone">
                    Color
                  </label>
                  <AutosuggestField
                    field="color"
                    value={singleForm.color}
                    onChange={(color) =>
                      setSingleForm((current) => ({
                        ...current,
                        color,
                      }))
                    }
                    placeholder="Search color"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-stone">
                    Category
                  </label>
                  <CategoryPicker
                    className="bg-ivory"
                    value={singleForm.category}
                    onChange={(category) =>
                      setSingleForm((current) => ({
                        ...current,
                        category,
                      }))
                    }
                    placeholder="Search category"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-stone">
                    Season
                  </label>
                  <ChipSelect
                    value={singleForm.season}
                    onChange={(season) =>
                      setSingleForm((current) => ({
                        ...current,
                        season,
                      }))
                    }
                    options={["all", "summer", "winter", "rainy", "spring", "autumn"]}
                    formatOption={formatSeasonLabel}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-stone">
                    Occasion
                  </label>
                  <AutosuggestField
                    field="occasion"
                    value={singleForm.occasion}
                    onChange={(occasion) =>
                      setSingleForm((current) => ({
                        ...current,
                        occasion,
                      }))
                    }
                    placeholder="Search occasion"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-stone">
                    Style
                  </label>
                  <AutosuggestField
                    field="style"
                    value={singleForm.style}
                    onChange={(style) =>
                      setSingleForm((current) => ({
                        ...current,
                        style,
                      }))
                    }
                    placeholder="Search style"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingPiece}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory shadow-soft transition hover:bg-softblack disabled:opacity-50"
              >
                {isSavingPiece ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isSavingPiece ? "Saving..." : "Save Piece"}
              </button>

              {pieceSavedMessage ? (
                <div className="flex items-center gap-2 rounded-xl bg-sage/10 px-4 py-3 text-sm font-medium text-sage">
                  <Check className="h-4 w-4" />
                  {pieceSavedMessage}
                </div>
              ) : null}
            </form>
          </ToolPanel>

          <ToolPanel
            eyebrow="Assistive tool"
            title="AI Scan Piece"
            description="Keep this as a helper for single wardrobe pieces only. It is not the main DigiCloset capture path."
            isOpen={showAiScan}
            onToggle={() => setShowAiScan((current) => !current)}
          >
            <div className="space-y-5">
              <div
                className="relative flex h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-black/10 bg-linen/30 transition hover:bg-linen/50 sm:h-48"
                onClick={() => scanFileRef.current?.click()}
              >
                <input
                  type="file"
                  ref={scanFileRef}
                  className="hidden"
                  accept={ACCEPTED_IMAGE_INPUT}
                  onChange={handleAiScan}
                />
                {isScanning ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="mb-4 h-8 w-8 animate-spin text-sage" />
                    <p className="text-sm font-medium text-charcoal">
                      Scanning piece...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <ScanFace className="mb-4 h-8 w-8 text-stone/40" />
                    <p className="text-sm font-medium text-charcoal">
                      Upload a single clothing piece
                    </p>
                    <p className="mt-1 text-xs text-stone">
                      JPG, PNG, or WEBP up to 10 MB
                    </p>
                  </div>
                )}
              </div>

              {scanMessage ? (
                <div className="rounded-2xl border border-black/5 bg-ivory p-4 text-sm leading-6 text-stone">
                  {scanMessage}
                </div>
              ) : null}

              {scanResult ? (
                <div className="rounded-2xl border border-black/5 bg-ivory p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
                    Scan result
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-stone">Name</p>
                      <p className="font-medium text-charcoal">{scanResult.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone">Category</p>
                      <p className="font-medium text-charcoal">
                        {formatCategoryLabel(scanResult.category)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-stone">Color</p>
                      <p className="font-medium text-charcoal">
                        {formatColorLabel(scanResult.color)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-stone">Occasion</p>
                      <p className="font-medium text-charcoal">
                        {formatOccasionLabel(scanResult.occasion)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-stone">Season</p>
                      <p className="font-medium text-charcoal">
                        {formatSeasonLabel(scanResult.season || "all")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-stone">Style</p>
                      <p className="font-medium text-charcoal">
                        {scanResult.style
                          ? formatStyleLabel(scanResult.style)
                          : "Not set"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveScannedItem}
                    disabled={isSavingPiece || scanSaved}
                    className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-sage px-5 text-sm font-medium text-white shadow-soft transition hover:bg-sage/90 disabled:opacity-50"
                  >
                    {isSavingPiece ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {scanSaved ? "Saved to wardrobe" : "Save scanned piece"}
                  </button>
                </div>
              ) : null}
            </div>
          </ToolPanel>
        </div>

        <section className="space-y-4 sm:space-y-5">
          <div className="rounded-[1.75rem] border border-black/5 bg-white p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
              Saved outfit memories
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-charcoal">
              Recent looks
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone">
              Outfit memory is the center of gravity here. Single pieces should
              support what you save as a full look, not compete with it.
            </p>
          </div>

          {outfitsLoading ? <LoadingState /> : null}

          {!outfitsLoading && outfits.length === 0 ? (
            <EmptyState
              title="No outfit memories yet"
              description="Save your first complete look here. The wardrobe will build itself around those memories."
            />
          ) : null}

          {!outfitsLoading && outfits.length > 0 ? (
            <div className="grid gap-4">
              {outfits.slice(0, 4).map((outfit) => (
                <OutfitShowcaseCard
                  key={outfit.id}
                  outfit={outfit}
                  onFavorite={handleFavorite}
                  onMarkWorn={handleMarkWorn}
                  onEdit={setEditingOutfit}
                  onDelete={handleDelete}
                  isBusy={isOutfitPending(outfit.id)}
                  showMeta={false}
                />
              ))}
            </div>
          ) : null}
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
