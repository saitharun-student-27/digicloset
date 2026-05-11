import {
  FilePenLine,
  ImagePlus,
  Plus,
  Sparkles,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import {
  categories,
  deriveOutfitSourceType,
  emptyPiece,
  formatValue,
  generateOutfitNote,
  generateOutfitTitle,
  initialOutfitState,
  occasions,
  parseOutfitDescription,
  roles,
  seasons,
  titleCase,
} from "../utils/outfitUtils";


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

export default function OutfitMemoryForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(initialOutfitState);
  const [pieces, setPieces] = useState([{ ...emptyPiece }]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [parseMessage, setParseMessage] = useState("");

  const fileInputRef = useRef(null);

  const validPieces = useMemo(
    () =>
      pieces
        .map((piece) => ({
          name: piece.name.trim(),
          category: piece.category,
          color: piece.color.trim(),
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

  const generatedNote = useMemo(
    () =>
      generateOutfitNote({
        pieces: validPieces,
        occasion: formData.occasion,
        season: formData.season,
      }),
    [validPieces, formData.occasion, formData.season],
  );

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

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreviewUrl("");
      setImageName("");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreviewUrl(String(reader.result || ""));
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleParseDescription = () => {
    const suggestedPieces = parseOutfitDescription(formData.descriptionText);

    if (suggestedPieces.length === 0) {
      setParseMessage(
        "We could not suggest pieces from that description yet. Try naming colors and clothing types like shirt, pants, or sneakers.",
      );
      return;
    }

    setPieces((current) => {
      const basePieces = current.filter(
        (piece) => piece.name.trim() || piece.color.trim(),
      );

      if (basePieces.length === 0 || (basePieces.length === 1 && !basePieces[0].name && !basePieces[0].color)) {
        return suggestedPieces;
      }

      return [...basePieces, ...suggestedPieces];
    });

    setParseMessage(
      `Suggested breakdown added. Review and edit the pieces before saving.`,
    );
  };

  const resetForm = () => {
    setFormData(initialOutfitState);
    setPieces([{ ...emptyPiece }]);
    setImageFile(null);
    setImagePreviewUrl("");
    setImageName("");
    setParseMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (validPieces.length === 0) {
      return;
    }

    const hasText = Boolean(formData.descriptionText.trim());

    await onSubmit({
      ...formData,
      title: formData.title.trim() || generatedTitle,
      style: formData.style.trim(),
      pieces: validPieces,
      imagePreviewUrl,
      imageFile,
      imageName,
      description: generatedNote,
      source_type: deriveOutfitSourceType({
        hasImage: Boolean(imageFile),
        hasText,
      }),
    });

    resetForm();
    event.target.reset();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft"
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
            Upload a look, type a short description, add pieces manually, or mix
            them together in one flow. Nothing here claims automatic detection.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <section className="rounded-2xl bg-ivory p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold text-charcoal">Outfit image</p>
            <p className="mt-1 text-sm leading-6 text-stone">
              Optional. Upload only if you want the memory anchored to a real
              look photo.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-white p-4">
            {imagePreviewUrl ? (
              <div className="space-y-4">
                <div className="flex h-72 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#f4efe6_0%,#fbf8f2_100%)] p-4 sm:h-80">
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
                      We&apos;ll use this as your outfit memory. Add or confirm
                      the pieces below.
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
                      onClick={() => {
                        setImageFile(null);
                        setImagePreviewUrl("");
                        setImageName("");
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
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
                className="flex w-full cursor-pointer flex-col items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#f4efe6_0%,#fbf8f2_100%)] px-4 py-10 text-center transition hover:bg-white"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sage shadow-soft">
                  <ImagePlus className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-medium text-charcoal">
                  Add an optional full outfit photo
                </p>
                <p className="mt-1 text-xs leading-6 text-stone">
                  JPG, PNG, or WEBP up to 5MB
                </p>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="sr-only"
            />
          </div>
        </section>

        <section className="rounded-2xl bg-ivory p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold text-charcoal">
              Prefer typing the look?
            </p>
            <p className="mt-1 text-sm leading-6 text-stone">
              Optional shortcut. Write the outfit in plain language and suggest
              pieces from it.
            </p>
          </div>

          <TextArea
            name="descriptionText"
            value={formData.descriptionText}
            onChange={handleChange}
            placeholder="Maroon shirt with cream pants and white sneakers"
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
              Deterministic text parsing only, not AI recognition.
            </p>
          </div>

          {parseMessage ? (
            <div className="mt-4 rounded-2xl border border-black/5 bg-white p-4 text-sm leading-6 text-stone">
              {parseMessage}
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl bg-ivory p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-charcoal">
                Confirm pieces
              </p>
              <p className="mt-1 text-sm leading-6 text-stone">
                Add, remove, or edit the outfit pieces anytime before saving.
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

                <div className="grid gap-3 md:grid-cols-2">
                  <TextInput
                    name="name"
                    value={piece.name}
                    onChange={(event) =>
                      updatePiece(index, "name", event.target.value)
                    }
                    placeholder="Maroon Shirt"
                    required
                  />
                  <TextInput
                    name="color"
                    value={piece.color}
                    onChange={(event) =>
                      updatePiece(index, "color", event.target.value)
                    }
                    placeholder="maroon"
                    required
                  />
                  <SelectInput
                    name="category"
                    value={piece.category}
                    onChange={(event) =>
                      updatePiece(index, "category", event.target.value)
                    }
                    options={categories}
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

        <section className="rounded-2xl bg-ivory p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold text-charcoal">
              Style context
            </p>
            <p className="mt-1 text-sm leading-6 text-stone">
              Give the memory just enough context to feel like a look, not a
              record.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
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
                Occasion
              </label>
              <SelectInput
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                options={occasions}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Season
              </label>
              <SelectInput
                name="season"
                value={formData.season}
                onChange={handleChange}
                options={seasons}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Style or aesthetic
              </label>
              <TextInput
                name="style"
                value={formData.style}
                onChange={handleChange}
                placeholder="minimal, street, classic"
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
                Generated preview
              </p>
              <p className="mt-1 text-sm leading-6 text-stone">
                Preview the memory before saving.
              </p>
            </div>
          </div>

          {imagePreviewUrl ? (
            <div className="rounded-[1.5rem] border border-black/5 bg-white p-4">
              <div className="flex h-72 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#f4efe6_0%,#fbf8f2_100%)] p-4">
                <img
                  src={imagePreviewUrl}
                  alt="Outfit memory preview"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-black/5 bg-white p-4">
              <div className="flex min-h-72 flex-col justify-between rounded-[1.25rem] bg-[linear-gradient(135deg,#f4efe6_0%,#fbf8f2_100%)] p-4">
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
              label="Generated title"
              value={formData.title.trim() || generatedTitle}
            />
            <PreviewBadge
              label="Occasion"
              value={titleCase(formData.occasion)}
            />
            <PreviewBadge
              label="Season"
              value={
                formData.season === "all"
                  ? "All-season"
                  : titleCase(formData.season)
              }
            />
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
              Generated outfit note
            </p>
            <p className="mt-2 text-sm leading-6 text-charcoal">
              {generatedNote}
            </p>
          </div>

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
                  Add pieces to build the outfit summary.
                </span>
              )}
            </div>
          </div>
        </section>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || validPieces.length === 0}
        className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory shadow-soft transition hover:-translate-y-0.5 hover:bg-softblack disabled:cursor-not-allowed disabled:bg-stone"
      >
        <Sparkles className="h-4 w-4" />
        {isSubmitting ? "Saving outfit memory..." : "Save Outfit Memory"}
      </button>
    </form>
  );
}
