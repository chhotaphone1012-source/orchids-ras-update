"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Gamepad2, Shield, Lock, Eye, Trash2 } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
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
                <Shield className="w-14 h-14 text-black" />
              </div>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black gold-text-gradient mb-6 uppercase tracking-tighter">PRIVACY POLICY</h1>
            <p className="text-xl text-orange-400 font-bold max-w-xl mx-auto">
              How we protect your data at 6GAMER
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl p-8 rounded-[2rem] border-2 border-orange-500/20">
              <h2 className="text-2xl font-black gold-text-gradient mb-4 uppercase flex items-center gap-3">
                <Eye className="w-7 h-7 text-green-500" /> Information We Collect
              </h2>
              <ul className="space-y-3 text-lg text-orange-100">
                <li>• Your name and email address when you sign up</li>
                <li>• Your game scores and achievements</li>
                <li>• Your profile picture (if you add one)</li>
                <li>• Basic device info to keep the games running smooth</li>
              </ul>
            </Card>

            <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl p-8 rounded-[2rem] border-2 border-orange-500/20">
              <h2 className="text-2xl font-black gold-text-gradient mb-4 uppercase flex items-center gap-3">
                <Lock className="w-7 h-7 text-blue-500" /> How We Use Data
              </h2>
              <ul className="space-y-3 text-lg text-orange-100">
                <li>• To show your name on the leaderboard</li>
                <li>• To save your game progress</li>
                <li>• To keep your account secure</li>
                <li>• To send you important updates about your account</li>
              </ul>
            </Card>

            <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl p-8 rounded-[2rem] border-2 border-orange-500/20">
              <h2 className="text-2xl font-black gold-text-gradient mb-4 uppercase flex items-center gap-3">
                <Trash2 className="w-7 h-7 text-red-500" /> Your Rights
              </h2>
              <ul className="space-y-3 text-lg text-orange-100">
                <li>• You can see your data anytime in your dashboard</li>
                <li>• You can change your name and profile info</li>
                <li>• You can ask us to delete your account and all data</li>
                <li>• Your data is never sold to third parties</li>
              </ul>
            </Card>

            <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl p-8 rounded-[2rem] border-2 border-orange-500/20">
              <h2 className="text-2xl font-black gold-text-gradient mb-4 uppercase">Cookies</h2>
              <p className="text-lg text-orange-100">
                We use small files called cookies to keep you logged in and remember your settings. You can turn them off in your browser, but some features might not work.
              </p>
            </Card>

            <p className="text-center text-orange-400 text-sm mt-8">
              Last updated: January 2026
            </p>
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
