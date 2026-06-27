import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Eraser, ChevronRight, Eye, EyeOff } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

type IntonationType = "rising" | "falling" | "rising-falling";

interface SentenceData {
  id: string;
  text: string;
  words: string[];
  type: IntonationType;
  /** index of the emphasis word, for rising-falling */
  emphasisIdx?: number;
  labelZh: string;
  typeLabel: string;
}

const SENTENCES: SentenceData[] = [
  {
    id: "s1",
    text: "Are you coming to the party tonight?",
    words: ["Are", "you", "coming", "to", "the", "party", "tonight"],
    type: "rising",
    labelZh: "一般疑问句 — 句尾上扬",
    typeLabel: "Yes/No Question",
  },
  {
    id: "s2",
    text: "The library closes at nine o'clock.",
    words: ["The", "library", "closes", "at", "nine", "o'clock"],
    type: "falling",
    labelZh: "陈述句 — 句尾下降",
    typeLabel: "Statement",
  },
  {
    id: "s3",
    text: "Where did you put my keys?",
    words: ["Where", "did", "you", "put", "my", "keys"],
    type: "falling",
    labelZh: "特殊疑问句 — 句尾下降",
    typeLabel: "Wh-Question",
  },
  {
    id: "s4",
    text: "I said BLUE, not green.",
    words: ["I", "said", "BLUE,", "not", "green"],
    type: "rising-falling",
    emphasisIdx: 2,
    labelZh: "强调 — 重读词处先升后降",
    typeLabel: "Emphasis",
  },
];

const CANVAS_W = 700;
const CANVAS_H = 220;
const PITCH_TOP = 20;
const PITCH_BOTTOM = 170;
const SAMPLE_THRESHOLD = 4;

function yToPitch(y: number) {
  const clamped = Math.max(PITCH_TOP, Math.min(PITCH_BOTTOM, y));
  const norm = 1 - (clamped - PITCH_TOP) / (PITCH_BOTTOM - PITCH_TOP);
  return 0.5 + norm * 1.5;
}

function generateModelCurve(s: SentenceData): { x: number; y: number }[] {
  const left = 50;
  const right = CANVAS_W - 30;
  const span = right - left;
  const top = PITCH_TOP + 15;
  const bottom = PITCH_BOTTOM - 15;
  const N = 60;
  const pts: { x: number; y: number }[] = [];

  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = left + t * span;
    let y: number;
    if (s.type === "rising") {
      y = bottom - (bottom - top) * t * 0.85 - 10;
    } else if (s.type === "falling") {
      y = top + (bottom - top) * t * 0.85 + 10;
    } else {
      const peakT = (s.emphasisIdx ?? Math.floor(s.words.length / 2)) / s.words.length;
      const dist = Math.abs(t - peakT) / 0.25;
      const bell = Math.exp(-dist * dist * 1.2);
      y = bottom - (bottom - top) * bell * 0.9;
    }
    pts.push({ x, y });
  }
  return pts;
}

function pointsToPath(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return "";
  return pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
}

