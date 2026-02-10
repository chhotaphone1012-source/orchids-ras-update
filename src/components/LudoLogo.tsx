import React from "react";
import { motion } from "framer-motion";

export default function LudoLogo({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <defs>
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#FDE68A", stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: "#F59E0B", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#B45309", stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Outer Glow */}
      <circle cx="50" cy="50" r="48" fill="rgba(245, 158, 11, 0.1)" />
      
      {/* Board Base */}
      <rect x="10" y="10" width="80" height="80" rx="12" fill="#111" stroke="url(#gold-grad)" strokeWidth="2" />
      
      {/* 4 Quadrants */}
      <rect x="15" y="15" width="30" height="30" rx="4" fill="#EF4444" />
      <rect x="55" y="15" width="30" height="30" rx="4" fill="#22C55E" />
      <rect x="55" y="55" width="30" height="30" rx="4" fill="#EAB308" />
      <rect x="15" y="55" width="30" height="30" rx="4" fill="#3B82F6" />

      {/* Center Crown */}
      <path 
        d="M50 35 L58 45 L68 45 L62 55 L65 65 L50 60 L35 65 L38 55 L32 45 L42 45 Z" 
        fill="url(#gold-grad)"
        className="animate-pulse"
      />

      {/* Dice Dots (Simple dots on the colors) */}
      <circle cx="30" cy="30" r="3" fill="white" fillOpacity="0.8" />
      <circle cx="70" cy="30" r="3" fill="white" fillOpacity="0.8" />
      <circle cx="70" cy="70" r="3" fill="white" fillOpacity="0.8" />
      <circle cx="30" cy="70" r="3" fill="white" fillOpacity="0.8" />
      
    </motion.svg>
  );
}
