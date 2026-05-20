import {
  Check,
  FileImage,
  FilePenLine,
  ImagePlus,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Type,
  WandSparkles,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import AutosuggestField from "./AutosuggestField.jsx";
import CategoryPicker from "./CategoryPicker.jsx";
import ChipSelect from "./ChipSelect.jsx";
import { useWardrobeData } from "../context/WardrobeDataProvider.jsx";
import { getImageUrl } from "../services/clothingService";
import {
  emptyPiece,
  formatValue,
  generateOutfitNote,
  generateOutfitTitle,
  parseOutfitDescription,
  roles,
  seasons,
} from "../utils/outfitUtils";
import {
  formatCategoryLabel,
  formatColorLabel,
  formatOccasionLabel,
  formatSeasonLabel,
  getCategorySearchTerms,
  getCategorySection,
  getFieldSearchTerms,
  normalizeOccasion,
  normalizeSeason,
  normalizeStyle,
} from "../utils/wardrobeTaxonomy";
import {
  ACCEPTED_IMAGE_INPUT,
  validateImageFile,
} from "../utils/uploadValidation";

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");
}

function buildSearchTerms(query) {
  return normalizeSearchText(query)
    .split(" ")
    .filter(Boolean);
}

function matchesSearch(haystack, query) {
  const normalizedHaystack = normalizeSearchText(haystack);
  const terms = buildSearchTerms(query);

  if (terms.length === 0) {
    return true;
  }

  return terms.every((term) => normalizedHaystack.includes(term));
}

function deriveRoleFromCategory(category) {
  const section = getCategorySection(category);

  if (section.includes("upperwear")) {
    return "upper";
  }

  if (section.includes("lowerwear")) {
    return "lower";
  }

  if (section === "Footwear") {
    return "footwear";
  }

  if (section === "Outerwear") {
    return "outerwear";
  }

  if (section === "Accessories" || section === "Drapes") {
    return "accessory";
  }

  if (section === "One-piece / Full body" || section === "Indian full outfit") {
    return "upper";
  }

  return "upper";
}

function collectExistingPieceSearchText(item) {
  return [
    item.name,
    ...getCategorySearchTerms(item.category),
    getCategorySection(item.category),
    item.color,
    ...getFieldSearchTerms("color", item.color),
    item.season,
    ...getFieldSearchTerms("season", item.season),
    item.occasion,
    ...getFieldSearchTerms("occasion", item.occasion),
    item.style,
    ...getFieldSearchTerms("style", item.style),
  ]
    .filter(Boolean)
    .join(" ");
}

const captureModes = [
  {
    id: "image_only",
    title: "Image only",
    description: "Upload a photo",
    icon: FileImage,
  },
  {
    id: "text_only",
    title: "Text only",
    description: "Describe the look",
    icon: Type,
  },
  {
    id: "manual_only",
    title: "Manual only",
    description: "Build it piece by piece",
    icon: Plus,
  },
];

function SectionCard({ title, description, children, className = "" }) {
  return (
    <section
      className={`rounded-[1.7rem] border border-[#e8ddcd] bg-[linear-gradient(180deg,rgba(251,248,242,0.98)_0%,rgba(247,242,234,0.94)_100%)] p-4 sm:p-5 ${className}`}
    >
      {title ? (
        <div className="mb-4">
          <p className="font-serif text-[1.45rem] leading-tight text-charcoal">
            {title}
          </p>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-stone">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function TextInput({ value, name, onChange, placeholder, required = false }) {
  return (
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="h-11 w-full rounded-[1.15rem] border border-[#e1d5c3] bg-white px-3.5 text-sm text-charcoal outline-none transition placeholder:text-stone/60 focus:border-sage focus:bg-white focus:ring-4 focus:ring-sage/10"
    />
  );
}

function SelectInput({ value, name, onChange, options }) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="h-11 w-full rounded-[1.15rem] border border-[#e1d5c3] bg-white px-3.5 text-sm capitalize text-charcoal outline-none transition focus:border-sage focus:bg-white focus:ring-4 focus:ring-sage/10"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {formatValue(option)}
        </option>
      ))}
    </select>
  );
}

