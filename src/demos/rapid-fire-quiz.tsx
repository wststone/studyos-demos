import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  RotateCcw,
  Zap,
  Clock,
  Target,
  Trophy,
  CheckCircle,
} from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

const QUESTIONS: Question[] = [
  { id: 1, question: "12 x 8 = ?", options: ["86", "96", "106", "88"], correctIndex: 1 },
  { id: 2, question: '"Abandon" 的中文意思是？', options: ["接受", "放弃", "承认", "争论"], correctIndex: 1 },
  { id: 3, question: "256 / 16 = ?", options: ["14", "15", "16", "18"], correctIndex: 2 },
  { id: 4, question: '"Resilient" 的中文意思是？', options: ["脆弱的", "有弹性的", "沉默的", "勤劳的"], correctIndex: 1 },
  { id: 5, question: "√144 = ?", options: ["11", "12", "13", "14"], correctIndex: 1 },
  { id: 6, question: '"Ubiquitous" 的中文意思是？', options: ["独特的", "无处不在的", "古老的", "微小的"], correctIndex: 1 },
  { id: 7, question: "7 x 13 = ?", options: ["84", "91", "97", "89"], correctIndex: 1 },
  { id: 8, question: '"Ephemeral" 的中文意思是？', options: ["永恒的", "神圣的", "短暂的", "复杂的"], correctIndex: 2 },
  { id: 9, question: "1024 / 32 = ?", options: ["28", "30", "32", "34"], correctIndex: 2 },
  { id: 10, question: '"Pragmatic" 的中文意思是？', options: ["浪漫的", "悲观的", "理论的", "务实的"], correctIndex: 3 },
];

const TIMER_DURATION = 5000;

type GameState = "idle" | "playing" | "finished";

