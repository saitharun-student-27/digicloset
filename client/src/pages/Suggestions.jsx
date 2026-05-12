import { Sparkles, Calendar, Clock, Star, CloudSun, Thermometer } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { getImageUrl } from "../services/clothingService";

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSuggestions() {
      try {
        const res = await api.get("/suggestions");
        setSuggestions(res.data);
      } catch (err) {
        console.error("Failed to load suggestions", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSuggestions();
  }, []);

  if (isLoading) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col h-[calc(100vh-120px)] px-6 pt-10">
        <div className="flex h-full items-center justify-center">
          <p className="text-stone">Loading insights...</p>
        </div>
      </main>
    );
  }

  const weather = suggestions?.weather;
  const conditionLabel = {
    hot: "Hot & Sunny",
    cold: "Cold & Chilly",
    rainy: "Rainy",
    pleasant: "Pleasant",
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col h-[calc(100vh-120px)] px-6 pt-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal text-brass">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-serif text-2xl text-charcoal">Wardrobe Insights</h1>
          <p className="text-sm text-stone">Deterministic, smart suggestions for your rotation.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar space-y-10">

        {/* Section: Live Weather */}
        {weather && (
          <section>
            <div className="mb-4 flex items-center gap-2 text-stone">
              <CloudSun className="h-4 w-4" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Today's Weather</h2>
            </div>
            <div className="rounded-2xl bg-[linear-gradient(135deg,#f8f5ee_0%,#eee6d9_100%)] border border-black/5 p-5 flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-soft">
                <Thermometer className="h-7 w-7 text-brass" />
              </div>
              <div>
                <p className="font-serif text-3xl text-charcoal">{weather.temperature}°C</p>
                <p className="text-sm text-stone">{conditionLabel[weather.condition] || weather.condition}</p>
              </div>
            </div>
          </section>
        )}

        {/* Section: Weather Picks */}
        {suggestions?.weather_picks?.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-2 text-stone">
              <CloudSun className="h-4 w-4" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Weather Match</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory">
              {suggestions.weather_picks.map(piece => (
                <div key={piece.id} className="w-[200px] shrink-0 snap-start group block overflow-hidden rounded-2xl bg-white shadow-soft p-3">
                  <div className="aspect-square w-full rounded-xl bg-ivory overflow-hidden relative">
                    {piece.image_url ? (
                      <img src={getImageUrl(piece.image_url)} alt={piece.name} className="h-full w-full object-contain mix-blend-multiply" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-stone/30">
                        <Star className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="font-serif text-sm text-charcoal line-clamp-1">{piece.name}</p>
                    <p className="text-xs text-sage font-medium mt-1">{piece.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Unworn Outfits */}
        <section>
          <div className="mb-4 flex items-center gap-2 text-stone">
            <Clock className="h-4 w-4" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Recently Unworn</h2>
          </div>
          {suggestions?.unworn_outfits?.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {suggestions.unworn_outfits.map(outfit => (
                <Link key={outfit.id} to="/vault" className="group block overflow-hidden rounded-2xl bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-xl p-3">
                  <div className="aspect-square w-full rounded-xl bg-linen overflow-hidden relative">
                    {outfit.image_url ? (
                      <img src={getImageUrl(outfit.image_url)} alt={outfit.title} className="h-full w-full object-cover mix-blend-multiply" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-stone/30">
                        <Star className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="font-serif text-sm text-charcoal line-clamp-1">{outfit.title}</p>
                    <p className="text-xs text-stone mt-1 line-clamp-2">{outfit.message}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-black/10 p-8 text-center text-stone">
              <p>You have worn all your outfits recently. Good job!</p>
            </div>
          )}
        </section>

        {/* Section: Frequent Pieces */}
        <section>
          <div className="mb-4 flex items-center gap-2 text-stone">
            <Calendar className="h-4 w-4" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Heavy Rotation Pieces</h2>
          </div>
          {suggestions?.frequent_pieces?.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {suggestions.frequent_pieces.map(piece => (
                <div key={piece.id} className="group block overflow-hidden rounded-2xl bg-white shadow-soft p-3">
                  <div className="aspect-square w-full rounded-xl bg-ivory overflow-hidden relative">
                    {piece.image_url ? (
                      <img src={getImageUrl(piece.image_url)} alt={piece.name} className="h-full w-full object-contain mix-blend-multiply" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-stone/30">
                        <Star className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="font-serif text-sm text-charcoal line-clamp-1">{piece.name}</p>
                    <p className="text-xs text-sage font-medium mt-1">{piece.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-black/10 p-8 text-center text-stone">
              <p>No pieces have been linked to outfits yet.</p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
