"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Gamepad2, User, LogOut, Menu, X, Trophy, Home, Sparkles, Bell } from "lucide-react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
      if (!auth || !auth.app) return;
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
      });
      return () => unsubscribe();
    }, []);

    useEffect(() => {
      if (!db || !db.app) return;
      try {
        const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setNotifications(notifs);
          setUnreadCount(notifs.length);
        });
        return () => unsubscribe();
      } catch (e) {
        console.error("Navbar notifications error:", e);
      }
    }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    if (auth && auth.app) await signOut(auth);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "bg-gradient-to-r from-orange-600/95 via-amber-500/95 to-orange-600/95 backdrop-blur-xl shadow-2xl" : "bg-gradient-to-r from-orange-600/80 via-amber-500/80 to-orange-600/80 backdrop-blur-sm"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-12 h-12 rounded-xl bg-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg"
            >
              <Gamepad2 className="h-7 w-7 text-orange-500" />
            </motion.div>
            <span className="text-3xl font-black text-black">6gamer</span>
          </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-black/80 hover:text-black transition-colors flex items-center gap-2 text-lg font-bold group">
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" /> Home
              </Link>
              <Link href="/games" className="text-black/80 hover:text-black transition-colors flex items-center gap-2 text-lg font-bold group">
                <Gamepad2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> Games
              </Link>
              <Link href="/leadership" className="text-black/80 hover:text-black transition-colors flex items-center gap-2 text-lg font-bold group">
                <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" /> Leaderboard
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 text-black/80 hover:text-black transition-all hover:scale-110">
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 bg-black/90 backdrop-blur-xl border-yellow-500/20 text-white rounded-3xl p-4 mr-4">
                  <DropdownMenuLabel className="text-yellow-500 font-black uppercase text-[10px] tracking-widest p-2">Recent Alerts</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <DropdownMenuItem key={notif.id} className="p-4 focus:bg-white/5 rounded-2xl cursor-default">
                          <div className="space-y-1">
                            <p className="font-black text-sm uppercase text-yellow-500 flex items-center gap-2">
                              {notif.type === 'error' ? '🚨' : notif.type === 'warning' ? '⚠️' : '📢'} {notif.title}
                            </p>
                            <p className="text-xs text-white/60 leading-relaxed italic">"{notif.content}"</p>
                            <p className="text-[8px] text-white/20 uppercase font-bold">{new Date(notif.createdAt).toLocaleDateString()}</p>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <p className="text-center py-10 text-white/20 font-black uppercase text-[10px]">No new alerts</p>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {user ? (

              <div className="flex items-center space-x-3">
                <Link href="/user-dashboard">
                  <Button className="bg-black text-orange-400 hover:bg-black/90 font-bold px-6 py-5 text-base hover:scale-105 transition-transform">
                    <User className="mr-2 h-5 w-5" /> Dashboard
                  </Button>
                </Link>
                <Button 
                  onClick={handleSignOut} 
                  variant="ghost" 
                  className="text-black hover:text-red-700 hover:bg-black/10"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" className="text-black hover:text-black hover:bg-black/10 font-bold text-base px-6">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-black text-orange-400 font-bold hover:scale-105 transition-transform px-6 py-5 text-base shadow-lg hover:bg-black/90">
                    <Sparkles className="w-4 h-4 mr-2" /> Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-black p-2 hover:bg-black/10 rounded-lg transition-colors"
            >
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-gradient-to-b from-amber-500 to-orange-600 p-6 space-y-4"
        >
          <Link href="/" className="flex items-center gap-3 text-black font-bold text-lg py-3 hover:bg-black/10 px-4 rounded-xl transition-colors" onClick={() => setIsOpen(false)}>
            <Home className="w-5 h-5" /> Home
          </Link>
          <Link href="/games" className="flex items-center gap-3 text-black font-bold text-lg py-3 hover:bg-black/10 px-4 rounded-xl transition-colors" onClick={() => setIsOpen(false)}>
            <Gamepad2 className="w-5 h-5" /> Games
          </Link>
          <Link href="/leadership" className="flex items-center gap-3 text-black font-bold text-lg py-3 hover:bg-black/10 px-4 rounded-xl transition-colors" onClick={() => setIsOpen(false)}>
            <Trophy className="w-5 h-5" /> Leaderboard
          </Link>
          {user ? (
            <>
              <Link href="/user-dashboard" className="flex items-center gap-3 text-black font-bold text-lg py-3 hover:bg-black/10 px-4 rounded-xl transition-colors" onClick={() => setIsOpen(false)}>
                <User className="w-5 h-5" /> Dashboard
              </Link>
              <button onClick={handleSignOut} className="flex items-center gap-3 w-full text-left text-red-800 font-bold text-lg py-3 hover:bg-black/10 px-4 rounded-xl transition-colors">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 pt-4">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full border-2 border-black text-black font-bold text-lg py-5">Login</Button>
              </Link>
              <Link href="/signup" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-black text-orange-400 font-bold text-lg py-5">Sign Up</Button>
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </nav>
  );
}
