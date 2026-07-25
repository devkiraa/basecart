"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Search,
  Bell,
  ChevronDown,
  Zap,
  Truck,
  Sparkles,
  Activity,
  Home,
  Settings as SettingsIcon,
  Globe,
} from "lucide-react";

type Timeframe = "7D" | "30D" | "12M";

interface DashboardData {
  sales: string;
  salesChange: string;
  orders: string;
  ordersChange: string;
  visitors: string;
  pathD: string;
  areaD: string;
  peakVal: string;
}

const TIMEFRAME_DATA: Record<Timeframe, DashboardData> = {
  "7D": {
    sales: "₹2,48,500",
    salesChange: "+14%",
    orders: "184",
    ordersChange: "+8%",
    visitors: "42",
    pathD: "M 0,105 C 50,90 90,100 140,70 C 200,40 240,55 300,28 C 360,8 420,18 480,6",
    areaD: "M 0,105 C 50,90 90,100 140,70 C 200,40 240,55 300,28 C 360,8 420,18 480,6 L 480,130 L 0,130 Z",
    peakVal: "₹52,400 peak",
  },
  "30D": {
    sales: "₹9,82,100",
    salesChange: "+22%",
    orders: "742",
    ordersChange: "+16%",
    visitors: "68",
    pathD: "M 0,115 C 60,100 120,75 180,60 C 250,45 310,65 380,30 C 430,10 460,18 480,8",
    areaD: "M 0,115 C 60,100 120,75 180,60 C 250,45 310,65 380,30 C 430,10 460,18 480,8 L 480,130 L 0,130 Z",
    peakVal: "₹1,84,000 peak",
  },
  "12M": {
    sales: "₹1,14,50,000",
    salesChange: "+38%",
    orders: "8,920",
    ordersChange: "+29%",
    visitors: "105",
    pathD: "M 0,120 C 70,110 130,85 200,55 C 270,25 340,40 400,16 C 440,4 470,12 480,3",
    areaD: "M 0,120 C 70,110 130,85 200,55 C 270,25 340,40 400,16 C 440,4 470,12 480,3 L 480,130 L 0,130 Z",
    peakVal: "₹14.2L peak",
  },
};

const RECENT_ORDERS = [
  { id: "ORD-2084", customer: "Ananya N.", city: "Kochi", amount: "₹1,499", status: "Paid", shipping: "Unfulfilled" },
  { id: "ORD-2083", customer: "Rahul M.", city: "Bengaluru", amount: "₹2,890", status: "Paid", shipping: "Shipped" },
  { id: "ORD-2082", customer: "Priya S.", city: "Mumbai", amount: "₹999", status: "COD", shipping: "Delivered" },
];

const LIVE_NOTIFS = [
  { id: "2084", amount: "1,499", customer: "Ananya N. (Kochi)", payment: "Razorpay" },
  { id: "2085", amount: "2,890", customer: "Rahul M. (Bengaluru)", payment: "UPI Instant" },
  { id: "2086", amount: "999", customer: "Priya S. (Mumbai)", payment: "COD Verified" },
];

