"use client";

import { motion } from "framer-motion";
import { Share2, Sparkles, Trophy, Download, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WinHighlightProps {
  gameName: string;
  score: number;
  momentText?: string;
  image?: string;
}

export default function WinHighlight({ 
  gameName, 
  score, 
  momentText = "This legendary maneuver won you the game!",
  image = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800"
}: WinHighlightProps) {
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `I just scored ${score} in ${gameName}!`,
        text: `Check out my legendary score on 6GAMER!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`I just scored ${score} in ${gameName} on 6GAMER!`);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="max-w-md w-full mx-auto"
    >
      <div className="gold-border-glow bg-black/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-4 right-4 z-20">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-yellow-500 p-2 rounded-full shadow-lg"
          >
            <Sparkles className="w-5 h-5 text-black" />
          </motion.div>
        </div>

        <div className="relative aspect-video">
          <img src={image} alt="Victory Moment" className="w-full h-full object-cover grayscale-[20%] contrast-125" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-6 left-8">
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">{gameName}</h3>
            <p className="text-orange-400 font-black text-sm tracking-widest uppercase">Battle Arena Victory</p>
          </div>
        </div>

        <div className="p-8 text-center">
          <div className="mb-6">
            <div className="text-white/40 text-xs font-black uppercase tracking-[0.3em] mb-2">Final Score</div>
            <div className="text-6xl font-black gold-text-gradient drop-shadow-lg tabular-nums">{score.toLocaleString()}</div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8 relative group">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black px-4 py-1 border border-orange-500/30 rounded-full text-[10px] font-black text-orange-500 tracking-widest uppercase">
              Legendary Moment
            </div>
            <p className="text-orange-100 font-bold italic">"{momentText}"</p>
          </div>

            <div className="flex justify-center">
              <Button onClick={handleShare} className="w-full gold-gradient text-black font-black py-6 rounded-2xl text-lg hover:scale-105 transition-transform">
                <Share2 className="w-5 h-5 mr-2" /> SHARE GLORY
              </Button>
            </div>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-white/20 text-[10px] font-black uppercase tracking-widest">
            <Trophy className="w-3 h-3" /> 6GAMER ELITE PLATFORM <Trophy className="w-3 h-3" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
