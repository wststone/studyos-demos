import { useState, useCallback } from "react";
import { DemoShell } from "@/components/demo-shell";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, Trash2, CheckCircle, XCircle } from "lucide-react";

const TARGETS = [
  { label: "第1题", equation: "2x+3=7" },
  { label: "第2题", equation: "(x+1)^2=9" },
  { label: "第3题", equation: "√x+2=5" },
];

const SYMBOL_GROUPS = [
  { label: "数字", symbols: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] },
  { label: "运算", symbols: ["+", "-", "×", "÷", "=", "^", "√"] },
  { label: "变量", symbols: ["x", "y", "(", ")"] },
];

function normalize(s: string): string {
  return s.replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/");
}

export function EquationBuilder() {
  const [currentTarget, setCurrentTarget] = useState(0);
  const [formula, setFormula] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  const append = useCallback((sym: string) => {
    setResult(null);
    setFormula((f) => f + sym);
  }, []);

  const backspace = useCallback(() => {
    setResult(null);
    setFormula((f) => f.slice(0, -1));
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setFormula("");
  }, []);

  const check = useCallback(() => {
    const target = TARGETS[currentTarget].equation;
    const match = normalize(formula) === normalize(target);
    setResult(match ? "correct" : "wrong");
  }, [formula, currentTarget]);

  const nextTarget = useCallback(() => {
    setCurrentTarget((t) => (t + 1) % TARGETS.length);
    setFormula("");
    setResult(null);
  }, []);

  return (
    <DemoShell
      title="等式构建器"
      description="点击符号构建目标等式，训练数学表达能力"
      tags={["数学", "等式", "互动"]}
    >
      <div className="space-y-6">
        {/* Target selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-text-muted">目标等式：</span>
          {TARGETS.map((t, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentTarget(i);
                setFormula("");
                setResult(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTarget === i
                  ? "bg-primary text-white"
                  : "bg-surface-alt text-text-muted hover:bg-surface-hover"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Target display */}
        <div className="text-center py-3 rounded-lg bg-surface-alt border border-border">
          <p className="text-xs text-text-muted mb-1">目标</p>
          <p className="text-2xl font-mono font-bold tracking-wider">
            {TARGETS[currentTarget].equation}
          </p>
        </div>

        {/* Formula bar */}
        <div
          className={`relative min-h-[3.5rem] flex items-center px-4 rounded-xl border-2 font-mono text-2xl tracking-wider transition-colors ${
            result === "correct"
              ? "border-success bg-success/10"
              : result === "wrong"
                ? "border-error bg-error/10"
                : "border-border bg-surface-alt"
          }`}
        >
          <AnimatePresence mode="popLayout">
            {formula.split("").map((ch, i) => (
              <motion.span
                key={`${i}-${ch}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.12 }}
              >
                {ch}
              </motion.span>
            ))}
          </AnimatePresence>
          {!formula && (
            <span className="text-text-muted text-base font-sans">点击下方符号构建等式...</span>
          )}
          <motion.span
            className="inline-block w-[2px] h-7 bg-primary ml-0.5"
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />

          {/* Result icon */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute right-3"
              >
                {result === "correct" ? (
                  <CheckCircle className="w-7 h-7 text-success" />
                ) : (
                  <XCircle className="w-7 h-7 text-error" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Symbol grid */}
        <div className="space-y-3">
          {SYMBOL_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-xs text-text-muted mb-1.5">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.symbols.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => append(sym)}
                    className="w-11 h-11 rounded-lg bg-surface-alt border border-border hover:bg-surface-hover hover:border-primary/50 text-lg font-mono font-semibold transition-all active:scale-90"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 flex-wrap">
          <button className="demo-btn-outline flex items-center gap-1.5" onClick={backspace}>
            <Delete className="w-4 h-4" /> 退格
          </button>
          <button className="demo-btn-outline flex items-center gap-1.5" onClick={clear}>
            <Trash2 className="w-4 h-4" /> 清空
          </button>
          <button className="demo-btn" onClick={check} disabled={!formula}>
            检查
          </button>
          {result === "correct" && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="demo-btn !bg-success hover:!bg-green-600"
              onClick={nextTarget}
            >
              下一题 →
            </motion.button>
          )}
        </div>

        {/* Result message */}
        <AnimatePresence>
          {result === "wrong" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-error"
            >
              不匹配，请再试一次！提示：目标是{" "}
              <span className="font-mono font-bold">{TARGETS[currentTarget].equation}</span>
            </motion.p>
          )}
          {result === "correct" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-success font-semibold"
            >
              太棒了！等式完全正确！🎉
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </DemoShell>
  );
}
