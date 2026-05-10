import ClothingCard from "./ClothingCard";


export default function WardrobeGrid({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <ClothingCard key={item.id} item={item} />
      ))}
    </div>
  );
}
