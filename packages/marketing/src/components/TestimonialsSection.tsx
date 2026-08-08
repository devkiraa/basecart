"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sreelakshmi Nair",
    role: "Founder, Kasavu Boutique",
    location: "Kochi, Kerala",
    avatar: "SN",
    avatarClass: "bg-slate-700",
    content:
      "Basecart transformed our WhatsApp-based saree business into a proper online store. Our customers used to order by texting me and I'd manually confirm every payment. Now UPI payments verify instantly, WhatsApp receipts go out automatically, and I ship orders the same afternoon.",
    rating: 5,
  },
  {
    name: "Arjun Menon",
    role: "Owner, Kochi Bakers",
    location: "Ernakulam, Kerala",
    avatar: "AM",
    avatarClass: "bg-slate-700",
    content:
      "Setting up our bakery store took me an afternoon, not a week. Every order lands as a WhatsApp alert with the payment status already attached, so we never miss a cake order even during Onam. COD verification built into checkout was the game-changer for our Ernakulam customers.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Creative Director, Urban Threads",
    location: "Bengaluru, Karnataka",
    avatar: "PS",
    avatarClass: "bg-slate-700",
    content:
      "We switched from Shopify, where 2% of every order disappeared in transaction fees, to Basecart — now the full amount lands in our account. Shiprocket picks up from our studio directly, so fulfilment runs itself. Zero transaction fees is real.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index: number) => setCurrent(index);
  const prev = () =>
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="py-28 px-6 lg:px-16 bg-gradient-to-b from-white to-slate-50/50 border-b border-slate-100 overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-5"
        >
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Testimonials
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Loved by Indian entrepreneurs
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-xl mx-auto">
            Real stories from real merchants who transformed their businesses
            with Basecart.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 80, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -80, scale: 0.97 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-12 shadow-lg shadow-slate-200/50 relative overflow-hidden"
            >
              {/* Decorative quote icon */}
              <Quote className="absolute top-6 right-8 w-12 h-12 text-blue-50" />

              {/* Accent line at top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />

              <div className="space-y-6 relative z-10">
                {/* Star rating */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: testimonials[current].rating }).map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-4.5 h-4.5 fill-amber-400 text-amber-400"
                      />
                    )
                  )}
                </div>

                {/* Quote */}
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
                  &ldquo;{testimonials[current].content}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-2">
                  <div
                    className={`h-12 w-12 rounded-full ${testimonials[current].avatarClass} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {testimonials[current].avatar}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {testimonials[current].name}
                    </p>
                    <p className="text-xs text-slate-500 font-semibold">
                      {testimonials[current].role}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {testimonials[current].location}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-5 mt-8">
            <button
              onClick={prev}
              className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all cursor-pointer active:scale-95 hover:shadow-md hover:border-slate-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    i === current
                      ? "w-8 h-2.5 bg-blue-600 shadow-sm shadow-blue-500/30"
                      : "w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all cursor-pointer active:scale-95 hover:shadow-md hover:border-slate-300"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
