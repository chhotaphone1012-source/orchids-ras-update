"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, Brain, Star, Trophy, Sparkles, BookOpen, Calculator, Globe, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameProps {
  level: number;
  onComplete: (points: number) => void;
  onGameOver: () => void;
  soundEnabled: boolean;
  isPaused?: boolean;
}

type QuestionCategory = "math" | "science" | "history" | "geography" | "general";

interface Question {
  id: number;
  category: QuestionCategory;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  difficulty: "easy" | "medium" | "hard";
}

const mathQuestions: Question[] = [
  { id: 1, category: "math", question: "What is 15 + 27?", options: ["42", "41", "43", "40"], correctAnswer: 0, points: 100, difficulty: "easy" },
  { id: 2, category: "math", question: "What is 8 × 7?", options: ["54", "56", "58", "52"], correctAnswer: 1, points: 100, difficulty: "easy" },
  { id: 3, category: "math", question: "What is 144 ÷ 12?", options: ["11", "13", "12", "14"], correctAnswer: 2, points: 150, difficulty: "medium" },
  { id: 4, category: "math", question: "What is the square root of 81?", options: ["8", "7", "10", "9"], correctAnswer: 3, points: 150, difficulty: "medium" },
  { id: 5, category: "math", question: "What is 25% of 200?", options: ["25", "50", "75", "100"], correctAnswer: 1, points: 200, difficulty: "medium" },
  { id: 6, category: "math", question: "What is 17 × 13?", options: ["221", "211", "231", "201"], correctAnswer: 0, points: 250, difficulty: "hard" },
  { id: 7, category: "math", question: "What is 2³ + 3²?", options: ["15", "17", "13", "19"], correctAnswer: 1, points: 250, difficulty: "hard" },
  { id: 8, category: "math", question: "If x + 5 = 12, what is x?", options: ["6", "8", "7", "5"], correctAnswer: 2, points: 150, difficulty: "medium" },
  { id: 9, category: "math", question: "What is the perimeter of a square with side 9?", options: ["36", "81", "27", "18"], correctAnswer: 0, points: 200, difficulty: "medium" },
  { id: 10, category: "math", question: "What is 1000 - 567?", options: ["433", "443", "423", "453"], correctAnswer: 0, points: 150, difficulty: "medium" },
];

