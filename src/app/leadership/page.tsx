"use client";
// Updated leaderboard page v2

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Star, Crown, Flame, Target, Gamepad2, Filter, ChevronLeft, ChevronRight, ArrowLeftRight, X, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";

const gamesList = [
  { id: "all", name: "All Games", icon: "🎮" },
  { id: "ball-maze", name: "Ball Maze", icon: "⚽" },
  { id: "ghost-kill", name: "Ghost Kill", icon: "👻" },
  { id: "bird-fly", name: "Bird Fly", icon: "🐦" },
    { id: "snake-pro", name: "Snake Pro", icon: "🐍" },
    { id: "typing-master", name: "Typing Master", icon: "⌨️" },
    { id: "word-maker", name: "Word Maker", icon: "🔤" },
    { id: "ludo-king", name: "Ludo King", icon: "🎲" },
  ];

const getRank = (score: number) => {
  if (score >= 8000) return { name: "Diamond", color: "from-cyan-400 to-blue-500", icon: "💎", textColor: "text-cyan-400" };
  if (score >= 5000) return { name: "Gold", color: "from-yellow-400 to-amber-500", icon: "🥇", textColor: "text-yellow-400" };
  if (score >= 2500) return { name: "Silver", color: "from-gray-300 to-gray-400", icon: "🥈", textColor: "text-gray-300" };
  return { name: "Bronze", color: "from-amber-600 to-orange-700", icon: "🥉", textColor: "text-amber-600" };
};

