import React from "react";
import {
  Layers,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Check,
  CheckCircle2,
  Lock,
  Smartphone,
  Zap,
  Package,
} from "lucide-react";

export default function AlternatingFeatures() {
  return (
    <section className="py-24 px-6 lg:px-16 bg-slate-50/50 border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-28">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Deep Dive Features</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Engineered for Modern Indian E-Commerce
          </h2>
          <p className="text-base text-slate-500 font-medium leading-relaxed">
            Replace legacy platform workarounds with native tools built for UPI payments, WhatsApp ordering, and instant regional shipping.
          </p>
        </div>

        {/* ── ROW 1: Garment & Variant Builder (Text Left, UI Right) ── */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="w-full lg:w-1/2 space-y-6">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs">
              01
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Multi-Variant Catalog & Stock Management
            </h3>
            <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
              Effortlessly organize clothes, sarees, bakery orders, or handcrafted items with custom size, color, and material options. Track inventory weights and compare-at discounts automatically.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Unlimited SKU matrix generation for sizes, shades & fabrics</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Bulk CSV import and export for fast catalog migration</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Automated low-stock alerts & out-of-stock badges</span>
              </li>
            </ul>
            <div className="pt-2">
              <a href="/signup" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                <span>Explore Catalog Tools</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* UI Card Mockup */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Handloom Silk Saree</h4>
                    <span className="text-[11px] text-slate-400 font-medium">SKU: HSK-2026-M</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-extrabold uppercase">
                  In Stock (42)
                </span>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700">Available Color Variants:</div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-sm">Royal Blue</span>
                  <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">Emerald Green</span>
                  <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">Crimson Red</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Selling Price: <strong className="text-slate-900 font-bold">₹2,890</strong></span>
                <span className="text-slate-400 line-through">₹4,990 (42% OFF)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Instant UPI & Razorpay Checkout (UI Left, Text Right) ── */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
          {/* UI Card Mockup */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Razorpay & Instant UPI Checkout</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-extrabold">
                  0% Platform Fee
                </span>
              </div>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center font-black text-blue-600 text-xs">
                      UPI
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Google Pay / PhonePe / Paytm</div>
                      <div className="text-[11px] text-slate-500 font-medium">Instant automated QR & App Intent</div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Cash on Delivery (COD Verified)</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">OTP Required</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-6">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs">
              02
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Native UPI & COD Payment Automation
            </h3>
            <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
              Accept Google Pay, PhonePe, Paytm, credit cards, and verified Cash on Delivery with zero platform commission fees. Razorpay credentials remain 100% encrypted on your private server.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Instant settlement directly into your Indian bank account</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Automated COD Phone verification to prevent fake orders</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>AES-256 Web Crypto encryption for Razorpay API keys</span>
              </li>
            </ul>
            <div className="pt-2">
              <a href="/signup" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                <span>View Payment Options</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* ── ROW 3: Automated WhatsApp Order Dispatch (Text Left, UI Right) ── */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="w-full lg:w-1/2 space-y-6">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs">
              03
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Automated WhatsApp Checkout & Receipts
            </h3>
            <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
              Turn Instagram DMs and WhatsApp chats into sales. Customers receive instant, pre-filled WhatsApp receipts and tracking links immediately after checkout without manual typing.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Pre-filled WhatsApp checkout links with items & address</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Automated order confirmation alerts sent directly to buyer</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Abandoned cart recovery notifications via WhatsApp</span>
              </li>
            </ul>
            <div className="pt-2">
              <a href="/signup" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                <span>See WhatsApp Integration</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* UI Card Mockup */}
          <div className="w-full lg:w-1/2">
            <div className="bg-emerald-950/90 border border-emerald-800/60 rounded-2xl p-6 shadow-xl space-y-4 text-emerald-100">
              <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-white">WhatsApp Business Alert</span>
                </div>
                <span className="text-[10px] bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded font-mono">Instant</span>
              </div>
              <div className="bg-emerald-900/60 p-4 rounded-xl border border-emerald-700/50 space-y-2 text-xs leading-relaxed font-sans">
                <div className="font-bold text-emerald-300">Basecart Store Order #2084</div>
                <p>Hello Ananya! Your order for <strong>Handloom Silk Saree (Royal Blue)</strong> is confirmed.</p>
                <div className="text-[11px] text-emerald-200/80 pt-1 font-mono">
                  Total Paid: ₹2,890 (UPI Instant)<br />
                  Delivery: Ernakulam, Kochi
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 4: Dedicated Store Security & Speed (UI Left, Text Right) ── */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
          {/* UI Card Mockup */}
          <div className="w-full lg:w-1/2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-bold text-white">Dedicated Store Environment</span>
                </div>
                <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded font-mono">100% Uptime</span>
              </div>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Store Isolation:</span>
                  <span className="text-emerald-400 font-bold">Protected & Private</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Checkout Speed:</span>
                  <span className="text-blue-400 font-bold">&lt; 0.5 sec Instant</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Customer Data Encryption:</span>
                  <span className="text-purple-400 font-bold">Bank-Grade Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-6">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs">
              04
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Dedicated Store Security & Ultra-Fast Loading
            </h3>
            <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
              Basecart provides dedicated store performance and bank-grade data security. Your customer lists and catalog are completely private, with instant checkout load times even during peak holiday sales.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Zero store slowdowns during festival sales & traffic spikes</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Bank-grade encryption for merchant payment credentials & customer records</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Instant page load speeds across mobile devices</span>
              </li>
            </ul>
            <div className="pt-2">
              <a href="/signup" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                <span>Explore Store Features</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* ── ROW 5: Real-Time Growth Analytics (Text Left, UI Right) ── */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="w-full lg:w-1/2 space-y-6">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs">
              05
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Real-Time Sales & Growth Analytics
            </h3>
            <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
              Track revenue trends, average order value (AOV), top products, and conversion bottlenecks live from your merchant dashboard.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Live revenue metrics updated on every completed order</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Top product performance & customer retention metrics</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>1-click CSV order data export for accounting & GST filing</span>
              </li>
            </ul>
            <div className="pt-2">
              <a href="/signup" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                <span>Start Tracking Growth</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* UI Card Mockup */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">Monthly Sales Summary</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  +38% growth
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-medium">Total Revenue</div>
                  <div className="text-lg font-black text-slate-900">₹2,48,500</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-medium">Average Order</div>
                  <div className="text-lg font-black text-slate-900">₹1,350</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
