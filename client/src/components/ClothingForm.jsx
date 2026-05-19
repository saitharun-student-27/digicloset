import { ImagePlus, Plus, Shirt, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import AutosuggestField from "./AutosuggestField.jsx";
import CategoryPicker from "./CategoryPicker.jsx";
import ChipSelect from "./ChipSelect.jsx";
import {
  ACCEPTED_IMAGE_INPUT,
  validateImageFile,
} from "../utils/uploadValidation";
import {
  formatFormalityLabel,
  formatSeasonLabel,
  normalizeCategory,
  normalizeColor,
  normalizeFormality,
  normalizeOccasion,
  normalizeSeason,
  normalizeStyle,
} from "../utils/wardrobeTaxonomy";
import { seasons } from "../utils/outfitUtils";

const initialFormState = {
  name: "",
  category: "shirt",
  color: "",
  season: "all",
  occasion: "casual",
  style: "",
  formality_level: "",
};

function FieldLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-charcoal">
      {children}
    </label>
  );
}

function TextInput({ id, name, value, onChange, placeholder, required = false }) {
  return (
    <input
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-ivory px-3 text-sm text-charcoal outline-none transition placeholder:text-stone/60 focus:border-sage focus:bg-white focus:ring-4 focus:ring-sage/10"
    />
  );
}

export default function ClothingForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("category", normalizeCategory(formData.category));
    payload.append("color", normalizeColor(formData.color));
    payload.append("season", normalizeSeason(formData.season));
    payload.append("occasion", normalizeOccasion(formData.occasion));

    if (formData.style.trim()) {
      payload.append("style", normalizeStyle(formData.style));
    }

    if (formData.formality_level.trim()) {
      payload.append("formality_level", normalizeFormality(formData.formality_level));
    }

    if (imageFile) {
      payload.append("image", imageFile);
    }

    await onSubmit(payload);
    setFormData(initialFormState);
    setImageFile(null);
    setImageError("");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    const validationMessage = validateImageFile(file);

    if (validationMessage) {
      setImageFile(null);
      setImageError(validationMessage);
      event.target.value = "";
      return;
    }

    setImageError("");
    setImageFile(file || null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft"
    >
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linen text-charcoal">
          <Shirt className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-charcoal">Add clothing</h2>
          <p className="mt-1 text-sm text-stone">
            Capture one wardrobe item with clean style context.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <TextInput
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="White Oxford Shirt"
            required
          />
        </div>

        <div>
          <FieldLabel htmlFor="color">Color</FieldLabel>
          <div className="mt-2">
            <AutosuggestField
            id="color"
            name="color"
            field="color"
            value={formData.color}
            onChange={(value) =>
              setFormData((current) => ({ ...current, color: value }))
            }
            placeholder="Search color"
            required
          />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="category">Category</FieldLabel>
          <CategoryPicker
            id="category"
            name="category"
            value={formData.category}
            onChange={(category) =>
              setFormData((current) => ({ ...current, category }))
            }
            placeholder="Search category"
          />
        </div>

        <div>
          <FieldLabel htmlFor="season">Season</FieldLabel>
          <div className="mt-2">
            <ChipSelect
            value={formData.season}
            onChange={(season) =>
              setFormData((current) => ({ ...current, season }))
            }
            options={seasons}
            formatOption={formatSeasonLabel}
          />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="occasion">Occasion</FieldLabel>
          <div className="mt-2">
            <AutosuggestField
            id="occasion"
            name="occasion"
            field="occasion"
            value={formData.occasion}
            onChange={(occasion) =>
              setFormData((current) => ({ ...current, occasion }))
            }
            placeholder="Search occasion"
          />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="style">Style</FieldLabel>
          <div className="mt-2">
            <AutosuggestField
            id="style"
            name="style"
            field="style"
            value={formData.style}
            onChange={(style) =>
              setFormData((current) => ({ ...current, style }))
            }
            placeholder="Search style"
          />
          </div>
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="formality_level">Formality level</FieldLabel>
          <div className="mt-2">
            <ChipSelect
              value={formData.formality_level}
              onChange={(formality_level) =>
                setFormData((current) => ({ ...current, formality_level }))
              }
              options={["", "low", "medium", "high"]}
              formatOption={formatFormalityLabel}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="image">Image</FieldLabel>
          <label
            htmlFor="image"
            className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-ivory px-4 py-5 text-center transition hover:border-sage hover:bg-white"
          >
            {previewUrl ? (
              <div className="relative w-full">
                <img
                  src={previewUrl}
                  alt="Selected clothing preview"
                  className="h-44 w-full rounded-2xl object-cover"
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    setImageFile(null);
                    setImageError("");
                    if (imageInputRef.current) {
                      imageInputRef.current.value = "";
                    }
                  }}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-charcoal text-ivory shadow-soft"
                  aria-label="Remove selected image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sage shadow-soft">
                  <ImagePlus className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-charcoal">
                  Add an optional clothing image
                </p>
                <p className="mt-1 text-xs text-stone">
                  JPG, PNG, or WEBP up to 10 MB
                </p>
              </>
            )}
          </label>
          {imageError ? (
            <p className="mt-2 text-xs font-medium text-red-600">
              {imageError}
            </p>
          ) : null}
          <input
            id="image"
            ref={imageInputRef}
            name="image"
            type="file"
            accept={ACCEPTED_IMAGE_INPUT}
            onChange={handleImageChange}
            className="sr-only"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory shadow-soft transition hover:-translate-y-0.5 hover:bg-softblack disabled:cursor-not-allowed disabled:bg-stone"
      >
        <Plus className="h-4 w-4" />
        {isSubmitting ? "Adding..." : "Add item"}
      </button>
    </form>
  );
}
