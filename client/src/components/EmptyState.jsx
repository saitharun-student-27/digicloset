import { PanelsTopLeft, Shirt } from "lucide-react";


export default function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 bg-white p-8 text-center shadow-soft">
      <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-linen">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sage">
            <PanelsTopLeft className="h-4 w-4" />
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brass">
            <Shirt className="h-4 w-4" />
          </div>
          <div className="h-9 w-9 rounded-xl bg-charcoal/90" />
          <div className="h-9 w-9 rounded-xl bg-sage/30" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-charcoal">
        Your wardrobe is empty
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone">
        Add your first clothing item to start building organized wardrobe
        memory.
      </p>
    </div>
  );
}
