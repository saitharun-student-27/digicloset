import {
  Check,
  FileImage,
  FilePenLine,
  ImagePlus,
  Plus,
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
  formatOccasionLabel,
  formatSeasonLabel,
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


const captureModes = [
  {
    id: "photo_note",
    title: "Upload outfit photo",
    description: "Save a look from an outfit image with a short note.",
    icon: FileImage,
  },
  {
    id: "text_input",
    title: "Type the outfit",
    description: "Write the look in text and confirm the suggested pieces.",
    icon: Type,
  },
  {
    id: "image_title",
    title: "Image with title only",
    description: "Save just the outfit image and title without extra breakdown.",
    icon: ImagePlus,
  },
];

function TextInput({ value, name, onChange, placeholder, required = false }) {
  return (
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-charcoal outline-none transition placeholder:text-stone/60 focus:border-sage focus:bg-white focus:ring-4 focus:ring-sage/10"
    />
  );
}

function SelectInput({ value, name, onChange, options }) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm capitalize text-charcoal outline-none transition focus:border-sage focus:bg-white focus:ring-4 focus:ring-sage/10"
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
      className="w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm text-charcoal outline-none transition placeholder:text-stone/60 focus:border-sage focus:ring-4 focus:ring-sage/10"
    />
  );
}

function ModeCard({ mode, activeMode, onClick }) {
  const Icon = mode.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(mode.id)}
      className={`rounded-[1.5rem] border p-4 text-left transition ${
        activeMode === mode.id
          ? "border-sage bg-white shadow-soft"
          : "border-black/5 bg-ivory hover:border-black/10 hover:bg-white"
      }`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linen text-brass">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-charcoal">{mode.title}</p>
      <p className="mt-1 text-sm leading-6 text-stone">{mode.description}</p>
    </button>
  );
}

