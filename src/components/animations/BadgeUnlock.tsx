"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, Crown, Sparkles, Award } from "lucide-react";
import { useEffect, useState } from "react";

interface BadgeUnlockProps {
  badgeName: string;
  badgeIcon?: string;
  onClose: () => void;
}

export default function BadgeUnlock({ badgeName, badgeIcon = "🏆", onClose }: BadgeUnlockProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Sound effect simulation
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
    audio.play().catch(() => {});
    
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 500);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: window.innerHeight + 100,
                  opacity: 1
                }}
                animate={{ 
                  y: -100,
                  rotate: 360,
                  opacity: 0
                }}
                transition={{ 
                  duration: 2 + Math.random() * 3, 
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
                className="absolute"
              >
                <Sparkles className="text-yellow-500 w-6 h-6" />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="text-center relative"
          >
            <motion.div
              animate={{ 
                boxShadow: ["0 0 20px rgba(251,191,36,0.5)", "0 0 60px rgba(251,191,36,0.8)", "0 0 20px rgba(251,191,36,0.5)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-64 h-64 rounded-[3rem] gold-gradient mx-auto flex items-center justify-center mb-10 relative group cursor-pointer"
            >
              <div className="absolute inset-4 rounded-[2.5rem] border-4 border-black/20 animate-pulse" />
              <motion.span 
                className="text-9xl filter drop-shadow-2xl"
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                {badgeIcon}
              </motion.span>
              
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] blur-xl" />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-6xl font-black gold-text-gradient mb-4 uppercase tracking-tighter italic">ACHIEVEMENT UNLOCKED</h2>
              <p className="text-4xl text-white font-black uppercase tracking-widest">{badgeName}</p>
              
              <div className="mt-10 flex items-center justify-center gap-4">
                <div className="h-1 w-20 gold-gradient rounded-full" />
                <Award className="w-10 h-10 text-yellow-500" />
                <div className="h-1 w-20 gold-gradient rounded-full" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
