"use client";

import React, { useState, useEffect } from "react";
import { 
  Key, 
  Plus, 
  Trash, 
  ShieldCheck, 
  Link2,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiKey {
  id: string;
  name: string;
  token: string;
  scopes: string[];
  rateLimit: string;
  status: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  event: string;
  status: string;
}

export default function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const loadKeys = () => {
    fetch(`${API_URL}/admin/api-keys`, { credentials: "include" })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setKeys(data); });
  };

  const loadWebhooks = () => {
    fetch(`${API_URL}/admin/webhooks`, { credentials: "include" })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setWebhooks(data); });
  };

  useEffect(() => {
    loadKeys();
    loadWebhooks();
  }, []);

  const toggleTokenVisibility = (id: string) => {
    setShowTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);

  const [keyForm, setKeyForm] = useState({ name: "", rateLimit: "100 req/min" });
  const [webhookForm, setWebhookForm] = useState({ name: "", url: "", event: "order.created" });

  const handleRevokeKey = async (id: string) => {
    await fetch(`${API_URL}/admin/api-keys/${id}`, { method: "DELETE", credentials: "include" });
    loadKeys();
  };

  const handleRevokeWebhook = async (id: string) => {
    await fetch(`${API_URL}/admin/webhooks/${id}`, { method: "DELETE", credentials: "include" });
    loadWebhooks();
  };

  const submitKeyModal = async () => {
    if (!keyForm.name.trim()) return;
    await fetch(`${API_URL}/admin/api-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: keyForm.name, scopes: ["read:merchants"], rateLimit: keyForm.rateLimit }),
      credentials: "include"
    });
    setKeyForm({ name: "", rateLimit: "100 req/min" });
    setShowKeyModal(false);
    loadKeys();
  };

  const submitWebhookModal = async () => {
    if (!webhookForm.name.trim() || !webhookForm.url.trim()) return;
    await fetch(`${API_URL}/admin/webhooks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: webhookForm.name, url: webhookForm.url, event: webhookForm.event }),
      credentials: "include"
    });
    setWebhookForm({ name: "", url: "", event: "order.created" });
    setShowWebhookModal(false);
    loadWebhooks();
  };

  return (
    <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">API Keys & Webhooks Manager</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure developer client tokens, delegate authorization scopes, establish global rate limits, and audit active webhook receivers.
          </p>
        </div>

        {/* API Keys Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4.5 h-4.5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Client API Keys</h2>
            </div>
            <button 
              onClick={() => setShowKeyModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Generate Key
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">API Token (Key)</th>
                  <th className="py-3 px-6">Scopes</th>
                  <th className="py-3 px-6">Rate Limit</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">{k.name}</td>
                    <td className="py-4 px-6 font-mono">
                      <div className="flex items-center gap-2">
                        <span>{showTokens[k.id] ? k.token : `${k.token.substring(0, 12)}••••••••••••`}</span>
                        <button 
                          onClick={() => toggleTokenVisibility(k.id)}
                          className="text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showTokens[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {k.scopes.map(s => (
                          <span key={s} className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-slate-100 text-slate-500 border border-slate-200/80">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-500">{k.rateLimit}</td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleRevokeKey(k.id)}
                        className="px-2.5 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-50 border border-rose-100 rounded"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Webhooks Section */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-4.5 h-4.5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Outgoing Webhooks</h2>
            </div>
            <button 
              onClick={() => setShowWebhookModal(true)}
              className="px-3 py-1.5 border border-slate-200 text-slate-850 hover:bg-slate-50 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Webhook
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {webhooks.map((wh) => (
              <div key={wh.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800">{wh.name}</h4>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200/80">
                      {wh.event}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono font-semibold truncate max-w-lg">{wh.url}</p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold select-none uppercase ${
                    wh.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}>
                    {wh.status}
                  </span>
                  <button 
                    onClick={() => handleRevokeWebhook(wh.id)}
                    className="p-1 text-slate-350 hover:text-rose-600 hover:bg-rose-50 rounded"
                    title="Delete webhook"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Create API Key */}
        {showKeyModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Generate Client API Key</h3>
              <div className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="text-slate-500 block mb-1">Description / Client Name</label>
                  <input
                    type="text"
                    value={keyForm.name}
                    onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })}
                    placeholder="e.g. ERP Integration Service"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Rate Limit</label>
                  <select
                    value={keyForm.rateLimit}
                    onChange={(e) => setKeyForm({ ...keyForm, rateLimit: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-slate-50"
                  >
                    <option value="60 req/min">60 req/min (Standard)</option>
                    <option value="100 req/min">100 req/min (Elevated)</option>
                    <option value="500 req/min">500 req/min (Enterprise)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowKeyModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                <button onClick={submitKeyModal} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">Generate Token</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Webhook */}
        {showWebhookModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Outgoing Webhook</h3>
              <div className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="text-slate-500 block mb-1">Webhook Name</label>
                  <input
                    type="text"
                    value={webhookForm.name}
                    onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                    placeholder="e.g. Order Dispatch Webhook"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Target Endpoint URL</label>
                  <input
                    type="url"
                    value={webhookForm.url}
                    onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                    placeholder="https://api.mycompany.com/webhooks/orders"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Trigger Event</label>
                  <select
                    value={webhookForm.event}
                    onChange={(e) => setWebhookForm({ ...webhookForm, event: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-slate-50"
                  >
                    <option value="order.created">order.created</option>
                    <option value="order.fulfilled">order.fulfilled</option>
                    <option value="inventory.low">inventory.low</option>
                    <option value="merchant.signup">merchant.signup</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowWebhookModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                <button onClick={submitWebhookModal} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">Add Receiver</button>
              </div>
            </div>
          </div>
        )}

      </div>
  );
}
