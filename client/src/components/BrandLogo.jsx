import { Grid2X2, Shirt } from "lucide-react";


export function BrandMark({ className = "h-10 w-10" }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-charcoal text-ivory shadow-soft ${className}`}
      aria-hidden="true"
    >
      <Grid2X2 className="absolute h-6 w-6 text-ivory/20" strokeWidth={1.5} />
      <Shirt className="relative h-5 w-5 text-brass" strokeWidth={2} />
    </div>
  );
}


export default function BrandLogo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <BrandMark className={compact ? "h-9 w-9" : "h-10 w-10"} />
      {!compact ? (
        <div>
          <p className="text-lg font-semibold tracking-normal text-charcoal">
            DigiCloset
          </p>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone">
            Wardrobe intelligence
          </p>
        </div>
      ) : null}
    </div>
  );
}
