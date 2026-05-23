import { CalendarDays, Heart, Lock, LogOut, Package, Shirt } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import { useAuth } from "../context/AuthContext.jsx";
import { useWardrobeData } from "../context/WardrobeDataProvider.jsx";

function formatJoinedDate(value) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function SummaryCard({ icon: Icon, label, value, note }) {
  return (
    <article className="rounded-[1.5rem] border border-black/5 bg-white/90 p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
            {label}
          </p>
          <p className="mt-2 font-serif text-[1.9rem] leading-none text-charcoal">
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory text-brass">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-stone">{note}</p>
    </article>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    outfits,
    clothingItems,
    outfitsLoading,
    clothingLoading,
    outfitsError,
    clothingError,
  } = useWardrobeData();

  const isLoading = outfitsLoading || clothingLoading;
  const loadError = outfitsError || clothingError;
  const favoriteOutfits = outfits.filter((outfit) => outfit.is_favorite).length;
  const recentlyWornOutfits = outfits.filter((outfit) => outfit.last_worn_date).length;
  const displayName = user?.display_name?.trim() || "Private wardrobe owner";

  function handleLogout() {
    logout();
    navigate("/welcome", {
      replace: true,
      state: { message: "Signed out." },
    });
  }

  return (
    <main className="page-shell max-w-[50rem]">
      <section className="section-surface overflow-hidden p-4 sm:p-5">
        <div className="rounded-[1.95rem] border border-[#ddd0bc] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(248,245,238,0.98)_100%)] px-5 py-6 text-center sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
            Profile
          </p>
          <h1 className="mt-2 font-serif text-[1.95rem] leading-tight text-charcoal sm:text-[2.15rem]">
            Your private DigiCloset account and wardrobe summary.
          </h1>
          <p className="mx-auto mt-3 max-w-[30rem] text-sm leading-6 text-stone">
            A calm view of the account behind your saved looks, wardrobe pieces, and
            rewear memories.
          </p>
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:mt-5">
        <section className="section-surface overflow-hidden p-4 sm:p-5">
          <div className="rounded-[1.7rem] border border-[#e4d9c8] bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(248,245,238,0.98)_100%)] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
                  Account
                </p>
                <h2 className="mt-2 font-serif text-[1.75rem] leading-tight text-charcoal">
                  {displayName}
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone">{user?.email}</p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-ivory px-3 py-2 text-xs font-medium text-stone">
                <CalendarDays className="h-3.5 w-3.5 text-brass" />
                Joined {formatJoinedDate(user?.created_at)}
              </div>
            </div>

            <div className="mt-4 rounded-[1.25rem] border border-brass/12 bg-[#f8f2e8] px-4 py-3 text-sm leading-6 text-stone">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                <p>Your wardrobe is private to your account.</p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition hover:bg-softblack"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
              <Link
                to="/wardrobe"
                className="inline-flex h-11 min-h-[var(--touch-target-min)] items-center justify-center rounded-full bg-ivory px-5 text-sm font-medium text-charcoal transition hover:bg-linen"
              >
                Back to wardrobe
              </Link>
            </div>
          </div>
        </section>

        {loadError && !isLoading ? (
          <ErrorState
            title="Could not load your wardrobe summary"
            message={loadError}
          />
        ) : null}

        {isLoading ? (
          <LoadingState />
        ) : (
          <section className="section-surface overflow-hidden p-4 sm:p-5">
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
                Wardrobe summary
              </p>
              <h2 className="mt-1.5 font-serif text-[1.55rem] leading-tight text-charcoal">
                A quick view of what lives in your closet.
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryCard
                icon={Shirt}
                label="Outfit memories"
                value={outfits.length}
                note="Complete looks you can return to when you want something dependable."
              />
              <SummaryCard
                icon={Package}
                label="Wardrobe pieces"
                value={clothingItems.length}
                note="Supporting pieces already gathered into your private wardrobe."
              />
              <SummaryCard
                icon={Heart}
                label="Favorite outfits"
                value={favoriteOutfits}
                note="Saved combinations you have already marked as especially worth keeping close."
              />
              <SummaryCard
                icon={CalendarDays}
                label="Recently worn"
                value={recentlyWornOutfits}
                note="Outfit memories with a recorded worn date, so your closet stays tied to real use."
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
