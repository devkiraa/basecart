import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, ShieldCheck, Scale, FileText, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Merchant Terms of Service & User Agreement — Basecart",
  description: "Legally binding Terms of Service and Merchant SaaS User Agreement governing the Basecart e-commerce platform under Indian IT Act 2000 & Consumer Protection Rules 2020.",
  alternates: {
    canonical: "https://basecart.app/legal/terms",
  },
};

export default function TermsOfServicePage() {
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
          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
            Legal & Compliance
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
            <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 uppercase tracking-wider">
              <Scale className="h-4 w-4" /> Indian Law & Global SaaS Compliance
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Merchant Terms of Service & User Agreement</h1>
            <p className="text-xs text-slate-500 font-semibold pt-1">
              Effective Date: August 24, 2026 • Governed by Information Technology Act, 2000 & Consumer Protection (E-Commerce) Rules, 2020 (India)
            </p>
          </div>

          <div className="prose prose-sm text-slate-650 max-w-none space-y-8 leading-relaxed text-sm font-medium">
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 font-medium leading-relaxed">
              <strong>IMPORTANT NOTICE:</strong> Please read this User Agreement carefully before creating a Basecart account or launching a storefront. By registering for or using Basecart&apos;s software-as-a-service (SaaS) platform, merchant dashboard, Durable Object SQLite storage, or storefront services, you agree to be bound by these Terms of Service. If you do not agree, you must not access or use the platform.
            </div>

            <div className="space-y-3">
              <h2 className="text-base lg:text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-blue-600" /> 1. Platform Identity & Relationship
              </h2>
              <p>
                Basecart (&quot;<strong>Basecart</strong>&quot;, &quot;<strong>Platform</strong>&quot;, &quot;<strong>We</strong>&quot;, &quot;<strong>Us</strong>&quot;, or &quot;<strong>Our</strong>&quot;) is a Cloudflare-native headless e-commerce software-as-a-service platform designed for merchants (&quot;<strong>Merchant</strong>&quot;, &quot;<strong>User</strong>&quot;, or &quot;<strong>You</strong>&quot;). Basecart acts strictly as a technology service provider facilitating storefront hosting, catalog management, inventory control, and payment gateway integration.
              </p>
              <p>
                Basecart is not an e-commerce retailer, marketplace operator, auctioneer, or seller of record for any products, services, or physical goods offered by Merchants on their individual subdomains or custom domains.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-base lg:text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-blue-600" /> 2. Merchant Obligations & Legal Compliance
              </h2>
              <p>
                As a Merchant operating a storefront powered by Basecart in India or globally, you warrant and agree that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong>Tax Registration:</strong> You hold a valid Goods and Services Tax Identification Number (GSTIN), Permanent Account Number (PAN), or legal business registration required by your jurisdiction.</li>
                <li><strong>E-Commerce Consumer Protection:</strong> You comply with the Consumer Protection (E-Commerce) Rules, 2020, including mandatory display of business details, contact email, country of origin, return policies, and grievance officer on your storefront footer.</li>
                <li><strong>Prohibited Goods & Activities:</strong> You shall not list, sell, or advertise any illegal, counterfeit, stolen, hazardous, or restricted items under the Indian Penal Code (IPC), Narcotic Drugs and Psychotropic Substances Act (NDPS), Drugs and Cosmetics Act, or applicable laws.</li>
                <li><strong>Price Accuracy:</strong> All listed product prices must represent the actual selling price, and cart totals will be verified server-side at checkout.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-base lg:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-4.5 w-4.5 text-blue-600" /> 3. Payment Gateway Credentials & Direct Settlement
              </h2>
              <p>
                Basecart integrates directly with merchant Razorpay accounts and direct UPI/card payment gateways. You acknowledge that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong>Direct Payouts:</strong> Customer payments flow directly into your connected Razorpay merchant bank account. Basecart does not hold customer funds in escrow.</li>
                <li><strong>AES-256-GCM Web Crypto Encryption:</strong> Your Razorpay API Key ID and Key Secret are encrypted at rest using the Web Crypto API (AES-256-GCM) before database storage. Basecart employees never have plaintext access to your API keys.</li>
                <li><strong>0% Platform Commission:</strong> Basecart charges zero transaction fee or commission on your storefront orders. Standard gateway processing fees charged by Razorpay apply separately.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-base lg:text-lg font-bold text-slate-900">4. Per-Tenant Isolation & Data Ownership</h2>
              <p>
                Basecart provisions physical per-tenant Durable Objects with embedded SQLite databases (`idFromName(tenantId)`). You retain full ownership of all product catalog data, customer order records, and business assets uploaded to your tenant database.
              </p>
              <p>
                Basecart shall not sell, license, or mine your tenant database records for third-party advertising or cross-tenant analytics.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-base lg:text-lg font-bold text-slate-900">5. Limitation of Liability & Merchant Indemnification</h2>
              <p>
                To the maximum extent permitted under applicable law, Basecart shall not be liable for any indirect, incidental, punitive, or consequential damages arising from merchant product defects, shipping delays, non-delivery, order disputes, or gateway downtime.
              </p>
              <p>
                Merchant agrees to defend, indemnify, and hold harmless Basecart, its founders, and affiliates from any third-party claims, consumer court disputes, GST audits, or legal notices resulting from Merchant&apos;s products, listings, or customer fulfillment.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-base lg:text-lg font-bold text-slate-900">6. Governing Law & Dispute Resolution</h2>
              <p>
                These Terms of Service are governed by and construed in accordance with the laws of the Republic of India. Any legal action, dispute, or proceeding arising out of or relating to this Agreement shall be subject to the exclusive jurisdiction of the Courts at Ernakulam / High Court of Kerala, India.
              </p>
            </div>

            <div className="space-y-3 p-5 bg-blue-50/50 border border-blue-200/80 rounded-2xl">
              <h2 className="text-sm font-bold text-blue-950 uppercase tracking-wider">Nodal Grievance Redressal Officer</h2>
              <p className="text-xs text-blue-900 font-medium">
                Under the Information Technology Act, 2000 and Consumer Protection (E-Commerce) Rules, 2020:
              </p>
              <div className="text-xs text-slate-800 font-bold space-y-0.5 pt-1">
                <div>Grievance Officer: Legal Compliance Desk</div>
                <div>Basecart SaaS Platform • Kochi, Kerala, India</div>
                <div>Email: <a href="mailto:grievance@basecart.app" className="text-blue-600 underline">grievance@basecart.app</a></div>
                <div className="text-[10px] text-slate-500 font-semibold">Acknowledgment SLA: 48 hours • Resolution SLA: 30 days</div>
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
