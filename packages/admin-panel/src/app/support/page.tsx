"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  MessageSquare, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Clock, 
  AlertTriangle, 
  Tag,
  Building2,
  X,
  Sparkles,
  MessageCircle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

interface Ticket {
  ticketId: string;
  tenantId: string;
  storeName: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  category?: string;
  response?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Merchant {
  tenantId: string;
  storeName: string;
  subdomain: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Table controls state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Ticket Detail & Reply Modal state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<"open" | "in_progress" | "resolved" | "closed">("resolved");
  const [submittingReply, setSubmittingReply] = useState(false);

  // New Ticket Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTenantId, setNewTenantId] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newCategory, setNewCategory] = useState("general");
  const [creatingTicket, setCreatingTicket] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const [ticketsRes, merchantsRes] = await Promise.all([
        fetch(`${API_URL}/admin/support/tickets`, { credentials: "include" }),
        fetch(`${API_URL}/admin/merchants`, { credentials: "include" }),
      ]);

      if (ticketsRes.ok) {
        const tData = await ticketsRes.json();
        setTickets(Array.isArray(tData) ? tData : []);
      }
      if (merchantsRes.ok) {
        const mData = await merchantsRes.json();
        setMerchants(Array.isArray(mData) ? mData : []);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to retrieve support tickets registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        t.ticketId.toLowerCase().includes(query) ||
        t.storeName.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        t.message.toLowerCase().includes(query);

      const matchesStatus =
        filterStatus === "ALL" || t.status === filterStatus;

      const matchesPriority =
        filterPriority === "ALL" || t.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchQuery, filterStatus, filterPriority]);

  // Reset page number on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterPriority, pageSize]);

  // Pagination calculations
  const totalEntries = filteredTickets.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  // Summary Metrics
  const openCount = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const highPriorityCount = tickets.filter((t) => t.priority === "high" && t.status !== "resolved" && t.status !== "closed").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  const handleOpenTicketDetails = (t: Ticket) => {
    setSelectedTicket(t);
    setReplyText(t.response || "");
    setReplyStatus(t.status === "open" ? "resolved" : t.status);
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setSubmittingReply(true);
    try {
      const res = await fetch(`${API_URL}/admin/support/tickets/${selectedTicket.ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: replyStatus,
          response: replyText,
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update support ticket.");
      setSelectedTicket(null);
      await loadTickets();
    } catch (err) {
      console.error(err);
      alert("Error saving support ticket response.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantId || !newSubject || !newMessage) return;

    const selectedStore = merchants.find((m) => m.tenantId === newTenantId);
    const storeName = selectedStore ? selectedStore.storeName : "Merchant Store";

    setCreatingTicket(true);
    try {
      const res = await fetch(`${API_URL}/admin/support/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: newTenantId,
          storeName,
          subject: newSubject,
          message: newMessage,
          priority: newPriority,
          category: newCategory,
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create ticket.");
      setShowCreateModal(false);
      setNewTenantId("");
      setNewSubject("");
      setNewMessage("");
      await loadTickets();
    } catch (err) {
      console.error(err);
      alert("Error logging support ticket.");
    } finally {
      setCreatingTicket(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Support Ticket Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Resolve incoming merchant inquiries, send official replies, track API issues, and manage platform tickets.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Log Support Ticket
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-sm text-red-650 rounded-xl">
          {error}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tickets</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{tickets.length}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Inquiries</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{openCount}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Priority Urgent</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-700">{highPriorityCount}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolved Tickets</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{resolvedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Search & Filter Support Registry</span>
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
          {/* Search Box */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ticket ID, store, or query..."
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
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Support Inquiries</h3>
          <MessageSquare className="w-5 h-5 text-slate-400" />
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/40 transition-colors animate-pulse">
                <div className="space-y-2.5 max-w-2xl w-full">
                  <div className="flex items-center gap-2">
                    <div className="h-5 bg-slate-200 rounded w-20" />
                    <div className="h-5 bg-slate-200 rounded w-16" />
                    <div className="h-4 bg-slate-200 rounded w-28" />
                  </div>
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-10 bg-slate-100 border border-slate-200/50 rounded-lg p-2.5 w-full" />
                </div>
              </div>
            ))
          ) : paginatedTickets.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span className="font-semibold text-slate-700 text-sm">No support tickets match the selected filters.</span>
            </div>
          ) : (
            paginatedTickets.map((t) => (
              <div key={t.ticketId} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/40 transition-colors">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400">{t.ticketId}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                      t.priority === "high"
                        ? "bg-rose-50 text-rose-700 border border-rose-100"
                        : t.priority === "medium"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {t.priority}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      t.status === "open"
                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                        : t.status === "in_progress"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}>
                      {t.status.replace("_", " ")}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{t.storeName}</span>
                    {t.category && (
                      <span className="px-2 py-0.5 text-[9px] font-semibold text-slate-500 bg-slate-100 rounded border border-slate-200">
                        {t.category}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-850">{t.subject}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{t.message}</p>

                  {t.response && (
                    <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-indigo-900 flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-indigo-600" /> Admin Response
                      </div>
                      <p className="text-indigo-800">{t.response}</p>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400">
                    Logged {new Date(t.createdAt).toLocaleString()}
                    {t.updatedAt && ` • Updated ${new Date(t.updatedAt).toLocaleString()}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleOpenTicketDetails(t)}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    {t.response ? "Edit Response" : "Respond"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Pagination Controls & Entry Counter */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            {totalEntries > 0 ? (
              <span>
                Showing <strong className="text-slate-800 font-bold">{startIndex + 1}</strong> to{" "}
                <strong className="text-slate-800 font-bold">{endIndex}</strong> of{" "}
                <strong className="text-slate-800 font-bold">{totalEntries}</strong> support tickets
              </span>
            ) : (
              <span>No tickets to display</span>
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

      {/* Ticket Details & Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-5 border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedTicket.storeName} • {selectedTicket.ticketId}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Merchant Inquiry</span>
                <p className="text-slate-700 text-xs leading-relaxed">{selectedTicket.message}</p>
              </div>

              <form onSubmit={handleSaveReply} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Priority</label>
                    <span className="capitalize px-3 py-2 bg-slate-100 rounded-lg text-xs font-bold block text-slate-700 border border-slate-200">
                      {selectedTicket.priority} Priority
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Admin Response Message</label>
                  <textarea
                    rows={4}
                    placeholder="Type official admin response..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReply}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    {submittingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Save Response & Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Log New Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-base font-bold text-slate-800">Log New Support Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Merchant Store</label>
                <select
                  value={newTenantId}
                  onChange={(e) => setNewTenantId(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="">Select a merchant store...</option>
                  {merchants.map((m) => (
                    <option key={m.tenantId} value={m.tenantId}>
                      {m.storeName} ({m.subdomain}.basecart.app)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="General">General Inquiry</option>
                    <option value="Billing">Billing & Subscription</option>
                    <option value="Domain">Custom Domain & SSL</option>
                    <option value="Razorpay">Razorpay Gateway</option>
                    <option value="Shiprocket">Shiprocket Logistics</option>
                    <option value="Bug">Bug Report</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of issue..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Message Details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the inquiry or reported problem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  {creatingTicket ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
