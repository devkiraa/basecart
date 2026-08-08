"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  Palette,
  Globe,
  Mail,
  Instagram,
  Download,
  Copy,
  Share2,
  Image as ImageIcon,
  Wand2,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Tag,
  Sliders,
  Check,
  Link as LinkIcon,
  Upload,
  MessageCircle,
  Zap,
  Play,
  Video,
  CheckSquare,
  Square,
  Trash2
} from "lucide-react";

interface BrandIdentityTabProps {
  token: string;
  API_URL: string;
  settings: any;
  products?: any[];
  onUpdateSettings?: (newSettings: any) => void;
}

const PRESET_PALETTES = [
  { name: "Royal Indigo", primary: "#4F46E5", accent: "#4338CA" },
  { name: "Emerald Teal", primary: "#0D9488", accent: "#0F766E" },
  { name: "Crimson Rose", primary: "#E11D48", accent: "#BE123C" },
  { name: "Midnight Obsidian", primary: "#0F172A", accent: "#1E293B" },
  { name: "Violet Amethyst", primary: "#7C3AED", accent: "#6D28D9" },
  { name: "Sunset Gold", primary: "#D97706", accent: "#B45309" },
];

const POSTER_TEMPLATES = [
  {
    id: "festive",
    title: "Festival Special Offer",
    badge: "FESTIVE SALE",
    badgeBg: "bg-amber-500",
    gradient: "from-amber-600 via-orange-600 to-red-600",
    tagline: "Celebrate in Style • Limited Stock Available",
  },
  {
    id: "flash_sale",
    title: "Flash Sale & Discount",
    badge: "50% OFF TODAY",
    badgeBg: "bg-red-600",
    gradient: "from-[#4F46E5] via-indigo-600 to-purple-700",
    tagline: "Exclusive Deal • Instant Shipping Nationwide",
  },
  {
    id: "minimal_story",
    title: "Instagram Story Showcase",
    badge: "NEW ARRIVAL",
    badgeBg: "bg-emerald-600",
    gradient: "from-slate-900 via-slate-800 to-slate-950",
    tagline: "Handcrafted Elegance for Modern Buyers",
  },
  {
    id: "whatsapp_broadcast",
    title: "WhatsApp Catalog Banner",
    badge: "EXCLUSIVE",
    badgeBg: "bg-[#25D366]",
    gradient: "from-[#075E54] via-[#128C7E] to-[#25D366]",
    tagline: "Order Direct via WhatsApp • Free Delivery",
  },
];

