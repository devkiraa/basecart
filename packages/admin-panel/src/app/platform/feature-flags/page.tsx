"use client";

import React, { useState, useEffect } from "react";
import { 
  ToggleLeft, 
  ToggleRight, 
  HelpCircle, 
  Settings2,
  Lock,
  Globe
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

interface FeatureFlag {
  key: string;
  name: string;
  desc: string;
  active: boolean;
  target: string;
}

export default function FeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFlags = () => {
    fetch(`${API_URL}/admin/feature-flags`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFlags(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load feature flags:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleToggleFlag = async (key: string) => {
    const flag = flags.find(f => f.key === key);
    if (!flag) return;
    const newActive = !flag.active;

    await fetch(`${API_URL}/admin/feature-flags/${key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: newActive }),
      credentials: "include"
    });
    loadFlags();
  };

  return (
    <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Feature Flags Console</h1>
          <p className="text-sm text-slate-500 mt-1">
            Activate or suspend platform capabilities, roll out beta themes, and manage customer experiences globally.
          </p>
        </div>

        {/* Flags Registry */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4.5 h-4.5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Dynamic Feature Toggles</h2>
            </div>
            <span className="text-xs text-slate-450 font-semibold">{flags.filter(f => f.active).length} enabled</span>
          </div>

          <div className="divide-y divide-slate-100">
            {flags.map((flag) => (
              <div key={flag.key} className="p-6 flex items-start justify-between gap-6 hover:bg-slate-50/40 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">{flag.name}</h3>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded">
                      {flag.key}
                    </span>
                  </div>
                  <p className="text-xs text-slate-450 font-semibold max-w-2xl leading-relaxed">{flag.desc}</p>
                  
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none pt-1">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" /> Target: {flag.target}
                    </span>
                  </div>
                </div>

                {/* Switch Toggle Button */}
                <button
                  onClick={() => handleToggleFlag(flag.key)}
                  className="focus:outline-none shrink-0"
                  title={flag.active ? "Disable flag" : "Enable flag"}
                >
                  {flag.active ? (
                    <ToggleRight className="w-12 h-8 text-indigo-600 transition-all active:scale-95 cursor-pointer" />
                  ) : (
                    <ToggleLeft className="w-12 h-8 text-slate-350 hover:text-slate-450 transition-all active:scale-95 cursor-pointer" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
  );
}
