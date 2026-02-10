"use client";

import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 galaxy-bg flex flex-col items-center justify-center z-[100]">
      <div className="fixed inset-0 galaxy-stars pointer-events-none" />
      
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 360],
          boxShadow: [
            "0 0 20px rgba(255, 215, 0, 0.3)",
            "0 0 50px rgba(255, 215, 0, 0.6)",
            "0 0 20px rgba(255, 215, 0, 0.3)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 rounded-3xl gold-gradient flex items-center justify-center mb-8 relative z-10"
      >
        <Gamepad2 className="h-12 w-12 text-black" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center relative z-10"
      >
        <h2 className="text-4xl font-black gold-text-gradient tracking-widest uppercase mb-2">
          6GAMER
        </h2>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-3 h-3 rounded-full gold-gradient"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
