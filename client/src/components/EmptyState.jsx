import { PanelsTopLeft, Shirt } from "lucide-react";


export default function EmptyState({
  title = "No outfit memories yet",
  description = "Save a complete look first, and DigiCloset will start resurfacing combinations worth revisiting.",
}) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-black/12 bg-white px-4 py-4 text-center shadow-soft sm:px-5 sm:py-5">
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-linen sm:h-20 sm:w-20 sm:rounded-[1.5rem]">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-sage sm:h-8 sm:w-8">
            <PanelsTopLeft className="h-4 w-4" />
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-brass sm:h-8 sm:w-8">
            <Shirt className="h-4 w-4" />
          </div>
          <div className="h-7 w-7 rounded-xl bg-charcoal/90 sm:h-8 sm:w-8" />
          <div className="h-7 w-7 rounded-xl bg-sage/30 sm:h-8 sm:w-8" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-charcoal">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-5 text-stone">
        {description}
      </p>
    </div>
  );
}
