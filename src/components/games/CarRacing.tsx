"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface CarRacingProps {
  level: number;
  onComplete: (points: number) => void;
  onGameOver: () => void;
  soundEnabled: boolean;
  isPaused: boolean;
}

export default function CarRacing({
  level,
  onComplete,
  onGameOver,
  soundEnabled,
  isPaused,
}: CarRacingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(5 + level);
  
  const gameState = useRef({
    carX: 175,
    carY: 500,
    obstacles: [] as { x: number; y: number; width: number; height: number; type: number }[],
    laneWidth: 100,
    lanes: 4,
    roadOffset: 0,
    gameOver: false,
    frame: 0,
  });

  const keys = useRef<{ [key: string]: boolean }>({});
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.key] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.key] = false);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const spawnObstacle = () => {
      const lane = Math.floor(Math.random() * gameState.current.lanes);
      gameState.current.obstacles.push({
        x: lane * gameState.current.laneWidth + 25,
        y: -100,
        width: 50,
        height: 80,
        type: Math.floor(Math.random() * 3),
      });
    };

    const playSound = (freq: number, type: OscillatorType = "sine", duration = 0.1) => {
      if (!soundEnabled) return;
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + duration);
      } catch (e) {}
    };

    const update = () => {
      if (isPaused || gameState.current.gameOver) return;

      // Move player
      if (keys.current["ArrowLeft"] && gameState.current.carX > 10) {
        gameState.current.carX -= 7;
        if (gameState.current.frame % 10 === 0) playSound(100, "sawtooth", 0.05);
      }
      if (keys.current["ArrowRight"] && gameState.current.carX < canvas.width - 60) {
        gameState.current.carX += 7;
        if (gameState.current.frame % 10 === 0) playSound(100, "sawtooth", 0.05);
      }

      // Update obstacles
      gameState.current.roadOffset = (gameState.current.roadOffset + speed) % 100;
      
      if (gameState.current.frame % Math.max(20, 100 - level * 5) === 0) {
        spawnObstacle();
      }

      gameState.current.obstacles.forEach((obs, index) => {
        obs.y += speed;
        
        // Collision detection
        if (
          gameState.current.carX < obs.x + obs.width &&
          gameState.current.carX + 50 > obs.x &&
          gameState.current.carY < obs.y + obs.height &&
          gameState.current.carY + 80 > obs.y
        ) {
          gameState.current.gameOver = true;
          playSound(50, "sawtooth", 0.5);
          onGameOver();
        }

        // Remove off-screen obstacles
        if (obs.y > canvas.height) {
          gameState.current.obstacles.splice(index, 1);
          setScore(prev => prev + 10);
          playSound(200, "sine", 0.05);
        }
      });

      gameState.current.frame++;
      
      if (score >= level * 1000) {
        onComplete(100);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Road
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Lane Markings
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.setLineDash([40, 60]);
      ctx.lineDashOffset = -gameState.current.roadOffset;
      ctx.lineWidth = 4;
      for (let i = 1; i < gameState.current.lanes; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gameState.current.laneWidth, 0);
        ctx.lineTo(i * gameState.current.laneWidth, canvas.height);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw Player Car
      ctx.fillStyle = "#fbbf24"; // Gold
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#fbbf24";
      ctx.fillRect(gameState.current.carX, gameState.current.carY, 50, 80);
      
      // Car Details
      ctx.fillStyle = "black";
      ctx.fillRect(gameState.current.carX + 5, gameState.current.carY + 10, 40, 20); // Windshield
      ctx.fillRect(gameState.current.carX + 5, gameState.current.carY + 50, 40, 20); // Back window

      // Draw Obstacles
      ctx.shadowBlur = 10;
      gameState.current.obstacles.forEach(obs => {
        ctx.fillStyle = obs.type === 0 ? "#ef4444" : obs.type === 1 ? "#3b82f6" : "#10b981";
        ctx.shadowColor = ctx.fillStyle as string;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      });
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(() => {
        update();
        draw();
      });
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, level, speed, onComplete, onGameOver, score, soundEnabled]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-zinc-900 overflow-hidden rounded-[2rem]">
      <canvas
        ref={canvasRef}
        width={400}
        height={600}
        className="border-x-4 border-yellow-500/20 shadow-2xl"
      />
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-yellow-500/20">
        <p className="text-yellow-500 font-black text-xl">SCORE: {score}</p>
        <p className="text-white/60 text-xs font-bold uppercase">NEXT LEVEL: {level * 1000}</p>
      </div>
      
      {!isPaused && !gameState.current.gameOver && (
        <div className="absolute bottom-8 text-white/30 font-black uppercase tracking-widest text-xs animate-pulse">
          Use ← → Arrows to Drive
        </div>
      )}
    </div>
  );
}
