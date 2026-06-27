import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, RotateCcw, Clock } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

type ShapeKind = "dot" | "bar" | "bar-with-dot" | "bracket-to-now" | "bracket-to-future";

interface TenseItem {
  id: string;
  sentence: string;
  tense: string;
  tenseZh: string;
  /** Shape position on timeline: x in [0,1], width for bars, dot-pos for bar-with-dot */
  slot: {
    kind: ShapeKind;
    x: number;
    width?: number;
    innerDot?: number;
  };
  explain: string;
}

const ITEMS: TenseItem[] = [
  {
    id: "i1",
    sentence: "I lived in Paris for three years.",
    tense: "Past Simple",
    tenseZh: "一般过去时",
    slot: { kind: "bar", x: 0.12, width: 0.18 },
    explain: "动作发生在过去并已结束 — 过去的一段时间。",
  },
  {
    id: "i2",
    sentence: "I have lived in Paris for three years.",
    tense: "Present Perfect",
    tenseZh: "现在完成时",
    slot: { kind: "bracket-to-now", x: 0.18, width: 0.32 },
    explain: "从过去某点持续到现在 — 一条延伸到 NOW 的横条。",
  },
  {
    id: "i3",
    sentence: "I was living in Paris when the war started.",
    tense: "Past Continuous",
    tenseZh: "过去进行时",
    slot: { kind: "bar-with-dot", x: 0.08, width: 0.26, innerDot: 0.18 },
    explain: "过去一段时间正在进行 — 期间发生了一个点状事件。",
  },
  {
    id: "i4",
    sentence: "I am studying for the exam right now.",
    tense: "Present Continuous",
    tenseZh: "现在进行时",
    slot: { kind: "bar", x: 0.46, width: 0.08 },
    explain: "动作正在 NOW 附近进行 — 跨在 NOW 上方。",
  },
  {
    id: "i5",
    sentence: "I will be working from home tomorrow.",
    tense: "Future Continuous",
    tenseZh: "将来进行时",
    slot: { kind: "bar", x: 0.60, width: 0.16 },
    explain: "将来一段时间内持续进行的动作。",
  },
  {
    id: "i6",
    sentence: "By next year, I will have finished my degree.",
    tense: "Future Perfect",
    tenseZh: "将来完成时",
    slot: { kind: "bracket-to-future", x: 0.50, width: 0.36 },
    explain: "到将来某点之前完成 — 一条延伸到未来某点的横条。",
  },
  {
    id: "i7",
    sentence: "I had finished dinner before she arrived.",
    tense: "Past Perfect",
    tenseZh: "过去完成时",
    slot: { kind: "bar-with-dot", x: 0.02, width: 0.24, innerDot: 0.22 },
    explain: "过去一段动作 + 之后过去的一个点 — 比过去更早的过去。",
  },
];

const TL_W = 720;
const TL_H = 280;
const PAD = 30;
const AXIS_Y = TL_H - 70;
const NOW_X = TL_W / 2;
const SHAPE_Y = AXIS_Y - 40;

function slotPxX(s: TenseItem["slot"]) {
  return PAD + s.x * (TL_W - PAD * 2);
}

function slotPxWidth(s: TenseItem["slot"]) {
  return (s.width ?? 0.02) * (TL_W - PAD * 2);
}

function isInPast(s: TenseItem["slot"]) {
  return slotPxX(s) + slotPxWidth(s) / 2 < NOW_X - 10;
}

function isInFuture(s: TenseItem["slot"]) {
  return slotPxX(s) > NOW_X + 10;
}

function slotColor(s: TenseItem["slot"]) {
  if (isInPast(s)) return "rgb(96, 165, 250)";
  if (isInFuture(s)) return "rgb(251, 191, 36)";
  return "rgb(124, 156, 255)";
}

