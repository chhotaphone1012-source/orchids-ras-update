"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Zap, Clock, Ghost } from "lucide-react";

interface GameProps {
  level: number;
  onComplete: (points: number) => void;
  onGameOver: () => void;
  soundEnabled: boolean;
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type PowerUpType = "speed" | "slow" | "bonus" | "time" | "phase";

interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
}

interface PoisonFood {
  x: number;
  y: number;
}

export default function SnakeGame({ level, onComplete, onGameOver, soundEnabled }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastMoveRef = useRef<number>(0);
  
  const gridSize = 30;
  const cellSize = 20;
  const canvasSize = gridSize * cellSize;

  const [snake, setSnake] = useState<{ x: number; y: number }[]>([{ x: 15, y: 15 }]);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [nextDirection, setNextDirection] = useState<Direction>("RIGHT");
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 20, y: 15 });
  const [poisonFood, setPoisonFood] = useState<PoisonFood[]>([]);
    const [score, setScore] = useState(0);
    const [powerUp, setPowerUp] = useState<PowerUp | null>(null);
    const [speedMultiplier, setSpeedMultiplier] = useState(1);
    const [phaseMode, setPhaseMode] = useState(false);
    const [comboCount, setComboCount] = useState(0);
    const [comboGlow, setComboGlow] = useState(0);
    
    const [countdown, setCountdown] = useState(0);
    const [gameStarted, setGameStarted] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
  
    const targetFood = 99999; // Practically infinite
    const baseSpeed = Math.max(150 - level * 5, 100); // Slower base speed for easier control

    const directionBuffer = useRef<Direction | null>(null);

    useEffect(() => {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else if (countdown === 0 && !gameStarted) {
        setGameStarted(true);
      }
    }, [countdown, gameStarted]);

    const spawnFood = useCallback((snakeBody: { x: number; y: number }[]) => {
      let newFood;
      do {
        newFood = {
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize)
        };
      } while (snakeBody.some(s => s.x === newFood.x && s.y === newFood.y));
      return newFood;
    }, [gridSize]);

    const spawnPoisonFood = useCallback((snakeBody: { x: number; y: number }[], currentFood: { x: number; y: number }) => {
      if (Math.random() < 0.3 && level >= 3) {
        let poison;
        do {
          poison = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
          };
        } while (
          snakeBody.some(s => s.x === poison.x && s.y === poison.y) ||
          (poison.x === currentFood.x && poison.y === currentFood.y)
        );
        return poison;
      }
      return null;
    }, [gridSize, level]);

    useEffect(() => {
      setSnake([{ x: 15, y: 15 }]);
      setDirection("RIGHT");
      setNextDirection("RIGHT");
      setFood(spawnFood([{ x: 15, y: 15 }]));
      setPoisonFood([]);
      setScore(0);
      setPowerUp(null);
      setSpeedMultiplier(1);
      setPhaseMode(false);
      setComboCount(0);
      setComboGlow(0);
      setCountdown(0);
      setGameStarted(true);
      setIsPaused(false);
      directionBuffer.current = null;
    }, [level, spawnFood]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPaused(prev => !prev);
        return;
      }

      const keyMap: Record<string, Direction> = {
        ArrowUp: "UP", w: "UP", W: "UP",
        ArrowDown: "DOWN", s: "DOWN", S: "DOWN",
        ArrowLeft: "LEFT", a: "LEFT", A: "LEFT",
        ArrowRight: "RIGHT", d: "RIGHT", D: "RIGHT"
      };

      const newDir = keyMap[e.key];
      if (newDir) {
        e.preventDefault();
        
        const opposites: Record<Direction, Direction> = {
          UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT"
        };
        
        const currentDir = directionBuffer.current || direction;
        if (newDir !== opposites[currentDir]) {
          directionBuffer.current = newDir;
          setNextDirection(newDir);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!gameStarted || isPaused) {
      animationRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const speed = baseSpeed / speedMultiplier;
    
    if (timestamp - lastMoveRef.current < speed) {
      animationRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    lastMoveRef.current = timestamp;

    setDirection(nextDirection);
    directionBuffer.current = null;

    setSnake(prev => {
      const head = { ...prev[0] };
      
      switch (nextDirection) {
        case "UP": head.y -= 1; break;
        case "DOWN": head.y += 1; break;
        case "LEFT": head.x -= 1; break;
        case "RIGHT": head.x += 1; break;
      }

      if (phaseMode) {
        if (head.x < 0) head.x = gridSize - 1;
        if (head.x >= gridSize) head.x = 0;
        if (head.y < 0) head.y = gridSize - 1;
        if (head.y >= gridSize) head.y = 0;
      } else {
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
          onGameOver();
          return prev;
        }
      }

      if (!phaseMode && prev.slice(0, -1).some(s => s.x === head.x && s.y === head.y)) {
        onGameOver();
        return prev;
      }

      const newSnake = [head, ...prev];

        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          setComboCount(c => c + 1);
          setComboGlow(g => Math.min(g + 0.2, 1));
          setFood(spawnFood(newSnake));
          
          const newPoison = spawnPoisonFood(newSnake, food);
          if (newPoison) {
            setPoisonFood(p => [...p, newPoison]);
          }
          
          if (soundEnabled) {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3");
            audio.play().catch(() => {});
          }

          if (Math.random() < 0.2) {
            const types: PowerUpType[] = ["speed", "slow", "bonus", "time", "phase"];
            let px, py;
            do {
              px = Math.floor(Math.random() * gridSize);
              py = Math.floor(Math.random() * gridSize);
            } while (newSnake.some(s => s.x === px && s.y === py));
            setPowerUp({ x: px, y: py, type: types[Math.floor(Math.random() * types.length)] });
          }

              const foodPerLevel = 10;
              if (score + 1 > 0 && (score + 1) % foodPerLevel === 0) {
                if (soundEnabled) {
                  const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3");
                  audio.play().catch(() => {});
                }
                onComplete(200 + level * 50); // Bonus points for level up
              }

              return newSnake;
            }

          const poisonIndex = poisonFood.findIndex(p => p.x === head.x && p.y === head.y);
          if (poisonIndex !== -1) {
            setPoisonFood(p => p.filter((_, i) => i !== poisonIndex));
            setComboCount(0);
            setComboGlow(0);
            if (soundEnabled) {
              const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3");
              audio.play().catch(() => {});
            }
            if (newSnake.length > 3) {
              return newSnake.slice(0, -3);
            }
            return newSnake.slice(0, -1);
          }

          if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
            if (soundEnabled) {
              const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3");
              audio.play().catch(() => {});
            }
          
          switch (powerUp.type) {
            case "speed":
              setSpeedMultiplier(1.6);
              setTimeout(() => setSpeedMultiplier(1), 7000);
              break;
            case "slow":
              setSpeedMultiplier(0.5);
              setTimeout(() => setSpeedMultiplier(1), 7000);
              break;
            case "bonus":
              setScore(s => s + 5);
              break;
            case "time":
              // Time powerup now gives extra points since time is removed
              setScore(s => s + 10);
              break;
            case "phase":
              setPhaseMode(true);
              setTimeout(() => setPhaseMode(false), 5000);
              break;
          }
          setPowerUp(null);
        }

        setComboGlow(g => Math.max(g - 0.01, 0));

        return newSnake.slice(0, -1);
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    }, [gameStarted, isPaused, nextDirection, food, powerUp, poisonFood, gridSize, baseSpeed, speedMultiplier, spawnFood, spawnPoisonFood, onGameOver, onComplete, score, targetFood, level, soundEnabled, phaseMode]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameLoop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    ctx.strokeStyle = "#1a1a2a";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvasSize, i * cellSize);
      ctx.stroke();
    }

    snake.forEach((segment, i) => {
      const alpha = 1 - (i / snake.length) * 0.6;
      const glowIntensity = comboGlow * 20;
      
      if (i === 0) {
        ctx.shadowColor = phaseMode ? "#00ffff" : `rgba(34, 197, 94, ${0.5 + comboGlow * 0.5})`;
        ctx.shadowBlur = 15 + glowIntensity;
        
        const headGradient = ctx.createRadialGradient(
          segment.x * cellSize + cellSize / 2,
          segment.y * cellSize + cellSize / 2,
          0,
          segment.x * cellSize + cellSize / 2,
          segment.y * cellSize + cellSize / 2,
          cellSize / 2
        );
        
        if (phaseMode) {
          headGradient.addColorStop(0, "#00ffff");
          headGradient.addColorStop(1, "#0088aa");
        } else {
          headGradient.addColorStop(0, `rgba(74, 222, 128, ${alpha})`);
          headGradient.addColorStop(1, `rgba(34, 197, 94, ${alpha})`);
        }
        
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.roundRect(
          segment.x * cellSize + 1,
          segment.y * cellSize + 1,
          cellSize - 2,
          cellSize - 2,
          6
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "white";
        const eyeOffset = 4;
        let eye1X = segment.x * cellSize + cellSize / 2 - eyeOffset;
        let eye2X = segment.x * cellSize + cellSize / 2 + eyeOffset;
        let eye1Y = segment.y * cellSize + cellSize / 2;
        let eye2Y = segment.y * cellSize + cellSize / 2;

        if (direction === "UP") { eye1Y -= 3; eye2Y -= 3; }
        if (direction === "DOWN") { eye1Y += 3; eye2Y += 3; }
        if (direction === "LEFT") { eye1X -= 3; eye2X -= 3; }
        if (direction === "RIGHT") { eye1X += 3; eye2X += 3; }

        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, 3, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(eye1X + 1, eye1Y, 1.5, 0, Math.PI * 2);
        ctx.arc(eye2X + 1, eye2Y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const bodyGradient = ctx.createLinearGradient(
          segment.x * cellSize,
          segment.y * cellSize,
          segment.x * cellSize + cellSize,
          segment.y * cellSize + cellSize
        );
        
        if (phaseMode) {
          bodyGradient.addColorStop(0, `rgba(0, 255, 255, ${alpha * 0.7})`);
          bodyGradient.addColorStop(1, `rgba(0, 136, 170, ${alpha * 0.7})`);
        } else {
          bodyGradient.addColorStop(0, `rgba(34, 197, 94, ${alpha})`);
          bodyGradient.addColorStop(1, `rgba(22, 163, 74, ${alpha})`);
        }
        
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.roundRect(
          segment.x * cellSize + 2,
          segment.y * cellSize + 2,
          cellSize - 4,
          cellSize - 4,
          4
        );
        ctx.fill();
      }
    });

    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 20;
    const foodGradient = ctx.createRadialGradient(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      0,
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 2
    );
    foodGradient.addColorStop(0, "#FFD700");
    foodGradient.addColorStop(0.5, "#FFA500");
    foodGradient.addColorStop(1, "#FF8C00");
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize / 2, cellSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    poisonFood.forEach(poison => {
      ctx.shadowColor = "#ff00ff";
      ctx.shadowBlur = 15;
      ctx.fillStyle = "#ff00ff";
      ctx.beginPath();
      ctx.arc(poison.x * cellSize + cellSize / 2, poison.y * cellSize + cellSize / 2, cellSize / 2 - 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#aa00aa";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("☠", poison.x * cellSize + cellSize / 2, poison.y * cellSize + cellSize / 2);
      ctx.shadowBlur = 0;
    });

    if (powerUp) {
      const colors: Record<PowerUpType, string> = {
        speed: "#22c55e",
        slow: "#d946ef",
        bonus: "#06b6d4",
        time: "#eab308",
        phase: "#00ffff"
      };
      const icons: Record<PowerUpType, string> = {
        speed: "⚡",
        slow: "🐌",
        bonus: "+5",
        time: "⏰",
        phase: "👻"
      };
      
      ctx.shadowColor = colors[powerUp.type];
      ctx.shadowBlur = 20;
      ctx.fillStyle = colors[powerUp.type];
      ctx.beginPath();
      ctx.arc(powerUp.x * cellSize + cellSize / 2, powerUp.y * cellSize + cellSize / 2, cellSize / 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "white";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(icons[powerUp.type], powerUp.x * cellSize + cellSize / 2, powerUp.y * cellSize + cellSize / 2);
      ctx.shadowBlur = 0;
    }

  }, [snake, food, poisonFood, powerUp, direction, cellSize, gridSize, canvasSize, comboGlow, phaseMode]);

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
              className="text-9xl font-black text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]"
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
          <Pause className="w-20 h-20 text-green-500" />
          <span className="text-4xl font-black text-white">PAUSED</span>
          <span className="text-green-400">Press ESC to resume</span>
        </div>
      )}

        <div className="absolute -top-12 left-0 right-0 flex justify-between items-center px-4 text-white font-bold">
          <span className="text-green-400">Food: {score}/{targetFood}</span>
          <div className="flex items-center gap-4">
            {speedMultiplier !== 1 && (
              <span className={`flex items-center gap-1 ${speedMultiplier > 1 ? 'text-green-400' : 'text-pink-400'} animate-pulse`}>
                <Zap className="w-4 h-4" /> {speedMultiplier > 1 ? 'FAST!' : 'SLOW!'}
              </span>
            )}
            {phaseMode && (
              <span className="text-cyan-400 flex items-center gap-1 animate-pulse">
                <Ghost className="w-4 h-4" /> PHASE!
              </span>
            )}
            {comboCount > 2 && (
              <span className="text-yellow-400 animate-pulse">
                Combo x{comboCount}!
              </span>
            )}
          </div>
        </div>

      <canvas 
        ref={canvasRef} 
        width={canvasSize} 
        height={canvasSize} 
        className="border-4 border-green-500/30 rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.3)]"
      />
      
      <div className="mt-4 text-green-300 text-sm font-bold flex gap-4 flex-wrap justify-center">
        <span>Arrow/WASD: Move</span>
        <span>ESC: Pause</span>
        <span className="text-cyan-400">👻 Phase = Pass Walls</span>
        <span className="text-pink-400">☠ Poison = Shrink!</span>
      </div>
    </div>
  );
}
