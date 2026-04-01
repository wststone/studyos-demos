import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Heart,
  Shield,
  RotateCcw,
  Zap,
  Trophy,
  Skull,
} from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface BossQuestion {
  id: number;
  type: "math" | "vocab" | "truefalse";
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: number; // 1-5
  damage: number;
}

const QUESTIONS: BossQuestion[] = [
  { id: 1, type: "math", question: "15 + 27 = ?", options: ["41", "42", "43", "44"], correctIndex: 1, difficulty: 1, damage: 15 },
  { id: 2, type: "vocab", question: '"Brave" 的中文意思是？', options: ["聪明的", "勇敢的", "善良的", "快速的"], correctIndex: 1, difficulty: 2, damage: 20 },
  { id: 3, type: "truefalse", question: "地球是太阳系中最大的行星。", options: ["正确", "错误"], correctIndex: 1, difficulty: 2, damage: 20 },
  { id: 4, type: "math", question: "144 / 12 + 7 = ?", options: ["17", "18", "19", "20"], correctIndex: 2, difficulty: 3, damage: 25 },
  { id: 5, type: "vocab", question: '"Serendipity" 的中文意思是？', options: ["悲伤", "意外的美好发现", "勤奋", "孤独"], correctIndex: 1, difficulty: 5, damage: 30 },
];

const BOSS_MAX_HP = 100;
const PLAYER_MAX_HP = 100;
const BOSS_DAMAGE = 25;

type GameState = "idle" | "playing" | "won" | "lost";

interface FloatingNumber {
  id: number;
  value: string;
  x: number;
  color: string;
}

