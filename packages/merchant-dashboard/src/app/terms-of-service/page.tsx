import React from "react";
import Link from "next/link";
import { ArrowLeft, Scale, ShieldCheck, FileText, Lock } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Basecart Merchant Control Console",
  description: "Merchant User Agreement & Terms of Service for Basecart e-commerce platform.",
};

export default function MerchantTermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans antialiased">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            B
          </div>
          <span className="text-base font-bold text-slate-900">Basecart Merchant Terms of Service</span>
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
            <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 uppercase tracking-wider">
              <Scale className="h-4 w-4" /> Legal Merchant Agreement
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Basecart Merchant Terms & Conditions</h1>
            <p className="text-xs text-slate-400 font-semibold">Effective Date: August 24, 2026 • IT Act 2000 & Consumer Protection Rules Compliant</p>
          </div>

          <div className="prose prose-sm text-slate-600 max-w-none space-y-6 text-xs leading-relaxed font-medium">
            <p>
              By registering as a Merchant on Basecart, you agree to comply with all applicable e-commerce, GST, and consumer protection laws of India. Basecart provides Cloudflare-native Durable Object SQLite multi-tenant hosting, server-side price recomputation, and Web Crypto AES-256-GCM encrypted gateway integrations.
            </p>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">1. Zero Platform Fees & Direct Razorpay Settlements</h3>
              <p>Basecart charges 0% platform commission on storefront sales. All payments settled through connected Razorpay accounts flow directly to Merchant bank accounts.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">2. Merchant Responsibility for Storefront Content</h3>
              <p>Merchants are strictly responsible for product descriptions, stock accuracy, order fulfillment, refund processing, and customer dispute resolutions.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">3. Jurisdiction & Dispute Resolution</h3>
              <p>This agreement is governed by the laws of India, subject to the exclusive jurisdiction of the Courts at Ernakulam / High Court of Kerala.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
