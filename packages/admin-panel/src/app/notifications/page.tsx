"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Bell, 
  Send, 
  Target, 
  FileText,
  Mail,
  AlertOctagon,
  Megaphone,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

interface AlertItem {
  id: string;
  date: string;
  type: string;
  subject: string;
  target: string;
  status: string;
}

export default function NotificationsCenter() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState("all");
  const [alertType, setAlertType] = useState("announcement");
  const [history, setHistory] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadHistory = () => {
    fetch(`${API_URL}/admin/notifications`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHistory(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load notifications:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      alert("Please provide both a subject and a message payload.");
      return;
    }

    setSubmitting(true);
    const target = targetType === "all" ? "Everyone" : targetType === "free" ? "Free Tier" : targetType === "pro" ? "Pro Plan" : "Selected Merchants";
    const typeStr = alertType.charAt(0).toUpperCase() + alertType.slice(1);

    try {
      await fetch(`${API_URL}/admin/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: typeStr,
          subject,
          target,
          status: "active",
        }),
        credentials: "include",
      });

      setSubject("");
      setMessage("");
      loadHistory();
    } catch (err) {
      console.error(err);
      alert("Failed to send broadcast notification.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered broadcasts
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.subject.toLowerCase().includes(query) ||
        item.target.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query);

      const matchesType =
        filterType === "ALL" ||
        item.type.toLowerCase() === filterType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [history, searchQuery, filterType]);

  // Pagination calculation
  const totalEntries = filteredHistory.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Platform Notifications Center</h1>
        <p className="text-sm text-slate-500 mt-1">
          Dispatch urgent maintenance alerts, compose dashboard banners, or broadcast target announcements to active merchant tiers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dispatch Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Megaphone className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Compose New Broadcast</h3>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Audience</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="w-full border border-slate-200 rounded-lg py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none bg-slate-50/50"
              >
                <option value="all">Everyone (All Merchants)</option>
                <option value="free">Free Tier Stores</option>
                <option value="pro">Pro Plan Stores</option>
                <option value="enterprise">Enterprise Tier</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Channel / Alert Type</label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="w-full border border-slate-200 rounded-lg py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none bg-slate-50/50"
              >
                <option value="announcement">Dashboard Announcement Card</option>
                <option value="banner">Global Header Banner</option>
                <option value="email">Email Broadcast Blast</option>
                <option value="alert">Critical System Alert</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Alert Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Scheduled Maintenance Notice"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-slate-200 rounded-lg py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none bg-slate-50/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Message Payload</label>
              <textarea
                rows={4}
                required
                placeholder="Enter the broadcast payload here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none bg-slate-50/50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Broadcast Notice
            </button>
          </form>
        </div>

        {/* Broadcast History Feed */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden lg:col-span-2 space-y-0 flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Broadcast History Feed</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {history.length} Total Alerts Broadcasted
              </span>
            </div>

            {/* Filter controls */}
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search subject or audience..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="ALL">All Channels</option>
                <option value="Announcement">Announcement</option>
                <option value="Banner">Banner</option>
                <option value="Alert">Critical Alert</option>
                <option value="Email">Email Blast</option>
              </select>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="p-5 animate-pulse space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                  </div>
                ))
              ) : paginatedHistory.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 font-medium">
                  No broadcast history records match your search criteria.
                </div>
              ) : (
                paginatedHistory.map((alertItem) => (
                  <div key={alertItem.id} className="p-5 hover:bg-slate-50/50 transition-colors space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">{alertItem.subject}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          alertItem.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                          {alertItem.status}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{alertItem.date}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <span>Channel: <strong className="text-slate-700 font-bold">{alertItem.type}</strong></span>
                      <span>Audience: <strong className="text-indigo-650 font-bold">{alertItem.target}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Pagination Controls & Entry Counter */}
          <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              {totalEntries > 0 ? (
                <span>
                  Showing <strong className="text-slate-800 font-bold">{startIndex + 1}</strong> to{" "}
                  <strong className="text-slate-800 font-bold">{endIndex}</strong> of{" "}
                  <strong className="text-slate-800 font-bold">{totalEntries}</strong> alert broadcasts
                </span>
              ) : (
                <span>No alerts to display</span>
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
    </div>
  );
}
