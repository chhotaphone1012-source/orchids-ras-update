"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Star, Trophy, Zap, Heart, Calculator, BookOpen, Globe, Lightbulb, CheckCircle, XCircle, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameProps {
  level: number;
  onComplete: (points: number) => void;
  onGameOver: () => void;
  soundEnabled: boolean;
  isPaused?: boolean;
}

interface Question {
  id: number;
  type: "math" | "word" | "logic" | "science" | "history";
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  timeLimit: number;
  hint?: string;
  explanation?: string;
}

const generateMathQuestion = (difficulty: number): Question => {
  const operators = ["+", "-", "*"];
  const op = operators[Math.floor(Math.random() * Math.min(difficulty + 1, 3))];
  let a: number, b: number, answer: number;
  
  switch (op) {
    case "+":
      a = Math.floor(Math.random() * (10 * difficulty)) + 1;
      b = Math.floor(Math.random() * (10 * difficulty)) + 1;
      answer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * (10 * difficulty)) + 10;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
      break;
    case "*":
      a = Math.floor(Math.random() * (5 * difficulty)) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a * b;
      break;
    default:
      a = 5; b = 3; answer = 8;
  }
  
  const wrongAnswers = [
    answer + Math.floor(Math.random() * 5) + 1,
    answer - Math.floor(Math.random() * 5) - 1,
    answer + Math.floor(Math.random() * 10) - 5
  ].filter(x => x !== answer && x > 0);
  
  const options = [answer.toString(), ...wrongAnswers.slice(0, 3).map(x => x.toString())];
  const shuffled = options.sort(() => Math.random() - 0.5);
  
  return {
    id: Date.now(),
    type: "math",
    question: `What is ${a} ${op} ${b}?`,
    options: shuffled,
    correctAnswer: shuffled.indexOf(answer.toString()),
    points: 100 + difficulty * 20,
    timeLimit: Math.max(30 - difficulty * 2, 10),
    hint: op === "*" ? "Think of groups!" : "Count carefully!",
    explanation: `${a} ${op} ${b} = ${answer}`
  };
};

const wordQuestions: Question[] = [
  { id: 1, type: "word", question: "What is the opposite of 'Happy'?", options: ["Sad", "Angry", "Tired", "Hungry"], correctAnswer: 0, points: 80, timeLimit: 20, hint: "Think about feelings" },
  { id: 2, type: "word", question: "Which word means 'very big'?", options: ["Tiny", "Huge", "Small", "Little"], correctAnswer: 1, points: 80, timeLimit: 20 },
  { id: 3, type: "word", question: "Complete: The cat ___ on the mat.", options: ["sat", "swim", "fly", "run"], correctAnswer: 0, points: 80, timeLimit: 20 },
  { id: 4, type: "word", question: "What rhymes with 'cat'?", options: ["Dog", "Bat", "Bird", "Fish"], correctAnswer: 1, points: 80, timeLimit: 20 },
  { id: 5, type: "word", question: "Which is a verb?", options: ["Happy", "Run", "Blue", "Table"], correctAnswer: 1, points: 100, timeLimit: 25 },
  { id: 6, type: "word", question: "Spell the color of grass:", options: ["Grean", "Green", "Gren", "Grien"], correctAnswer: 1, points: 80, timeLimit: 20 },
  { id: 7, type: "word", question: "What's the plural of 'child'?", options: ["Childs", "Childes", "Children", "Child"], correctAnswer: 2, points: 100, timeLimit: 25 },
  { id: 8, type: "word", question: "Which word is a noun?", options: ["Quickly", "Beautiful", "Mountain", "Run"], correctAnswer: 2, points: 100, timeLimit: 25 },
];

