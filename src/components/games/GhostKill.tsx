"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ghost, Skull, Star, Zap, Clock, Pause } from "lucide-react";

interface GameProps {
  level: number;
  onComplete: (points: number) => void;
  onGameOver: () => void;
  soundEnabled: boolean;
}

type GhostType = {
  id: number;
  x: number;
  y: number;
  type: "normal" | "fast" | "bonus" | "danger" | "boss";
  points: number;
  size: number;
  health?: number;
  maxHealth?: number;
};

export default function GhostKill({ level, onComplete, onGameOver, soundEnabled }: GameProps) {
  const [ghosts, setGhosts] = useState<GhostType[]>([]);
  const [count, setCount] = useState(0);
  const [missed, setMissed] = useState(0);
    const [combo, setCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(1200 + level * 60); // 20+ minutes
    const [score, setScore] = useState(0);
    const [showCombo, setShowCombo] = useState(false);
  const [comboPosition, setComboPosition] = useState({ x: 50, y: 50 });
  const [shakeScreen, setShakeScreen] = useState(false);
  const [slowTimeActive, setSlowTimeActive] = useState(false);
  const [slowTimePower, setSlowTimePower] = useState<{ x: number; y: number } | null>(null);
  const [bossDefeated, setBossDefeated] = useState(false);
  
  const [countdown, setCountdown] = useState(0);
  const [gameStarted, setGameStarted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
    const targetCount = 100 + level * 20;
    const maxMissed = 30 + level * 5; // More lives for long play
    const animationRef = useRef<number>(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !gameStarted) {
      setGameStarted(true);
    }
  }, [countdown, gameStarted]);

  useEffect(() => {
    setGhosts([]);
    setCount(0);
    setMissed(0);
    setCombo(0);
    setScore(0);
    setTimeLeft(1200 + level * 60);
    setCountdown(0);
    setGameStarted(true);
    setIsPaused(false);
    setSlowTimeActive(false);
    setSlowTimePower(null);
    setBossDefeated(false);
  }, [level]);

  useEffect(() => {
    if (!gameStarted || isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onGameOver, gameStarted, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPaused(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const spawnGhost = useCallback(() => {
    if (!gameStarted || isPaused) return;
    
    const isBossLevel = level % 5 === 0 && !bossDefeated && count >= targetCount - 10;
    
    if (isBossLevel && !ghosts.some(g => g.type === "boss")) {
      const bossGhost: GhostType = {
        id: Date.now() + Math.random(),
        x: 40 + Math.random() * 20,
        y: 30 + Math.random() * 20,
        type: "boss",
        points: 500,
        size: 120,
        health: 5,
        maxHealth: 5
      };
      setGhosts(prev => [...prev, bossGhost]);
      return;
    }

    const types: Array<{ type: GhostType["type"]; chance: number; points: number; size: number }> = [
      { type: "normal", chance: 0.5, points: 10, size: 50 },
      { type: "fast", chance: 0.25, points: 25, size: 40 },
      { type: "bonus", chance: 0.1, points: 50, size: 60 },
      { type: "danger", chance: 0.15, points: -20, size: 55 },
    ];
    
    let rand = Math.random();
    let selectedType = types[0];
    for (const t of types) {
      if (rand < t.chance) {
        selectedType = t;
        break;
      }
      rand -= t.chance;
    }

    const newGhost: GhostType = {
      id: Date.now() + Math.random(),
      x: Math.random() * 85 + 5,
      y: Math.random() * 75 + 10,
      type: selectedType.type,
      points: selectedType.points,
      size: selectedType.size,
    };
    
    setGhosts(prev => [...prev, newGhost]);

    const speedMultiplier = slowTimeActive ? 2 : 1;
    const lifetime = selectedType.type === "fast" 
      ? Math.max(1100 - level * 70, 450) * speedMultiplier
      : Math.max(2200 - level * 100, 900) * speedMultiplier;

    setTimeout(() => {
      setGhosts(prev => {
        const ghost = prev.find(g => g.id === newGhost.id);
        if (ghost && ghost.type !== "danger" && ghost.type !== "boss") {
          setMissed(m => m + 1);
          setCombo(0);
        }
        return prev.filter(g => g.id !== newGhost.id);
      });
    }, lifetime);
  }, [level, gameStarted, isPaused, slowTimeActive, bossDefeated, count, targetCount, ghosts]);

  useEffect(() => {
    if (!gameStarted || isPaused) return;
    
    if (Math.random() < 0.02 && !slowTimePower) {
      setSlowTimePower({
        x: Math.random() * 80 + 10,
        y: Math.random() * 70 + 15
      });
      setTimeout(() => setSlowTimePower(null), 5000);
    }
  }, [ghosts, slowTimePower, gameStarted, isPaused]);

  useEffect(() => {
    if (!gameStarted || isPaused) return;
    const spawnRate = slowTimeActive 
      ? Math.max(2000 - level * 60, 700)
      : Math.max(1000 - level * 60, 350);
    const interval = setInterval(spawnGhost, spawnRate);
    return () => clearInterval(interval);
  }, [spawnGhost, level, gameStarted, isPaused, slowTimeActive]);

  useEffect(() => {
    if (missed >= maxMissed) {
      onGameOver();
    }
  }, [missed, maxMissed, onGameOver]);

    const killGhost = (ghost: GhostType, e: React.MouseEvent) => {
      if (!gameStarted || isPaused) return;
  
      if (ghost.type === "danger") {
        setMissed(m => m + 2);
        setCombo(0);
        setShakeScreen(true);
        setTimeout(() => setShakeScreen(false), 300);
        if (soundEnabled) {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3");
          audio.play().catch(() => {});
        }
        setGhosts(prev => prev.filter(g => g.id !== ghost.id));
        return;
      }
  
      if (ghost.type === "boss") {
        const newHealth = (ghost.health || 1) - 1;
        if (newHealth <= 0) {
          setGhosts(prev => prev.filter(g => g.id !== ghost.id));
          setBossDefeated(true);
          const points = ghost.points;
          setScore(prev => prev + points);
          setCount(prev => prev + 5);
          if (soundEnabled) {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3");
            audio.play().catch(() => {});
          }
        } else {
          setGhosts(prev => prev.map(g => 
            g.id === ghost.id ? { ...g, health: newHealth } : g
          ));
          if (soundEnabled) {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
            audio.play().catch(() => {});
          }
        }
        return;
      }
  
      setGhosts(prev => prev.filter(g => g.id !== ghost.id));
  
      const newCombo = combo + 1;
      setCombo(newCombo);
      const comboMultiplier = Math.min(1 + newCombo * 0.1, 3);
      const points = Math.floor(ghost.points * comboMultiplier);
      
      setScore(prev => prev + points);
      const newCount = count + 1;
      setCount(newCount);
  
      if (newCombo >= 3) {
        setShowCombo(true);
        setComboPosition({ x: e.clientX, y: e.clientY });
        setTimeout(() => setShowCombo(false), 800);
      }
      
      if (soundEnabled) {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
        audio.play().catch(() => {});
      }
  
      // Infinite play: Level up every 50 kills but don't stop
      if (newCount % 50 === 0) {
        if (soundEnabled) {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3");
          audio.play().catch(() => {});
        }
        onComplete(500); // Bonus points for level up
      }
    };

  const collectSlowTime = () => {
    if (!slowTimePower) return;
    setSlowTimeActive(true);
    setSlowTimePower(null);
    if (soundEnabled) {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3");
      audio.play().catch(() => {});
    }
    setTimeout(() => setSlowTimeActive(false), 5000);
  };

  const getGhostColor = (type: GhostType["type"]) => {
    switch (type) {
      case "normal": return "text-orange-400";
      case "fast": return "text-cyan-400";
      case "bonus": return "text-yellow-400";
      case "danger": return "text-red-500";
      case "boss": return "text-purple-500";
    }
  };

  const getGhostGlow = (type: GhostType["type"]) => {
    switch (type) {
      case "normal": return "drop-shadow-[0_0_15px_rgba(251,146,60,0.6)]";
      case "fast": return "drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]";
      case "bonus": return "drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]";
      case "danger": return "drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]";
      case "boss": return "drop-shadow-[0_0_30px_rgba(168,85,247,0.8)]";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative w-full h-full bg-gradient-to-br from-zinc-900 via-purple-950 to-zinc-900 cursor-crosshair overflow-hidden rounded-2xl ${shakeScreen ? 'animate-shake' : ''}`}>
      <AnimatePresence>
        {countdown > 0 && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <motion.span
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="text-9xl font-black text-purple-500 drop-shadow-[0_0_30px_rgba(168,85,247,0.8)]"
            >
              {countdown}
            </motion.span>
          </motion.div>
        )}
        {countdown === 0 && !gameStarted && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <motion.span className="text-7xl font-black text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]">
              GO!
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {isPaused && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 gap-4">
          <Pause className="w-20 h-20 text-purple-500" />
          <span className="text-4xl font-black text-white">PAUSED</span>
          <span className="text-purple-400">Press ESC to resume</span>
        </div>
      )}

      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <span className="text-orange-400 font-bold">Kills: {count}/{targetCount}</span>
          <span className="text-red-400 font-bold">Missed: {missed}/{maxMissed}</span>
        </div>
        <div className="flex items-center gap-4">
          {slowTimeActive && (
            <span className="text-cyan-400 font-bold animate-pulse flex items-center gap-1">
              <Clock className="w-4 h-4" /> SLOW TIME!
            </span>
          )}
          {combo > 1 && (
            <span className="text-yellow-400 font-bold animate-pulse">
              COMBO x{combo}!
            </span>
          )}
          <span className="text-purple-400 font-bold">Score: {score}</span>
          <span className={`font-bold ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-6 text-xs font-bold z-20">
        <span className="text-orange-400 flex items-center gap-1"><Ghost className="w-4 h-4" /> Normal +10</span>
        <span className="text-cyan-400 flex items-center gap-1"><Zap className="w-4 h-4" /> Fast +25</span>
        <span className="text-yellow-400 flex items-center gap-1"><Star className="w-4 h-4" /> Bonus +50</span>
        <span className="text-red-500 flex items-center gap-1"><Skull className="w-4 h-4" /> Danger -Miss</span>
        {level % 5 === 0 && <span className="text-purple-500 flex items-center gap-1"><Ghost className="w-4 h-4" /> Boss x5 clicks</span>}
      </div>

      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}

      {slowTimePower && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute cursor-pointer z-30"
          style={{ left: `${slowTimePower.x}%`, top: `${slowTimePower.y}%` }}
          onClick={collectSlowTime}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.8)]">
            <Clock className="w-6 h-6 text-white" />
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showCombo && (
          <motion.div
            initial={{ scale: 0, y: 0 }}
            animate={{ scale: 1.5, y: -50 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed z-50 text-4xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]"
            style={{ left: comboPosition.x - 50, top: comboPosition.y - 50 }}
          >
            {combo}x COMBO!
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ghosts.map(ghost => (
          <motion.div
            key={ghost.id}
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ 
              scale: [1, 1.1, 1], 
              opacity: 1, 
              rotate: 0,
              y: ghost.type === "fast" ? [0, -10, 0] : 0
            }}
            exit={{ scale: 1.5, opacity: 0, rotate: 180 }}
            transition={{ 
              duration: 0.3,
              scale: { duration: 0.8, repeat: Infinity }
            }}
            className={`absolute cursor-pointer hover:scale-125 transition-transform ${getGhostColor(ghost.type)} ${getGhostGlow(ghost.type)}`}
            style={{ 
              left: `${ghost.x}%`, 
              top: `${ghost.y}%`,
              width: ghost.size,
              height: ghost.size
            }}
            onClick={(e) => killGhost(ghost, e)}
          >
            {ghost.type === "boss" && (
              <div className="absolute -top-4 left-0 right-0 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{ width: `${((ghost.health || 0) / (ghost.maxHealth || 1)) * 100}%` }}
                />
              </div>
            )}
            {ghost.type === "danger" ? (
              <Skull className="w-full h-full" />
            ) : ghost.type === "bonus" ? (
              <Star className="w-full h-full fill-current" />
            ) : ghost.type === "boss" ? (
              <div className="relative">
                <Ghost className="w-full h-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-black text-lg">
                  {ghost.health}
                </div>
              </div>
            ) : (
              <Ghost className="w-full h-full" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
