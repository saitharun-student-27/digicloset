import { ImagePlus, Plus, Shirt, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  ACCEPTED_IMAGE_INPUT,
  validateImageFile,
} from "../utils/uploadValidation";

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

function SelectInput({ id, name, value, onChange, options }) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-ivory px-3 text-sm capitalize text-charcoal outline-none transition focus:border-sage focus:bg-white focus:ring-4 focus:ring-sage/10"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option.replace("_", " ")}
        </option>
      ))}
    </select>
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
    payload.append("category", formData.category);
    payload.append("color", formData.color);
    payload.append("season", formData.season);
    payload.append("occasion", formData.occasion);

    if (formData.style.trim()) {
      payload.append("style", formData.style.trim());
    }

    if (formData.formality_level.trim()) {
      payload.append("formality_level", formData.formality_level.trim());
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
          <TextInput
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="white"
            required
          />
        </div>

        <div>
          <FieldLabel htmlFor="category">Category</FieldLabel>
          <SelectInput
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={categories}
          />
        </div>

        <div>
          <FieldLabel htmlFor="season">Season</FieldLabel>
          <SelectInput
            id="season"
            name="season"
            value={formData.season}
            onChange={handleChange}
            options={seasons}
          />
        </div>

        <div>
          <FieldLabel htmlFor="occasion">Occasion</FieldLabel>
          <SelectInput
            id="occasion"
            name="occasion"
            value={formData.occasion}
            onChange={handleChange}
            options={occasions}
          />
        </div>

        <div>
          <FieldLabel htmlFor="style">Style</FieldLabel>
          <TextInput
            id="style"
            name="style"
            value={formData.style}
            onChange={handleChange}
            placeholder="classic"
          />
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="formality_level">Formality level</FieldLabel>
          <TextInput
            id="formality_level"
            name="formality_level"
            value={formData.formality_level}
            onChange={handleChange}
            placeholder="high"
          />
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
