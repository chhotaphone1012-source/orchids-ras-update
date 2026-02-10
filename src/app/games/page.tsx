"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Star, Zap, Clock, Trophy, Play, ChevronRight, Crown, Sparkles, ChevronLeft, Users, Timer } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";
import { ScrollFadeIn, ScrollScale } from "@/components/animations/ScrollAnimations";
import { collection, getDocs } from "firebase/firestore";

const games = [
    { id: "ball-maze", name: "Ball Maze", icon: "⚽", desc: "Move the ball to the goal. Don't hit the walls!", color: "from-amber-500 to-orange-600", difficulty: "Medium", disabled: false },
    { id: "ghost-kill", name: "Ghost Kill", icon: "👻", desc: "Kill ghosts as fast as you can!", color: "from-purple-500 to-pink-600", difficulty: "Hard", disabled: false },
    { id: "bird-fly", name: "Bird Fly", icon: "🐦", desc: "Fly through the pipes. Tap to fly up!", color: "from-cyan-500 to-blue-600", difficulty: "Easy", disabled: false },
    { id: "snake-pro", name: "Snake Pro", icon: "🐍", desc: "Eat food and grow the longest snake!", color: "from-green-500 to-emerald-600", difficulty: "Medium", disabled: false },
    { id: "typing-master", name: "Typing Master", icon: "⌨️", desc: "Type the words quickly to score points!", color: "from-rose-500 to-red-600", difficulty: "Hard", disabled: false },
    { id: "word-maker", name: "Word Maker", icon: "🔤", desc: "Create words using the letters given!", color: "from-indigo-500 to-violet-600", difficulty: "Medium", disabled: false },
    { id: "ludo-king", name: "Ludo King", icon: "🎲", desc: "Roll the dice and race your pieces home!", color: "from-amber-400 to-yellow-600", difficulty: "Medium", disabled: true },
    { id: "car-racing", name: "Car Racing", icon: "🏎️", desc: "Fast racing game. Coming soon!", color: "from-slate-500 to-slate-800", difficulty: "Hard", disabled: true },
    { id: "educational-adventures", name: "Educational Adventures", icon: "🧠", desc: "Learn Math, Science, History & more while playing!", color: "from-purple-500 to-blue-600", difficulty: "Medium", disabled: true },
    { id: "endless-runner", name: "Endless Runner", icon: "🏃", desc: "Run, jump, slide! Collect coins and avoid obstacles!", color: "from-indigo-500 to-purple-600", difficulty: "Medium", disabled: true },
];

