import { useState, useMemo } from "react";
import { DemoShell } from "@/components/demo-shell";
import { motion, AnimatePresence } from "framer-motion";
import { Equal } from "lucide-react";

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

function simplify(n: number, d: number): [number, number] {
  if (d === 0) return [n, d];
  const g = gcd(n, d);
  const sign = d < 0 ? -1 : 1;
  return [(n / g) * sign, (d / g) * sign];
}

// SVG pie-chart fraction visual
function FractionVisual({
  numerator,
  denominator,
  color,
  size = 80,
}: {
  numerator: number;
  denominator: number;
  color: string;
  size?: number;
}) {
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  if (denominator <= 0 || denominator > 20)
    return (
      <div
        className="flex items-center justify-center rounded-full border border-border"
        style={{ width: size, height: size }}
      >
        <span className="text-text-muted text-xs">--</span>
      </div>
    );

  const slices = [];
  const n = Math.min(Math.abs(numerator), denominator);
  for (let i = 0; i < denominator; i++) {
    const startAngle = (i / denominator) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((i + 1) / denominator) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = 1 / denominator > 0.5 ? 1 : 0;
    const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;
    slices.push(
      <path
        key={i}
        d={d}
        fill={i < n ? color : "rgba(255,255,255,0.05)"}
        stroke="#3b3b52"
        strokeWidth={1.5}
      />,
    );
  }

  return (
    <svg width={size} height={size}>
      {slices}
    </svg>
  );
}

// Fraction text display
function FractionText({
  n,
  d,
  large,
}: {
  n: number;
  d: number;
  large?: boolean;
}) {
  const cls = large ? "text-2xl" : "text-lg";
  return (
    <div className={`inline-flex flex-col items-center font-mono ${cls} leading-tight`}>
      <span>{n}</span>
      <div className="w-full h-[2px] bg-text my-0.5" />
      <span>{d}</span>
    </div>
  );
}

const OPS = ["+", "-", "×", "÷"] as const;
type Op = (typeof OPS)[number];

