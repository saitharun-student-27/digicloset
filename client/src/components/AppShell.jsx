import { Box, Home as HomeIcon, Sparkles, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";

const navigationItems = [
  {
    to: "/",
    label: "Home",
    icon: HomeIcon,
  },
  {
    to: "/vault",
    label: "Vault",
    icon: Box,
  },
  {
    to: "/capture",
    label: "Capture",
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
    <div className="relative min-h-screen bg-ivory text-charcoal pb-24">
      {children}
      
      {/* Floating Bottom Dock Navigation */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="flex items-center gap-2 rounded-[2rem] border border-white/20 bg-white/70 p-2 shadow-soft backdrop-blur-xl pointer-events-auto">
          {navigationItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${
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
