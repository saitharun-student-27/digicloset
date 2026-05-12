import { CalendarDays, Heart, Trash2, Layers3, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { getImageUrl } from "../services/clothingService";
import { api } from "../lib/api";

function formatValue(value) {
  return String(value || "").replace("_", " ");
}

export default function OutfitShowcaseCard({ outfit, onDelete }) {
  const imageUrl = getImageUrl(outfit.image_url || outfit.imagePreviewUrl);
  const outfitItems = outfit.outfit_items || [];
  
  const [isFavorite, setIsFavorite] = useState(outfit.is_favorite);
  const [lastWorn, setLastWorn] = useState(outfit.last_worn_date);

  const handleFavorite = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/outfits/${outfit.id}/favorite`);
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkWorn = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/outfits/${outfit.id}/worn`);
      setLastWorn(new Date().toISOString());
      alert("Marked as worn today!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/outfits/${outfit.id}`} className="block">
        <div className="h-56 bg-linen relative">
          {imageUrl ? (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#eee6d9_0%,#f8f5ee_100%)] p-3">
              <img
                src={imageUrl}
                alt={outfit.title}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#eee6d9_0%,#f8f5ee_100%)]">
              {/* Visual Breakdown of items */}
              <div className="flex-1 rounded-xl bg-white/50 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-inner relative m-4 h-[180px]">
                {outfitItems?.map((item, idx) => (
                  <div key={item.id} className="absolute inset-4 flex items-center justify-center opacity-70" style={{ transform: `rotate(${idx * 5 - 5}deg) translateY(${idx * 10}px)`}}>
                    {item.clothing_item.image_url && <img src={item.clothing_item.image_url} className="w-24 h-24 object-contain mix-blend-multiply" />}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end justify-between p-4 pointer-events-none">
            <div className="flex gap-2 mb-2 pointer-events-auto">
              <button 
                onClick={handleFavorite}
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition hover:scale-110 ${isFavorite ? "text-red-500" : "text-charcoal hover:bg-white"}`}
                title="Favorite"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
              </button>
              <button 
                onClick={handleMarkWorn}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-sage shadow-lg transition hover:scale-110 hover:bg-white"
                title="Mark Worn Today"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              {onDelete && (
                <button 
                  onClick={(e) => { e.preventDefault(); onDelete(); }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-red-500 shadow-lg transition hover:scale-110 hover:bg-red-50"
                  title="Delete Outfit"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-charcoal line-clamp-1">
                {outfit.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-stone line-clamp-1">
                {outfit.description || "No description"}
              </p>
            </div>
            {isFavorite && <Heart className="h-5 w-5 shrink-0 text-red-500 fill-current" />}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-ivory p-3">
              <CalendarDays className="h-4 w-4 text-sage" />
              <p className="mt-2 text-xs uppercase tracking-[0.12em] text-stone">Season</p>
              <p className="text-sm font-medium capitalize text-charcoal">{formatValue(outfit.season)}</p>
            </div>
            <div className="rounded-2xl bg-ivory p-3">
              <Layers3 className="h-4 w-4 text-sage" />
              <p className="mt-2 text-xs uppercase tracking-[0.12em] text-stone">Occasion</p>
              <p className="text-sm font-medium capitalize text-charcoal">{formatValue(outfit.occasion)}</p>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
