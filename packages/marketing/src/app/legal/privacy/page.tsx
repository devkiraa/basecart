import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, ShieldCheck, Lock, Database, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy & DPDP Act 2023 Compliance — Basecart",
  description: "Basecart Privacy Policy detailing Personal Data processing, Data Fiduciary obligations, and Web Crypto AES-256-GCM encryption under DPDP Act 2023.",
  alternates: {
    canonical: "https://basecart.app/legal/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans antialiased selection:bg-blue-50 selection:text-blue-600">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <Link 
          href="/"
          className="flex items-center gap-2.5 select-none"
        >
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <ShoppingBag className="h-4.5 w-4.5" />
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight">basecart</span>
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
            DPDP Act 2023 Compliant
          </span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors select-none"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Basecart
        </Link>
      </header>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 lg:p-14 shadow-xs space-y-10">
          
          <div className="border-b border-slate-100 pb-8 space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-600 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" /> Data Protection & Privacy Rights
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Basecart Platform Privacy Policy</h1>
            <p className="text-xs text-slate-500 font-semibold pt-1">
              Effective Date: August 24, 2026 • Compliant with Digital Personal Data Protection Act, 2023 (DPDP Act, India) & IT Rules
            </p>
          </div>

          <div className="prose prose-sm text-slate-650 max-w-none space-y-8 leading-relaxed text-sm font-medium">
            
            <p>
              Basecart Inc. (&quot;<strong>Basecart</strong>&quot;, &quot;<strong>We</strong>&quot;, &quot;<strong>Us</strong>&quot;, or &quot;<strong>Our</strong>&quot;) is committed to protecting the privacy and security of Personal Data collected from Merchant owners and storefront end-customers. This Privacy Policy details our data collection, processing, encryption, and Data Principal rights under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act, India)</strong> and applicable global data privacy regulations.
            </p>

            <hr className="border-slate-100 my-6" />

            <div className="space-y-3">
              <h2 className="text-base lg:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Database className="h-4.5 w-4.5 text-blue-600" /> 1. Data Fiduciary & Data Processor Roles
              </h2>
              <p>
                Under the DPDP Act 2023:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong>Basecart as Data Fiduciary:</strong> For Merchant Account registration details (Merchant Name, GSTIN, Email, Phone, Subscription History), Basecart determines the purpose of processing and acts as Data Fiduciary.</li>
                <li><strong>Basecart as Data Processor:</strong> For Customer Order Data (end-customer delivery names, addresses, shopping carts) collected on Merchant storefronts (`subdomain.basecart.app`), the Merchant acts as Data Fiduciary and Basecart acts strictly as Data Processor executing per-tenant Durable Object storage operations.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-base lg:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Eye className="h-4.5 w-4.5 text-blue-600" /> 2. Personal Data We Collect & Purpose
              </h2>
              <p>
                We collect and process only the minimal Personal Data necessary to operate your storefront and merchant services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong>Merchant Account Data:</strong> Full Legal Name, Email Address, Business Address, Phone Number, GSTIN/PAN for legal invoicing.</li>
                <li><strong>Payment Gateway Credentials:</strong> Merchant Razorpay Key ID & Key Secret, which are encrypted at rest using AES-256-GCM Web Crypto helpers before database persistence.</li>
                <li><strong>Storefront Checkout Data:</strong> End-customer Name, Delivery Address, Phone Number (for WhatsApp dispatch notifications & Shiprocket AWBs), and Order Line Items.</li>
                <li><strong>Technical Session Logs:</strong> Masked IP Address, browser type, and request tracing IDs (`X-Request-ID`).</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-base lg:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-4.5 w-4.5 text-blue-600" /> 3. Data Protection Rights of Data Principals
              </h2>
              <p>
                Under Section 11–14 of the DPDP Act 2023, Data Principals (Merchants and End-Customers) possess the following statutory rights:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong>Right to Access Summary:</strong> Request a summary of Personal Data being processed by Basecart.</li>
                <li><strong>Right to Correction & Complete Update:</strong> Correct, update, or complete inaccurate Personal Data.</li>
                <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request full deletion of Personal Data and tenant Durable Object storage unless retention is mandated by tax or legal statutes (e.g. GST invoice retention rules).</li>
                <li><strong>Right to Withdraw Consent:</strong> Revoke consent for optional communications or marketing alerts at any time.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-base lg:text-lg font-bold text-slate-900">4. Authorized Sub-Processors & Data Transfer</h2>
              <p>
                Basecart does not sell, rent, or trade Personal Data to data brokers or third-party ad networks. Data is shared exclusively with audited infrastructure sub-processors:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong>Cloudflare Inc.</strong> (Global Edge Network, Workers Compute, D1 Central Registry & Per-Tenant Durable Objects).</li>
                <li><strong>Razorpay Software Pvt. Ltd.</strong> (Encrypted Payment Gateway Verification & Direct Settlement).</li>
                <li><strong>Shiprocket / Delhivery</strong> (Merchant-initiated Logistics & Doorstep AWB Dispatch).</li>
                <li><strong>Resend API</strong> (Transactional Email Verification & Order Confirmation Receipts).</li>
              </ul>
            </div>

            <div className="space-y-3 p-5 bg-emerald-50/60 border border-emerald-200/90 rounded-2xl">
              <h2 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">Data Protection Officer (DPO) & Grievance Mechanism</h2>
              <p className="text-xs text-emerald-900 font-medium">
                Pursuant to Section 10 of DPDP Act 2023 & Section 79 of Information Technology Act 2000:
              </p>
              <div className="text-xs text-slate-800 font-bold space-y-0.5 pt-1">
                <div>Data Protection Officer: Chief Data Privacy Desk</div>
                <div>Basecart SaaS Platform • Kochi, Kerala, India</div>
                <div>Official DPO Email: <a href="mailto:dpo@basecart.app" className="text-emerald-700 underline">dpo@basecart.app</a></div>
                <div className="text-[10px] text-slate-500 font-semibold">Response SLA for Data Requests: Within 48 hours • Statutory Resolution: 30 days</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500 select-none">
        <p>© {new Date().getFullYear()} Basecart Inc. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2 font-bold text-slate-600">
          <Link href="/legal/terms" className="hover:text-blue-600 underline">Terms of Service</Link>
          <Link href="/legal/privacy" className="hover:text-blue-600 underline">Privacy Policy</Link>
        </div>
      </footer>

    </div>
  );
}
