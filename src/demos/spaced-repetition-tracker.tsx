import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  RotateCcw,
  Calendar,
  TrendingUp,
  BookOpen,
  Star,
  ChevronRight,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DemoShell } from "@/components/demo-shell";

interface Card {
  id: number;
  front: string;
  back: string;
  lastReviewed: string;
  nextReview: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  status: "new" | "learning" | "mastered";
}

const TODAY = "2026-04-01";

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDate(date: string): string {
  return date.replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3");
}

const INITIAL_CARDS: Card[] = [
  { id: 1, front: "ephemeral", back: "短暂的，转瞬即逝的", lastReviewed: "2026-03-30", nextReview: "2026-04-01", easeFactor: 2.5, interval: 2, repetitions: 3, status: "learning" },
  { id: 2, front: "ubiquitous", back: "无处不在的", lastReviewed: "2026-03-28", nextReview: "2026-04-01", easeFactor: 2.1, interval: 4, repetitions: 5, status: "learning" },
  { id: 3, front: "paradigm", back: "范式，典范", lastReviewed: "2026-03-31", nextReview: "2026-04-01", easeFactor: 1.8, interval: 1, repetitions: 2, status: "learning" },
  { id: 4, front: "serendipity", back: "意外的美好发现", lastReviewed: "2026-03-29", nextReview: "2026-04-02", easeFactor: 2.8, interval: 4, repetitions: 6, status: "mastered" },
  { id: 5, front: "eloquent", back: "雄辩的，有说服力的", lastReviewed: "2026-03-25", nextReview: "2026-04-05", easeFactor: 3.0, interval: 11, repetitions: 8, status: "mastered" },
  { id: 6, front: "pragmatic", back: "务实的，实用主义的", lastReviewed: "2026-03-27", nextReview: "2026-04-03", easeFactor: 2.6, interval: 7, repetitions: 5, status: "mastered" },
  { id: 7, front: "resilient", back: "有弹性的，恢复力强的", lastReviewed: "", nextReview: "", easeFactor: 2.5, interval: 0, repetitions: 0, status: "new" },
  { id: 8, front: "ambiguous", back: "模棱两可的", lastReviewed: "", nextReview: "", easeFactor: 2.5, interval: 0, repetitions: 0, status: "new" },
  { id: 9, front: "cognitive", back: "认知的", lastReviewed: "2026-03-20", nextReview: "2026-04-08", easeFactor: 2.9, interval: 19, repetitions: 10, status: "mastered" },
  { id: 10, front: "synthesis", back: "综合，合成", lastReviewed: "2026-03-31", nextReview: "2026-04-01", easeFactor: 2.0, interval: 1, repetitions: 1, status: "learning" },
];

const CHART_DATA = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  return {
    day: `3/${day}`,
    reviewed: Math.floor(Math.random() * 6) + 2,
    mastered: Math.min(Math.floor(day / 4) + 1, 6),
  };
});

function easeColor(ef: number): string {
  if (ef >= 2.8) return "text-success";
  if (ef >= 2.3) return "text-primary-light";
  if (ef >= 1.8) return "text-warning";
  return "text-error";
}

function statusLabel(s: Card["status"]): { text: string; cls: string } {
  if (s === "mastered") return { text: "已掌握", cls: "bg-success/20 text-success" };
  if (s === "learning") return { text: "学习中", cls: "bg-warning/20 text-warning" };
  return { text: "新卡片", cls: "bg-primary/20 text-primary-light" };
}

