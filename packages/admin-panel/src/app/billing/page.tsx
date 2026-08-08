"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  CreditCard,
  BadgeCent,
  ArrowUpRight,
  Loader2,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface InvoiceItem {
  invoiceId: string;
  storeName: string;
  subdomain: string;
  date: string;
  amount: number;
  plan: string;
  status: string;
}

interface BillingOverview {
  mrr: number;
  arr: number;
  planDistribution: {
    starter: number;
    growth: number;
    pro: number;
  };
  totalInvoices: number;
  invoices?: InvoiceItem[];
}

export default function BillingPage() {
  const [data, setData] = useState<BillingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Table controls state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<"date" | "amount" | "storeName">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    async function loadBilling() {
      try {
        const res = await fetch(`${API_URL}/admin/billing/overview`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load billing metrics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError("Unable to retrieve platform billing records.");
      } finally {
        setLoading(false);
      }
    }
    loadBilling();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const rawInvoices = useMemo(() => data?.invoices || [], [data]);

  // Filtered and sorted invoice records
  const filteredInvoices = useMemo(() => {
    return rawInvoices
      .filter((inv) => {
        // Search text matching
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          inv.storeName.toLowerCase().includes(query) ||
          inv.subdomain.toLowerCase().includes(query) ||
          inv.invoiceId.toLowerCase().includes(query) ||
          inv.plan.toLowerCase().includes(query);

        // Plan filter
        const matchesPlan =
          selectedPlanFilter === "ALL" ||
          inv.plan.toUpperCase() === selectedPlanFilter;

        // Status filter
        const matchesStatus =
          selectedStatusFilter === "ALL" ||
          inv.status.toUpperCase() === selectedStatusFilter;

        return matchesSearch && matchesPlan && matchesStatus;
      })
      .sort((a, b) => {
        let compA = a[sortField];
        let compB = b[sortField];

        if (typeof compA === "string") compA = compA.toLowerCase();
        if (typeof compB === "string") compB = compB.toLowerCase();

        if (compA < compB) return sortDirection === "asc" ? -1 : 1;
        if (compA > compB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [rawInvoices, searchQuery, selectedPlanFilter, selectedStatusFilter, sortField, sortDirection]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPlanFilter, selectedStatusFilter, pageSize]);

  // Pagination calculation
  const totalEntries = filteredInvoices.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  const toggleSort = (field: "date" | "amount" | "storeName") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Billing & Subscriptions</h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of MRR, ARR, renewal logs, plan metrics, and central invoicing stats.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-sm text-red-650 rounded-xl">
          {error}
        </div>
      )}

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
            Monthly Recurring Revenue (MRR)
          </span>
          <div className="text-3xl font-extrabold text-slate-800">
            {loading ? (
              <div className="h-9 bg-slate-200 rounded w-36 animate-pulse" />
            ) : (
              formatCurrency(data?.mrr || 0)
            )}
          </div>
          <p className="text-xs text-indigo-600 font-semibold mt-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Calculated from active plans
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
            Annualized Run Rate (ARR)
          </span>
          <div className="text-3xl font-extrabold text-slate-800">
            {loading ? (
              <div className="h-9 bg-slate-200 rounded w-40 animate-pulse" />
            ) : (
              formatCurrency(data?.arr || 0)
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">12x MRR projection scale</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
            Total Invoices Recorded
          </span>
          <div className="text-3xl font-extrabold text-slate-800">
            {loading ? (
              <div className="h-9 bg-slate-200 rounded w-20 animate-pulse" />
            ) : (
              data?.totalInvoices || 0
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">Total merchant subscription entries</p>
        </div>
      </div>

      {/* Detailed Invoices list */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header & Plan Pills */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Platform Subscription Records</h3>
            <p className="text-xs text-slate-500 mt-0.5">Aggregated recurring payments and subscription invoice history.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg text-slate-600">
              Starter: {data?.planDistribution.starter || 0}
            </span>
            <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg text-slate-600">
              Growth: {data?.planDistribution.growth || 0}
            </span>
            <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg text-slate-600">
              Pro: {data?.planDistribution.pro || 0}
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search store, ID, or plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Filters & Page Size */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            <select
              value={selectedPlanFilter}
              onChange={(e) => setSelectedPlanFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Plans</option>
              <option value="STARTER">Starter</option>
              <option value="GROWTH">Growth</option>
              <option value="PRO">Pro</option>
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="EXEMPT">Exempt</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none">
                <th className="px-6 py-3.5">Transaction Code</th>
                <th
                  onClick={() => toggleSort("storeName")}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    Store Reference
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-6 py-3.5">Plan Tier</th>
                <th
                  onClick={() => toggleSort("date")}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    Billing Date
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("amount")}
                  className="px-6 py-3.5 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    Amount
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded w-16" /></td>
                  </tr>
                ))
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-400 font-medium">
                    No matching billing entries found for your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr key={inv.invoiceId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{inv.invoiceId}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      <div>{inv.storeName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{inv.subdomain}.basecart.app</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {inv.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">{inv.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(inv.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        inv.status === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : inv.status === "Exempt"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        {inv.status}
                      </span>
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
                <strong className="text-slate-800 font-bold">{totalEntries}</strong> total entries
              </span>
            ) : (
              <span>No entries to display</span>
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