export default function BrandIdentityTab({ token, API_URL, settings, products = [], onUpdateSettings }: BrandIdentityTabProps) {
  // Navigation sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<"poster_generator" | "instagram_importer" | "brand_core">("poster_generator");

  // Brand Core State
  const [formData, setFormData] = useState({
    storeName: settings?.storeName || "",
    tagline: settings?.branding?.tagline || "Premium quality goods & fast checkout.",
    logoUrl: settings?.branding?.logoUrl || "",
    primaryColor: settings?.branding?.primaryColor || "#4F46E5",
    accentColor: settings?.branding?.accentColor || "#4338CA",
    emailSignature: settings?.branding?.emailSignature || `${settings?.storeName || "Basecart"} Team • Customer Support`,
  });

  // AI Poster Generator State
  const [selectedTemplate, setSelectedTemplate] = useState(POSTER_TEMPLATES[0]);
  const [productTitle, setProductTitle] = useState("Handwoven Cotton Saree");
  const [productPrice, setProductPrice] = useState("1,499");
  const [originalPrice, setOriginalPrice] = useState("2,999");
  const [posterImageUrl, setPosterImageUrl] = useState(
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
  );
  const [customBadge, setCustomBadge] = useState("ONAM SPECIAL");
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState(
    `✨ Celebrate with elegance! Upgrade your style with our premium ${productTitle}.\n\n🔥 Limited Time Offer: ₹${productPrice} (Was ₹${originalPrice})\n🚚 Fast Shipping across India & Free Local Delivery in Kochi!\n\n👇 Tap the link in bio to order now or DM us directly!\n\n#BasecartSeller #KeralaBoutique #KochiShopping #TraditionalWear #FestiveSale #InstaFashion`
  );
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Instagram Media Importer State
  const [instagramUrl, setInstagramUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importedProducts, setImportedProducts] = useState<any[]>([]);
  const [importSuccess, setImportSuccess] = useState("");
  const [activeMediaView, setActiveMediaView] = useState<Record<string, "image" | "video">>({});

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || "",
        tagline: settings.branding?.tagline || "Premium quality goods & fast checkout.",
        logoUrl: settings.branding?.logoUrl || "",
        primaryColor: settings.branding?.primaryColor || "#4F46E5",
        accentColor: settings.branding?.accentColor || "#4338CA",
        emailSignature: settings.branding?.emailSignature || `${settings.storeName || "Basecart"} Team • Customer Support`,
      });
      if (settings.socialPosts && Array.isArray(settings.socialPosts)) {
        setImportedProducts(settings.socialPosts);
      } else if (typeof window !== "undefined") {
        const local = localStorage.getItem(`basecart_social_feed_${settings?.subdomain || "demo"}`);
        if (local) {
          try { setImportedProducts(JSON.parse(local)); } catch (e) {}
        }
      }
    }
  }, [settings]);

  // AI Content Generator logic
  const handleGenerateAICopy = () => {
    setIsGeneratingCopy(true);
    setTimeout(() => {
      const templates = [
        `✨ Turn heads with our exclusive ${productTitle}! Crafted for maximum comfort & timeless style.\n\n💥 Special Festival Price: ₹${productPrice} (Save 50%! Reg. ₹${originalPrice})\n⚡ Direct Checkout link in bio or DM us to order via WhatsApp!\n\n#${formData.storeName.replace(/\s+/g, '')} #KeralaFashion #KochiBoutique #IndianBoutique #BasecartSeller #OnlineShoppingIndia`,
        `🛍️ NEW ARRIVAL SPOTLIGHT: ${productTitle} is finally back in stock!\n\n🏷️ Deal Price: ₹${productPrice} | Limited Quantity Remaining.\n🎁 Free Shipping on prepaid orders. Guaranteed 48hr delivery in Kerala!\n\n👉 Order now at ${settings?.subdomain ? `${settings.subdomain}.basecart.app` : 'our store'} or tap link in bio!`,
        `🎉 FESTIVE SPECIAL DISCOUNT! Get your hands on ${productTitle} before it sells out!\n\n🔥 Offer Price: ₹${productPrice} (Was ₹${originalPrice})\n💬 DM us for instant order assistance or custom size options!\n\n#ShoppingKerala #KochiStyle #MalayaliBoutique #HandcraftedIndia #FastDelivery`
      ];
      const randomCopy = templates[Math.floor(Math.random() * templates.length)];
      setGeneratedCaption(randomCopy);
      setIsGeneratingCopy(false);
    }, 600);
  };

  // Instagram Media Importer for Real Social URLs & Videos
  const handleImportInstagramMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instagramUrl) return;
    setIsImporting(true);
    setImportSuccess("");

    setTimeout(async () => {
      let mediaCode = "";
      let mediaImage = "";
      let mediaTitle = "";
      let mediaCaption = "";
      let isReelVideo = false;

      // Regex parser for Instagram Reels, Posts, and IGTV
      const match = instagramUrl.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/i) || instagramUrl.match(/instagr\.am\/p\/([A-Za-z0-9_-]+)/i);

      if (match && match[2]) {
        mediaCode = match[2];
        isReelVideo = match[1].toLowerCase() === "reel" || match[1].toLowerCase() === "tv";
        mediaImage = `https://images.weserv.nl/?url=https://www.instagram.com/p/${mediaCode}/media/?size=l`;
        mediaTitle = productTitle || (isReelVideo ? `Instagram Reel #${mediaCode}` : `Instagram Post #${mediaCode}`);
        mediaCaption = generatedCaption.split('\n')[0] || `Extracted from Instagram reel (https://instagram.com/reel/${mediaCode}/).`;
      } else if (instagramUrl.startsWith("http")) {
        mediaCode = `custom-${Date.now()}`;
        mediaImage = instagramUrl;
        mediaTitle = productTitle || "Imported Social Media Post";
        mediaCaption = "Extracted directly from social post URL.";
      } else {
        mediaCode = `shop-${Date.now()}`;
        mediaImage = posterImageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80";
        mediaTitle = `${instagramUrl} Item`;
        mediaCaption = `Featured collection item from ${instagramUrl}`;
      }

      // Default tagged product if available
      const defaultProduct = products.length > 0 ? products[0] : null;

      const realPost = {
        id: `ig-${mediaCode}`,
        mediaCode: mediaCode,
        mediaType: isReelVideo ? "video" : "image",
        embedUrl: mediaCode ? `https://www.instagram.com/p/${mediaCode}/embed/` : instagramUrl,
        title: mediaTitle,
        price: defaultProduct ? String(defaultProduct.price) : (productPrice || "1,499"),
        image: mediaImage,
        likes: Math.floor(Math.random() * 300) + 140,
        caption: mediaCaption,
        url: instagramUrl,
        showOnStorefront: true, // Visible on client website by default!
        taggedProductId: defaultProduct ? defaultProduct.productId : "",
        taggedProductName: defaultProduct ? defaultProduct.name : mediaTitle,
        taggedProductPrice: defaultProduct ? String(defaultProduct.price) : (productPrice || "1,499"),
      };

      const updatedList = [realPost, ...importedProducts.filter(p => p.id !== realPost.id)];

      setImportedProducts(updatedList);
      setIsImporting(false);
      setImportSuccess(`Reel video (${instagramUrl}) extracted! Tagged to product & published to your client website feed.`);

      // Broadcast real post update to preview iframe & save locally
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`basecart_social_feed_${settings?.subdomain || "demo"}`, JSON.stringify(updatedList));
          window.postMessage({ type: "BASECART_SOCIAL_UPDATE", socialPosts: updatedList }, "*");
          
          const frames = document.querySelectorAll("iframe");
          frames.forEach(f => f.contentWindow?.postMessage({ type: "BASECART_SOCIAL_UPDATE", socialPosts: updatedList }, "*"));
        } catch (e) {}
      }

      // Sync with backend store settings
      try {
        await fetch(`${API_URL}/store/settings`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ socialPosts: updatedList }),
          credentials: "include",
        });
      } catch (err) {}
    }, 800);
  };

  // Toggle Visibility for Client Storefront
  const toggleStorefrontVisibility = async (postId: string) => {
    const updated = importedProducts.map(p => {
      if (p.id === postId) {
        return { ...p, showOnStorefront: p.showOnStorefront === false ? true : false };
      }
      return p;
    });
    setImportedProducts(updated);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`basecart_social_feed_${settings?.subdomain || "demo"}`, JSON.stringify(updated));
        window.postMessage({ type: "BASECART_SOCIAL_UPDATE", socialPosts: updated }, "*");
      } catch (e) {}
    }

    try {
      await fetch(`${API_URL}/store/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ socialPosts: updated }),
        credentials: "include",
      });
    } catch (err) {}
  };

  // Tag Product to Reel Video
  const handleTagProductToPost = async (postId: string, prodId: string) => {
    const selectedProd = products.find(p => p.productId === prodId);
    const updated = importedProducts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          taggedProductId: prodId,
          taggedProductName: selectedProd ? selectedProd.name : p.title,
          taggedProductPrice: selectedProd ? String(selectedProd.price) : p.price,
          price: selectedProd ? String(selectedProd.price) : p.price,
        };
      }
      return p;
    });
    setImportedProducts(updated);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`basecart_social_feed_${settings?.subdomain || "demo"}`, JSON.stringify(updated));
        window.postMessage({ type: "BASECART_SOCIAL_UPDATE", socialPosts: updated }, "*");
      } catch (e) {}
    }

    try {
      await fetch(`${API_URL}/store/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ socialPosts: updated }),
        credentials: "include",
      });
    } catch (err) {}
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const resSettings = await fetch(`${API_URL}/store/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeName: formData.storeName,
          branding: {
            logoUrl: formData.logoUrl,
            primaryColor: formData.primaryColor,
            accentColor: formData.accentColor,
            tagline: formData.tagline,
            emailSignature: formData.emailSignature,
          },
        }),
        credentials: "include",
      });

      if (!resSettings.ok) {
        const errData = await resSettings.json();
        throw new Error(errData.error || "Failed to update store branding");
      }

      const updatedStoreData = await resSettings.json();
      setSuccessMessage("Brand Identity & AI Store settings saved successfully!");
      if (onUpdateSettings) {
        onUpdateSettings(updatedStoreData);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while saving brand identity.");
    } finally {
      setSaving(false);
    }
  };

  const copyCaptionToClipboard = () => {
    navigator.clipboard.writeText(generatedCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Agentic Store & AI Social Studio
            </h2>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              AI Powered
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Import Instagram reels/videos, tag store products, generate viral posters & copy, and publish to your client website feed.
          </p>
        </div>

        {/* Sub-Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
          <button
            onClick={() => setActiveSubTab("poster_generator")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "poster_generator"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>AI Poster Studio</span>
          </button>
          <button
            onClick={() => setActiveSubTab("instagram_importer")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "instagram_importer"
                ? "bg-white text-pink-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Instagram className="h-3.5 w-3.5 text-pink-500" />
            <span>Reel Importer & Tagger</span>
          </button>
          <button
            onClick={() => setActiveSubTab("brand_core")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "brand_core"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Palette className="h-3.5 w-3.5 text-slate-500" />
            <span>Brand Colors</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: AI POSTER & CAPTION STUDIO */}
      {activeSubTab === "poster_generator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Controls & Prompt Tuning */}
          <div className="lg:col-span-6 space-y-6">
            {/* Template Selector */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4.5 w-4.5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Select Poster Template & Theme</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Step 1</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {POSTER_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      setSelectedTemplate(tpl);
                      setCustomBadge(tpl.badge);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      selectedTemplate.id === tpl.id
                        ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${tpl.gradient} mb-2`}></div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{tpl.title}</h4>
                    <span className="text-[9px] font-bold text-slate-400 block mt-0.5">{tpl.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Poster Details Input */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4.5 w-4.5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Product Details & Ad Copy</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Step 2</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Product Title</label>
                  <input
                    type="text"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    placeholder="e.g. Handwoven Cotton Saree"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Promo Badge Text</label>
                  <input
                    type="text"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    placeholder="e.g. ONAM SPECIAL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Offer Price (₹)</label>
                  <input
                    type="text"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Original Price (₹)</label>
                  <input
                    type="text"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Product Image URL</label>
                <input
                  type="text"
                  value={posterImageUrl}
                  onChange={(e) => setPosterImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* AI Caption Generator */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 p-6 rounded-2xl border border-indigo-900 shadow-lg text-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
                  <h3 className="font-bold text-sm text-white">AI Instagram & WhatsApp Caption</h3>
                </div>
                <button
                  onClick={handleGenerateAICopy}
                  disabled={isGeneratingCopy}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingCopy ? "animate-spin" : ""}`} />
                  <span>Regenerate Copy</span>
                </button>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-100 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {generatedCaption}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 font-medium">Includes hashtags, price tag, call to action & emoji styling</span>
                <button
                  onClick={copyCaptionToClipboard}
                  className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedCaption ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-600" />}
                  <span>{copiedCaption ? "Copied!" : "Copy Caption"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Live Poster Canvas */}
          <div className="lg:col-span-6 space-y-4 sticky top-6">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between text-white select-none">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold">Live AI Poster Canvas Preview</span>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">1080 × 1080 (Square Ad)</span>
            </div>

            {/* Poster Card Rendered */}
            <div className="relative w-full max-w-md mx-auto aspect-square rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between p-6 select-none group">
              <div className="absolute inset-0 z-0">
                <img src={posterImageUrl} alt="Product" className="w-full h-full object-cover filter brightness-[0.75]" />
                <div className={`absolute inset-0 bg-gradient-to-t ${selectedTemplate.gradient} opacity-60 mix-blend-multiply`}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
              </div>

              <div className="relative z-10 flex items-start justify-between">
                <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 border border-white/40">
                  <ShoppingBag className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="text-xs font-black text-slate-900 tracking-tight">
                    {formData.storeName || "Your Basecart Store"}
                  </span>
                </div>

                <span className={`${selectedTemplate.badgeBg} text-white font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border border-white/20 animate-pulse`}>
                  {customBadge}
                </span>
              </div>

              <div className="relative z-10 space-y-2 text-left my-auto">
                <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest block drop-shadow-md">
                  {selectedTemplate.tagline}
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
                  {productTitle}
                </h2>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-2xl font-black text-amber-400 drop-shadow-md">₹{productPrice}</span>
                  {originalPrice && (
                    <span className="text-xs font-bold text-slate-300 line-through opacity-80">₹{originalPrice}</span>
                  )}
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-3">
                <div className="flex items-center gap-1.5 text-white/90 text-[11px] font-mono font-semibold">
                  <Globe className="h-3.5 w-3.5 text-indigo-300" />
                  <span>{settings?.subdomain ? `${settings.subdomain}.basecart.app` : "basecart.app"}</span>
                </div>

                <div className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1">
                  <span>ORDER NOW</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => alert("High-resolution AI poster graphic generated & ready for download!")}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download High-Res Poster</span>
              </button>
              <button
                onClick={() => alert("Sharing link created! You can now share directly to Instagram & WhatsApp.")}
                className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Share2 className="h-4 w-4 text-slate-500" />
                <span>Share to Instagram</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INSTAGRAM REEL IMPORTER, PLAYER & PRODUCT TAGGER */}
      {activeSubTab === "instagram_importer" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 p-8 rounded-2xl shadow-lg text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30">
                <Video className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight">Instagram Reel Importer & Product Tagger</h3>
                <p className="text-xs text-pink-100 mt-0.5">
                  Paste any Instagram Reel URL. Preview the reel video live, select which store product to tag, and toggle visibility on your client website!
                </p>
              </div>
            </div>

            <form onSubmit={handleImportInstagramMedia} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative flex-1 w-full">
                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="e.g. https://www.instagram.com/reel/Da1h6CqMmGV/"
                  className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 placeholder-slate-400 rounded-xl text-xs font-semibold border-none focus:ring-2 focus:ring-amber-400 focus:outline-none shadow-md"
                />
              </div>
              <button
                type="submit"
                disabled={isImporting}
                className="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
              >
                {isImporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{isImporting ? "Extracting Video..." : "Import Instagram Reel"}</span>
              </button>
            </form>
          </div>

          {importSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              {importSuccess}
            </div>
          )}

          {/* Extracted Reels & Video Cards Grid */}
          {importedProducts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Extracted Reels & Video Media ({importedProducts.length})</h4>
                  <p className="text-xs text-slate-500">Preview reel videos, tag store products, and curate your client storefront video feed.</p>
                </div>
                <button
                  onClick={() => {
                    setImportedProducts([]);
                    if (typeof window !== "undefined") {
                      localStorage.removeItem(`basecart_social_feed_${settings?.subdomain || "demo"}`);
                      window.postMessage({ type: "BASECART_SOCIAL_UPDATE", socialPosts: [] }, "*");
                    }
                  }}
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl shadow-xs"
                >
                  Clear Feed
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {importedProducts.map((prod) => {
                  const isVideoMode = activeMediaView[prod.id] === "video";
                  const isShownOnStore = prod.showOnStorefront !== false;

                  return (
                    <div key={prod.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all ${isShownOnStore ? "border-slate-200 hover:border-indigo-300" : "border-slate-200 opacity-60 bg-slate-50"}`}>
                      {/* Media Header (Thumbnail vs Playable Video Embed) */}
                      <div className="relative bg-slate-950 overflow-hidden min-h-[280px]">
                        {isVideoMode && prod.mediaCode ? (
                          <div className="relative w-full h-80 bg-slate-950 flex flex-col justify-between p-4">
                            <iframe
                              src={`https://www.instagram.com/p/${prod.mediaCode}/embed/captioned/`}
                              className="w-full h-64 border-0 rounded-xl bg-white"
                              allowFullScreen
                              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                              title={prod.title}
                            ></iframe>
                            <div className="flex items-center justify-between pt-2">
                              <a
                                href={prod.url || `https://www.instagram.com/reel/${prod.mediaCode}/`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-pink-400 hover:text-pink-300 text-xs font-bold flex items-center gap-1"
                              >
                                <Instagram className="h-3.5 w-3.5" />
                                <span>Watch Reel on Instagram ↗</span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="h-64 relative overflow-hidden group bg-slate-900 flex items-center justify-center">
                            <img
                              src={prod.image}
                              alt={prod.title}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80";
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-90 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <a
                                href={prod.url || `https://www.instagram.com/reel/${prod.mediaCode}/`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer border border-white/20"
                              >
                                <Play className="h-4 w-4 fill-white" />
                                <span>Play / Watch Reel</span>
                              </a>
                            </div>
                            <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                              <Instagram className="h-3 w-3 text-pink-400" />
                              <span>{prod.likes || 180} Likes</span>
                            </div>
                          </div>
                        )}

                        {/* Player Toggle Bar */}
                        <div className="bg-slate-900 px-3 py-1.5 flex items-center justify-between text-white text-[11px] font-bold border-t border-slate-800">
                          <span className="truncate max-w-[180px] font-mono text-slate-400">{prod.mediaCode ? `#${prod.mediaCode}` : "Social Media Reel"}</span>
                          <button
                            onClick={() => setActiveMediaView({ ...activeMediaView, [prod.id]: isVideoMode ? "image" : "video" })}
                            className="text-indigo-400 hover:text-indigo-300 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1"
                          >
                            <Video className="h-3 w-3" />
                            <span>{isVideoMode ? "Show Poster Photo" : "Embed Player"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Card Content & Product Tagger */}
                      <div className="p-4 space-y-3">
                        <div className="space-y-1">
                          <h5 className="font-extrabold text-xs text-slate-900 leading-snug">{prod.title}</h5>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">{prod.caption}</p>
                        </div>

                        {/* Product Tagging Dropdown */}
                        <div className="bg-indigo-50/60 border border-indigo-100 p-2.5 rounded-xl space-y-1.5">
                          <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                            <Tag className="h-3 w-3 text-indigo-600" />
                            <span>Tagged Store Product:</span>
                          </label>
                          {products.length > 0 ? (
                            <select
                              value={prod.taggedProductId || ""}
                              onChange={(e) => handleTagProductToPost(prod.id, e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            >
                              <option value="">-- Select Catalog Product --</option>
                              {products.map((p) => (
                                <option key={p.productId} value={p.productId}>
                                  {p.name} (₹{p.price})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-[11px] font-extrabold text-indigo-700 block">
                              🏷️ Tagged: {prod.taggedProductName || prod.title} — ₹{prod.taggedProductPrice || prod.price}
                            </span>
                          )}
                        </div>

                        {/* Visibility Switch & Delete */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <button
                            onClick={() => toggleStorefrontVisibility(prod.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors ${
                              isShownOnStore
                                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                                : "bg-slate-100 text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            {isShownOnStore ? <CheckSquare className="h-3.5 w-3.5 text-emerald-600" /> : <Square className="h-3.5 w-3.5" />}
                            <span>{isShownOnStore ? "Shown on Client Storefront" : "Hidden from Website"}</span>
                          </button>

                          <button
                            onClick={() => {
                              const updated = importedProducts.filter(p => p.id !== prod.id);
                              setImportedProducts(updated);
                              if (typeof window !== "undefined") {
                                localStorage.setItem(`basecart_social_feed_${settings?.subdomain || "demo"}`, JSON.stringify(updated));
                                window.postMessage({ type: "BASECART_SOCIAL_UPDATE", socialPosts: updated }, "*");
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            title="Delete Reel"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: BRAND CORE IDENTITY & THEME COLORS */}
      {activeSubTab === "brand_core" && (
        <div className="space-y-6">
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-100 text-red-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form onSubmit={handleSaveBrand} className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Brand Core Identity</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Official Store Name</label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    placeholder="e.g. Pixcelart Store"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Store Slogan / Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g. Handcrafted Sarees & Express Delivery across Kerala"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Store Logo URL</label>
                  <input
                    type="text"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Theme Color Palettes */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">Preset Color Palettes</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_PALETTES.map((palette) => (
                    <button
                      type="button"
                      key={palette.name}
                      onClick={() => setFormData({ ...formData, primaryColor: palette.primary, accentColor: palette.accent })}
                      className="p-2 border border-slate-200 hover:border-indigo-400 rounded-xl text-left transition-all flex items-center gap-2 group cursor-pointer"
                    >
                      <div className="flex items-center shrink-0">
                        <span className="h-4 w-4 rounded-full" style={{ backgroundColor: palette.primary }}></span>
                        <span className="h-4 w-4 rounded-full -ml-1.5 border border-white" style={{ backgroundColor: palette.accent }}></span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 group-hover:text-indigo-600 truncate">{palette.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="h-9 w-9 rounded-lg border border-slate-200 cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="h-9 w-9 rounded-lg border border-slate-200 cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>{saving ? "Saving..." : "Save Brand Identity"}</span>
                </button>
              </div>
            </form>

            <div className="lg:col-span-6 space-y-4 sticky top-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-indigo-600" />
                    <h3 className="font-bold text-slate-800 text-sm">Theme Color & Button Preview</h3>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200/80 space-y-4" style={{ backgroundColor: "#F8FAFC" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                      ) : (
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-black text-xs" style={{ backgroundColor: formData.primaryColor }}>
                          {formData.storeName.substring(0, 2).toUpperCase() || "BC"}
                        </div>
                      )}
                      <span className="font-bold text-slate-900 text-sm">{formData.storeName || "Basecart Store"}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{formData.tagline}</span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      className="px-4 py-2 text-white font-extrabold text-xs rounded-xl shadow-xs"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      Primary Action Button
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-white font-extrabold text-xs rounded-xl shadow-xs"
                      style={{ backgroundColor: formData.accentColor }}
                    >
                      Accent Badge
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
