import { CloudRain, CloudSun, Dices, Snowflake, Sparkles, Sun, Thermometer, User, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import OutfitShowcaseCard from "../components/OutfitShowcaseCard";
import { getOutfits } from "../services/outfitService";
import { getClothingItems, getImageUrl } from "../services/clothingService";
import { api } from "../lib/api";

function PolaroidCard({ outfit }) {
  return (
    <Link
      to="/vault"
      className="group relative flex aspect-[3/4] w-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white p-3 shadow-soft transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    >
      <div className="relative flex-1 overflow-hidden rounded-xl bg-linen">
        {outfit.image_url ? (
          <img
            src={getImageUrl(outfit.image_url)}
            alt={outfit.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#eee6d9_0%,#f8f5ee_100%)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-sage shadow-soft">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between px-1">
        <div>
          <p className="font-serif text-sm font-semibold text-charcoal line-clamp-1">
            {outfit.title}
          </p>
          <p className="text-xs text-stone capitalize mt-0.5">{outfit.occasion}</p>
        </div>
      </div>
    </Link>
  );
}

function ClothingPolaroidCard({ item }) {
  return (
    <Link
      to="/vault"
      className="group relative flex aspect-[3/4] w-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white p-3 shadow-soft transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    >
      <div className="relative flex-1 overflow-hidden rounded-xl bg-linen">
        {item.image_url ? (
          <img
            src={getImageUrl(item.image_url)}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#eee6d9_0%,#f8f5ee_100%)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-sage shadow-soft">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between px-1">
        <div>
          <p className="font-serif text-sm font-semibold text-charcoal line-clamp-1">
            {item.name}
          </p>
          <p className="text-xs text-stone capitalize mt-0.5">{item.category?.replace("_", " ")}</p>
        </div>
      </div>
    </Link>
  );
}

const WEATHER_ICONS = {
  hot: Sun,
  cold: Snowflake,
  rainy: CloudRain,
  pleasant: CloudSun,
};

const WEATHER_LABELS = {
  hot: "Hot & Sunny",
  cold: "Cold & Chilly",
  rainy: "Rainy",
  pleasant: "Pleasant",
};

const WEATHER_ADVICE = {
  hot: "Keep it light and breathable — cotton shirts, linen trousers, and open sneakers.",
  cold: "Layer up with jackets and hoodies. Warm undertones work great today.",
  rainy: "We recommend a layered approach with a waterproof outer shell and warm undertones.",
  pleasant: "Perfect weather for any outfit. Go with your mood!",
};

export default function Home() {
  const [outfits, setOutfits] = useState([]);
  const [items, setItems] = useState([]);
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShuffling, setIsShuffling] = useState(false);
  const [rouletteItems, setRouletteItems] = useState([null, null, null]);

  useEffect(() => {
    async function loadData() {
      try {
        const [outfitData, clothingData, suggestionsRes] = await Promise.all([
          getOutfits(),
          getClothingItems(),
          api.get("/suggestions"),
        ]);
        setOutfits(outfitData);
        setItems(clothingData);
        setWeather(suggestionsRes.data.weather);
        
        // Initial roulette state
        if (clothingData.length > 0) {
          const uppers = clothingData.filter(i => ["shirt", "t_shirt", "jacket", "hoodie"].includes(i.category));
          const lowers = clothingData.filter(i => ["pant", "jeans", "shorts"].includes(i.category));
          const shoes = clothingData.filter(i => ["shoes"].includes(i.category));
          
          setRouletteItems([
            uppers[0] || clothingData[0],
            lowers[0] || (clothingData[1] || clothingData[0]),
            shoes[0] || (clothingData[2] || clothingData[0])
          ]);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleShuffle = () => {
    if (items.length === 0) return;
    setIsShuffling(true);
    
    const spins = 10;
    let currentSpin = 0;
    
    const interval = setInterval(() => {
      const getRandom = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : items[Math.floor(Math.random() * items.length)];
      
      const uppers = items.filter(i => ["shirt", "t_shirt", "jacket", "hoodie"].includes(i.category));
      const lowers = items.filter(i => ["pant", "jeans", "shorts"].includes(i.category));
      const shoes = items.filter(i => ["shoes"].includes(i.category));
      
      setRouletteItems([getRandom(uppers), getRandom(lowers), getRandom(shoes)]);
      
      currentSpin++;
      if (currentSpin >= spins) {
        clearInterval(interval);
        setIsShuffling(false);
      }
    }, 100);
  };

  // Show recent clothing items as "heavy rotation" (more useful than empty outfit cards)
  const recentItems = items.slice(0, 4);

  const WeatherIcon = weather ? (WEATHER_ICONS[weather.condition] || CloudSun) : CloudSun;
  const weatherLabel = weather ? (WEATHER_LABELS[weather.condition] || "Pleasant") : "Loading...";
  const weatherAdvice = weather ? (WEATHER_ADVICE[weather.condition] || WEATHER_ADVICE.pleasant) : "Checking your local weather...";
  const tempDisplay = weather ? `${Math.round(weather.temperature)}°C` : "--°C";

  return (
    <main className="mx-auto max-w-7xl px-6 pt-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-4xl text-charcoal">Good morning.</h1>
          <p className="mt-2 text-stone">Your wardrobe is ready.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="relative overflow-hidden rounded-[2rem] bg-charcoal p-6 text-ivory shadow-soft flex flex-col justify-between">
          <div>
            <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                <User className="h-6 w-6 text-brass" />
              </div>
              <div>
                <p className="font-serif text-lg">Creative Director</p>
                <p className="text-xs uppercase tracking-widest text-ivory/60 mt-1">Level 10 Minimalist</p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <div className="flex-1 rounded-2xl bg-white/10 p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-semibold">{outfits.length}</p>
              <p className="mt-1 text-xs text-ivory/60">FITS</p>
            </div>
            <div className="flex-1 rounded-2xl bg-white/10 p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-semibold">{items.length}</p>
              <p className="mt-1 text-xs text-ivory/60">PIECES</p>
            </div>
          </div>
        </div>

        {/* Weather & Stylist Roulette Container */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Live Weather Card */}
          <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#f4efe6_0%,#e8efe9_100%)] p-8 shadow-soft">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between h-full">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-sage/10 px-3 py-1.5 text-xs font-medium text-sage">
                  <WeatherIcon className="h-4 w-4" />
                  {tempDisplay} {weatherLabel}
                </div>
                <h2 className="mt-4 font-serif text-3xl text-charcoal">Today's Forecast</h2>
                <p className="mt-2 text-sm leading-6 text-stone">{weatherAdvice}</p>
              </div>
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-4 border-white/50 bg-white/30 backdrop-blur-md shadow-inner">
                <Thermometer className="h-10 w-10 text-sage/70" />
              </div>
            </div>
          </div>

          {/* Stylist Roulette */}
          <div className="relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-soft border border-black/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-xl text-charcoal flex items-center gap-2">
                  <Dices className="h-5 w-5 text-brass" /> Stylist Roulette
                </h3>
                <p className="text-sm text-stone">Not sure what to wear? Shuffle your vault.</p>
              </div>
              <button 
                onClick={handleShuffle}
                disabled={isShuffling || items.length === 0}
                className="inline-flex h-10 items-center justify-center rounded-full bg-charcoal px-6 text-sm font-medium text-ivory transition hover:bg-softblack disabled:opacity-50"
              >
                {isShuffling ? "Shuffling..." : "Shuffle"}
              </button>
            </div>
            
            <div className="flex gap-4 h-32 overflow-hidden">
              {rouletteItems.map((item, idx) => (
                <div key={idx} className={`flex-1 rounded-2xl bg-linen flex items-center justify-center relative overflow-hidden group ${isShuffling ? 'animate-pulse' : ''}`}>
                  {item && item.image_url ? (
                    <img src={getImageUrl(item.image_url)} alt={item.name || "clothing"} className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <Sparkles className="h-6 w-6 text-stone/30" />
                  )}
                  <div className="absolute bottom-2 left-2 right-2 rounded-xl bg-white/80 backdrop-blur-sm p-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-charcoal shadow-sm truncate">
                    {item ? (item.name || item.category) : "Empty"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Your Wardrobe Section */}
      <section className="mt-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-serif text-2xl text-charcoal">Your Wardrobe</h2>
          <Link to="/vault" className="text-sm font-medium text-sage hover:text-charcoal transition">
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center rounded-[2rem] border border-black/5 bg-white/50">
            <Sparkles className="h-6 w-6 animate-pulse text-brass" />
          </div>
        ) : recentItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
            {recentItems.map((item) => (
              <ClothingPolaroidCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-[2rem] border border-black/5 bg-white p-6 shadow-soft text-center">
            <Sparkles className="h-8 w-8 text-brass mb-4" />
            <h3 className="font-serif text-xl text-charcoal">Your vault is empty.</h3>
            <p className="mt-2 text-sm text-stone max-w-sm">
              Head over to the Capture tab to add your first piece or complete outfit to the rotation.
            </p>
            <Link to="/capture" className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-charcoal px-6 text-sm font-medium text-ivory transition hover:bg-softblack">
              Capture a Look
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