export function RapidFireQuiz() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [correct, setCorrect] = useState(0);
  const [timerStart, setTimerStart] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [answered, setAnswered] = useState(false);
  const gameStartRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = QUESTIONS[currentIndex];

  const nextQuestion = useCallback(() => {
    setFeedback(null);
    setAnswered(false);
    if (currentIndex + 1 >= QUESTIONS.length) {
      setTotalTime(Date.now() - gameStartRef.current);
      setGameState("finished");
    } else {
      setCurrentIndex((i) => i + 1);
      setTimerStart(Date.now());
      setTimeLeft(TIMER_DURATION);
    }
  }, [currentIndex]);

  // Timer tick
  useEffect(() => {
    if (gameState !== "playing" || answered) return;
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - timerStart;
      const remaining = Math.max(0, TIMER_DURATION - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setAnswered(true);
        setFeedback("wrong");
        setStreak(0);
        setMultiplier(1);
        setTimeout(nextQuestion, 800);
      }
    }, 50);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timerStart, answered, nextQuestion]);

  function startGame() {
    setGameState("playing");
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setMultiplier(1);
    setCorrect(0);
    setFeedback(null);
    setAnswered(false);
    setTimerStart(Date.now());
    setTimeLeft(TIMER_DURATION);
    gameStartRef.current = Date.now();
  }

  function handleAnswer(optionIndex: number) {
    if (answered || gameState !== "playing") return;
    setAnswered(true);

    const isCorrect = optionIndex === question.correctIndex;
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      const newStreak = streak + 1;
      const newMult = newStreak >= 5 ? 4 : newStreak >= 3 ? 2 : 1;
      const points = 100 * newMult;
      setScore((s) => s + points);
      setStreak(newStreak);
      setMultiplier(newMult);
      setCorrect((c) => c + 1);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      setStreak(0);
      setMultiplier(1);
    }

    setTimeout(nextQuestion, 800);
  }

  const timerPercent = (timeLeft / TIMER_DURATION) * 100;
  const timerColor = timerPercent > 50 ? "bg-success" : timerPercent > 25 ? "bg-warning" : "bg-error";

  return (
    <DemoShell
      title="极速问答"
      description="限时快答，连续答对获取连击加成！"
      tags={["测验", "限时", "连击"]}
    >
      {gameState === "idle" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-12 space-y-4"
        >
          <Zap className="h-16 w-16 text-warning" />
          <h2 className="text-2xl font-bold">准备好了吗？</h2>
          <p className="text-text-muted text-center max-w-sm">
            共 {QUESTIONS.length} 题，每题限时 {TIMER_DURATION / 1000} 秒。连续答对可获得连击加成！
          </p>
          <button type="button" className="demo-btn text-lg px-8 py-3" onClick={startGame}>
            开始挑战
          </button>
        </motion.div>
      )}

      {gameState === "playing" && (
        <div className="space-y-5">
          {/* Header: score, streak, progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-muted">
                {currentIndex + 1}/{QUESTIONS.length}
              </span>
              <span className="font-bold text-lg">{score} 分</span>
            </div>
            <div className="flex items-center gap-2">
              {streak >= 3 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className="flex items-center gap-1"
                >
                  <Flame className="h-5 w-5 text-error" />
                </motion.div>
              )}
              {streak > 0 && (
                <span className="font-bold text-warning">{streak}x 连击</span>
              )}
              {multiplier > 1 && (
                <span className="demo-tag">x{multiplier}</span>
              )}
            </div>
          </div>

          {/* Timer bar */}
          <div className="h-2 rounded-full bg-surface-alt overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${timerColor}`}
              style={{ width: `${timerPercent}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{
                opacity: 1,
                x: 0,
                ...(feedback === "wrong"
                  ? { x: [0, -8, 8, -8, 8, 0] }
                  : {}),
              }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className={`rounded-xl border p-6 transition-colors ${
                feedback === "correct"
                  ? "border-success/50 bg-success/5"
                  : feedback === "wrong"
                    ? "border-error/50 bg-error/5"
                    : "border-border bg-surface-alt"
              }`}
            >
              <p className="text-xl font-semibold text-center mb-6">{question.question}</p>
              <div className="grid grid-cols-2 gap-3">
                {question.options.map((opt, idx) => {
                  const isCorrectOpt = idx === question.correctIndex;
                  const showCorrect = answered && isCorrectOpt;
                  const showWrong = answered && !isCorrectOpt && feedback === "wrong";
                  return (
                    <motion.button
                      key={idx}
                      type="button"
                      whileHover={!answered ? { scale: 1.03 } : {}}
                      whileTap={!answered ? { scale: 0.97 } : {}}
                      onClick={() => handleAnswer(idx)}
                      disabled={answered}
                      className={`rounded-lg border p-3 text-sm font-medium transition-all ${
                        showCorrect
                          ? "border-success bg-success/20 text-success"
                          : showWrong
                            ? "border-border bg-surface-alt text-text-muted"
                            : "border-border bg-surface hover:bg-surface-hover"
                      }`}
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {gameState === "finished" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 py-4"
        >
          <div className="text-center space-y-2">
            <Trophy className="mx-auto h-14 w-14 text-warning" />
            <h2 className="text-2xl font-bold">挑战完成！</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Target, label: "总分", value: `${score}`, color: "text-primary-light" },
              { icon: Flame, label: "最佳连击", value: `${bestStreak}x`, color: "text-warning" },
              { icon: CheckCircle, label: "正确率", value: `${Math.round((correct / QUESTIONS.length) * 100)}%`, color: "text-success" },
              { icon: Clock, label: "总用时", value: `${(totalTime / 1000).toFixed(1)}s`, color: "text-text-muted" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-surface-alt p-4 text-center">
                <s.icon className={`mx-auto h-6 w-6 ${s.color} mb-2`} />
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Answer summary */}
          <div className="space-y-1">
            <p className="text-sm text-text-muted mb-2">答题详情</p>
            <div className="flex gap-1">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i < correct ? "bg-success" : "bg-error/50"}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              className="demo-btn inline-flex items-center gap-2 text-lg px-8 py-3"
              onClick={startGame}
            >
              <RotateCcw className="h-5 w-5" />
              再来一次
            </button>
          </div>
        </motion.div>
      )}
    </DemoShell>
  );
}
