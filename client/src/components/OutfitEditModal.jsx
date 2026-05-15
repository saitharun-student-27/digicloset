import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { formatValue, occasions, seasons } from "../utils/outfitUtils";

const inputClass =
  "h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-charcoal outline-none transition focus:border-sage focus:ring-4 focus:ring-sage/10";

export default function OutfitEditModal({
  outfit,
  isOpen,
  isSaving,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    occasion: "casual",
    season: "all",
    style: "",
  });

  useEffect(() => {
    if (!outfit) {
      return;
    }

    setFormData({
      title: outfit.title || "",
      description: outfit.description || "",
      occasion: outfit.occasion || "casual",
      season: outfit.season || "all",
      style: outfit.style || "",
    });
  }, [outfit]);

  if (!isOpen || !outfit) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/35 px-3 py-3 sm:items-center sm:px-4 sm:py-8">
      <div className="max-h-[min(92dvh,760px)] w-full max-w-xl overflow-y-auto rounded-[1.75rem] bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
              Edit outfit
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-charcoal">
              Update outfit details
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone">
              Keep this lightweight. We are editing metadata only, not rebuilding
              the full piece relationship here.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory text-charcoal transition hover:bg-linen"
            aria-label="Close outfit edit"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(formData);
          }}
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-charcoal">
              Title
            </label>
            <input
              className={inputClass}
              value={formData.title}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-charcoal">
              Description
            </label>
            <textarea
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm text-charcoal outline-none transition focus:border-sage focus:ring-4 focus:ring-sage/10"
              rows={4}
              value={formData.description}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Occasion
              </label>
              <select
                className={inputClass}
                value={formData.occasion}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    occasion: event.target.value,
                  }))
                }
              >
                {occasions.map((option) => (
                  <option key={option} value={option}>
                    {formatValue(option)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Season
              </label>
              <select
                className={inputClass}
                value={formData.season}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    season: event.target.value,
                  }))
                }
              >
                {seasons.map((option) => (
                  <option key={option} value={option}>
                    {formatValue(option)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-charcoal">
              Style
            </label>
            <input
              className={inputClass}
              value={formData.style}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  style: event.target.value,
                }))
              }
              placeholder="minimal, classic, streetwear"
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
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
