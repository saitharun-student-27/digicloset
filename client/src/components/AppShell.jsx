import {
  Box,
  Home as HomeIcon,
  LogOut,
  Plus,
  Sparkles,
} from "lucide-react";
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
    <div className="app-canvas relative min-h-[100vh] min-h-[100dvh] overflow-x-hidden pb-[var(--bottom-dock-clearance)] text-charcoal">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 flex justify-center">
        <div className="shell-curve h-[15.5rem] w-[min(100%,calc(var(--app-canvas-max)+4rem))]" />
      </div>

      <div className="relative z-10">
        <div className="sticky top-0 z-40 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4">
          <div className="app-frame">
            <div className="shell-header">
              <div className="shell-brand">
                <div className="shell-brand-mark" aria-hidden="true">
                  <span className="font-serif text-[1.05rem] leading-none">
                    DC
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone/80">
                    Private wardrobe memory
                  </p>
                  <p className="font-serif text-[1.05rem] leading-none text-charcoal sm:text-[1.15rem]">
                    DigiCloset
                  </p>
                </div>
              </div>

              <div className="shell-profile-pill">
                <span className="max-w-[8.75rem] truncate text-[11px] font-medium text-stone sm:max-w-[12rem]">
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
        </div>

        <div className="app-frame">
          {children}
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-0 right-0 z-50 flex justify-center px-3 sm:px-4">
        <div className="app-frame flex justify-center">
          <nav className="shell-dock pointer-events-auto" aria-label="Primary">
          {navigationItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `shell-dock-link group ${
                  isActive
                    ? "shell-dock-link-active"
                    : "text-stone hover:bg-white/70 hover:text-charcoal"
                }`
              }
              aria-label={label}
            >
              <Icon className="h-[1.15rem] w-[1.15rem] sm:h-[1.2rem] sm:w-[1.2rem]" strokeWidth={2} />
              <span className="shell-dock-label">{label}</span>
              <span className="absolute -top-9 hidden scale-95 rounded-lg bg-charcoal px-3 py-1 text-xs font-medium text-ivory opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 sm:block">
                {label}
              </span>
            </NavLink>
          ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
