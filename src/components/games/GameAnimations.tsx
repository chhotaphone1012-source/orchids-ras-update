"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Share2, X, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface BadgeUnlockProps {
  show: boolean;
  onClose: () => void;
  badge: {
    name: string;
    icon: string;
    description: string;
    points: number;
  };
}

export function BadgeUnlockAnimation({ show, onClose, badge }: BadgeUnlockProps) {
  const [playSound, setPlaySound] = useState(false);

  useEffect(() => {
    if (show) {
      setPlaySound(true);
      const audio = new Audio("/badge-unlock.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="relative z-10"
          >
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(251, 191, 36, 0.3)",
                  "0 0 60px rgba(251, 191, 36, 0.6)",
                  "0 0 100px rgba(251, 191, 36, 0.8)",
                  "0 0 60px rgba(251, 191, 36, 0.6)",
                  "0 0 20px rgba(251, 191, 36, 0.3)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-8 rounded-3xl gold-gradient text-center relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    "linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                    "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                  ],
                  backgroundPosition: ["0% -100%", "0% 200%"],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ backgroundSize: "100% 200%" }}
              />
              
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-8xl mb-4"
              >
                {badge.icon}
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-3xl font-black text-black mb-2">BADGE UNLOCKED!</h2>
                <p className="text-xl font-bold text-black/80">{badge.name}</p>
                <p className="text-sm text-black/60 mt-2">{badge.description}</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-black font-bold">
                  <Star className="w-5 h-5" />
                  <span>+{badge.points} Points</span>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center"
            >
              <Button onClick={onClose} className="bg-black text-orange-400 hover:bg-black/90 px-8">
                Awesome!
              </Button>
            </motion.div>
          </motion.div>

          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: window.innerHeight + 50,
                rotate: 0
              }}
              animate={{ 
                y: -100,
                rotate: 360,
                x: Math.random() * window.innerWidth
              }}
              transition={{ 
                duration: 2 + Math.random() * 2, 
                delay: Math.random() * 0.5,
                repeat: Infinity 
              }}
              className="absolute text-4xl"
            >
              ✨
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface WinHighlightProps {
  show: boolean;
  onClose: () => void;
  data: {
    gameName: string;
    score: number;
    level: number;
    bestMove?: string;
    image?: string;
  };
}

export function WinHighlightCard({ show, onClose, data }: WinHighlightProps) {
  const handleShare = () => {
    const text = `I just scored ${data.score} points in ${data.gameName} on 6GAMER! Level ${data.level} conquered! 🎮🏆`;
    if (navigator.share) {
      navigator.share({
        title: "6GAMER Win!",
        text,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="rounded-3xl overflow-hidden gold-border-glow bg-black/90 backdrop-blur-xl">
              <div className="relative h-48 gold-gradient flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Trophy className="w-24 h-24 text-black" />
                </motion.div>
                <motion.div
                  className="absolute top-4 right-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-8 h-8 text-black/50" />
                </motion.div>
                <button
                  onClick={onClose}
                  className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-black hover:bg-black/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <h2 className="text-3xl font-black gold-text-gradient mb-2">VICTORY!</h2>
                  <p className="text-orange-400 font-bold">{data.gameName} - Level {data.level}</p>
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 p-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/10 border border-orange-500/30"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Crown className="w-8 h-8 text-yellow-500" />
                    <span className="text-4xl font-black gold-text-gradient">{data.score.toLocaleString()}</span>
                  </div>
                  <p className="text-center text-orange-400/60 text-sm mt-1">POINTS EARNED</p>
                </motion.div>

                {data.bestMove && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <p className="text-white/50 text-xs mb-1">HIGHLIGHT MOMENT</p>
                    <p className="text-white font-medium">{data.bestMove}</p>
                    <p className="text-orange-400 text-sm mt-1">"This moment won you the game"</p>
                  </motion.div>
                )}
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 flex gap-3"
                >
                  <Button onClick={handleShare} className="flex-1 gold-gradient text-black font-bold">
                    <Share2 className="w-4 h-4 mr-2" /> Share Victory
                  </Button>
                  <Button onClick={onClose} variant="outline" className="flex-1 border-orange-500/30 text-orange-400">
                    Continue
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
