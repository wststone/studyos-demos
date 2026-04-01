import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Send,
  RotateCcw,
  CheckCircle,
  MinusCircle,
} from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface Step {
  id: string;
  explanation: string;
  calculation: string;
}

interface ModelStep {
  explanation: string;
  calculation: string;
}

const PROBLEM = {
  title: "应用题",
  text: "一个水池有两根进水管和一根排水管。单独开第一根进水管，6小时可以注满水池；单独开第二根进水管，8小时可以注满水池；单独开排水管，12小时可以排空水池。如果三根管同时打开，多少小时可以注满水池？",
};

const MODEL_SOLUTION: ModelStep[] = [
  {
    explanation: "计算第一根进水管每小时注水量（水池容量为1）",
    calculation: "第一根进水管效率 = 1/6",
  },
  {
    explanation: "计算第二根进水管每小时注水量",
    calculation: "第二根进水管效率 = 1/8",
  },
  {
    explanation: "计算排水管每小时排水量",
    calculation: "排水管效率 = 1/12",
  },
  {
    explanation: "计算三管同时打开时每小时的净注水量",
    calculation: "净效率 = 1/6 + 1/8 - 1/12 = 4/24 + 3/24 - 2/24 = 5/24",
  },
  {
    explanation: "用总量除以净效率，得到注满时间",
    calculation: "时间 = 1 ÷ (5/24) = 24/5 = 4.8小时",
  },
];

let stepIdCounter = 0;
function createStep(): Step {
  stepIdCounter += 1;
  return { id: `step-${stepIdCounter}`, explanation: "", calculation: "" };
}

export function ExplainYourThinking() {
  const [steps, setSteps] = useState<Step[]>([createStep()]);
  const [submitted, setSubmitted] = useState(false);

  function addStep() {
    setSteps((prev) => [...prev, createStep()]);
  }

  function removeStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }

  function moveStep(idx: number, direction: -1 | 1) {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= steps.length) return;
    setSteps((prev) => {
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  }

  function updateStep(id: string, field: "explanation" | "calculation", value: string) {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function handleReset() {
    stepIdCounter = 0;
    setSteps([createStep()]);
    setSubmitted(false);
  }

  // Simple alignment: check if user step has keyword overlap with model step
  function getStepAlignment(userIdx: number): number | null {
    if (!submitted) return null;
    const userStep = steps[userIdx];
    const userText = (userStep.explanation + " " + userStep.calculation).toLowerCase();

    let bestMatch = -1;
    let bestScore = 0;

    for (let i = 0; i < MODEL_SOLUTION.length; i++) {
      const modelText = (
        MODEL_SOLUTION[i].explanation +
        " " +
        MODEL_SOLUTION[i].calculation
      ).toLowerCase();

      // Simple keyword overlap score
      const modelKeywords = modelText.split(/[\s，。、=÷+\-/()]+/).filter(Boolean);
      let score = 0;
      for (const kw of modelKeywords) {
        if (kw.length >= 2 && userText.includes(kw)) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = i;
      }
    }

    return bestScore >= 2 ? bestMatch : null;
  }

  const hasContent = steps.some(
    (s) => s.explanation.trim() || s.calculation.trim(),
  );

  return (
    <DemoShell
      title="展示你的思路"
      description="逐步解答数学题，展示你的思考过程，然后与参考答案进行对比。"
      tags={["数学", "解题思路", "分步推理"]}
    >
      {/* Problem */}
      <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <h3 className="mb-2 font-bold text-primary-light">{PROBLEM.title}</h3>
        <p className="leading-relaxed">{PROBLEM.text}</p>
      </div>

      <div className={`${submitted ? "grid gap-6 md:grid-cols-2" : ""}`}>
        {/* User steps */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">
            {submitted ? "你的解答" : "写下你的解题步骤"}
          </h3>

          <div className="space-y-3">
            <AnimatePresence>
              {steps.map((step, idx) => {
                const alignment = getStepAlignment(idx);
                const isAligned = alignment !== null;

                return (
                  <motion.div
                    key={step.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    className={`rounded-lg border p-3 transition-colors ${
                      submitted
                        ? isAligned
                          ? "border-success/40 bg-success/5"
                          : "border-warning/40 bg-warning/5"
                        : "border-border bg-surface-alt"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary-light">
                        {idx + 1}
                      </span>

                      {submitted && (
                        <span className="text-xs">
                          {isAligned ? (
                            <span className="inline-flex items-center gap-1 text-success">
                              <CheckCircle className="h-3.5 w-3.5" />
                              对应参考步骤 {alignment + 1}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-warning">
                              <MinusCircle className="h-3.5 w-3.5" />
                              未匹配参考步骤
                            </span>
                          )}
                        </span>
                      )}

                      {!submitted && (
                        <div className="ml-auto flex gap-1">
                          <button
                            type="button"
                            className="rounded p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
                            onClick={() => moveStep(idx, -1)}
                            disabled={idx === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
                            onClick={() => moveStep(idx, 1)}
                            disabled={idx === steps.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          {steps.length > 1 && (
                            <button
                              type="button"
                              className="rounded p-1 text-text-muted transition-colors hover:bg-error/20 hover:text-error"
                              onClick={() => removeStep(step.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        className="demo-input w-full text-sm"
                        placeholder="思路说明..."
                        value={step.explanation}
                        onChange={(e) =>
                          updateStep(step.id, "explanation", e.target.value)
                        }
                        readOnly={submitted}
                      />
                      <input
                        type="text"
                        className="demo-input w-full font-mono text-sm"
                        placeholder="计算过程..."
                        value={step.calculation}
                        onChange={(e) =>
                          updateStep(step.id, "calculation", e.target.value)
                        }
                        readOnly={submitted}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {!submitted && (
            <button
              type="button"
              className="demo-btn-outline mt-3 inline-flex items-center gap-2 text-sm"
              onClick={addStep}
            >
              <Plus className="h-4 w-4" />
              添加步骤
            </button>
          )}
        </div>

        {/* Model solution (shown after submit) */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">
                参考答案
              </h3>

              <div className="space-y-3">
                {MODEL_SOLUTION.map((ms, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.08 }}
                    className="rounded-lg border border-border bg-surface-alt p-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/20 text-xs font-bold text-success">
                        {idx + 1}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted">{ms.explanation}</p>
                    <p className="mt-1 font-mono text-sm text-text">
                      {ms.calculation}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="mt-5 flex gap-3">
        {!submitted ? (
          <button
            type="button"
            className="demo-btn inline-flex items-center gap-2"
            disabled={!hasContent}
            onClick={handleSubmit}
          >
            <Send className="h-4 w-4" />
            提交
          </button>
        ) : (
          <button
            type="button"
            className="demo-btn-outline inline-flex items-center gap-2"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
            重新解答
          </button>
        )}
      </div>
    </DemoShell>
  );
}
