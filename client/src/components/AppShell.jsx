import { Box, Home as HomeIcon, Sparkles, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";

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
  return (
    <div className="relative min-h-[100vh] min-h-[100dvh] bg-ivory pb-[var(--bottom-dock-clearance)] text-charcoal">
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
