"use client";

import React, { useState } from "react";
import RazorpayCheckoutButton from "../../components/RazorpayCheckoutButton";

export default function CheckoutDemoPage() {
  const [customAmount, setCustomAmount] = useState<number>(10);
  const [paymentLog, setPaymentLog] = useState<Array<string>>([]);

  const addLog = (msg: string) => {
    setPaymentLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-xl border border-emerald-500/20">
            ₹
          </div>
          <h1 className="text-2xl font-bold text-white">Razorpay Standard Checkout</h1>
          <p className="text-sm text-slate-400">
            Test 1-Click Razorpay Web Checkout Integration
          </p>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Payment Amount (INR ₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-medium">₹</span>
              <input
                type="number"
                min="1"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value) || 1)}
                className="w-full pl-8 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Minimum: ₹1 (100 paise)
            </p>
          </div>

          <RazorpayCheckoutButton
            amount={customAmount}
            buttonText="Pay Now with Razorpay"
            onSuccess={(data) => {
              addLog(`SUCCESS: Payment Verified! Order ID: ${data.orderId}, Payment ID: ${data.paymentId}`);
            }}
            onError={(err) => {
              addLog(`ERROR: ${err}`);
            }}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          />
        </div>

        {paymentLog.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Activity Log
            </h2>
            <div className="bg-black/60 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 max-h-40 overflow-y-auto space-y-1">
              {paymentLog.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
