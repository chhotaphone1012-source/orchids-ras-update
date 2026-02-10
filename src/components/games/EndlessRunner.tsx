"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Zap, Star, Heart, Trophy, Flame } from "lucide-react";

interface GameProps {
  level: number;
  onComplete: (points: number) => void;
  onGameOver: () => void;
  soundEnabled: boolean;
  isPaused?: boolean;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "crate" | "spike" | "bird" | "fire";
  passed: boolean;
}

interface Coin {
  x: number;
  y: number;
  collected: boolean;
  value: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: "shield" | "magnet" | "double" | "slow";
  collected: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export default function EndlessRunner({ level, onComplete, onGameOver, soundEnabled, isPaused }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  const [playerY, setPlayerY] = useState(300);
  const [playerVelocity, setPlayerVelocity] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [distance, setDistance] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  
  const [hasShield, setHasShield] = useState(false);
  const [hasMagnet, setHasMagnet] = useState(false);
  const [hasDouble, setHasDouble] = useState(false);
  const [hasSlowMo, setHasSlowMo] = useState(false);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  
  const [countdown, setCountdown] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  
  const groundY = 350;
  const playerX = 100;
  const playerWidth = 40;
  const playerHeight = 60;
  const gravity = 0.6;
  const jumpForce = -14;
  const slideHeight = 30;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !gameStarted) {
      setGameStarted(true);
    }
  }, [countdown, gameStarted]);

  useEffect(() => {
    setPlayerY(groundY - playerHeight);
    setPlayerVelocity(0);
    setObstacles([]);
    setCoins([]);
    setPowerUps([]);
    setParticles([]);
    setScore(0);
    setCoinsCollected(0);
    setDistance(0);
    setMultiplier(1);
    setGameOver(false);
    setHasShield(false);
    setHasMagnet(false);
    setHasDouble(false);
    setHasSlowMo(false);
    setPowerUpTimer(0);
    setCountdown(3);
    setGameStarted(false);
    setIsJumping(false);
    setIsSliding(false);
  }, [level]);

  const jump = useCallback(() => {
    if (!gameStarted || gamePaused || gameOver || isSliding) return;
    
    if (!isJumping) {
      setPlayerVelocity(jumpForce);
      setIsJumping(true);
      
      if (soundEnabled) {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
    }
  }, [gameStarted, gamePaused, gameOver, isJumping, isSliding, soundEnabled]);

  const slide = useCallback((start: boolean) => {
    if (!gameStarted || gamePaused || gameOver || isJumping) return;
    setIsSliding(start);
  }, [gameStarted, gamePaused, gameOver, isJumping]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setGamePaused(prev => !prev);
        return;
      }
      if (e.key === " " || e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        e.preventDefault();
        jump();
      }
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        e.preventDefault();
        slide(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        slide(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [jump, slide]);

  useEffect(() => {
    if (!gameStarted || gamePaused || gameOver || isPaused) return;

    const spawnInterval = setInterval(() => {
      const speed = 5 + level * 0.5;
      
      if (Math.random() < 0.4) {
        const obstacleTypes: Array<"crate" | "spike" | "bird" | "fire"> = ["crate", "spike", "bird", "fire"];
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        let y = groundY - 40;
        let width = 40;
        let height = 40;
        
        if (type === "bird") {
          y = groundY - 100 - Math.random() * 80;
          width = 50;
          height = 30;
        } else if (type === "spike") {
          height = 30;
        } else if (type === "fire") {
          height = 50;
          width = 30;
        }
        
        setObstacles(prev => [...prev, { x: 650, y, width, height, type, passed: false }]);
      }
      
      if (Math.random() < 0.3) {
        const coinCount = Math.floor(Math.random() * 3) + 1;
        const baseY = groundY - 80 - Math.random() * 100;
        for (let i = 0; i < coinCount; i++) {
          setCoins(prev => [...prev, { 
            x: 650 + i * 30, 
            y: baseY + Math.sin(i) * 20, 
            collected: false, 
            value: Math.random() < 0.1 ? 5 : 1 
          }]);
        }
      }
      
      if (Math.random() < 0.05) {
        const powerTypes: Array<"shield" | "magnet" | "double" | "slow"> = ["shield", "magnet", "double", "slow"];
        const type = powerTypes[Math.floor(Math.random() * powerTypes.length)];
        setPowerUps(prev => [...prev, { x: 650, y: groundY - 150, type, collected: false }]);
      }
    }, 1500);

    return () => clearInterval(spawnInterval);
  }, [gameStarted, gamePaused, gameOver, isPaused, level]);

  const createParticles = useCallback((x: number, y: number, color: string, count: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        color
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    if (!gameStarted || gamePaused || gameOver || isPaused) {
      animationRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = Math.min((timestamp - lastTimeRef.current) / 16.67, 2);
    lastTimeRef.current = timestamp;

    const speedMod = hasSlowMo ? 0.5 : 1;
    const gameSpeed = (5 + level * 0.5 + distance / 5000) * speedMod;

    setPlayerVelocity(prev => {
      if (isJumping) {
        return prev + gravity * deltaTime;
      }
      return 0;
    });

    setPlayerY(prev => {
      const currentHeight = isSliding ? slideHeight : playerHeight;
      const newY = prev + playerVelocity * deltaTime;
      const groundLevel = groundY - currentHeight;
      
      if (newY >= groundLevel) {
        setIsJumping(false);
        return groundLevel;
      }
      return newY;
    });

    setDistance(prev => prev + gameSpeed * deltaTime);
    setScore(prev => prev + Math.floor(gameSpeed * deltaTime * multiplier));

    if (powerUpTimer > 0) {
      setPowerUpTimer(prev => {
        const newTime = prev - deltaTime * 16.67;
        if (newTime <= 0) {
          setHasShield(false);
          setHasMagnet(false);
          setHasDouble(false);
          setHasSlowMo(false);
          setMultiplier(1);
          return 0;
        }
        return newTime;
      });
    }

    const currentPlayerHeight = isSliding ? slideHeight : playerHeight;
    const currentPlayerY = isSliding ? groundY - slideHeight : playerY;

    setObstacles(prev => {
      const updated = prev.map(obs => ({
        ...obs,
        x: obs.x - gameSpeed * deltaTime
      }));

      updated.forEach(obs => {
        if (
          playerX + playerWidth > obs.x &&
          playerX < obs.x + obs.width &&
          currentPlayerY + currentPlayerHeight > obs.y &&
          currentPlayerY < obs.y + obs.height
        ) {
          if (hasShield) {
            setHasShield(false);
            setPowerUpTimer(0);
            createParticles(obs.x, obs.y, "#FFD700", 20);
            obs.x = -100;
          } else {
            setGameOver(true);
            if (soundEnabled) {
              new Audio("https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3").play().catch(() => {});
            }
            setTimeout(() => onGameOver(), 1000);
          }
        }

        if (!obs.passed && obs.x + obs.width < playerX) {
          obs.passed = true;
          setScore(s => s + 50 * multiplier);
        }
      });

      return updated.filter(obs => obs.x > -100);
    });

    setCoins(prev => {
      return prev.map(coin => {
        let newX = coin.x - gameSpeed * deltaTime;
        let newY = coin.y;

        if (hasMagnet && !coin.collected) {
          const dx = playerX - coin.x;
          const dy = currentPlayerY - coin.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            newX += (dx / dist) * 5;
            newY += (dy / dist) * 5;
          }
        }

        if (
          !coin.collected &&
          playerX + playerWidth > newX - 15 &&
          playerX < newX + 15 &&
          currentPlayerY + currentPlayerHeight > newY - 15 &&
          currentPlayerY < newY + 15
        ) {
          const value = coin.value * (hasDouble ? 2 : 1);
          setCoinsCollected(c => c + value);
          setScore(s => s + value * 10 * multiplier);
          createParticles(newX, newY, "#FFD700", 8);
          
          if (soundEnabled) {
            new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3").play().catch(() => {});
          }
          
          return { ...coin, x: newX, y: newY, collected: true };
        }

        return { ...coin, x: newX, y: newY };
      }).filter(coin => coin.x > -30 && !coin.collected);
    });

    setPowerUps(prev => {
      return prev.map(pu => {
        const newX = pu.x - gameSpeed * deltaTime;

        if (
          !pu.collected &&
          playerX + playerWidth > newX - 20 &&
          playerX < newX + 20 &&
          currentPlayerY + currentPlayerHeight > pu.y - 20 &&
          currentPlayerY < pu.y + 20
        ) {
          createParticles(newX, pu.y, "#00FF00", 15);
          
          switch (pu.type) {
            case "shield":
              setHasShield(true);
              break;
            case "magnet":
              setHasMagnet(true);
              break;
            case "double":
              setHasDouble(true);
              setMultiplier(2);
              break;
            case "slow":
              setHasSlowMo(true);
              break;
          }
          setPowerUpTimer(5000);
          
          if (soundEnabled) {
            new Audio("https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3").play().catch(() => {});
          }
          
          return { ...pu, x: newX, collected: true };
        }

        return { ...pu, x: newX };
      }).filter(pu => pu.x > -50 && !pu.collected);
    });

    setParticles(prev => {
      return prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        life: p.life - 0.02
      })).filter(p => p.life > 0);
    });

    const distancePerLevel = 2000;
    if (distance > 0 && Math.floor(distance / distancePerLevel) > Math.floor((distance - gameSpeed * deltaTime) / distancePerLevel)) {
      if (soundEnabled) {
        new Audio("https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3").play().catch(() => {});
      }
      onComplete(1000 + level * 200);
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameStarted, gamePaused, gameOver, isPaused, isJumping, isSliding, playerVelocity, playerY, distance, level, multiplier, hasShield, hasMagnet, hasDouble, hasSlowMo, powerUpTimer, soundEnabled, onComplete, onGameOver, createParticles]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameLoop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(0.5, "#16213e");
    gradient.addColorStop(1, "#0f3460");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 650, 400);

    ctx.fillStyle = "#0a0a1a";
    for (let i = 0; i < 50; i++) {
      const x = (i * 47 + distance * 0.1) % 650;
      const y = (i * 31) % 200;
      const size = Math.sin(Date.now() * 0.002 + i) * 1 + 1.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    const groundGradient = ctx.createLinearGradient(0, groundY, 0, 400);
    groundGradient.addColorStop(0, "#2d3436");
    groundGradient.addColorStop(1, "#1e272e");
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, groundY, 650, 50);

    ctx.strokeStyle = "#e17055";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(650, groundY);
    ctx.stroke();

    particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    obstacles.forEach(obs => {
      ctx.save();
      
      switch (obs.type) {
        case "crate":
          ctx.fillStyle = "#8B4513";
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.strokeStyle = "#5D3A1A";
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.moveTo(obs.x + obs.width, obs.y);
          ctx.lineTo(obs.x, obs.y + obs.height);
          ctx.stroke();
          break;
          
        case "spike":
          ctx.fillStyle = "#c0392b";
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width / 2, obs.y);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#922B21";
          ctx.stroke();
          break;
          
        case "bird":
          ctx.fillStyle = "#9b59b6";
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          const wingY = obs.y + Math.sin(Date.now() * 0.01) * 10;
          ctx.beginPath();
          ctx.moveTo(obs.x + 10, obs.y + obs.height / 2);
          ctx.quadraticCurveTo(obs.x - 10, wingY, obs.x - 5, obs.y + obs.height / 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(obs.x + obs.width - 10, obs.y + 10, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#000";
          ctx.beginPath();
          ctx.arc(obs.x + obs.width - 8, obs.y + 10, 2, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case "fire":
          const fireGradient = ctx.createLinearGradient(obs.x, obs.y + obs.height, obs.x, obs.y);
          fireGradient.addColorStop(0, "#e74c3c");
          fireGradient.addColorStop(0.5, "#f39c12");
          fireGradient.addColorStop(1, "#f1c40f");
          ctx.fillStyle = fireGradient;
          for (let i = 0; i < 3; i++) {
            const flicker = Math.sin(Date.now() * 0.02 + i) * 5;
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width / 2, obs.y + flicker);
            ctx.quadraticCurveTo(obs.x + obs.width + 5, obs.y + obs.height / 2, obs.x + obs.width / 2, obs.y + obs.height);
            ctx.quadraticCurveTo(obs.x - 5, obs.y + obs.height / 2, obs.x + obs.width / 2, obs.y + flicker);
            ctx.fill();
          }
          break;
      }
      
      ctx.restore();
    });

    coins.forEach(coin => {
      if (!coin.collected) {
        ctx.fillStyle = coin.value > 1 ? "#e74c3c" : "#f1c40f";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.value > 1 ? 12 : 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = coin.value > 1 ? "#c0392b" : "#f39c12";
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.value > 1 ? 7 : 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    powerUps.forEach(pu => {
      if (!pu.collected) {
        const colors: Record<string, string> = {
          shield: "#3498db",
          magnet: "#9b59b6",
          double: "#2ecc71",
          slow: "#e74c3c"
        };
        ctx.fillStyle = colors[pu.type];
        ctx.shadowColor = colors[pu.type];
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(pu.x, pu.y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const icons: Record<string, string> = {
          shield: "🛡️",
          magnet: "🧲",
          double: "2x",
          slow: "⏱️"
        };
        ctx.fillText(icons[pu.type], pu.x, pu.y);
        ctx.shadowBlur = 0;
      }
    });

    ctx.save();
    const currentHeight = isSliding ? slideHeight : playerHeight;
    const currentY = isSliding ? groundY - slideHeight : playerY;
    
    if (hasShield) {
      ctx.strokeStyle = "rgba(52, 152, 219, 0.6)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(playerX + playerWidth / 2, currentY + currentHeight / 2, 35, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = "#e17055";
    ctx.shadowColor = "#e17055";
    ctx.shadowBlur = 10;
    
    if (isSliding) {
      ctx.fillRect(playerX, currentY, playerWidth + 10, currentHeight);
    } else {
      ctx.fillRect(playerX, currentY, playerWidth, currentHeight);
      
      ctx.fillStyle = "#fab1a0";
      ctx.beginPath();
      ctx.arc(playerX + playerWidth / 2, currentY + 12, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(playerX + playerWidth / 2 + 3, currentY + 10, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(playerX + playerWidth / 2 + 4, currentY + 10, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.fillStyle = "#2d3436";
    ctx.fillRect(0, 385, 650, 15);

  }, [playerY, isSliding, obstacles, coins, powerUps, particles, distance, hasShield]);

  if (countdown > 0 || !gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="text-center"
          >
            <Flame className="w-32 h-32 text-orange-500 mx-auto mb-8 animate-pulse" />
            <h2 className="text-4xl font-black text-white uppercase tracking-widest mb-4">Endless Runner</h2>
            <p className="text-orange-400 text-xl mb-8">Run, Jump, Survive!</p>
            <span className="text-9xl font-black gold-text-gradient">{countdown === 0 ? "GO!" : countdown}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 rounded-3xl">
      <AnimatePresence>
        {(gamePaused || isPaused) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 rounded-3xl gap-4"
          >
            <Pause className="w-20 h-20 text-orange-500" />
            <span className="text-4xl font-black text-white">PAUSED</span>
            <span className="text-orange-400">Press ESC to resume</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[650px] flex justify-between items-center mb-4 px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-black text-xl tabular-nums">{score}</span>
          </div>
          {multiplier > 1 && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-lg"
            >
              <span className="text-green-400 font-black">{multiplier}x</span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
          <Star className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-black">{coinsCollected}</span>
        </div>

        <div className="flex items-center gap-3">
          {hasShield && (
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="text-2xl">🛡️</motion.div>
          )}
          {hasMagnet && (
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="text-2xl">🧲</motion.div>
          )}
          {hasDouble && (
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="text-2xl">2️⃣</motion.div>
          )}
          {hasSlowMo && (
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="text-2xl">⏱️</motion.div>
          )}
        </div>
      </div>

      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width={650} 
          height={400} 
          onClick={jump}
          className="border-4 border-orange-500/30 rounded-2xl shadow-[0_0_30px_rgba(230,126,34,0.3)] cursor-pointer"
        />
        
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg">
          <span className="text-white/60 text-sm font-bold">Distance: </span>
          <span className="text-orange-400 font-black">{Math.floor(distance)}m</span>
        </div>

        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg">
          <span className="text-white/60 text-sm font-bold">Level </span>
          <span className="text-orange-400 font-black">{level}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm font-bold text-white/60">
        <span className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/10 rounded">Space</kbd>
          <kbd className="px-2 py-1 bg-white/10 rounded">W</kbd>
          <kbd className="px-2 py-1 bg-white/10 rounded">↑</kbd>
          Jump
        </span>
        <span className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/10 rounded">S</kbd>
          <kbd className="px-2 py-1 bg-white/10 rounded">↓</kbd>
          Slide
        </span>
        <span className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/10 rounded">ESC</kbd>
          Pause
        </span>
      </div>

      {powerUpTimer > 0 && (
        <div className="mt-2 w-full max-w-[300px]">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
              initial={{ width: "100%" }}
              animate={{ width: `${(powerUpTimer / 5000) * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
