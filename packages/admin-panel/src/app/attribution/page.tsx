"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Link2,
  Search,
  Filter,
  TrendingUp,
  Layers,
  Sparkles,
  Copy,
  Check,
  Globe,
  Tag,
  ArrowRight,
  ExternalLink,
  Users,
  Compass,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { buildCampaignUrl } from "@basecart/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

interface MerchantAttribution {
  tenantId: string;
  storeName: string;
  subdomain: string;
  plan: string;
  status: string;
  createdAt: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  referrer?: string | null;
}

interface UtmAnalyticsData {
  totalMerchants: number;
  totalTracked: number;
  sourcesList: Array<{ source: string; count: number }>;
  campaignsList: Array<{ campaign: string; source: string; medium: string; signups: number }>;
  merchantsList: MerchantAttribution[];
}

export default function AttributionPage() {
  const [data, setData] = useState<UtmAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Campaign Link Builder State
  const [builderBaseUrl, setBuilderBaseUrl] = useState("https://basecart.app/signup");
  const [builderSource, setBuilderSource] = useState("bangalorestartupmap");
  const [builderMedium, setBuilderMedium] = useState("text");
  const [builderCampaign, setBuilderCampaign] = useState("bangalorestartupmap");
  const [builderTerm, setBuilderTerm] = useState("");
  const [builderContent, setBuilderContent] = useState("");
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("basecart_admin_token") : null;
      const headers: Record<string, string> = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};

      const res = await fetch(`${API_URL}/admin/analytics/utm`, { headers, credentials: "include" });
      if (!res.ok) throw new Error("Failed to load UTM campaign analytics data.");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError("Unable to retrieve UTM campaign attribution details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const generatedUrl = useMemo(() => {
    return buildCampaignUrl(builderBaseUrl, {
      utmSource: builderSource,
      utmMedium: builderMedium,
      utmCampaign: builderCampaign,
      utmTerm: builderTerm,
      utmContent: builderContent,
    });
  }, [builderBaseUrl, builderSource, builderMedium, builderCampaign, builderTerm, builderContent]);

  const handleCopyLink = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered merchants list
  const merchants = data?.merchantsList || [];
  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        m.storeName.toLowerCase().includes(q) ||
        m.subdomain.toLowerCase().includes(q) ||
        (m.utmSource && m.utmSource.toLowerCase().includes(q)) ||
        (m.utmCampaign && m.utmCampaign.toLowerCase().includes(q)) ||
        (m.referrer && m.referrer.toLowerCase().includes(q));

      const src = m.utmSource || (m.referrer ? "referral" : "direct");
      const matchesSource = sourceFilter === "ALL" || src.toLowerCase() === sourceFilter.toLowerCase();

      return matchesQuery && matchesSource;
    });
  }, [merchants, searchQuery, sourceFilter]);

  // Pagination calculation
  const totalEntries = filteredMerchants.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const paginatedMerchants = filteredMerchants.slice(startIndex, endIndex);

  // Quick Preset Presets helper
  const applyPreset = (src: string, med: string, camp: string) => {
    setBuilderSource(src);
    setBuilderMedium(med);
    setBuilderCampaign(camp);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Title & Context */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-wider mb-1">
            <Compass className="h-4 w-4" /> Marketing & Attribution Analytics
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">UTM Campaign & Traffic Attribution</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track merchant signup origins (`utm_source`, `utm_medium`, `utm_campaign`), referral traffic, and build campaign URLs.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all self-start md:self-auto cursor-pointer"
        >
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 rounded-xl">
          {error}
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Merchants</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{data?.totalMerchants || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium">Registered merchant stores</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Tracked via UTM / Referrer</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{data?.totalTracked || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium">
            {data?.totalMerchants ? `${Math.round(((data.totalTracked || 0) / data.totalMerchants) * 100)}% campaign attribution rate` : "0% attributed"}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Top Traffic Source</span>
            <Globe className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-lg font-black text-slate-900 truncate">
            {data?.sourcesList && data.sourcesList.length > 0 ? data.sourcesList[0].source : "Direct"}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {data?.sourcesList && data.sourcesList.length > 0 ? `${data.sourcesList[0].count} merchant signups` : "No campaign traffic yet"}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Active Campaigns</span>
            <Layers className="h-4 w-4 text-violet-600" />
          </div>
          <div className="text-2xl font-black text-violet-600">{data?.campaignsList?.length || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium">Unique marketing campaigns</div>
        </div>
      </div>

      {/* ── CAMPAIGN LINK BUILDER TOOL ── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 lg:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">UTM Campaign Link Builder</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Generate tracked URLs to accurately measure where merchant signups come from (e.g. `utm_source=bangalorestartupmap`).
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase">Quick Presets:</span>
            <button
              onClick={() => applyPreset("bangalorestartupmap", "text", "bangalorestartupmap")}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              BangaloreStartupMap
            </button>
            <button
              onClick={() => applyPreset("google", "cpc", "search_ads_2026")}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              Google Ads
            </button>
            <button
              onClick={() => applyPreset("instagram", "social", "bio_link")}
              className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              Instagram Bio
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5 md:col-span-3">
            <label className="block text-xs font-bold text-slate-700">Target Page URL</label>
            <input
              type="text"
              value={builderBaseUrl}
              onChange={(e) => setBuilderBaseUrl(e.target.value)}
              placeholder="https://basecart.app/signup or https://reticket.in"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Campaign Source (`utm_source`)</label>
            <input
              type="text"
              value={builderSource}
              onChange={(e) => setBuilderSource(e.target.value)}
              placeholder="e.g. bangalorestartupmap, google, newsletter"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Campaign Medium (`utm_medium`)</label>
            <input
              type="text"
              value={builderMedium}
              onChange={(e) => setBuilderMedium(e.target.value)}
              placeholder="e.g. text, cpc, banner, social, email"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Campaign Name (`utm_campaign`)</label>
            <input
              type="text"
              value={builderCampaign}
              onChange={(e) => setBuilderCampaign(e.target.value)}
              placeholder="e.g. bangalorestartupmap, launch_promo"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
            />
          </div>
        </div>

        {/* Generated URL Display & Copy Box */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Link2 className="h-4 w-4" /> Generated Campaign Tracking URL
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Copy & paste into ads, listings, or directory links</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={generatedUrl}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 focus:outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 shadow-sm"
              }`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Copied!" : "Copy Campaign Link"}</span>
            </button>
            {generatedUrl && (
              <a
                href={generatedUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors shrink-0"
                title="Test Open URL in New Tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── TRAFFIC SOURCES & CAMPAIGNS BREAKDOWN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Traffic Channels Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" /> Top Traffic Sources (`utm_source`)
            </h3>
            <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
              {data?.sourcesList?.length || 0} Sources
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {(!data?.sourcesList || data.sourcesList.length === 0) ? (
              <div className="text-xs text-slate-400 text-center py-6">No traffic source data available yet.</div>
            ) : (
              data.sourcesList.map((item, idx) => {
                const total = data.totalMerchants || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-600" />
                        {item.source}
                      </span>
                      <span className="text-slate-500 font-semibold">{item.count} stores ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Campaign Breakdown Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tag className="h-4 w-4 text-violet-600" /> Active Marketing Campaigns (`utm_campaign`)
            </h3>
            <span className="text-[10px] font-extrabold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">
              {data?.campaignsList?.length || 0} Campaigns
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {(!data?.campaignsList || data.campaignsList.length === 0) ? (
              <div className="text-xs text-slate-400 text-center py-6">No marketing campaign data recorded.</div>
            ) : (
              data.campaignsList.map((c, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>{c.campaign}</span>
                      <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded uppercase">
                        {c.source} / {c.medium}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-black text-slate-900 shrink-0">
                    {c.signups} signups
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── MERCHANT SIGNUPS ATTRIBUTION TABLE ── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Merchant Signup Attribution Feed</h3>
            <p className="text-xs text-slate-500 font-medium">Detailed UTM tracking breakdown for every merchant account in the registry.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search merchant or source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Merchant / Store</th>
                <th className="py-3 px-4">UTM Source</th>
                <th className="py-3 px-4">UTM Medium</th>
                <th className="py-3 px-4">UTM Campaign</th>
                <th className="py-3 px-4">Referrer URL</th>
                <th className="py-3 px-4 text-right">Signup Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    Loading attribution records...
                  </td>
                </tr>
              ) : paginatedMerchants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No merchants match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedMerchants.map((m) => (
                  <tr key={m.tenantId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{m.storeName}</div>
                      <div className="text-[10px] text-slate-400">{m.subdomain}.basecart.app</div>
                    </td>
                    <td className="py-3 px-4">
                      {m.utmSource ? (
                        <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full uppercase">
                          {m.utmSource}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">Direct</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {m.utmMedium ? (
                        <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full uppercase">
                          {m.utmMedium}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {m.utmCampaign ? (
                        <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                          {m.utmCampaign}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-[200px] truncate text-[11px] text-slate-500">
                      {m.referrer ? (
                        <a href={m.referrer} target="_blank" rel="noreferrer" className="hover:text-indigo-600 underline">
                          {m.referrer}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-[11px] text-slate-500 font-medium">
                      {new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
