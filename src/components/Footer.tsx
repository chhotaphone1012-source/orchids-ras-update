"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Gamepad2, Twitter, Github, Youtube, Mail, Heart, Sparkles, Trophy, Users, Star } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 bg-gradient-to-b from-transparent via-orange-950/20 to-black/90 border-t border-orange-500/20 pt-16 pb-8">
      <div className="absolute inset-0 galaxy-stars opacity-30 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center animate-pulse-glow"
              >
                <Gamepad2 className="h-6 w-6 text-black" />
              </motion.div>
              <span className="text-2xl font-black gold-text-gradient">6gamer</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              Experience the best gold-themed games with real-time leaderboards, achievements, and a premium royal UI.
            </p>
            <div className="flex items-center gap-2 text-sm text-orange-500/80">
              <Sparkles className="w-4 h-4" />
              <span>Premium Gaming Experience</span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-bold text-lg mb-4 gold-text-gradient flex items-center gap-2">
              <Star className="w-4 h-4 text-orange-500" /> Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Home", href: "/" },
                { label: "Games", href: "/games" },
                { label: "Leaderboard", href: "/leadership" },
                { label: "Login", href: "/login" },
                { label: "Sign Up", href: "/signup" },
              ].map((link, i) => (
                <motion.li key={i} whileHover={{ x: 5 }}>
                  <Link href={link.href} className="text-white/60 hover:text-orange-500 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-orange-500" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-bold text-lg mb-4 gold-text-gradient flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-orange-500" /> Our Games
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { icon: "⚽", name: "Ball Maze" },
                { icon: "👻", name: "Ghost Kill" },
                { icon: "🐦", name: "Bird Fly" },
                { icon: "🐍", name: "Snake Pro" },
                { icon: "⌨️", name: "Typing Master" },
                { icon: "🔤", name: "Word Maker" },
                { icon: "🎯", name: "Target Hit" },
              ].map((game, i) => (
                <motion.li 
                  key={i} 
                  whileHover={{ x: 5, scale: 1.02 }}
                  className="text-white/60 hover:text-orange-500 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>{game.icon}</span>
                  {game.name}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-bold text-lg mb-4 gold-text-gradient flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" /> Connect With Us
            </h3>
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { icon: Twitter, label: "Twitter" },
                { icon: Github, label: "GitHub" },
                { icon: Youtube, label: "YouTube" },
                { icon: Mail, label: "Email" },
              ].map((social, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/10 border border-orange-500/30 flex items-center justify-center cursor-pointer hover:gold-gradient hover:border-transparent transition-all group"
                >
                  <social.icon className="h-5 w-5 text-orange-500 group-hover:text-black transition-colors" />
                </motion.div>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-yellow-500/5 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-white">Join 1000+ Gamers</span>
              </div>
              <p className="text-xs text-white/50">Compete globally and win rewards!</p>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-orange-500/10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm flex items-center gap-2">
              © {new Date().getFullYear()} 6gamer. Made with 
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              </motion.span>
              for gamers.
            </p>
            <div className="flex items-center gap-6 text-xs text-white/40">
              <span className="hover:text-orange-500 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-orange-500 cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-orange-500 cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
