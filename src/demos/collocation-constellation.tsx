import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { RotateCcw, Sparkles, X } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

type Headword = "make" | "take" | "do" | "have";

interface Partner {
  id: string;
  text: string;
  correct: boolean;
  example?: string;
  hint?: string;
}

const DATA: Record<Headword, Partner[]> = {
  make: [
    { id: "m1", text: "a decision", correct: true, example: "She had to make a decision quickly." },
    { id: "m2", text: "a mistake", correct: true, example: "Everyone makes a mistake sometimes." },
    { id: "m3", text: "an effort", correct: true, example: "Please make an effort to be on time." },
    { id: "m4", text: "the bed", correct: true, example: "I make the bed every morning." },
    { id: "m5", text: "fun of", correct: true, example: "Don't make fun of his accent." },
    { id: "m6", text: "homework", correct: false, hint: "→ do homework" },
    { id: "m7", text: "a shower", correct: false, hint: "→ take a shower" },
    { id: "m8", text: "research", correct: false, hint: "→ do research" },
  ],
  take: [
    { id: "t1", text: "a shower", correct: true, example: "I take a shower every morning." },
    { id: "t2", text: "a break", correct: true, example: "Let's take a break for ten minutes." },
    { id: "t3", text: "a photo", correct: true, example: "Can you take a photo of us?" },
    { id: "t4", text: "responsibility", correct: true, example: "He took responsibility for the error." },
    { id: "t5", text: "advantage of", correct: true, example: "We took advantage of the discount." },
    { id: "t6", text: "a decision", correct: false, hint: "→ make a decision" },
    { id: "t7", text: "homework", correct: false, hint: "→ do homework" },
    { id: "t8", text: "an effort", correct: false, hint: "→ make an effort" },
  ],
  do: [
    { id: "d1", text: "homework", correct: true, example: "Did you do your homework?" },
    { id: "d2", text: "the dishes", correct: true, example: "I'll do the dishes after dinner." },
    { id: "d3", text: "research", correct: true, example: "She is doing research on bees." },
    { id: "d4", text: "exercise", correct: true, example: "He does exercise every morning." },
    { id: "d5", text: "a favor", correct: true, example: "Could you do me a favor?" },
    { id: "d6", text: "a decision", correct: false, hint: "→ make a decision" },
    { id: "d7", text: "a shower", correct: false, hint: "→ take a shower" },
    { id: "d8", text: "the bed", correct: false, hint: "→ make the bed" },
  ],
  have: [
    { id: "h1", text: "breakfast", correct: true, example: "We have breakfast at seven." },
    { id: "h2", text: "a chat", correct: true, example: "Let's have a chat after class." },
    { id: "h3", text: "a meeting", correct: true, example: "We have a meeting at noon." },
    { id: "h4", text: "a problem", correct: true, example: "I have a problem with this answer." },
    { id: "h5", text: "fun", correct: true, example: "The kids had fun at the park." },
    { id: "h6", text: "homework", correct: false, hint: "→ do homework" },
    { id: "h7", text: "a decision", correct: false, hint: "→ make a decision" },
    { id: "h8", text: "the dishes", correct: false, hint: "→ do the dishes" },
  ],
};

const CANVAS_W = 600;
const CANVAS_H = 480;
const CENTER = { x: CANVAS_W / 2, y: CANVAS_H / 2 };
const ORBIT_RADIUS = 200;
const INNER_ORBIT_RADIUS = 110;
const DROP_RADIUS = 90;

const STARS = Array.from({ length: 60 }, (_, i) => ({
  cx: ((i * 137) % CANVAS_W) + ((i * 53) % 13) - 6,
  cy: ((i * 71) % CANVAS_H) + ((i * 29) % 11) - 5,
  r: ((i * 17) % 3) * 0.4 + 0.6,
  o: ((i * 23) % 50) / 100 + 0.15,
}));

