"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Trophy, Users, Monitor, 
  RotateCcw, Volume2, VolumeX, Star, Crown, Keyboard, MousePointer2, 
  Sparkles, Zap, Shield, Target, History, ChevronRight, PlayCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import confetti from "canvas-confetti";

type PlayerColor = "red" | "green" | "yellow" | "blue";

interface Piece {
  id: number;
  color: PlayerColor;
  position: number; // -1 = base, 0-51 = common path, 52-57 = home path, 58 = home
}

interface Player {
  color: PlayerColor;
  isBot: boolean;
  name: string;
  pieces: Piece[];
}

const PLAYER_CONFIG: Record<PlayerColor, { start: number; homeEntrance: number; baseOffset: number; theme: string; light: string }> = {
  red: { start: 0, homeEntrance: 50, baseOffset: 0, theme: "from-red-600 to-red-800", light: "bg-red-500/10" },
  green: { start: 13, homeEntrance: 11, baseOffset: 1, theme: "from-green-600 to-green-800", light: "bg-green-500/10" },
  yellow: { start: 26, homeEntrance: 24, baseOffset: 2, theme: "from-yellow-500 to-yellow-700", light: "bg-yellow-500/10" },
  blue: { start: 39, homeEntrance: 37, baseOffset: 3, theme: "from-blue-600 to-blue-800", light: "bg-blue-500/10" },
};

const SAFE_SPOTS = [0, 8, 13, 21, 26, 34, 39, 47];

// Board Grid Mapping (15x15)
const BOARD_PATH = [
  [6,1],[6,2],[6,3],[6,4],[6,5],
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
  [0,7],[0,8],
  [1,8],[2,8],[3,8],[4,8],[5,8],
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
  [7,14],[8,14],
  [8,13],[8,12],[8,11],[8,10],[8,9],
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  [14,7],[14,6],
  [13,6],[12,6],[11,6],[10,6],[9,6],
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
  [7,0],[6,0]
];