function TextArea({ value, name, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-[1.15rem] border border-[#e1d5c3] bg-white px-3.5 py-3 text-sm text-charcoal outline-none transition placeholder:text-stone/60 focus:border-sage focus:ring-4 focus:ring-sage/10"
    />
  );
}

function ModeCard({ mode, activeMode, onClick }) {
  const Icon = mode.icon;
  const isActive = activeMode === mode.id;

  return (
    <button
      type="button"
      onClick={() => onClick(mode.id)}
      className={`min-h-[7.75rem] rounded-[1.45rem] border px-4 py-4 text-left transition ${
        isActive
          ? "border-charcoal bg-white shadow-soft"
          : "border-[#e4d8c7] bg-white/88 hover:border-[#d8c8b0] hover:bg-white"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
          isActive ? "bg-charcoal text-ivory" : "bg-linen text-brass"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3.5 text-[15px] font-semibold text-charcoal">{mode.title}</p>
      <p className="mt-1 text-sm leading-6 text-stone">{mode.description}</p>
    </button>
  );
}

function PreviewBadge({ label, value }) {
  return (
    <div className="rounded-[1.35rem] border border-[#e8ddcd] bg-white px-3.5 py-3 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium capitalize text-charcoal">
        {value}
      </p>
    </div>
  );
}

function PieceSlot({ label, piece }) {
  return (
    <div className="rounded-[1.35rem] border border-[#e8ddcd] bg-white px-3.5 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-charcoal">
        {piece ? piece.name : "Not added yet"}
      </p>
    </div>
  );
}

function ExistingPieceCard({ item, onRemove }) {
  const imageUrl = getImageUrl(item.image_url);

  return (
    <div className="flex items-center gap-3 rounded-[1.35rem] border border-[#e7dccb] bg-white px-3.5 py-3 shadow-soft">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] bg-[linear-gradient(135deg,#f4efe6_0%,#fbf8f2_100%)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sage shadow-soft">
            <Sparkles className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-charcoal">{item.name}</p>
          <span className="rounded-full bg-ivory px-2.5 py-1 text-[11px] font-medium text-stone">
            Existing piece
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-stone">
          {[formatCategoryLabel(item.category), formatColorLabel(item.color)]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="flex h-9 w-9 min-w-[var(--touch-target-min)] items-center justify-center rounded-full bg-ivory text-charcoal transition hover:bg-linen"
        aria-label={`Remove ${item.name} from selected pieces`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function SearchResultButton({ item, onSelect }) {
  const imageUrl = getImageUrl(item.image_url);

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className="flex min-h-[var(--touch-target-min)] w-full items-center gap-3 rounded-[1.25rem] px-3 py-3 text-left transition hover:bg-white"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-[#ece2d3] bg-white">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Sparkles className="h-4 w-4 text-sage" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-charcoal">{item.name}</p>
        <p className="mt-1 text-xs leading-5 text-stone">
          {[
            formatCategoryLabel(item.category),
            formatColorLabel(item.color),
            getCategorySection(item.category),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </button>
  );
}

function ImagePicker({
  imagePreviewUrl,
  imageName,
  fileInputRef,
  onChange,
  onRemove,
  helperText,
}) {
  return (
    <SectionCard title="Outfit image" description={helperText}>
      <div className="rounded-[1.55rem] border border-dashed border-[#d7c8b2] bg-white/94 p-4">
        {imagePreviewUrl ? (
          <div className="space-y-4">
            <div className="flex h-56 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,#f4efe6_0%,#fbf8f2_100%)] p-3 sm:h-72 sm:p-4">
              <img
                src={imagePreviewUrl}
                alt="Outfit preview"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-charcoal">
                  {imageName || "Outfit photo selected"}
                </p>
                <p className="text-xs text-stone">
                  We&apos;ll use this as your outfit memory.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-linen px-4 text-sm font-medium text-charcoal transition hover:bg-brass/15"
                >
                  <ImagePlus className="h-4 w-4" />
                  Change image
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-stone transition hover:text-charcoal"
                >
                  <X className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,#f4efe6_0%,#fbf8f2_100%)] px-4 py-8 text-center transition hover:bg-white sm:py-10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sage shadow-soft">
              <ImagePlus className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-medium text-charcoal">
              Add outfit photo
            </p>
            <p className="mt-1 text-xs leading-6 text-stone">
              JPG, PNG, or WEBP up to 10 MB
            </p>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_INPUT}
          onChange={onChange}
          className="sr-only"
        />
      </div>
    </SectionCard>
  );
}

function PiecesEditor({
  pieces,
  updatePiece,
  removePiece,
  addPiece,
  clothingItems,
  selectedExistingPieces,
  addExistingPiece,
  removeExistingPiece,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const matchingExistingPieces = useMemo(() => {
    const trimmedQuery = searchQuery.trim();

    return clothingItems
      .filter(
        (item) =>
          !selectedExistingPieces.some((selected) => selected.id === item.id),
      )
      .filter((item) =>
        trimmedQuery
          ? matchesSearch(collectExistingPieceSearchText(item), trimmedQuery)
          : false,
      )
      .slice(0, 8);
  }, [clothingItems, searchQuery, selectedExistingPieces]);

  return (
    <SectionCard
      title="Reuse from your wardrobe"
      description="Search pieces you already own first so reuse feels easier than duplication."
    >
      <div className="space-y-6">
        <div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone/60">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search your wardrobe"
              className="h-11 min-h-[var(--touch-target-min)] w-full rounded-[1.15rem] border border-[#e1d5c3] bg-white pl-10 pr-3 text-sm text-charcoal outline-none transition placeholder:text-stone/60 focus:border-sage focus:ring-4 focus:ring-sage/10"
            />
          </div>
          <div className="mt-3 rounded-[1.45rem] border border-[#e7dccb] bg-white/76 p-2 shadow-soft">
            {searchQuery.trim() ? (
              matchingExistingPieces.length > 0 ? (
                <div className="space-y-1">
                  {matchingExistingPieces.map((item) => (
                    <SearchResultButton
                      key={item.id}
                      item={item}
                      onSelect={addExistingPiece}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-3 py-4 text-sm leading-6 text-stone">
                  No matching pieces yet. Create it as a new piece.
                </div>
              )
            ) : (
              <div className="px-3 py-4 text-sm leading-6 text-stone">
                Search by name, category, color, season, occasion, or style.
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="font-serif text-[1.35rem] leading-tight text-charcoal">
              Selected pieces
            </p>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone shadow-soft">
              {selectedExistingPieces.length}
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {selectedExistingPieces.length > 0 ? (
              selectedExistingPieces.map((item) => (
                <ExistingPieceCard
                  key={item.id}
                  item={item}
                  onRemove={removeExistingPiece}
                />
              ))
            ) : (
              <div className="rounded-[1.55rem] border border-dashed border-[#d5c7b2] bg-white px-4 py-5 text-sm leading-6 text-stone">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#d8cbb7] bg-[linear-gradient(180deg,#fdfaf5_0%,#f5ede2_100%)] text-charcoal">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">
                      Add pieces to build your outfit
                    </p>
                    <p className="mt-1 text-sm text-stone">
                      Search or create new pieces to get started.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-serif text-[1.35rem] leading-tight text-charcoal">
                Create new piece
              </p>
              <p className="mt-1 text-sm leading-6 text-stone">
                Only add a new piece if it is not already in your wardrobe.
              </p>
            </div>
            <button
              type="button"
              onClick={addPiece}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-charcoal shadow-soft transition hover:bg-brass/15"
            >
              <Plus className="h-4 w-4" />
              Add piece
            </button>
          </div>

          {pieces.map((piece, index) => (
            <div
              key={index}
              className="rounded-[1.45rem] border border-[#e7dccb] bg-white p-4 shadow-soft"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-linen px-3 py-1 text-xs font-medium text-charcoal">
                    Piece {index + 1}
                  </span>
                  <span className="rounded-full bg-ivory px-3 py-1 text-xs font-medium capitalize text-stone">
                    {formatValue(piece.role)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removePiece(index)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-stone transition hover:bg-ivory hover:text-charcoal"
                  aria-label={`Remove piece ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput
                  name="name"
                  value={piece.name}
                  onChange={(event) =>
                    updatePiece(index, "name", event.target.value)
                  }
                  placeholder="Maroon shirt"
                  required
                />
                <AutosuggestField
                  field="color"
                  value={piece.color}
                  onChange={(color) => updatePiece(index, "color", color)}
                  placeholder="Search color"
                />
                <CategoryPicker
                  value={piece.category}
                  onChange={(category) => updatePiece(index, "category", category)}
                  placeholder="Search category"
                />
                <SelectInput
                  name="role"
                  value={piece.role}
                  onChange={(event) =>
                    updatePiece(index, "role", event.target.value)
                  }
                  options={roles}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

export default function OutfitMemoryForm({ onSubmit, isSubmitting }) {
  const { clothingItems } = useWardrobeData();
  const [captureMode, setCaptureMode] = useState("manual_only");
  const [formData, setFormData] = useState({
    title: "",
    occasion: "casual",
    season: "all",
    style: "",
    descriptionText: "",
    photoNote: "",
  });
  const [pieces, setPieces] = useState([{ ...emptyPiece }]);
  const [selectedExistingPieceIds, setSelectedExistingPieceIds] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [parseMessage, setParseMessage] = useState("");
  const [saveFeedback, setSaveFeedback] = useState("");

  const fileInputRef = useRef(null);

  const selectedExistingPieces = useMemo(
    () =>
      clothingItems.filter((item) => selectedExistingPieceIds.includes(item.id)),
    [clothingItems, selectedExistingPieceIds],
  );

  const validNewPieces = useMemo(
    () =>
      pieces
        .map((piece) => ({
          ...piece,
          name: piece.name.trim(),
          color: piece.color.trim(),
        }))
        .filter((piece) => piece.name && piece.color)
        .map((piece) => ({
          ...piece,
          source_type: "manual_piece",
        })),
    [pieces],
  );

  const selectedExistingPieceSummaries = useMemo(
    () =>
      selectedExistingPieces.map((piece) => ({
        id: piece.id,
        name: piece.name,
        category: piece.category,
        color: piece.color,
        role: deriveRoleFromCategory(piece.category),
      })),
    [selectedExistingPieces],
  );

  const validPieces = useMemo(
    () => [...validNewPieces, ...selectedExistingPieceSummaries],
    [selectedExistingPieceSummaries, validNewPieces],
  );

  const generatedTitle = useMemo(
    () =>
      generateOutfitTitle({
        pieces: validPieces,
        occasion: formData.occasion,
        season: formData.season,
        style: formData.style,
      }),
    [validPieces, formData.occasion, formData.season, formData.style],
  );

  const generatedNote = useMemo(() => {
    if (captureMode === "image_only" && formData.photoNote.trim()) {
      return formData.photoNote.trim();
    }

    return generateOutfitNote({
      pieces: validPieces,
      occasion: formData.occasion,
      season: formData.season,
    });
  }, [
    captureMode,
    formData.photoNote,
    formData.occasion,
    formData.season,
    validPieces,
  ]);

  const previewSlots = useMemo(() => {
    const slotMap = {
      upper: null,
      lower: null,
      footwear: null,
      outerwear: null,
      accessory: null,
    };

    validPieces.forEach((piece) => {
      if (!slotMap[piece.role]) {
        slotMap[piece.role] = piece;
      }
    });

    return slotMap;
  }, [validPieces]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (saveFeedback) {
      setSaveFeedback("");
    }
  };

  const updatePiece = (index, field, value) => {
    setPieces((current) =>
      current.map((piece, pieceIndex) =>
        pieceIndex === index ? { ...piece, [field]: value } : piece,
      ),
    );
  };

  const addPiece = () => {
    setPieces((current) => [...current, { ...emptyPiece }]);
  };

  const addExistingPiece = (pieceId) => {
    setSelectedExistingPieceIds((current) =>
      current.includes(pieceId) ? current : [...current, pieceId],
    );
  };

  const removeExistingPiece = (pieceId) => {
    setSelectedExistingPieceIds((current) =>
      current.filter((currentId) => currentId !== pieceId),
    );
  };

  const removePiece = (index) => {
    setPieces((current) =>
      current.length === 1
        ? [{ ...emptyPiece }]
        : current.filter((_, pieceIndex) => pieceIndex !== index),
    );
  };

  const handleModeChange = (modeId) => {
    setCaptureMode(modeId);
    setParseMessage("");
    setSaveFeedback("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreviewUrl("");
      setImageName("");
      return;
    }

    const validationMessage = validateImageFile(file);
    if (validationMessage) {
      clearImage();
      setParseMessage(validationMessage);
      if (event.target) {
        event.target.value = "";
      }
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreviewUrl(String(reader.result || ""));
      setImageName(file.name);
      setParseMessage(
        "Photo ready. You can keep this simple and move straight into the memory.",
      );
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreviewUrl("");
    setImageName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setParseMessage("");
  };

  const handleParseDescription = () => {
    const suggestedPieces = parseOutfitDescription(formData.descriptionText);

    if (suggestedPieces.length === 0) {
      setParseMessage(
        "We could not suggest pieces from that description yet. Try a calmer breakdown like cream pants, navy shirt, or white sneakers.",
      );
      return;
    }

    setPieces(suggestedPieces);
    setParseMessage(
      "Suggested breakdown added. Confirm what feels right, then save the memory.",
    );
  };

  const resetForm = () => {
    setCaptureMode("manual_only");
    setFormData({
      title: "",
      occasion: "casual",
      season: "all",
      style: "",
      descriptionText: "",
      photoNote: "",
    });
    setPieces([{ ...emptyPiece }]);
    setSelectedExistingPieceIds([]);
    setImageFile(null);
    setImagePreviewUrl("");
    setImageName("");
    setParseMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const canSubmit = useMemo(() => {
    if (captureMode === "image_only") {
      return Boolean(imageFile && formData.title.trim());
    }

    return validPieces.length > 0;
  }, [captureMode, formData.title, imageFile, validPieces]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const payload = {
      title: formData.title.trim() || generatedTitle,
      style: normalizeStyle(formData.style),
      occasion: normalizeOccasion(formData.occasion),
      season: normalizeSeason(formData.season),
      imagePreviewUrl,
      imageFile,
      imageName,
      pieces:
        captureMode === "text_only" || captureMode === "manual_only"
          ? validNewPieces
          : [],
      clothing_item_ids:
        captureMode === "text_only" || captureMode === "manual_only"
          ? selectedExistingPieceIds
          : [],
      description:
        captureMode === "image_only"
          ? formData.photoNote.trim() || generatedNote
          : generatedNote,
      source_type:
        captureMode === "text_only"
          ? "text_input"
          : captureMode === "manual_only"
            ? "manual_build"
            : "image_upload",
    };

    const savedOutfit = await onSubmit(payload);
    const savedTitle = payload.title || savedOutfit?.title || generatedTitle;

    resetForm();
    event.target.reset();
    setSaveFeedback(`Saved "${savedTitle}" to your outfit memories.`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-[#e7dccb] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,245,238,0.98)_100%)] p-4 shadow-soft sm:p-5"
    >
      <div className="mb-6 rounded-[1.7rem] border border-[#eadfce] bg-white/78 px-4 py-4 text-center sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
          How would you like to capture this outfit?
        </p>
      </div>

      {saveFeedback ? (
        <div className="mb-5 flex items-start gap-3 rounded-[1.55rem] border border-sage/15 bg-sage/10 px-4 py-4 text-sm text-charcoal">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sage shadow-soft">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">Outfit memory saved</p>
            <p className="mt-1 leading-6 text-stone">{saveFeedback}</p>
          </div>
        </div>
      ) : null}

      <section className="mb-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {captureModes.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              activeMode={captureMode}
              onClick={handleModeChange}
            />
          ))}
        </div>
      </section>

      <div className="space-y-5">
        {captureMode === "image_only" ? (
          <>
            <ImagePicker
              imagePreviewUrl={imagePreviewUrl}
              imageName={imageName}
              fileInputRef={fileInputRef}
              onChange={handleImageChange}
              onRemove={clearImage}
              helperText="Upload the full look first, then add only the details that help you remember it."
            />

            <SectionCard
              title="Add the memory"
              description="Keep it light. A title is enough, and notes can stay optional."
            >
              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-charcoal">
                    Outfit title
                  </label>
                  <TextInput
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={generatedTitle || "Soft coffee run look"}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-charcoal">
                    Add notes (optional)
                  </label>
                  <TextArea
                    name="photoNote"
                    value={formData.photoNote}
                    onChange={handleChange}
                    placeholder="Easy neutral fit for a long campus day."
                    rows={4}
                  />
                </div>
              </div>
            </SectionCard>
          </>
        ) : null}

        {captureMode === "text_only" ? (
          <>
            <SectionCard
              title="Describe the look"
              description="Write the outfit in plain language, then confirm the pieces that feel right."
            >
              <TextArea
                name="descriptionText"
                value={formData.descriptionText}
                onChange={handleChange}
                placeholder="Cream hoodie with dark jeans and white sneakers"
              />

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleParseDescription}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-charcoal px-4 text-sm font-medium text-ivory shadow-soft transition hover:bg-softblack"
                >
                  <WandSparkles className="h-4 w-4" />
                  Suggest pieces
                </button>
                <p className="text-xs leading-6 text-stone">
                  Suggested breakdown only. It is a gentle parser, not magic.
                </p>
              </div>

              {parseMessage ? (
                <div className="mt-4 rounded-[1.35rem] border border-[#e7dccb] bg-white p-4 text-sm leading-6 text-stone">
                  {parseMessage}
                </div>
              ) : null}
            </SectionCard>

            <PiecesEditor
              pieces={pieces}
              updatePiece={updatePiece}
              removePiece={removePiece}
              addPiece={addPiece}
              clothingItems={clothingItems}
              selectedExistingPieces={selectedExistingPieces}
              addExistingPiece={addExistingPiece}
              removeExistingPiece={removeExistingPiece}
            />

            <SectionCard title="Finish the title">
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Outfit title
              </label>
              <TextInput
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={generatedTitle || "Weekend ivory layers"}
              />
            </SectionCard>
          </>
        ) : null}

        {captureMode === "manual_only" ? (
          <>
            <PiecesEditor
              pieces={pieces}
              updatePiece={updatePiece}
              removePiece={removePiece}
              addPiece={addPiece}
              clothingItems={clothingItems}
              selectedExistingPieces={selectedExistingPieces}
              addExistingPiece={addExistingPiece}
              removeExistingPiece={removeExistingPiece}
            />

            <SectionCard title="Name the look">
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Outfit title
              </label>
              <TextInput
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={generatedTitle || "Library day layers"}
              />
            </SectionCard>
          </>
        ) : null}

        <SectionCard
          title="Style context"
          description="Light context helps the memory feel remembered without turning this into a big form."
        >
          <div className="grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Occasion
              </label>
              <AutosuggestField
                field="occasion"
                value={formData.occasion}
                onChange={(occasion) =>
                  setFormData((current) => ({ ...current, occasion }))
                }
                placeholder="Search occasion"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Season
              </label>
              <ChipSelect
                value={formData.season}
                onChange={(season) =>
                  setFormData((current) => ({ ...current, season }))
                }
                options={seasons}
                formatOption={formatSeasonLabel}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Style or aesthetic
              </label>
              <AutosuggestField
                field="style"
                value={formData.style}
                onChange={(style) =>
                  setFormData((current) => ({ ...current, style }))
                }
                placeholder="Search style"
              />
            </div>
          </div>
        </SectionCard>

        <section className="rounded-[1.75rem] border border-[#e7dccb] bg-white/92 p-4 shadow-soft sm:p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ivory text-brass shadow-soft">
              <FilePenLine className="h-4 w-4" />
            </div>
            <div>
              <p className="font-serif text-[1.35rem] leading-tight text-charcoal">
                Outfit preview
              </p>
              <p className="mt-1 text-sm leading-6 text-stone">
                See how the memory will read before you save it.
              </p>
            </div>
          </div>

          {imagePreviewUrl ? (
            <div className="rounded-[1.5rem] border border-[#eadfce] bg-white p-4">
              <div className="flex h-56 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#f4efe6_0%,#fbf8f2_100%)] p-3 sm:h-72 sm:p-4">
                <img
                  src={imagePreviewUrl}
                  alt="Outfit memory preview"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-[#eadfce] bg-white p-4">
              <div className="flex min-h-[14rem] flex-col justify-between rounded-[1.25rem] bg-[linear-gradient(135deg,#f4efe6_0%,#fbf8f2_100%)] p-4 sm:min-h-72">
                <div className="mx-auto flex h-36 w-24 items-end justify-center rounded-[999px] border border-dashed border-charcoal/10 bg-white/70">
                  <div className="flex h-24 w-14 items-center justify-center rounded-t-[999px] bg-charcoal/6" />
                </div>
                <div className="grid gap-2">
                  <PieceSlot label="Upper" piece={previewSlots.upper} />
                  <PieceSlot label="Lower" piece={previewSlots.lower} />
                  <PieceSlot label="Footwear" piece={previewSlots.footwear} />
                  <PieceSlot label="Outerwear" piece={previewSlots.outerwear} />
                  <PieceSlot label="Accessory" piece={previewSlots.accessory} />
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <PreviewBadge
              label="Title"
              value={formData.title.trim() || generatedTitle || "Outfit memory"}
            />
            <PreviewBadge
              label="Occasion"
              value={formatOccasionLabel(formData.occasion)}
            />
            <PreviewBadge
              label="Season"
              value={formatSeasonLabel(formData.season)}
            />
          </div>

          <div className="mt-4 rounded-[1.35rem] bg-white p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
              Outfit note
            </p>
            <p className="mt-2 text-sm leading-6 text-charcoal">
              {generatedNote}
            </p>
          </div>

          {(captureMode === "text_only" || captureMode === "manual_only") ? (
            <div className="mt-4 rounded-[1.35rem] bg-white p-4 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
                Pieces summary
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {validPieces.length > 0 ? (
                  validPieces.map((piece, index) => (
                    <span
                      key={`${piece.name}-${index}`}
                      className="rounded-full bg-linen px-3 py-2 text-xs font-medium capitalize text-charcoal"
                    >
                      {piece.name} · {formatValue(piece.role)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-stone">
                    Add or reuse pieces to build the outfit summary.
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !canSubmit}
        className="mt-6 inline-flex h-12 min-h-[var(--touch-target-min)] w-full items-center justify-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory shadow-soft transition hover:bg-softblack disabled:cursor-not-allowed disabled:bg-stone"
      >
        <Sparkles className="h-4 w-4" />
        {isSubmitting ? "Saving outfit memory..." : "Save Outfit to My Closet"}
      </button>
    </form>
  );
}
