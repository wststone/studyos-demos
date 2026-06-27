import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, RotateCcw, Info } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface AncestorNode {
  word: string;
  language: string;
  period: string;
  meaning: string;
  meaningZh: string;
}

interface DerivativeNode {
  word: string;
  meaning: string;
  meaningZh: string;
}

interface EtymologyEntry {
  word: string;
  rootKey: string;
  rootVariants: string[];
  rootMeaning: string;
  rootMeaningZh: string;
  ancestors: AncestorNode[]; // oldest → most recent
  derivatives: DerivativeNode[];
}

const TREES: EtymologyEntry[] = [
  {
    word: "transport",
    rootKey: "port",
    rootVariants: ["port"],
    rootMeaning: "to carry",
    rootMeaningZh: "搬运、运送",
    ancestors: [
      { word: "*per-", language: "PIE", period: "原始印欧语", meaning: "to lead, pass over", meaningZh: "引领、通过" },
      { word: "portare", language: "Latin", period: "公元前 1 世纪", meaning: "to carry", meaningZh: "搬运" },
      { word: "transportare", language: "Latin", period: "公元前 1 世纪", meaning: "to carry across", meaningZh: "运过去" },
      { word: "transporter", language: "Old French", period: "14 世纪", meaning: "to convey", meaningZh: "运送" },
    ],
    derivatives: [
      { word: "import", meaning: "to bring in", meaningZh: "进口" },
      { word: "export", meaning: "to send out", meaningZh: "出口" },
      { word: "porter", meaning: "one who carries", meaningZh: "搬运工" },
      { word: "portable", meaning: "able to be carried", meaningZh: "便携的" },
      { word: "report", meaning: "to carry back news", meaningZh: "汇报" },
      { word: "support", meaning: "to carry from below", meaningZh: "支持" },
      { word: "deport", meaning: "to carry away", meaningZh: "驱逐出境" },
    ],
  },
  {
    word: "spectacle",
    rootKey: "spec",
    rootVariants: ["spec", "spect"],
    rootMeaning: "to look, watch",
    rootMeaningZh: "看、观看",
    ancestors: [
      { word: "*spek-", language: "PIE", period: "原始印欧语", meaning: "to observe", meaningZh: "观察" },
      { word: "specere", language: "Latin", period: "公元前", meaning: "to look at", meaningZh: "看" },
      { word: "spectaculum", language: "Latin", period: "公元前 1 世纪", meaning: "public show", meaningZh: "公开演出" },
      { word: "spectacle", language: "Old French", period: "13 世纪", meaning: "public show", meaningZh: "奇观" },
    ],
    derivatives: [
      { word: "spectator", meaning: "one who watches", meaningZh: "观众" },
      { word: "inspect", meaning: "to look into", meaningZh: "检查" },
      { word: "respect", meaning: "to look back at", meaningZh: "尊敬" },
      { word: "perspective", meaning: "view through", meaningZh: "视角" },
      { word: "speculate", meaning: "to look at, ponder", meaningZh: "推测" },
      { word: "spectacular", meaning: "of a public show", meaningZh: "壮观的" },
      { word: "suspect", meaning: "to look from below", meaningZh: "怀疑" },
    ],
  },
  {
    word: "manuscript",
    rootKey: "script",
    rootVariants: ["scrib", "script", "scrip"],
    rootMeaning: "to write",
    rootMeaningZh: "书写",
    ancestors: [
      { word: "*skribh-", language: "PIE", period: "原始印欧语", meaning: "to cut, scratch", meaningZh: "刻、划" },
      { word: "scribere", language: "Latin", period: "公元前", meaning: "to write", meaningZh: "写" },
      { word: "scriptum", language: "Latin", period: "公元前", meaning: "something written", meaningZh: "所写之物" },
      { word: "manuscriptus", language: "Medieval Latin", period: "16 世纪", meaning: "written by hand", meaningZh: "手写" },
    ],
    derivatives: [
      { word: "describe", meaning: "to write down", meaningZh: "描述" },
      { word: "subscribe", meaning: "to sign below", meaningZh: "订阅" },
      { word: "prescription", meaning: "thing written before", meaningZh: "处方" },
      { word: "scribble", meaning: "to write hastily", meaningZh: "潦草地写" },
      { word: "transcript", meaning: "written across", meaningZh: "誊本" },
      { word: "inscription", meaning: "writing on", meaningZh: "铭文" },
      { word: "scripture", meaning: "writings", meaningZh: "经文" },
    ],
  },
  {
    word: "dictate",
    rootKey: "dict",
    rootVariants: ["dic", "dict"],
    rootMeaning: "to say, speak",
    rootMeaningZh: "说、讲",
    ancestors: [
      { word: "*deik-", language: "PIE", period: "原始印欧语", meaning: "to show, pronounce", meaningZh: "指示、宣告" },
      { word: "dicere", language: "Latin", period: "公元前", meaning: "to say", meaningZh: "说" },
      { word: "dictare", language: "Latin", period: "公元前", meaning: "to say repeatedly", meaningZh: "口述" },
      { word: "dicter", language: "Old French", period: "15 世纪", meaning: "to dictate", meaningZh: "口授" },
    ],
    derivatives: [
      { word: "predict", meaning: "to say beforehand", meaningZh: "预测" },
      { word: "contradict", meaning: "to speak against", meaningZh: "反驳" },
      { word: "dictionary", meaning: "book of sayings", meaningZh: "词典" },
      { word: "verdict", meaning: "a true saying", meaningZh: "裁决" },
      { word: "dedicate", meaning: "to proclaim solemnly", meaningZh: "奉献" },
      { word: "indicate", meaning: "to point out", meaningZh: "表明" },
      { word: "diction", meaning: "manner of speaking", meaningZh: "措辞" },
    ],
  },
  {
    word: "vision",
    rootKey: "vis",
    rootVariants: ["vid", "vis"],
    rootMeaning: "to see",
    rootMeaningZh: "看见",
    ancestors: [
      { word: "*weid-", language: "PIE", period: "原始印欧语", meaning: "to see, know", meaningZh: "看见、知道" },
      { word: "videre", language: "Latin", period: "公元前", meaning: "to see", meaningZh: "看" },
      { word: "visio", language: "Latin", period: "公元前", meaning: "act of seeing", meaningZh: "视觉" },
      { word: "vision", language: "Old French", period: "13 世纪", meaning: "sight, dream", meaningZh: "视野、梦" },
    ],
    derivatives: [
      { word: "visible", meaning: "able to be seen", meaningZh: "可见的" },
      { word: "evident", meaning: "easily seen", meaningZh: "明显的" },
      { word: "supervise", meaning: "to oversee", meaningZh: "监督" },
      { word: "revise", meaning: "to see again", meaningZh: "修订" },
      { word: "provide", meaning: "to see ahead", meaningZh: "提供" },
      { word: "video", meaning: "I see (Latin)", meaningZh: "视频" },
      { word: "envision", meaning: "to picture mentally", meaningZh: "设想" },
    ],
  },
];

