"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-[#F8FAFC] py-16 px-6 lg:px-16 text-left">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <span className="text-base font-black text-slate-900 tracking-tight">basecart</span>
          </div>
          <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed">
            The all-in-one commerce platform to build, launch and grow your online business.
          </p>
        </div>

        <div>
          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-4">Product</h4>
          <div className="space-y-3 text-xs font-semibold text-slate-500 select-none">
            <a href="/features" className="block hover:text-slate-900">Features</a>
            <a href="/pricing" className="block hover:text-slate-900">Pricing</a>
            <a href="/themes" className="block hover:text-slate-900">Themes</a>
            <a href="/integrations" className="block hover:text-slate-900">Integrations</a>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-4">Resources</h4>
          <div className="space-y-3 text-xs font-semibold text-slate-500 select-none">
            <a href="https://docs.basecart.app" target="_blank" rel="noopener noreferrer" className="block hover:text-slate-900">API Docs</a>
            <a href="/faq" className="block hover:text-slate-900">FAQ</a>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-4">Company</h4>
          <div className="space-y-3 text-xs font-semibold text-slate-500 select-none">
            <a href="/careers" className="block hover:text-slate-900">Careers</a>
            <a href="/blog" className="block hover:text-slate-900">Blog</a>
            <a href="/contact" className="block hover:text-slate-900">Contact Us</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-200/50 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 font-bold select-none">
        <span>© {new Date().getFullYear()} Basecart Inc. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="/legal/terms" className="hover:underline">Terms of Service</a>
          <a href="/legal/privacy" className="hover:underline">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
