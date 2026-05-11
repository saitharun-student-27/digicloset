import { CalendarDays, Layers3, Shirt, Sparkles } from "lucide-react";

import { getImageUrl } from "../services/clothingService";


function formatValue(value) {
  return String(value || "").replace("_", " ");
}

export default function OutfitShowcaseCard({ outfit }) {
  const imageUrl = getImageUrl(outfit.image_url || outfit.imagePreviewUrl);
  const outfitItems = outfit.outfit_items || [];

  return (
    <article className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft">
      <div className="h-56 bg-linen">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={outfit.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#eee6d9_0%,#f8f5ee_100%)]">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-sage shadow-soft">
                <Shirt className="h-7 w-7" />
              </div>
              <div className="h-16 w-16 rounded-2xl bg-charcoal/90" />
              <div className="h-16 w-16 rounded-2xl bg-brass/30" />
              <div className="h-16 w-16 rounded-2xl bg-sage/25" />
            </div>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-charcoal">
              {outfit.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone">
              {outfit.description || outfit.generatedNote}
            </p>
          </div>
          <Sparkles className="h-5 w-5 shrink-0 text-brass" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-ivory p-3">
            <CalendarDays className="h-4 w-4 text-sage" />
            <p className="mt-2 text-xs uppercase tracking-[0.12em] text-stone">
              Season
            </p>
            <p className="text-sm font-medium capitalize text-charcoal">
              {formatValue(outfit.season)}
            </p>
          </div>
          <div className="rounded-2xl bg-ivory p-3">
            <Layers3 className="h-4 w-4 text-sage" />
            <p className="mt-2 text-xs uppercase tracking-[0.12em] text-stone">
              Occasion
            </p>
            <p className="text-sm font-medium capitalize text-charcoal">
              {formatValue(outfit.occasion)}
            </p>
          </div>
          <div className="rounded-2xl bg-ivory p-3">
            <Sparkles className="h-4 w-4 text-sage" />
            <p className="mt-2 text-xs uppercase tracking-[0.12em] text-stone">
              Style
            </p>
            <p className="text-sm font-medium capitalize text-charcoal">
              {outfit.style || "Not set"}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
            Pieces inside this outfit
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {outfitItems.map((outfitItem) => (
              <span
                key={outfitItem.id}
                className="rounded-full bg-linen px-3 py-2 text-xs font-medium capitalize text-charcoal"
              >
                {outfitItem.clothing_item.color} {outfitItem.clothing_item.name}
                {" - "}
                {outfitItem.slot}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
