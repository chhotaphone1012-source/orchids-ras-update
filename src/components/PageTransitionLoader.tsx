"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Crown } from "lucide-react";

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    // If navigating AWAY from home or TO any other page (except home)
    if (pathname !== prevPath) {
      if (pathname !== "/") {
        setLoading(true);
        const timer = setTimeout(() => {
          setLoading(false);
        }, 800); // Fast transition
        return () => clearTimeout(timer);
      }
      setPrevPath(pathname);
    }
  }, [pathname, searchParams, prevPath]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
        >
          <div className="absolute inset-0 galaxy-stars opacity-50" />
          
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ 
              scale: [0.8, 1.1, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ 
              duration: 0.6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative z-10"
          >
            <Crown className="w-24 h-24 text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]" />
          </motion.div>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            className="h-1 gold-gradient mt-8 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"
          />
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-yellow-500 font-black uppercase tracking-[0.3em] text-xs animate-pulse"
          >
            Loading Realm...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
