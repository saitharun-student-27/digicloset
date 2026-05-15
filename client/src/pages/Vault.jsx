import { Plus, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ClothingCard from "../components/ClothingCard";
import OutfitEditModal from "../components/OutfitEditModal";
import OutfitShowcaseCard from "../components/OutfitShowcaseCard";
import {
  deleteClothingItem,
  getClothingItems,
} from "../services/clothingService";
import {
  deleteOutfit,
  getOutfits,
  markOutfitWorn,
  toggleFavoriteOutfit,
  updateOutfit,
} from "../services/outfitService";
import { getWardrobeSection, wardrobeSections } from "../utils/outfitUtils";

function RailSection({
  id,
  title,
  description,
  items,
  emptyMessage,
  renderItem,
  cardClassName = "memory-rail-card",
}) {
  return (
    <section id={id} className="section-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-stone">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone">{description}</p>
          ) : null}
        </div>
        <span className="text-xs font-medium text-stone/60">
          {items.length} saved
        </span>
      </div>

      {items.length > 0 ? (
        <div className="memory-rail pt-2">
          {items.map((item, index) => (
            <div key={item.id || index} className={cardClassName}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-black/10 bg-white px-5 py-6 text-sm leading-6 text-stone">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}

export default function Vault() {
  const navigate = useNavigate();
  const [clothingItems, setClothingItems] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [clothingData, outfitData] = await Promise.all([
        getClothingItems(),
        getOutfits(),
      ]);
      setClothingItems(clothingData);
      setOutfits(outfitData);
    } catch (error) {
      console.error("Failed to load wardrobe data", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteClothing(item) {
    if (!window.confirm(`Delete "${item.name}"?`)) {
      return;
    }

    try {
      await deleteClothingItem(item.id);
      await loadData();
    } catch (error) {
      alert(
        error?.response?.data?.detail ||
          "This piece could not be deleted safely.",
      );
    }
  }

  async function handleDeleteOutfit(outfit) {
    if (!window.confirm(`Delete "${outfit.title}"?`)) {
      return;
    }

    await deleteOutfit(outfit.id);
    await loadData();
  }

  async function handleFavorite(outfit) {
    await toggleFavoriteOutfit(outfit.id);
    await loadData();
  }

  async function handleMarkWorn(outfit) {
    await markOutfitWorn(outfit.id);
    await loadData();
  }

  async function handleSaveEdit(payload) {
    setIsSavingEdit(true);
    try {
      await updateOutfit(editingOutfit.id, payload);
      setEditingOutfit(null);
      await loadData();
    } finally {
      setIsSavingEdit(false);
    }
  }

  const groupedItems = useMemo(() => {
    const base = Object.fromEntries(
      wardrobeSections.map((section) => [section, []]),
    );

    clothingItems.forEach((item) => {
      base[getWardrobeSection(item.category)].push(item);
    });

    return base;
  }, [clothingItems]);

  const favoriteOutfits = outfits.filter((outfit) => outfit.is_favorite);
  const allOutfitMemories = outfits;
  const sectionLinks = [
    { id: "favorite-fits", label: "Favorite Fits" },
    { id: "outfit-memories", label: "Outfit Memories" },
    { id: "upperwear", label: "Upperwear" },
    { id: "lowerwear", label: "Lowerwear" },
    { id: "footwear", label: "Footwear" },
    { id: "outerwear", label: "Outerwear" },
    { id: "accessories", label: "Accessories" },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100dvh-10rem)] items-center justify-center px-4">
        <p className="text-stone">Loading your wardrobe...</p>
      </div>
    );
  }

  return (
    <main className="page-shell">
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-linen px-3 py-2 text-sm font-medium text-charcoal">
            <Sparkles className="h-4 w-4 text-brass" />
            Digital closet
          </div>
          <h1 className="font-serif text-[2rem] text-charcoal sm:text-4xl">Wardrobe</h1>
          <p className="mt-2 text-stone">
            Saved outfit memories come first. Individual pieces support the closet
            without taking over the whole experience.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/outfit-memory"
            className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory shadow-soft transition hover:bg-softblack"
          >
            <Sparkles className="h-4 w-4" /> Save Outfit Memory
          </Link>
          <Link
            to="/outfit-memory"
            className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-charcoal shadow-soft transition hover:bg-linen"
          >
            <Plus className="h-4 w-4" /> Quick Add Piece
          </Link>
        </div>
      </div>

      <div className="sticky top-3 z-20 mb-5 -mx-4 bg-ivory/95 px-4 py-2 backdrop-blur sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-0">
        <div className="memory-rail pb-1 lg:pb-3">
          {sectionLinks.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() =>
                document.getElementById(section.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              className="flex h-10 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-white px-4 text-xs font-medium text-charcoal shadow-soft"
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5 sm:space-y-6">
        <RailSection
          id="favorite-fits"
          title="Favorite Fits"
          description="The combinations you already trust most, featured here without removing them from the rest of your saved outfit memories."
          items={favoriteOutfits}
          emptyMessage="Favorite a few outfit memories and this rail will quietly keep them within easy reach."
          cardClassName="memory-rail-card"
          renderItem={(outfit) => (
            <OutfitShowcaseCard
              outfit={outfit}
              onFavorite={handleFavorite}
              onMarkWorn={handleMarkWorn}
              onEdit={setEditingOutfit}
              onDelete={handleDeleteOutfit}
              showMeta={false}
              supportingText="Saved as a trusted combination."
            />
          )}
        />

        <RailSection
          id="outfit-memories"
          title="All Outfit Memories"
          description="Your full saved rotation lives here. Favorites stay featured above, but they still belong to the main wardrobe memory flow."
          items={allOutfitMemories}
          emptyMessage="No outfit memories yet. Save a complete look first and the wardrobe will organize itself around real combinations."
          cardClassName="memory-rail-card"
          renderItem={(outfit) => (
            <OutfitShowcaseCard
              outfit={outfit}
              onFavorite={handleFavorite}
              onMarkWorn={handleMarkWorn}
              onEdit={setEditingOutfit}
              onDelete={handleDeleteOutfit}
              showMeta={false}
            />
          )}
        />

        {wardrobeSections.map((section) => (
          <RailSection
            key={section}
            id={section.toLowerCase()}
            title={section}
            description="Supporting pieces grouped calmly by section, so the closet stays easy to scan on mobile."
            items={groupedItems[section]}
            emptyMessage={`No ${section.toLowerCase()} saved yet. Add pieces through outfit memory and DigiCloset will place them here automatically.`}
            cardClassName="piece-rail-card"
            renderItem={(item) => (
              <ClothingCard
                item={item}
                onEdit={() => navigate(`/pieces/${item.id}`)}
                onDelete={handleDeleteClothing}
                showActions={false}
              />
            )}
          />
        ))}
      </div>

      <OutfitEditModal
        outfit={editingOutfit}
        isOpen={Boolean(editingOutfit)}
        isSaving={isSavingEdit}
        onClose={() => setEditingOutfit(null)}
        onSubmit={handleSaveEdit}
      />
    </main>
  );
}
