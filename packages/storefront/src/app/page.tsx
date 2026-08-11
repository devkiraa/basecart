"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Package,
  CheckCircle,
  Tag,
  CreditCard,
  User,
  ArrowLeft,
  Loader2,
  Trash2,
  Calendar,
  Heart,
  ArrowUp,
  Search,
  ChevronRight,
  Globe,
  Instagram,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Menu,
  ShoppingBag,
  X,
  Star,
  ArrowRight,
  Mail,
  Facebook,
  Twitter,
  Pin
} from "lucide-react";
import { getOptimizedImageUrl } from "../lib/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ProductVariant {
  id: string;
  options: Record<string, string>;
  price?: number | null;
  stockQuantity: number;
  sku?: string | null;
  barcode?: string | null;
}

interface Product {
  productId: string;
  name: string;
  price: number;
  stockQuantity: number;
  status: "active" | "draft";
  images: string[];
  description?: string;
  compareAtPrice?: number | null;
  costPerItem?: number | null;
  sku?: string | null;
  barcode?: string | null;
  category: "Clothing" | "Electronics" | "Home & Kitchen" | "Beauty" | "Food" | "Other";
  productType?: string | null;
  vendor?: string | null;
  weight?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  continueSellingOutOfStock?: boolean;
  variants?: ProductVariant[];
  rating?: number;
  reviewCount?: number;
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant | null;
}

