import { ArrowRight, DoorOpen, Footprints, Gem, Sparkles, Shirt, StretchHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import OutfitShowcaseCard from "../components/OutfitShowcaseCard";
import WardrobeGrid from "../components/WardrobeGrid";
import { getClothingItems } from "../services/clothingService";
import { getOutfits } from "../services/outfitService";


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

        <section className="mb-10">
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

        <section>
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-black/10 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
                Individual pieces
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-charcoal">
                Supporting wardrobe infrastructure
              </h2>
              <p className="mt-1 text-sm text-stone">
                Pieces are organized like a closet, but they stay secondary to
                complete outfit memories.
              </p>
            </div>
          </div>

          {!error && isLoading ? <LoadingState /> : null}
          {!error && !isLoading && items.length === 0 ? (
            <EmptyState
              title="No wardrobe pieces yet"
              description="Save an outfit memory first. Its clothing pieces will appear here in closet sections automatically."
            />
          ) : null}
          {!error && !isLoading && items.length > 0 ? (
            <div className="space-y-8">
              {closetGroups.map((section) => {
                const Icon = section.icon;

                if (section.items.length === 0) {
                  return null;
                }

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
                    <WardrobeGrid items={section.items} />
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
