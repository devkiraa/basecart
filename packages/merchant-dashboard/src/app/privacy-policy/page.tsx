import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Database } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Basecart Merchant Control Console",
  description: "Privacy Policy & DPDP Act 2023 compliance for Basecart Merchant accounts.",
};

export default function MerchantPrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans antialiased">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
            B
          </div>
          <span className="text-base font-bold text-slate-900">Basecart Privacy Policy & DPDP Act Compliance</span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 lg:p-12 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6 space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-600 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" /> DPDP Act 2023 Compliant
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Basecart Data Privacy & Security Terms</h1>
            <p className="text-xs text-slate-400 font-semibold">Effective Date: August 24, 2026 • Digital Personal Data Protection Act, 2023</p>
          </div>

          <div className="prose prose-sm text-slate-600 max-w-none space-y-6 text-xs leading-relaxed font-medium">
            <p>
              Basecart processes merchant personal data and customer orders strictly in accordance with India&apos;s Digital Personal Data Protection Act, 2023 (DPDP Act).
            </p>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">1. Data Fiduciary vs Data Processor Roles</h3>
              <p>Basecart acts as Data Fiduciary for merchant registration details and Data Processor for storefront customer order records stored in tenant Durable Objects.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">2. Encryption at Rest & Security</h3>
              <p>Razorpay API credentials and sensitive tokens are encrypted using Web Crypto AES-256-GCM. Merchant data is never mined or shared with ad networks.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">3. Data Protection Officer</h3>
              <p>Official DPO Contact: <a href="mailto:dpo@basecart.app" className="text-emerald-600 underline">dpo@basecart.app</a> (Response SLA: 48 hours).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
