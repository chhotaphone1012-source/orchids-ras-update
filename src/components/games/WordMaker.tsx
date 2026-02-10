"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Lightbulb, Clock } from "lucide-react";

interface GameProps {
  level: number;
  onComplete: (points: number) => void;
  onGameOver: () => void;
  soundEnabled: boolean;
}

const wordsByLength = {
  4: ["GAME", "PLAY", "FIRE", "GOLD", "STAR", "FAST", "JUMP", "WAVE", "KING", "HERO", "BALL", "MAZE", "BIRD", "COIN", "ROCK"],
  5: ["GAMER", "NEXTS", "REACT", "SNAKE", "GHOST", "LEVEL", "SCORE", "POINT", "BONUS", "POWER", "SPEED", "QUEST", "MAGIC"],
  6: ["GAMING", "PLAYER", "GOLDEN", "ORANGE", "YELLOW", "PURPLE", "ROCKET", "PLANET", "DRAGON", "CASTLE", "WONDER", "BRIGHT"],
  7: ["VICTORY", "PREMIUM", "AMAZING", "PERFECT", "SUPREME", "AWESOME", "BLAZING", "CRYSTAL", "DIAMOND", "THUNDER"],
  8: ["CHAMPION", "REALTIME", "ULTIMATE", "POWERFUL", "GLORIOUS", "MAJESTIC", "SUPREME8", "INFINITE", "MAGNETIC"]
};

