"use client";

import React from "react";

export default function BookDemoButton() {
  const handleClick = () => {
    alert("Book a demo scheduled! We will contact you at your registered email.");
  };

  return (
    <button 
      onClick={handleClick}
      className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-lg transition-all text-sm active:scale-95"
    >
      Book a demo
    </button>
  );
}
