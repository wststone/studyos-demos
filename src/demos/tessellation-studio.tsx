import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Palette, Info } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

/* ── Types ─────────────────────────────────────────────────────────── */

interface EdgePoint {
  t: number; // 0–1 position along the edge
  offset: number; // perpendicular displacement (px in tile coords)
}

/* ── Constants ─────────────────────────────────────────────────────── */

const TILE = 100;
const PTS = 5;
const MAX_OFF = TILE * 0.3;
const COLS = 11;
const ROWS = 7;
const VW = (COLS - 2) * TILE;
const VH = (ROWS - 2) * TILE;
const EDIT_COL = Math.floor(COLS / 2);
const EDIT_ROW = Math.floor(ROWS / 2);

const PALETTE = [
  "#6366f1",
  "#818cf8",
  "#a78bfa",
  "#c084fc",
  "#22c55e",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#f97316",
];

const DEFAULT_A = "#6366f1";
const DEFAULT_B = "#818cf8";

/* ── Utilities ─────────────────────────────────────────────────────── */

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function mkEdge(): EdgePoint[] {
  return Array.from({ length: PTS }, (_, i) => ({
    t: (i + 1) / (PTS + 1),
    offset: 0,
  }));
}

/**
 * Build an SVG path for a single tile.
 *
 * Translation tessellation: opposite edges share the same deformation,
 * so copies placed on a regular grid fit together perfectly.
 *
 *   top   →  bottom  (same offsets, shifted to y = s)
 *   right →  left    (same offsets, shifted to x = 0)
 */
function tilePath(top: EdgePoint[], right: EdgePoint[], s: number): string {
  const d: string[] = ["M 0 0"];
  for (const p of top) d.push(`L ${p.t * s} ${p.offset}`);
  d.push(`L ${s} 0`);
  for (const p of right) d.push(`L ${s + p.offset} ${p.t * s}`);
  d.push(`L ${s} ${s}`);
  for (const p of [...top].reverse()) d.push(`L ${p.t * s} ${s + p.offset}`);
  d.push(`L 0 ${s}`);
  for (const p of [...right].reverse()) d.push(`L ${p.offset} ${p.t * s}`);
  d.push("Z");
  return d.join(" ");
}

/* ── Presets ────────────────────────────────────────────────────────── */

interface Preset {
  name: string;
  top: number[];
  right: number[];
}

const PRESETS: Preset[] = [
  { name: "平面", top: [0, 0, 0, 0, 0], right: [0, 0, 0, 0, 0] },
  { name: "波浪", top: [15, 25, 0, -25, -15], right: [10, 20, 0, -20, -10] },
  { name: "锯齿", top: [-20, 20, -20, 20, -20], right: [0, 0, 0, 0, 0] },
  { name: "拼图", top: [0, -25, -25, 0, 0], right: [0, 0, 25, 25, 0] },
  { name: "阶梯", top: [0, 0, -20, -20, -20], right: [20, 20, 20, 0, 0] },
];

function applyPreset(p: Preset): { top: EdgePoint[]; right: EdgePoint[] } {
  return {
    top: p.top.map((offset, i) => ({ t: (i + 1) / (PTS + 1), offset })),
    right: p.right.map((offset, i) => ({ t: (i + 1) / (PTS + 1), offset })),
  };
}

/* ── Component ─────────────────────────────────────────────────────── */