const scienceQuestions: Question[] = [
  { id: 11, category: "science", question: "What planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], correctAnswer: 2, points: 100, difficulty: "easy" },
  { id: 12, category: "science", question: "What is H₂O commonly known as?", options: ["Salt", "Water", "Oxygen", "Carbon"], correctAnswer: 1, points: 100, difficulty: "easy" },
  { id: 13, category: "science", question: "How many bones are in the adult human body?", options: ["106", "306", "206", "256"], correctAnswer: 2, points: 200, difficulty: "medium" },
  { id: 14, category: "science", question: "What gas do plants absorb from the air?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctAnswer: 2, points: 150, difficulty: "medium" },
  { id: 15, category: "science", question: "What is the closest star to Earth?", options: ["Sirius", "The Sun", "Alpha Centauri", "Polaris"], correctAnswer: 1, points: 150, difficulty: "medium" },
  { id: 16, category: "science", question: "What is the chemical symbol for Gold?", options: ["Ag", "Go", "Gd", "Au"], correctAnswer: 3, points: 200, difficulty: "hard" },
  { id: 17, category: "science", question: "What is the hardest natural substance?", options: ["Iron", "Diamond", "Quartz", "Titanium"], correctAnswer: 1, points: 150, difficulty: "medium" },
  { id: 18, category: "science", question: "How many planets are in our solar system?", options: ["7", "8", "9", "10"], correctAnswer: 1, points: 100, difficulty: "easy" },
  { id: 19, category: "science", question: "What is the largest organ in the human body?", options: ["Heart", "Brain", "Liver", "Skin"], correctAnswer: 3, points: 200, difficulty: "medium" },
  { id: 20, category: "science", question: "What force keeps us on the ground?", options: ["Magnetism", "Friction", "Gravity", "Tension"], correctAnswer: 2, points: 100, difficulty: "easy" },
];

const historyQuestions: Question[] = [
  { id: 21, category: "history", question: "In what year did World War II end?", options: ["1943", "1944", "1945", "1946"], correctAnswer: 2, points: 150, difficulty: "medium" },
  { id: 22, category: "history", question: "Who was the first President of the USA?", options: ["Jefferson", "Lincoln", "Washington", "Adams"], correctAnswer: 2, points: 100, difficulty: "easy" },
  { id: 23, category: "history", question: "Which ancient wonder was in Egypt?", options: ["Colossus", "Pyramids", "Lighthouse", "Gardens"], correctAnswer: 1, points: 150, difficulty: "medium" },
  { id: 24, category: "history", question: "In what year did India gain independence?", options: ["1945", "1946", "1947", "1948"], correctAnswer: 2, points: 150, difficulty: "medium" },
  { id: 25, category: "history", question: "Who discovered America in 1492?", options: ["Magellan", "Columbus", "Vespucci", "Drake"], correctAnswer: 1, points: 100, difficulty: "easy" },
  { id: 26, category: "history", question: "The Great Wall is in which country?", options: ["Japan", "Korea", "China", "Mongolia"], correctAnswer: 2, points: 100, difficulty: "easy" },
  { id: 27, category: "history", question: "Who was known as Mahatma Gandhi?", options: ["Nehru", "M.K. Gandhi", "Patel", "Bose"], correctAnswer: 1, points: 100, difficulty: "easy" },
  { id: 28, category: "history", question: "The Titanic sank in which year?", options: ["1910", "1911", "1912", "1913"], correctAnswer: 2, points: 200, difficulty: "hard" },
  { id: 29, category: "history", question: "Who invented the telephone?", options: ["Edison", "Tesla", "Bell", "Marconi"], correctAnswer: 2, points: 150, difficulty: "medium" },
  { id: 30, category: "history", question: "The Renaissance began in which country?", options: ["France", "Italy", "Germany", "Spain"], correctAnswer: 1, points: 200, difficulty: "hard" },
];

const geographyQuestions: Question[] = [
  { id: 31, category: "geography", question: "What is the largest ocean?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], correctAnswer: 2, points: 100, difficulty: "easy" },
  { id: 32, category: "geography", question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correctAnswer: 2, points: 100, difficulty: "easy" },
  { id: 33, category: "geography", question: "Which is the longest river?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correctAnswer: 1, points: 150, difficulty: "medium" },
  { id: 34, category: "geography", question: "Mount Everest is in which range?", options: ["Alps", "Andes", "Rockies", "Himalayas"], correctAnswer: 3, points: 100, difficulty: "easy" },
  { id: 35, category: "geography", question: "What is the smallest country?", options: ["Monaco", "Vatican", "Malta", "San Marino"], correctAnswer: 1, points: 200, difficulty: "hard" },
  { id: 36, category: "geography", question: "Which continent has the most countries?", options: ["Asia", "Europe", "Africa", "America"], correctAnswer: 2, points: 200, difficulty: "medium" },
  { id: 37, category: "geography", question: "The Sahara Desert is in which continent?", options: ["Asia", "Australia", "Africa", "America"], correctAnswer: 2, points: 100, difficulty: "easy" },
  { id: 38, category: "geography", question: "Tokyo is the capital of which country?", options: ["China", "Korea", "Japan", "Thailand"], correctAnswer: 2, points: 100, difficulty: "easy" },
  { id: 39, category: "geography", question: "Which country has the most population?", options: ["India", "USA", "China", "Brazil"], correctAnswer: 2, points: 150, difficulty: "medium" },
  { id: 40, category: "geography", question: "The Amazon rainforest is mainly in?", options: ["Africa", "Asia", "Brazil", "Australia"], correctAnswer: 2, points: 150, difficulty: "medium" },
];

const generalQuestions: Question[] = [
  { id: 41, category: "general", question: "How many colors are in a rainbow?", options: ["5", "6", "7", "8"], correctAnswer: 2, points: 100, difficulty: "easy" },
  { id: 42, category: "general", question: "What is the fastest land animal?", options: ["Lion", "Cheetah", "Leopard", "Tiger"], correctAnswer: 1, points: 100, difficulty: "easy" },
  { id: 43, category: "general", question: "How many days are in a leap year?", options: ["364", "365", "366", "367"], correctAnswer: 2, points: 100, difficulty: "easy" },
  { id: 44, category: "general", question: "What is the largest mammal?", options: ["Elephant", "Blue Whale", "Giraffe", "Hippo"], correctAnswer: 1, points: 100, difficulty: "easy" },
  { id: 45, category: "general", question: "How many strings does a guitar have?", options: ["4", "5", "6", "7"], correctAnswer: 2, points: 100, difficulty: "easy" },
  { id: 46, category: "general", question: "What sport uses a shuttlecock?", options: ["Tennis", "Badminton", "Squash", "Cricket"], correctAnswer: 1, points: 100, difficulty: "easy" },
  { id: 47, category: "general", question: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], correctAnswer: 1, points: 100, difficulty: "easy" },
  { id: 48, category: "general", question: "What is the currency of Japan?", options: ["Yuan", "Won", "Yen", "Dollar"], correctAnswer: 2, points: 150, difficulty: "medium" },
  { id: 49, category: "general", question: "Who wrote Romeo and Juliet?", options: ["Dickens", "Shakespeare", "Austen", "Twain"], correctAnswer: 1, points: 150, difficulty: "medium" },
  { id: 50, category: "general", question: "What color is an emerald?", options: ["Red", "Blue", "Green", "Yellow"], correctAnswer: 2, points: 100, difficulty: "easy" },
];

const allQuestions = [...mathQuestions, ...scienceQuestions, ...historyQuestions, ...geographyQuestions, ...generalQuestions];

const categoryIcons: Record<QuestionCategory, any> = {
  math: Calculator,
  science: Brain,
  history: BookOpen,
  geography: Globe,
  general: Lightbulb
};

const categoryColors: Record<QuestionCategory, string> = {
  math: "from-blue-500 to-blue-700",
  science: "from-green-500 to-green-700",
  history: "from-amber-500 to-amber-700",
  geography: "from-cyan-500 to-cyan-700",
  general: "from-purple-500 to-purple-700"
};

export default function EducationalAdventures({ level, onComplete, onGameOver, soundEnabled, isPaused: externalPaused }: GameProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1200);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | "all">("all");
  const [showCategorySelect, setShowCategorySelect] = useState(true);
  const [lives, setLives] = useState(10);
  const [countdown, setCountdown] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [powerUps, setPowerUps] = useState({ fiftyFifty: 3, extraTime: 3, skip: 3 });
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !gameStarted) {
      setGameStarted(true);
    }
  }, [countdown, gameStarted]);

  const playGameSound = (type: "correct" | "wrong" | "tick" | "levelup" | "powerup") => {
    if (!soundEnabled) return;
    const sounds: Record<string, string> = {
      correct: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
      wrong: "https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3",
      tick: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
      levelup: "https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3",
      powerup: "https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3"
    };
    const audio = new Audio(sounds[type]);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const getNextQuestion = useCallback(() => {
    let availableQuestions = selectedCategory === "all" 
      ? allQuestions.filter(q => !usedQuestions.has(q.id))
      : allQuestions.filter(q => q.category === selectedCategory && !usedQuestions.has(q.id));
    
    if (availableQuestions.length === 0) {
      setUsedQuestions(new Set());
      availableQuestions = selectedCategory === "all" ? allQuestions : allQuestions.filter(q => q.category === selectedCategory);
    }

    const difficultyWeight = Math.min(level, 10);
    let filteredQuestions = availableQuestions;
    
    if (difficultyWeight <= 3) {
      filteredQuestions = availableQuestions.filter(q => q.difficulty === "easy" || q.difficulty === "medium");
    } else if (difficultyWeight <= 6) {
      filteredQuestions = availableQuestions.filter(q => q.difficulty === "medium" || q.difficulty === "hard");
    }
    
    if (filteredQuestions.length === 0) filteredQuestions = availableQuestions;
    
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    return filteredQuestions[randomIndex];
  }, [selectedCategory, usedQuestions, level]);

  useEffect(() => {
    if (gameStarted && !showCategorySelect && !currentQuestion) {
      const nextQ = getNextQuestion();
      setCurrentQuestion(nextQ);
      setQuestionTimeLeft(30 + level * 2);
      setEliminatedOptions(new Set());
    }
  }, [gameStarted, showCategorySelect, currentQuestion, getNextQuestion, level]);

  useEffect(() => {
    if (!gameStarted || isPaused || externalPaused || showCategorySelect || showResult) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onGameOver();
          return 0;
        }
        return prev - 1;
      });
      
      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        if (prev <= 5) {
          playGameSound("tick");
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, isPaused, externalPaused, showCategorySelect, showResult, onGameOver]);

  const handleTimeout = () => {
    setSelectedAnswer(-1);
    setIsCorrect(false);
    setShowResult(true);
    setStreak(0);
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setTimeout(() => onGameOver(), 1500);
      }
      return newLives;
    });
    playGameSound("wrong");
    
    setTimeout(() => {
      if (lives > 1) {
        nextQuestion();
      }
    }, 2000);
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || showResult) return;
    
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQuestion?.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    setQuestionsAnswered(prev => prev + 1);
    
    if (correct) {
      const streakBonus = streak >= 5 ? 2 : streak >= 3 ? 1.5 : 1;
      const timeBonus = questionTimeLeft > 20 ? 1.5 : questionTimeLeft > 10 ? 1.2 : 1;
      const points = Math.round((currentQuestion?.points || 100) * streakBonus * timeBonus);
      
      setTotalPoints(prev => prev + points);
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        return newStreak;
      });
      playGameSound("correct");
      
      if (usedQuestions.has(currentQuestion?.id || 0)) {
        setUsedQuestions(prev => new Set([...prev, currentQuestion?.id || 0]));
      }
      
      if (correctAnswers > 0 && (correctAnswers + 1) % 10 === 0) {
        playGameSound("levelup");
        onComplete(totalPoints + points);
      }
    } else {
      setStreak(0);
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(() => onGameOver(), 1500);
        }
        return newLives;
      });
      playGameSound("wrong");
    }
    
    setTimeout(() => {
      if (lives > 0 || correct) {
        nextQuestion();
      }
    }, 2000);
  };

  const nextQuestion = () => {
    setUsedQuestions(prev => new Set([...prev, currentQuestion?.id || 0]));
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setEliminatedOptions(new Set());
  };

  const useFiftyFifty = () => {
    if (powerUps.fiftyFifty <= 0 || !currentQuestion || eliminatedOptions.size > 0) return;
    
    const wrongAnswers = [0, 1, 2, 3].filter(i => i !== currentQuestion.correctAnswer);
    const toEliminate = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminatedOptions(new Set(toEliminate));
    setPowerUps(prev => ({ ...prev, fiftyFifty: prev.fiftyFifty - 1 }));
    playGameSound("powerup");
  };

  const useExtraTime = () => {
    if (powerUps.extraTime <= 0) return;
    setQuestionTimeLeft(prev => prev + 15);
    setPowerUps(prev => ({ ...prev, extraTime: prev.extraTime - 1 }));
    playGameSound("powerup");
  };

  const useSkip = () => {
    if (powerUps.skip <= 0 || !currentQuestion) return;
    setPowerUps(prev => ({ ...prev, skip: prev.skip - 1 }));
    playGameSound("powerup");
    nextQuestion();
  };

  const startWithCategory = (category: QuestionCategory | "all") => {
    setSelectedCategory(category);
    setShowCategorySelect(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameStarted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-blue-900">
        <AnimatePresence>
          {countdown > 0 ? (
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="text-9xl font-black text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]"
            >
              {countdown}
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-7xl font-black text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]"
            >
              GO!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (showCategorySelect) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-black to-blue-900 p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Brain className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">Choose Your Adventure</h2>
          <p className="text-white/60 text-lg">Select a category or play all topics</p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => startWithCategory("all")}
            className="p-8 rounded-3xl bg-gradient-to-br from-yellow-500 to-orange-600 text-black font-black text-xl uppercase flex flex-col items-center gap-4 shadow-2xl"
          >
            <Sparkles className="w-12 h-12" />
            All Topics
          </motion.button>
          
          {(["math", "science", "history", "geography", "general"] as QuestionCategory[]).map((cat) => {
            const Icon = categoryIcons[cat];
            return (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startWithCategory(cat)}
                className={`p-8 rounded-3xl bg-gradient-to-br ${categoryColors[cat]} text-white font-black text-xl uppercase flex flex-col items-center gap-4 shadow-2xl`}
              >
                <Icon className="w-12 h-12" />
                {cat}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  const CategoryIcon = currentQuestion ? categoryIcons[currentQuestion.category] : Brain;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-purple-900 via-black to-blue-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="flex justify-between items-center p-6 bg-black/40 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-2xl font-black text-yellow-500">{totalPoints}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-black text-orange-500">x{streak}</span>
          </div>
          <div className="flex gap-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full ${i < lives ? 'bg-red-500' : 'bg-gray-700'}`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`text-2xl font-black ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-white/60 text-sm uppercase tracking-widest">
            Q: {questionsAnswered} | ✓: {correctAnswers}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className={`flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r ${categoryColors[currentQuestion.category]}`}>
                <CategoryIcon className="w-6 h-6 text-white" />
                <span className="text-white font-black uppercase tracking-wider">{currentQuestion.category}</span>
              </div>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center font-black text-3xl ${
                questionTimeLeft <= 5 ? 'bg-red-500 animate-pulse' : questionTimeLeft <= 10 ? 'bg-orange-500' : 'bg-green-500'
              }`}>
                {questionTimeLeft}
              </div>
            </div>

            <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-10 border-2 border-white/10 mb-8">
              <h3 className="text-3xl md:text-4xl font-black text-white text-center leading-relaxed">
                {currentQuestion.question}
              </h3>
              <div className="mt-4 flex justify-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  currentQuestion.difficulty === "easy" ? "bg-green-500/20 text-green-400" :
                  currentQuestion.difficulty === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                }`}>
                  {currentQuestion.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-yellow-500/20 text-yellow-400">
                  +{currentQuestion.points} pts
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {currentQuestion.options.map((option, index) => {
                const isEliminated = eliminatedOptions.has(index);
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === currentQuestion.correctAnswer;
                
                let buttonClass = "bg-white/10 hover:bg-white/20 border-white/20 text-white";
                
                if (showResult) {
                  if (isCorrectAnswer) {
                    buttonClass = "bg-green-500 border-green-400 text-white";
                  } else if (isSelected && !isCorrect) {
                    buttonClass = "bg-red-500 border-red-400 text-white";
                  }
                } else if (isSelected) {
                  buttonClass = "bg-yellow-500 border-yellow-400 text-black";
                }
                
                if (isEliminated) {
                  buttonClass = "bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed";
                }
                
                return (
                  <motion.button
                    key={index}
                    whileHover={!isEliminated && !showResult ? { scale: 1.02 } : {}}
                    whileTap={!isEliminated && !showResult ? { scale: 0.98 } : {}}
                    onClick={() => !isEliminated && !showResult && handleAnswer(index)}
                    disabled={isEliminated || showResult}
                    className={`p-6 rounded-2xl border-2 font-black text-xl transition-all ${buttonClass}`}
                  >
                    <span className="mr-3 text-white/60">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={useFiftyFifty}
                disabled={powerUps.fiftyFifty <= 0 || eliminatedOptions.size > 0}
                className="bg-purple-600 hover:bg-purple-700 text-white font-black px-6 py-3 rounded-xl disabled:opacity-30"
              >
                50:50 ({powerUps.fiftyFifty})
              </Button>
              <Button
                onClick={useExtraTime}
                disabled={powerUps.extraTime <= 0}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl disabled:opacity-30"
              >
                +15s ({powerUps.extraTime})
              </Button>
              <Button
                onClick={useSkip}
                disabled={powerUps.skip <= 0}
                className="bg-orange-600 hover:bg-orange-700 text-white font-black px-6 py-3 rounded-xl disabled:opacity-30"
              >
                Skip ({powerUps.skip})
              </Button>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
            >
              <div className={`p-12 rounded-[3rem] ${isCorrect ? 'bg-green-600' : 'bg-red-600'} text-white text-center`}>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-8xl mb-4"
                >
                  {isCorrect ? '✓' : '✗'}
                </motion.div>
                <h3 className="text-4xl font-black uppercase mb-2">
                  {isCorrect ? 'Correct!' : 'Wrong!'}
                </h3>
                {isCorrect && streak >= 3 && (
                  <p className="text-xl font-bold animate-pulse">
                    🔥 {streak} Streak Bonus!
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(isPaused || externalPaused) && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90">
          <Pause className="w-24 h-24 text-yellow-500 mb-6" />
          <span className="text-5xl font-black text-white uppercase">Paused</span>
          <span className="text-white/60 mt-4">Press ESC or click to resume</span>
        </div>
      )}
    </div>
  );
}
