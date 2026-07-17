"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Send, 
  Target, 
  FileText,
  Mail,
  AlertOctagon,
  Megaphone
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

  const loadHistory = () => {
    fetch(`${API_URL}/admin/notifications`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
        }
        setLoading(false);
      })
      .catch(err => {
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

    const target = targetType === "all" ? "Everyone" : targetType === "free" ? "Free Tier" : targetType === "pro" ? "Pro Plan" : "Selected Merchants";
    const typeStr = alertType.charAt(0).toUpperCase() + alertType.slice(1);

    await fetch(`${API_URL}/admin/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: typeStr,
        subject,
        target,
        status: "active"
      }),
      credentials: "include"
    });

    setSubject("");
    setMessage("");
    alert(`Success: Broadcast notification of type '${alertType}' sent to ${target}!`);
    loadHistory();
  };

  return (
    <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Platform Notifications Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Dispatch urgent maintenance alerts, compose dashboard banners, or broadcast target announcements to active merchant tiers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Dispatch Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Compose New Broadcast</h3>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Audience</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
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
                    className="w-full border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                  >
                    <option value="announcement">Dashboard Announcement Card</option>
                    <option value="banner">Global Header Banner</option>
                    <option value="email">Email Broadcast Blast</option>
                    <option value="alert">Critical System Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Alert Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Scheduled Maintenance Notice"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Message Content</label>
                <textarea
                  rows={4}
                  placeholder="Enter the broadcast payload here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50 resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> Broadcast Notice
              </button>

            </form>
          </div>

          {/* Recent History Feed */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bell className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Broadcast History</h3>
            </div>

            <div className="space-y-4">
              {history.map((alertItem) => (
                <div key={alertItem.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/40 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold select-none">
                    <span className="text-slate-400">{alertItem.date}</span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      alertItem.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}>
                      {alertItem.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 leading-tight">{alertItem.subject}</h4>
                  
                  <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                    <span>Type: {alertItem.type}</span>
                    <span>To: {alertItem.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
  );
}
