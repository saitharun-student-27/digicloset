import { BookMarked, DoorOpen, Home, Shirt } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import BrandLogo from "./BrandLogo";


const navigationItems = [
  {
    to: "/",
    label: "Home",
    icon: Home,
  },
  {
    to: "/outfit-memory",
    label: "Outfit Memory",
    icon: BookMarked,
  },
  {
    to: "/wardrobe",
    label: "Wardrobe",
    icon: Shirt,
  },
];

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-ivory/90 backdrop-blur">
        <nav className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link to="/" aria-label="DigiCloset home">
            <BrandLogo />
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {navigationItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${
                    isActive
                      ? "bg-charcoal text-ivory shadow-soft"
                      : "text-stone hover:bg-white hover:text-charcoal"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}

            <Link
              to="/outfit-memory"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-charcoal px-4 text-sm font-medium text-ivory shadow-soft transition hover:-translate-y-0.5 hover:bg-softblack"
            >
              Save Memory
              <DoorOpen className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      {children}
    </div>
  );
}
