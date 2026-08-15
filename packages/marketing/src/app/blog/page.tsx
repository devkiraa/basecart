"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, getPostSummaries } from "../../data/posts";

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const posts = getPostSummaries(activeCategory);

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
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <Link
              key={idx}
              href={`/blog/${post.slug}`}
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="aspect-video w-full bg-slate-100">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 space-y-3 text-left">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{post.category}</span>
                    <span>•</span>
                    <span>{post.displayDate}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{post.excerpt}</p>
                </div>
              </div>
              <div className="p-6 pt-0 mt-4 flex items-center justify-between border-t border-slate-50 pt-4 select-none">
                <span className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                  Read article <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
