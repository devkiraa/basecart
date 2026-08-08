"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Link2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Layers,
  Sparkles,
  Copy,
  Check,
  Globe,
  Tag,
  BookOpen,
  Compass,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface OrderAttribution {
  id: string;
  merchant: string;
  subdomain?: string;
  date: string;
  customer: string;
  amount: number;
  status: string;
  originContext?: {
    originUrl?: string;
    sectionId?: string;
    unitId?: string;
    lessonId?: string;
    adaptiveId?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    referrer?: string;
  };
}

export default function AttributionPage() {
  const [orders, setOrders] = useState<OrderAttribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSection, setFilterSection] = useState("ALL");
  const [filterUnit, setFilterUnit] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Link Generator State
  const [baseUrl, setBaseUrl] = useState("https://store.basecart.app/products/item-101");
  const [genSectionId, setGenSectionId] = useState("1");
  const [genUnitId, setGenUnitId] = useState("20");
  const [genUtmSource, setGenUtmSource] = useState("partner_campaign");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadAttributionData() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/admin/orders`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load platform orders feed.");
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to retrieve URL origin attribution details.");
      } finally {
        setLoading(false);
      }
    }
    loadAttributionData();
  }, []);

  // Filter orders that have originContext or match search query
  const trackedOrders = useMemo(() => {
    return orders.filter((o) => {
      const ctx = o.originContext;
      const query = searchQuery.toLowerCase().trim();

      const matchesQuery =
        !query ||
        o.id.toLowerCase().includes(query) ||
        o.merchant.toLowerCase().includes(query) ||
        (ctx?.originUrl && ctx.originUrl.toLowerCase().includes(query)) ||
        (ctx?.sectionId && ctx.sectionId.toLowerCase().includes(query)) ||
        (ctx?.unitId && ctx.unitId.toLowerCase().includes(query));

      const matchesSection = filterSection === "ALL" || ctx?.sectionId === filterSection;
      const matchesUnit = filterUnit === "ALL" || ctx?.unitId === filterUnit;

      return matchesQuery && matchesSection && matchesUnit;
    });
  }, [orders, searchQuery, filterSection, filterUnit]);

  // Pagination calculation
  const totalEntries = trackedOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const paginatedOrders = trackedOrders.slice(startIndex, endIndex);

  // Computed metrics
  const totalTrackedOrders = orders.filter((o) => o.originContext?.originUrl || o.originContext?.sectionId).length;
  const uniqueSections = Array.from(new Set(orders.map((o) => o.originContext?.sectionId).filter(Boolean)));
  const uniqueUnits = Array.from(new Set(orders.map((o) => o.originContext?.unitId).filter(Boolean)));

  // Generated Link calculation
  const generatedLink = useMemo(() => {
    let url = baseUrl.trim();
    if (!url) return "";
    const params = new URLSearchParams();
    if (genSectionId) params.append("sectionId", genSectionId);
    if (genUnitId) params.append("unitId", genUnitId);
    if (genUtmSource) params.append("utm_source", genUtmSource);
    const queryString = params.toString();
    if (!queryString) return url;
    return url.includes("?") ? `${url}&${queryString}` : `${url}?${queryString}`;
  }, [baseUrl, genSectionId, genUnitId, genUtmSource]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">URL Origin & Attribution Tracing</h1>
        <p className="text-sm text-slate-500 mt-1">
          Trace deep-link referral origins, section/unit campaign IDs, and conversion attribution across all store subdomains.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-sm text-red-650 rounded-xl">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tracked Conversions</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{totalTrackedOrders}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Section IDs</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{uniqueSections.length || 1}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Unit IDs</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{uniqueUnits.length || 1}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attribution Rate</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">
            {orders.length > 0 ? `${((totalTrackedOrders / orders.length) * 100).toFixed(0)}%` : "100%"}
          </div>
        </div>
      </div>

      {/* URL Attribution Generator Tool */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-lg space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Deep Link & Origin Attribution Builder
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="sm:col-span-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Base Landing Page URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://store.basecart.app/products/item-101"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 text-xs text-indigo-200 focus:outline-none focus:border-indigo-400 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">sectionId</label>
            <input
              type="text"
              value={genSectionId}
              onChange={(e) => setGenSectionId(e.target.value)}
              placeholder="e.g. 1"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">unitId</label>
            <input
              type="text"
              value={genUnitId}
              onChange={(e) => setGenUnitId(e.target.value)}
              placeholder="e.g. 20"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">utm_source / Campaign</label>
            <input
              type="text"
              value={genUtmSource}
              onChange={(e) => setGenUtmSource(e.target.value)}
              placeholder="partner_campaign"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
            />
          </div>
        </div>

        {/* Generated output box */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1 font-mono text-[11px] text-indigo-300 break-all">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block font-sans">
              Generated Attribution Link:
            </span>
            <span>{generatedLink}</span>
          </div>

          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 self-end sm:self-auto cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied Link!" : "Copy Attribution URL"}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Search & Filter Origin Registry</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search URL, order, sectionId..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full bg-white border border-slate-200 rounded-lg py-1.5 text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Section ID</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Sections</option>
              {uniqueSections.map((sec) => (
                <option key={sec} value={sec}>
                  Section #{sec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Unit ID</label>
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Units</option>
              {uniqueUnits.map((u) => (
                <option key={u} value={u}>
                  Unit #{u}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Attributed Store Orders Feed</h2>
            <p className="text-xs text-slate-500 mt-0.5">Orders originating from deep links, sectionId, and unitId query paths.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-6">Order & Origin Context</th>
                <th className="py-3.5 px-6">Merchant Store</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Attribution Parameters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-12" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                  </tr>
                ))
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center text-slate-400 font-medium">
                    No attributed order records match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-indigo-600">
                      <div>{order.id}</div>
                      <div className="text-[10px] text-slate-500 font-sans mt-0.5 truncate max-w-xs" title={order.originContext?.originUrl}>
                        {order.originContext?.originUrl || "Direct Link"}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      <div>{order.merchant}</div>
                      {order.subdomain && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{order.subdomain}.basecart.app</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono">{order.date}</td>
                    <td className="py-4 px-6">
                      <div className="text-slate-800 font-semibold">{order.customer}</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">₹{order.amount}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 font-mono text-[9px]">
                        {order.originContext?.sectionId && (
                          <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">
                            sectionId: {order.originContext.sectionId}
                          </span>
                        )}
                        {order.originContext?.unitId && (
                          <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                            unitId: {order.originContext.unitId}
                          </span>
                        )}
                        {order.originContext?.lessonId && (
                          <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                            lessonId: {order.originContext.lessonId}
                          </span>
                        )}
                        {order.originContext?.adaptiveId && (
                          <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">
                            adaptiveId: {order.originContext.adaptiveId}
                          </span>
                        )}
                        {!order.originContext?.sectionId && !order.originContext?.unitId && (
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Default Direct</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Controls & Entry Counter */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            {totalEntries > 0 ? (
              <span>
                Showing <strong className="text-slate-800 font-bold">{startIndex + 1}</strong> to{" "}
                <strong className="text-slate-800 font-bold">{endIndex}</strong> of{" "}
                <strong className="text-slate-800 font-bold">{totalEntries}</strong> attributed orders
              </span>
            ) : (
              <span>No attributed orders to display</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 select-none">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                  currentPage === pageNum
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