const SVG_W = 720;
const SVG_H = 540;
const TRUNK_X = SVG_W / 2;
const TRUNK_Y = SVG_H / 2;

function highlightRoot(word: string, variants: string[]) {
  const lower = word.toLowerCase();
  let bestStart = -1;
  let bestLen = 0;
  for (const v of variants) {
    const idx = lower.indexOf(v);
    if (idx !== -1 && v.length > bestLen) {
      bestStart = idx;
      bestLen = v.length;
    }
  }
  if (bestStart === -1) return <>{word}</>;
  return (
    <>
      {word.slice(0, bestStart)}
      <tspan fill="rgb(251, 191, 36)" fontWeight="bold">
        {word.slice(bestStart, bestStart + bestLen)}
      </tspan>
      {word.slice(bestStart + bestLen)}
    </>
  );
}

function highlightRootHtml(word: string, variants: string[]) {
  const lower = word.toLowerCase();
  let bestStart = -1;
  let bestLen = 0;
  for (const v of variants) {
    const idx = lower.indexOf(v);
    if (idx !== -1 && v.length > bestLen) {
      bestStart = idx;
      bestLen = v.length;
    }
  }
  if (bestStart === -1) return <>{word}</>;
  return (
    <>
      {word.slice(0, bestStart)}
      <span className="text-warning font-bold" style={{ color: "rgb(251, 191, 36)" }}>
        {word.slice(bestStart, bestStart + bestLen)}
      </span>
      {word.slice(bestStart + bestLen)}
    </>
  );
}

