"use client";

import React from "react";

export default function ContactSalesButton() {
  const handleClick = () => {
    alert("Enterprise custom plan query ticket created. Our team will contact you within 24 hours.");
  };

  return (
    <button 
      onClick={handleClick}
      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-lg transition-all shrink-0 active:scale-95"
    >
      Contact sales
    </button>
  );
}
