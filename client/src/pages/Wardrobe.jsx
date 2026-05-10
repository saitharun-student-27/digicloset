import { Archive, Plus, Shirt, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import ClothingForm from "../components/ClothingForm";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import WardrobeGrid from "../components/WardrobeGrid";
import {
  createClothingItem,
  getClothingItems,
} from "../services/clothingService";


export default function Wardrobe() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadWardrobe = async () => {
    setIsLoading(true);
    setError("");

    try {
      const clothingItems = await getClothingItems();
      setItems(clothingItems);
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

  const handleCreateItem = async (item) => {
    setIsSubmitting(true);
    setError("");

    try {
      await createClothingItem(item);
      await loadWardrobe();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.detail ||
          "Could not add the clothing item. Check the form and try again.",
      );
      throw requestError;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-ivory">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 overflow-hidden rounded-[2rem] bg-charcoal p-6 text-ivory shadow-soft">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-ivory/80">
                <Archive className="h-4 w-4 text-brass" />
                Wardrobe dashboard
              </div>
              <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                Organized clothing memory
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ivory/70">
                Add manual clothing items and build a clean foundation for
                outfit intelligence later.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <Shirt className="h-5 w-5 text-brass" />
                <p className="mt-3 text-2xl font-semibold">{items.length}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-ivory/55">
                  Items
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <Sparkles className="h-5 w-5 text-brass" />
                <p className="mt-3 text-2xl font-semibold">Manual</p>
                <p className="text-xs uppercase tracking-[0.14em] text-ivory/55">
                  Source
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(320px,420px)_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-stone">
              <Plus className="h-4 w-4 text-sage" />
              Add to wardrobe
            </div>
            <ClothingForm
              onSubmit={handleCreateItem}
              isSubmitting={isSubmitting}
            />
          </div>

          <section>
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-charcoal">
                  Wardrobe items
                </h2>
                <p className="mt-1 text-sm text-stone">
                  {items.length} {items.length === 1 ? "item" : "items"} in
                  your closet
                </p>
              </div>
            </div>

            {error ? <ErrorState message={error} onRetry={loadWardrobe} /> : null}
            {!error && isLoading ? <LoadingState /> : null}
            {!error && !isLoading && items.length === 0 ? <EmptyState /> : null}
            {!error && !isLoading && items.length > 0 ? (
              <WardrobeGrid items={items} />
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
