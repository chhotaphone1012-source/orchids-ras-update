"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Pause, Play } from "lucide-react";
import { playSound } from "@/lib/utils";

interface GameProps {
  level: number;
  onComplete: (points: number) => void;
  onGameOver: () => void;
  soundEnabled: boolean;
}

const generateMaze = (level: number, gridSize: number) => {
  const walls: { x: number; y: number }[] = [];
  const wallCount = 15 + level * 5;
  
  for (let i = 0; i < wallCount; i++) {
    const x = Math.floor(Math.random() * (gridSize - 2)) + 1;
    const y = Math.floor(Math.random() * (gridSize - 2)) + 1;
    if (!(x === 1 && y === 1) && !(x === gridSize - 2 && y === gridSize - 2)) {
      walls.push({ x, y });
    }
  }
  return walls;
};

export default function BallMaze({ level, onComplete, onGameOver, soundEnabled }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [pos, setPos] = useState({ x: 1, y: 1 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const keysPressed = useRef<Set<string>>(new Set());
  
  const gridSize = level >= 6 ? 25 : 15;
  const mazeSize = 600;
  const cellSize = mazeSize / gridSize;
  
  const [walls, setWalls] = useState<{ x: number; y: number }[]>([]);
  const [movingWalls, setMovingWalls] = useState<{ x: number; y: number; dir: string; speed: number }[]>([]);
  const [collectibles, setCollectibles] = useState<{ x: number; y: number }[]>([]);
    const [collected, setCollected] = useState(0);
      const maxCollectiblesOnScreen = 15;
      const [timeLeft, setTimeLeft] = useState(1200);
    
    const [showMiniMap, setShowMiniMap] = useState(false);

  const [miniMapCooldown, setMiniMapCooldown] = useState(0);
  const [magnetActive, setMagnetActive] = useState(false);
  const [magnetPowerUp, setMagnetPowerUp] = useState<{ x: number; y: number } | null>(null);
  
  const [countdown, setCountdown] = useState(0);
  const [gameStarted, setGameStarted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !gameStarted) {
      setGameStarted(true);
    }
  }, [countdown, gameStarted]);

  useEffect(() => {
    const newWalls = generateMaze(level, gridSize);
    setWalls(newWalls);
    
    if (level >= 5) {
      const movingCount = Math.min(level - 4, 5);
      const newMovingWalls: { x: number; y: number; dir: string; speed: number }[] = [];
      for (let i = 0; i < movingCount; i++) {
        newMovingWalls.push({
          x: Math.floor(Math.random() * (gridSize - 4)) + 2,
          y: Math.floor(Math.random() * (gridSize - 4)) + 2,
          dir: Math.random() > 0.5 ? "h" : "v",
          speed: 0.02 + Math.random() * 0.02
        });
      }
      setMovingWalls(newMovingWalls);
    } else {
      setMovingWalls([]);
    }
    
    const newCollectibles: { x: number; y: number }[] = [];
    for (let i = 0; i < maxCollectiblesOnScreen; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * (gridSize - 2)) + 1;
        y = Math.floor(Math.random() * (gridSize - 2)) + 1;
      } while (
        newWalls.some(w => w.x === x && w.y === y) ||
        newCollectibles.some(c => c.x === x && c.y === y) ||
        (x === 1 && y === 1) ||
        (x === gridSize - 2 && y === gridSize - 2)
      );
      newCollectibles.push({ x, y });
    }
    setCollectibles(newCollectibles);
    
    if (Math.random() < 0.5) {
      let mx, my;
      do {
        mx = Math.floor(Math.random() * (gridSize - 2)) + 1;
        my = Math.floor(Math.random() * (gridSize - 2)) + 1;
      } while (
        newWalls.some(w => w.x === mx && w.y === my) ||
        newCollectibles.some(c => c.x === mx && c.y === my)
      );
      setMagnetPowerUp({ x: mx, y: my });
    }
    
    setCollected(0);
    setPos({ x: 1, y: 1 });
    setCountdown(0);
    setGameStarted(true);
    setIsPaused(false);
    setMagnetActive(false);
  }, [level, gridSize]);

    useEffect(() => {
      if (!gameStarted || isPaused) return;
      const timer = setInterval(() => {
        if (miniMapCooldown > 0) {
          setMiniMapCooldown(prev => prev - 1);
        }
        setTimeLeft(prev => {
          if (prev <= 1) {
            onGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }, [gameStarted, isPaused, miniMapCooldown, onGameOver]);


  const isWall = useCallback((cx: number, cy: number) => {
    if (cx < 0 || cx >= gridSize || cy < 0 || cy >= gridSize) return true;
    if (walls.some(w => w.x === cx && w.y === cy)) return true;
    if (movingWalls.some(mw => Math.round(mw.x) === cx && Math.round(mw.y) === cy)) return true;
    return false;
  }, [walls, movingWalls, gridSize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPaused(prev => !prev);
        return;
      }
      if (!gameStarted || isPaused) return;

      if (e.key.toLowerCase() === "m" && miniMapCooldown === 0) {
        setShowMiniMap(true);
        setMiniMapCooldown(10);
        setTimeout(() => setShowMiniMap(false), 3000);
        return;
      }

      let nextX = pos.x;
      let nextY = pos.y;

      const key = e.key.toLowerCase();
      if (key === "arrowup" || key === "w") nextY -= 1;
      if (key === "arrowdown" || key === "s") nextY += 1;
      if (key === "arrowleft" || key === "a") nextX -= 1;
      if (key === "arrowright" || key === "d") nextX += 1;

      if (nextX !== pos.x || nextY !== pos.y) {
        e.preventDefault();
        if (!isWall(nextX, nextY)) {
          setPos({ x: nextX, y: nextY });
          if (soundEnabled) {
            playSound("https://www.soundjay.com/buttons/sounds/button-3.mp3", 0.1);
          }
        } else {
          if (soundEnabled) {
            playSound("https://www.soundjay.com/buttons/sounds/button-4.mp3", 0.2);
          }
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, isPaused, miniMapCooldown, pos, isWall, soundEnabled]);

  const gameLoop = useCallback(() => {
    if (!gameStarted || isPaused) return;
    
    setMovingWalls(prev => prev.map(mw => {
      let newX = mw.x;
      let newY = mw.y;
      if (mw.dir === "h") {
        newX += mw.speed;
        if (newX >= gridSize - 2 || newX <= 1) {
          return { ...mw, speed: -mw.speed };
        }
      } else {
        newY += mw.speed;
        if (newY >= gridSize - 2 || newY <= 1) {
          return { ...mw, speed: -mw.speed };
        }
      }
      return { ...mw, x: newX, y: newY };
    }));

    if (magnetActive) {
      setCollectibles(prev => prev.map(c => {
        const dx = pos.x - c.x;
        const dy = pos.y - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 5 && dist > 0.5) {
          return {
            x: c.x + (dx / dist) * 0.1,
            y: c.y + (dy / dist) * 0.1
          };
        }
        return c;
      }));
    }
  }, [gameStarted, isPaused, magnetActive, pos, gridSize]);

  useEffect(() => {
    const animate = () => {
      gameLoop();
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameLoop]);

  useEffect(() => {
    if (!gameStarted || isPaused) return;
    
    const cellX = Math.round(pos.x);
    const cellY = Math.round(pos.y);
    
    const collectIndex = collectibles.findIndex(c => 
      Math.abs(c.x - cellX) < 0.8 && Math.abs(c.y - cellY) < 0.8
    );
    if (collectIndex !== -1) {
      setCollectibles(prev => {
        const filtered = prev.filter((_, i) => i !== collectIndex);
        let nx, ny;
        do {
          nx = Math.floor(Math.random() * (gridSize - 2)) + 1;
          ny = Math.floor(Math.random() * (gridSize - 2)) + 1;
        } while (
          walls.some(w => w.x === nx && w.y === ny) ||
          filtered.some(c => c.x === nx && c.y === ny) ||
          (nx === cellX && ny === cellY)
        );
        return [...filtered, { x: nx, y: ny }];
      });
      setCollected(prev => prev + 1);
        if (soundEnabled) {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3");
          audio.play().catch(() => {});
        }
      }
      
      if (magnetPowerUp && Math.abs(magnetPowerUp.x - cellX) < 0.8 && Math.abs(magnetPowerUp.y - cellY) < 0.8) {
        setMagnetActive(true);
        setMagnetPowerUp(null);
        if (soundEnabled) {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3");
          audio.play().catch(() => {});
        }
        setTimeout(() => setMagnetActive(false), 5000);
      }
      
      const coinsPerLevel = 5;
      if (collected > 0 && collected % coinsPerLevel === 0 && collectIndex !== -1) {
        if (soundEnabled) {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3");
          audio.play().catch(() => {});
        }
        onComplete(200 + level * 50); // Level bonus
      }
  }, [pos, collectibles, collected, level, onComplete, soundEnabled, magnetPowerUp, gameStarted, isPaused, walls, gridSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f0f12";
    ctx.fillRect(0, 0, mazeSize, mazeSize);

    const fogRadius = cellSize * 4;
    const playerX = pos.x * cellSize + cellSize / 2;
    const playerY = pos.y * cellSize + cellSize / 2;

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, mazeSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(mazeSize, i * cellSize);
      ctx.stroke();
    }

    walls.forEach(w => {
      const gradient = ctx.createLinearGradient(
        w.x * cellSize, w.y * cellSize,
        (w.x + 1) * cellSize, (w.y + 1) * cellSize
      );
      gradient.addColorStop(0, "#8B4513");
      gradient.addColorStop(1, "#654321");
      ctx.fillStyle = gradient;
      ctx.fillRect(w.x * cellSize + 2, w.y * cellSize + 2, cellSize - 4, cellSize - 4);
      ctx.strokeStyle = "#333";
      ctx.strokeRect(w.x * cellSize + 2, w.y * cellSize + 2, cellSize - 4, cellSize - 4);
    });

    movingWalls.forEach(mw => {
      const gradient = ctx.createLinearGradient(
        mw.x * cellSize, mw.y * cellSize,
        (mw.x + 1) * cellSize, (mw.y + 1) * cellSize
      );
      gradient.addColorStop(0, "#ff4444");
      gradient.addColorStop(1, "#aa2222");
      ctx.fillStyle = gradient;
      ctx.fillRect(mw.x * cellSize + 2, mw.y * cellSize + 2, cellSize - 4, cellSize - 4);
      ctx.strokeStyle = "#ff6666";
      ctx.lineWidth = 2;
      ctx.strokeRect(mw.x * cellSize + 2, mw.y * cellSize + 2, cellSize - 4, cellSize - 4);
    });

    collectibles.forEach(c => {
      ctx.fillStyle = "#FFD700";
      ctx.shadowColor = "#FFD700";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(c.x * cellSize + cellSize / 2, c.y * cellSize + cellSize / 2, cellSize / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    if (magnetPowerUp) {
      ctx.fillStyle = "#00ffff";
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(magnetPowerUp.x * cellSize + cellSize / 2, magnetPowerUp.y * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = `${cellSize / 3}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("M", magnetPowerUp.x * cellSize + cellSize / 2, magnetPowerUp.y * cellSize + cellSize / 2);
      ctx.shadowBlur = 0;
    }

    ctx.shadowColor = magnetActive ? "#00ffff" : "#FFA500";
    ctx.shadowBlur = magnetActive ? 30 : 20;
    
    const playerGradient = ctx.createRadialGradient(playerX, playerY, 0, playerX, playerY, cellSize / 3);
    if (magnetActive) {
      playerGradient.addColorStop(0, "#00ffff");
      playerGradient.addColorStop(0.5, "#0088ff");
      playerGradient.addColorStop(1, "#0044aa");
    } else {
      playerGradient.addColorStop(0, "#FFD700");
      playerGradient.addColorStop(0.5, "#FFA500");
      playerGradient.addColorStop(1, "#FF8C00");
    }
    ctx.fillStyle = playerGradient;
    ctx.beginPath();
    ctx.arc(playerX, playerY, cellSize / 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    const fogGradient = ctx.createRadialGradient(playerX, playerY, fogRadius * 0.8, playerX, playerY, fogRadius * 2);
    fogGradient.addColorStop(0, "rgba(0,0,0,0)");
    fogGradient.addColorStop(1, "rgba(0,0,0,0.85)");
    ctx.fillStyle = fogGradient;
    ctx.fillRect(0, 0, mazeSize, mazeSize);

  }, [pos, walls, movingWalls, collectibles, cellSize, gridSize, mazeSize, magnetPowerUp, magnetActive]);

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
              className="text-9xl font-black text-orange-500 drop-shadow-[0_0_30px_rgba(255,165,0,0.8)]"
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
          <Pause className="w-20 h-20 text-orange-500" />
          <span className="text-4xl font-black text-white">PAUSED</span>
          <span className="text-orange-400">Press ESC to resume</span>
        </div>
      )}

      <div className="absolute -top-12 left-0 right-0 flex justify-between items-center px-4 text-white font-bold">
        <span className="text-orange-400">Coins: {collected}</span>
        <div className="flex items-center gap-4">
          {magnetActive && (
            <span className="text-cyan-400 animate-pulse">MAGNET ACTIVE!</span>
          )}
          <button 
            onClick={() => {
              if (miniMapCooldown === 0) {
                setShowMiniMap(true);
                setMiniMapCooldown(10);
                setTimeout(() => setShowMiniMap(false), 3000);
              }
            }}
            disabled={miniMapCooldown > 0}
            className={`flex items-center gap-1 px-2 py-1 rounded ${miniMapCooldown > 0 ? 'opacity-50' : 'hover:bg-white/10'}`}
          >
            <Map className="w-4 h-4" />
            {miniMapCooldown > 0 ? `${miniMapCooldown}s` : 'Map (M)'}
          </button>
        </div>
        <span className={`${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
          Time: {formatTime(timeLeft)}
        </span>
      </div>

      {showMiniMap && (
        <div className="absolute top-4 right-4 w-32 h-32 bg-black/80 border-2 border-orange-500 rounded-lg z-40 overflow-hidden">
          <div className="relative w-full h-full">
            {walls.map((w, i) => (
              <div
                key={i}
                className="absolute bg-amber-800"
                style={{
                  left: `${(w.x / gridSize) * 100}%`,
                  top: `${(w.y / gridSize) * 100}%`,
                  width: `${100 / gridSize}%`,
                  height: `${100 / gridSize}%`
                }}
              />
            ))}
            {collectibles.map((c, i) => (
              <div
                key={`c-${i}`}
                className="absolute bg-yellow-400 rounded-full"
                style={{
                  left: `${(c.x / gridSize) * 100}%`,
                  top: `${(c.y / gridSize) * 100}%`,
                  width: `${80 / gridSize}%`,
                  height: `${80 / gridSize}%`
                }}
              />
            ))}
            <div
              className="absolute bg-orange-500 rounded-full animate-pulse"
              style={{
                left: `${(pos.x / gridSize) * 100}%`,
                top: `${(pos.y / gridSize) * 100}%`,
                width: `${150 / gridSize}%`,
                height: `${150 / gridSize}%`
              }}
            />
          </div>
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        width={mazeSize} 
        height={mazeSize} 
        className="border-4 border-orange-500/30 rounded-2xl shadow-[0_0_30px_rgba(255,165,0,0.3)]"
      />
      <div className="mt-4 text-orange-300 text-sm font-bold flex gap-4">
        <span>Arrow/WASD: Move</span>
        <span>M: Mini-Map</span>
        <span>ESC: Pause</span>
        {level >= 5 && <span className="text-red-400">⚠️ Moving Walls!</span>}
      </div>
    </div>
  );
}