const scienceQuestions: Question[] = [
  { id: 1, type: "science", question: "What planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correctAnswer: 1, points: 120, timeLimit: 25 },
  { id: 2, type: "science", question: "How many legs does a spider have?", options: ["6", "8", "10", "4"], correctAnswer: 1, points: 100, timeLimit: 20 },
  { id: 3, type: "science", question: "What do plants need to make food?", options: ["Darkness", "Sunlight", "Ice", "Wind"], correctAnswer: 1, points: 100, timeLimit: 20 },
  { id: 4, type: "science", question: "What is H2O commonly known as?", options: ["Air", "Fire", "Water", "Earth"], correctAnswer: 2, points: 100, timeLimit: 20 },
  { id: 5, type: "science", question: "Which animal is a mammal?", options: ["Snake", "Fish", "Dolphin", "Lizard"], correctAnswer: 2, points: 120, timeLimit: 25 },
  { id: 6, type: "science", question: "What is the closest star to Earth?", options: ["Moon", "Sun", "Mars", "Venus"], correctAnswer: 1, points: 100, timeLimit: 20 },
  { id: 7, type: "science", question: "What gas do humans breathe in?", options: ["Carbon Dioxide", "Nitrogen", "Oxygen", "Helium"], correctAnswer: 2, points: 120, timeLimit: 25 },
  { id: 8, type: "science", question: "What is the largest organ in the human body?", options: ["Heart", "Brain", "Skin", "Liver"], correctAnswer: 2, points: 150, timeLimit: 30 },
];

const historyQuestions: Question[] = [
  { id: 1, type: "history", question: "Who was the first President of the United States?", options: ["Lincoln", "Washington", "Jefferson", "Adams"], correctAnswer: 1, points: 120, timeLimit: 25 },
  { id: 2, type: "history", question: "Which ancient civilization built the pyramids?", options: ["Romans", "Greeks", "Egyptians", "Mayans"], correctAnswer: 2, points: 120, timeLimit: 25 },
  { id: 3, type: "history", question: "In which year did World War II end?", options: ["1943", "1944", "1945", "1946"], correctAnswer: 2, points: 150, timeLimit: 30 },
  { id: 4, type: "history", question: "Who discovered America in 1492?", options: ["Magellan", "Columbus", "Vespucci", "Drake"], correctAnswer: 1, points: 120, timeLimit: 25 },
  { id: 5, type: "history", question: "What was the name of the ship that sank in 1912?", options: ["Lusitania", "Olympic", "Titanic", "Britannic"], correctAnswer: 2, points: 100, timeLimit: 20 },
  { id: 6, type: "history", question: "Which country gifted the Statue of Liberty to the USA?", options: ["England", "France", "Germany", "Spain"], correctAnswer: 1, points: 120, timeLimit: 25 },
];

const logicQuestions: Question[] = [
  { id: 1, type: "logic", question: "What comes next: 2, 4, 6, 8, ?", options: ["9", "10", "11", "12"], correctAnswer: 1, points: 100, timeLimit: 25 },
  { id: 2, type: "logic", question: "If all Bloops are Razzles, and all Razzles are Lazzles, then all Bloops are:", options: ["Razzles", "Lazzles", "Both", "Neither"], correctAnswer: 2, points: 150, timeLimit: 30 },
  { id: 3, type: "logic", question: "Which shape has the most sides?", options: ["Triangle", "Square", "Pentagon", "Hexagon"], correctAnswer: 3, points: 100, timeLimit: 20 },
  { id: 4, type: "logic", question: "Complete the pattern: AB, CD, EF, ?", options: ["GH", "FG", "HI", "EG"], correctAnswer: 0, points: 100, timeLimit: 25 },
  { id: 5, type: "logic", question: "If yesterday was Monday, what day is tomorrow?", options: ["Tuesday", "Wednesday", "Thursday", "Friday"], correctAnswer: 1, points: 120, timeLimit: 25 },
  { id: 6, type: "logic", question: "Which number is odd?", options: ["12", "24", "35", "48"], correctAnswer: 2, points: 80, timeLimit: 15 },
];

const categoryIcons = {
  math: Calculator,
  word: BookOpen,
  science: Globe,
  history: Trophy,
  logic: Lightbulb
};

const categoryColors = {
  math: "from-blue-500 to-cyan-500",
  word: "from-purple-500 to-pink-500",
  science: "from-green-500 to-emerald-500",
  history: "from-amber-500 to-orange-500",
  logic: "from-rose-500 to-red-500"
};

export default function EduAdventure({ level, onComplete, onGameOver, soundEnabled, isPaused }: GameProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [category, setCategory] = useState<"math" | "word" | "science" | "history" | "logic">("math");
  const [showHint, setShowHint] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const categories: Array<"math" | "word" | "science" | "history" | "logic"> = ["math", "word", "science", "history", "logic"];

  const generateQuestion = useCallback(() => {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    setCategory(cat);
    
    let question: Question;
    
    switch (cat) {
      case "math":
        question = generateMathQuestion(level);
        break;
      case "word":
        question = wordQuestions[Math.floor(Math.random() * wordQuestions.length)];
        break;
      case "science":
        question = scienceQuestions[Math.floor(Math.random() * scienceQuestions.length)];
        break;
      case "history":
        question = historyQuestions[Math.floor(Math.random() * historyQuestions.length)];
        break;
      case "logic":
        question = logicQuestions[Math.floor(Math.random() * logicQuestions.length)];
        break;
      default:
        question = generateMathQuestion(level);
    }
    
    setCurrentQuestion({ ...question, id: Date.now() });
    setTimeLeft(question.timeLimit);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
  }, [level]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !gameStarted) {
      setGameStarted(true);
      generateQuestion();
    }
  }, [countdown, gameStarted, generateQuestion]);

  useEffect(() => {
    if (!gameStarted || isPaused || showResult || lives <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, isPaused, showResult, lives, currentQuestion]);

  const handleTimeout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowResult(true);
    setIsCorrect(false);
    setStreak(0);
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setTimeout(() => onGameOver(), 1500);
      }
      return newLives;
    });
    
    if (soundEnabled) {
      new Audio("https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3").play().catch(() => {});
    }
    
    setTimeout(() => {
      if (lives > 1) generateQuestion();
    }, 2000);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null || showResult || !currentQuestion) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAnswer(index);
    setShowResult(true);
    
    const correct = index === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      const streakBonus = streak * 10;
      const timeBonus = Math.floor(timeLeft * 2);
      const totalPoints = currentQuestion.points + streakBonus + timeBonus;
      
      setScore(prev => prev + totalPoints);
      setStreak(prev => prev + 1);
      setTotalCorrect(prev => prev + 1);
      setQuestionsAnswered(prev => prev + 1);
      
      if (soundEnabled) {
        new Audio("https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3").play().catch(() => {});
      }
      
      const questionsPerLevel = 5;
      if ((questionsAnswered + 1) % questionsPerLevel === 0) {
        setTimeout(() => {
          onComplete(500 + level * 100);
        }, 1500);
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
      
      if (soundEnabled) {
        new Audio("https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3").play().catch(() => {});
      }
    }
    
    setTimeout(() => {
      if (lives > (correct ? 0 : 1)) generateQuestion();
    }, 2000);
  };

  const CategoryIcon = currentQuestion ? categoryIcons[currentQuestion.type] : Brain;

  if (countdown > 0 || !gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 rounded-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="text-center"
          >
            <Brain className="w-32 h-32 text-purple-400 mx-auto mb-8 animate-pulse" />
            <h2 className="text-4xl font-black text-white uppercase tracking-widest mb-4">Educational Adventures</h2>
            <p className="text-purple-400 text-xl mb-8">Get Ready to Learn!</p>
            <span className="text-9xl font-black gold-text-gradient">{countdown === 0 ? "GO!" : countdown}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 p-8 rounded-3xl relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-4xl flex justify-between items-center mb-8 px-4 relative z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`w-8 h-8 transition-all ${i < lives ? "text-red-500 fill-red-500" : "text-gray-700"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-black">{streak}x Streak</span>
          </div>
        </div>

        <div className="text-center">
          <span className="text-6xl font-black gold-text-gradient tabular-nums">{score}</span>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Points</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-black">{totalCorrect} Correct</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${timeLeft <= 5 ? "bg-red-500/20 animate-pulse" : "bg-white/5"}`}>
            <Timer className={`w-6 h-6 ${timeLeft <= 5 ? "text-red-400" : "text-white/60"}`} />
            <span className={`text-2xl font-black tabular-nums ${timeLeft <= 5 ? "text-red-400" : "text-white"}`}>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {currentQuestion && (
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl relative z-10"
        >
          <div className={`bg-gradient-to-r ${categoryColors[currentQuestion.type]} p-1 rounded-3xl mb-6`}>
            <div className="bg-black/80 backdrop-blur-xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${categoryColors[currentQuestion.type]}`}>
                    <CategoryIcon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-white/60 uppercase tracking-widest text-sm font-bold">
                    {currentQuestion.type} Challenge
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-black">{currentQuestion.points} pts</span>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-white text-center leading-tight">
                {currentQuestion.question}
              </h2>

              {currentQuestion.hint && !showResult && (
                <div className="mt-4 text-center">
                  {showHint ? (
                    <p className="text-purple-400 italic">💡 {currentQuestion.hint}</p>
                  ) : (
                    <button
                      onClick={() => setShowHint(true)}
                      className="text-purple-400/60 hover:text-purple-400 text-sm underline"
                    >
                      Need a hint?
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                whileHover={!showResult ? { scale: 1.02 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
                className={`p-6 rounded-2xl font-black text-xl transition-all relative overflow-hidden ${
                  showResult
                    ? index === currentQuestion.correctAnswer
                      ? "bg-green-500 text-white"
                      : selectedAnswer === index
                      ? "bg-red-500 text-white"
                      : "bg-white/5 text-white/40"
                    : "bg-white/5 hover:bg-white/10 text-white border-2 border-white/10 hover:border-purple-500/50"
                }`}
              >
                <span className="absolute top-3 left-3 text-sm opacity-50">{String.fromCharCode(65 + index)}</span>
                {option}
                {showResult && index === currentQuestion.correctAnswer && (
                  <CheckCircle className="absolute top-3 right-3 w-6 h-6" />
                )}
                {showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                  <XCircle className="absolute top-3 right-3 w-6 h-6" />
                )}
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-6 p-4 rounded-xl text-center ${isCorrect ? "bg-green-500/20" : "bg-red-500/20"}`}
              >
                <p className={`font-black text-xl ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                  {isCorrect ? "🎉 Excellent! Keep it up!" : "💪 Don't give up! Try the next one!"}
                </p>
                {currentQuestion.explanation && !isCorrect && (
                  <p className="text-white/60 mt-2">{currentQuestion.explanation}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-8 text-white/30 text-sm font-bold">
        <span>Level {level}</span>
        <span>•</span>
        <span>Questions: {questionsAnswered}</span>
        <span>•</span>
        <span>Accuracy: {questionsAnswered > 0 ? Math.round((totalCorrect / questionsAnswered) * 100) : 100}%</span>
      </div>
    </div>
  );
}
