import {
  ArrowRight,
  BookMarked,
  Sparkles,
  SunMedium,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import BrandShowcase from "../components/BrandShowcase";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import OutfitShowcaseCard from "../components/OutfitShowcaseCard";
import { getOutfits } from "../services/outfitService";


function buildSeasonalFits(outfits) {
  const seenSeasons = new Set();

  return outfits.filter((outfit) => {
    if (seenSeasons.has(outfit.season)) {
      return false;
    }

    seenSeasons.add(outfit.season);
    return true;
  });
}

function EmptyOutfitState() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="rounded-[2rem] border border-black/5 bg-white p-8 shadow-soft">
        <div className="inline-flex items-center gap-2 rounded-full bg-linen px-3 py-2 text-sm font-medium text-stone">
          <Sparkles className="h-4 w-4 text-brass" />
          Outfit memory starts here
        </div>
        <h2 className="mt-5 text-3xl font-semibold text-charcoal sm:text-4xl">
          No outfit memories yet.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-stone">
          DigiCloset works best when you save complete looks first. Capture a
          whole outfit, break it into pieces, and let your wardrobe build around
          those memories.
        </p>
        <Link
          to="/outfit-memory"
          className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory shadow-soft transition hover:-translate-y-0.5 hover:bg-softblack"
        >
          Save your first outfit memory
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <BrandShowcase />
    </div>
  );
}

export default function Home() {
  const [outfits, setOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadOutfits() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getOutfits();
        if (isMounted) {
          setOutfits(data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError?.response?.data?.detail ||
              "Make sure the backend is running, then try again.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadOutfits();

    return () => {
      isMounted = false;
    };
  }, []);

  const todaysFit = outfits[0] || null;
  const recentMemories = useMemo(() => outfits.slice(0, 3), [outfits]);
  const seasonalFits = useMemo(
    () => buildSeasonalFits(outfits).slice(0, 3),
    [outfits],
  );

  return (
    <main>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 rounded-[2rem] bg-charcoal px-6 py-8 text-ivory shadow-soft lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-ivory/80">
              <BookMarked className="h-4 w-4 text-brass" />
              Outfit-first wardrobe companion
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal sm:text-6xl">
              Your wardrobe, remembered intelligently.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-ivory/70 sm:text-base">
              Capture complete looks, preserve the pieces inside them, and build
              a personal style memory you can return to across seasons and
              occasions.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/outfit-memory"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-charcoal shadow-soft transition hover:-translate-y-0.5"
              >
                Build Outfit Memory
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/wardrobe"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-ivory transition hover:bg-white/10"
              >
                Open Digital Closet
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ivory/50">
              Today&apos;s fit
            </p>
            <div className="mt-4 rounded-[1.5rem] bg-white/95 p-4 text-charcoal shadow-soft">
              {todaysFit ? (
                <>
                  <p className="text-lg font-semibold">{todaysFit.title}</p>
                  <p className="mt-2 text-sm leading-6 text-stone">
                    {todaysFit.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-linen px-3 py-2 text-xs font-medium capitalize text-charcoal">
                      {todaysFit.season}
                    </span>
                    <span className="rounded-full bg-linen px-3 py-2 text-xs font-medium capitalize text-charcoal">
                      {todaysFit.occasion}
                    </span>
                    {todaysFit.style ? (
                      <span className="rounded-full bg-sage/10 px-3 py-2 text-xs font-medium capitalize text-sage">
                        {todaysFit.style}
                      </span>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold">
                    Your first memory starts the story
                  </p>
                  <p className="mt-2 text-sm leading-6 text-stone">
                    Once you save an outfit, DigiCloset will surface it here as
                    the lead memory of your wardrobe.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        {error ? (
          <ErrorState
            title="Could not load outfit memories"
            message={error}
          />
        ) : null}

        {!error && isLoading ? (
          <div className="space-y-10">
            <LoadingState />
            <LoadingState />
          </div>
        ) : null}

        {!error && !isLoading && outfits.length === 0 ? (
          <EmptyOutfitState />
        ) : null}

        {!error && !isLoading && outfits.length > 0 ? (
          <div className="space-y-10">
            <section>
              <div className="mb-5 flex items-end justify-between gap-4 border-b border-black/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
                    Today&apos;s fit
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-charcoal">
                    Outfit memories lead the experience
                  </h2>
                </div>
                <Link
                  to="/outfit-memory"
                  className="inline-flex items-center gap-2 text-sm font-medium text-sage"
                >
                  Save another look
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <OutfitShowcaseCard outfit={todaysFit} />
            </section>

            <section>
              <div className="mb-5 flex items-end justify-between gap-4 border-b border-black/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
                    Recent outfit memories
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-charcoal">
                    Looks you&apos;ve already captured
                  </h2>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {recentMemories.map((outfit) => (
                  <OutfitShowcaseCard key={outfit.id} outfit={outfit} />
                ))}
              </div>
            </section>

            <section>
              <div className="mb-5 flex items-end justify-between gap-4 border-b border-black/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
                    Seasonal fits
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-charcoal">
                    Outfit memories across the year
                  </h2>
                </div>
                <SunMedium className="h-5 w-5 text-brass" />
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {seasonalFits.map((outfit) => (
                  <OutfitShowcaseCard
                    key={`season-${outfit.id}`}
                    outfit={outfit}
                  />
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
