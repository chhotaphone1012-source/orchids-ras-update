"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Gamepad2, Users, Heart, Trophy, Crown } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen galaxy-bg relative overflow-x-hidden">
      <div className="galaxy-stars fixed inset-0 pointer-events-none z-0" />
      
      <div className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <div className="w-24 h-24 rounded-3xl gold-gradient flex items-center justify-center animate-pulse-glow shadow-2xl">
                <Users className="w-14 h-14 text-black" />
              </div>
            </motion.div>
            <h1 className="text-6xl md:text-7xl font-black gold-text-gradient mb-6 uppercase tracking-tighter">ABOUT US</h1>
            <p className="text-xl text-orange-400 font-bold max-w-xl mx-auto">
              Know more about 6GAMER and our team
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl p-10 rounded-[2rem] border-2 border-orange-500/20 mb-8">
              <h2 className="text-3xl font-black gold-text-gradient mb-6 uppercase">What is 6GAMER?</h2>
              <p className="text-lg text-orange-100 leading-relaxed mb-4">
                6GAMER is a fun gaming website where you can play 6 amazing games. Each game has 10 levels. Your scores are saved and you can see how you rank against other players from around the world.
              </p>
              <p className="text-lg text-orange-100 leading-relaxed">
                We made this website so everyone can have fun playing games. No downloads needed - just open the website and start playing!
              </p>
            </Card>

            <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl p-10 rounded-[2rem] border-2 border-orange-500/20 mb-8">
              <h2 className="text-3xl font-black gold-text-gradient mb-6 uppercase flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500" /> Our Team
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["Aman Shukla", "Mamta", "Shammi"].map((name, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="bg-gradient-to-br from-orange-500/20 to-amber-500/10 p-6 rounded-2xl text-center border border-orange-500/30"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-black text-black">{name[0]}</span>
                    </div>
                    <h3 className="text-xl font-black text-orange-400">{name}</h3>
                    <p className="text-sm text-orange-200 mt-1">Developer</p>
                  </motion.div>
                ))}
              </div>
            </Card>

            <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl p-10 rounded-[2rem] border-2 border-orange-500/20">
              <h2 className="text-3xl font-black gold-text-gradient mb-6 uppercase flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" /> Our Games
              </h2>
              <ul className="space-y-3 text-lg text-orange-100">
                <li className="flex items-center gap-3"><span className="text-2xl">⚽</span> Ball Maze - Move through the maze</li>
                <li className="flex items-center gap-3"><span className="text-2xl">👻</span> Ghost Kill - Kill ghosts quickly</li>
                <li className="flex items-center gap-3"><span className="text-2xl">🐦</span> Bird Fly - Fly through blocks</li>
                <li className="flex items-center gap-3"><span className="text-2xl">🐍</span> Snake Pro - Classic snake game</li>
                <li className="flex items-center gap-3"><span className="text-2xl">⌨️</span> Typing Master - Type fast</li>
                <li className="flex items-center gap-3"><span className="text-2xl">🔤</span> Word Maker - Make words</li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>

      <footer className="relative z-10 bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 py-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
                <Gamepad2 className="w-7 h-7 text-orange-500" />
              </div>
              <span className="text-3xl font-black text-black tracking-tighter italic">6GAMER</span>
            </div>
            <p className="text-black/80 text-sm font-bold">Developed by Aman Shukla, Mamta, Shammi</p>
            <div className="flex gap-4">
              <Link href="/about" className="text-black font-bold hover:underline">About Us</Link>
              <Link href="/terms" className="text-black font-bold hover:underline">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