function PreviewBadge({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-soft">
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
    <div className="rounded-2xl border border-black/5 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-charcoal">
        {piece ? piece.name : "Not added yet"}
      </p>
    </div>
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
    <section className="rounded-2xl bg-ivory p-4">
      <div className="mb-4">
        <p className="text-sm font-semibold text-charcoal">Outfit image</p>
        <p className="mt-1 text-sm leading-6 text-stone">{helperText}</p>
      </div>

      <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-white p-4">
        {imagePreviewUrl ? (
          <div className="space-y-4">
            <div className="flex h-56 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#f4efe6_0%,#fbf8f2_100%)] p-3 sm:h-72 sm:p-4">
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
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-linen px-4 text-sm font-medium text-charcoal transition hover:bg-brass/20"
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
            className="flex w-full cursor-pointer flex-col items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#f4efe6_0%,#fbf8f2_100%)] px-4 py-8 text-center transition hover:bg-white sm:py-10"
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
    </section>
  );
}

function PiecesEditor({ pieces, updatePiece, removePiece, addPiece }) {
  return (
    <section className="rounded-2xl bg-ivory p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-charcoal">
            Confirm pieces
          </p>
          <p className="mt-1 text-sm leading-6 text-stone">
            Review the suggested pieces or add your own.
          </p>
        </div>
        <button
          type="button"
          onClick={addPiece}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-charcoal transition hover:bg-brass/20"
        >
          <Plus className="h-4 w-4" />
          Add piece
        </button>
      </div>

      <div className="space-y-3">
        {pieces.map((piece, index) => (
          <div
            key={index}
            className="rounded-2xl border border-black/5 bg-white p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-linen px-3 py-1 text-xs font-medium text-charcoal">
                  Piece {index + 1}
                </span>
                <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-medium capitalize text-sage">
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
                placeholder="Maroon Shirt"
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
    </section>
  );
}

export default function OutfitMemoryForm({ onSubmit, isSubmitting }) {
  const [captureMode, setCaptureMode] = useState("photo_note");
  const [formData, setFormData] = useState({
    title: "",
    occasion: "casual",
    season: "all",
    style: "",
    descriptionText: "",
    photoNote: "",
  });
  const [pieces, setPieces] = useState([{ ...emptyPiece }]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [parseMessage, setParseMessage] = useState("");
  const [saveFeedback, setSaveFeedback] = useState("");

  const fileInputRef = useRef(null);

  const validPieces = useMemo(
    () =>
      pieces
        .map((piece) => ({
          name: piece.name.trim(),
          category: normalizeCategory(piece.category),
          color: normalizeColor(piece.color),
          role: piece.role,
        }))
        .filter((piece) => piece.name && piece.color),
    [pieces],
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
    if (captureMode === "photo_note" && formData.photoNote.trim()) {
      return formData.photoNote.trim();
    }

    if (captureMode === "image_title" && validPieces.length === 0) {
      return `Saved as a ${formatValue(formData.occasion)} ${formatValue(
        formData.season,
      )} outfit memory.`;
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
      setParseMessage("Photo ready. You can keep this simple and move straight into the memory.");
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
    setCaptureMode("photo_note");
    setFormData({
      title: "",
      occasion: "casual",
      season: "all",
      style: "",
      descriptionText: "",
      photoNote: "",
    });
    setPieces([{ ...emptyPiece }]);
    setImageFile(null);
    setImagePreviewUrl("");
    setImageName("");
    setParseMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const canSubmit = useMemo(() => {
    if (captureMode === "photo_note") {
      return Boolean(imageFile && formData.photoNote.trim());
    }

    if (captureMode === "text_input") {
      return validPieces.length > 0;
    }

    return Boolean(imageFile && formData.title.trim());
  }, [captureMode, formData.photoNote, formData.title, imageFile, validPieces]);

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
      pieces: captureMode === "text_input" ? validPieces : [],
      description:
        captureMode === "photo_note"
          ? formData.photoNote.trim()
          : generatedNote,
      source_type:
        captureMode === "text_input"
          ? "text_input"
          : imageFile
            ? "image_upload"
            : "manual_build",
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
      className="rounded-2xl border border-black/5 bg-white p-4 shadow-soft sm:p-5"
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linen text-brass">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-charcoal">
            Create Outfit Memory
          </h2>
          <p className="mt-1 text-sm text-stone">
            Pick one way to save the look. Keep the flow light, then let the memory carry the context.
          </p>
        </div>
      </div>

      {saveFeedback ? (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-sage/15 bg-sage/10 px-4 py-4 text-sm text-charcoal">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sage shadow-soft">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">Outfit memory saved</p>
            <p className="mt-1 leading-6 text-stone">{saveFeedback}</p>
          </div>
        </div>
      ) : null}

      <section className="mb-5">
        <p className="mb-3 text-sm font-semibold text-charcoal">
          Choose how you want to save this look
        </p>
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
        {captureMode === "photo_note" ? (
          <>
            <ImagePicker
              imagePreviewUrl={imagePreviewUrl}
              imageName={imageName}
              fileInputRef={fileInputRef}
              onChange={handleImageChange}
              onRemove={clearImage}
              helperText="Upload the full look, then add a short note about it. No forced piece-by-piece form."
            />

            <section className="rounded-2xl bg-ivory p-4">
              <div className="mb-4">
                <p className="text-sm font-semibold text-charcoal">
                  Short look note
                </p>
                <p className="mt-1 text-sm leading-6 text-stone">
                  A simple line is enough. Think memory first, not description first.
                </p>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-charcoal">
                    Outfit title
                  </label>
                  <TextInput
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={generatedTitle}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-charcoal">
                    Small description
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
            </section>
          </>
        ) : null}

        {captureMode === "text_input" ? (
          <>
            <section className="rounded-2xl bg-ivory p-4">
              <div className="mb-4">
                <p className="text-sm font-semibold text-charcoal">
                  Type the outfit
                </p>
                <p className="mt-1 text-sm leading-6 text-stone">
                  Describe the look in plain language and we&apos;ll suggest a
                  breakdown for you to confirm.
                </p>
              </div>

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
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-charcoal px-4 text-sm font-medium text-ivory shadow-soft transition hover:-translate-y-0.5 hover:bg-softblack"
                >
                  <WandSparkles className="h-4 w-4" />
                  Suggest pieces
                </button>
                <p className="text-xs leading-6 text-stone">
                  Suggested breakdown only. It is a gentle parser, not magic.
                </p>
              </div>

              {parseMessage ? (
                <div className="mt-4 rounded-2xl border border-black/5 bg-white p-4 text-sm leading-6 text-stone">
                  {parseMessage}
                </div>
              ) : null}
            </section>

            <PiecesEditor
              pieces={pieces}
              updatePiece={updatePiece}
              removePiece={removePiece}
              addPiece={addPiece}
            />

            <section className="rounded-2xl bg-ivory p-4">
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Outfit title
              </label>
              <TextInput
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={generatedTitle}
              />
            </section>
          </>
        ) : null}

        {captureMode === "image_title" ? (
          <>
            <ImagePicker
              imagePreviewUrl={imagePreviewUrl}
              imageName={imageName}
              fileInputRef={fileInputRef}
              onChange={handleImageChange}
              onRemove={clearImage}
              helperText="Upload the outfit and give it a title. This is the lightest save path."
            />

            <section className="rounded-2xl bg-ivory p-4">
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Outfit title
              </label>
              <TextInput
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Rainy campus fit"
                required
              />
            </section>
          </>
        ) : null}

        <section className="rounded-2xl bg-ivory p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold text-charcoal">Style context</p>
            <p className="mt-1 text-sm leading-6 text-stone">
              Light context helps the memory feel remembered without turning this into a big form.
            </p>
          </div>

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

            <div className="md:col-span-2">
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
        </section>

        <section className="rounded-2xl border border-black/5 bg-linen p-4 shadow-soft">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sage shadow-soft">
              <FilePenLine className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal">
                Preview before saving
              </p>
              <p className="mt-1 text-sm leading-6 text-stone">
                See how the memory will read before you save it.
              </p>
            </div>
          </div>

          {imagePreviewUrl ? (
            <div className="rounded-[1.5rem] border border-black/5 bg-white p-4">
              <div className="flex h-56 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#f4efe6_0%,#fbf8f2_100%)] p-3 sm:h-72 sm:p-4">
                <img
                  src={imagePreviewUrl}
                  alt="Outfit memory preview"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-black/5 bg-white p-4">
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

          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <PreviewBadge
              label="Title"
              value={formData.title.trim() || generatedTitle}
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

          <div className="mt-4 rounded-2xl bg-white p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
              Outfit note
            </p>
            <p className="mt-2 text-sm leading-6 text-charcoal">
              {generatedNote}
            </p>
          </div>

          {captureMode === "text_input" ? (
            <div className="mt-4 rounded-2xl bg-white p-4 shadow-soft">
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
                      {piece.name} - {formatValue(piece.role)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-stone">
                    Suggest or add pieces to build the outfit summary.
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
        className="mt-6 inline-flex h-12 min-h-[var(--touch-target-min)] w-full items-center justify-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory shadow-soft transition hover:-translate-y-0.5 hover:bg-softblack disabled:cursor-not-allowed disabled:bg-stone sm:w-auto"
      >
        <Sparkles className="h-4 w-4" />
        {isSubmitting ? "Saving outfit memory..." : "Save Outfit Memory"}
      </button>
    </form>
  );
}