export default function HeroDashboardMockup() {
  const [activeTab, setActiveTab] = useState("summary");
  const [timeframe, setTimeframe] = useState<Timeframe>("7D");
  const [notifIndex, setNotifIndex] = useState(0);

  const data = TIMEFRAME_DATA[timeframe];
  const currentNotif = LIVE_NOTIFS[notifIndex];

  // Rotate real-time orders floating overlay every 4s
  useEffect(() => {
    const timer = setInterval(() => {
      setNotifIndex((prev) => (prev + 1) % LIVE_NOTIFS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-[640px] relative select-none font-sans">
      {/* Royal Blue Glow Ambient Background */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600/20 via-indigo-500/15 to-blue-400/20 rounded-3xl blur-2xl opacity-80 group-hover:opacity-100 transition duration-1000 -z-10"></div>

      {/* Main Glassmorphic Light Dashboard Container */}
      <div className="relative bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
        
        {/* Top Window Navigation Bar (Browser Frame Style) */}
        <div className="h-10 bg-slate-100/90 border-b border-slate-200/80 px-3.5 flex items-center justify-between">
          {/* macOS window controls */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block shadow-2xs"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-2xs"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-2xs"></span>
          </div>

          {/* Real Dashboard Address Bar */}
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-500 shadow-2xs">
            <Globe className="w-3 h-3 text-blue-600" />
            <span className="text-slate-800 font-bold">dashboard.basecart.app</span>
            <span className="text-slate-400">/overview</span>
          </div>

          {/* Live Sync Status Tag */}
          <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>LIVE D1 SYNC</span>
          </div>
        </div>

        {/* Real Merchant Dashboard Body */}
        <div className="flex h-[370px] sm:h-[410px]">
          
          {/* Left Mini Sidebar */}
          <aside className="w-44 sm:w-48 bg-white border-r border-slate-200/80 flex flex-col shrink-0">
            {/* Store Branding Logo */}
            <div className="h-12 flex items-center px-3.5 gap-2.5 border-b border-slate-100 shrink-0">
              <div className="h-7 w-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-xs">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="text-sm font-black text-slate-900 tracking-tight">basecart</span>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {[
                { id: "summary", name: "Overview", icon: Home },
                { id: "orders", name: "Orders & Sales", icon: ShoppingCart, badge: "3" },
                { id: "products", name: "Catalog & Items", icon: Package },
                { id: "customers", name: "Customers", icon: Users },
                { id: "finances", name: "Analytics", icon: TrendingUp },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-extrabold shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bottom Settings Link */}
            <div className="p-2 border-t border-slate-100 shrink-0">
              <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
                <SettingsIcon className="h-4 w-4 text-slate-400" />
                <span>Store Settings</span>
              </button>
            </div>
          </aside>

          {/* Right Main Dashboard Canvas */}
          <div className="flex-1 bg-slate-50/50 flex flex-col min-w-0 overflow-hidden">
            
            {/* Top Store Header Bar */}
            <header className="h-12 bg-white border-b border-slate-200/80 px-3.5 flex items-center justify-between shrink-0 shadow-2xs">
              {/* Store Switcher Pill */}
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="h-5 w-5 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-[9px]">
                  KS
                </div>
                <span className="text-xs font-bold text-slate-900 truncate max-w-[90px] sm:max-w-[120px]">
                  Kirans Store
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </div>

              {/* Top Controls */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/60 px-2.5 py-1 rounded-lg text-[10px] text-slate-400">
                  <Search className="h-3 w-3 text-slate-400" />
                  <span>Search... (Ctrl+K)</span>
                </div>
                <div className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg relative cursor-pointer">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-rose-500 rounded-full"></span>
                </div>
                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px] shadow-2xs">
                  KM
                </div>
              </div>
            </header>

            {/* Dashboard Scrollable Canvas */}
            <main className="flex-1 p-3.5 space-y-3 overflow-y-auto">
              
              {/* Controls Bar: Timeframe Selector */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-black text-slate-900 tracking-tight">Analytics Overview</h2>
                  <p className="text-[10px] text-slate-400 font-medium">Real-time revenue telemetry</p>
                </div>

                {/* Timeframe Selector Tabs */}
                <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg border border-slate-200/80 gap-0.5">
                  {(["7D", "30D", "12M"] as Timeframe[]).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`relative px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                        timeframe === tf ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {timeframe === tf && (
                        <motion.div
                          layoutId="lightTabBg"
                          className="absolute inset-0 bg-white rounded-md shadow-2xs border border-slate-200/80"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{tf}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-2">
                {/* Sales Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white border border-slate-200/80 hover:border-blue-500/40 p-2.5 rounded-xl transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                    <span>Sales</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200/60 flex items-center">
                      <TrendingUp className="w-2 h-2 mr-0.5" /> {data.salesChange}
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={timeframe + "-sales"}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 tracking-tight"
                    >
                      {data.sales}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                {/* Orders Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white border border-slate-200/80 hover:border-blue-500/40 p-2.5 rounded-xl transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                    <span>Orders</span>
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200/60 flex items-center">
                      <ShoppingBag className="w-2 h-2 mr-0.5" /> {data.ordersChange}
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={timeframe + "-orders"}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 tracking-tight"
                    >
                      {data.orders} <span className="text-[9px] font-semibold text-slate-400">qty</span>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                {/* Live Store Visitors */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white border border-slate-200/80 hover:border-blue-500/40 p-2.5 rounded-xl transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                    <span>Store</span>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={timeframe + "-visitors"}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      className="text-xs sm:text-sm font-black text-emerald-600 mt-0.5 tracking-tight flex items-center gap-0.5"
                    >
                      {data.visitors} <span className="text-[9px] font-semibold text-slate-400">online</span>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Dynamic Revenue SVG Chart */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-blue-600" /> Revenue Growth Trend
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400">Razorpay + COD</span>
                </div>

                {/* SVG Curve Line */}
                <div className="relative h-20 w-full pt-1">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 480 130" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lightHeroGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <motion.path
                      key={timeframe + "-area"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, d: data.areaD }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      fill="url(#lightHeroGradient)"
                    />

                    {/* Upward stroke line */}
                    <motion.path
                      key={timeframe + "-line"}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1, d: data.pathD }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Peak dot */}
                    <circle cx="480" cy="6" r="4" fill="#2563EB" />
                    <circle cx="480" cy="6" r="8" fill="#2563EB" opacity="0.3" className="animate-ping" />
                  </svg>

                  {/* Peak Overlay */}
                  <motion.div
                    key={timeframe + "-badge"}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-0 right-0 bg-slate-900 text-white text-[8px] font-black px-2 py-0.2 rounded-full shadow-md flex items-center gap-1 border border-slate-700"
                  >
                    <Sparkles className="w-2 h-2 text-amber-400" />
                    {data.peakVal}
                  </motion.div>
                </div>
              </div>

              {/* Recent Live Orders Table */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-extrabold text-slate-900">Recent Live Orders</span>
                  <span className="text-[9px] font-bold text-blue-600 hover:underline cursor-pointer">View All ↗</span>
                </div>
                <div className="space-y-1 divide-y divide-slate-100">
                  {RECENT_ORDERS.map((ord) => (
                    <div key={ord.id} className="pt-1 flex items-center justify-between text-[10px] font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{ord.id}</span>
                        <span>{ord.customer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">{ord.amount}</span>
                        <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 py-0.2 rounded">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </main>
          </div>
        </div>

        {/* FLOATING OVERLAY CARDS */}
        <div className="p-2.5 pt-0 sm:px-4 sm:pb-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/80">
          {/* 1. Live Order Notification Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNotif.id}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="flex-1 bg-white border border-blue-200/90 p-2 rounded-xl shadow-sm flex items-center gap-2 hover:scale-[1.01] transition-transform cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <Zap className="w-3.5 h-3.5 fill-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-900 truncate">
                    ⚡ New Order #{currentNotif.id}
                  </span>
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100">
                    ₹{currentNotif.amount}
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 font-medium truncate mt-0.2">
                  {currentNotif.customer} • {currentNotif.payment}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 2. Shiprocket AWB Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-emerald-600 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg shadow-md flex items-center justify-center gap-1 shrink-0 hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <Truck className="w-3 h-3" />
            <span>Shiprocket AWB Generated ✓</span>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
