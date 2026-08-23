"use client";

import React, { useState, useEffect } from "react";
import { 
  Layers, 
  RefreshCcw, 
  Play, 
  Trash, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

interface QueueJob {
  id: string;
  name: string;
  merchant: string;
  type: string;
  retries: number;
  status: string;
  time: string;
}

export default function QueueMonitor() {
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = () => {
    fetch(`${API_URL}/admin/queue-jobs`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setJobs(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load queue jobs:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleRetryJob = async (id: string) => {
    await fetch(`${API_URL}/admin/queue-jobs/${id}/retry`, { method: "POST", credentials: "include" });
    alert(`Enqueued job ${id} for retry execution!`);
    loadJobs();
  };

  const handleCancelJob = async (id: string) => {
    await fetch(`${API_URL}/admin/queue-jobs/${id}`, { method: "DELETE", credentials: "include" });
    loadJobs();
  };

  return (
    <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Background Jobs Queue Monitor</h1>
          <p className="text-sm text-slate-500 mt-1">
            Supervise platform message broker processing pipelines, dead letter queues, and trigger job execution retries.
          </p>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Running Jobs</label>
            <div className="text-xl font-bold text-indigo-600 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
              {jobs.filter(j => j.status === "running").length}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Pending Queued</label>
            <div className="text-xl font-bold text-slate-700 flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              {jobs.filter(j => j.status === "pending").length}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Completed</label>
            <div className="text-xl font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              {jobs.filter(j => j.status === "completed").length}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Failed Jobs</label>
            <div className="text-xl font-bold text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {jobs.filter(j => j.status === "failed").length}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Dead Letters</label>
            <div className="text-xl font-bold text-rose-600 flex items-center gap-1">
              <XCircle className="w-4 h-4 text-rose-500" />
              {jobs.filter(j => j.status === "dead").length}
            </div>
          </div>
        </div>

        {/* Pipeline Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Queue Pipelines</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Store Name</th>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">Retries</th>
                  <th className="py-3 px-6">Time</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-500">#{j.id}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{j.name}</td>
                    <td className="py-4 px-6 font-medium text-slate-650">{j.merchant}</td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-[9px] px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                        {j.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold">{j.retries}</td>
                    <td className="py-4 px-6 text-slate-450">{j.time}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        j.status === "running"
                          ? "bg-indigo-50 text-indigo-700 animate-pulse border border-indigo-100"
                          : j.status === "pending"
                            ? "bg-slate-50 text-slate-500 border border-slate-200"
                            : j.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : j.status === "failed"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right shrink-0">
                      <div className="flex items-center justify-end gap-1.5">
                        {(j.status === "failed" || j.status === "dead") && (
                          <button
                            onClick={() => handleRetryJob(j.id)}
                            className="p-1 hover:bg-slate-100 text-indigo-600 rounded"
                            title="Retry execution"
                          >
                            <RefreshCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleCancelJob(j.id)}
                          className="p-1 hover:bg-red-50 text-slate-350 hover:text-red-650 rounded"
                          title="Purge job"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
  );
}
