"use client";

import React from "react";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Basecart Terms of Service</h1>
            <p className="text-xs text-slate-400 font-semibold mt-2">Last updated: July 15, 2026</p>
          </div>

          <div className="prose prose-sm text-slate-650 max-w-none space-y-6 leading-relaxed text-sm font-medium">
            
            <p>
              Welcome to Basecart. By signing up for a Basecart Account (as defined below) or by using any Basecart Services (as defined below), you are agreeing to be bound by the following terms and conditions (the <strong>"Terms of Service"</strong>).
            </p>

            <p>
              As used in these Terms of Service, <strong>"we"</strong>, <strong>"us"</strong>, <strong>"our"</strong> and <strong>"Basecart"</strong> means Basecart Inc. and the applicable local affiliate, and <strong>"you"</strong> means the Basecart User (if registering for a Service as an individual) or the entity on whose behalf the Basecart User is acting (if registering for a Service as a business).
            </p>

            <hr className="border-slate-100 my-6" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">1. Account Activation & Registration</h2>
              <p>
                To access and use the Services, you must register for a Basecart account (<strong>"Account"</strong>) by providing your full legal name, current address, phone number, a valid email address, and any other information indicated as required.
              </p>
              <p>
                You acknowledge that Basecart will use the email address you provide as the primary method for communication. You are responsible for keeping your password secure. Basecart cannot and will not be liable for any loss or damage from your failure to maintain the security of your Account and password.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">2. Subdomain Usage & Account Ownership</h2>
              <p>
                Upon registration, you will be allocated a subdomain under the Basecart primary domain (e.g. <code>[your-subdomain].basecart.io</code> or your local configured equivalent). This subdomain is a licensed service asset provided by Basecart and remains the property of Basecart.
              </p>
              <p>
                Basecart reserves the right to reclaim, suspend, rename, or transfer subdomains at any time if we determine that you have violated these terms, committed trademark infringement, or engaged in fraudulent activities.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">3. Subscription Fees & Payments</h2>
              <p>
                You agree to pay the subscription fees applicable to your selected plan (<strong>"Subscription Fees"</strong>) as described in the Pricing Matrix. Fees are non-refundable unless specified otherwise.
              </p>
              <p>
                Your subscription will automatically renew at the end of each billing cycle (monthly or annually) unless you terminate your subscription before the renewal date. All fees are exclusive of applicable federal, state, local, or other governmental taxes.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">4. Intellectual Property & Customer Content</h2>
              <p>
                We do not claim any intellectual property rights over the materials, products, images, or documentation you upload or configure on your Basecart storefront. All content you upload remains yours.
              </p>
              <p>
                By uploading storefront assets, you grant Basecart a non-exclusive, worldwide, royalty-free, transferable license to store, cache, display, and process your content solely for the purpose of serving your online storefront.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">5. Limitation of Liability & Indemnification</h2>
              <p>
                You expressly understand and agree that, to the extent permitted by applicable laws, Basecart shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to, damages for loss of profits, goodwill, data or other intangible losses resulting from the use of or inability to use the service.
              </p>
              <p>
                Your use of the Services is at your sole risk. The Services are provided on an "as is" and "as available" basis without any warranty or condition, express, implied, or statutory.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">6. Governing Law</h2>
              <p>
                These Terms of Service shall be governed by and interpreted in accordance with the laws of the jurisdiction in which our business is incorporated, without regard to principles of conflicts of laws. You and Basecart consent to the exclusive jurisdiction and venue of the local courts located in Karnataka, India.
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