export default function GamesPage() {
  const [gamesList, setGamesList] = useState<any[]>([]);
  const [featuredGame, setFeaturedGame] = useState(0);
  const [gameSlide, setGameSlide] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "games"));
        if (!querySnapshot.empty) {
          const gamesData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const colors: any = {
                'ball-maze': 'from-amber-500 to-orange-600',
                'ghost-kill': 'from-purple-500 to-pink-600',
                'bird-fly': 'from-cyan-500 to-blue-600',
                'snake-pro': 'from-green-500 to-emerald-600',
                'typing-master': 'from-rose-500 to-red-600',
                'word-maker': 'from-indigo-500 to-violet-600',
                'ludo-king': 'from-amber-400 to-yellow-600',
                'car-racing': 'from-slate-500 to-slate-800',
                'educational-adventures': 'from-purple-500 to-blue-600',
                'endless-runner': 'from-indigo-500 to-purple-600'
              };
              const difficulties: any = {
                'ball-maze': 'Medium',
                'ghost-kill': 'Hard',
                'bird-fly': 'Easy',
                'snake-pro': 'Medium',
                'typing-master': 'Hard',
                'word-maker': 'Medium',
                'ludo-king': 'Medium',
                'car-racing': 'Hard',
                'educational-adventures': 'Medium',
                'endless-runner': 'Medium'
              };
            return { 
              id: doc.id, 
              ...data, 
              color: colors[doc.id] || 'from-gray-500 to-gray-600',
              difficulty: difficulties[doc.id] || 'Medium'
            };
          });
          setGamesList(gamesData);
        } else {
          setGamesList(games);
        }
      } catch (error) {
        setGamesList(games);
      }
    };
    fetchGames();
  }, []);

  const handlePlayNow = (id: string) => {
    if (typeof window !== "undefined") {
      const isAdminAuth = localStorage.getItem("adminAuth") === "true";
      if (auth.currentUser || isAdminAuth) {
        router.push(`/games/${id}`);
      } else {
        toast.error("Login First: Please sign in to play");
        router.push("/login");
      }
    }
  };

  const nextSlide = () => {
    if (gamesList.length === 0) return;
    setGameSlide((prev) => (prev + 1) % Math.ceil(gamesList.length / 3));
  };

  const prevSlide = () => {
    if (gamesList.length === 0) return;
    setGameSlide((prev) => (prev - 1 + Math.ceil(gamesList.length / 3)) % Math.ceil(gamesList.length / 3));
  };

  const visibleGames = gamesList.slice(gameSlide * 3, gameSlide * 3 + 3);

  useEffect(() => {
    if (gamesList.length === 0) return;
    const timer = setInterval(() => {
      setFeaturedGame((prev) => (prev + 1) % gamesList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [gamesList.length]);

  useEffect(() => {
    if (gamesList.length === 0) return;
    const slideTimer = setInterval(() => {
      setGameSlide((prev) => (prev + 1) % Math.ceil(gamesList.length / 3));
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [gamesList.length]);

  return (
    <div className="min-h-screen galaxy-bg relative overflow-x-hidden">
      <div className="galaxy-stars fixed inset-0 pointer-events-none z-0" />
      
      <div className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <div className="w-24 h-24 rounded-3xl gold-gradient flex items-center justify-center animate-pulse-glow shadow-2xl">
                <Gamepad2 className="w-14 h-14 text-black" />
              </div>
            </motion.div>
            <h1 className="text-7xl md:text-8xl font-black gold-text-gradient mb-6 uppercase tracking-tighter">Games</h1>
            <p className="text-2xl text-orange-400 font-black max-w-2xl mx-auto uppercase tracking-widest">
              6 Fun Games • 10 Levels
            </p>
          </motion.div>
          
          <ScrollFadeIn direction="up" delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {[
                { label: "Games", value: "6", icon: Gamepad2 },
                { label: "Levels", value: "10", icon: Star },
                { label: "Save Points", value: "Yes", icon: Zap },
                { label: "Scores", value: "Live", icon: Trophy },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-8 rounded-[2rem] gold-border-glow bg-black/60 backdrop-blur-sm text-center border-2 border-orange-500/20 shadow-xl"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                  >
                    <stat.icon className="w-10 h-10 mx-auto mb-4 text-orange-500" />
                  </motion.div>
                  <div className="text-3xl font-black gold-text-gradient uppercase tracking-tight">{stat.value}</div>
                  <div className="text-xs text-orange-300 font-black uppercase tracking-[0.2em] mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </ScrollFadeIn>

          <ScrollFadeIn direction="up" delay={0.2}>
            <div className="mb-20">
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-4xl font-black gold-text-gradient mb-10 text-center uppercase tracking-tighter"
              >
                <Crown className="inline-block mr-4 w-10 h-10 text-yellow-500 animate-pulse" /> Best of Today
              </motion.h2>
                <div className="relative h-[350px] sm:h-[450px] overflow-hidden rounded-2xl sm:rounded-[3rem] gold-border-glow shadow-2xl">
                  <AnimatePresence mode="wait">
                    {gamesList.length > 0 && (
                      <motion.div
                        key={featuredGame}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.8 }}
                        className={`absolute inset-0 bg-gradient-to-br ${gamesList[featuredGame].color} p-6 sm:p-16 flex items-center justify-between`}
                      >
                        <div className="flex-1">
                          <motion.span 
                            className="text-[6rem] sm:text-[12rem] block mb-6 filter drop-shadow-2xl"
                            animate={{ y: [0, -30, 0], rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                          >
                            {gamesList[featuredGame].icon}
                          </motion.span>
                        </div>
                        <div className="flex-1 text-white">
                          <div className="flex items-center gap-3 mb-2 sm:mb-4">
                            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400" />
                            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-white/80">Great Game</span>
                          </div>
                          <h3 className="text-3xl sm:text-7xl font-black mb-3 sm:mb-6 uppercase tracking-tighter">{gamesList[featuredGame].name}</h3>
                          <p className="text-sm sm:text-2xl mb-6 sm:mb-10 text-white/90 font-bold italic leading-relaxed hidden sm:block">"{gamesList[featuredGame].description || gamesList[featuredGame].desc}"</p>
                          <Button 
                            disabled={gamesList[featuredGame].disabled}
                            onClick={() => handlePlayNow(gamesList[featuredGame].id)}
                            size="lg" 
                            className={`${gamesList[featuredGame].disabled ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-black text-orange-400'} font-black px-6 sm:px-14 py-5 sm:py-9 text-base sm:text-2xl rounded-full hover:scale-110 transition-transform shadow-[0_0_40px_rgba(0,0,0,0.5)]`}
                          >
                          {gamesList[featuredGame].disabled ? (
                            <><Timer className="w-8 h-8 mr-3" /> SOON</>
                          ) : (
                            <><Play className="w-8 h-8 mr-3 fill-current" /> PLAY</>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                  {gamesList.map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setFeaturedGame(i)}
                      animate={{ 
                        width: i === featuredGame ? 60 : 16,
                        opacity: i === featuredGame ? 1 : 0.4
                      }}
                      className={`h-4 rounded-full transition-all cursor-pointer shadow-md ${i === featuredGame ? "bg-white" : "bg-white/50"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ScrollFadeIn>

          <ScrollFadeIn direction="up" delay={0.3}>
            <div className="relative">
              <div className="flex justify-between items-center mb-8">
                <Button 
                  onClick={prevSlide}
                  className="gold-gradient text-black font-black px-6 py-4 rounded-full hover:scale-110 transition-transform"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <div className="flex gap-3">
                  {Array.from({ length: Math.ceil(gamesList.length / 3) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setGameSlide(i)}
                      className={`w-4 h-4 rounded-full transition-all ${gameSlide === i ? "bg-orange-500 w-10" : "bg-white/30"}`}
                    />
                  ))}
                </div>
                <Button 
                  onClick={nextSlide}
                  className="gold-gradient text-black font-black px-6 py-4 rounded-full hover:scale-110 transition-transform"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={gameSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {visibleGames.map((game, i) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -10, scale: 1.02 }}
                      className="group"
                    >
                      <Card className="gold-border-glow bg-black/70 backdrop-blur-3xl overflow-hidden h-full flex flex-col rounded-[2rem] border-2 border-orange-500/10">
                        <div className={`h-40 bg-gradient-to-br ${game.color} flex items-center justify-center relative overflow-hidden`}>
                          <motion.span 
                            className="text-[6rem] relative z-10 filter drop-shadow-2xl"
                            animate={{ y: [0, -10, 0], rotate: [0, 8, -8, 0] }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                          >
                            {game.icon}
                          </motion.span>
                          <div className="absolute inset-0 shimmer-effect opacity-30" />
                          <div className="absolute top-4 right-4">
                            <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl ${
                              game.difficulty === "Easy" ? "bg-green-500 text-white" :
                              game.difficulty === "Medium" ? "bg-yellow-500 text-black" :
                              "bg-red-500 text-white"
                            }`}>
                              {game.difficulty}
                            </span>
                          </div>
                        </div>
                        <CardHeader className="p-5 pb-2">
                          <CardTitle className="flex justify-between items-center text-xl font-black gold-text-gradient uppercase tracking-tighter">
                            {game.name}
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, j) => (
                                <Star key={j} className="h-3 w-3 text-orange-500 fill-orange-500" />
                              ))}
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col p-5 pt-0">
                          <p className="text-sm text-orange-100 font-bold italic mb-4 flex-grow leading-relaxed">"{game.description || game.desc}"</p>
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-orange-400 mb-4 bg-black/40 p-3 rounded-xl border border-white/5">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-yellow-500" /> {game.players?.toLocaleString() || 0}
                            </span>
                            <div className="h-3 w-[1px] bg-white/10" />
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3 text-cyan-400" /> {game.topScore?.toLocaleString() || 0}
                            </span>
                            <div className="h-3 w-[1px] bg-white/10" />
                            <span className={`flex items-center gap-1 ${game.disabled ? 'text-orange-500' : 'text-green-500'}`}>
                              {game.disabled ? <Clock className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                              {game.disabled ? 'SOON' : 'LIVE'}
                            </span>
                          </div>
                          <Button 
                            disabled={game.disabled}
                            onClick={() => handlePlayNow(game.id)}
                            className={`w-full ${game.disabled ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'gold-gradient text-black'} font-black text-base py-5 rounded-xl transition-all shadow-2xl`}
                          >
                            {game.disabled ? (
                              <><Clock className="w-4 h-4 mr-2" /> COMING SOON</>
                            ) : (
                              <><Play className="w-4 h-4 mr-2 fill-current" /> PLAY NOW</>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </ScrollFadeIn>

          <ScrollScale delay={0.2}>
            <motion.div className="mt-24">
              <Card className="gold-border-glow bg-black/80 backdrop-blur-3xl p-10 rounded-[3rem] max-w-2xl mx-auto text-center border-2 border-yellow-500/20 relative overflow-hidden group">
                <div className="absolute inset-0 shimmer-effect opacity-10" />
                <motion.div
                  animate={{ y: [0, -15, 0], rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="mb-6"
                >
                  <Crown className="w-18 h-18 mx-auto text-yellow-500 drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]" />
                </motion.div>
                <h3 className="text-3xl font-black gold-text-gradient mb-4 uppercase tracking-tighter">World Ranking</h3>
                <p className="text-lg text-orange-100 font-bold mb-8 uppercase tracking-widest leading-relaxed">YOUR POINTS ARE SAVED. BE IN THE TOP 50!</p>
                <Link href="/leadership">
                  <Button className="gold-gradient text-black font-black px-12 py-6 text-lg rounded-full hover:scale-110 transition-transform shadow-[0_0_40px_rgba(251,191,36,0.4)]">
                    <Trophy className="w-6 h-6 mr-2" /> SEE TOP PLAYERS
                  </Button>
                </Link>
              </Card>
            </motion.div>
          </ScrollScale>
        </div>
      </div>

      <footer className="relative z-10 bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 py-16 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 text-left">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-[1.2rem] bg-black flex items-center justify-center shadow-2xl gold-border-glow">
                  <Gamepad2 className="w-10 h-10 text-orange-500" />
                </div>
                <span className="text-5xl font-black text-black tracking-tighter italic">6gamer</span>
              </div>
              <p className="text-black text-xl font-black leading-relaxed max-w-lg mb-6 drop-shadow-sm uppercase">
                PLAY 6 AMAZING GAMES. BEAT YOUR FRIENDS. HAVE FUN!
              </p>
            </div>
            <div>
              <h4 className="text-2xl font-black text-black mb-6 border-b-4 border-black/30 pb-2 inline-block uppercase tracking-tighter">LINKS</h4>
              <ul className="space-y-3">
                <li><Link href="/games" className="text-black/80 hover:text-black text-lg font-black transition-all hover:translate-x-2 inline-block uppercase italic">GAMES</Link></li>
                <li><Link href="/leadership" className="text-black/80 hover:text-black text-lg font-black transition-all hover:translate-x-2 inline-block uppercase italic">RANKING</Link></li>
                <li><Link href="/" className="text-black/80 hover:text-black text-lg font-black transition-all hover:translate-x-2 inline-block uppercase italic">HOME</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-2xl font-black text-black mb-6 border-b-4 border-black/30 pb-2 inline-block uppercase tracking-tighter">MORE</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-black/80 hover:text-black text-lg font-black transition-all hover:translate-x-2 inline-block uppercase italic">ABOUT US</Link></li>
                <li><Link href="/terms" className="text-black/80 hover:text-black text-lg font-black transition-all hover:translate-x-2 inline-block uppercase italic">TERMS & SERVICE</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t-4 border-black/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-black text-xl font-black tracking-tight uppercase">© 2026 6GAMER. ALL RIGHTS RESERVED.</p>
            <p className="text-black/80 text-sm font-bold">Developed by Aman Shukla, Mamta, Shammi</p>
            <div className="flex items-center gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                <Crown className="w-10 h-10 text-black shadow-2xl" />
              </motion.div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
