"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gamepad2, Users, Trophy, Star, Target, Crown, Sparkles, Flame, Rocket, Play, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const defaultBanners = [
  {
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070",
    title: "Level Up Your Skills",
    subtitle: "Experience gaming like never before with 6GAMER."
  },
  {
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2071",
    title: "Real-Time Leadership",
    subtitle: "Compete with players worldwide and reach the top."
  },
  {
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070",
    title: "Premium Gold Theme",
    subtitle: "A royal experience for professional gamers."
  }
];

const games = [
  { id: "ball-maze", name: "Ball Maze", icon: "⚽", desc: "Navigate through golden mazes with precision controls", color: "from-amber-500 to-orange-600", disabled: false },
  { id: "ghost-kill", name: "Ghost Kill", icon: "👻", desc: "Slay ghosts with your cursor and reflexes", color: "from-purple-500 to-pink-600", disabled: false },
  { id: "bird-fly", name: "Bird Fly", icon: "🐦", desc: "Fly through challenging obstacles", color: "from-cyan-500 to-blue-600", disabled: false },
  { id: "snake-pro", name: "Snake Pro", icon: "🐍", desc: "Classic snake game reimagined", color: "from-green-500 to-emerald-600", disabled: false },
  { id: "typing-master", name: "Typing Master", icon: "⌨️", desc: "Test your typing speed and accuracy", color: "from-rose-500 to-red-600", disabled: false },
  { id: "word-maker", name: "Word Maker", icon: "🔤", desc: "Create words from scrambled letters", color: "from-indigo-500 to-violet-600", disabled: false },
  { id: "ludo-king", name: "Ludo King", icon: "🎲", desc: "The classic board game with a gold twist (Coming Soon)", color: "from-amber-400 to-yellow-600", disabled: true },
  { id: "car-racing", name: "Car Racing", icon: "🏎️", desc: "High-speed highway racing (Coming Soon)", color: "from-slate-500 to-slate-800", disabled: true },
];

const experienceImages = [
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2071",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=2070"
];

const experienceFeatures = [
  { icon: Sparkles, text: "Ultra-Premium Gold UI" },
  { icon: Target, text: "10 Levels of Mastery" },
  { icon: Trophy, text: "Real-time Leaderboards" },
  { icon: Rocket, text: "Zero Lag Performance" }
];

