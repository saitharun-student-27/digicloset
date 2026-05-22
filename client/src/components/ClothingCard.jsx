import { Pencil, Shirt, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { getImageUrl } from "../services/clothingService";
import { getWardrobeSection } from "../utils/outfitUtils";
import {
  formatCategoryLabel,
  formatColorLabel,
} from "../utils/wardrobeTaxonomy";

export default function ClothingCard({
  item,
  onEdit,
  onDelete,
  showActions = false,
  supportingText = "",
  isBusy = false,
}) {
  const imageUrl = getImageUrl(item.image_url);
  const section = getWardrobeSection(item.category);

  return (
    <article
      className={`group h-full overflow-hidden rounded-[1.45rem] border border-black/5 bg-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
        isBusy ? "opacity-80" : ""
      }`}
      aria-busy={isBusy}
    >
      <Link to={`/pieces/${item.id}`} className="block focus:outline-none">
        <div className="relative aspect-[1/1.02] overflow-hidden bg-[linear-gradient(135deg,#f4efe6_0%,#fbf8f2_100%)] p-2.5 sm:p-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.name}
              className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80 text-sage shadow-soft sm:h-16 sm:w-16">
              <Shirt className="h-7 w-7" />
            </div>
          )}

          <div className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium text-charcoal shadow-soft backdrop-blur">
            {section}
          </div>
        </div>

        <div className="p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-[15px] font-semibold text-charcoal">
                {item.name}
              </h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-stone">
                {formatCategoryLabel(item.category)}
              </p>
            </div>

            {item.color ? (
              <span className="rounded-full bg-ivory px-3 py-1 text-[11px] font-medium capitalize text-stone">
                {formatColorLabel(item.color)}
              </span>
            ) : null}
          </div>

          {supportingText ? (
            <p className="mt-2.5 text-xs leading-5 text-stone">{supportingText}</p>
          ) : null}

          {showActions ? (
            <div className="mt-3.5 flex items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onEdit?.(item);
                }}
                disabled={isBusy}
                className="inline-flex h-10 min-h-[var(--touch-target-min)] items-center gap-2 rounded-full bg-ivory px-3 text-xs font-medium text-charcoal transition hover:bg-linen disabled:cursor-not-allowed disabled:opacity-55"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onDelete?.(item);
                }}
                disabled={isBusy}
                className="inline-flex h-10 min-h-[var(--touch-target-min)] items-center gap-2 rounded-full bg-white px-3 text-xs font-medium text-stone transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-55"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