export function EtymologyTree() {
  const [wordIdx, setWordIdx] = useState(0);
  const [seed, setSeed] = useState(0);
  const [hover, setHover] = useState<{ kind: "ancestor" | "derivative" | "root"; idx: number } | null>(null);
  const entry = TREES[wordIdx];

  const ancestorPositions = useMemo(() => {
    const n = entry.ancestors.length;
    const spread = 360;
    return entry.ancestors.map((_, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const x = TRUNK_X - spread / 2 + t * spread;
      const y = TRUNK_Y + 70 + (i + 1) * 50;
      return { x, y, t };
    });
  }, [entry]);

  const derivativePositions = useMemo(() => {
    const n = entry.derivatives.length;
    const spread = 600;
    return entry.derivatives.map((_, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const x = TRUNK_X - spread / 2 + t * spread;
      const row = i % 2 === 0 ? 0 : 1;
      const y = TRUNK_Y - 100 - 60 - row * 60;
      return { x, y, t };
    });
  }, [entry]);

  function curvePath(from: { x: number; y: number }, to: { x: number; y: number }) {
    const midY = (from.y + to.y) / 2;
    return `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
  }

  const ancestorLangColors: Record<string, string> = {
    PIE: "rgb(168, 132, 240)",
    Latin: "rgb(96, 165, 250)",
    "Medieval Latin": "rgb(96, 165, 250)",
    "Old French": "rgb(74, 222, 128)",
    "Middle English": "rgb(251, 191, 36)",
  };

  const tooltipNode = hover
    ? hover.kind === "ancestor"
      ? entry.ancestors[hover.idx]
      : hover.kind === "derivative"
      ? entry.derivatives[hover.idx]
      : null
    : null;

  return (
    <DemoShell
      title="词根生长树"
      description="选一个英语单词 — 树根向下生长出它的祖先，枝条向上长出共享词根的现代派生词"
      tags={["词汇", "词根", "动画", "创新"]}
    >
      <div className="space-y-5">
        {/* Word selector */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex flex-wrap gap-2">
            {TREES.map((t, i) => (
              <button
                key={t.word}
                type="button"
                onClick={() => {
                  setWordIdx(i);
                  setSeed((p) => p + 1);
                  setHover(null);
                }}
                className={`text-sm px-3 py-1.5 rounded-md border transition-all ${
                  i === wordIdx
                    ? "border-primary bg-primary/15 text-primary-light font-medium"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {t.word}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="demo-btn-outline flex items-center gap-1.5"
            onClick={() => {
              setSeed((p) => p + 1);
              setHover(null);
            }}
          >
            <RotateCcw className="w-4 h-4" /> 重新生长
          </button>
        </div>

        {/* Root meaning badge */}
        <div className="flex items-center justify-center">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-warning/40 text-sm"
            style={{ borderColor: "rgba(251, 191, 36, 0.5)", color: "rgb(251, 191, 36)" }}
          >
            <Sprout className="w-4 h-4" />
            <span className="font-mono font-bold">{entry.rootKey}-</span>
            <span>= {entry.rootMeaning}</span>
            <span className="text-text-muted">({entry.rootMeaningZh})</span>
          </div>
        </div>

        {/* Tree canvas */}
        <div
          className="relative rounded-lg border border-border overflow-hidden"
          style={{
            background:
              "linear-gradient(to bottom, rgba(60,80,140,0.12) 0%, rgba(15,15,25,0) 45%, rgba(15,15,25,0) 55%, rgba(80,60,40,0.15) 100%)",
          }}
        >
          <svg
            key={seed}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full"
            style={{ aspectRatio: `${SVG_W} / ${SVG_H}` }}
          >
            {/* Ground line */}
            <line
              x1={30}
              x2={SVG_W - 30}
              y1={TRUNK_Y + 40}
              y2={TRUNK_Y + 40}
              stroke="currentColor"
              strokeOpacity={0.2}
              strokeDasharray="4 6"
            />

            {/* Roots (downward) */}
            {ancestorPositions.map((pos, i) => {
              const color = ancestorLangColors[entry.ancestors[i].language] ?? "rgb(96, 165, 250)";
              const start = { x: TRUNK_X, y: TRUNK_Y + 40 };
              return (
                <g key={`r-${i}`}>
                  <motion.path
                    d={curvePath(start, { x: pos.x, y: pos.y - 14 })}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    strokeOpacity={0.7}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.3 + i * 0.25, duration: 0.5 }}
                  />
                </g>
              );
            })}

            {/* Branches (upward) */}
            {derivativePositions.map((pos, i) => {
              const start = { x: TRUNK_X, y: TRUNK_Y - 40 };
              return (
                <motion.path
                  key={`b-${i}`}
                  d={curvePath(start, { x: pos.x, y: pos.y + 14 })}
                  fill="none"
                  stroke="rgb(124, 156, 255)"
                  strokeWidth={1.8}
                  strokeOpacity={0.6}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.3 + i * 0.13, duration: 0.45 }}
                />
              );
            })}

            {/* Ancestor nodes */}
            {ancestorPositions.map((pos, i) => {
              const a = entry.ancestors[i];
              const color = ancestorLangColors[a.language] ?? "rgb(96, 165, 250)";
              const w = Math.max(70, a.word.length * 9 + 16);
              return (
                <motion.g
                  key={`an-${i}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.75 + i * 0.25, type: "spring", stiffness: 240, damping: 18 }}
                  style={{ cursor: "pointer", transformOrigin: `${pos.x}px ${pos.y}px` }}
                  onMouseEnter={() => setHover({ kind: "ancestor", idx: i })}
                  onMouseLeave={() => setHover(null)}
                >
                  <rect
                    x={pos.x - w / 2}
                    y={pos.y - 14}
                    width={w}
                    height={28}
                    rx={14}
                    fill="rgba(20,20,32,0.85)"
                    stroke={color}
                    strokeWidth={1.5}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    fontSize="12"
                    textAnchor="middle"
                    fontStyle="italic"
                    fill={color}
                  >
                    {highlightRoot(a.word, entry.rootVariants)}
                  </text>
                </motion.g>
              );
            })}

            {/* Derivative nodes */}
            {derivativePositions.map((pos, i) => {
              const d = entry.derivatives[i];
              const w = Math.max(70, d.word.length * 9 + 16);
              return (
                <motion.g
                  key={`dn-${i}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.75 + i * 0.13, type: "spring", stiffness: 240, damping: 18 }}
                  style={{ cursor: "pointer", transformOrigin: `${pos.x}px ${pos.y}px` }}
                  onMouseEnter={() => setHover({ kind: "derivative", idx: i })}
                  onMouseLeave={() => setHover(null)}
                >
                  <rect
                    x={pos.x - w / 2}
                    y={pos.y - 14}
                    width={w}
                    height={28}
                    rx={14}
                    fill="rgba(20,20,32,0.85)"
                    stroke="rgb(124, 156, 255)"
                    strokeWidth={1.5}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    fontSize="12"
                    textAnchor="middle"
                    fill="rgb(180, 200, 255)"
                  >
                    {highlightRoot(d.word, entry.rootVariants)}
                  </text>
                </motion.g>
              );
            })}

            {/* Trunk (center word) */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              style={{ transformOrigin: `${TRUNK_X}px ${TRUNK_Y}px` }}
              onMouseEnter={() => setHover({ kind: "root", idx: 0 })}
              onMouseLeave={() => setHover(null)}
            >
              <rect
                x={TRUNK_X - 70}
                y={TRUNK_Y - 26}
                width={140}
                height={52}
                rx={26}
                fill="rgba(124, 156, 255, 0.15)"
                stroke="rgb(124, 156, 255)"
                strokeWidth={2.5}
                style={{ filter: "drop-shadow(0 0 12px rgba(124,156,255,0.4))" }}
              />
              <text
                x={TRUNK_X}
                y={TRUNK_Y + 6}
                fontSize="22"
                textAnchor="middle"
                fontWeight="bold"
                fill="rgb(180, 200, 255)"
              >
                {highlightRoot(entry.word, entry.rootVariants)}
              </text>
            </motion.g>
          </svg>

          {/* Hover tooltip */}
          <AnimatePresence>
            {tooltipNode && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-2 rounded-md bg-surface-alt border border-border text-xs max-w-xs shadow-lg"
              >
                <p className="font-medium mb-0.5">
                  {highlightRootHtml((tooltipNode as AncestorNode).word ?? (tooltipNode as DerivativeNode).word, entry.rootVariants)}
                </p>
                {"language" in tooltipNode && (
                  <p className="text-text-muted">
                    {(tooltipNode as AncestorNode).language} · {(tooltipNode as AncestorNode).period}
                  </p>
                )}
                <p className="italic">
                  {tooltipNode.meaning} <span className="text-text-muted">({tooltipNode.meaningZh})</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Direction legend */}
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-primary-light" />
            ↑ 现代派生词 ({entry.derivatives.length})
          </span>
          <span className="flex items-center gap-1.5">
            <Info className="w-3 h-3" /> 把鼠标悬停在节点上查看含义
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: "rgb(168, 132, 240)" }} />
            ↓ 历史祖先 ({entry.ancestors.length})
          </span>
        </div>

        {/* Derivative table */}
        <div className="rounded-lg border border-border bg-surface-alt p-3">
          <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">
            共享词根 <span className="font-mono text-warning" style={{ color: "rgb(251, 191, 36)" }}>{entry.rootKey}-</span> 的派生词
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {entry.derivatives.map((d) => (
              <div key={d.word} className="flex items-baseline gap-2">
                <span className="font-medium min-w-[88px]">
                  {highlightRootHtml(d.word, entry.rootVariants)}
                </span>
                <span className="text-text-muted text-xs">
                  {d.meaning} · {d.meaningZh}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DemoShell>
  );
}
