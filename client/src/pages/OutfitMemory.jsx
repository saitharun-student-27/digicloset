import { BookMarked, Clock3, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import OutfitMemoryForm from "../components/OutfitMemoryForm";
import OutfitShowcaseCard from "../components/OutfitShowcaseCard";
import { createOutfit, getOutfits } from "../services/outfitService";


export default function OutfitMemory() {
  const [outfits, setOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadOutfits = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getOutfits();
      setOutfits(data);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.detail ||
          "Could not load outfit memories. Make sure the backend is running, then try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOutfits();
  }, []);

  const handleCreateOutfit = async (outfit) => {
    setIsSubmitting(true);
    setError("");

    try {
      await createOutfit(outfit);
      await loadOutfits();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.detail ||
          "Could not save the outfit memory. Check the backend and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-ivory">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 overflow-hidden rounded-[2rem] bg-charcoal p-6 text-ivory shadow-soft">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-ivory/80">
                <BookMarked className="h-4 w-4 text-brass" />
                Outfit memory capture
              </div>
              <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                Save complete looks in whatever way feels natural
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ivory/70">
                Start from a photo, a text description, or a manual build. The
                goal is to preserve the look as wardrobe memory, not make you
                fill a long clothing database form.
              </p>
            </div>

            <div className="rounded-[1.75rem] bg-white/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ivory/50">
                Current memory library
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <Sparkles className="h-5 w-5 text-brass" />
                  <p className="mt-3 text-2xl font-semibold">{outfits.length}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-ivory/55">
                    Outfit memories
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <Clock3 className="h-5 w-5 text-brass" />
                  <p className="mt-3 text-2xl font-semibold">
                    {outfits[0]?.season || "Ready"}
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em] text-ivory/55">
                    Latest context
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mb-6">
            <ErrorState
              title="Could not load outfit memory"
              message={error}
              onRetry={loadOutfits}
            />
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(360px,520px)_1fr]">
          <OutfitMemoryForm
            onSubmit={handleCreateOutfit}
            isSubmitting={isSubmitting}
          />

          <section>
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
                  Saved outfit memories
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-charcoal">
                  Your captured looks
                </h2>
                <p className="mt-1 text-sm text-stone">
                  Saved memories stay in the backend, so they remain after
                  refresh and continue to build your closet.
                </p>
              </div>
            </div>

            {!error && isLoading ? <LoadingState /> : null}

            {!error && !isLoading && outfits.length === 0 ? (
              <EmptyState
                title="No outfit memories yet"
                description="Use the memory flow on the left to save your first complete look. Clothing pieces will be created behind the scenes from that outfit."
              />
            ) : null}

            {!error && !isLoading && outfits.length > 0 ? (
              <div className="grid gap-4">
                {outfits.map((outfit) => (
                  <OutfitShowcaseCard key={outfit.id} outfit={outfit} />
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
