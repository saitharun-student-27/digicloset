import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ClothingCard from "../components/ClothingCard";
import OutfitShowcaseCard from "../components/OutfitShowcaseCard";
import { getClothingItems, deleteClothingItem } from "../services/clothingService";
import { getOutfits, deleteOutfit } from "../services/outfitService";

function RailSection({ title, items, renderItem }) {
  if (items.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-stone">{title}</h2>
        <span className="text-xs font-medium text-stone/60">{items.length} items</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 custom-scrollbar snap-x snap-mandatory">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="w-[240px] shrink-0 snap-start">
            {renderItem(item)}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Vault() {
  const [clothingItems, setClothingItems] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [clothingData, outfitData] = await Promise.all([
          getClothingItems(),
          getOutfits()
        ]);
        setClothingItems(clothingData);
        setOutfits(outfitData);
      } catch (err) {
        console.error("Failed to load vault data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDeleteClothing = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await deleteClothingItem(id);
      setClothingItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  const handleDeleteOutfit = async (id) => {
    if (!window.confirm("Delete this outfit?")) return;
    try {
      await deleteOutfit(id);
      setOutfits(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      alert("Failed to delete outfit.");
    }
  };

  const handleEditItem = (item) => {
    alert("Edit mode coming soon!");
  };

  // Derived Rails Data
  const upperwear = clothingItems.filter(i => ["shirt", "t_shirt", "jacket", "hoodie"].includes(i.category));
  const lowerwear = clothingItems.filter(i => ["pant", "jeans", "shorts"].includes(i.category));
  const footwear = clothingItems.filter(i => ["shoes"].includes(i.category));
  const accessories = clothingItems.filter(i => ["accessory"].includes(i.category));
  
  // Sort outfits by favorite
  const favoriteOutfits = outfits.filter(o => o.is_favorite);
  const otherOutfits = outfits.filter(o => !o.is_favorite);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-100px)] items-center justify-center">
        <p className="text-stone">Loading your vault...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 pt-10">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-4xl text-charcoal">The Vault</h1>
          <p className="mt-2 text-stone">Organized wardrobe memory rails.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/capture" className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition hover:bg-softblack shadow-soft">
            <Plus className="h-4 w-4" /> Add Item
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <RailSection 
          title="Favorite Outfits" 
          items={favoriteOutfits} 
          renderItem={(outfit) => (
            <OutfitShowcaseCard outfit={outfit} onDelete={() => handleDeleteOutfit(outfit.id)} />
          )} 
        />

        <RailSection 
          title="Outfit Memories" 
          items={otherOutfits} 
          renderItem={(outfit) => (
            <OutfitShowcaseCard outfit={outfit} onDelete={() => handleDeleteOutfit(outfit.id)} />
          )} 
        />

        <RailSection 
          title="Upperwear" 
          items={upperwear} 
          renderItem={(item) => (
            <ClothingCard item={item} onEdit={handleEditItem} onDelete={() => handleDeleteClothing(item.id)} />
          )} 
        />

        <RailSection 
          title="Lowerwear" 
          items={lowerwear} 
          renderItem={(item) => (
            <ClothingCard item={item} onEdit={handleEditItem} onDelete={() => handleDeleteClothing(item.id)} />
          )} 
        />

        <RailSection 
          title="Footwear" 
          items={footwear} 
          renderItem={(item) => (
            <ClothingCard item={item} onEdit={handleEditItem} onDelete={() => handleDeleteClothing(item.id)} />
          )} 
        />

        <RailSection 
          title="Accessories & Others" 
          items={accessories} 
          renderItem={(item) => (
            <ClothingCard item={item} onEdit={handleEditItem} onDelete={() => handleDeleteClothing(item.id)} />
          )} 
        />
      </div>
    </main>
  );
}
