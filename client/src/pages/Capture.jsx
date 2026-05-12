import { Plus, Image as ImageIcon, Camera, ScanFace, UploadCloud, Loader2, Check } from "lucide-react";
import { useState, useRef } from "react";
import { api } from "../lib/api";
import { getImageUrl } from "../services/clothingService";

export default function Capture() {
  const [activeTab, setActiveTab] = useState("single");

  // --- Single Piece State ---
  const [singleForm, setSingleForm] = useState({
    name: "", category: "shirt", color: "", season: "all", occasion: "casual", style: ""
  });
  const [singleImage, setSingleImage] = useState(null);
  const [singlePreview, setSinglePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(null);
  const singleFileRef = useRef(null);

  // --- AI Scan State ---
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanSaved, setScanSaved] = useState(false);
  const [scanImage, setScanImage] = useState(null);
  const fileInputRef = useRef(null);

  const tabs = [
    { id: "single", label: "Single Piece", icon: Plus },
    { id: "outfit", label: "Complete Fit", icon: Camera },
    { id: "ai", label: "AI Scan", icon: ScanFace },
  ];

  // --- Single Piece Handlers ---
  const handleSingleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSingleImage(file);
    setSinglePreview(URL.createObjectURL(file));
    setSavedMessage(null);
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!singleForm.name || !singleForm.color) {
      alert("Please fill in Name and Color.");
      return;
    }
    setIsSaving(true);
    setSavedMessage(null);
    try {
      const formData = new FormData();
      formData.append("name", singleForm.name);
      formData.append("category", singleForm.category);
      formData.append("color", singleForm.color);
      formData.append("season", singleForm.season);
      formData.append("occasion", singleForm.occasion);
      if (singleForm.style) formData.append("style", singleForm.style);
      if (singleImage) formData.append("image", singleImage);

      await api.post("/clothing", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSavedMessage("Saved to Vault!");
      setSingleForm({ name: "", category: "shirt", color: "", season: "all", occasion: "casual", style: "" });
      setSingleImage(null);
      setSinglePreview(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save item.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- AI Scan Handlers ---
  const handleAiScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);
    setScanSaved(false);
    setScanImage(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/ai/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setScanResult(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to scan image. Check your Gemini API key.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveScannedItem = async () => {
    if (!scanResult) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", scanResult.name);
      formData.append("category", scanResult.category);
      formData.append("color", scanResult.color);
      formData.append("season", scanResult.season || "all");
      formData.append("occasion", scanResult.occasion || "casual");
      if (scanResult.style) formData.append("style", scanResult.style);
      if (scanImage) formData.append("image", scanImage);

      await api.post("/clothing", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setScanSaved(true);
    } catch (err) {
      console.error(err);
      alert("Failed to save scanned item.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectClass = "w-full rounded-xl border border-black/10 bg-ivory px-3 py-2.5 text-sm text-charcoal outline-none focus:border-charcoal/30 transition";
  const inputClass = "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-charcoal/30 transition";

  return (
    <main className="mx-auto max-w-3xl px-6 pt-10">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-4xl text-charcoal">Capture</h1>
        <p className="mt-2 text-stone">Add new items to your vault.</p>
      </div>

      {/* Pill Tabs */}
      <div className="mx-auto mb-10 flex max-w-md justify-center rounded-full bg-white/50 p-1 backdrop-blur-md border border-black/5 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-charcoal text-ivory shadow-md"
                  : "text-stone hover:text-charcoal"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Forms Content */}
      <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-soft md:p-8">

        {/* ====== SINGLE PIECE TAB ====== */}
        {activeTab === "single" && (
          <form onSubmit={handleSingleSubmit} className="space-y-5">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linen">
                <ImageIcon className="h-6 w-6 text-brass" />
              </div>
              <div>
                <h2 className="font-serif text-2xl text-charcoal">Add Single Piece</h2>
                <p className="text-sm text-stone">Fill in details and optionally upload a photo.</p>
              </div>
            </div>

            {/* Image Upload */}
            <div
              className="relative flex h-48 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-linen/30 hover:bg-linen/50 transition overflow-hidden"
              onClick={() => singleFileRef.current?.click()}
            >
              <input type="file" ref={singleFileRef} className="hidden" accept="image/*" onChange={handleSingleImageChange} />
              {singlePreview ? (
                <img src={singlePreview} alt="Preview" className="h-full w-full object-contain" />
              ) : (
                <div className="flex flex-col items-center text-center p-6">
                  <UploadCloud className="h-8 w-8 text-stone/40 mb-3" />
                  <p className="text-sm font-medium text-charcoal">Click to upload image</p>
                  <p className="text-xs text-stone mt-1">Optional — JPG, PNG, HEIC</p>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone mb-1 block">Name *</label>
                <input className={inputClass} value={singleForm.name} onChange={e => setSingleForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Navy Polo Shirt" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone mb-1 block">Color *</label>
                <input className={inputClass} value={singleForm.color} onChange={e => setSingleForm(p => ({...p, color: e.target.value}))} placeholder="e.g. navy blue" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone mb-1 block">Category</label>
                <select className={selectClass} value={singleForm.category} onChange={e => setSingleForm(p => ({...p, category: e.target.value}))}>
                  <option value="shirt">Shirt</option>
                  <option value="t_shirt">T-Shirt</option>
                  <option value="pant">Pant</option>
                  <option value="jeans">Jeans</option>
                  <option value="shorts">Shorts</option>
                  <option value="jacket">Jacket</option>
                  <option value="hoodie">Hoodie</option>
                  <option value="shoes">Shoes</option>
                  <option value="accessory">Accessory</option>
                  <option value="dress">Dress</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone mb-1 block">Season</label>
                <select className={selectClass} value={singleForm.season} onChange={e => setSingleForm(p => ({...p, season: e.target.value}))}>
                  <option value="all">All Seasons</option>
                  <option value="summer">Summer</option>
                  <option value="winter">Winter</option>
                  <option value="rainy">Rainy</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone mb-1 block">Occasion</label>
                <select className={selectClass} value={singleForm.occasion} onChange={e => setSingleForm(p => ({...p, occasion: e.target.value}))}>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="college">College</option>
                  <option value="party">Party</option>
                  <option value="sports">Sports</option>
                  <option value="travel">Travel</option>
                  <option value="traditional">Traditional</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone mb-1 block">Style</label>
                <input className={inputClass} value={singleForm.style} onChange={e => setSingleForm(p => ({...p, style: e.target.value}))} placeholder="e.g. streetwear, minimalist" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full h-12 rounded-full bg-charcoal text-ivory font-medium shadow-soft hover:bg-softblack transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              {isSaving ? "Saving..." : "Save to Vault"}
            </button>

            {savedMessage && (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-sage/10 py-3 text-sm font-medium text-sage">
                <Check className="h-4 w-4" /> {savedMessage}
              </div>
            )}
          </form>
        )}

        {/* ====== OUTFIT TAB ====== */}
        {activeTab === "outfit" && (
          <div className="py-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl text-charcoal">Visual Composer</h2>
                <p className="mt-1 text-sm text-stone">Click pieces from your vault to add them to the outfit board.</p>
              </div>
              <button className="inline-flex h-10 items-center justify-center rounded-full bg-charcoal px-6 text-sm font-medium text-ivory transition hover:bg-softblack">
                Save Memory
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 h-[500px]">
              <div className="relative rounded-2xl bg-[linear-gradient(135deg,#f8f5ee_0%,#eee6d9_100%)] border border-black/5 overflow-hidden shadow-inner p-6 flex flex-col items-center gap-6">
                <p className="text-xs font-bold uppercase tracking-widest text-stone/50 w-full text-center mb-4">Outfit Board</p>
                <div className="flex flex-wrap justify-center items-center gap-4 w-full h-full content-center">
                  <div className="w-40 h-40 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white flex items-center justify-center text-stone font-medium">
                    + Add Upperwear
                  </div>
                  <div className="w-40 h-48 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white flex items-center justify-center text-stone font-medium">
                    + Add Lowerwear
                  </div>
                  <div className="w-32 h-32 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white flex items-center justify-center text-stone font-medium">
                    + Add Footwear
                  </div>
                </div>
              </div>

              <div className="flex flex-col h-full bg-white rounded-2xl border border-black/5 overflow-hidden">
                <div className="p-4 border-b border-black/5 bg-ivory">
                  <p className="text-xs font-bold uppercase tracking-widest text-stone">Your Vault</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar grid grid-cols-2 gap-3 content-start">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-square cursor-pointer rounded-xl bg-linen hover:bg-linen/80 transition-colors border border-black/5 flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-stone/30" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====== AI SCAN TAB ====== */}
        {activeTab === "ai" && (
          <div className="py-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f4efe6_0%,#e8efe9_100%)]">
                <ScanFace className="h-6 w-6 text-sage" />
              </div>
              <div>
                <h2 className="font-serif text-2xl text-charcoal">Auto-Scan</h2>
                <p className="mt-1 text-sm text-stone">Upload an image and let AI analyze the garment.</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div 
                className="relative flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-linen/30 hover:bg-linen/50 transition cursor-pointer overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAiScan}
                />
                
                {isScanning ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 text-sage animate-spin mb-4" />
                    <p className="text-sm font-medium text-charcoal">Analyzing fibers...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center p-6 text-center">
                    <UploadCloud className="h-8 w-8 text-stone/40 mb-4" />
                    <p className="text-sm font-medium text-charcoal">Click to upload image</p>
                    <p className="text-xs text-stone mt-1">Supports JPG, PNG, HEIC</p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-black/5 bg-ivory p-6 shadow-inner">
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone mb-4">Scan Results</h3>
                
                {scanResult ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-stone">Identified As</p>
                      <p className="font-serif text-xl text-charcoal">{scanResult.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-stone">Category</p>
                        <p className="font-medium text-charcoal capitalize">{scanResult.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone">Color</p>
                        <p className="font-medium text-charcoal capitalize">{scanResult.color}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone">Occasion</p>
                        <p className="font-medium text-charcoal capitalize">{scanResult.occasion}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone">Style</p>
                        <p className="font-medium text-charcoal capitalize">{scanResult.style || "None"}</p>
                      </div>
                    </div>
                    {scanSaved ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-sage/10 py-3 text-sm font-medium text-sage">
                        <Check className="h-4 w-4" /> Saved to Vault!
                      </div>
                    ) : (
                      <button
                        onClick={handleSaveScannedItem}
                        disabled={isSaving}
                        className="mt-4 w-full h-10 rounded-full bg-sage text-white font-medium shadow-soft hover:bg-sage/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {isSaving ? "Saving..." : "Save to Vault"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-stone/50">
                    <ScanFace className="h-8 w-8 mb-3 opacity-50" />
                    <p className="text-sm">Results will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
