"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  ShoppingCart, 
  TrendingUp, 
  RefreshCcw, 
  AlertTriangle, 
  ShieldX,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Truck,
  Ban,
  Building2,
  Users,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Order {
  id: string;
  merchant: string;
  subdomain?: string;
  date: string;
  rawDate?: string;
  customer: string;
  customerEmail?: string;
  amount: number;
  status: string;
  gateway: string;
  country: string;
  state: string;
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

export default function OrdersOverview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Table controls state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterGateway, setFilterGateway] = useState("ALL");
  const [filterState, setFilterState] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<"date" | "amount" | "merchant">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetch(`${API_URL}/admin/orders`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load orders:", err);
        setLoading(false);
      });
  }, []);

  // Filtered and sorted live orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          order.id.toLowerCase().includes(query) ||
          order.merchant.toLowerCase().includes(query) ||
          order.customer.toLowerCase().includes(query) ||
          (order.customerEmail && order.customerEmail.toLowerCase().includes(query));

        const matchesStatus =
          filterStatus === "ALL" ||
          order.status.toLowerCase() === filterStatus.toLowerCase();

        const matchesGateway =
          filterGateway === "ALL" ||
          order.gateway.toLowerCase().includes(filterGateway.toLowerCase());

        const matchesState =
          filterState === "ALL" || order.state === filterState;

        return matchesSearch && matchesStatus && matchesGateway && matchesState;
      })
      .sort((a, b) => {
        let compA = a[sortField];
        let compB = b[sortField];

        if (sortField === "date") {
          compA = a.rawDate || a.date;
          compB = b.rawDate || b.date;
        }

        if (typeof compA === "string") compA = compA.toLowerCase();
        if (typeof compB === "string") compB = compB.toLowerCase();

        if (compA < compB) return sortDirection === "asc" ? -1 : 1;
        if (compA > compB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [orders, searchQuery, filterStatus, filterGateway, filterState, sortField, sortDirection]);

  // Reset to page 1 when controls change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterGateway, filterState, pageSize]);

  // Pagination calculation
  const totalEntries = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Financial KPIs (calculated exclusively on live account orders)
  const gmv = orders.reduce((acc, curr) => (curr.status !== "cancelled" && curr.status !== "failed" ? acc + curr.amount : acc), 0);
  const completedOrdersCount = orders.filter((o) => o.status === "completed" || o.status === "paid" || o.status === "delivered" || o.status === "shipped").length;
  const avgOrderValue = completedOrdersCount > 0 ? gmv / completedOrdersCount : 0;
  const activeStoresCount = new Set(orders.map((o) => o.merchant)).size;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const metrics = [
    { name: "Live Platform GMV", value: formatCurrency(gmv), icon: TrendingUp, color: "bg-emerald-50 text-emerald-700" },
    { name: "Live Orders Placed", value: `${orders.length} orders`, icon: ShoppingBag, color: "bg-blue-50 text-blue-700" },
    { name: "Average Order Value", value: formatCurrency(avgOrderValue), icon: RefreshCcw, color: "bg-indigo-50 text-indigo-700" },
    { name: "Live Stores Trading", value: `${activeStoresCount} merchants`, icon: Building2, color: "bg-amber-50 text-amber-700" },
  ];

  const toggleSort = (field: "date" | "amount" | "merchant") => {
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
        <h1 className="text-2xl font-bold text-slate-800">Platform Orders Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor real customer transaction feeds, track live store order flows, filter regions, and audit platform checkouts.
        </p>
      </div>

      {/* Live Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.name} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.name}</span>
                <div className={`p-2 rounded-lg ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-800">{m.value}</div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Search & Filter Criteria</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase">
            Live Merchant Accounts Only
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Box */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Order ID, store, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full bg-white border border-slate-200 rounded-lg py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="completed">Completed / Paid</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Payment Gateway Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Payment Method</label>
            <select
              value={filterGateway}
              onChange={(e) => setFilterGateway(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="Razorpay">Razorpay Online</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
            </select>
          </div>

          {/* Region State Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">State Served</label>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Regions</option>
              <option value="Kerala">Kerala</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Maharashtra">Maharashtra</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Live Customer Transaction Stream</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real orders placed on active merchant store subdomains.</p>
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 select-none">
                <th className="py-3.5 px-6">Order ID</th>
                <th
                  onClick={() => toggleSort("merchant")}
                  className="py-3.5 px-6 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    Merchant Store
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("date")}
                  className="py-3.5 px-6 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    Date
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-6">Customer</th>
                <th
                  onClick={() => toggleSort("amount")}
                  className="py-3.5 px-6 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    Total Amount
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-6">Gateway</th>
                <th className="py-3.5 px-6">State</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                    <td className="py-4 px-6"><div className="h-6 bg-slate-200 rounded w-16" /></td>
                  </tr>
                ))
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-6 text-center text-slate-400 font-medium">
                    No live store transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-indigo-600">
                      <div>{order.id}</div>
                      {order.originContext && (
                        <div className="mt-1 space-y-1 font-sans text-[10px] bg-indigo-50/70 border border-indigo-100 rounded-lg p-2 max-w-xs">
                          <div className="font-bold text-indigo-900 truncate" title={order.originContext.originUrl}>
                            Origin: {order.originContext.originUrl || "Deep Link"}
                          </div>
                          <div className="flex flex-wrap gap-1 font-mono text-[9px]">
                            {order.originContext.sectionId && (
                              <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">
                                sectionId: {order.originContext.sectionId}
                              </span>
                            )}
                            {order.originContext.unitId && (
                              <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                                unitId: {order.originContext.unitId}
                              </span>
                            )}
                            {order.originContext.lessonId && (
                              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                                lessonId: {order.originContext.lessonId}
                              </span>
                            )}
                            {order.originContext.adaptiveId && (
                              <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">
                                adaptiveId: {order.originContext.adaptiveId}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
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
                      {order.customerEmail && (
                        <div className="text-[10px] text-slate-400">{order.customerEmail}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">{formatCurrency(order.amount)}</td>
                    <td className="py-4 px-6 font-semibold text-slate-500">{order.gateway}</td>
                    <td className="py-4 px-6">{order.state}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        order.status === "completed" || order.status === "paid" || order.status === "delivered"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : order.status === "shipped"
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : order.status === "pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        {order.status}
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
                <strong className="text-slate-800 font-bold">{totalEntries}</strong> live transaction records
              </span>
            ) : (
              <span>No live order entries to display</span>
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
