import { PanelsTopLeft, Shirt, Sparkles } from "lucide-react";


function OutfitPreview({ label, tone }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/82 p-4 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-stone">
          {label}
        </span>
        <Sparkles className="h-4 w-4 text-brass" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className={`h-20 rounded-xl ${tone}`} />
        <div className="h-20 rounded-xl bg-stone/15" />
        <div className="h-20 rounded-xl bg-charcoal/90" />
      </div>
    </div>
  );
}


export default function BrandShowcase() {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-black/5 bg-linen p-6 shadow-soft">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.7)_0%,rgba(214,199,177,0.18)_100%)]" />
      <div className="relative grid h-full gap-4">
        <div className="rounded-2xl border border-black/5 bg-white/80 p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-charcoal text-brass">
              <PanelsTopLeft className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal">
                Organized closet
              </p>
              <p className="text-xs text-stone">Manual wardrobe memory</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-3">
            {["bg-ivory", "bg-brass/35", "bg-sage/40", "bg-charcoal/85"].map(
              (tone) => (
                <div
                  key={tone}
                  className={`flex h-24 items-center justify-center rounded-2xl border border-black/5 ${tone}`}
                >
                  <Shirt className="h-6 w-6 text-charcoal/55" />
                </div>
              ),
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <OutfitPreview label="College" tone="bg-sage/45" />
          <OutfitPreview label="Formal" tone="bg-brass/35" />
        </div>
      </div>
    </div>
  );
}
