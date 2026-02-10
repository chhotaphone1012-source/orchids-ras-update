"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowLeft, RotateCcw, Volume2, VolumeX, Pause, Play, Maximize2, Minimize2, Timer } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import BallMaze from "@/components/games/BallMaze";
import GhostKill from "@/components/games/GhostKill";
import BirdFly from "@/components/games/BirdFly";
import SnakeGame from "@/components/games/SnakeGame";
import TypingMaster from "@/components/games/TypingMaster";
import WordMaker from "@/components/games/WordMaker";
import LudoKing from "@/components/games/LudoGame";
import CarRacing from "@/components/games/CarRacing";
import EducationalAdventures from "@/components/games/EducationalAdventures";
import EndlessRunner from "@/components/games/EndlessRunner";

export default function GamePage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stats, setStats] = useState({ accuracy: 0, timeEfficiency: 0, rankChange: 0 });
  const [gameData, setGameData] = useState<any>(null);
  const [gameLoading, setGameLoading] = useState(true);

  useEffect(() => {
    const fetchGame = async () => {
      const docRef = doc(db, "games", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setGameData(docSnap.data());
      }
      setGameLoading(false);
    };
    fetchGame();
  }, [id]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isFullscreen]);

  const toggleFullscreen = async (enable: boolean) => {
    try {
      if (enable) {
        setIsFullscreen(true);
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        setIsFullscreen(false);
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
      // Fallback: Just use the UI fullscreen mode without browser native fullscreen
      setIsFullscreen(enable);
    }
  };

    useEffect(() => {
      if (user && !isGameOver && !gameStarted) {
        setCountdown(3);
      }
    }, [user, id]);

    useEffect(() => {
      if (countdown !== null && countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else if (countdown === 0) {
        setCountdown(null);
        setGameStarted(true);
        toggleFullscreen(true);
      }
    }, [countdown]);

          useEffect(() => {
            const unsubscribe = onAuthStateChanged(auth, (u) => {
              const isAdminAuth = typeof window !== "undefined" && localStorage.getItem("adminAuth") === "true";
              const isAdminEmail = u?.email === "admin@6gamer.com" || u?.email === "admin@gmail.com";
              
              // Strictly check for login or admin
              if (!u && !isAdminAuth) {
                // If we already have a user and they disappear, wait a bit before redirecting
                // to avoid flickering during token refresh
                setTimeout(() => {
                  if (!auth.currentUser && !localStorage.getItem("adminAuth")) {
                    toast.error("Login First: Please sign in to play.");
                    router.push("/login");
                  }
                }, 2000);
                return;
              }

              // Admin bypass for test mode

            if (isAdminAuth || isAdminEmail) {
              setUser({ 
                email: u?.email || "admin@gmail.com", 
                uid: u?.uid || "admin-test", 
                role: "admin",
                displayName: "System Admin"
              });
              return;
            }

            setUser(u);
          });
          return () => unsubscribe();
        }, [router]);

  const handleLevelComplete = (points: number) => {
    setScore(prev => prev + points);
    setLevel(prev => prev + 1);
    toast.success(`Level ${level} Complete! Next level loading...`);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleGameOver = async (won: boolean) => {
    setIsGameOver(true);
    if (won) {
      toast.success("Great job! Level Complete!");
    } else {
      toast.error("Game Over! Try again.");
    }

    if (user) {
      try {
        await addDoc(collection(db, "leaderboard"), {
          uid: user.uid,
          username: user.displayName || user.email.split("@")[0],
          gameId: id,
          gameName: id.toString().replace("-", " ").toUpperCase(),
          score: score,
          level: level,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error("Error saving score:", e);
      }
    }
  };

  const resetGame = () => {
    setLevel(1);
    setScore(0);
    setIsGameOver(false);
  };

    const renderGame = () => {
      if (gameLoading) return null;
      
      if (gameData?.disabled && user?.role !== "admin") {
        return (
          <div className="text-center p-12 bg-black/80 absolute inset-0 flex flex-col items-center justify-center z-50">
            <div className="w-32 h-32 rounded-[2.5rem] bg-yellow-500/10 flex items-center justify-center mb-8 border-2 border-yellow-500/20">
              <Timer className="w-16 h-16 text-yellow-500 animate-pulse" />
            </div>
            <h2 className="text-6xl font-black gold-text-gradient uppercase tracking-tighter mb-4">COMING SOON</h2>
            <p className="text-white/40 text-lg font-bold max-w-md mx-auto leading-relaxed uppercase tracking-widest">
              This zone is currently being polished for you. Please wait!
            </p>
            <Link href="/user-dashboard" className="mt-10">
              <Button className="gold-gradient text-black font-black px-10 h-16 rounded-2xl text-lg">
                BACK TO MY PAGE
              </Button>
            </Link>
          </div>
        );
      }

      if (!gameStarted || countdown !== null) return null;
      
      const gameProps = { 
        level, 
        onComplete: handleLevelComplete, 
        onGameOver: () => handleGameOver(false), 
        soundEnabled,
        isPaused 
      };

            switch (id) {
              case "ball-maze": return <BallMaze {...gameProps} />;
              case "ghost-kill": return <GhostKill {...gameProps} />;
              case "bird-fly": return <BirdFly {...gameProps} />;
              case "snake-pro": return <SnakeGame {...gameProps} />;
              case "typing-master": return <TypingMaster {...gameProps} />;
              case "word-maker": return <WordMaker {...gameProps} />;
              case "ludo-king": return <LudoKing {...gameProps} />;
              case "car-racing": return <CarRacing {...gameProps} />;
              case "educational-adventures": return <EducationalAdventures {...gameProps} />;
              case "endless-runner": return <EndlessRunner {...gameProps} />;
              default: return <div>Game not found</div>;
            }

    };

    return (
      <div className="min-h-screen galaxy-bg relative overflow-x-hidden pt-24 pb-8">
        <div className="galaxy-stars fixed inset-0 pointer-events-none z-0 opacity-30" />
        
          <div className={`${isFullscreen ? 'fixed inset-0 z-[100] bg-black' : 'relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-8 h-[calc(100vh-8rem)]'} flex flex-col transition-all duration-500`}>
            {!isFullscreen && (
              <div className="flex justify-between items-center mb-6 w-full bg-black/40 p-4 rounded-2xl gold-border-glow/30">
                <Link href="/user-dashboard">
                  <Button variant="ghost" className="hover:text-primary text-white font-black uppercase tracking-widest text-xs">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                  </Button>
                </Link>
                <div className="flex items-center space-x-6">
                  <Button variant="ghost" size="icon" className="text-white hover:text-orange-500 transition-colors" onClick={() => setSoundEnabled(!soundEnabled)}>
                    {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:text-orange-500 transition-colors" onClick={() => toggleFullscreen(true)}>
                    <Maximize2 className="w-6 h-6" />
                  </Button>
                  <div className="h-8 w-[2px] bg-white/10" />
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Points</span>
                    <span className="text-2xl font-black text-orange-500 tabular-nums">{score}</span>
                  </div>
                  <div className="h-8 w-[2px] bg-white/10" />
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Level</span>
                      <span className="text-2xl font-black gold-text-gradient">{level}</span>
                    </div>
                  <Button onClick={() => setIsPaused(!isPaused)} className={`${isPaused ? 'bg-orange-600' : 'bg-white/10'} text-white font-black px-6 h-10 rounded-xl transition-all border border-white/10`}>
                    {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                    {isPaused ? "START" : "STOP"}
                  </Button>
                </div>
              </div>
            )}

            <Card className={`${isFullscreen ? 'rounded-0 border-0 flex-1' : 'flex-1 border-4 border-orange-500/20 bg-black/60 rounded-[2.5rem]'} overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative`}>
              {isFullscreen && (
                <div className="absolute top-6 right-6 z-[110] flex gap-4">
                  <Button variant="ghost" size="icon" className="bg-black/40 backdrop-blur-md text-white hover:bg-white/20" onClick={() => toggleFullscreen(false)}>
                    <Minimize2 className="w-6 h-6" />
                  </Button>
                </div>
              )}
              <CardContent className="p-0 h-full w-full">
                <div className="absolute inset-0 flex items-center justify-center p-0">
                  <div className="w-full h-full flex items-center justify-center relative bg-zinc-950/50 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
                    <motion.div
                      key={countdown}
                      initial={{ scale: 2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="text-9xl font-black gold-text-gradient"
                    >
                      {countdown === 0 ? "GO!" : countdown}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-40 backdrop-blur-sm">
                  <div className="text-center">
                    <h2 className="text-6xl font-black text-white mb-8 uppercase">Stopped</h2>
                    <Button size="lg" className="gold-gradient text-black font-black" onClick={() => setIsPaused(false)}>
                      START AGAIN
                    </Button>
                  </div>
                </div>
              )}

              {isGameOver ? (
                <div className="text-center space-y-6 p-12 bg-black/90 absolute inset-0 flex flex-col items-center justify-center z-50">
                  <Trophy className="h-24 w-24 text-primary mx-auto animate-bounce" />
                  <h2 className="text-5xl font-black text-white uppercase tracking-tighter">How you did</h2>
                  <div className="grid grid-cols-3 gap-8 mb-8">
                    <div className="text-center">
                      <p className="text-white/40 text-xs font-black uppercase tracking-widest">Perfect Hits</p>
                      <p className="text-3xl font-black text-white">{stats.accuracy}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/40 text-xs font-black uppercase tracking-widest">Speed</p>
                      <p className="text-3xl font-black text-white">{stats.timeEfficiency}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/40 text-xs font-black uppercase tracking-widest">Rank</p>
                      <p className="text-3xl font-black text-green-400">+{stats.rankChange}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button size="lg" className="gold-gradient text-black font-black" onClick={resetGame}>
                      <RotateCcw className="mr-2 h-5 w-5" /> REPLAY
                    </Button>
                    <Link href="/leadership">
                      <Button size="lg" variant="outline" className="border-2 border-primary text-primary font-black">
                        BEST PLAYERS
                      </Button>
                    </Link>
                  </div>
                </div>
                ) : (
                  renderGame()
                )}
                    </div>
                  </div>
              </CardContent>

            </Card>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-primary/10">
                <CardHeader><CardTitle className="text-sm">How to Play</CardTitle></CardHeader>
<CardContent className="text-sm text-muted-foreground">
                    {id === "ball-maze" && "Use arrows to move the ball to the goal. Don't hit walls!"}
                    {id === "ghost-kill" && "Click ghosts quickly to win points."}
                    {id === "bird-fly" && "Press space to fly up and avoid pipes."}
                    {id === "snake-pro" && "Use arrows to eat dots and grow long."}
                    {id === "typing-master" && "Type words fast to score."}
                    {id === "word-maker" && "Pick letters to make correct words."}
                    {id === "ludo-king" && "Roll dice and reach home to win."}
                    {id === "car-racing" && "Use arrows to avoid cars and collect coins."}
                    {id === "edu-adventure" && "Answer questions across Math, Science, History and more!"}
                    {id === "endless-runner" && "Jump (Space/W) and Slide (S) to avoid obstacles!"}
                  </CardContent>
              </Card>
              <Card className="border-primary/10">
                <CardHeader><CardTitle className="text-sm">Game Info</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  - Cool Sounds<br />
                  - Live Score List<br />
                  - 10 Levels to Play<br />
                  - Fast & Smooth
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      );
    }
