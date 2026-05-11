import { ArrowRight, DoorOpen, Footprints, Gem, Sparkles, Shirt, StretchHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import OutfitShowcaseCard from "../components/OutfitShowcaseCard";
import WardrobeGrid from "../components/WardrobeGrid";
import { createClothingItem, getClothingItems } from "../services/clothingService";
import { getOutfits } from "../services/outfitService";
import { categories, occasions, seasons } from "../utils/outfitUtils";


const closetSections = [
  {
    key: "upperwear",
    title: "Upperwear",
    description: "Tops, layers, and one-piece looks carried by outfit memory.",
    icon: Shirt,
    categories: ["shirt", "t_shirt", "jacket", "hoodie", "dress"],
  },
  {
    key: "lowerwear",
    title: "Lowerwear",
    description: "Trousers, jeans, and bottoms linked to saved looks.",
    icon: StretchHorizontal,
    categories: ["pant", "jeans", "shorts"],
  },
  {
    key: "footwear",
    title: "Footwear",
    description: "Shoes that finish complete outfit combinations.",
    icon: Footprints,
    categories: ["shoes"],
  },
  {
    key: "accessories",
    title: "Accessories",
    description: "Final accents that help a look feel complete.",
    icon: Gem,
    categories: ["accessory"],
  },
];

function groupItemsForCloset(items) {
  return closetSections.map((section) => ({
    ...section,
    items: items.filter((item) => section.categories.includes(item.category)),
  }));
}

export default function Wardrobe() {
  const [items, setItems] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({
    name: "",
    category: "shirt",
    color: "",
    season: "",
    occasion: "",
    style: "",
    formality_level: "",
  });
  const outfitSectionId = "wardrobe-outfit-memories";
  const piecesSectionId = "wardrobe-individual-pieces";

  const closetGroups = useMemo(() => groupItemsForCloset(items), [items]);

  const loadWardrobe = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [clothingItems, outfitItems] = await Promise.all([
        getClothingItems(),
        getOutfits(),
      ]);
      setItems(clothingItems);
      setOutfits(outfitItems);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.detail ||
          "Make sure the backend is running, then try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWardrobe();
  }, []);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) {
      return;
    }

    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleQuickAddChange = (event) => {
    const { name, value } = event.target;
    setQuickAddForm((current) => ({ ...current, [name]: value }));
  };

  const resetQuickAddForm = () => {
    setQuickAddForm({
      name: "",
      category: "shirt",
      color: "",
      season: "",
      occasion: "",
      style: "",
      formality_level: "",
    });
  };

  const handleQuickAddPiece = async (event) => {
    event.preventDefault();
    setIsQuickAdding(true);
    setError("");

    try {
      await createClothingItem({
        name: quickAddForm.name.trim(),
        category: quickAddForm.category,
        color: quickAddForm.color.trim(),
        season: quickAddForm.season || null,
        occasion: quickAddForm.occasion || null,
        style: quickAddForm.style.trim() || null,
        formality_level: quickAddForm.formality_level.trim() || null,
        source_type: "manual_piece",
      });
      resetQuickAddForm();
      await loadWardrobe();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.detail ||
          "Could not quick add this piece. Check the backend and try again.",
      );
    } finally {
      setIsQuickAdding(false);
    }
  };

  return (
    <main className="bg-ivory">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 overflow-hidden rounded-[2rem] bg-charcoal p-6 text-ivory shadow-soft">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-ivory/80">
                <DoorOpen className="h-4 w-4 text-brass" />
                Digital closet view
              </div>
              <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                Open your wardrobe through saved looks
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ivory/70">
                Clothing pieces live here as supporting wardrobe memory. When
                you want to add something new, start with a complete outfit and
                let DigiCloset store the pieces behind the scenes.
              </p>
              <Link
                to="/outfit-memory"
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-charcoal shadow-soft transition hover:-translate-y-0.5"
              >
                Save Outfit Memory
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <Sparkles className="h-5 w-5 text-brass" />
                <p className="mt-3 text-2xl font-semibold">{outfits.length}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-ivory/55">
                  Outfits
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <Shirt className="h-5 w-5 text-brass" />
                <p className="mt-3 text-2xl font-semibold">{items.length}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-ivory/55">
                  Pieces
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <DoorOpen className="h-5 w-5 text-brass" />
                <p className="mt-3 text-2xl font-semibold">Closet</p>
                <p className="text-xs uppercase tracking-[0.14em] text-ivory/55">
                  Ready
                </p>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mb-6">
            <ErrorState message={error} onRetry={loadWardrobe} />
          </div>
        ) : null}

        <div className="sticky top-24 z-10 mb-6 rounded-full border border-black/5 bg-ivory/95 p-2 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => scrollToSection(outfitSectionId)}
              className="inline-flex h-11 items-center justify-center rounded-full bg-charcoal px-4 text-sm font-medium text-ivory transition hover:bg-softblack sm:flex-1"
            >
              Outfit Memories
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(piecesSectionId)}
              className="inline-flex h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-medium text-charcoal transition hover:bg-linen sm:flex-1"
            >
              Individual Pieces
            </button>
          </div>
        </div>

        <section id={outfitSectionId} className="mb-10 scroll-mt-32">
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-black/10 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
                Saved outfit memories
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-charcoal">
                Complete looks come first
              </h2>
            </div>
            <Link
              to="/outfit-memory"
              className="inline-flex items-center gap-2 text-sm font-medium text-sage"
            >
              Build another outfit memory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {!error && isLoading ? <LoadingState /> : null}
          {!error && !isLoading && outfits.length === 0 ? (
            <EmptyState
              title="No outfit memories in your closet yet"
              description="Start from the Outfit Memory flow. DigiCloset will store the complete look first, then organize the clothing pieces here."
            />
          ) : null}
          {!error && !isLoading && outfits.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {outfits.slice(0, 2).map((outfit) => (
                <OutfitShowcaseCard key={outfit.id} outfit={outfit} />
              ))}
            </div>
          ) : null}
        </section>

        <section id={piecesSectionId} className="scroll-mt-32">
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-black/10 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
                Individual pieces
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-charcoal">
                Individual Pieces
              </h2>
              <p className="mt-1 text-sm text-stone">
                Clothing pieces saved from your outfit memories.
              </p>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-black/5 bg-linen p-4 shadow-soft">
            <div className="mb-4">
              <p className="text-sm font-semibold text-charcoal">
                Quick Add Piece
              </p>
              <p className="mt-1 text-sm leading-6 text-stone">
                Add a standalone wardrobe piece when you are not saving a full
                outfit memory. This stays secondary to outfit capture.
              </p>
            </div>

            <form onSubmit={handleQuickAddPiece} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <input
                name="name"
                value={quickAddForm.name}
                onChange={handleQuickAddChange}
                placeholder="White Oxford Shirt"
                required
                className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm text-charcoal outline-none transition placeholder:text-stone/60 focus:border-sage focus:ring-4 focus:ring-sage/10"
              />
              <input
                name="color"
                value={quickAddForm.color}
                onChange={handleQuickAddChange}
                placeholder="white"
                required
                className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm text-charcoal outline-none transition placeholder:text-stone/60 focus:border-sage focus:ring-4 focus:ring-sage/10"
              />
              <select
                name="category"
                value={quickAddForm.category}
                onChange={handleQuickAddChange}
                className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm capitalize text-charcoal outline-none transition focus:border-sage focus:ring-4 focus:ring-sage/10"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.replace("_", " ")}
                  </option>
                ))}
              </select>
              <input
                name="style"
                value={quickAddForm.style}
                onChange={handleQuickAddChange}
                placeholder="minimal"
                className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm text-charcoal outline-none transition placeholder:text-stone/60 focus:border-sage focus:ring-4 focus:ring-sage/10"
              />
              <select
                name="season"
                value={quickAddForm.season}
                onChange={handleQuickAddChange}
                className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm capitalize text-charcoal outline-none transition focus:border-sage focus:ring-4 focus:ring-sage/10"
              >
                <option value="">Season optional</option>
                {seasons.map((season) => (
                  <option key={season} value={season}>
                    {season.replace("_", " ")}
                  </option>
                ))}
              </select>
              <select
                name="occasion"
                value={quickAddForm.occasion}
                onChange={handleQuickAddChange}
                className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm capitalize text-charcoal outline-none transition focus:border-sage focus:ring-4 focus:ring-sage/10"
              >
                <option value="">Occasion optional</option>
                {occasions.map((occasion) => (
                  <option key={occasion} value={occasion}>
                    {occasion.replace("_", " ")}
                  </option>
                ))}
              </select>
              <input
                name="formality_level"
                value={quickAddForm.formality_level}
                onChange={handleQuickAddChange}
                placeholder="formality optional"
                className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm text-charcoal outline-none transition placeholder:text-stone/60 focus:border-sage focus:ring-4 focus:ring-sage/10"
              />
              <div className="md:col-span-2 xl:col-span-2">
                <button
                  type="submit"
                  disabled={isQuickAdding}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-charcoal px-5 text-sm font-medium text-ivory shadow-soft transition hover:-translate-y-0.5 hover:bg-softblack disabled:cursor-not-allowed disabled:bg-stone"
                >
                  {isQuickAdding ? "Adding piece..." : "Quick Add Piece"}
                </button>
              </div>
            </form>
          </div>

          {!error && isLoading ? <LoadingState /> : null}
          {!error && !isLoading && items.length === 0 ? (
            <EmptyState
              title="No individual pieces yet"
              description="Save an outfit memory to build your closet."
            />
          ) : null}
          {!error && !isLoading && items.length > 0 ? (
            <div className="space-y-8">
              {closetGroups.map((section) => {
                const Icon = section.icon;

                return (
                  <section key={section.key}>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linen text-charcoal">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-charcoal">
                          {section.title}
                        </h3>
                        <p className="text-sm text-stone">{section.description}</p>
                      </div>
                    </div>
                    {section.items.length > 0 ? (
                      <WardrobeGrid items={section.items} />
                    ) : (
                      <div className="rounded-2xl border border-dashed border-black/10 bg-white p-4 text-sm text-stone">
                        No {section.title.toLowerCase()} saved yet.
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