export default function WordMaker({ level, onComplete, onGameOver, soundEnabled }: GameProps) {
  const [currentWord, setCurrentWord] = useState("");
  const [scrambled, setScrambled] = useState<{ char: string; id: number }[]>([]);
  const [selected, setSelected] = useState<{ char: string; id: number }[]>([]);
    const [score, setScore] = useState(0);
    const [wordsCompleted, setWordsCompleted] = useState(0);
    const [hints, setHints] = useState(5);
    const [streak, setStreak] = useState(0);
    const [theme, setTheme] = useState("Gaming");
    const [bonusWord, setBonusWord] = useState<string | null>(null);
    const [hintActive, setHintActive] = useState<number | null>(null);
    const targetWords = 10 + level * 2; // Reduced for faster progression

    const themes = {
      Gaming: ["GAMER", "ARENA", "SKILL", "QUEST", "BATTLE", "LEVEL", "TROPHY", "GLORY", "PLAYER", "CHAMP"],
      Space: ["STARS", "MOON", "GALAXY", "PLANET", "COMET", "ORBIT", "SOLAR", "COSMOS", "NEBULA", "ALIEN"],
      Myth: ["ZEUS", "ODIN", "THOR", "HADES", "TITAN", "DRAGON", "HYDRA", "MAGIC", "MYSTIC", "ORACLE"]
    };

    const getWordLength = useCallback(() => {
      if (level <= 1) return 4;
      if (level <= 3) return 5;
      if (level <= 5) return 6;
      if (level <= 7) return 7;
      return 8;
    }, [level]);

    const generateNextWord = useCallback(() => {
      const themeKeys = Object.keys(themes);
      const randomTheme = themeKeys[Math.floor(Math.random() * themeKeys.length)];
      setTheme(randomTheme);
      
      const themeWords = themes[randomTheme as keyof typeof themes];
      const word = themeWords[Math.floor(Math.random() * themeWords.length)];
      setCurrentWord(word);
      
      // Add Decoy Letters
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const decoyCount = Math.min(level, 4);
      const decoys = Array.from({ length: decoyCount }, () => ({
        char: alphabet[Math.floor(Math.random() * alphabet.length)],
        id: Math.random() + 100
      }));

        const shuffled = [...word.split("").map((char, i) => ({ char, id: i })), ...decoys]
          .sort(() => Math.random() - 0.5);
          
        setScrambled(shuffled);
        setSelected([]);
        setBonusWord(themeWords[Math.floor(Math.random() * themeWords.length)]);
      }, [level]);

    useEffect(() => {
      generateNextWord();
      setHints(5);
    }, [generateNextWord, level]);

  const selectLetter = (item: { char: string; id: number }) => {
    const newSelected = [...selected, item];
    setSelected(newSelected);
    setScrambled(prev => prev.filter(s => s.id !== item.id));

    if (soundEnabled) {
      new Audio("https://www.soundjay.com/buttons/sounds/button-16.mp3").play().catch(() => {});
    }

    const currentGuess = newSelected.map(s => s.char).join("");
    
    if (currentGuess === currentWord || currentGuess === bonusWord) {
      const isBonus = currentGuess === bonusWord;
      const newStreak = streak + 1;
      setStreak(newStreak);
      const streakBonus = Math.min(newStreak * 20, 100);
      const lengthBonus = currentGuess.length * 50;
      const extraBonus = isBonus ? 200 : 0;
      const wordPoints = lengthBonus + streakBonus + extraBonus;
      
        setScore(prev => prev + wordPoints);
        setWordsCompleted(prev => prev + 1);
        
        if (soundEnabled) {
          new Audio("https://www.soundjay.com/buttons/sounds/button-10.mp3").play().catch(() => {});
        }
        
        const wordsPerLevel = 5;
        if ((wordsCompleted + 1) % wordsPerLevel === 0) {
          if (soundEnabled) {
            const audio = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
            audio.play().catch(() => {});
          }
          onComplete(200 + level * 50); // Level bonus
        }
        setTimeout(generateNextWord, 500);
      } else if (newSelected.length >= currentWord.length + 2) {
      setStreak(0);
      if (soundEnabled) {
        new Audio("https://www.soundjay.com/buttons/sounds/button-4.mp3").play().catch(() => {});
      }
      setTimeout(resetWord, 500);
    }
  };

  const useHint = () => {
    if (hints <= 0 || selected.length >= currentWord.length) return;
    
    const nextIndex = selected.length;
    const nextChar = currentWord[nextIndex];
    const item = scrambled.find(s => s.char === nextChar);
    
    if (item) {
      setHintActive(item.id);
      setTimeout(() => setHintActive(null), 1000);
      setHints(prev => prev - 1);
    }
  };

  const resetWord = () => {
    generateNextWord();
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-12 p-16 w-full h-full bg-gradient-to-br from-zinc-950 via-indigo-950 to-zinc-950 rounded-[3rem] shadow-2xl">
        <div className="w-full max-w-5xl flex justify-between items-center text-white font-black uppercase tracking-tighter">
          <div className="flex flex-col items-start gap-2">
            <span className="text-indigo-400 text-2xl">Theme: {theme}</span>
            <span className="text-lg text-white/40">Progress: {wordsCompleted}/{targetWords}</span>
          </div>
          <div className="flex flex-col items-center scale-150">
            <span className="text-6xl gold-text-gradient tabular-nums">{score}</span>
            {streak > 1 && (
              <motion.span 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-yellow-400 text-sm mt-2 font-black"
              >
                {streak}X MULTIPLIER!
              </motion.span>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-yellow-400 flex items-center gap-3 text-2xl">
              <Lightbulb className="w-8 h-8" /> {hints} HINTS
            </span>
          </div>
        </div>

        <div className="bg-black/60 rounded-[4rem] p-16 border-4 border-indigo-500/30 min-h-[220px] min-w-[700px] shadow-[0_0_80px_rgba(99,102,241,0.2)] backdrop-blur-3xl">
          <div className="flex flex-wrap justify-center gap-6 min-h-[110px]">
            <AnimatePresence>
              {selected.map((item, i) => (
                <motion.button
                  key={`selected-${item.id}`}
                  initial={{ scale: 0, y: 50, rotate: -20 }}
                  animate={{ scale: 1, y: 0, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => {
                    setSelected(prev => prev.filter((_, idx) => idx !== i));
                    setScrambled(prev => [...prev, item]);
                  }}
                  className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-3xl flex items-center justify-center text-5xl font-black text-white shadow-[0_15px_40px_rgba(99,102,241,0.5)] border-b-[12px] border-indigo-900"
                >
                  {item.char}
                </motion.button>
              ))}
            </AnimatePresence>
            {[...Array(Math.max(0, currentWord.length - selected.length))].map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-24 h-24 border-4 border-dashed border-indigo-500/20 rounded-3xl"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 max-w-4xl">
          <AnimatePresence>
            {scrambled.map(item => (
              <motion.button
                key={`scrambled-${item.id}`}
                initial={{ scale: 0, rotate: 20 }}
                animate={{ 
                  scale: 1,
                  rotate: 0,
                  boxShadow: hintActive === item.id ? "0 0 60px #fbbf24" : "0 8px 25px rgba(0,0,0,0.4)",
                  borderColor: hintActive === item.id ? "#fbbf24" : "rgba(99, 102, 241, 0.2)"
                }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.15, y: -12, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => selectLetter(item)}
                className={`w-24 h-24 bg-zinc-900/80 rounded-3xl flex items-center justify-center text-5xl font-black text-indigo-100 border-2 transition-all shadow-2xl backdrop-blur-sm`}
              >
                {item.char}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex gap-10">
          <Button
            size="lg"
            variant="outline"
            className="h-20 px-14 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-full font-black text-2xl tracking-widest shadow-xl transition-all"
            onClick={resetWord}
          >
            <RotateCcw className="w-8 h-8 mr-4" /> RESET
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-20 px-14 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500 hover:text-black rounded-full font-black text-2xl tracking-widest shadow-xl transition-all disabled:opacity-30"
            onClick={useHint}
            disabled={hints <= 0}
          >
            <Lightbulb className="w-8 h-8 mr-4" /> HINT ({hints})
          </Button>
        </div>

        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-indigo-300 text-2xl font-black tracking-[0.2em] uppercase text-center"
        >
          {bonusWord && <span className="text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">✨ Bonus word hidden! find it for massive XP! ✨</span>}
        </motion.div>
      </div>
  );
}