export function BossChallenge() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bossHp, setBossHp] = useState(BOSS_MAX_HP);
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [feedback, setFeedback] = useState<"hit" | "hurt" | null>(null);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [floatingNums, setFloatingNums] = useState<FloatingNumber[]>([]);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const question = QUESTIONS[currentIndex];

  const addFloatingNum = useCallback((value: string, color: string, side: "boss" | "player") => {
    const id = Date.now() + Math.random();
    const x = side === "boss" ? 30 + Math.random() * 40 : 60 + Math.random() * 30;
    setFloatingNums((prev) => [...prev, { id, value, x, color }]);
    setTimeout(() => {
      setFloatingNums((prev) => prev.filter((n) => n.id !== id));
    }, 1200);
  }, []);

  function startGame() {
    setGameState("playing");
    setCurrentIndex(0);
    setBossHp(BOSS_MAX_HP);
    setPlayerHp(PLAYER_MAX_HP);
    setFeedback(null);
    setShakeScreen(false);
    setFloatingNums([]);
    setAnswered(false);
    setSelectedOption(null);
  }

  function handleAnswer(optionIndex: number) {
    if (answered || gameState !== "playing") return;
    setAnswered(true);
    setSelectedOption(optionIndex);

    const isCorrect = optionIndex === question.correctIndex;

    if (isCorrect) {
      // Deal damage to boss
      const dmg = question.damage;
      setFeedback("hit");
      addFloatingNum(`-${dmg}`, "text-success", "boss");

      const newBossHp = Math.max(0, bossHp - dmg);
      setBossHp(newBossHp);

      setTimeout(() => {
        setFeedback(null);
        if (newBossHp <= 0) {
          setGameState("won");
        } else {
          advanceQuestion();
        }
      }, 1000);
    } else {
      // Boss attacks player
      setFeedback("hurt");
      setShakeScreen(true);
      addFloatingNum(`-${BOSS_DAMAGE}`, "text-error", "player");

      const newPlayerHp = Math.max(0, playerHp - BOSS_DAMAGE);
      setPlayerHp(newPlayerHp);

      setTimeout(() => {
        setShakeScreen(false);
        setFeedback(null);
        if (newPlayerHp <= 0) {
          setGameState("lost");
        } else {
          advanceQuestion();
        }
      }, 1000);
    }
  }

  function advanceQuestion() {
    if (currentIndex + 1 >= QUESTIONS.length) {
      // All questions answered, boss survived
      setGameState(bossHp <= 0 ? "won" : "lost");
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswered(false);
      setSelectedOption(null);
    }
  }

  const bossHpPercent = (bossHp / BOSS_MAX_HP) * 100;
  const playerHpPercent = (playerHp / PLAYER_MAX_HP) * 100;

  function hpBarColor(percent: number): string {
    if (percent > 60) return "bg-success";
    if (percent > 30) return "bg-warning";
    return "bg-error";
  }

  const difficultyStars = (d: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Zap
        key={i}
        className={`h-3 w-3 ${i < d ? "text-warning" : "text-border"}`}
      />
    ));

  return (
    <DemoShell
      title="Boss 挑战"
      description="回答问题击败Boss！小心，答错会被反击！"
      tags={["挑战", "Boss战", "综合题"]}
    >
      {gameState === "idle" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-12 space-y-5"
        >
          <motion.span
            className="text-7xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🐉
          </motion.span>
          <h2 className="text-2xl font-bold">Boss 挑战</h2>
          <p className="text-text-muted text-center max-w-sm">
            回答 {QUESTIONS.length} 道题目击败巨龙！每答对一题造成伤害，答错则被反击。你能挑战成功吗？
          </p>
          <button type="button" className="demo-btn text-lg px-8 py-3 inline-flex items-center gap-2" onClick={startGame}>
            <Swords className="h-5 w-5" />
            开始战斗
          </button>
        </motion.div>
      )}

      {gameState === "playing" && (
        <motion.div
          animate={shakeScreen ? { x: [0, -6, 6, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="space-y-5"
        >
          {/* Boss area */}
          <div className="relative rounded-xl border border-border bg-surface-alt p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <motion.span
                  className="text-4xl"
                  animate={
                    feedback === "hit"
                      ? { x: [0, 5, -5, 5, 0], opacity: [1, 0.5, 1] }
                      : feedback === "hurt"
                        ? { scale: [1, 1.15, 1] }
                        : { y: [0, -3, 0] }
                  }
                  transition={
                    feedback ? { duration: 0.4 } : { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                  }
                >
                  🐉
                </motion.span>
                <div>
                  <p className="font-bold text-sm">远古巨龙</p>
                  <div className="flex">{difficultyStars(3)}</div>
                </div>
              </div>
              <span className="text-sm text-text-muted font-mono">{bossHp}/{BOSS_MAX_HP}</span>
            </div>
            <div className="h-3 rounded-full bg-surface overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${hpBarColor(bossHpPercent)}`}
                animate={{ width: `${bossHpPercent}%` }}
                transition={{ type: "spring", stiffness: 120 }}
              />
            </div>

            {/* Floating damage numbers */}
            <AnimatePresence>
              {floatingNums
                .filter((n) => n.x < 50)
                .map((n) => (
                  <motion.span
                    key={n.id}
                    initial={{ opacity: 1, y: 0, x: `${n.x}%` }}
                    animate={{ opacity: 0, y: -50 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className={`absolute text-xl font-bold ${n.color}`}
                    style={{ top: "20%", left: `${n.x}%` }}
                  >
                    {n.value}
                  </motion.span>
                ))}
            </AnimatePresence>
          </div>

          {/* Player HP */}
          <div className="flex items-center gap-3 px-1">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary-light" />
              <span className="text-sm font-medium">勇者</span>
            </div>
            <div className="flex-1 h-2.5 rounded-full bg-surface-alt overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${hpBarColor(playerHpPercent)}`}
                animate={{ width: `${playerHpPercent}%` }}
                transition={{ type: "spring", stiffness: 120 }}
              />
            </div>
            <span className="text-xs text-text-muted font-mono">{playerHp}/{PLAYER_MAX_HP}</span>

            {/* Floating damage for player */}
            <AnimatePresence>
              {floatingNums
                .filter((n) => n.x >= 50)
                .map((n) => (
                  <motion.span
                    key={n.id}
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -30 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className={`absolute text-lg font-bold ${n.color}`}
                    style={{ right: "10%" }}
                  >
                    {n.value}
                  </motion.span>
                ))}
            </AnimatePresence>
          </div>

          {/* Question area */}
          <div className="rounded-xl border border-border bg-surface-alt p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-muted">
                问题 {currentIndex + 1}/{QUESTIONS.length}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-text-muted mr-1">难度</span>
                {difficultyStars(question.difficulty)}
              </div>
            </div>

            <p className="text-lg font-semibold mb-4">{question.question}</p>

            <div className={`grid gap-2 ${question.options.length === 2 ? "grid-cols-2" : "grid-cols-2"}`}>
              {question.options.map((opt, idx) => {
                const isCorrect = idx === question.correctIndex;
                const isSelected = selectedOption === idx;
                let optClass = "border-border bg-surface hover:bg-surface-hover";
                if (answered) {
                  if (isCorrect) optClass = "border-success bg-success/20 text-success";
                  else if (isSelected && !isCorrect) optClass = "border-error bg-error/20 text-error";
                  else optClass = "border-border bg-surface opacity-50";
                }
                return (
                  <motion.button
                    key={idx}
                    type="button"
                    whileHover={!answered ? { scale: 1.02 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(idx)}
                    disabled={answered}
                    className={`rounded-lg border p-3 text-sm font-medium transition-colors ${optClass}`}
                  >
                    {opt}
                  </motion.button>
                );
              })}
            </div>

            {answered && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-3 text-sm font-medium ${
                  selectedOption === question.correctIndex ? "text-success" : "text-error"
                }`}
              >
                {selectedOption === question.correctIndex
                  ? `命中！造成 ${question.damage} 点伤害！`
                  : `被反击！受到 ${BOSS_DAMAGE} 点伤害！`}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}

      {/* Win state */}
      {gameState === "won" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-10 space-y-5"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Trophy className="h-16 w-16 text-warning" />
          </motion.div>
          <h2 className="text-2xl font-bold">胜利！</h2>
          <p className="text-text-muted">你成功击败了远古巨龙！</p>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <Heart className="h-5 w-5 text-success mx-auto mb-1" />
              <p className="font-bold">{playerHp} HP</p>
              <p className="text-text-muted text-xs">剩余生命</p>
            </div>
            <div className="text-center">
              <Swords className="h-5 w-5 text-primary-light mx-auto mb-1" />
              <p className="font-bold">{QUESTIONS.length}</p>
              <p className="text-text-muted text-xs">题目</p>
            </div>
          </div>
          <button type="button" className="demo-btn inline-flex items-center gap-2" onClick={startGame}>
            <RotateCcw className="h-4 w-4" />
            再战一次
          </button>
        </motion.div>
      )}

      {/* Lose state */}
      {gameState === "lost" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-10 space-y-5"
        >
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Skull className="h-16 w-16 text-error" />
          </motion.div>
          <h2 className="text-2xl font-bold">挑战失败</h2>
          <p className="text-text-muted">巨龙还剩 {bossHp} HP，再试一次吧！</p>
          <div className="h-2 w-40 rounded-full bg-surface-alt overflow-hidden">
            <div
              className={`h-full rounded-full ${hpBarColor(bossHpPercent)}`}
              style={{ width: `${bossHpPercent}%` }}
            />
          </div>
          <button type="button" className="demo-btn inline-flex items-center gap-2" onClick={startGame}>
            <RotateCcw className="h-4 w-4" />
            重新挑战
          </button>
        </motion.div>
      )}
    </DemoShell>
  );
}