export default function Storefront() {
  // Storefront state strictly from database
  const [subdomain, setSubdomain] = useState("");
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [socialPosts, setSocialPosts] = useState<any[]>([]);
  const [themeCustomization, setThemeCustomization] = useState<any>({});

  // Listen to live postMessage theme updates from Storefront Studio Customizer
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "BASECART_THEME_UPDATE" && e.data?.themeData) {
        const settings = e.data.themeData.settings || {};
        setThemeCustomization((prev: any) => ({ ...prev, ...settings, ...e.data.themeData.colors }));
      } else if (e.data?.type === "theme-update" && e.data?.settings) {
        setThemeCustomization((prev: any) => ({ ...prev, ...e.data.settings }));
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }
  }, []);

  // UI Interactive States
  const [loadingStore, setLoadingStore] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [view, setView] = useState<"catalog" | "cart" | "checkout" | "confirmation" | "orders">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Customer Account Session
  const [custToken, setCustToken] = useState("");
  const [custName, setCustName] = useState("");

  // 1. Detect subdomain / store name from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const querySubdomain = urlParams.get("subdomain") || urlParams.get("store");
      if (querySubdomain) {
        setSubdomain(querySubdomain);
        return;
      }

      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      if (parts.length > 2 && parts[0] !== "www") {
        setSubdomain(parts[0]);
      } else {
        const pathSubdomain = window.location.pathname.split("/")[1];
        if (pathSubdomain && !["api", "_next", "favicon.ico"].includes(pathSubdomain)) {
          setSubdomain(pathSubdomain);
        } else {
          setSubdomain("pixcelart");
        }
      }
    }
  }, []);

  // 2. Fetch Store Information & Products strictly from database
  useEffect(() => {
    if (!subdomain) return;

    const fetchStoreData = async () => {
      setLoadingStore(true);
      try {
        // Fetch Store Details
        const infoRes = await fetch(`${API_URL}/store/${subdomain}/info`);
        if (infoRes.ok) {
          const infoData = await infoRes.json();
          setStoreInfo(infoData);

          if (infoData?.socialPosts && Array.isArray(infoData.socialPosts)) {
            setSocialPosts(infoData.socialPosts.filter((p: any) => p.showOnStorefront !== false));
          }
        }

        // Fetch Store Products
        const prodRes = await fetch(`${API_URL}/store/${subdomain}/products`);
        if (prodRes.ok) {
          const fetchedProds = await prodRes.json();
          if (Array.isArray(fetchedProds)) {
            setProducts(fetchedProds);
          }
        }
      } catch (err) {
        console.error("Error loading store details:", err);
      } finally {
        setLoadingStore(false);
      }
    };

    fetchStoreData();
  }, [subdomain]);

  // Load wishlist from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("basecart_wishlist");
      if (saved) setWishlist(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("basecart_wishlist", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Cart operations
  const addToCart = (product: Product, variant: ProductVariant | null = null) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.productId === product.productId && item.selectedVariant?.id === variant?.id
      );
      if (existing) {
        return prev.map((item) =>
          item.product.productId === product.productId && item.selectedVariant?.id === variant?.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedVariant: variant }];
    });
  };

  const updateQuantity = (productId: string, variantId: string | undefined, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.productId === productId && item.selectedVariant?.id === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => {
    const p = item.selectedVariant?.price ?? item.product.price;
    return sum + p * item.quantity;
  }, 0);

  // Filter products by active category & search query
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const customSettings = {
    ...storeInfo?.branding,
    ...storeInfo?.theme?.pageContent?.settings,
    ...themeCustomization
  };

  const primaryColor = customSettings.colorPrimary || storeInfo?.branding?.primaryColor || storeInfo?.theme?.colors?.primary || "#2563EB";
  const storeDisplayName = storeInfo?.storeName || subdomain || "YourStore";
  const currentLogoUrl = customSettings.logoUrl || customSettings.headerLogoUrl || storeInfo?.branding?.logoUrl;

  // Check if first database product has an image for Hero Spotlight
  const heroProductImage = products.length > 0 && products[0]?.images?.[0] ? products[0].images[0] : null;

  if (loadingStore) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center space-y-6 z-10">
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-0 w-20 h-20 rounded-2xl border-2 border-blue-500/10 border-b-blue-400 animate-spin [animation-duration:2s]" />

            <div className="absolute w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
              <ShoppingBag className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xs font-black tracking-widest text-slate-100 uppercase">{storeDisplayName || "BASECART STORE"}</h2>
            <div className="flex items-center gap-2 justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <p className="text-xs font-semibold text-slate-400">Loading storefront catalog & experiences...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-slate-900 font-sans flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden"
      style={{
        backgroundImage: customSettings.pageBackgroundImage ? `url(${customSettings.pageBackgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundColor: customSettings.colorBg || "#FFFFFF"
      }}
    >
      <div>
        {/* 1. TOP ANNOUNCEMENT BAR */}
        <div
          className="text-[11px] font-semibold py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2"
          style={{
            backgroundColor: customSettings.announcementBgColor || "#090D16",
            color: customSettings.announcementTextColor || "#FFFFFF"
          }}
        >
          <span>{customSettings.announcementText || storeInfo?.theme?.pageContent?.announcementBar?.text || "Free shipping on orders over ₹999. Shop now →"}</span>
        </div>

        {/* 2. COMPACT HEADER */}
        <header
          className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-100 shadow-2xs"
          style={{
            backgroundColor: customSettings.headerBgColor || "rgba(255, 255, 255, 0.95)",
            backgroundImage: customSettings.headerBackgroundImage ? `url(${customSettings.headerBackgroundImage})` : undefined,
            backgroundSize: "cover"
          }}
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Logo & Desktop Nav Links */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <button onClick={() => setView("catalog")} className="flex items-center gap-2 text-left shrink-0">
                {currentLogoUrl ? (
                  <img src={currentLogoUrl} alt={storeDisplayName} className="h-8 w-auto object-contain" />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                      <ShoppingBag className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-lg font-black tracking-tight text-slate-900">{storeDisplayName}</span>
                  </div>
                )}
              </button>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
                <button onClick={() => setView("catalog")} className="text-indigo-600 hover:text-indigo-700 transition-colors">
                  Home
                </button>
                <button onClick={() => setView("catalog")} className="hover:text-slate-900 transition-colors">
                  Shop
                </button>
                {categories.length > 1 && (
                  <div className="relative group cursor-pointer py-2">
                    <span className="hover:text-slate-900 flex items-center gap-1">
                      Categories <ChevronRight className="h-3 w-3 rotate-90" />
                    </span>
                    <div className="absolute top-full left-0 hidden group-hover:block bg-white border border-slate-200 rounded-xl shadow-lg p-2 min-w-[160px] z-50 space-y-1">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setActiveCategory(cat);
                            setView("catalog");
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {socialPosts.length > 0 && (
                  <button
                    onClick={() => document.getElementById("social-feed-section")?.scrollIntoView({ behavior: "smooth" })}
                    className="hover:text-slate-900 flex items-center gap-1"
                  >
                    <Instagram className="h-3.5 w-3.5 text-pink-500" />
                    <span>Social Feed</span>
                  </button>
                )}
              </nav>
            </div>

            {/* Balanced Search Bar */}
            <div className="hidden sm:flex flex-1 max-w-xs md:max-w-sm mx-2 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 hover:bg-slate-100 border border-transparent focus:border-indigo-600 focus:bg-white rounded-full text-xs font-medium text-slate-800 focus:outline-none transition-all"
              />
            </div>

            {/* Action Icons (Account, Wishlist, Cart) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("orders")}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative"
                title="Account / Orders"
              >
                <User className="h-4.5 w-4.5" />
              </button>

              <button
                onClick={() => setView("catalog")}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative"
                title="Wishlist"
              >
                <Heart className="h-4.5 w-4.5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setView("cart")}
                className="p-1.5 pl-2.5 text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative flex items-center gap-1.5 bg-slate-100 font-bold text-xs"
              >
                <ShoppingCart className="h-4 w-4 text-indigo-600" />
                <span>₹{cartTotal}</span>
                {cartCount > 0 && (
                  <span className="h-4 px-1.5 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-3 animate-fade-in">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-full text-xs font-medium focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-2 font-bold text-xs text-slate-700 pt-1">
                <button onClick={() => { setView("catalog"); setMobileMenuOpen(false); }} className="text-left py-2 border-b border-slate-100">
                  Home
                </button>
                <button onClick={() => { setView("catalog"); setMobileMenuOpen(false); }} className="text-left py-2 border-b border-slate-100">
                  All Products ({products.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setView("catalog");
                      setMobileMenuOpen(false);
                    }}
                    className="text-left py-1.5 text-slate-500 pl-2 text-xs"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* MAIN BODY CONTAINER - ALIGNED TO 1280px GRID */}
        <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
          {view === "catalog" && (
            <>
              {/* 3. HERO SHOWCASE SECTION (Antigravity Spatial Glassmorphism) */}
              <div
                className="rounded-3xl p-6 sm:p-10 md:p-12 border border-slate-200/60 shadow-xl shadow-slate-900/5 text-left relative overflow-hidden backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10"
                style={{
                  backgroundImage: customSettings.heroBackgroundImage ? `url(${customSettings.heroBackgroundImage})` : undefined,
                  backgroundSize: "cover",
                  backgroundColor: customSettings.heroBackgroundImage ? undefined : "#f8fafc"
                }}
              >
                {/* Floating Radial Ambient Light */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className={`grid grid-cols-1 ${heroProductImage ? "md:grid-cols-12" : "max-w-2xl"} gap-8 items-center relative z-10`}>
                  {/* Left Hero Column */}
                  <div className={`${heroProductImage ? "md:col-span-7 lg:col-span-8" : "w-full"} space-y-4`}>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-indigo-700 tracking-wider uppercase border border-indigo-100 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                      <span>{storeDisplayName} OFFICIAL STORE</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                      Find Everything You Need
                    </h1>

                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium max-w-lg">
                      Discover high-quality products at the best prices. Shop the latest trends and elevate your lifestyle with seamless checkout.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => document.getElementById("featured-products")?.scrollIntoView({ behavior: "smooth" })}
                        style={{ backgroundColor: primaryColor }}
                        className="text-white font-black py-3.5 px-7 rounded-xl text-xs tracking-wider uppercase shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer"
                      >
                        <span>Shop Catalog</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>

                      {categories.length > 1 && (
                        <button
                          onClick={() => document.getElementById("category-grid")?.scrollIntoView({ behavior: "smooth" })}
                          className="bg-white/80 backdrop-blur-md hover:bg-white text-slate-900 font-bold py-3.5 px-6 rounded-xl text-xs tracking-wider uppercase border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                          Explore Categories
                        </button>
                      )}
                    </div>

                    {/* Trust Badges Bar */}
                    <div className="pt-4 flex flex-wrap items-center gap-6 text-[11px] font-bold text-slate-600 border-t border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                          <Truck className="h-4 w-4 shrink-0" />
                        </div>
                        <span>Free Shipping <span className="text-[9px] font-normal text-slate-400 block">On orders over ₹999</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                          <RotateCcw className="h-4 w-4 shrink-0" />
                        </div>
                        <span>Easy Returns <span className="text-[9px] font-normal text-slate-400 block">30 days return policy</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                          <ShieldCheck className="h-4 w-4 shrink-0" />
                        </div>
                        <span>Secure Payment <span className="text-[9px] font-normal text-slate-400 block">100% secure checkout</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Hero Card (Floating Antigravity Perspective) */}
                  {heroProductImage && (
                    <div className="md:col-span-5 lg:col-span-4 h-64 sm:h-72 bg-white/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/80 shadow-xl shadow-indigo-500/10 flex items-center justify-center overflow-hidden shrink-0 hover:-translate-y-1 transition-transform duration-300">
                      <div className="relative w-full h-full flex flex-col justify-between">
                        <img
                          src={heroProductImage}
                          alt={products[0].name}
                          className="w-full h-48 object-contain rounded-xl drop-shadow-md"
                        />
                        <div className="bg-slate-50/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-100 flex items-center justify-between shadow-xs">
                          <div className="overflow-hidden pr-2">
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">FEATURED ARRIVAL</span>
                            <span className="text-xs font-extrabold text-slate-900 truncate block">{products[0].name}</span>
                          </div>
                          <span className="text-xs font-black text-slate-950 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">₹{products[0].price}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. SHOP BY CATEGORY GRID (Antigravity Interactive Tiles) */}
              {categories.length > 1 && (
                <div id="category-grid" className="space-y-5 text-left scroll-mt-24">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Shop by Category</h2>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Explore curated collections across our catalog.</p>
                    </div>
                    <button
                      onClick={() => setActiveCategory("All")}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View all categories</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {categories.map((cat) => {
                      const catProducts = products.filter((p) => p.category === cat || cat === "All");
                      const firstCatImg = catProducts.find((p) => p.images && p.images[0])?.images[0];
                      const isSelected = activeCategory === cat;

                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            setActiveCategory(cat);
                            document.getElementById("featured-products")?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className={`p-4 rounded-2xl border text-center transition-all duration-300 group flex flex-col items-center justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25 -translate-y-1"
                              : "bg-white border-slate-200/90 text-slate-900 hover:border-indigo-300 hover:shadow-md hover:-translate-y-1"
                          }`}
                        >
                          <div className={`h-16 w-16 rounded-xl border p-2 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 ${
                            isSelected ? "bg-white/10 border-white/20" : "bg-slate-50 border-slate-100"
                          }`}>
                            {firstCatImg ? (
                              <img src={firstCatImg} alt={cat} className="w-full h-full object-contain" />
                            ) : (
                              <Package className={`h-7 w-7 ${isSelected ? "text-white" : "text-slate-400"}`} />
                            )}
                          </div>
                          <div>
                            <h4 className={`text-xs font-extrabold transition-colors ${isSelected ? "text-white" : "group-hover:text-indigo-600"}`}>{cat}</h4>
                            <span className={`text-[10px] font-semibold block mt-0.5 ${isSelected ? "text-indigo-100" : "text-slate-400"}`}>{catProducts.length} {catProducts.length === 1 ? "Item" : "Items"}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. FEATURED PRODUCTS GRID (Weightless Glassmorphic Product Cards) */}
              <div id="featured-products" className="space-y-5 text-left scroll-mt-24">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Featured Products</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Discover our highest quality products available now.</p>
                  </div>
                  {filteredProducts.length > 0 && (
                    <span className="text-xs font-bold text-slate-400 font-mono">{filteredProducts.length} Products</span>
                  )}
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="py-14 px-6 text-center space-y-3 bg-white border border-slate-200/80 rounded-3xl max-w-lg mx-auto shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                      <Package className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">No products found</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      No active products found for this category or search filter. Try clearing filters to see the full store collection.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {filteredProducts.map((prod) => (
                      <div
                        key={prod.productId}
                        className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between cursor-pointer"
                        onClick={() => setSelectedProductDetails(prod)}
                      >
                        {/* Image Frame */}
                        <div className="aspect-square w-full bg-slate-50 border-b border-slate-100 relative p-4 flex items-center justify-center overflow-hidden">
                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(prod.productId);
                            }}
                            className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-xs hover:scale-110 transition-transform z-10 text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <Heart className={`h-3.5 w-3.5 ${wishlist.includes(prod.productId) ? "fill-rose-500 text-rose-500" : ""}`} />
                          </button>

                          {prod.images && prod.images[0] ? (
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <Package className="h-10 w-10 text-slate-300" />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-xs line-clamp-1 leading-snug group-hover:text-indigo-600 transition-colors">{prod.name}</h3>
                            <div className="flex items-center gap-0.5 text-amber-400 text-[10px] my-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={star <= Math.round(prod.rating || 5) ? "" : "text-slate-200"}>★</span>
                              ))}
                              <span className="text-[9px] text-slate-400 font-bold ml-1">({prod.reviewCount || 12})</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                            <span className="font-black text-slate-950 text-sm">₹{prod.price}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(prod);
                              }}
                              style={{ backgroundColor: primaryColor }}
                              className="p-2.5 text-white rounded-xl shadow-xs hover:opacity-90 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                              title="Add to Cart"
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. COMPACT SPECIAL OFFER & NEWSLETTER BANNER */}
              <div className="bg-[#f5f2eb] rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6 text-left">
                <div className="space-y-1.5 max-w-lg">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white rounded-full text-[10px] font-black text-amber-800 tracking-wider uppercase border border-amber-200 shadow-2xs">
                    <Tag className="h-3 w-3 text-amber-600" />
                    <span>SPECIAL OFFER!</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    Get 20% Off Your First Order
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Join our newsletter list today and get exclusive deals and special promo codes.
                  </p>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2">
                  {newsletterSubscribed ? (
                    <div className="bg-emerald-600 text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-xs flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Subscribed! Check your email for 20% off.</span>
                    </div>
                  ) : (
                    <>
                      <input
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter your email address..."
                        className="w-full sm:w-64 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <button
                        onClick={() => {
                          if (newsletterEmail) setNewsletterSubscribed(true);
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black rounded-xl shadow-sm uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                      >
                        Subscribe
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 7. SOCIAL REEL FEED (ONLY rendered if DB provides active social posts) */}
              {socialPosts.length > 0 && (
                <div id="social-feed-section" className="space-y-5 text-left pt-6 border-t border-slate-100 scroll-mt-24">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-pink-600 text-xs font-black uppercase tracking-wider mb-1">
                        <Instagram className="h-4 w-4" />
                        <span>AS SEEN ON INSTAGRAM & REELS</span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Shop Our Social Feed</h2>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Tag @{storeDisplayName} to be featured!</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {socialPosts.map((post: any) => (
                      <div key={post.id || post.title} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between">
                        <div className="aspect-square relative overflow-hidden bg-slate-950">
                          {post.mediaCode ? (
                            <iframe
                              src={`https://www.instagram.com/p/${post.mediaCode}/embed/`}
                              className="w-full h-full border-0"
                              allowFullScreen
                              title={post.title}
                            ></iframe>
                          ) : post.image ? (
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                              <Instagram className="h-10 w-10 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-2.5">
                          <h3 className="font-extrabold text-slate-900 text-xs leading-snug">{post.title}</h3>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className="font-black text-slate-900 text-sm">₹{post.taggedProductPrice || post.price}</span>
                            <button
                              onClick={() => {
                                const matchingProd = products.find((p: any) => p.productId === post.taggedProductId) || products[0];
                                if (matchingProd) addToCart(matchingProd);
                              }}
                              style={{ backgroundColor: primaryColor }}
                              className="px-3.5 py-1.5 text-white rounded-xl text-xs font-bold shadow-2xs hover:opacity-90"
                            >
                              Shop Tagged Product
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* VIEW 2: CART */}
          {view === "cart" && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xs p-6 md:p-8 max-w-xl mx-auto text-left space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <button onClick={() => setView("catalog")} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-black text-slate-900">Your Shopping Cart</h2>
              </div>

              {cart.length > 0 ? (
                <div className="space-y-5">
                  <div className="divide-y divide-slate-100">
                    {cart.map((item) => {
                      const price = item.selectedVariant?.price ?? item.product.price;
                      return (
                        <div key={item.product.productId} className="py-3.5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 border border-slate-200 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                              {item.product.images && item.product.images[0] ? (
                                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain" />
                              ) : (
                                <Package className="h-5 w-5 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-xs text-slate-900">{item.product.name}</h4>
                              <span className="text-xs font-black text-indigo-600 block mt-0.5">₹{price}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-slate-200 rounded-xl">
                              <button onClick={() => updateQuantity(item.product.productId, item.selectedVariant?.id, -1)} className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-l-xl">-</button>
                              <span className="px-2.5 text-xs font-bold text-slate-900">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.productId, item.selectedVariant?.id, 1)} className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-r-xl">+</button>
                            </div>
                            <span className="font-black text-slate-900 text-xs">₹{price * item.quantity}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <div className="flex justify-between items-center text-sm font-black text-slate-900">
                      <span>Total Amount:</span>
                      <span className="text-lg text-indigo-600">₹{cartTotal}</span>
                    </div>
                    <button
                      onClick={() => setView("checkout")}
                      style={{ backgroundColor: primaryColor }}
                      className="w-full py-3 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-md hover:opacity-90 transition-all cursor-pointer"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <ShoppingCart className="h-10 w-10 text-slate-300 mx-auto" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Your cart is empty</h3>
                  <button
                    onClick={() => setView("catalog")}
                    style={{ backgroundColor: primaryColor }}
                    className="px-5 py-2.5 text-white text-xs font-extrabold rounded-xl shadow-xs"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: CHECKOUT */}
          {view === "checkout" && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xs p-6 md:p-8 max-w-lg mx-auto text-left space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <button onClick={() => setView("cart")} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-black text-slate-900">Express Checkout</h2>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setView("confirmation"); setCart([]); }} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Full Name</label>
                  <input type="text" required placeholder="e.g. Rahul Nair" className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Phone Number (WhatsApp Updates)</label>
                  <input type="tel" required placeholder="+91 98765 43210" className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Shipping Delivery Address</label>
                  <textarea required rows={3} placeholder="Street address, city, pincode..." className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-sm font-black text-slate-900">
                    <span>Payable Total:</span>
                    <span className="text-lg text-indigo-600">₹{cartTotal}</span>
                  </div>
                  <button
                    type="submit"
                    style={{ backgroundColor: primaryColor }}
                    className="w-full py-3.5 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-md hover:opacity-90 transition-all cursor-pointer"
                  >
                    Place Order (Razorpay / Cash on Delivery)
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW 4: ORDER CONFIRMATION */}
          {view === "confirmation" && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xs p-8 md:p-10 max-w-md mx-auto text-center space-y-4">
              <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Order Placed Successfully!</h2>
              <p className="text-xs text-slate-500 font-medium">
                Thank you for shopping with {storeDisplayName}. Your order updates have been sent via SMS & WhatsApp.
              </p>
              <button
                onClick={() => setView("catalog")}
                style={{ backgroundColor: primaryColor }}
                className="px-6 py-2.5 text-white text-xs font-black rounded-xl shadow-xs uppercase tracking-wider"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </main>
      </div>

      {/* 8. TRUST BENEFITS BAR - EVENLY DISTRIBUTED IN 1280px GRID */}
      <div className="bg-[#f8fafc] border-t border-slate-200/80 py-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
              <Truck className="h-4.5 w-4.5 text-indigo-600" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">Free Shipping</h5>
              <span className="text-[10px] text-slate-500 font-medium">On prepaid orders over ₹999</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
              <Headphones className="h-4.5 w-4.5 text-indigo-600" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">24/7 Support</h5>
              <span className="text-[10px] text-slate-500 font-medium">We are here to help anytime</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-600" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">Secure Payment</h5>
              <span className="text-[10px] text-slate-500 font-medium">100% encrypted checkout</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
              <RotateCcw className="h-4.5 w-4.5 text-indigo-600" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">Easy Returns</h5>
              <span className="text-[10px] text-slate-500 font-medium">30 days easy returns policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* 9. COMPREHENSIVE FOOTER - CONTAINED IN 1280px GRID */}
      <footer className="bg-slate-950 text-white text-left font-sans border-t border-slate-900">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {/* Column 1: Store Branding */}
          <div className="sm:col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                <ShoppingBag className="h-3.5 w-3.5" />
              </div>
              <span className="text-base font-black tracking-tight text-white">{storeDisplayName}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {storeInfo?.description || "Your one-stop shop for quality products, fast delivery, and excellent customer service."}
            </p>
            <div className="flex items-center gap-3 text-slate-400 pt-1">
              <a href="#" className="hover:text-white transition-colors"><Facebook className="h-4 w-4" /></a>
              <a href="#" className="hover:text-white transition-colors"><Twitter className="h-4 w-4" /></a>
              <a href="#" className="hover:text-white transition-colors"><Instagram className="h-4 w-4" /></a>
              <a href="#" className="hover:text-white transition-colors"><Pin className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Column 2: Shop Links */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><button onClick={() => setView("catalog")} className="hover:text-white transition-colors">All Products</button></li>
              <li><button onClick={() => setView("catalog")} className="hover:text-white transition-colors">Featured</button></li>
              <li><button onClick={() => setView("catalog")} className="hover:text-white transition-colors">New Arrivals</button></li>
              <li><button onClick={() => setView("catalog")} className="hover:text-white transition-colors">Special Offers</button></li>
            </ul>
          </div>

          {/* Column 3: Help Links */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Help</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Order Tracking</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
            </ul>
          </div>

          {/* Column 4: Company Links */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 5: Newsletter */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Newsletter</h4>
            <p className="text-xs text-slate-400 font-medium">Subscribe to get updates on new arrivals and special offers.</p>
            <div className="flex flex-col gap-2 pt-1">
              <input
                type="email"
                placeholder="Enter your email..."
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-sm transition-colors cursor-pointer">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="border-t border-slate-900 py-5 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>
            © {new Date().getFullYear()} {storeDisplayName}. All rights reserved. Powered by Basecart.
          </div>
          <div className="flex items-center gap-2.5 font-mono font-bold text-[10px] text-slate-400">
            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">VISA</span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">MASTERCARD</span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">PAYPAL</span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">APPLE PAY</span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">UPI / RAZORPAY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
