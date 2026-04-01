import { useState, useRef, useCallback, useMemo } from "react";
import { DemoShell } from "@/components/demo-shell";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ZoomIn, ZoomOut } from "lucide-react";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

const PRESETS = ["x^2", "sin(x)", "2*x+1"];

function parseAndEval(expr: string, x: number): number | null {
  try {
    // Replace common math syntax
    let e = expr
      .replace(/\^/g, "**")
      .replace(/sqrt\(/g, "Math.sqrt(")
      .replace(/abs\(/g, "Math.abs(")
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/pi/g, "Math.PI")
      .replace(/e(?![a-zA-Z])/g, "Math.E");
    // Insert multiplication: 2x -> 2*x, )(-> )*(
    e = e.replace(/(\d)([a-zA-Z(])/g, "$1*$2");
    e = e.replace(/\)(\()/g, ")*(");
    e = e.replace(/\)([a-zA-Z\d])/g, ")*$1");

    const fn = new Function("x", `"use strict"; return (${e});`);
    const result = fn(x);
    if (typeof result !== "number" || !isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

interface FnEntry {
  id: number;
  expr: string;
  color: string;
}

export function GraphPlotter() {
  const [functions, setFunctions] = useState<FnEntry[]>([
    { id: 1, expr: "x^2", color: COLORS[0] },
  ]);
  const [newExpr, setNewExpr] = useState("");
  const [zoom, setZoom] = useState(1);
  const [hover, setHover] = useState<{ x: number; y: number; px: number; py: number } | null>(
    null,
  );
  const svgRef = useRef<SVGSVGElement>(null);
  const nextId = useRef(2);

  const W = 700;
  const H = 500;
  const range = 10 / zoom;
  const cx = W / 2;
  const cy = H / 2;
  const scaleX = W / (2 * range);
  const scaleY = H / (2 * range);

  const toScreen = useCallback(
    (x: number, y: number) => ({
      sx: cx + x * scaleX,
      sy: cy - y * scaleY,
    }),
    [cx, cy, scaleX, scaleY],
  );

  const toMath = useCallback(
    (sx: number, sy: number) => ({
      mx: (sx - cx) / scaleX,
      my: -(sy - cy) / scaleY,
    }),
    [cx, cy, scaleX, scaleY],
  );

  const addFunction = useCallback(() => {
    const expr = newExpr.trim();
    if (!expr) return;
    setFunctions((fns) => [
      ...fns,
      { id: nextId.current++, expr, color: COLORS[fns.length % COLORS.length] },
    ]);
    setNewExpr("");
  }, [newExpr]);

  const removeFunction = useCallback((id: number) => {
    setFunctions((fns) => fns.filter((f) => f.id !== id));
  }, []);

  const addPreset = useCallback((expr: string) => {
    setFunctions((fns) => [
      ...fns,
      { id: nextId.current++, expr, color: COLORS[fns.length % COLORS.length] },
    ]);
  }, []);

  // Grid lines
  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; major: boolean }[] = [];
    const step = range > 15 ? 5 : range > 5 ? 2 : 1;
    for (let v = -Math.ceil(range / step) * step; v <= Math.ceil(range / step) * step; v += step) {
      const { sx } = toScreen(v, 0);
      const { sy } = toScreen(0, v);
      lines.push({ x1: sx, y1: 0, x2: sx, y2: H, major: v === 0 });
      lines.push({ x1: 0, y1: sy, x2: W, y2: sy, major: v === 0 });
    }
    return lines;
  }, [range, toScreen]);

  // Axis labels
  const axisLabels = useMemo(() => {
    const labels: { x: number; y: number; text: string }[] = [];
    const step = range > 15 ? 5 : range > 5 ? 2 : 1;
    for (let v = -Math.ceil(range / step) * step; v <= Math.ceil(range / step) * step; v += step) {
      if (v === 0) continue;
      const { sx } = toScreen(v, 0);
      const { sy } = toScreen(0, v);
      labels.push({ x: sx, y: cy + 16, text: String(v) });
      labels.push({ x: cx - 16, y: sy + 4, text: String(v) });
    }
    return labels;
  }, [range, toScreen, cx, cy]);

  // Function paths
  const paths = useMemo(() => {
    return functions.map((fn) => {
      const points: string[] = [];
      const steps = 400;
      let drawing = false;
      for (let i = 0; i <= steps; i++) {
        const x = -range + (i / steps) * 2 * range;
        const y = parseAndEval(fn.expr, x);
        if (y === null || Math.abs(y) > range * 3) {
          drawing = false;
          continue;
        }
        const { sx, sy } = toScreen(x, y);
        points.push(`${drawing ? "L" : "M"}${sx.toFixed(1)},${sy.toFixed(1)}`);
        drawing = true;
      }
      return { ...fn, d: points.join(" ") };
    });
  }, [functions, range, toScreen]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const px = ((e.clientX - rect.left) / rect.width) * W;
      const py = ((e.clientY - rect.top) / rect.height) * H;
      const { mx, my } = toMath(px, py);
      setHover({ x: Math.round(mx * 100) / 100, y: Math.round(my * 100) / 100, px, py });
    },
    [toMath],
  );

  return (
    <DemoShell
      title="函数图像绘制器"
      description="输入数学表达式，实时绘制函数图像"
      tags={["数学", "函数", "可视化"]}
    >
      <div className="space-y-4">
        {/* Input */}
        <div className="flex gap-2">
          <input
            className="demo-input flex-1"
            placeholder="输入函数表达式，如 x^2, sin(x), 2x+1"
            value={newExpr}
            onChange={(e) => setNewExpr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFunction()}
          />
          <button className="demo-btn flex items-center gap-1" onClick={addFunction}>
            <Plus className="w-4 h-4" /> 添加
          </button>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-text-muted">快速添加：</span>
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => addPreset(p)}
              className="text-xs font-mono px-2 py-1 rounded bg-surface-alt border border-border hover:bg-surface-hover transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Function list */}
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {functions.map((fn) => (
              <motion.div
                key={fn.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-alt border border-border text-sm"
              >
                <span className="w-3 h-3 rounded-full" style={{ background: fn.color }} />
                <span className="font-mono">{fn.expr}</span>
                <button
                  onClick={() => removeFunction(fn.id)}
                  className="text-text-muted hover:text-error transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            className="demo-btn-outline p-1.5"
            onClick={() => setZoom((z) => Math.min(z * 1.5, 10))}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            className="demo-btn-outline p-1.5"
            onClick={() => setZoom((z) => Math.max(z / 1.5, 0.2))}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-text-muted font-mono">{zoom.toFixed(1)}x</span>
          {hover && (
            <span className="text-xs text-text-muted font-mono ml-auto">
              ({hover.x}, {hover.y})
            </span>
          )}
        </div>

        {/* SVG Graph */}
        <div className="rounded-xl border border-border overflow-hidden bg-[#0f0f1a]">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHover(null)}
          >
            {/* Grid */}
            {gridLines.map((l, i) => (
              <line
                key={i}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke={l.major ? "#555" : "#222"}
                strokeWidth={l.major ? 1.5 : 0.5}
              />
            ))}

            {/* Labels */}
            {axisLabels.map((l, i) => (
              <text key={i} x={l.x} y={l.y} fill="#666" fontSize="10" textAnchor="middle">
                {l.text}
              </text>
            ))}

            {/* Origin */}
            <text x={cx - 10} y={cy + 14} fill="#666" fontSize="10">
              0
            </text>

            {/* Function curves */}
            {paths.map((p) => (
              <path
                key={p.id}
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Crosshair */}
            {hover && (
              <>
                <line
                  x1={hover.px}
                  y1={0}
                  x2={hover.px}
                  y2={H}
                  stroke="#6366f1"
                  strokeWidth={0.5}
                  strokeDasharray="4 4"
                  opacity={0.5}
                />
                <line
                  x1={0}
                  y1={hover.py}
                  x2={W}
                  y2={hover.py}
                  stroke="#6366f1"
                  strokeWidth={0.5}
                  strokeDasharray="4 4"
                  opacity={0.5}
                />
                <circle cx={hover.px} cy={hover.py} r={4} fill="#6366f1" />
              </>
            )}
          </svg>
        </div>
      </div>
    </DemoShell>
  );
}
