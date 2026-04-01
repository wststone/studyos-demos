import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Clock, MousePointerClick, Trophy, Sparkles } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

const EMOJIS = ["🐶", "🐱", "🦊", "🐼", "🐸", "🍎", "🍒", "🌻"];

interface CardData {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createBoard(): CardData[] {
  const pairs = [...EMOJIS, ...EMOJIS];
  const shuffled = shuffleArray(pairs);
  return shuffled.map((emoji, i) => ({
    id: i,
    emoji,
    isFlipped: false,
    isMatched: false,
  }));
}

export function MemoryGrid() {
  const [cards, setCards] = useState<CardData[]>(createBoard);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [bestRecord, setBestRecord] = useState<{ moves: number; time: number } | null>(null);
  const [won, setWon] = useState(false);
  const lockRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const checkWin = useCallback(
    (pairs: number) => {
      if (pairs === EMOJIS.length) {
        setIsRunning(false);
        setWon(true);
        if (!bestRecord || moves + 1 < bestRecord.moves) {
          setBestRecord({ moves: moves + 1, time: timer });
        }
      }
    },
    [bestRecord, moves, timer],
  );

  function handleFlip(id: number) {
    if (lockRef.current) return;
    const card = cards[id];
    if (card.isFlipped || card.isMatched) return;

    if (!isRunning) setIsRunning(true);

    const newFlipped = [...flippedIds, id];
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c)),
    );
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      lockRef.current = true;
      const [firstId, secondId] = newFlipped;
      const first = cards[firstId];

      if (first.emoji === cards[secondId]?.emoji && firstId !== secondId) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true }
                : c,
            ),
          );
          setMatchedPairs((p) => {
            const next = p + 1;
            checkWin(next);
            return next;
          });
          setFlippedIds([]);
          lockRef.current = false;
        }, 400);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c,
            ),
          );
          setFlippedIds([]);
          lockRef.current = false;
        }, 1000);
      }
    }
  }

  function restart() {
    setCards(createBoard());
    setFlippedIds([]);
    setMoves(0);
    setMatchedPairs(0);
    setTimer(0);
    setIsRunning(false);
    setWon(false);
    lockRef.current = false;
  }

  function formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <DemoShell
      title="记忆翻牌"
      description="翻转卡片，找到所有配对！考验你的记忆力。"
      tags={["记忆", "配对", "游戏"]}
    >
      {/* Stats */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-sm">
            <MousePointerClick className="h-4 w-4 text-primary-light" />
            <span className="text-text-muted">步数:</span>
            <span className="font-bold">{moves}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="h-4 w-4 text-warning" />
            <span className="text-text-muted">时间:</span>
            <span className="font-bold font-mono">{formatTime(timer)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-success" />
            <span className="text-text-muted">配对:</span>
            <span className="font-bold">{matchedPairs}/{EMOJIS.length}</span>
          </div>
        </div>
        <button
          type="button"
          className="demo-btn-outline inline-flex items-center gap-1.5 text-sm py-1.5 px-3"
          onClick={restart}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          重新开始
        </button>
      </div>

      {/* Best record */}
      {bestRecord && (
        <div className="mb-4 flex items-center gap-2 text-xs text-text-muted">
          <Trophy className="h-3.5 w-3.5 text-warning" />
          最佳记录: {bestRecord.moves} 步 / {formatTime(bestRecord.time)}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className="aspect-square cursor-pointer perspective-[600px]"
            onClick={() => handleFlip(card.id)}
            whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
            whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
          >
            <motion.div
              animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
              className="relative h-full w-full"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Card back (face down) */}
              <div
                className="absolute inset-0 flex items-center justify-center rounded-xl border border-border bg-surface-alt"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="text-2xl text-text-muted">?</span>
              </div>
              {/* Card front (face up) */}
              <div
                className={`absolute inset-0 flex items-center justify-center rounded-xl border ${
                  card.isMatched
                    ? "border-success/50 bg-success/10"
                    : "border-primary/30 bg-primary/5"
                }`}
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <motion.span
                  className="text-3xl"
                  animate={card.isMatched ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {card.emoji}
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Win overlay */}
      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={restart}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-xl border border-success/30 bg-surface p-8 text-center max-w-sm w-full"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              >
                <Trophy className="mx-auto h-14 w-14 text-warning mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">恭喜通关！</h2>
              <p className="text-text-muted mb-1">{moves} 步完成</p>
              <p className="text-text-muted mb-5">用时 {formatTime(timer)}</p>
              <div className="flex gap-3 justify-center">
                <button type="button" className="demo-btn inline-flex items-center gap-2" onClick={restart}>
                  <RotateCcw className="h-4 w-4" />
                  再来一局
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DemoShell>
  );
}
