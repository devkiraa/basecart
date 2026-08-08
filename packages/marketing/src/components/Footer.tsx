"use client";

import React from "react";
import { ShoppingBag, Github, Twitter, MessageSquare, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-[#F8FAFC] py-16 px-6 lg:px-16 text-left selection:bg-blue-50 selection:text-blue-600">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Basecart Logo" className="h-[56px] w-auto object-contain shrink-0" />
          </div>
          <p className="text-xs text-slate-500 font-semibold max-w-xs leading-relaxed">
            The all-in-one e-commerce platform to build, launch and grow your online business. Build in a weekend, scale to millions.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-slate-400 pt-2">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">
              <Github className="w-4.5 h-4.5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">
              <Twitter className="w-4.5 h-4.5" />
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">
              <MessageSquare className="w-4.5 h-4.5" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">
              <Youtube className="w-4.5 h-4.5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-4">Product</h4>
          <div className="space-y-3 text-xs font-semibold text-slate-500 select-none">
            <a href="/features" className="block hover:text-slate-900 transition-colors">Database Isolation</a>
            <a href="/pricing" className="block hover:text-slate-900 transition-colors">Automated Checkout</a>
            <a href="/themes" className="block hover:text-slate-900 transition-colors">Storefront Studio</a>
            <a href="/integrations" className="block hover:text-slate-900 transition-colors">Shiprocket Logistics</a>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-4">Resources</h4>
          <div className="space-y-3 text-xs font-semibold text-slate-500 select-none">
            <a href="https://docs.basecart.app" target="_blank" rel="noopener noreferrer" className="block hover:text-slate-900 transition-colors">Documentation</a>
            <a href="/faq" className="block hover:text-slate-900 transition-colors">API Reference</a>
            <a href="/blog" className="block hover:text-slate-900 transition-colors">Guides & Tutorials</a>
            <a href="/integrations" className="block hover:text-slate-900 transition-colors">Integrations Hub</a>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-4">Company</h4>
          <div className="space-y-3 text-xs font-semibold text-slate-500 select-none">
            <a href="/careers" className="block hover:text-slate-900 transition-colors">Careers</a>
            <a href="/blog" className="block hover:text-slate-900 transition-colors">Blog</a>
            <a href="/contact" className="block hover:text-slate-900 transition-colors">Contact Us</a>
            <a href="/legal/terms" className="block hover:text-slate-900 transition-colors">Privacy & Terms</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-200/60 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-semibold select-none">
        <span>© {new Date().getFullYear()} Basecart Inc. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="/legal/terms" className="hover:text-slate-700">Terms of Service</a>
          <a href="/legal/privacy" className="hover:text-slate-700">Privacy Policy</a>
          <a href="/security" className="hover:text-slate-700">Security</a>
        </div>
      </div>
    </footer>
  );
}