export default function Home() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdmin(localStorage.getItem("adminAuth") === "true");
    }
  }, []);

  const handlePlayNow = (id: string) => {
    if (typeof window !== "undefined") {
      const isAdminAuth = localStorage.getItem("adminAuth") === "true";
      if (auth.currentUser || isAdminAuth) {
        router.push(`/games/${id}`);
      } else {
        toast.error("Strict Auth: Please login to play");
        router.push("/login");
      }
    }
  };

  const [banners, setBanners] = useState(defaultBanners);

  useEffect(() => {
    if (!db || !db.app) return;
    try {
      const unsub = onSnapshot(collection(db, "banners"), (snap) => {
        if (!snap.empty) {
          setBanners(snap.docs.map(d => d.data() as any));
        }
      });
      return () => unsub();
    } catch (e) {
      console.error("Firestore banners error:", e);
    }
  }, []);

  const [gameList, setGameList] = useState(games);

  useEffect(() => {
    if (!db || !db.app) return;
    try {
      const unsub = onSnapshot(collection(db, "games"), (snap) => {
        if (!snap.empty) {
          const cloudGames = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
          // Merge with local to preserve colors/icons if not in cloud
          const merged = games.map(lg => {
            const cg = cloudGames.find(g => g.id === lg.id);
            return cg ? { ...lg, ...cg } : lg;
          });
          setGameList(merged);
        }
      });
      return () => unsub();
    } catch (e) {
      console.error("Firestore games error:", e);
    }
  }, []);

  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentGameSlide, setCurrentGameSlide] = useState(0);
  const [currentExpImage, setCurrentExpImage] = useState(0);
  const [currentFeatureSet, setCurrentFeatureSet] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % (banners.length || 1));
    }, 5000);
    
    const gameTimer = setInterval(() => {
      setCurrentGameSlide((prev) => (prev + 1) % (gameList.length || 1));
    }, 3000);
    
    const expTimer = setInterval(() => {
      setCurrentExpImage((prev) => (prev + 1) % (experienceImages.length || 1));
    }, 4000);
    
    const featureTimer = setInterval(() => {
      setCurrentFeatureSet((prev) => (prev + 1) % 2);
    }, 3500);

    return () => {
      clearInterval(bannerTimer);
      clearInterval(gameTimer);
      clearInterval(expTimer);
      clearInterval(featureTimer);
    };
  }, [banners.length, gameList.length, experienceImages.length]);

  return (
    <div ref={containerRef} className="flex flex-col w-full dark galaxy-bg min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 galaxy-stars pointer-events-none z-0" />
      
      <section 
        className="relative z-10 pt-32 pb-16 px-6"
      >
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-6xl mx-auto"
        >
          <div className="flex items-center justify-center gap-6 mb-10">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-16 h-16 md:w-24 md:h-24 rounded-3xl gold-gradient flex items-center justify-center animate-pulse-glow shadow-2xl"
            >
              <Gamepad2 className="h-10 w-10 md:h-14 md:w-14 text-black" />
            </motion.div>
            <div>
              <h1 className="text-8xl md:text-[13rem] font-black gold-text-gradient tracking-tight leading-none">
                6GAMER
              </h1>
              <div className="h-3 gold-gradient rounded-full mt-4 shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
            </div>
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-yellow-500" />
            </motion.div>
          </div>
          <p className="text-2xl md:text-4xl text-orange-400 font-black mb-6 drop-shadow-lg uppercase">
            The Best Place to Play
          </p>
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="h-2 w-32 gold-gradient rounded-full shadow-lg" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Crown className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
            </motion.div>
            <div className="h-2 w-32 gold-gradient rounded-full shadow-lg" />
          </div>
        </motion.div>
      </section>

      <motion.section 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="relative h-[65vh] overflow-hidden mx-6 rounded-[3rem] z-10 gold-border-glow shadow-2xl"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${banners[currentBanner].image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 flex flex-col items-center justify-center text-center p-8">
                <h2 className="text-5xl md:text-7xl font-black gold-text-gradient mb-6 drop-shadow-2xl uppercase">
                  {banners[currentBanner].title}
                </h2>
                {banners[currentBanner].category && (
                  <Badge className="mb-6 gold-gradient text-black font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full text-sm">
                    {banners[currentBanner].category}
                  </Badge>
                )}
                <p className="text-2xl md:text-3xl text-orange-200 max-w-4xl font-bold mb-10 drop-shadow-lg uppercase italic">
                  {banners[currentBanner].subtitle}
                </p>
                <Link href={banners[currentBanner].link || "/signup"}>
                  <Button size="lg" className="gold-gradient text-black text-2xl px-12 py-8 rounded-full animate-pulse-glow hover:scale-110 transition-transform font-black shadow-[0_0_30px_rgba(251,191,36,0.6)]">
                    <Play className="w-8 h-8 mr-3 fill-current" /> {banners[currentBanner].link ? "EXPLORE NOW" : "PLAY NOW"}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-10">
          {banners.map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                width: i === currentBanner ? 60 : 16,
                opacity: i === currentBanner ? 1 : 0.4
              }}
              transition={{ duration: 0.5 }}
              className={`h-4 rounded-full cursor-pointer shadow-md ${i === currentBanner ? "gold-gradient" : "bg-white"}`}
              onClick={() => setCurrentBanner(i)}
            />
          ))}
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-24 relative z-10 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-8"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center animate-pulse-glow shadow-2xl">
                <Gamepad2 className="w-14 h-14 text-white" />
              </div>
            </motion.div>
            <h2 className="text-6xl md:text-7xl font-black gold-text-gradient mb-6 uppercase">Our Best Games</h2>
            <p className="text-2xl text-orange-400 font-black uppercase tracking-widest">6 Fun Games • Unlimited Levels</p>
          </div>

            <div className="relative h-[750px]">
              <div className="flex items-center justify-center h-full perspective-2000">
                <AnimatePresence mode="sync">
                  {gameList.map((game, i) => {
                    const offset = (i - currentGameSlide + gameList.length) % gameList.length;
                    const isCenter = offset === 0;
                    const isLeft = offset === gameList.length - 1;
                    const isRight = offset === 1;
                    const isVisible = isCenter || isLeft || isRight;

                    if (!isVisible) return null;

                    return (
                      <motion.div
                        key={game.name}
                        initial={{ opacity: 0, scale: 0.4, z: -1000 }}
                        animate={{
                          opacity: isCenter ? 1 : 0.4,
                          scale: isCenter ? 1 : 0.6,
                          x: isCenter ? 0 : isLeft ? -450 : 450,
                          z: isCenter ? 0 : -500,
                          zIndex: isCenter ? 10 : 5,
                          rotateY: isCenter ? 0 : isLeft ? 45 : -45,
                        }}
                        exit={{ opacity: 0, scale: 0.4, z: -1000 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="absolute"
                      >
                        <div className={`w-[380px] p-12 rounded-[3rem] gold-border-glow bg-black/95 backdrop-blur-2xl text-center ${isCenter ? "shadow-[0_0_80px_rgba(251,191,36,0.4)]" : ""}`}>
                          <motion.div 
                            className={`w-[160px] h-[160px] rounded-[2.5rem] bg-gradient-to-br ${game.color} mx-auto mb-10 flex items-center justify-center shadow-2xl relative overflow-hidden`}
                            animate={isCenter ? { y: [0, -20, 0], rotate: [0, 10, -10, 0] } : {}}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <div className="absolute inset-0 shimmer-effect opacity-30" />
                            <span className="text-7xl relative z-10">{game.icon}</span>
                          </motion.div>
                          <h4 className="text-4xl font-black gold-text-gradient mb-6 uppercase">{game.name}</h4>
                          <p className="text-lg text-orange-200 mb-10 font-bold leading-relaxed italic">"{game.desc}"</p>
                          {isCenter && (
                            <Button 
                                onClick={() => (isAdmin || !game.disabled) && handlePlayNow(game.id)}
                                disabled={!isAdmin && game.disabled}
                                className={`gold-gradient text-black font-black px-10 py-7 text-xl rounded-full hover:scale-110 transition-transform shadow-2xl ${(!isAdmin && game.disabled) ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-glow'}`}
                              >
                                {isAdmin && game.disabled ? "TEST MODE" : game.disabled ? "SOON" : "PLAY NOW"} <ArrowRight className="ml-2 w-6 h-6" />
                              </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
              {gameList.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setCurrentGameSlide(i)}
                  whileHover={{ scale: 1.5 }}
                  className={`h-4 rounded-full transition-all duration-500 shadow-md ${
                    i === currentGameSlide ? "w-14 gold-gradient" : "w-4 bg-orange-500/30"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="text-center mt-20">
            <Link href="/games">
              <Button className="gold-gradient text-black px-16 py-9 rounded-full text-2xl hover:scale-110 transition-transform font-black shadow-[0_0_40px_rgba(251,191,36,0.5)]">
                <Rocket className="w-8 h-8 mr-3" /> SEE ALL GAMES
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-24 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-6xl md:text-7xl font-black gold-text-gradient mb-10 leading-tight uppercase tracking-tighter">Best Way to Play</h2>
              <p className="text-2xl text-orange-100 mb-12 leading-relaxed font-medium italic">
                Our platform has a beautiful gold look with super fast speed and live best player scores.
              </p>
              <ul className="space-y-8">
                {[
                  { icon: Sparkles, text: "Best Gold Design" },
                  { icon: Target, text: "Play Forever" },
                  { icon: Trophy, text: "Live Best Scores" },
                  { icon: Rocket, text: "Fast & Smooth" }
                ].slice(currentFeatureSet * 2, currentFeatureSet * 2 + 2).map((item, i) => (
                    <motion.li 
                      key={`${currentFeatureSet}-${i}`}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="flex items-center space-x-6 group cursor-pointer bg-black/40 p-4 rounded-2xl gold-border-glow/30"
                    >
                      <div className="w-16 h-16 rounded-xl gold-gradient flex items-center justify-center group-hover:animate-pulse-glow shadow-xl">
                        <item.icon className="h-8 w-8 text-black" />
                      </div>
                      <span className="text-2xl text-orange-100 group-hover:text-yellow-400 transition-colors font-black uppercase tracking-widest">{item.text}</span>
                    </motion.li>
                  ))}
              </ul>
              <div className="flex gap-3 mt-8">
                {[0, 1].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      width: i === currentFeatureSet ? 40 : 12,
                      opacity: i === currentFeatureSet ? 1 : 0.4
                    }}
                    className={`h-3 rounded-full cursor-pointer ${i === currentFeatureSet ? "gold-gradient" : "bg-orange-500/30"}`}
                    onClick={() => setCurrentFeatureSet(i)}
                  />
                ))}
              </div>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square rounded-[3rem] overflow-hidden gold-border-glow shadow-2xl relative">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentExpImage}
                    src={experienceImages[currentExpImage]}
                    alt="Game Preview" 
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8 }}
                    className="w-full h-full object-cover grayscale-[20%] contrast-125 absolute inset-0"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-3/4 h-3/4 rounded-full border-4 border-yellow-500/30 blur-xl"
                  />
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                  {experienceImages.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        scale: i === currentExpImage ? 1.2 : 1,
                        opacity: i === currentExpImage ? 1 : 0.4
                      }}
                      className={`w-3 h-3 rounded-full cursor-pointer ${i === currentExpImage ? "gold-gradient" : "bg-white/50"}`}
                      onClick={() => setCurrentExpImage(i)}
                    />
                  ))}
                </div>
              </div>
              <motion.div 
                animate={{ y: [0, -25, 0], rotate: [0, 15, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-10 -right-10 w-28 h-28 gold-gradient rounded-[2rem] flex items-center justify-center shadow-2xl animate-pulse-glow"
              >
                <Trophy className="h-14 w-14 text-black" />
              </motion.div>
              <motion.div 
                animate={{ y: [0, 20, 0], x: [0, -12, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl p-4"
              >
                <Flame className="h-14 w-14 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Join Now Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 relative z-10 bg-black/50"
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Crown className="w-24 h-24 mx-auto mb-10 text-yellow-500 drop-shadow-xl" />
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-black gold-text-gradient mb-6 tracking-tight uppercase">Ready to Play?</h2>
          <p className="text-2xl mb-12 text-orange-200 max-w-3xl mx-auto font-bold leading-relaxed uppercase italic">Start playing now and be the best on our list!</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link href="/signup">
              <Button size="lg" className="gold-gradient text-black px-14 py-8 text-2xl rounded-full hover:scale-110 transition-all font-black shadow-2xl">
                <Sparkles className="w-7 h-7 mr-3" /> SIGN UP
              </Button>
            </Link>
            <Link href="/leadership">
              <Button size="lg" variant="outline" className="px-14 py-8 text-2xl rounded-full border-4 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 transition-all font-black hover:scale-110">
                <Trophy className="w-7 h-7 mr-3" /> BEST PLAYERS
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 py-16 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
                  <Gamepad2 className="w-7 h-7 text-orange-400" />
                </div>
                <span className="text-3xl font-black text-black">6GAMER</span>
              </div>
              <p className="text-black/80 font-black uppercase">The best place to play fun games and see your score.</p>
            </div>
            
            <div>
              <h4 className="text-xl font-black text-black mb-6 uppercase">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-black/80 hover:text-black font-bold transition-colors uppercase">Home</Link></li>
                <li><Link href="/games" className="text-black/80 hover:text-black font-bold transition-colors uppercase">Games</Link></li>
                <li><Link href="/leadership" className="text-black/80 hover:text-black font-bold transition-colors uppercase">Best Players</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-black text-black mb-6 uppercase">Account</h4>
                <ul className="space-y-3">
                  <li><Link href="/login" className="text-black/80 hover:text-black font-bold transition-colors uppercase">Login</Link></li>
                  <li><Link href="/signup" className="text-black/80 hover:text-black font-bold transition-colors uppercase">Sign Up</Link></li>
                </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-black text-black mb-6 uppercase">More</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-black/80 hover:text-black font-bold transition-colors uppercase">About Us</Link></li>
                <li><Link href="/terms" className="text-black/80 hover:text-black font-bold transition-colors uppercase">Rules</Link></li>
                <li><Link href="/privacy" className="text-black/80 hover:text-black font-bold transition-colors uppercase">Privacy Policy</Link></li>
                <li><Link href="/contact" className="text-black/80 hover:text-black font-bold transition-colors uppercase">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t-4 border-black/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-black text-lg font-black uppercase">© 2026 6GAMER. ALL RIGHTS RESERVED.</p>
            <p className="text-black/80 text-sm font-bold">Developed by Aman Shukla, Mamta, Shammi</p>
            <div className="flex items-center gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                <Crown className="w-8 h-8 text-black" />
              </motion.div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
