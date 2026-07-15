"use client";

import React from "react";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans antialiased selection:bg-blue-50 selection:text-blue-600">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div 
          onClick={() => { window.location.href = "/"; }}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <ShoppingBag className="h-4.5 w-4.5" />
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight">basecart</span>
          <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">Legal</span>
        </div>
        <button
          onClick={() => { window.history.back(); }}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors select-none"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </header>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 lg:p-12 shadow-sm space-y-8">
          
          <div className="border-b border-slate-100 pb-6">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Basecart Privacy Policy</h1>
            <p className="text-xs text-slate-400 font-semibold mt-2">Last updated: July 15, 2026</p>
          </div>

          <div className="prose prose-sm text-slate-650 max-w-none space-y-6 leading-relaxed text-sm font-medium">
            
            <p>
              Your privacy is extremely important to us. This Privacy Policy describes how Basecart Inc. and its affiliates (<strong>"Basecart"</strong>, <strong>"we"</strong>, <strong>"us"</strong> or <strong>"our"</strong>) collect, use, and share the personal information of merchant owners and storefront customers using our services (<strong>"Services"</strong>).
            </p>

            <hr className="border-slate-100 my-6" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
              <p>
                We collect personal information when you register for an Account, open a store, configure billing, or purchase items from a storefront powered by Basecart.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Merchant Information:</strong> Your name, business name, address, email address, phone number, and subscription billing details.</li>
                <li><strong>Customer Order Information:</strong> Customer name, shipping/billing address, email, phone number, and items purchased, which are stored securely inside your store's isolated database.</li>
                <li><strong>Technical Information:</strong> IP address, device type, browser settings, and storefront session statistics.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">2. How We Use Your Information</h2>
              <p>
                We process your information to provide, run, and optimize the Services, specifically:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>To authenticate merchant login and verify email credentials.</li>
                <li>To generate invoice receipt PDFs and process order fulfillments.</li>
                <li>To provision isolated database clusters (Cloudflare Durable Objects) for store information.</li>
                <li>To prevent, detect, and investigate potentially prohibited or illegal activities, including fraud.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">3. How We Share Your Information</h2>
              <p>
                Basecart does not sell or lease merchant or customer data. We share data only with authorized sub-processors necessary to run the Service:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Infrastructure Providers:</strong> Cloudflare (hosting, Workers, D1 database storage, Durable Objects) and AWS LocalStack (mock email, S3, SQS queue backups).</li>
                <li><strong>Payment Processors:</strong> Gateways like Stripe or Razorpay to handle subscription fees and customer checkouts securely.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">4. Cookies and Tracking</h2>
              <p>
                We use cookies to maintain merchant and customer login sessions, track items added to customer shopping carts, and analyze storefront traffic. You can configure your browser to reject cookies, but some functions of the store builder and customer checkout may not work properly as a result.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">5. Your Legal Rights (GDPR & CCPA)</h2>
              <p>
                Depending on your location, you or your customers may have rights to access, correct, delete, or limit the processing of personal data stored inside your Basecart account. If you need to request data deletion or export account records, please contact our support team at <code>privacy@basecart.com</code>.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">6. Changes to this Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or through a notice in the merchant control console.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-400 select-none">
        <p>© {new Date().getFullYear()} Basecart Inc. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2 font-bold text-slate-400">
          <a href="/legal/terms" className="hover:text-slate-650 hover:underline">Terms of Service</a>
          <a href="/legal/privacy" className="hover:text-slate-650 hover:underline">Privacy Policy</a>
        </div>
      </footer>

    </div>
  );
}