export function TessellationStudio() {
  const [topEdge, setTopEdge] = useState<EdgePoint[]>(mkEdge);
  const [rightEdge, setRightEdge] = useState<EdgePoint[]>(mkEdge);
  const [paintMode, setPaintMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);
  const [customColors, setCustomColors] = useState<Record<string, string>>({});

  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{
    edge: "top" | "right";
    index: number;
    startOffset: number;
    startClient: { x: number; y: number };
  } | null>(null);

  const path = tilePath(topEdge, rightEdge, TILE);

  /* ── Drag ──────────────────────────────────────────────────────── */

  const onPointerDown = useCallback(
    (edge: "top" | "right", index: number) =>
      (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        (e.target as Element).setPointerCapture(e.pointerId);
        const pts = edge === "top" ? topEdge : rightEdge;
        dragRef.current = {
          edge,
          index,
          startOffset: pts[index].offset,
          startClient: { x: e.clientX, y: e.clientY },
        };
      },
    [topEdge, rightEdge],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scale = (COLS * TILE) / rect.width;
    const delta =
      d.edge === "top"
        ? (e.clientY - d.startClient.y) * scale
        : (e.clientX - d.startClient.x) * scale;
    const newOff = clamp(d.startOffset + delta, -MAX_OFF, MAX_OFF);
    const setter = d.edge === "top" ? setTopEdge : setRightEdge;
    setter((prev) =>
      prev.map((p, i) => (i === d.index ? { ...p, offset: newOff } : p)),
    );
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  /* ── Paint ─────────────────────────────────────────────────────── */

  const onTileClick = useCallback(
    (col: number, row: number) => {
      if (!paintMode) return;
      setCustomColors((prev) => ({ ...prev, [`${col},${row}`]: selectedColor }));
    },
    [paintMode, selectedColor],
  );

  /* ── Reset ─────────────────────────────────────────────────────── */

  const reset = useCallback(() => {
    setTopEdge(mkEdge());
    setRightEdge(mkEdge());
    setCustomColors({});
  }, []);

  /* ── Helpers ───────────────────────────────────────────────────── */

  const getTileColor = (col: number, row: number) => {
    const key = `${col},${row}`;
    if (customColors[key]) return customColors[key];
    return (col + row) % 2 === 0 ? DEFAULT_A : DEFAULT_B;
  };

  const vbX = TILE;
  const vbY = TILE;

  return (
    <DemoShell
      title="镶嵌工坊"
      description="设计一块瓷砖的形状，观察它如何无缝铺满整个平面 — 在拖拽中发现对称与镶嵌的数学之美"
      tags={["几何", "对称", "空间推理", "创意"]}
    >
      <div className="space-y-4">
        {/* ── Controls ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-text-muted shrink-0">预设：</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                const edges = applyPreset(p);
                setTopEdge(edges.top);
                setRightEdge(edges.right);
              }}
              className="demo-btn-outline text-xs px-3 py-1"
            >
              {p.name}
            </button>
          ))}

          <div className="flex-1" />

          <button
            onClick={() => setPaintMode((v) => !v)}
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors ${
              paintMode
                ? "border-primary bg-primary/20 text-primary-light"
                : "border-border text-text-muted hover:text-text"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            上色
          </button>

          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border text-text-muted hover:text-text transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置
          </button>
        </div>

        {/* ── Color palette ────────────────────────────────────── */}
        <AnimatePresence>
          {paintMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 pb-1">
                <span className="text-xs text-text-muted">颜色：</span>
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor:
                        selectedColor === c ? "#e2e2f0" : "transparent",
                      transform:
                        selectedColor === c ? "scale(1.2)" : undefined,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Canvas ───────────────────────────────────────────── */}
        <div className="rounded-lg border border-border overflow-hidden bg-[#13132a]">
          <svg
            ref={svgRef}
            viewBox={`${vbX} ${vbY} ${VW} ${VH}`}
            className="w-full select-none"
            style={{
              aspectRatio: `${VW} / ${VH}`,
              touchAction: "none",
            }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {/* Tiled pattern */}
            {Array.from({ length: ROWS }, (_, row) =>
              Array.from({ length: COLS }, (_, col) => (
                <path
                  key={`${col}-${row}`}
                  d={path}
                  transform={`translate(${col * TILE}, ${row * TILE})`}
                  fill={getTileColor(col, row)}
                  stroke="#3b3b52"
                  strokeWidth={0.5}
                  className={
                    paintMode
                      ? "cursor-pointer transition-opacity hover:opacity-75"
                      : ""
                  }
                  onClick={() => onTileClick(col, row)}
                />
              )),
            )}

            {/* Editing-tile highlight */}
            <rect
              x={EDIT_COL * TILE - 2}
              y={EDIT_ROW * TILE - 2}
              width={TILE + 4}
              height={TILE + 4}
              fill="none"
              stroke="#818cf8"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              rx={3}
              opacity={paintMode ? 0 : 0.6}
            />

            {/* Control points — top edge */}
            {!paintMode &&
              topEdge.map((p, i) => {
                const cx = EDIT_COL * TILE + p.t * TILE;
                const cy = EDIT_ROW * TILE + p.offset;
                return (
                  <g key={`t${i}`}>
                    <line
                      x1={cx}
                      y1={EDIT_ROW * TILE - MAX_OFF}
                      x2={cx}
                      y2={EDIT_ROW * TILE + MAX_OFF}
                      stroke="#818cf8"
                      strokeWidth={0.5}
                      strokeDasharray="2 2"
                      opacity={0.25}
                    />
                    {/* linked ghost on bottom */}
                    <circle
                      cx={cx}
                      cy={EDIT_ROW * TILE + TILE + p.offset}
                      r={3}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth={1}
                      strokeDasharray="2 1"
                      opacity={0.35}
                    />
                    {/* dotted connector */}
                    <line
                      x1={cx}
                      y1={cy}
                      x2={cx}
                      y2={EDIT_ROW * TILE + TILE + p.offset}
                      stroke="#818cf8"
                      strokeWidth={0.5}
                      strokeDasharray="1 3"
                      opacity={0.2}
                    />
                    {/* draggable handle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill="#6366f1"
                      stroke="#fff"
                      strokeWidth={1.5}
                      className="cursor-ns-resize"
                      onPointerDown={onPointerDown("top", i)}
                    />
                  </g>
                );
              })}

            {/* Control points — right edge */}
            {!paintMode &&
              rightEdge.map((p, i) => {
                const cx = EDIT_COL * TILE + TILE + p.offset;
                const cy = EDIT_ROW * TILE + p.t * TILE;
                return (
                  <g key={`r${i}`}>
                    <line
                      x1={EDIT_COL * TILE + TILE - MAX_OFF}
                      y1={cy}
                      x2={EDIT_COL * TILE + TILE + MAX_OFF}
                      y2={cy}
                      stroke="#818cf8"
                      strokeWidth={0.5}
                      strokeDasharray="2 2"
                      opacity={0.25}
                    />
                    {/* linked ghost on left */}
                    <circle
                      cx={EDIT_COL * TILE + p.offset}
                      cy={cy}
                      r={3}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth={1}
                      strokeDasharray="2 1"
                      opacity={0.35}
                    />
                    {/* dotted connector */}
                    <line
                      x1={cx}
                      y1={cy}
                      x2={EDIT_COL * TILE + p.offset}
                      y2={cy}
                      stroke="#818cf8"
                      strokeWidth={0.5}
                      strokeDasharray="1 3"
                      opacity={0.2}
                    />
                    {/* draggable handle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill="#6366f1"
                      stroke="#fff"
                      strokeWidth={1.5}
                      className="cursor-ew-resize"
                      onPointerDown={onPointerDown("right", i)}
                    />
                  </g>
                );
              })}
          </svg>
        </div>

        {/* ── Hint ─────────────────────────────────────────────── */}
        <div className="flex items-start gap-2 text-xs text-text-muted">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            拖动中心瓷砖边缘的
            <span className="text-primary-light font-medium">控制点</span>
            来改变形状 — 对边会自动联动，确保瓷砖能完美镶嵌。点击「上色」可以为瓷砖涂上不同颜色，发现隐藏的对称图案。
          </p>
        </div>
      </div>
    </DemoShell>
  );
}
