"use client";

import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ArrowRight } from "lucide-react";

export default function BlogPage() {
  const posts = [
    {
      title: "How Isolated Databases Improve E-commerce Security & Performance",
      date: "July 15, 2026",
      readTime: "5 min read",
      excerpt: "Why the traditional shared database pattern causes scale bottlenecks, and how private D1 SQLite scopes keep merchant records isolated.",
      image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "5 Conversion Tactics to Optimize Your Headless Checkout Flow",
      date: "June 28, 2026",
      readTime: "4 min read",
      excerpt: "A tactical guide on layout spacing, payment choices, and mobile UX adjustments that reduce cart abandonment by up to 30%.",
      image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Setting Up Custom Domains on Cloudflare: A Complete Guide",
      date: "May 12, 2026",
      readTime: "6 min read",
      excerpt: "Step-by-step documentation on CNAME routing, SSL registration, and caching configurations for custom brand storefronts.",
      image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-650 font-sans selection:bg-blue-50 selection:text-blue-600">
      <Header />

      {/* Hero Section */}
      <section className="px-6 lg:px-16 pt-16 pb-20 bg-gradient-to-b from-[#F8FAFC]/50 to-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">BLOG</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Latest insights from the Basecart team
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            E-commerce architecture tips, checkout optimizations, and guides to launching online businesses.
          </p>
        </div>
      </section>

      {/* Blog Cards */}
      <section className="px-6 lg:px-16 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="aspect-video w-full bg-slate-100">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 space-y-3 text-left">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">{post.title}</h3>
                  <p className="text-xs text-slate-550 text-slate-500 leading-relaxed font-semibold">{post.excerpt}</p>
                </div>
              </div>
              <div className="p-6 pt-0 mt-4 flex items-center justify-between border-t border-slate-50 pt-4 select-none">
                <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer inline-flex items-center gap-1">
                  Read article <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