const HOME_PATHS: Record<PlayerColor, number[][]> = {
  red: [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  green: [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  yellow: [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  blue: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
};

const BASE_POSITIONS: Record<PlayerColor, number[][]> = {
  red: [[1.5,1.5], [1.5,3.5], [3.5,1.5], [3.5,3.5]],
  green: [[1.5,10.5], [1.5,12.5], [3.5,10.5], [3.5,12.5]],
  yellow: [[10.5,10.5], [10.5,12.5], [13.5,10.5], [13.5,12.5]],
  blue: [[10.5,1.5], [10.5,3.5], [13.5,1.5], [13.5,3.5]],
};

const AI_NAMES = ["Supreme AI", "Royal Bot", "Strategy King", "Mastermind"];

export default function LudoGame({ soundEnabled = true }: { soundEnabled?: boolean }) {
  const [playerCount, setPlayerCount] = useState(4);
  const [humanCount, setHumanCount] = useState(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);
  const [lastMoveLog, setLastMoveLog] = useState("");

  const audioCtx = useRef<AudioContext | null>(null);

  const playSound = (freq: number, type: OscillatorType = "sine", duration = 0.1) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtx.current.state === "suspended") {
        audioCtx.current.resume();
      }
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      osc.start();
      osc.stop(audioCtx.current.currentTime + duration);
    } catch (e) {}
  };

  const initGame = (pCount: number, hCount: number) => {
    const colors: PlayerColor[] = ["red", "green", "yellow", "blue"];
    const initialPlayers: Player[] = colors.slice(0, pCount).map((color, i) => ({
      color,
      isBot: i >= hCount,
      name: i < hCount ? `Player ${i + 1}` : AI_NAMES[i % AI_NAMES.length],
      pieces: Array.from({ length: 4 }, (_, id) => ({ id, color, position: -1 }))
    }));
    setPlayers(initialPlayers);
    setCurrentPlayerIndex(0);
    setHasRolled(false);
    setWinner(null);
    setGameStarted(true);
    setLastMoveLog("Royal battle initialized. Red starts.");
  };

  const getGlobalPos = (color: PlayerColor, pos: number) => {
    if (pos === -1 || pos >= 52) return -1;
    return (PLAYER_CONFIG[color].start + pos) % 52;
  };

  const getMovablePieces = (player: Player, dice: number) => {
    if (!player) return [];
    return player.pieces.filter(p => {
      if (p.position === 58) return false;
      if (p.position === -1) return dice === 6;
      if (p.position >= 52) return p.position + dice <= 58;
      return true;
    });
  };

  const calculateBestMove = (player: Player, dice: number) => {
    const movable = getMovablePieces(player, dice);
    if (movable.length === 0) return null;

    const scores = movable.map(p => {
      let score = 0;
      const currentPos = p.position;
      const futurePos = p.position === -1 ? 0 : p.position + dice;
      const futureGlobal = getGlobalPos(player.color, futurePos);

      // 1. Victory Move (Max Priority)
      if (futurePos === 58) score += 1000000;

      // 2. Hit Opponent (Extremely High Priority)
      if (futurePos < 52 && !SAFE_SPOTS.includes(futureGlobal)) {
        players.forEach((other, idx) => {
          if (idx !== currentPlayerIndex) {
            other.pieces.forEach(op => {
              const opGlobal = getGlobalPos(other.color, op.position);
              if (opGlobal === futureGlobal && opGlobal !== -1) {
                score += 500000; // Found an opponent to cut!
              }
            });
          }
        });
      }

      // 3. Move out of Base (High Priority)
      if (p.position === -1 && dice === 6) {
        score += 300000;
      }

      // 4. Entering Home Stretch (Avoid circling again)
      if (futurePos >= 52 && currentPos < 52) {
        score += 200000;
      }

      // 5. Landing on Safe Spot
      if (SAFE_SPOTS.includes(futureGlobal)) {
        score += 100000;
      }

      // 6. Escape Danger Zone (If currently in danger)
      const currentGlobal = getGlobalPos(player.color, currentPos);
      if (currentGlobal !== -1 && !SAFE_SPOTS.includes(currentGlobal)) {
        let underThreat = false;
        players.forEach((other, idx) => {
          if (idx !== currentPlayerIndex) {
            other.pieces.forEach(op => {
              const opGlobal = getGlobalPos(other.color, op.position);
              if (opGlobal !== -1) {
                const dist = (currentGlobal - opGlobal + 52) % 52;
                if (dist > 0 && dist <= 6) underThreat = true;
              }
            });
          }
        });
        if (underThreat) score += 150000;
      }

      // 7. Avoid Unsafe Moves (Don't land where others can hit you)
      if (futurePos < 52 && !SAFE_SPOTS.includes(futureGlobal)) {
        let willBeUnderThreat = false;
        players.forEach((other, idx) => {
          if (idx !== currentPlayerIndex) {
            other.pieces.forEach(op => {
              const opGlobal = getGlobalPos(other.color, op.position);
              if (opGlobal !== -1) {
                const dist = (futureGlobal - opGlobal + 52) % 52;
                if (dist > 0 && dist <= 6) willBeUnderThreat = true;
              }
            });
          }
        });
        if (willBeUnderThreat) score -= 80000;
      }

      // 8. Racing Home (Favor pieces closer to home)
      score += futurePos * 2000;

      // 9. Protect Pieces (Don't move if it leaves another piece alone?) - Simplified: prioritize moving vulnerable pieces
      
      return { piece: p, score };
    });

    return scores.sort((a, b) => b.score - a.score)[0].piece;
  };

  const movePiece = async (piece: Piece) => {
    if (!hasRolled || isMoving || winner) return;
    setIsMoving(true);

    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    const targetPiece = player.pieces.find(p => p.id === piece.id)!;

    let steps = diceValue;
    if (targetPiece.position === -1) {
      targetPiece.position = 0;
      steps = 0;
      if (soundEnabled) {
        new Audio("https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3").play().catch(() => {});
      }
      setLastMoveLog(`${player.name} deployed a piece.`);
    }

    const startPos = targetPiece.position;
    for (let i = 1; i <= steps; i++) {
      targetPiece.position = startPos + i;
      if (soundEnabled && i === steps) {
        new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3").play().catch(() => {});
      }
      setPlayers([...newPlayers]);
      await new Promise(r => setTimeout(r, 120));
    }

    // Hit Logic - Real Ludo Rules: Hits only on non-safe spots
    let hitOccurred = false;
    const finalGlobalPos = getGlobalPos(player.color, targetPiece.position);
    if (targetPiece.position < 52 && !SAFE_SPOTS.includes(finalGlobalPos)) {
      newPlayers.forEach((p, pIdx) => {
        if (pIdx !== currentPlayerIndex) {
          p.pieces.forEach(op => {
            if (getGlobalPos(p.color, op.position) === finalGlobalPos) {
              op.position = -1;
              hitOccurred = true;
              if (soundEnabled) {
                new Audio("https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3").play().catch(() => {});
              }
              setLastMoveLog(`${player.name} captured ${p.name}'s piece! Extra turn!`);
            }
          });
        }
      });
    }

    setPlayers([...newPlayers]);
    setIsMoving(false);
    setHasRolled(false);

    if (targetPiece.position === 58) {
      setLastMoveLog(`${player.name} reached HOME! Extra turn!`);
      if (player.pieces.every(p => p.position === 58)) {
        setWinner(player.color);
        playSound(880, "triangle", 0.6);
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        return;
      }
    }

    // Extra Turn Rules: 6, Hit, or Reach Home
    if (diceValue === 6 || hitOccurred || (targetPiece.position === 58 && steps > 0)) {
      setHasRolled(false);
      // Wait for AI if next roll is also AI
      if (player.isBot) {
        setTimeout(rollDice, 1000);
      }
    } else {
      nextTurn();
    }
  };


  const rollDice = useCallback(() => {
    if (isRolling || hasRolled || winner || isMoving || !gameStarted) return;
    
    setIsRolling(true);
    playSound(261.63, "sine", 0.4);

    setTimeout(() => {
      const val = Math.floor(Math.random() * 6) + 1;
      setDiceValue(val);
      setIsRolling(false);
      setHasRolled(true);

      const nextSixes = val === 6 ? consecutiveSixes + 1 : 0;
      if (nextSixes === 3) {
        setConsecutiveSixes(0);
        setHasRolled(false);
        setLastMoveLog("3 Sixes! Penalty applied.");
        setTimeout(nextTurn, 1000);
        return;
      }
      setConsecutiveSixes(nextSixes);

      const currentPlayer = players[currentPlayerIndex];
      const movablePieces = getMovablePieces(currentPlayer, val);

      if (movablePieces.length === 0) {
        setLastMoveLog("No moves possible.");
        setTimeout(nextTurn, 1000);
      } else if (currentPlayer.isBot) {
        const bestPiece = calculateBestMove(currentPlayer, val);
        if (bestPiece) setTimeout(() => movePiece(bestPiece), 800);
      }
    }, 600);
  }, [isRolling, hasRolled, winner, players, currentPlayerIndex, isMoving, gameStarted, consecutiveSixes]);

  const nextTurn = () => {
    const nextIdx = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIdx);
    setHasRolled(false);
    setLastMoveLog(`${players[nextIdx].name}'s turn.`);
  };

  useEffect(() => {
    if (gameStarted && players[currentPlayerIndex]?.isBot && !hasRolled && !winner && !isMoving) {
      const timer = setTimeout(rollDice, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayerIndex, hasRolled, winner, gameStarted, isMoving, rollDice, players]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || winner) return;
      const currentPlayer = players[currentPlayerIndex];
      if (currentPlayer?.isBot) return;

      if (e.code === "Space" || e.code === "Enter") {
        rollDice();
      } else if (hasRolled && ["Digit1", "Digit2", "Digit3", "Digit4"].includes(e.code)) {
        const pieceIdx = parseInt(e.key) - 1;
        const piece = currentPlayer.pieces[pieceIdx];
        const movable = getMovablePieces(currentPlayer, diceValue);
        if (movable.some(p => p.id === piece.id)) {
          movePiece(piece);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, winner, players, currentPlayerIndex, hasRolled, diceValue, rollDice]);

  const getCoordinates = (p: Piece) => {
    if (p.position === -1) return BASE_POSITIONS[p.color][p.id];
    if (p.position === 58) return [7, 7];
    if (p.position >= 52) return HOME_PATHS[p.color][p.position - 52];
    const pathIdx = (PLAYER_CONFIG[p.color].start + p.position) % 52;
    return BOARD_PATH[pathIdx];
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] p-6 rounded-[3rem] overflow-hidden border border-white/10 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.05),transparent)] pointer-events-none" />
        
        {!gameStarted ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-12 z-10 max-w-2xl w-full">
            <div className="space-y-4">
              <h2 className="text-8xl font-black gold-text-gradient uppercase tracking-tighter leading-none">Royal Ludo</h2>
              <p className="text-yellow-500/40 font-black uppercase tracking-[0.4em] text-xs">Supreme Tournament Edition</p>
            </div>
            
            <Card className="bg-white/[0.03] border-2 border-white/5 p-12 rounded-[4rem] space-y-12 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              <div className="space-y-6">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Warriors Selection</p>
                <div className="grid grid-cols-3 gap-4">
                  {[2, 3, 4].map(num => (
                    <button 
                      key={num} 
                      onClick={() => { setPlayerCount(num); setHumanCount(Math.min(humanCount, num)); }}
                      className={`h-20 rounded-3xl font-black text-2xl transition-all border-2 ${playerCount === num ? "gold-gradient text-black border-yellow-400" : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Human Commanders</p>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].filter(n => n <= playerCount).map(num => (
                    <button 
                      key={num} 
                      onClick={() => setHumanCount(num)}
                      className={`h-20 rounded-3xl font-black text-2xl transition-all border-2 ${humanCount === num ? "gold-gradient text-black border-yellow-400" : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => initGame(playerCount, humanCount)} className="w-full gold-gradient text-black font-black py-10 rounded-[2.5rem] text-4xl shadow-2xl hover:scale-105 transition-all group flex items-center justify-center gap-4">
                <PlayCircle className="w-10 h-10 group-hover:rotate-12 transition-transform" />
                COMMENCE BATTLE
              </button>
            </Card>
          </motion.div>
        ) : (
          <div className="flex flex-col xl:flex-row items-center gap-16 w-full max-w-[1400px] h-full z-10">
            {/* Ludo Board Container */}
            <div className="relative w-[min(80vh,620px)] aspect-square bg-zinc-900 rounded-[3rem] shadow-[0_60px_120px_rgba(0,0,0,0.9)] p-4 border-[16px] border-[#111]">
              <div className="w-full h-full grid grid-cols-15 grid-rows-15 gap-[1px] bg-black/20 rounded-2xl overflow-hidden relative">
                  {Array.from({ length: 15 * 15 }).map((_, i) => {
                    const r = Math.floor(i / 15);
                    const c = i % 15;
                    let bgColor = "bg-[#151515]";
                    
                    if (r < 6 && c < 6) bgColor = "bg-red-600/90";
                    if (r < 6 && c > 8) bgColor = "bg-green-600/90";
                    if (r > 8 && c > 8) bgColor = "bg-yellow-500/90";
                    if (r > 8 && c < 6) bgColor = "bg-blue-600/90";
                    
                    if (r === 7 && c > 0 && c < 7) bgColor = "bg-red-500/30";
                    if (c === 7 && r > 0 && r < 7) bgColor = "bg-green-500/30";
                    if (r === 7 && c > 7 && c < 14) bgColor = "bg-yellow-500/30";
                    if (c === 7 && r > 7 && r < 14) bgColor = "bg-blue-500/30";
                    
                    if (r >= 6 && r <= 8 && c >= 6 && c <= 8) bgColor = "bg-zinc-950";

                    const isSafe = (r === 6 && c === 1) || (r === 1 && c === 8) || (r === 8 && c === 13) || (r === 13 && c === 6) ||
                                   (r === 2 && c === 6) || (r === 6 && c === 12) || (r === 12 && c === 8) || (r === 8 && c === 2);

                    return (
                      <div key={i} className={`${bgColor} flex items-center justify-center relative border-[0.1px] border-white/5 transition-colors`}>
                        {isSafe && <Star className="w-4 h-4 text-white/10" />}
                      </div>
                    );
                  })}
              </div>

              {/* Pieces Layer */}
              {players.flatMap(p => p.pieces).map(pc => {
                const [r, c] = getCoordinates(pc);
                const isCurrent = players[currentPlayerIndex]?.color === pc.color;
                const canMove = isCurrent && hasRolled && !isMoving && getMovablePieces(players[currentPlayerIndex], diceValue).some(p => p.id === pc.id);

                return (
                  <motion.div
                    key={`${pc.color}-${pc.id}`}
                    layout
                    animate={{ top: `${(r / 15) * 100}%`, left: `${(c / 15) * 100}%`, scale: pc.position === 58 ? 0 : 1 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className={`absolute w-[6.2%] aspect-square rounded-full border-2 border-white shadow-2xl z-20 cursor-pointer flex items-center justify-center ${
                      pc.color === "red" ? "bg-red-600" : pc.color === "green" ? "bg-green-600" : pc.color === "yellow" ? "bg-yellow-500" : "bg-blue-600"
                    } ${canMove ? "ring-4 ring-yellow-400 scale-125 z-30 shadow-[0_0_20px_rgba(234,179,8,0.8)]" : ""}`}
                    onClick={() => canMove && movePiece(pc)}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                    {canMove && <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity }} className="absolute inset-0 rounded-full bg-white/20" />}
                  </motion.div>
                );
              })}
              
              <div className="absolute top-[38%] left-[38%] w-[24%] h-[24%] flex items-center justify-center z-10 pointer-events-none">
                <div className="relative w-full h-full flex items-center justify-center">
                   <div className="absolute inset-0 gold-gradient rounded-full blur-2xl opacity-20" />
                   <Crown className="w-24 h-24 text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.6)] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="flex flex-col gap-8 w-full max-w-sm">
              <Card className="bg-white/[0.03] border-2 border-white/5 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="flex items-center justify-between mb-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Turn Holder</p>
                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full shadow-lg ${players[currentPlayerIndex]?.color === 'red' ? 'bg-red-500' : players[currentPlayerIndex]?.color === 'green' ? 'bg-green-500' : players[currentPlayerIndex]?.color === 'yellow' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                      {players[currentPlayerIndex]?.name}
                    </h3>
                  </div>
                  <div className={`p-4 rounded-2xl ${players[currentPlayerIndex]?.isBot ? 'bg-white/5' : 'bg-yellow-500/10'}`}>
                    {players[currentPlayerIndex]?.isBot ? <Monitor className="w-8 h-8 text-white/40" /> : <Users className="w-8 h-8 text-yellow-500" />}
                  </div>
                </div>

                <motion.div
                  key={diceValue + (isRolling ? "-roll" : "")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-40 h-40 mx-auto mb-12 bg-white rounded-[2.5rem] flex items-center justify-center text-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer relative group ${isRolling ? 'animate-bounce' : ''}`}
                  onClick={rollDice}
                >
                  <div className="absolute inset-0 gold-gradient opacity-0 group-hover:opacity-10 transition-opacity rounded-[2.5rem]" />
                  {diceValue === 1 && <Dice1 size={100} />}
                  {diceValue === 2 && <Dice2 size={100} />}
                  {diceValue === 3 && <Dice3 size={100} />}
                  {diceValue === 4 && <Dice4 size={100} />}
                  {diceValue === 5 && <Dice5 size={100} />}
                  {diceValue === 6 && <Dice6 size={100} />}
                </motion.div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                      <History className="w-3 h-3" /> Event Log
                    </p>
                    {hasRolled && !isMoving && <Badge className="gold-gradient text-black text-[8px] font-black uppercase">Roll Success</Badge>}
                  </div>
                  <div className="bg-black/60 p-6 rounded-[2rem] border border-white/5 min-h-[100px] flex items-center italic">
                     <p className="text-white/80 text-sm font-medium leading-relaxed">"{lastMoveLog}"</p>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setGameStarted(false)} className="bg-white/5 hover:bg-white/10 text-white/40 h-16 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all">RESTART</button>
                <button onClick={() => window.location.reload()} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 h-16 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all border border-red-500/20">EXIT</button>
              </div>

              <Card className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Keyboard className="w-5 h-5 text-white/20" />
                  <p className="text-[10px] font-bold text-white/40 uppercase">Space to Roll • 1-4 to Move</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[8px] font-black text-green-500 uppercase">Live</p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {winner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[100] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-8">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Trophy className="w-64 h-64 text-yellow-500 mb-10 drop-shadow-[0_0_60px_rgba(234,179,8,0.5)]" />
            </motion.div>
            <h2 className="text-9xl font-black gold-text-gradient uppercase tracking-tighter text-center leading-none">{winner} VICTORY</h2>
            <p className="text-white/40 font-black uppercase tracking-[0.5em] text-xl mt-4">Platform Champion</p>
            <button onClick={() => window.location.reload()} className="gold-gradient text-black font-black px-24 py-12 text-4xl rounded-[3rem] mt-20 shadow-[0_20px_80px_rgba(234,179,8,0.3)] hover:scale-105 transition-transform">GLORY AGAIN</button>
          </motion.div>
        )}
    </div>
  );
}
