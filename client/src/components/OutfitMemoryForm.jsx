import { ImagePlus, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";


const seasons = ["summer", "winter", "rainy", "all"];
const occasions = [
  "casual",
  "formal",
  "college",
  "party",
  "sports",
  "travel",
  "traditional",
];
const categories = [
  "shirt",
  "t_shirt",
  "pant",
  "jeans",
  "shorts",
  "jacket",
  "hoodie",
  "shoes",
  "accessory",
  "dress",
];
const roles = ["upper", "lower", "footwear", "outerwear", "accessory"];

const emptyPiece = {
  name: "",
  category: "shirt",
  color: "",
  role: "upper",
};

const initialState = {
  title: "",
  occasion: "casual",
  season: "all",
  style: "",
};

function formatValue(value) {
  return String(value).replace("_", " ");
}

export function generateOutfitNote({ pieces, occasion, season }) {
  const namedPieces = pieces
    .filter((piece) => piece.name.trim() && piece.color.trim())
    .map((piece) => {
      const color = piece.color.trim().toLowerCase();
      const name = piece.name.trim().toLowerCase();
      return name.startsWith(color) ? name : `${color} ${name}`;
    });

  if (namedPieces.length === 0) {
    return "Add clothing pieces to generate an outfit note.";
  }

  const pieceText =
    namedPieces.length === 1
      ? namedPieces[0]
      : `${namedPieces.slice(0, -1).join(", ")} and ${namedPieces.at(-1)}`;

  return `${pieceText}, suitable for a ${formatValue(occasion)} ${formatValue(
    season,
  )} look.`;
}

function TextInput({ value, name, onChange, placeholder, required = false }) {
  return (
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="h-11 w-full rounded-xl border border-black/10 bg-ivory px-3 text-sm text-charcoal outline-none transition placeholder:text-stone/60 focus:border-sage focus:bg-white focus:ring-4 focus:ring-sage/10"
    />
  );
}

function SelectInput({ value, name, onChange, options }) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="h-11 w-full rounded-xl border border-black/10 bg-ivory px-3 text-sm capitalize text-charcoal outline-none transition focus:border-sage focus:bg-white focus:ring-4 focus:ring-sage/10"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {formatValue(option)}
        </option>
      ))}
    </select>
  );
}

export default function OutfitMemoryForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(initialState);
  const [pieces, setPieces] = useState([{ ...emptyPiece }]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageName, setImageName] = useState("");

  const generatedNote = useMemo(
    () =>
      generateOutfitNote({
        pieces,
        occasion: formData.occasion,
        season: formData.season,
      }),
    [pieces, formData.occasion, formData.season],
  );

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanedPieces = pieces
      .map((piece) => ({
        name: piece.name.trim(),
        category: piece.category,
        color: piece.color.trim(),
        role: piece.role,
      }))
      .filter((piece) => piece.name && piece.color);

    if (cleanedPieces.length === 0) {
      return;
    }

    await onSubmit({
      ...formData,
      title: formData.title.trim(),
      style: formData.style.trim(),
      pieces: cleanedPieces,
      imagePreviewUrl,
      imageFile,
      imageName,
      description: generatedNote,
    });

    setFormData(initialState);
    setPieces([{ ...emptyPiece }]);
    setImageFile(null);
    setImagePreviewUrl("");
    setImageName("");
    event.target.reset();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft"
    >
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linen text-brass">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-charcoal">
            Build outfit memory
          </h2>
          <p className="mt-1 text-sm text-stone">
            Upload or describe an outfit, then enter the pieces inside it.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-ivory p-4">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
            Step 1
          </p>
          <h3 className="mt-1 text-base font-semibold text-charcoal">
            Capture look
          </h3>
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
              placeholder="Weekend college outfit"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-charcoal">
              Outfit image
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-4 py-5 text-center transition hover:border-sage hover:bg-white">
              {imagePreviewUrl ? (
                <div className="relative w-full">
                  <img
                    src={imagePreviewUrl}
                    alt="Outfit preview"
                    className="h-44 w-full rounded-2xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      setImageFile(null);
                      setImagePreviewUrl("");
                      setImageName("");
                    }}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-charcoal text-ivory shadow-soft"
                    aria-label="Remove outfit image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ivory text-sage shadow-soft">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-charcoal">
                    Add an optional full outfit image
                  </p>
                  <p className="mt-1 text-xs text-stone">
                    JPG, PNG, or WEBP up to 5MB
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-ivory p-4">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
            Step 2
          </p>
          <h3 className="mt-1 text-base font-semibold text-charcoal">
            Break down outfit
          </h3>
        </div>

        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone">
            Clothing pieces
          </h4>
          <button
            type="button"
            onClick={addPiece}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-charcoal transition hover:bg-brass/20"
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
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-charcoal">
                  Piece {index + 1}
                </p>
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
      </div>

      <div className="mt-5 rounded-2xl bg-ivory p-4">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
            Step 3
          </p>
          <h3 className="mt-1 text-base font-semibold text-charcoal">
            Style context
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
              Style
            </label>
            <TextInput
              name="style"
              value={formData.style}
              onChange={handleChange}
              placeholder="minimal, street, classic"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-linen p-4">
        <div className="mb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
            Step 4
          </p>
          <h3 className="mt-1 text-base font-semibold text-charcoal">
            Save memory
          </h3>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
          Generated outfit note
        </p>
        <p className="mt-2 text-sm leading-6 text-charcoal">{generatedNote}</p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory shadow-soft transition hover:-translate-y-0.5 hover:bg-softblack disabled:cursor-not-allowed disabled:bg-stone"
      >
        <Sparkles className="h-4 w-4" />
        {isSubmitting ? "Saving outfit..." : "Save outfit memory"}
      </button>
    </form>
  );
}
