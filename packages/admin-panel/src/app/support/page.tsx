"use client";

export const runtime = "edge";

import React, { useEffect, useState } from "react";
import ClientLayout from "../../components/ClientLayout";
import { MessageSquare, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Ticket {
  ticketId: string;
  tenantId: string;
  storeName: string;
  subject: string;
  message: string;
  status: "open" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/support/tickets`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load tickets");
      const data = await res.json();
      setTickets(data);
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

  const handleResolve = async (ticketId: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/support/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Resolve ticket request failed");
      await loadTickets();
    } catch (err) {
      console.error(err);
      alert("Error updating ticket status.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Support Ticket Center</h1>
        <p className="text-sm text-slate-500 mt-1">
          Resolve incoming merchant feature requests, bugs, and API integration inquiries.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-sm text-red-650 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Incoming operational logs</h3>
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
                  <div className="h-3 bg-slate-200 rounded w-24" />
                </div>
              </div>
            ))
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span className="font-semibold text-slate-700 text-sm">Clean Desk! No active support tickets.</span>
              <p className="text-xs text-slate-400 mt-1">All merchant requests have been fully processed.</p>
            </div>
          ) : (
            tickets.map((t) => (
              <div key={t.ticketId} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/40 transition-colors">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border capitalize tracking-wider ${
                      t.priority === "high"
                        ? "bg-red-50 text-red-750 border-red-100"
                        : t.priority === "medium"
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-slate-100 text-slate-600 border-slate-200/60"
                    }`}>
                      {t.priority} priority
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                      t.status === "open"
                        ? "bg-blue-50 text-blue-700 border-blue-100 animate-pulse"
                        : "bg-emerald-50 text-emerald-700 border-emerald-100"
                    }`}>
                      {t.status}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{t.storeName}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-850">{t.subject}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">{t.message}</p>
                  <p className="text-[10px] text-slate-400">Received {new Date(t.createdAt).toLocaleString()}</p>
                </div>

                {t.status === "open" && (
                  <button
                    onClick={() => handleResolve(t.ticketId)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-sm shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
