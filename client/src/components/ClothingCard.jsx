import {
  MoreVertical,
  Pencil,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { getImageUrl, deleteClothingItem } from "../services/clothingService";

export default function ClothingCard({ item, onDeleteSuccess }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const imageUrl = getImageUrl(item.image_url);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Remove this piece from your vault?")) return;
    
    setIsDeleting(true);
    try {
      await deleteClothingItem(item.id);
      if (onDeleteSuccess) {
        onDeleteSuccess(item.id);
      }
    } catch (err) {
      console.error("Failed to delete item", err);
      setIsDeleting(false);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // In a future update, we will open an edit modal
    alert("Edit mode coming soon!");
  };

  return (
    <article 
      className={`group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-[2rem] bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full bg-ivory min-h-[220px] flex items-center justify-center p-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-auto max-h-[300px] object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/50 text-sage backdrop-blur-md shadow-sm">
            <Sparkles className="h-8 w-8" />
          </div>
        )}
      </div>

      {/* Glassmorphic Hover Tags (Pinterest Vibe) */}
      <div className={`absolute top-4 left-4 right-4 flex flex-wrap gap-2 transition-all duration-500 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        <span className="rounded-full bg-white/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-charcoal shadow-sm">
          #{item.category}
        </span>
        {item.occasion && (
          <span className="rounded-full bg-white/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-charcoal shadow-sm">
            #{item.occasion}
          </span>
        )}
        {item.season && (
          <span className="rounded-full bg-white/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sage shadow-sm">
            {item.season}
          </span>
        )}
      </div>

      {/* Hover Overlay Actions */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300 flex items-end justify-between p-4 ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="flex gap-2 mb-2">
          <button 
            onClick={handleEdit}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-charcoal shadow-lg transition hover:scale-110 hover:bg-white"
            title="Edit Item"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button 
            onClick={handleDelete}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-red-500 shadow-lg transition hover:scale-110 hover:bg-red-50"
            title="Delete Item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editorial Minimal Info */}
      <div className={`bg-white px-5 py-4 transition-transform duration-500 z-10`}>
        <h3 className="font-serif text-lg text-charcoal line-clamp-1">
          {item.name}
        </h3>
        <p className="text-xs font-medium uppercase tracking-widest text-stone mt-1">
          {item.color}
        </p>
      </div>
    </article>
  );
}
