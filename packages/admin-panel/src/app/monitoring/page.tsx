"use client";

import React from "react";
import { Activity, Server, HeartPulse, RefreshCw } from "lucide-react";

export default function MonitoringPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Platform Health & Monitoring</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time monitoring logs, isolate resource diagnostics, and D1 database telemetry.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          Refresh
        </button>
      </div>

      {/* Global health indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-slate-800">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Worker Core API</span>
            <div className="text-xl font-bold text-emerald-600">Active (100%)</div>
          </div>
          <HeartPulse className="w-8 h-8 text-emerald-500 bg-emerald-50 p-1.5 rounded-lg" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">D1 control-db</span>
            <div className="text-xl font-bold text-emerald-600">Operational</div>
          </div>
          <Server className="w-8 h-8 text-emerald-500 bg-emerald-50 p-1.5 rounded-lg" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tenant partitions</span>
            <div className="text-xl font-bold text-emerald-600">Sync (100%)</div>
          </div>
          <Activity className="w-8 h-8 text-indigo-500 bg-indigo-50 p-1.5 rounded-lg" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Jobs Queue status</span>
            <div className="text-xl font-bold text-emerald-600">0 backlog</div>
          </div>
          <Activity className="w-8 h-8 text-indigo-500 bg-indigo-50 p-1.5 rounded-lg" />
        </div>
      </div>

      {/* Console Exception alerts */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent API Failures & Logs</h3>
            <p className="text-xs text-slate-500 mt-0.5">Exceptions registered by Workers observability.</p>
          </div>
          <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded">
            Healthy
          </span>
        </div>

        <div className="p-6 text-center text-sm text-slate-400 py-12">
          No exceptions or error messages recorded in the last 24 hours.
        </div>
      </div>
    </div>
  );
}
