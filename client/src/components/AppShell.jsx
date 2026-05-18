import { Box, Home as HomeIcon, LogOut, Plus, Sparkles } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const navigationItems = [
  {
    to: "/",
    label: "Home",
    icon: HomeIcon,
  },
  {
    to: "/wardrobe",
    label: "Wardrobe",
    icon: Box,
  },
  {
    to: "/outfit-memory",
    label: "Outfit Memory",
    icon: Plus,
  },
  {
    to: "/suggestions",
    label: "Suggestions",
    icon: Sparkles,
  },
];

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/welcome", {
      replace: true,
      state: { message: "Signed out." },
    });
  }

  const profileLabel = user?.display_name || user?.email || "Signed in";

  return (
    <div className="relative min-h-[100vh] min-h-[100dvh] bg-ivory pb-[var(--bottom-dock-clearance)] text-charcoal">
      <div className="sticky top-0 z-40 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4">
        <div className="mx-auto flex max-w-7xl justify-end">
          <div className="flex items-center gap-2 rounded-full border border-white/40 bg-white/80 px-2 py-2 shadow-soft backdrop-blur-xl">
            <span className="max-w-[10rem] truncate px-2 text-xs font-medium text-stone sm:max-w-none">
              {profileLabel}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 min-h-[var(--touch-target-min)] min-w-[var(--touch-target-min)] items-center justify-center rounded-full bg-ivory px-3 text-sm font-medium text-charcoal transition hover:bg-linen"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </div>

      {children}

      {/* Floating Bottom Dock Navigation */}
      <div className="pointer-events-none fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-0 right-0 z-50 flex justify-center px-3 sm:px-4">
        <nav className="pointer-events-auto flex items-center gap-1.5 rounded-[2rem] border border-white/20 bg-white/78 p-2 shadow-soft backdrop-blur-xl">
          {navigationItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group relative flex h-12 min-h-[var(--touch-target-min)] w-12 min-w-[var(--touch-target-min)] items-center justify-center rounded-full transition-all duration-300 sm:h-14 sm:w-14 ${
                  isActive
                    ? "bg-charcoal text-ivory shadow-lg scale-105"
                    : "text-stone hover:bg-white hover:text-charcoal hover:shadow-md"
                }`
              }
              aria-label={label}
            >
              <Icon className="h-6 w-6" strokeWidth={2} />
              
              {/* Tooltip on hover for larger screens */}
              <span className="absolute -top-10 scale-0 rounded-lg bg-charcoal px-3 py-1.5 text-xs font-medium text-ivory opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 hidden sm:block">
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
