"use client";

import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="flex flex-col items-center"
      >
        <Gamepad2 className="h-20 w-20 text-primary mb-4" />
        <h1 className="text-4xl font-bold gold-text-gradient">6gamer</h1>
        <div className="mt-8 w-48 h-1 bg-primary/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-full h-full bg-primary"
          />
        </div>
      </motion.div>
    </div>
  );
}
