"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Gamepad2, Mail, MessageSquare, Send, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Message sent! We will get back to you soon.");
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen galaxy-bg relative overflow-x-hidden">
      <div className="galaxy-stars fixed inset-0 pointer-events-none z-0" />
      
      <div className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
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
                <Mail className="w-14 h-14 text-black" />
              </div>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black gold-text-gradient mb-6 uppercase tracking-tighter">CONTACT US</h1>
            <p className="text-xl text-orange-400 font-bold max-w-xl mx-auto">
              Have a question or feedback? We'd love to hear from you!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl p-8 rounded-[2rem] border-2 border-orange-500/20 h-full">
                <h2 className="text-3xl font-black gold-text-gradient mb-8 uppercase">Get in Touch</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center shrink-0 shadow-lg">
                      <Mail className="w-7 h-7 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-yellow-500 uppercase">Email Us</h3>
                      <p className="text-lg text-orange-100">support@6gamer.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center shrink-0 shadow-lg">
                      <MessageSquare className="w-7 h-7 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-yellow-500 uppercase">Discord</h3>
                      <p className="text-lg text-orange-100">Join our community at discord.gg/6gamer</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center shrink-0 shadow-lg">
                      <MapPin className="w-7 h-7 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-yellow-500 uppercase">Location</h3>
                      <p className="text-lg text-orange-100">Gaming Hub, Level 99, Virtual World</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-6 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                  <p className="text-orange-200 font-medium italic italic">
                    "Our support team usually responds within 24 hours. We are committed to providing the best gaming experience."
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl p-8 rounded-[2rem] border-2 border-orange-500/20">
                <h2 className="text-3xl font-black gold-text-gradient mb-8 uppercase">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-yellow-500 font-bold mb-2 uppercase text-sm">Your Name</label>
                    <Input 
                      required
                      placeholder="Enter your name"
                      className="bg-black/50 border-orange-500/30 text-white rounded-xl h-12 focus:border-yellow-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-yellow-500 font-bold mb-2 uppercase text-sm">Email Address</label>
                    <Input 
                      required
                      type="email"
                      placeholder="Enter your email"
                      className="bg-black/50 border-orange-500/30 text-white rounded-xl h-12 focus:border-yellow-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-yellow-500 font-bold mb-2 uppercase text-sm">Subject</label>
                    <Input 
                      required
                      placeholder="What is this about?"
                      className="bg-black/50 border-orange-500/30 text-white rounded-xl h-12 focus:border-yellow-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-yellow-500 font-bold mb-2 uppercase text-sm">Message</label>
                    <Textarea 
                      required
                      placeholder="Type your message here..."
                      className="bg-black/50 border-orange-500/30 text-white rounded-xl min-h-[150px] focus:border-yellow-500 transition-colors"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full gold-gradient text-black font-black py-6 rounded-xl text-xl hover:scale-105 transition-transform animate-pulse-glow"
                  >
                    {loading ? "SENDING..." : (
                      <span className="flex items-center gap-2">
                        <Send className="w-6 h-6" /> SEND MESSAGE
                      </span>
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
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