export default function LeaderboardPage() {
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [player1, setPlayer1] = useState<any>(null);
  const [player2, setPlayer2] = useState<any>(null);
  const [comparisonValue, setComparisonValue] = useState(50);
  const [topLegendsPage, setTopLegendsPage] = useState(0);

  useEffect(() => {
    setLoading(true);
    let q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(50));
    
    if (selectedGame !== "all") {
      q = query(collection(db, "leaderboard"), where("gameId", "==", selectedGame), orderBy("score", "desc"), limit(50));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scoresData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setScores(scoresData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching scores:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedGame]);

  const filteredScores = useMemo(() => {
    return scores.filter(s => {
      if (s.email === "admin@gmail.com" || s.email === "admin@6gamer.com" || s.username === "admin") return false;
      return s.username?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [scores, searchTerm]);

  useEffect(() => {
    if (filteredScores.length > 0) {
      const interval = setInterval(() => {
        setTopLegendsPage((prev) => {
          const totalPages = Math.ceil(filteredScores.length / 3);
          return totalPages > 0 ? (prev + 1) % totalPages : 0;
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [filteredScores.length]);

  const selectForComparison = (player: any) => {
    if (!player1) {
      setPlayer1(player);
    } else if (!player2 && player.id !== player1.id) {
      setPlayer2(player);
      setShowComparison(true);
    } else if (player1 && player2) {
      setPlayer1(player);
      setPlayer2(null);
      setShowComparison(false);
    }
  };

  const clearComparison = () => {
    setPlayer1(null);
    setPlayer2(null);
    setShowComparison(false);
    setComparisonValue(50);
  };

  const interpolate = (val1: number, val2: number, percent: number) => {
    return Math.round(val1 + (val2 - val1) * (percent / 100));
  };

  return (
    <div className="min-h-screen galaxy-bg relative overflow-x-hidden">
      <div className="galaxy-stars fixed inset-0 pointer-events-none z-0" />
      
      <div className="relative z-10 pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-16"
            >
              <motion.div
                animate={{ y: [0, -20, 0], scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-block p-10 rounded-[2.5rem] gold-gradient mb-10 animate-pulse-glow shadow-[0_0_50px_rgba(251,191,36,0.5)]"
              >
                <Trophy className="h-24 w-24 text-black" />
              </motion.div>
              <h1 className="text-7xl md:text-8xl font-black gold-text-gradient mb-4 uppercase tracking-tighter">Top Players</h1>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-1 w-20 gold-gradient rounded-full" />
                <p className="text-3xl text-orange-400 font-black tracking-widest uppercase italic">Best Players List</p>
                <div className="h-1 w-20 gold-gradient rounded-full" />
              </div>
            </motion.div>
  
            <div className="mb-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="gold-border-glow bg-black/70 backdrop-blur-2xl p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-3">
                      <Filter className="w-8 h-8 text-orange-500" />
                      <span className="text-2xl font-black text-orange-400 uppercase tracking-tighter">Pick Game</span>
                    </div>
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 z-10" />
                      <Input
                        placeholder="Search for players..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setTopLegendsPage(0);
                        }}
                        className="pl-12 bg-black/60 border-2 border-orange-500/30 text-white h-14 text-lg rounded-2xl focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {gamesList.map((game) => (
                      <motion.button
                        key={game.id}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedGame(game.id)}
                        className={`px-6 py-3 rounded-2xl font-black transition-all flex items-center gap-3 text-lg border-2 ${
                          selectedGame === game.id
                            ? "gold-gradient text-black border-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                            : "bg-amber-100/90 text-orange-500 border-amber-200 hover:bg-amber-200/90"
                        }`}
                      >
                        <span className="text-2xl">{game.icon}</span>
                        <span>{game.name.toUpperCase()}</span>
                      </motion.button>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
  
            <AnimatePresence>
              {(player1 || player2) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-12"
                >
                  <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl p-10 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-8">
                      <h3 className="text-3xl font-black text-white flex items-center gap-4 uppercase tracking-tighter">
                        <ArrowLeftRight className="w-10 h-10 text-orange-500 animate-pulse" /> Compare Stats
                      </h3>
                      <Button onClick={clearComparison} className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border-2 border-red-600/30 transition-all font-black px-6 py-6 rounded-2xl">
                        <X className="w-6 h-6 mr-2" /> CLOSE
                      </Button>
                    </div>
                    
                    {!player2 ? (
                      <div className="text-center py-10 bg-orange-500/5 rounded-[2rem] border-2 border-dashed border-orange-500/20">
                        <p className="text-3xl font-black text-orange-400 mb-2">PICKED: <span className="text-white underline decoration-yellow-500">{player1.username.toUpperCase()}</span></p>
                        <p className="text-xl text-orange-300/60 font-bold uppercase italic">Click another player to compare</p>
                      </div>
                    ) : (
                      <div className="space-y-10">
                        <div className="flex items-center justify-between gap-8 relative">
                          <motion.div 
                            className="flex-1 p-8 rounded-[2rem] bg-gradient-to-r from-orange-500/30 to-black/40 border-2 border-orange-500/50 text-center"
                            animate={{ opacity: comparisonValue > 60 ? 0.3 : 1, scale: comparisonValue > 60 ? 0.95 : 1.05 }}
                          >
                            <p className="text-4xl font-black gold-text-gradient mb-2">{player1.username.toUpperCase()}</p>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getRank(player1.score).color} text-black font-black text-lg`}>
                              {getRank(player1.score).icon} {getRank(player1.score).name.toUpperCase()}
                            </div>
                          </motion.div>
                          
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                              className="w-24 h-24 rounded-full gold-gradient flex items-center justify-center border-8 border-black shadow-[0_0_30px_rgba(251,191,36,0.6)]"
                            >
                              <span className="text-4xl font-black text-black italic">VS</span>
                            </motion.div>
                          </div>
                          
                          <motion.div 
                            className="flex-1 p-8 rounded-[2rem] bg-gradient-to-l from-cyan-500/30 to-black/40 border-2 border-cyan-500/50 text-center"
                            animate={{ opacity: comparisonValue < 40 ? 0.3 : 1, scale: comparisonValue < 40 ? 0.95 : 1.05 }}
                          >
                            <p className="text-4xl font-black text-cyan-400 mb-2">{player2.username.toUpperCase()}</p>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getRank(player2.score).color} text-black font-black text-lg`}>
                              {getRank(player2.score).icon} {getRank(player2.score).name.toUpperCase()}
                            </div>
                          </motion.div>
                        </div>
  
                        <div className="relative px-10">
                          <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                            <motion.div 
                              className="h-full gold-gradient"
                              animate={{ width: `${comparisonValue}%` }}
                            />
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={comparisonValue}
                            onChange={(e) => setComparisonValue(parseInt(e.target.value))}
                            className="absolute inset-0 w-full h-4 opacity-0 cursor-pointer z-30"
                          />
                          <div className="flex justify-between items-center text-xl font-black">
                            <span className="text-orange-500 tracking-tighter">{player1.username.toUpperCase()} POWER</span>
                            <span className="text-yellow-500 animate-pulse text-sm font-black uppercase tracking-widest">Move to see difference</span>
                            <span className="text-cyan-400 tracking-tighter">{player2.username.toUpperCase()} POWER</span>
                          </div>
                        </div>
  
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {[
                            { label: "GAME SCORE", val1: player1.score || 0, val2: player2.score || 0, color: "gold-text-gradient" },
                            { label: "PLAYER LEVEL", val1: player1.level || 1, val2: player2.level || 1, color: "text-orange-400" },
                            { label: "RANK POINTS", val1: player1.score || 0, val2: player2.score || 0, color: "text-cyan-400" },
                          ].map((stat, i) => (
                            <motion.div 
                              key={i}
                              className="p-8 rounded-[2rem] bg-black/60 border-2 border-white/5 text-center shadow-2xl relative overflow-hidden group"
                              whileHover={{ scale: 1.05 }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <p className="text-white/40 text-lg font-black mb-3 tracking-widest uppercase">{stat.label}</p>
                              <motion.p 
                                className={`text-6xl font-black ${stat.color}`}
                                key={comparisonValue}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                              >
                                {interpolate(stat.val1, stat.val2, comparisonValue).toLocaleString()}
                              </motion.p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
  
            <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl overflow-hidden rounded-[3rem]">
              <CardHeader className="p-10 border-b-2 border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <CardTitle className="text-4xl font-black gold-text-gradient flex items-center gap-5 uppercase tracking-tighter">
                  <Flame className="w-12 h-12 text-orange-500 animate-pulse" /> Best Players List
                </CardTitle>
                <div className="flex items-center gap-6 bg-black/40 p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                    <span className="text-yellow-500 font-black tracking-widest uppercase text-sm">Live Scores</span>
                  </div>
                  <div className="h-6 w-[2px] bg-orange-500/30" />
                  <span className="text-orange-400 font-black uppercase text-sm">Saving Now</span>
                </div>
              </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                  <motion.div
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 rounded-[2rem] border-8 border-yellow-500 border-t-transparent"
                  />
                  <p className="text-2xl font-black gold-text-gradient animate-pulse tracking-widest">LOADING PLAYERS...</p>
                </div>
              ) : scores.length === 0 ? (
                <div className="text-center py-32 bg-orange-500/5">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                    <Target className="w-32 h-32 mx-auto mb-8 text-orange-500/20" />
                  </motion.div>
                  <p className="text-4xl font-black text-orange-400 mb-4">NO PLAYERS FOUND</p>
                  <p className="text-xl text-orange-400/60 font-bold">Start playing to get on the list!</p>
                </div>
              ) : (
                <div className="p-8">
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={topLegendsPage}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                      >
                        {filteredScores.slice(topLegendsPage * 3, topLegendsPage * 3 + 3).map((player, index) => {
                          const actualIndex = topLegendsPage * 3 + index;
                          const playerRank = getRank(player.score || 0);
                          const isTop3 = actualIndex < 3;
                          return (
                            <motion.div
                              key={player.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, y: -5 }}
                              onClick={() => selectForComparison(player)}
                              className={`p-8 rounded-[2rem] cursor-pointer transition-all ${
                                isTop3 
                                  ? "bg-gradient-to-br from-orange-600/30 via-amber-900/40 to-yellow-600/20 border-2 border-yellow-500/50" 
                                  : "bg-gradient-to-br from-orange-900/30 via-amber-950/40 to-black/60 border-2 border-orange-500/30 hover:border-orange-400/60"
                              }`}
                            >
                              <div className="flex items-center gap-6 mb-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-xl ${
                                  actualIndex === 0 ? "gold-gradient text-black" : 
                                  actualIndex === 1 ? "bg-gray-400 text-black" : 
                                  actualIndex === 2 ? "bg-amber-700 text-black" : 
                                  "bg-black/60 text-orange-400 border border-orange-500/30"
                                }`}>
                                  {actualIndex + 1}
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-2xl font-black gold-text-gradient uppercase tracking-tight truncate">{player.username}</h3>
                                  <p className="text-orange-400/80 text-sm font-bold uppercase tracking-widest">{player.gameName}</p>
                                </div>
                                {actualIndex === 0 && (
                                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                    <Crown className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                                  </motion.div>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${playerRank.color} text-black text-sm font-black uppercase`}>
                                  {playerRank.icon} {playerRank.name}
                                </span>
                                <div className="text-right">
                                  <p className="text-3xl font-black gold-text-gradient">{player.score?.toLocaleString()}</p>
                                  <p className="text-orange-400/80 text-xs font-bold tracking-widest">PTS</p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </AnimatePresence>
                    
                    <div className="flex items-center justify-center gap-6 mt-10">
                      <Button
                        onClick={() => setTopLegendsPage(Math.max(0, topLegendsPage - 1))}
                        disabled={topLegendsPage === 0}
                        className="gold-gradient text-black font-black px-6 py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </Button>
                      <div className="flex gap-2">
                        {Array.from({ length: Math.ceil(filteredScores.length / 3) }).map((_, i) => (
                          <motion.button
                            key={i}
                            onClick={() => setTopLegendsPage(i)}
                            animate={{ 
                              scale: i === topLegendsPage ? 1.2 : 1,
                              opacity: i === topLegendsPage ? 1 : 0.4
                            }}
                            className={`w-3 h-3 rounded-full ${i === topLegendsPage ? "gold-gradient" : "bg-orange-500/30"}`}
                          />
                        ))}
                      </div>
                      <Button
                        onClick={() => setTopLegendsPage(Math.min(Math.ceil(filteredScores.length / 3) - 1, topLegendsPage + 1))}
                        disabled={topLegendsPage >= Math.ceil(filteredScores.length / 3) - 1}
                        className="gold-gradient text-black font-black px-6 py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

        <footer className="relative z-10 bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 py-16 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
              <div className="md:col-span-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-[1.2rem] bg-black flex items-center justify-center shadow-2xl gold-border-glow">
                    <Gamepad2 className="w-10 h-10 text-orange-500" />
                  </div>
                  <span className="text-5xl font-black text-black tracking-tighter">6gamer</span>
                </div>
                <p className="text-black text-xl font-bold leading-relaxed max-w-lg mb-6 drop-shadow-sm uppercase">
                  The best place to play 6 fun games and be on the top score list.
                </p>
              </div>
              <div>
                <h4 className="text-2xl font-black text-black mb-6 border-b-4 border-black/30 pb-2 inline-block uppercase">Links</h4>
                <ul className="space-y-3">
                  <li><Link href="/games" className="text-black/80 hover:text-black text-lg font-black transition-all hover:translate-x-2 inline-block uppercase italic">GAMES</Link></li>
                  <li><Link href="/" className="text-black/80 hover:text-black text-lg font-black transition-all hover:translate-x-2 inline-block uppercase italic">HOME</Link></li>
                  <li><Link href="/signup" className="text-black/80 hover:text-black text-lg font-black transition-all hover:translate-x-2 inline-block uppercase italic">SIGN UP</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-2xl font-black text-black mb-6 border-b-4 border-black/30 pb-2 inline-block uppercase">MORE</h4>
                <ul className="space-y-3">
                  <li><Link href="/about" className="text-black/80 hover:text-black text-lg font-black transition-all hover:translate-x-2 inline-block uppercase italic">ABOUT US</Link></li>
                  <li><Link href="/terms" className="text-black/80 hover:text-black text-lg font-black transition-all hover:translate-x-2 inline-block uppercase italic">Rules</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t-4 border-black/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-black text-xl font-black tracking-tight uppercase">© 2026 6GAMER. ALL RIGHTS RESERVED.</p>
              <p className="text-black/80 text-sm font-bold">Developed by Aman Shukla, Mamta, Shammi</p>
              <div className="flex items-center gap-4">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                  <Crown className="w-10 h-10 text-black shadow-lg" />
                </motion.div>
              </div>
            </div>
          </div>
        </footer>
    </div>
  );
}