export function SpacedRepetitionTracker() {
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [rated, setRated] = useState(false);
  const [ratingInfo, setRatingInfo] = useState<string | null>(null);

  const dueToday = useMemo(
    () => cards.filter((c) => c.nextReview === TODAY || c.nextReview === ""),
    [cards],
  );

  const stats = useMemo(() => {
    const mastered = cards.filter((c) => c.status === "mastered").length;
    const learning = cards.filter((c) => c.status === "learning").length;
    const newCards = cards.filter((c) => c.status === "new").length;
    return { total: cards.length, mastered, learning, new: newCards };
  }, [cards]);

  function handleRate(quality: number) {
    if (!selectedCard || rated) return;
    const card = { ...selectedCard };
    const oldInterval = card.interval;
    let newEF = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEF = Math.max(1.3, newEF);

    let newInterval: number;
    if (quality < 2) {
      newInterval = 1;
      card.repetitions = 0;
    } else {
      card.repetitions += 1;
      if (card.repetitions === 1) newInterval = 1;
      else if (card.repetitions === 2) newInterval = 3;
      else newInterval = Math.round(oldInterval * newEF);
    }

    card.easeFactor = Math.round(newEF * 100) / 100;
    card.interval = newInterval;
    card.lastReviewed = TODAY;
    card.nextReview = addDays(TODAY, newInterval);
    card.status = card.repetitions >= 6 ? "mastered" : card.repetitions >= 1 ? "learning" : "new";

    setRatingInfo(
      `间隔: ${oldInterval}d → ${newInterval}d | 易度: ${selectedCard.easeFactor} → ${card.easeFactor} | 下次: ${formatDate(card.nextReview)}`,
    );
    setRated(true);

    setCards((prev) => prev.map((c) => (c.id === card.id ? card : c)));
    setSelectedCard(card);
  }

  function closeReview() {
    setSelectedCard(null);
    setFlipped(false);
    setRated(false);
    setRatingInfo(null);
  }

  const ratingButtons = [
    { quality: 1, label: "忘了", cls: "bg-error/20 text-error hover:bg-error/30" },
    { quality: 2, label: "模糊", cls: "bg-warning/20 text-warning hover:bg-warning/30" },
    { quality: 3, label: "记住了", cls: "bg-primary/20 text-primary-light hover:bg-primary/30" },
    { quality: 4, label: "很简单", cls: "bg-success/20 text-success hover:bg-success/30" },
  ];

  return (
    <DemoShell
      title="间隔重复追踪器"
      description="基于SM-2算法的间隔重复系统，智能安排复习时间。"
      tags={["记忆", "间隔重复", "词汇"]}
    >
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "总计", value: stats.total, icon: BookOpen, color: "text-primary-light" },
          { label: "已掌握", value: stats.mastered, icon: Star, color: "text-success" },
          { label: "学习中", value: stats.learning, icon: TrendingUp, color: "text-warning" },
          { label: "新卡片", value: stats.new, icon: Brain, color: "text-primary-light" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-surface-alt p-3 text-center">
            <s.icon className={`mx-auto h-5 w-5 ${s.color} mb-1`} />
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Due today */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary-light" />
          今日复习
          <span className="demo-tag ml-1">{dueToday.length} 张</span>
        </h2>
        {dueToday.length === 0 ? (
          <p className="text-text-muted text-sm">今天没有需要复习的卡片，做得好！</p>
        ) : (
          <div className="grid gap-2">
            {dueToday.map((card) => (
              <motion.button
                key={card.id}
                type="button"
                whileHover={{ x: 4 }}
                onClick={() => {
                  setSelectedCard(card);
                  setFlipped(false);
                  setRated(false);
                  setRatingInfo(null);
                }}
                className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3 text-left transition-colors hover:bg-primary/10 w-full"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold">{card.front}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusLabel(card.status).cls}`}>
                    {statusLabel(card.status).text}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-text-muted" />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* All cards */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">所有卡片</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="text-left py-2 font-medium">单词</th>
                <th className="text-left py-2 font-medium">上次复习</th>
                <th className="text-left py-2 font-medium">下次复习</th>
                <th className="text-left py-2 font-medium">易度</th>
                <th className="text-left py-2 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr
                  key={card.id}
                  onClick={() => {
                    setSelectedCard(card);
                    setFlipped(false);
                    setRated(false);
                    setRatingInfo(null);
                  }}
                  className="border-b border-border/50 cursor-pointer hover:bg-surface-hover transition-colors"
                >
                  <td className="py-2 font-mono font-medium">{card.front}</td>
                  <td className="py-2 text-text-muted">{card.lastReviewed ? formatDate(card.lastReviewed) : "—"}</td>
                  <td className="py-2 text-text-muted">{card.nextReview ? formatDate(card.nextReview) : "—"}</td>
                  <td className={`py-2 font-mono font-semibold ${easeColor(card.easeFactor)}`}>
                    {card.easeFactor.toFixed(2)}
                  </td>
                  <td className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusLabel(card.status).cls}`}>
                      {statusLabel(card.status).text}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-light" />
          30天复习统计
        </h2>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3b3b52" />
              <XAxis dataKey="day" tick={{ fill: "#9393a8", fontSize: 11 }} interval={4} />
              <YAxis tick={{ fill: "#9393a8", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#252538", border: "1px solid #3b3b52", borderRadius: 8, color: "#e2e2f0" }}
              />
              <Line type="monotone" dataKey="reviewed" stroke="#818cf8" strokeWidth={2} name="复习数" dot={false} />
              <Line type="monotone" dataKey="mastered" stroke="#22c55e" strokeWidth={2} name="已掌握" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Review modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={closeReview}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-xl border border-border bg-surface p-6"
            >
              <button type="button" onClick={closeReview} className="absolute top-3 right-3 text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>

              {/* Flip card */}
              <div
                className="mx-auto mb-5 cursor-pointer perspective-[600px]"
                onClick={() => setFlipped(!flipped)}
              >
                <motion.div
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative h-44 w-full"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-border bg-surface-alt backface-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <p className="text-xs text-text-muted mb-2">点击翻转</p>
                    <p className="text-2xl font-bold font-mono">{selectedCard.front}</p>
                  </div>
                  {/* Back */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/5 backface-hidden"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <p className="text-xs text-text-muted mb-2">释义</p>
                    <p className="text-xl font-semibold">{selectedCard.back}</p>
                  </div>
                </motion.div>
              </div>

              {/* Rating */}
              {flipped && !rated && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <p className="text-sm text-text-muted text-center">你记得这个词吗？</p>
                  <div className="grid grid-cols-4 gap-2">
                    {ratingButtons.map((r) => (
                      <button
                        key={r.quality}
                        type="button"
                        onClick={() => handleRate(r.quality)}
                        className={`rounded-lg py-2 text-sm font-medium transition-colors ${r.cls}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Rating info */}
              {ratingInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-lg bg-surface-alt border border-border p-3 text-xs text-text-muted font-mono text-center"
                >
                  {ratingInfo}
                </motion.div>
              )}

              {rated && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  type="button"
                  onClick={closeReview}
                  className="demo-btn mt-4 w-full inline-flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  继续
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DemoShell>
  );
}
