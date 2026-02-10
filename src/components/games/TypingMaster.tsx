"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, Trophy, Target, Zap } from "lucide-react";

interface GameProps {
  level: number;
  onComplete: (points: number) => void;
  onGameOver: () => void;
  soundEnabled: boolean;
}

const wordsByDifficulty = {
  easy: ["CAT", "DOG", "SUN", "RUN", "FUN", "HAT", "BAT", "MAP", "CUP", "TOP"],
  medium: ["GAMING", "PLAYER", "GOLDEN", "ORANGE", "YELLOW", "PURPLE", "ROCKET", "PLANET", "DRAGON", "CASTLE"],
  hard: ["CHAMPION", "VICTORY", "PREMIUM", "REALTIME", "DASHBOARD", "LEADERBOARD", "CHALLENGE", "ADVENTURE", "FANTASTIC", "BEAUTIFUL"],
  expert: ["MAGNIFICENT", "EXTRAORDINARY", "SPECTACULAR", "ACHIEVEMENT", "PROGRAMMING", "JAVASCRIPT", "DEVELOPMENT", "PROFESSIONAL"]
};

export default function TypingMaster({ level, onComplete, onGameOver, soundEnabled }: GameProps) {
    const [currentWord, setCurrentWord] = useState("");
    const [input, setInput] = useState("");
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [wordsTyped, setWordsTyped] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [totalChars, setTotalChars] = useState(0);
    const [mistakes, setMistakeCount] = useState(0);
    const [lastMistake, setLastMistake] = useState(false);
    const [perfectWord, setPerfectWord] = useState(true);
    const startTimeRef = useRef(Date.now());
    const inputRef = useRef<HTMLInputElement>(null);
    const targetWords = 9999; // Play until out

    const accuracy = totalChars > 0 ? Math.round(((totalChars - mistakes) / totalChars) * 100) : 100;

    const getWordDifficulty = useCallback(() => {
      if (level <= 1) return "easy";
      if (level <= 3) return "medium";
      if (level <= 6) return "hard";
      return "expert";
    }, [level]);

    const generateNextWord = useCallback(() => {
      const difficulty = getWordDifficulty();
      const words = wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty];
      const randomWord = words[Math.floor(Math.random() * words.length)];
      setCurrentWord(randomWord);
      setInput("");
      setPerfectWord(true);
    }, [getWordDifficulty]);

    useEffect(() => {
      generateNextWord();
      startTimeRef.current = Date.now();
    }, [generateNextWord, level]);

    useEffect(() => {
      const timer = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 60000;
        if (elapsed > 0 && totalChars > 0) {
          setWpm(Math.round((totalChars / 5) / elapsed));
        }
      }, 1000);
      return () => clearInterval(timer);
    }, [totalChars]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    
    if (val.length > input.length) {
      const lastChar = val[val.length - 1];
      const expectedChar = currentWord[val.length - 1];
      
      if (lastChar !== expectedChar) {
        setMistakeCount(m => m + 1);
        setLastMistake(true);
        setPerfectWord(false);
        setTimeout(() => setLastMistake(false), 200);
        if (soundEnabled) {
          new Audio("https://www.soundjay.com/buttons/sounds/button-4.mp3").play().catch(() => {});
        }
      } else {
        if (soundEnabled) {
          new Audio("https://www.soundjay.com/buttons/sounds/button-16.mp3").play().catch(() => {});
        }
      }
    }
    
    setInput(val);
    
    if (val === currentWord) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const streakBonus = Math.min(newStreak * 10, 100);
      const perfectBonus = perfectWord ? 100 : 0;
      const wordPoints = currentWord.length * 20 + streakBonus + perfectBonus;
      
        setScore(prev => prev + wordPoints);
        setWordsTyped(prev => prev + 1);
        setTotalChars(prev => prev + currentWord.length);
        
        if (soundEnabled) {
          new Audio("https://www.soundjay.com/buttons/sounds/button-10.mp3").play().catch(() => {});
        }
        
        const wordsPerLevel = 5;
        if ((wordsTyped + 1) % wordsPerLevel === 0) {
          if (soundEnabled) {
            const audio = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
            audio.play().catch(() => {});
          }
          onComplete(200 + level * 50); // Level bonus
        }
        generateNextWord();
      }
    };

  const getCharClass = (char: string, index: number) => {
    if (index >= input.length) return "text-zinc-700";
    if (input[index] === char) return "text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]";
    return "text-red-500 line-through opacity-50";
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-16 p-20 w-full h-full bg-gradient-to-br from-zinc-950 via-rose-950 to-zinc-950 rounded-[3rem] shadow-2xl transition-all duration-300 ${lastMistake ? 'bg-red-900/10' : ''}`}>
      <div className="w-full max-w-6xl flex justify-between items-center text-white font-black uppercase tracking-tighter scale-110">
        <div className="flex flex-col items-start gap-3">
          <span className="text-rose-400 text-2xl flex items-center gap-3">
            <Target className="w-8 h-8" /> {accuracy}% ACCURACY
          </span>
          <div className="w-48 h-3 bg-zinc-900 rounded-full overflow-hidden border border-rose-500/20">
            <motion.div 
              className="h-full bg-rose-500"
              initial={{ width: 0 }}
              animate={{ width: `${accuracy}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col items-center scale-150">
          <span className="text-7xl gold-text-gradient tabular-nums">{score}</span>
          {streak > 1 && (
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-yellow-400 text-sm mt-2 font-black"
            >
              {streak}X STREAK!
            </motion.span>
          )}
        </div>
        <div className="flex flex-col items-end gap-3">
          <span className="text-cyan-400 text-2xl flex items-center gap-3">
            <Zap className="w-8 h-8" /> {wpm} WPM
          </span>
          <span className="text-purple-400 text-xl font-black tracking-widest">
            TYPED: {wordsTyped}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="bg-black/60 rounded-[4rem] p-24 border-4 border-rose-500/30 shadow-[0_0_100px_rgba(244,63,94,0.15)] backdrop-blur-3xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-7xl md:text-9xl font-black tracking-[0.4em] mb-8 text-center select-none">
            {currentWord.split("").map((char, i) => (
              <span key={i} className={`${getCharClass(char, i)} transition-all duration-150`}>
                {char}
              </span>
            ))}
          </div>
          <div className="flex justify-center items-center gap-10">
            <div className="px-6 py-2 bg-rose-500/10 rounded-full border border-rose-500/20 text-sm text-rose-400 font-black uppercase tracking-[0.2em]">
              {getWordDifficulty()} MODE
            </div>
            {perfectWord && input.length > 0 && (
              <motion.span 
                animate={{ y: [0, -5, 0], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-sm text-yellow-400 font-black tracking-widest"
              >
                ✨ PERFECT MULTIPLIER ACTIVE ✨
              </motion.span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="w-full max-w-2xl relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
        <Input 
          ref={inputRef}
          value={input}
          onChange={handleInput}
          placeholder="MASTER YOUR FOCUS..."
          className="relative text-center h-24 text-4xl border-rose-500/40 focus:border-rose-500 focus:ring-rose-500/20 uppercase bg-black/80 text-white font-black tracking-[0.3em] rounded-2xl shadow-2xl"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="flex gap-4">
          {["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"].map(key => (
            <motion.div
              key={key}
              animate={{ 
                scale: input.includes(key) ? 1.1 : 1,
                backgroundColor: input.includes(key) ? "rgba(244, 63, 94, 0.8)" : "rgba(24, 24, 27, 0.8)",
                borderColor: input.includes(key) ? "rgba(244, 63, 94, 1)" : "rgba(63, 63, 70, 0.5)"
              }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border-2 shadow-xl transition-all"
            >
              <span className={input.includes(key) ? "text-white" : "text-zinc-600"}>{key}</span>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-rose-400/40 font-black tracking-widest text-lg">
          <Keyboard className="w-6 h-6" />
          <span>FULL IMMERSION MODE ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
