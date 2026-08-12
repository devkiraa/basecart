"use client";

import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import BookDemoButton from "./BookDemoButton";
import {
  Monitor,
  Tablet,
  Smartphone,
  ArrowRight,
  Search,
  Eye,
  CheckCircle2,
  Zap,
  Sparkles,
  Layers,
  X,
  ExternalLink,
  ShoppingBag,
  ArrowUpRight,
  Check,
} from "lucide-react";

interface ThemeItem {
  id: string;
  name: string;
  category: "Fashion & Apparel" | "Ethnic & Silk" | "Luxury & Accessories" | "Electronics & Tech" | "Food & Bakery" | "Headless Next.js";
  desc: string;
  speed: string;
  features: string[];
  image: string;
  demoUrl: string;
  accentColor: string;
  sampleProducts: { name: string; price: string; image: string }[];
}

const THEMES_LIST: ThemeItem[] = [
  {
    id: "kasavu-silk",
    name: "Kasavu Apparel & Silk",
    category: "Ethnic & Silk",
    desc: "Designed specifically for Kerala silk sarees, handlooms, and ethnic boutique houses. Features high-res zoom grids, fabric detail callouts, and instant WhatsApp ordering.",
    speed: "100/100",
    features: ["WhatsApp Direct Sync", "Fabric Variant Picker", "COD Verification", "Shiprocket AWB"],
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
    demoUrl: "https://kasavu.basecart.app",
    accentColor: "bg-amber-600",
    sampleProducts: [
      { name: "Handcrafted Golden Kasavu Saree", price: "₹2,499", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80" },
      { name: "Kanchipuram Pure Silk Saree", price: "₹4,890", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80" },
    ]
  },
  {
    id: "aura-minimal",
    name: "Aura Luxury & Timepieces",
    category: "Luxury & Accessories",
    desc: "Minimalist luxury theme with dark mode aesthetics, editorial typography, and high-contrast product showcases for watches, jewelry, and eyewear.",
    speed: "99/100",
    features: ["1-Click Razorpay UPI", "360° Image Frame", "Custom Domain SSL", "Stock Alerts"],
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&auto=format&fit=crop&q=80",
    demoUrl: "https://aura.basecart.app",
    accentColor: "bg-blue-600",
    sampleProducts: [
      { name: "Chronograph Automatic Watch", price: "₹8,999", image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&auto=format&fit=crop&q=80" },
      { name: "Titanium Matte Sunglasses", price: "₹1,890", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&auto=format&fit=crop&q=80" },
    ]
  },
  {
    id: "vogue-boutique",
    name: "Vogue Streetwear & Apparel",
    category: "Fashion & Apparel",
    desc: "Modern grid layout with Instagram reel embeds, size guide popups, and quick variant selection for apparel brands and sneaker boutiques.",
    speed: "98/100",
    features: ["Instagram Feed Sync", "Dynamic Size Chart", "Coupon Engine", "UPI GPay Checkout"],
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80",
    demoUrl: "https://vogue.basecart.app",
    accentColor: "bg-indigo-600",
    sampleProducts: [
      { name: "Oversized Heavyweight Hoodie", price: "₹1,499", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&auto=format&fit=crop&q=80" },
      { name: "Vintage Wash Denim Jacket", price: "₹2,299", image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400&auto=format&fit=crop&q=80" },
    ]
  },
  {
    id: "quantum-tech",
    name: "Quantum Dark Tech & Electronics",
    category: "Electronics & Tech",
    desc: "Futuristic dark-mode interface with technical spec matrices, comparison charts, and bulk order pricing tiers for gadgets and accessories.",
    speed: "100/100",
    features: ["Tech Spec Matrix", "Warranty Badge Sync", "Delhivery Logistics", "GST Invoicing"],
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&auto=format&fit=crop&q=80",
    demoUrl: "https://quantum.basecart.app",
    accentColor: "bg-cyan-600",
    sampleProducts: [
      { name: "Active Noise Cancelling Earbuds", price: "₹3,499", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80" },
      { name: "MagSafe Wireless Power Bank", price: "₹1,299", image: "https://images.unsplash.com/photo-1622445268121-ac11f17a2834?w=400&auto=format&fit=crop&q=80" },
    ]
  },
  {
    id: "zen-gourmet",
    name: "Zen Organic & Artisan Bakery",
    category: "Food & Bakery",
    desc: "Warm earthy tones with fresh delivery slot selectors, custom cake order forms, and instant WhatsApp pickup confirmation.",
    speed: "99/100",
    features: ["Slot Delivery Picker", "WhatsApp Cake Form", "Local Doorstep Pickup", "Instant Receipt"],
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop&q=80",
    demoUrl: "https://zen.basecart.app",
    accentColor: "bg-emerald-600",
    sampleProducts: [
      { name: "Belgian Chocolate Fudge Cake", price: "₹850", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80" },
      { name: "Artisanal Sourdough Loaf", price: "₹220", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80" },
    ]
  },
  {
    id: "headless-starter",
    name: "Headless Next.js React Starter",
    category: "Headless Next.js",
    desc: "Complete headless boilerplate built with Next.js App Router, Tailwind CSS, and Basecart Storefront SDK for developers.",
    speed: "100/100",
    features: ["Full Next.js App Router", "Tailwind CSS UI", "Cloudflare Workers", "OpenAPI Types"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    demoUrl: "https://headless.basecart.app",
    accentColor: "bg-slate-900",
    sampleProducts: [
      { name: "Headless React Component Kit", price: "Free", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80" },
    ]
  }
];

const CATEGORIES = [
  "All Themes",
  "Fashion & Apparel",
  "Ethnic & Silk",
  "Luxury & Accessories",
  "Electronics & Tech",
  "Food & Bakery",
  "Headless Next.js"
] as const;

export default function ThemesClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Themes");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePreviewTheme, setActivePreviewTheme] = useState<ThemeItem | null>(null);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");

  const filteredThemes = THEMES_LIST.filter((theme) => {
    const matchesCat = selectedCategory === "All Themes" || theme.category === selectedCategory;
    const matchesSearch =
      theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-slate-600 font-sans selection:bg-blue-50 selection:text-blue-600 overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="px-6 lg:px-16 pt-12 pb-16 bg-gradient-to-b from-[#F8FAFC]/70 via-white to-white border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Storefront Theme Engine</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Conversion-optimized themes for <span className="text-blue-600">Indian brands</span> & creators
          </h1>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Launch in minutes with lightning-fast, mobile-first themes built natively for UPI checkout, WhatsApp order receipts, and regional logistics.
          </p>

          {/* Performance Pill */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-semibold pt-2">
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <Zap className="w-3.5 h-3.5 fill-emerald-600" /> 100/100 Lighthouse Performance
            </span>
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" /> 100% Mobile Responsive
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Free SSL & Custom Domain
            </span>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="px-6 lg:px-16 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-8 border-b border-slate-100">
          
          {/* Categories Tab Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 select-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </section>

      {/* Themes Grid */}
      <section className="px-6 lg:px-16 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredThemes.map((theme) => (
            <div
              key={theme.id}
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image Cover Container */}
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                  <img
                    src={theme.image}
                    alt={theme.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-700">
                    <Zap className="w-2.5 h-2.5 text-emerald-400" />
                    <span>{theme.speed}</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    {theme.category}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {theme.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {theme.desc}
                  </p>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {theme.features.map((feat) => (
                      <span
                        key={feat}
                        className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/60"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setActivePreviewTheme(theme);
                    setPreviewViewport("desktop");
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100/80 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview</span>
                </button>

                <a
                  href={`/signup?theme=${theme.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <span>Use Theme</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Showcase Section ("Why Basecart Themes Load Instantly") */}
      <section className="py-20 px-6 lg:px-16 bg-[#F8FAFC] border-y border-slate-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Engineered for high conversion & zero delay
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Every Basecart theme passes strict Lighthouse auditing for core web vitals and mobile responsiveness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 fill-blue-600/20" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Sub-10ms Edge Speeds</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Served directly from Cloudflare Workers 300+ global edge locations for instantaneous page loads across 3G/4G networks.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5 fill-emerald-600/20" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">1-Click UPI & WhatsApp</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Native checkout integrations for Razorpay, Cashfree, UPI apps, and direct pre-filled WhatsApp order messaging.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Store Studio Customizer</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Customize colors, fonts, banners, announcement bars, and product layout grids without writing code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE LIVE PREVIEW MODAL */}
      {activePreviewTheme && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in select-none">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header Bar */}
            <div className="h-14 bg-slate-100/90 border-b border-slate-200 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-900">{activePreviewTheme.name}</span>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                  {activePreviewTheme.category}
                </span>
              </div>

              {/* Viewport Switcher Controls */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  onClick={() => setPreviewViewport("desktop")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewViewport === "desktop" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewViewport("mobile")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewViewport === "mobile" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setActivePreviewTheme(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Live Simulated Preview Frame */}
            <div className="flex-1 bg-slate-50 p-6 overflow-y-auto flex items-center justify-center">
              <div
                className={`transition-all duration-300 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden ${
                  previewViewport === "desktop" ? "w-full max-w-3xl" : "w-80 h-[520px]"
                }`}
              >
                {/* Mock Store Header */}
                <div className="h-10 bg-slate-900 text-white px-4 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                    <span>{activePreviewTheme.name} Demo</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Live Demo
                  </span>
                </div>

                {/* Mock Store Hero Banner */}
                <div className="relative h-40 bg-slate-100 overflow-hidden flex items-center justify-center text-center p-4">
                  <img
                    src={activePreviewTheme.image}
                    alt="Store Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs"></div>
                  <div className="relative z-10 text-white space-y-1">
                    <h4 className="text-lg font-black">{activePreviewTheme.name}</h4>
                    <p className="text-[10px] font-medium opacity-90">Instant 1-Click UPI & WhatsApp Checkout</p>
                  </div>
                </div>

                {/* Mock Store Sample Products */}
                <div className="p-4 space-y-3">
                  <div className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                    <span>Featured Catalog</span>
                    <span className="text-[10px] text-blue-600 font-bold">2 Items Available</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {activePreviewTheme.sampleProducts.map((prod, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 space-y-1.5">
                        <img src={prod.image} alt={prod.name} className="w-full h-24 object-cover rounded" />
                        <div className="text-[11px] font-bold text-slate-900 truncate">{prod.name}</div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-extrabold text-blue-600">{prod.price}</span>
                          <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">Buy Now</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Bar */}
            <div className="h-16 bg-white border-t border-slate-200 px-6 flex items-center justify-between">
              <div className="text-xs text-slate-500 font-semibold">
                Want to use this layout for your boutique?
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActivePreviewTheme(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Close
                </button>
                <a
                  href={`/signup?theme=${activePreviewTheme.id}`}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <span>Select {activePreviewTheme.name}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Bottom CTA Banner */}
      <section className="py-20 px-6 lg:px-16 bg-gradient-to-b from-white to-[#F8FAFC]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Ready to launch your store?
          </h2>
          <p className="text-base text-slate-500 font-medium max-w-xl mx-auto">
            Start your 3-month free trial today with any theme. No credit card required.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="/signup"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start 3-month free trial</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <BookDemoButton />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
