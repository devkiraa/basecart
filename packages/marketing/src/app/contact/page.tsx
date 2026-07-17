"use client";

import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Mail, MessageSquare, MapPin, Loader2, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white text-slate-650 font-sans selection:bg-blue-50 selection:text-blue-600">
      <Header />

      {/* Hero Section */}
      <section className="px-6 lg:px-16 pt-16 pb-20 bg-gradient-to-b from-[#F8FAFC]/50 to-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">CONTACT US</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Get in touch with our commerce experts
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Have questions about enterprise plans, billing options, custom domains, or database migrations? We are here to help.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="px-6 lg:px-16 py-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
        {/* Left Column: Info */}
        <div className="lg:col-span-5 space-y-8 my-auto">
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Contact Information</h2>
            <p className="text-xs leading-relaxed text-slate-500 font-semibold">Drop us a line or visit us. Our team responds within 1 business day.</p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-center">
              <div className="h-10 w-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-lg shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Support</h4>
                <a href="mailto:support@basecart.app" className="text-sm font-bold text-slate-900 hover:underline">support@basecart.app</a>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="h-10 w-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-lg shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sales Queries</h4>
                <a href="mailto:sales@basecart.app" className="text-sm font-bold text-slate-900 hover:underline">sales@basecart.app</a>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="h-10 w-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-lg shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Office Headquarters</h4>
                <p className="text-sm font-bold text-slate-900 leading-snug">Basecart Inc., HSR Layout Sector 4, Bangalore, KA, India</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Quick Chat */}
          <a
            href="https://wa.me/919876543210?text=Hi%20Basecart%20Team%2C%20I%27d%20like%20to%20know%20more%20about%20your%20platform."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4 hover:bg-emerald-100 transition-colors"
          >
            <div className="h-10 w-10 bg-emerald-500 text-white flex items-center justify-center rounded-lg shrink-0">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">WhatsApp Us</h4>
              <p className="text-xs text-emerald-600 font-semibold">Chat with us instantly for quick support</p>
            </div>
          </a>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7 bg-[#F8FAFC] border border-slate-150 p-8 rounded-2xl">
          {submitted ? (
            <div className="space-y-4 text-center py-12 animate-fade-in">
              <div className="text-4xl">📬</div>
              <h3 className="text-lg font-bold text-slate-900">Message Sent successfully!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">Thank you for contacting Basecart. A support specialist or account manager will get back to you shortly.</p>
              <button 
                type="button" 
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg text-xs"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Your Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600" 
                    placeholder="Kiran" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600" 
                    placeholder="kiran@example.com" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Subject</label>
                <input 
                  type="text" 
                  required 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600" 
                  placeholder="Query regarding enterprise scale details" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Message Body</label>
                <textarea 
                  required 
                  rows={5}
                  value={message} 
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600" 
                  placeholder="Write details about your query here..." 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Message"}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