export function TenseTimeline() {
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [shuffleSeed] = useState(() => Math.floor(performance.now() % 1000));
  const [submitted, setSubmitted] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  function reset() {
    setPlacements({});
    setSubmitted(false);
  }

  function handleDrop(sentenceId: string, clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * TL_W;
    const y = ((clientY - rect.top) / rect.height) * TL_H;

    let bestSlotId: string | null = null;
    let bestDist = Infinity;

    for (const item of ITEMS) {
      const cx = slotPxX(item.slot) + slotPxWidth(item.slot) / 2;
      const cy = SHAPE_Y;
      const d = Math.hypot(cx - x, cy - y);
      if (d < bestDist && d < 80) {
        bestDist = d;
        bestSlotId = item.id;
      }
    }

    if (!bestSlotId) return;
    setPlacements((prev) => {
      const next: Record<string, string> = {};
      for (const [sid, slotId] of Object.entries(prev)) {
        if (sid !== sentenceId && slotId !== bestSlotId) {
          next[sid] = slotId;
        }
      }
      next[sentenceId] = bestSlotId;
      return next;
    });
  }

  function renderShape(item: TenseItem, opts: { highlighted: boolean; placed: string | null; correct: boolean | null }) {
    const { slot } = item;
    const x0 = slotPxX(slot);
    const w = slotPxWidth(slot);
    const color = opts.correct === true ? "rgb(74, 222, 128)" : opts.correct === false ? "rgb(248, 113, 113)" : slotColor(slot);
    const fillOp = opts.placed ? 0.4 : 0.15;
    const strokeOp = opts.highlighted ? 1 : 0.7;

    switch (slot.kind) {
      case "dot":
        return (
          <circle
            cx={x0}
            cy={SHAPE_Y}
            r={9}
            fill={color}
            fillOpacity={fillOp + 0.3}
            stroke={color}
            strokeOpacity={strokeOp}
            strokeWidth={2}
          />
        );
      case "bar":
        return (
          <rect
            x={x0}
            y={SHAPE_Y - 8}
            width={w}
            height={16}
            rx={6}
            fill={color}
            fillOpacity={fillOp}
            stroke={color}
            strokeOpacity={strokeOp}
            strokeWidth={2}
          />
        );
      case "bar-with-dot":
        return (
          <g>
            <rect
              x={x0}
              y={SHAPE_Y - 8}
              width={w}
              height={16}
              rx={6}
              fill={color}
              fillOpacity={fillOp}
              stroke={color}
              strokeOpacity={strokeOp}
              strokeWidth={2}
            />
            <circle
              cx={x0 + (slot.innerDot ?? slot.width! / 2) * (TL_W - PAD * 2)}
              cy={SHAPE_Y}
              r={6}
              fill={color}
              stroke="white"
              strokeOpacity={0.3}
              strokeWidth={1}
            />
          </g>
        );
      case "bracket-to-now":
        return (
          <g>
            <rect
              x={x0}
              y={SHAPE_Y - 8}
              width={NOW_X - x0}
              height={16}
              rx={4}
              fill={color}
              fillOpacity={fillOp}
              stroke={color}
              strokeOpacity={strokeOp}
              strokeWidth={2}
              strokeDasharray="0"
            />
            <line
              x1={NOW_X}
              x2={NOW_X}
              y1={SHAPE_Y - 14}
              y2={SHAPE_Y + 14}
              stroke={color}
              strokeWidth={3}
              strokeOpacity={strokeOp}
            />
          </g>
        );
      case "bracket-to-future":
        return (
          <g>
            <rect
              x={x0}
              y={SHAPE_Y - 8}
              width={w}
              height={16}
              rx={4}
              fill={color}
              fillOpacity={fillOp}
              stroke={color}
              strokeOpacity={strokeOp}
              strokeWidth={2}
            />
            <line
              x1={x0 + w}
              x2={x0 + w}
              y1={SHAPE_Y - 14}
              y2={SHAPE_Y + 14}
              stroke={color}
              strokeWidth={3}
              strokeOpacity={strokeOp}
            />
          </g>
        );
    }
  }

  const shuffledItems = [...ITEMS].sort((a, b) => {
    const ka = (a.id.charCodeAt(1) * 31 + shuffleSeed) % 100;
    const kb = (b.id.charCodeAt(1) * 31 + shuffleSeed) % 100;
    return ka - kb;
  });

  const allPlaced = ITEMS.every((it) => placements[it.id]);
  const correctCount = submitted
    ? ITEMS.filter((it) => placements[it.id] === it.id).length
    : 0;

  return (
    <DemoShell
      title="时态时间轴"
      description="把每个英语句子拖到对应的时态形状上 — 形状暗示事件的时间和持续性"
      tags={["语法", "时态", "空间映射", "拖拽"]}
    >
      <div className="space-y-5">
        {/* Timeline canvas */}
        <div className="rounded-lg border border-border bg-surface-alt overflow-hidden">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${TL_W} ${TL_H}`}
            className="w-full"
            style={{ aspectRatio: `${TL_W} / ${TL_H}` }}
          >
            {/* Past / Future background tint */}
            <rect x={0} y={0} width={NOW_X} height={TL_H} fill="rgba(96, 165, 250, 0.05)" />
            <rect x={NOW_X} y={0} width={TL_W - NOW_X} height={TL_H} fill="rgba(251, 191, 36, 0.05)" />

            {/* Axis line */}
            <line
              x1={PAD}
              x2={TL_W - PAD}
              y1={AXIS_Y}
              y2={AXIS_Y}
              stroke="currentColor"
              strokeOpacity={0.4}
              strokeWidth={2}
            />

            {/* Tick marks & labels */}
            {[
              { t: 0.1, label: "long ago" },
              { t: 0.3, label: "yesterday" },
              { t: 0.5, label: "NOW", bold: true },
              { t: 0.7, label: "tomorrow" },
              { t: 0.9, label: "next year" },
            ].map((tick, i) => (
              <g key={i}>
                <line
                  x1={PAD + tick.t * (TL_W - PAD * 2)}
                  x2={PAD + tick.t * (TL_W - PAD * 2)}
                  y1={AXIS_Y - 4}
                  y2={AXIS_Y + 4}
                  stroke="currentColor"
                  strokeOpacity={tick.bold ? 1 : 0.4}
                  strokeWidth={tick.bold ? 2.5 : 1.5}
                />
                <text
                  x={PAD + tick.t * (TL_W - PAD * 2)}
                  y={AXIS_Y + 22}
                  textAnchor="middle"
                  fontSize="11"
                  fill="currentColor"
                  opacity={tick.bold ? 1 : 0.55}
                  fontWeight={tick.bold ? "bold" : "normal"}
                >
                  {tick.label}
                </text>
              </g>
            ))}

            {/* NOW vertical line */}
            <line
              x1={NOW_X}
              x2={NOW_X}
              y1={20}
              y2={AXIS_Y - 8}
              stroke="rgb(124, 156, 255)"
              strokeOpacity={0.4}
              strokeWidth={1.5}
              strokeDasharray="4 5"
            />

            {/* Past / Future labels */}
            <text x={PAD + 10} y={26} fontSize="11" fill="rgb(96, 165, 250)" opacity={0.7}>
              ← PAST
            </text>
            <text x={TL_W - PAD - 10} y={26} fontSize="11" fill="rgb(251, 191, 36)" opacity={0.7} textAnchor="end">
              FUTURE →
            </text>

            {/* Shape slots */}
            {ITEMS.map((item) => {
              const placedSentenceId = Object.entries(placements).find(([, slotId]) => slotId === item.id)?.[0];
              const isCorrect = submitted && placedSentenceId === item.id;
              const isWrong = submitted && placedSentenceId !== undefined && placedSentenceId !== item.id;
              return (
                <g key={item.id}>
                  {renderShape(item, {
                    highlighted: dragging !== null,
                    placed: placedSentenceId ?? null,
                    correct: submitted ? (isCorrect ? true : isWrong ? false : null) : null,
                  })}
                  {placedSentenceId && (
                    <text
                      x={slotPxX(item.slot) + slotPxWidth(item.slot) / 2}
                      y={SHAPE_Y - 18}
                      textAnchor="middle"
                      fontSize="10"
                      fill="currentColor"
                      opacity={0.8}
                    >
                      #{shuffledItems.findIndex((s) => s.id === placedSentenceId) + 1}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sentence palette */}
        <div>
          <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> 拖动句子到时间轴上对应的时态形状
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {shuffledItems.map((item, idx) => {
              const placed = placements[item.id];
              const isCorrect = submitted && placed === item.id;
              const isWrong = submitted && placed !== undefined && placed !== item.id;
              return (
                <motion.div
                  key={item.id}
                  drag={!submitted}
                  dragMomentum={false}
                  dragSnapToOrigin={true}
                  onDragStart={() => setDragging(item.id)}
                  onDragEnd={(_, info) => {
                    setDragging(null);
                    if (!submitted) handleDrop(item.id, info.point.x, info.point.y);
                  }}
                  whileDrag={{ scale: 1.05, zIndex: 50 }}
                  className={`select-none p-2.5 rounded-lg border text-sm flex items-start gap-2 ${
                    submitted
                      ? isCorrect
                        ? "border-success bg-success/10"
                        : isWrong
                        ? "border-error bg-error/10"
                        : "border-border"
                      : placed
                      ? "border-primary/50 bg-primary/5 cursor-grab"
                      : "border-border bg-surface-alt hover:border-primary/40 cursor-grab"
                  } active:cursor-grabbing`}
                  style={{ touchAction: "none" }}
                >
                  <span className="text-text-muted text-xs shrink-0 mt-0.5">#{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="leading-snug">{item.sentence}</p>
                    {submitted && (
                      <p className="text-xs text-text-muted mt-1 italic">
                        {item.tenseZh} · {item.tense}
                      </p>
                    )}
                  </div>
                  {submitted && isCorrect && <CheckCircle className="w-4 h-4 text-success shrink-0" />}
                  {submitted && isWrong && <XCircle className="w-4 h-4 text-error shrink-0" />}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>正确：{correctCount} / {ITEMS.length}</span>
                {correctCount === ITEMS.length && (
                  <span className="text-success font-medium ml-2">全部正确！</span>
                )}
              </div>
              <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 text-sm space-y-1.5">
                <p className="font-medium text-primary-light mb-1">时态解析：</p>
                {ITEMS.map((it) => (
                  <p key={it.id} className="text-xs">
                    <span className="font-medium">{it.tense}</span>{" "}
                    <span className="text-text-muted">— {it.explain}</span>
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!submitted ? (
            <button
              type="button"
              className="demo-btn"
              disabled={!allPlaced}
              onClick={() => setSubmitted(true)}
            >
              提交
            </button>
          ) : (
            <button
              type="button"
              className="demo-btn-outline flex items-center gap-1.5"
              onClick={reset}
            >
              <RotateCcw className="w-4 h-4" /> 重试
            </button>
          )}
          {!submitted && (
            <span className="text-sm text-text-muted">
              已放置 {Object.keys(placements).length} / {ITEMS.length}
            </span>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
