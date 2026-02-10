"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Gamepad2, FileText, Shield, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
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
                <FileText className="w-14 h-14 text-black" />
              </div>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black gold-text-gradient mb-6 uppercase tracking-tighter">TERMS & SERVICE</h1>
            <p className="text-xl text-orange-400 font-bold max-w-xl mx-auto">
              Rules for using 6GAMER
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
                <Shield className="w-7 h-7 text-green-500" /> Using Our Website
              </h2>
              <ul className="space-y-3 text-lg text-orange-100">
                <li>• You must be 13 years or older to use 6GAMER</li>
                <li>• Create only one account per person</li>
                <li>• Keep your password safe and do not share it</li>
                <li>• Use a real email address when signing up</li>
              </ul>
            </Card>

            <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl p-8 rounded-[2rem] border-2 border-orange-500/20">
              <h2 className="text-2xl font-black gold-text-gradient mb-4 uppercase flex items-center gap-3">
                <Gamepad2 className="w-7 h-7 text-blue-500" /> Playing Games
              </h2>
              <ul className="space-y-3 text-lg text-orange-100">
                <li>• Play fair - no cheating or using hacks</li>
                <li>• Your scores are saved to our servers</li>
                <li>• We may remove fake or cheated scores</li>
                <li>• Rankings are based on your best scores</li>
              </ul>
            </Card>

            <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl p-8 rounded-[2rem] border-2 border-orange-500/20">
              <h2 className="text-2xl font-black gold-text-gradient mb-4 uppercase flex items-center gap-3">
                <AlertCircle className="w-7 h-7 text-yellow-500" /> Important Rules
              </h2>
              <ul className="space-y-3 text-lg text-orange-100">
                <li>• Do not try to hack or break the website</li>
                <li>• Be nice to other players</li>
                <li>• Do not share bad or harmful content</li>
                <li>• We can ban users who break rules</li>
              </ul>
            </Card>

            <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl p-8 rounded-[2rem] border-2 border-orange-500/20">
              <h2 className="text-2xl font-black gold-text-gradient mb-4 uppercase">Your Data</h2>
              <ul className="space-y-3 text-lg text-orange-100">
                <li>• We save your name, email, and game scores</li>
                <li>• We do not sell your data to anyone</li>
                <li>• You can delete your account anytime</li>
                <li>• We use cookies to keep you logged in</li>
              </ul>
            </Card>

            <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl p-8 rounded-[2rem] border-2 border-orange-500/20">
              <h2 className="text-2xl font-black gold-text-gradient mb-4 uppercase">Contact Us</h2>
              <p className="text-lg text-orange-100">
                If you have any questions about these terms, you can contact our team. We are happy to help!
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