export function IntonationPainter() {
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const sentence = SENTENCES[sentenceIdx];

  const [userPath, setUserPath] = useState<{ x: number; y: number }[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [playheadX, setPlayheadX] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const speechOk = typeof window !== "undefined" && "speechSynthesis" in window;

  const modelCurve = useMemo(() => generateModelCurve(sentence), [sentence]);

  const wordCenters = useMemo(() => {
    const left = 50;
    const right = CANVAS_W - 30;
    const span = right - left;
    return sentence.words.map((_, i) => left + (span / sentence.words.length) * (i + 0.5));
  }, [sentence]);

  function reset() {
    setUserPath([]);
    setPlayheadX(null);
    setPlaying(false);
    if (speechOk) window.speechSynthesis.cancel();
  }

  function nextSentence() {
    setSentenceIdx((p) => (p + 1) % SENTENCES.length);
    reset();
    setShowModel(false);
  }

  function getSvgPoint(e: React.PointerEvent) {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
    return { x, y };
  }

  function onPointerDown(e: React.PointerEvent) {
    if (playing) return;
    const p = getSvgPoint(e);
    if (!p) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrawing(true);
    setUserPath([{ x: p.x, y: Math.max(PITCH_TOP, Math.min(PITCH_BOTTOM, p.y)) }]);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drawing) return;
    const p = getSvgPoint(e);
    if (!p) return;
    setUserPath((prev) => {
      const last = prev[prev.length - 1];
      if (last && Math.hypot(p.x - last.x, p.y - last.y) < SAMPLE_THRESHOLD) return prev;
      return [
        ...prev,
        { x: p.x, y: Math.max(PITCH_TOP, Math.min(PITCH_BOTTOM, p.y)) },
      ];
    });
  }

  function onPointerUp() {
    setDrawing(false);
  }

  function pitchAtX(pts: { x: number; y: number }[], x: number): number {
    if (pts.length === 0) return 1.0;
    if (x <= pts[0].x) return yToPitch(pts[0].y);
    if (x >= pts[pts.length - 1].x) return yToPitch(pts[pts.length - 1].y);
    for (let i = 1; i < pts.length; i++) {
      if (pts[i].x >= x) {
        const a = pts[i - 1];
        const b = pts[i];
        const t = (x - a.x) / (b.x - a.x || 1);
        const y = a.y + (b.y - a.y) * t;
        return yToPitch(y);
      }
    }
    return yToPitch(pts[pts.length - 1].y);
  }

  function play(curve: { x: number; y: number }[]) {
    if (!speechOk || curve.length === 0) return;
    window.speechSynthesis.cancel();
    setPlaying(true);

    let started = 0;
    const totalApprox = sentence.words.length * 320;
    const startedAt = performance.now();

    sentence.words.forEach((word, i) => {
      const u = new SpeechSynthesisUtterance(word.replace(/[,.!?]$/, ""));
      u.lang = "en-US";
      u.rate = 0.9;
      u.pitch = Math.max(0.4, Math.min(2.0, pitchAtX(curve, wordCenters[i])));
      u.onstart = () => {
        started++;
      };
      if (i === sentence.words.length - 1) {
        u.onend = () => {
          setPlaying(false);
          setPlayheadX(null);
        };
      }
      window.speechSynthesis.speak(u);
    });

    const tick = () => {
      const elapsed = performance.now() - startedAt;
      const t = Math.min(1, elapsed / totalApprox);
      const left = 50;
      const right = CANVAS_W - 30;
      setPlayheadX(left + (right - left) * t);
      if (t < 1 && window.speechSynthesis.speaking) {
        requestAnimationFrame(tick);
      } else if (!window.speechSynthesis.speaking) {
        setPlayheadX(null);
        setPlaying(false);
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
    void started;
  }

  useEffect(() => {
    return () => {
      if (speechOk) window.speechSynthesis.cancel();
    };
  }, [speechOk]);

  const userPathD = pointsToPath(userPath);
  const modelPathD = pointsToPath(modelCurve);

  return (
    <DemoShell
      title="语调画板"
      description="画出英语句子的音高曲线 — 听到语调真的随你的画作改变，对比模型曲线学语调模式"
      tags={["口语", "语调", "听力", "互动"]}
    >
      <div className="space-y-5">
        {/* Sentence selector */}
        <div className="flex flex-wrap gap-2">
          {SENTENCES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSentenceIdx(i);
                reset();
                setShowModel(false);
              }}
              className={`text-sm px-3 py-1.5 rounded-md border transition-all ${
                i === sentenceIdx
                  ? "border-primary bg-primary/15 text-primary-light font-medium"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {s.typeLabel}
            </button>
          ))}
        </div>

        {/* Current sentence */}
        <div className="text-center py-1">
          <motion.p
            key={sentence.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-medium text-primary-light"
          >
            {sentence.text}
          </motion.p>
          <p className="text-xs text-text-muted mt-1">{sentence.labelZh}</p>
        </div>

        {/* Canvas */}
        <div className="rounded-lg border border-border bg-surface-alt overflow-hidden">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            className="w-full touch-none cursor-crosshair"
            style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {/* Pitch zone gridlines */}
            <line
              x1={30}
              x2={CANVAS_W - 10}
              y1={PITCH_TOP}
              y2={PITCH_TOP}
              stroke="currentColor"
              strokeOpacity={0.15}
              strokeDasharray="3 4"
            />
            <line
              x1={30}
              x2={CANVAS_W - 10}
              y1={(PITCH_TOP + PITCH_BOTTOM) / 2}
              y2={(PITCH_TOP + PITCH_BOTTOM) / 2}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeDasharray="3 4"
            />
            <line
              x1={30}
              x2={CANVAS_W - 10}
              y1={PITCH_BOTTOM}
              y2={PITCH_BOTTOM}
              stroke="currentColor"
              strokeOpacity={0.15}
              strokeDasharray="3 4"
            />
            {/* Pitch axis labels */}
            <text x={6} y={PITCH_TOP + 4} fontSize="10" opacity={0.5} fill="currentColor">高</text>
            <text x={6} y={PITCH_BOTTOM + 4} fontSize="10" opacity={0.5} fill="currentColor">低</text>

            {/* Word labels along x-axis */}
            {sentence.words.map((w, i) => (
              <g key={i}>
                <line
                  x1={wordCenters[i]}
                  x2={wordCenters[i]}
                  y1={PITCH_BOTTOM}
                  y2={PITCH_BOTTOM + 6}
                  stroke="currentColor"
                  strokeOpacity={0.3}
                />
                <text
                  x={wordCenters[i]}
                  y={PITCH_BOTTOM + 22}
                  fontSize="11"
                  textAnchor="middle"
                  fill="currentColor"
                  opacity={sentence.emphasisIdx === i ? 1 : 0.7}
                  fontWeight={sentence.emphasisIdx === i ? "bold" : "normal"}
                >
                  {w}
                </text>
              </g>
            ))}

            {/* Model curve */}
            {showModel && (
              <motion.path
                d={modelPathD}
                fill="none"
                stroke="rgb(74, 222, 128)"
                strokeWidth={2}
                strokeDasharray="5 5"
                strokeOpacity={0.85}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
              />
            )}

            {/* User curve */}
            {userPath.length > 1 && (
              <motion.path
                d={userPathD}
                fill="none"
                stroke="rgb(124, 156, 255)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: drawing ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: drawing ? 0 : 0.5 }}
              />
            )}

            {/* Playhead */}
            {playheadX !== null && (
              <line
                x1={playheadX}
                x2={playheadX}
                y1={PITCH_TOP - 4}
                y2={PITCH_BOTTOM + 4}
                stroke="rgb(251, 191, 36)"
                strokeWidth={2}
                strokeOpacity={0.85}
              />
            )}

            {/* Placeholder when empty */}
            {userPath.length === 0 && (
              <text
                x={CANVAS_W / 2}
                y={(PITCH_TOP + PITCH_BOTTOM) / 2}
                textAnchor="middle"
                fontSize="14"
                fill="currentColor"
                opacity={0.35}
              >
                在此区域按住鼠标画出你想要的音高曲线 ↑↓
              </text>
            )}
          </svg>

          {/* Legend */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-border text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-0.5 bg-primary-light" />
                你画的
              </span>
              {showModel && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-0.5 border-t-2 border-dashed border-success" />
                  模型曲线
                </span>
              )}
            </div>
            <span className="text-text-muted">
              采样点: {userPath.length}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="demo-btn flex items-center gap-1.5"
            disabled={userPath.length < 2 || playing || !speechOk}
            onClick={() => play(userPath)}
          >
            <Play className="w-4 h-4" /> 播放（你的）
          </button>
          <button
            type="button"
            className="demo-btn-outline flex items-center gap-1.5"
            disabled={playing || !speechOk}
            onClick={() => play(modelCurve)}
          >
            <Play className="w-4 h-4" /> 播放（模型）
          </button>
          <button
            type="button"
            className="demo-btn-outline flex items-center gap-1.5"
            onClick={() => setShowModel((p) => !p)}
          >
            {showModel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showModel ? "隐藏模型" : "显示模型"}
          </button>
          <button
            type="button"
            className="demo-btn-outline flex items-center gap-1.5"
            onClick={reset}
          >
            <Eraser className="w-4 h-4" /> 清除
          </button>
          <button
            type="button"
            className="demo-btn-outline flex items-center gap-1.5 ml-auto"
            onClick={nextSentence}
          >
            下一句 <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Speech support warning */}
        <AnimatePresence>
          {!speechOk && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-error/40 bg-error/10 p-3 text-sm text-error"
            >
              当前浏览器不支持 SpeechSynthesis，无法播放语音。请使用 Chrome / Safari / Edge。
            </motion.div>
          )}
        </AnimatePresence>

        {/* Word-pitch table */}
        {userPath.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-surface-alt p-3"
          >
            <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">
              逐词音高 (你的 vs 模型)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {sentence.words.map((w, i) => {
                const userP = pitchAtX(userPath, wordCenters[i]);
                const modelP = pitchAtX(modelCurve, wordCenters[i]);
                return (
                  <div key={i} className="flex flex-col gap-0.5 p-2 rounded border border-border">
                    <span className="font-medium">{w}</span>
                    <span className="text-primary-light">你 {userP.toFixed(2)}</span>
                    <span className="text-success">模 {modelP.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </DemoShell>
  );
}