export function FractionManipulator() {
  const [n1, setN1] = useState(1);
  const [d1, setD1] = useState(3);
  const [n2, setN2] = useState(1);
  const [d2, setD2] = useState(4);
  const [op, setOp] = useState<Op>("+");
  const [showSteps, setShowSteps] = useState(false);

  const numInput = (value: number, setter: (v: number) => void, label: string) => (
    <div className="flex flex-col items-center gap-1">
      <label className="text-xs text-text-muted">{label}</label>
      <input
        type="number"
        min={0}
        max={99}
        value={value}
        onChange={(e) => {
          setter(Number(e.target.value) || 0);
          setShowSteps(false);
        }}
        className="demo-input w-16 text-center font-mono text-lg"
      />
    </div>
  );

  const result = useMemo((): { n: number; d: number } | null => {
    if (d1 === 0 || d2 === 0) return null;
    if (op === "÷" && n2 === 0) return null;
    let rn: number, rd: number;
    switch (op) {
      case "+": {
        const cd = lcm(d1, d2);
        rn = n1 * (cd / d1) + n2 * (cd / d2);
        rd = cd;
        break;
      }
      case "-": {
        const cd = lcm(d1, d2);
        rn = n1 * (cd / d1) - n2 * (cd / d2);
        rd = cd;
        break;
      }
      case "×":
        rn = n1 * n2;
        rd = d1 * d2;
        break;
      case "÷":
        rn = n1 * d2;
        rd = d1 * n2;
        break;
    }
    const [sn, sd] = simplify(rn, rd);
    return { n: sn, d: sd };
  }, [n1, d1, n2, d2, op]);

  const steps = useMemo((): string[] => {
    if (!result || d1 === 0 || d2 === 0) return [];
    const s: string[] = [];
    if (op === "+" || op === "-") {
      const cd = lcm(d1, d2);
      const mul1 = cd / d1;
      const mul2 = cd / d2;
      s.push(`找最小公倍数: LCD(${d1}, ${d2}) = ${cd}`);
      s.push(
        `通分: ${n1}/${d1} = ${n1 * mul1}/${cd}，${n2}/${d2} = ${n2 * mul2}/${cd}`,
      );
      const top =
        op === "+" ? n1 * mul1 + n2 * mul2 : n1 * mul1 - n2 * mul2;
      s.push(`${op === "+" ? "相加" : "相减"}: (${n1 * mul1} ${op} ${n2 * mul2}) / ${cd} = ${top}/${cd}`);
      const [sn, sd] = simplify(top, cd);
      if (sn !== top || sd !== cd) {
        s.push(`约分: ${top}/${cd} = ${sn}/${sd}`);
      }
    } else if (op === "×") {
      s.push(`分子相乘: ${n1} × ${n2} = ${n1 * n2}`);
      s.push(`分母相乘: ${d1} × ${d2} = ${d1 * d2}`);
      s.push(`结果: ${n1 * n2}/${d1 * d2}`);
      const [sn, sd] = simplify(n1 * n2, d1 * d2);
      if (sn !== n1 * n2 || sd !== d1 * d2) {
        s.push(`约分: ${n1 * n2}/${d1 * d2} = ${sn}/${sd}`);
      }
    } else {
      s.push(`除法变乘法: ${n1}/${d1} × ${d2}/${n2}`);
      s.push(`分子相乘: ${n1} × ${d2} = ${n1 * d2}`);
      s.push(`分母相乘: ${d1} × ${n2} = ${d1 * n2}`);
      s.push(`结果: ${n1 * d2}/${d1 * n2}`);
      const [sn, sd] = simplify(n1 * d2, d1 * n2);
      if (sn !== n1 * d2 || sd !== d1 * n2) {
        s.push(`约分: ${n1 * d2}/${d1 * n2} = ${sn}/${sd}`);
      }
    }
    return s;
  }, [n1, d1, n2, d2, op, result]);

  return (
    <DemoShell
      title="分数运算器"
      description="可视化分数运算，查看计算步骤"
      tags={["数学", "分数", "可视化"]}
    >
      <div className="space-y-6">
        {/* Fraction inputs with visuals */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {/* Fraction 1 */}
          <div className="flex flex-col items-center gap-3">
            <motion.div key={`v1-${n1}-${d1}`} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <FractionVisual numerator={n1} denominator={d1} color="#6366f1" />
            </motion.div>
            <div className="flex gap-2">
              {numInput(n1, setN1, "分子")}
              {numInput(d1, setD1, "分母")}
            </div>
          </div>

          {/* Operator */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {OPS.map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    setOp(o);
                    setShowSteps(false);
                  }}
                  className={`w-10 h-10 rounded-lg text-lg font-bold transition-all ${
                    op === o
                      ? "bg-primary text-white"
                      : "bg-surface-alt text-text-muted hover:bg-surface-hover"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Fraction 2 */}
          <div className="flex flex-col items-center gap-3">
            <motion.div key={`v2-${n2}-${d2}`} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <FractionVisual numerator={n2} denominator={d2} color="#22c55e" />
            </motion.div>
            <div className="flex gap-2">
              {numInput(n2, setN2, "分子")}
              {numInput(d2, setD2, "分母")}
            </div>
          </div>
        </div>

        {/* Calculate button */}
        <div className="flex justify-center">
          <button
            className="demo-btn flex items-center gap-2"
            onClick={() => setShowSteps(true)}
            disabled={!result}
          >
            <Equal className="w-4 h-4" /> 计算
          </button>
        </div>

        {/* Result */}
        <AnimatePresence>
          {showSteps && result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-4"
            >
              {/* Result display */}
              <div className="flex items-center justify-center gap-5">
                <FractionText n={n1} d={d1} />
                <span className="text-2xl font-bold">{op}</span>
                <FractionText n={n2} d={d2} />
                <span className="text-2xl font-bold">=</span>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <FractionText n={result.n} d={result.d} large />
                </motion.div>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <FractionVisual
                    numerator={Math.abs(result.n)}
                    denominator={Math.abs(result.d)}
                    color="#f59e0b"
                    size={90}
                  />
                </motion.div>
              </div>

              {/* Steps */}
              <div className="rounded-xl border border-border bg-surface-alt p-4 space-y-2">
                <h4 className="text-sm font-semibold text-text-muted mb-2">计算步骤</h4>
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.15 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="font-mono">{step}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DemoShell>
  );
}
