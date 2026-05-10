import { ArrowRight, LayoutDashboard } from "lucide-react";
import { Link, NavLink, Route, Routes } from "react-router-dom";

import BrandLogo from "./components/BrandLogo";
import BrandShowcase from "./components/BrandShowcase";
import Wardrobe from "./pages/Wardrobe";


function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <header className="border-b border-black/5 bg-ivory/90 backdrop-blur">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" aria-label="DigiCloset home">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-charcoal text-ivory"
                    : "text-stone hover:bg-linen hover:text-charcoal"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/wardrobe"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-charcoal text-ivory"
                    : "text-stone hover:bg-linen hover:text-charcoal"
                }`
              }
            >
              Wardrobe
            </NavLink>
          </div>
        </nav>
      </header>
      {children}
    </div>
  );
}


function Home() {
  return (
    <AppShell>
      <main>
        <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-2 text-sm font-medium text-stone shadow-soft">
              <LayoutDashboard className="h-4 w-4 text-sage" />
              Wardrobe Memory + Outfit Intelligence
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-normal text-charcoal sm:text-7xl">
              DigiCloset
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-stone">
              A calm, structured home for your wardrobe data, outfit context,
              and future style intelligence.
            </p>
            <Link
              to="/wardrobe"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory shadow-soft transition hover:-translate-y-0.5 hover:bg-softblack"
            >
              Open wardrobe
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <BrandShowcase />
        </section>
      </main>
    </AppShell>
  );
}


function WardrobeRoute() {
  return (
    <AppShell>
      <Wardrobe />
    </AppShell>
  );
}


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/wardrobe" element={<WardrobeRoute />} />
    </Routes>
  );
}

export default App;