export function CollocationConstellation() {
  const [headword, setHeadword] = useState<Headword>("make");
  const partners = DATA[headword];

  const [bonded, setBonded] = useState<Record<string, boolean>>({});
  const [rejectionId, setRejectionId] = useState<string | null>(null);
  const [rejectionHint, setRejectionHint] = useState<string | null>(null);
  const [completeFlash, setCompleteFlash] = useState(false);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  function switchHeadword(h: Headword) {
    setHeadword(h);
    setBonded({});
    setRejectionId(null);
    setRejectionHint(null);
    setCompleteFlash(false);
  }

  function reset() {
    setBonded({});
    setRejectionId(null);
    setRejectionHint(null);
    setCompleteFlash(false);
  }

  function handleDragEnd(p: Partner, info: PanInfo) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dropX = info.point.x - rect.left;
    const dropY = info.point.y - rect.top;
    const dx = dropX - CENTER.x;
    const dy = dropY - CENTER.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= DROP_RADIUS) {
      if (p.correct) {
        setBonded((prev) => {
          const next = { ...prev, [p.id]: true };
          const totalCorrect = partners.filter((q) => q.correct).length;
          const bondedCorrect = Object.keys(next).length;
          if (bondedCorrect === totalCorrect) {
            setCompleteFlash(true);
            window.setTimeout(() => setCompleteFlash(false), 2400);
          }
          return next;
        });
      } else {
        setRejectionId(p.id);
        setRejectionHint(p.hint ?? "✗ not a natural collocation");
        window.setTimeout(() => {
          setRejectionId(null);
          setRejectionHint(null);
        }, 1500);
      }
    }
  }

  const correctCount = partners.filter((p) => p.correct).length;
  const bondedCount = Object.keys(bonded).length;

  const orbitPositions = useMemo(() => {
    return partners.map((_, i) => {
      const angle = (i / partners.length) * Math.PI * 2 - Math.PI / 2;
      return {
        x: CENTER.x + Math.cos(angle) * ORBIT_RADIUS,
        y: CENTER.y + Math.sin(angle) * ORBIT_RADIUS,
      };
    });
  }, [partners]);

  const bondedPartners = partners.filter((p) => bonded[p.id]);

  const bondedInnerPositions = useMemo(() => {
    return bondedPartners.map((_, i, arr) => {
      const angle = (i / arr.length) * Math.PI * 2 - Math.PI / 2;
      return {
        x: CENTER.x + Math.cos(angle) * INNER_ORBIT_RADIUS,
        y: CENTER.y + Math.sin(angle) * INNER_ORBIT_RADIUS,
      };
    });
  }, [bondedPartners]);

  return (
    <DemoShell
      title="搭配星座"
      description="把搭配词拖到中心的核心词上 — 自然搭配会被吸入轨道并发光，错误搭配会被排斥"
      tags={["搭配", "词汇", "物理互动", "创新"]}
    >
      <div className="space-y-5">
        {/* Headword selector */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(DATA) as Headword[]).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => switchHeadword(h)}
                className={`text-sm px-3 py-1.5 rounded-md border transition-all ${
                  headword === h
                    ? "border-primary bg-primary/15 text-primary-light font-medium"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-text-muted">
              已连接 {bondedCount} / {correctCount}
            </span>
            <button
              type="button"
              className="demo-btn-outline flex items-center gap-1.5"
              onClick={reset}
            >
              <RotateCcw className="w-4 h-4" /> 重置
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="relative rounded-lg border border-border overflow-hidden mx-auto"
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            maxWidth: "100%",
            background:
              "radial-gradient(ellipse at center, rgba(60,60,90,0.35) 0%, rgba(15,15,25,0.95) 80%)",
          }}
        >
          {/* Stars */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={CANVAS_W}
            height={CANVAS_H}
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          >
            {STARS.map((s, i) => (
              <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={s.o} />
            ))}

            {/* Outer drop ring (faint) */}
            <circle
              cx={CENTER.x}
              cy={CENTER.y}
              r={DROP_RADIUS}
              fill="none"
              stroke="rgba(168,168,255,0.18)"
              strokeWidth={1}
              strokeDasharray="4 6"
            />

            {/* Bond lines */}
            {bondedPartners.map((p, i) => {
              const pos = bondedInnerPositions[i];
              return (
                <motion.line
                  key={p.id}
                  x1={CENTER.x}
                  y1={CENTER.y}
                  x2={pos.x}
                  y2={pos.y}
                  stroke="url(#bondGrad)"
                  strokeWidth={1.6}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: [0.4, 0.9, 0.4],
                  }}
                  transition={{
                    pathLength: { duration: 0.4 },
                    opacity: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
                  }}
                />
              );
            })}

            <defs>
              <linearGradient id="bondGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(124, 156, 255, 0.85)" />
                <stop offset="100%" stopColor="rgba(180, 200, 255, 0.45)" />
              </linearGradient>
              <radialGradient id="centerGlow">
                <stop offset="0%" stopColor="rgba(124,156,255,0.45)" />
                <stop offset="100%" stopColor="rgba(124,156,255,0)" />
              </radialGradient>
            </defs>

            <circle cx={CENTER.x} cy={CENTER.y} r={120} fill="url(#centerGlow)" />
          </svg>

          {/* Headword pill (center) */}
          <motion.div
            key={headword}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="absolute z-10 px-6 py-3 rounded-full bg-primary/20 border-2 border-primary text-primary-light font-bold text-2xl"
            style={{
              left: CENTER.x,
              top: CENTER.y,
              transform: "translate(-50%, -50%)",
              boxShadow:
                "0 0 30px rgba(124,156,255,0.5), 0 0 60px rgba(124,156,255,0.25)",
            }}
          >
            {headword}
          </motion.div>

          {/* Partner pills */}
          {partners.map((p, i) => {
            const isBonded = !!bonded[p.id];
            const startPos = orbitPositions[i];
            const target = isBonded
              ? bondedInnerPositions[bondedPartners.findIndex((q) => q.id === p.id)]
              : startPos;
            const isRejected = rejectionId === p.id;

            return (
              <motion.div
                key={p.id}
                drag={!isBonded}
                dragMomentum={false}
                dragElastic={0.15}
                onDragEnd={(_, info) => handleDragEnd(p, info)}
                animate={
                  isRejected
                    ? {
                        left: startPos.x,
                        top: startPos.y,
                        x: [0, -8, 8, -6, 6, 0],
                        scale: 1,
                      }
                    : {
                        left: target.x,
                        top: target.y,
                        x: 0,
                        scale: isBonded ? 0.92 : 1,
                      }
                }
                transition={{
                  left: { type: "spring", stiffness: 260, damping: 24 },
                  top: { type: "spring", stiffness: 260, damping: 24 },
                  x: { duration: 0.45 },
                  scale: { type: "spring", stiffness: 260, damping: 24 },
                }}
                style={{
                  position: "absolute",
                  transform: "translate(-50%, -50%)",
                  touchAction: "none",
                }}
                className={`select-none px-3 py-1.5 rounded-full text-sm border whitespace-nowrap z-20 ${
                  isBonded
                    ? "border-primary/70 bg-primary/10 text-primary-light shadow-[0_0_12px_rgba(124,156,255,0.5)]"
                    : isRejected
                    ? "border-error bg-error/15 text-error cursor-grab"
                    : "border-border bg-surface-alt text-text hover:border-primary/50 cursor-grab active:cursor-grabbing"
                }`}
              >
                {p.text}
              </motion.div>
            );
          })}

          {/* Completion flash */}
          <AnimatePresence>
            {completeFlash && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-x-0 bottom-6 flex justify-center z-30 pointer-events-none"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 border border-success text-success font-medium">
                  <Sparkles className="w-4 h-4" />
                  星座完成！
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rejection hint */}
          <AnimatePresence>
            {rejectionHint && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute inset-x-0 top-3 flex justify-center z-30 pointer-events-none"
              >
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-error/15 border border-error/50 text-error text-xs">
                  <X className="w-3.5 h-3.5" />
                  {rejectionHint}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bonded sentence panel */}
        <AnimatePresence>
          {bondedPartners.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-surface-alt p-3"
            >
              <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">
                已连接搭配
              </p>
              <ul className="space-y-1.5">
                {bondedPartners.map((p) => (
                  <li key={p.id} className="text-sm">
                    <span className="text-primary-light font-medium">
                      {headword} {p.text}
                    </span>
                    {p.example && (
                      <span className="text-text-muted italic ml-2">— {p.example}</span>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-text-muted">
          提示：把搭配词拖到中心的核心词上。自然的英语搭配会被吸入内圈轨道并发光；错误搭配会被排斥并提示正确形式。
        </p>
      </div>
    </DemoShell>
  );
}
