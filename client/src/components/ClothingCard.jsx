import {
  Briefcase,
  CloudRain,
  Dumbbell,
  Footprints,
  Glasses,
  GraduationCap,
  PanelsTopLeft,
  Luggage,
  Moon,
  Palette,
  PartyPopper,
  Shirt,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Sun,
} from "lucide-react";

import { getImageUrl } from "../services/clothingService";


const categoryIcons = {
  shirt: Shirt,
  t_shirt: Shirt,
  pant: PanelsTopLeft,
  jeans: PanelsTopLeft,
  shorts: PanelsTopLeft,
  jacket: ShoppingBag,
  hoodie: ShoppingBag,
  shoes: Footprints,
  accessory: Glasses,
  dress: Sparkles,
};

const seasonIcons = {
  summer: Sun,
  winter: Snowflake,
  rainy: CloudRain,
  all: Moon,
};

const occasionIcons = {
  casual: Shirt,
  formal: Briefcase,
  college: GraduationCap,
  party: PartyPopper,
  sports: Dumbbell,
  travel: Luggage,
  traditional: Sparkles,
};

function formatValue(value) {
  return String(value).replace("_", " ");
}

function DetailBadge({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-ivory px-3 py-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-stone">
        <Icon className="h-3.5 w-3.5 text-sage" />
        {label}
      </div>
      <p className="mt-2 text-sm font-medium capitalize text-charcoal">
        {formatValue(value)}
      </p>
    </div>
  );
}

export default function ClothingCard({ item }) {
  const CategoryIcon = categoryIcons[item.category] || Shirt;
  const SeasonIcon = seasonIcons[item.season] || Sparkles;
  const OccasionIcon = occasionIcons[item.occasion] || Sparkles;
  const imageUrl = getImageUrl(item.image_url);

  return (
    <article className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-48 bg-linen">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#eee6d9_0%,#f8f5ee_100%)]">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-sage shadow-soft">
                <CategoryIcon className="h-7 w-7" />
              </div>
              <div className="h-16 w-16 rounded-2xl bg-charcoal/90" />
              <div className="h-16 w-16 rounded-2xl bg-brass/30" />
              <div className="h-16 w-16 rounded-2xl bg-sage/25" />
            </div>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linen text-charcoal">
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-charcoal">
                {item.name}
              </h3>
              <p className="mt-1 text-sm capitalize text-stone">
                {formatValue(item.category)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-medium capitalize text-sage">
              {item.source_type}
            </span>
            <p className="mt-2 text-xs uppercase tracking-[0.12em] text-stone">
              Wardrobe piece
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <DetailBadge icon={Palette} label="Color" value={item.color} />
          <DetailBadge icon={SeasonIcon} label="Season" value={item.season} />
          <DetailBadge
            icon={OccasionIcon}
            label="Occasion"
            value={item.occasion}
          />
          {item.style ? (
            <DetailBadge icon={Sparkles} label="Style" value={item.style} />
          ) : null}
          {item.formality_level ? (
            <DetailBadge
              icon={Briefcase}
              label="Formality"
              value={item.formality_level}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
