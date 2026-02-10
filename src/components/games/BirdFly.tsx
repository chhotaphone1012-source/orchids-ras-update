"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Wind, Moon, Sun } from "lucide-react";

interface GameProps {
  level: number;
  onComplete: (points: number) => void;
  onGameOver: () => void;
  soundEnabled: boolean;
}

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
  hasGoldenRing: boolean;
  perfectPass?: boolean;
}

interface Coin {
  x: number;
  y: number;
  collected: boolean;
}

interface WindZone {
  x: number;
  width: number;
  direction: number;
  strength: number;
}

export default function BirdFly({ level, onComplete, onGameOver, soundEnabled }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  const [birdY, setBirdY] = useState(250);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [windZones, setWindZones] = useState<WindZone[]>([]);
    const [score, setScore] = useState(0);
    const [coinsCollected, setCoinsCollected] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [nightMode, setNightMode] = useState(false);
    
    const [countdown, setCountdown] = useState(0);
    const [gameStarted, setGameStarted] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
  
    const targetPipes = 99999; // Practically infinite
    const pipeGap = 200; // Even larger gap for easier gameplay
    const gravity = 0.2; // Even lower gravity for smoother fall
    const jumpForce = -5.0; // Lower jump force for easier control
    const pipeWidth = 60;
    const birdX = 80;
    const birdSize = 20; // Smaller bird for easier navigation

  const pipePoolRef = useRef<Pipe[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !gameStarted) {
      setGameStarted(true);
    }
  }, [countdown, gameStarted]);

  useEffect(() => {
    setBirdY(250);
    setBirdVelocity(0);
    setPipes([]);
    setCoins([]);
    setWindZones([]);
    setScore(0);
    setCoinsCollected(0);
    setGameOver(false);
    setCountdown(0);
    setGameStarted(true);
    setIsPaused(false);
    setNightMode(level >= 4);
    pipePoolRef.current = [];
  }, [level]);

  const jump = useCallback(() => {
    if (!gameStarted || isPaused || gameOver) return;
    setBirdVelocity(jumpForce);
    if (soundEnabled) {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  }, [gameStarted, isPaused, gameOver, soundEnabled, jumpForce]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPaused(prev => !prev);
        return;
      }
      if (e.key === " " || e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        e.preventDefault();
        jump();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);

  const getPipeFromPool = useCallback((x: number): Pipe => {
    const recycled = pipePoolRef.current.pop();
    const gapY = Math.random() * 250 + 100;
    const hasGoldenRing = Math.random() < 0.3;
    
    if (recycled) {
      recycled.x = x;
      recycled.gapY = gapY;
      recycled.passed = false;
      recycled.hasGoldenRing = hasGoldenRing;
      recycled.perfectPass = false;
      return recycled;
    }
    return { x, gapY, passed: false, hasGoldenRing, perfectPass: false };
  }, []);

  const returnPipeToPool = useCallback((pipe: Pipe) => {
    if (pipePoolRef.current.length < 10) {
      pipePoolRef.current.push(pipe);
    }
  }, []);

  useEffect(() => {
    if (!gameStarted || isPaused || gameOver) return;

    const spawnPipe = () => {
      setPipes(prev => {
        if (prev.length === 0 || prev[prev.length - 1].x < 400) {
          const newPipe = getPipeFromPool(600);
          
          if (Math.random() < 0.7) {
            const coinY = newPipe.gapY + pipeGap / 2;
            setCoins(c => [...c, { x: 620, y: coinY, collected: false }]);
          }
          
          return [...prev, newPipe];
        }
        return prev;
      });

      if (Math.random() < 0.1) {
        setWindZones(prev => {
          if (prev.length < 2) {
            return [...prev, {
              x: 600,
              width: 100 + Math.random() * 100,
              direction: Math.random() > 0.5 ? 1 : -1,
              strength: 0.3 + Math.random() * 0.3
            }];
          }
          return prev;
        });
      }
    };

    const interval = setInterval(spawnPipe, 2000);
    return () => clearInterval(interval);
  }, [gameStarted, isPaused, gameOver, getPipeFromPool, pipeGap]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!gameStarted || isPaused || gameOver) {
      animationRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = Math.min((timestamp - lastTimeRef.current) / 16.67, 2);
    lastTimeRef.current = timestamp;

    let windEffect = 0;
    windZones.forEach(zone => {
      if (birdX >= zone.x && birdX <= zone.x + zone.width) {
        windEffect = zone.direction * zone.strength;
      }
    });

    setBirdVelocity(prev => prev + gravity * deltaTime);
    setBirdY(prev => {
      const newY = prev + (birdVelocity + windEffect) * deltaTime;
      
      if (newY < 0 || newY > 470) {
        setGameOver(true);
        onGameOver();
        return prev;
      }
      return newY;
    });

    const pipeSpeed = 3 + level * 0.3;
    
    setPipes(prev => {
      const updated = prev.map(pipe => ({
        ...pipe,
        x: pipe.x - pipeSpeed * deltaTime
      }));

      updated.forEach(pipe => {
        if (!pipe.passed && pipe.x + pipeWidth < birdX) {
          pipe.passed = true;
          
          const birdCenter = birdY + birdSize / 2;
          const gapCenter = pipe.gapY + pipeGap / 2;
          const perfectThreshold = pipeGap / 4;
          
          if (Math.abs(birdCenter - gapCenter) < perfectThreshold && pipe.hasGoldenRing) {
            pipe.perfectPass = true;
            setScore(s => s + 50);
            if (soundEnabled) {
              const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3");
              audio.play().catch(() => {});
            }
          }
          
          setScore(s => s + 1);
          if (soundEnabled) {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
            audio.volume = 0.2;
            audio.play().catch(() => {});
          }
        }

        if (
          birdX + birdSize > pipe.x &&
          birdX < pipe.x + pipeWidth &&
          (birdY < pipe.gapY || birdY + birdSize > pipe.gapY + pipeGap)
        ) {
          setGameOver(true);
          if (soundEnabled) {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3");
            audio.play().catch(() => {});
          }
          onGameOver();
        }
      });

      const filtered = updated.filter(pipe => {
        if (pipe.x < -pipeWidth) {
          returnPipeToPool(pipe);
          return false;
        }
        return true;
      });

      return filtered;
    });

    setCoins(prev => {
      return prev.map(coin => {
        const newX = coin.x - pipeSpeed * deltaTime;
        
        if (!coin.collected &&
            birdX + birdSize > newX - 15 &&
            birdX < newX + 15 &&
            birdY + birdSize > coin.y - 15 &&
            birdY < coin.y + 15) {
          setCoinsCollected(c => c + 1);
          if (soundEnabled) {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3");
            audio.play().catch(() => {});
          }
          return { ...coin, x: newX, collected: true };
        }
        
        return { ...coin, x: newX };
      }).filter(coin => coin.x > -30 && !coin.collected);
    });

    setWindZones(prev => prev.map(zone => ({
      ...zone,
      x: zone.x - pipeSpeed * deltaTime
    })).filter(zone => zone.x + zone.width > 0));

    const pipesPerLevel = 10;
    if (score > 0 && score % pipesPerLevel === 0 && !pipes.find(p => p.x > birdX && !p.passed)) {
      if (soundEnabled) {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3");
        audio.play().catch(() => {});
      }
      onComplete(300 + level * 50); // Level bonus
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameStarted, isPaused, gameOver, birdVelocity, birdY, pipes, coins, windZones, level, score, targetPipes, onComplete, onGameOver, soundEnabled, coinsCollected, gravity, pipeGap, returnPipeToPool]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameLoop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (nightMode) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 500);
      gradient.addColorStop(0, "#0a0a20");
      gradient.addColorStop(0.5, "#1a1a40");
      gradient.addColorStop(1, "#0f0f30");
      ctx.fillStyle = gradient;
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, 500);
      gradient.addColorStop(0, "#87CEEB");
      gradient.addColorStop(0.5, "#98D8E8");
      gradient.addColorStop(1, "#B0E0E6");
      ctx.fillStyle = gradient;
    }
    ctx.fillRect(0, 0, 600, 500);

    if (nightMode) {
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 50; i++) {
        const x = (i * 37 + Date.now() * 0.01) % 600;
        const y = (i * 23) % 400;
        const size = Math.sin(Date.now() * 0.003 + i) * 1 + 1.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#ffffcc";
      ctx.shadowColor = "#ffffcc";
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(500, 80, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      const cloudOffset = (Date.now() * 0.02) % 700;
      [[100 - cloudOffset, 80], [350 - cloudOffset, 120], [550 - cloudOffset, 60]].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.arc(cx + 25, cy - 10, 25, 0, Math.PI * 2);
        ctx.arc(cx + 50, cy, 30, 0, Math.PI * 2);
        ctx.arc(cx + 25, cy + 10, 20, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    windZones.forEach(zone => {
      ctx.fillStyle = zone.direction > 0 ? "rgba(100, 200, 255, 0.2)" : "rgba(255, 100, 100, 0.2)";
      ctx.fillRect(zone.x, 0, zone.width, 500);
      
      ctx.strokeStyle = zone.direction > 0 ? "rgba(100, 200, 255, 0.5)" : "rgba(255, 100, 100, 0.5)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const y = 100 + i * 80;
        ctx.beginPath();
        ctx.moveTo(zone.x + 10, y);
        ctx.lineTo(zone.x + zone.width - 10, y);
        ctx.stroke();
        
        const arrowX = zone.direction > 0 ? zone.x + zone.width - 20 : zone.x + 20;
        ctx.beginPath();
        ctx.moveTo(arrowX, y);
        ctx.lineTo(arrowX + (zone.direction > 0 ? -10 : 10), y - 5);
        ctx.moveTo(arrowX, y);
        ctx.lineTo(arrowX + (zone.direction > 0 ? -10 : 10), y + 5);
        ctx.stroke();
      }
    });

    pipes.forEach(pipe => {
      const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
      pipeGradient.addColorStop(0, "#228B22");
      pipeGradient.addColorStop(0.5, "#32CD32");
      pipeGradient.addColorStop(1, "#228B22");
      ctx.fillStyle = pipeGradient;
      
      ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapY);
      ctx.fillRect(pipe.x - 5, pipe.gapY - 20, pipeWidth + 10, 20);
      
      ctx.fillRect(pipe.x, pipe.gapY + pipeGap, pipeWidth, 500 - pipe.gapY - pipeGap);
      ctx.fillRect(pipe.x - 5, pipe.gapY + pipeGap, pipeWidth + 10, 20);

      ctx.strokeStyle = "#1a5a1a";
      ctx.lineWidth = 3;
      ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.gapY);
      ctx.strokeRect(pipe.x, pipe.gapY + pipeGap, pipeWidth, 500 - pipe.gapY - pipeGap);

      if (pipe.hasGoldenRing) {
        const ringY = pipe.gapY + pipeGap / 2;
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(pipe.x + pipeWidth / 2, ringY, pipeWidth / 2 + 10, pipeGap / 3, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });

    coins.forEach(coin => {
      if (!coin.collected) {
        ctx.fillStyle = "#FFD700";
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFA500";
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    const rotation = Math.min(Math.max(birdVelocity * 3, -30), 45);
    ctx.save();
    ctx.translate(birdX + birdSize / 2, birdY + birdSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    
    ctx.fillStyle = "#FFD700";
    ctx.shadowColor = "#FFA500";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(0, 0, birdSize / 2, birdSize / 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    const wingOffset = Math.sin(Date.now() * 0.02) * 5;
    ctx.fillStyle = "#FFA500";
    ctx.beginPath();
    ctx.ellipse(-5, wingOffset, 8, 15, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(8, -5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(10, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#FF6600";
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(25, -3);
    ctx.lineTo(25, 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();

    ctx.fillStyle = nightMode ? "#1a3a1a" : "#8B4513";
    ctx.fillRect(0, 470, 600, 30);
    ctx.fillStyle = nightMode ? "#0a2a0a" : "#228B22";
    ctx.fillRect(0, 470, 600, 10);

  }, [birdY, birdVelocity, pipes, coins, windZones, pipeGap, nightMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {countdown > 0 && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 rounded-2xl"
          >
            <motion.span
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="text-9xl font-black text-cyan-500 drop-shadow-[0_0_30px_rgba(6,182,212,0.8)]"
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
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 rounded-2xl"
          >
            <motion.span className="text-7xl font-black text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]">
              GO!
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {isPaused && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 rounded-2xl gap-4">
          <Pause className="w-20 h-20 text-cyan-500" />
          <span className="text-4xl font-black text-white">PAUSED</span>
          <span className="text-cyan-400">Press ESC to resume</span>
        </div>
      )}

        <div className="absolute -top-12 left-0 right-0 flex justify-between items-center px-4 text-white font-bold">
          <span className="text-cyan-400">Pipes: {score}/{targetPipes}</span>
          <div className="flex items-center gap-4">
            <span className="text-yellow-400">Coins: {coinsCollected}</span>
            {nightMode ? (
              <Moon className="w-5 h-5 text-purple-400" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400" />
            )}
            {windZones.length > 0 && (
              <span className="text-blue-400 flex items-center gap-1">
                <Wind className="w-4 h-4" /> Wind!
              </span>
            )}
          </div>
        </div>

      <canvas 
        ref={canvasRef} 
        width={600} 
        height={500} 
        onClick={jump}
        className="border-4 border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)] cursor-pointer"
      />
      
      <div className="mt-4 text-cyan-300 text-sm font-bold flex gap-4">
        <span>Space/Click/W/↑: Flap</span>
        <span>ESC: Pause</span>
        <span className="text-yellow-400">Golden Ring = +50 Bonus</span>
      </div>
    </div>
  );
}
