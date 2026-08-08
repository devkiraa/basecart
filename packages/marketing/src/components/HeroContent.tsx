"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import BookDemoButton from "./BookDemoButton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function HeroContent() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full lg:w-1/2 space-y-8 text-left"
    >

      {/* Headline */}
      <motion.div variants={itemVariants} className="space-y-5">
        <h1 className="text-5xl lg:text-[3.6rem] xl:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
          The{" "}
          <span className="text-blue-600">
            Shopify alternative
          </span>{" "}
          built for{" "}
          <span className="text-blue-600">
            Indian brands
          </span>{" "}
          & Instagram sellers.
        </h1>
        <p className="text-base lg:text-lg text-slate-500 leading-relaxed max-w-xl font-medium">
          Basecart gives you everything you need to create your store, accept
          instant UPI & COD payments, automate WhatsApp order receipts, and
          scale your business across Kerala & India with zero transaction fees.
        </p>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap gap-4 select-none pt-2"
      >
        <motion.a
          href="/signup"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Start 60-day free trial</span>
          <ArrowUpRight className="w-4 h-4" />
        </motion.a>
        <BookDemoButton />
      </motion.div>

      {/* Trust badges */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 font-semibold select-none pt-1"
      >
        <span className="flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          No credit card required
        </span>
        <span className="flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          Quick setup in 2 minutes
        </span>
        <span className="flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          Zero transaction fees
        </span>
      </motion.div>
    </motion.div>
  );
}
