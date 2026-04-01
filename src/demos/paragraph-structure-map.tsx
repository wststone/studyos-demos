import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

type Label = "主题句" | "支撑句" | "结论" | null;

interface Sentence {
  id: number;
  text: string;
  correctLabel: Label;
}

const SENTENCES: Sentence[] = [
  {
    id: 0,
    text: "气候变化是当今人类面临的最严峻的全球性挑战之一。",
    correctLabel: "主题句",
  },
  {
    id: 1,
    text: "根据联合国政府间气候变化专门委员会的报告，全球平均温度在过去一个世纪中上升了约1.1摄氏度。",
    correctLabel: "支撑句",
  },
  {
    id: 2,
    text: "极端天气事件的频率和强度显著增加，包括热浪、洪水和干旱等自然灾害。",
    correctLabel: "支撑句",
  },
  {
    id: 3,
    text: "因此，各国必须立即采取行动，减少温室气体排放，以避免不可逆转的环境灾难。",
    correctLabel: "结论",
  },
];

const LABEL_OPTIONS: Label[] = ["主题句", "支撑句", "结论"];

const LABEL_COLORS: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  主题句: {
    bg: "bg-blue-500/15",
    border: "border-blue-500/40",
    text: "text-blue-400",
    bar: "bg-blue-500",
  },
  支撑句: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
    bar: "bg-emerald-500",
  },
  结论: {
    bg: "bg-amber-500/15",
    border: "border-amber-500/40",
    text: "text-amber-400",
    bar: "bg-amber-500",
  },
};

export function ParagraphStructureMap() {
  const [labels, setLabels] = useState<Record<number, Label>>({});
  const [activeSentence, setActiveSentence] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const handleLabel = (sentenceId: number, label: Label) => {
    setLabels((prev) => ({ ...prev, [sentenceId]: label }));
    setActiveSentence(null);
  };

  const handleCheck = () => {
    setChecked(true);
  };

  const handleReset = () => {
    setLabels({});
    setChecked(false);
    setActiveSentence(null);
  };

  const score = checked
    ? SENTENCES.filter((s) => labels[s.id] === s.correctLabel).length
    : 0;

  const allLabeled = SENTENCES.every((s) => labels[s.id] != null);

  return (
    <DemoShell
      title="段落结构图"
      description="阅读段落，为每个句子标注其在段落中的角色"
      tags={["阅读理解", "段落结构", "互动标注"]}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: paragraph */}
        <div className="flex-1 space-y-3">
          <p className="text-sm text-text-muted mb-4">
            点击句子，选择它的角色标签：
          </p>
          {SENTENCES.map((sentence) => {
            const label = labels[sentence.id];
            const colors = label ? LABEL_COLORS[label] : null;
            const isCorrect = checked && label === sentence.correctLabel;
            const isWrong = checked && label !== sentence.correctLabel;

            return (
              <motion.div
                key={sentence.id}
                layout
                className="relative"
              >
                <motion.div
                  className={`
                    p-3 rounded-lg border cursor-pointer transition-colors relative
                    ${colors ? `${colors.bg} ${colors.border}` : "border-border hover:border-primary/40"}
                    ${activeSentence === sentence.id ? "ring-2 ring-primary/50" : ""}
                    ${checked ? "cursor-default" : ""}
                  `}
                  onClick={() => {
                    if (!checked) {
                      setActiveSentence(
                        activeSentence === sentence.id ? null : sentence.id
                      );
                    }
                  }}
                  whileHover={checked ? {} : { scale: 1.01 }}
                  whileTap={checked ? {} : { scale: 0.99 }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-text-muted text-xs mt-1 shrink-0">
                      {sentence.id + 1}.
                    </span>
                    <span className="text-sm leading-relaxed">
                      {sentence.text}
                    </span>
                  </div>
                  {label && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${colors!.bg} ${colors!.text}`}
                    >
                      {label}
                    </motion.span>
                  )}
                  {checked && (
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute top-3 right-3"
                    >
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <XCircle className="w-5 h-5 text-error" />
                      )}
                    </motion.span>
                  )}
                  {isWrong && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-xs text-error mt-1"
                    >
                      正确答案：{sentence.correctLabel}
                    </motion.p>
                  )}
                </motion.div>

                {/* Label picker dropdown */}
                <AnimatePresence>
                  {activeSentence === sentence.id && !checked && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute z-10 top-full mt-1 left-4 flex gap-2 bg-surface-alt border border-border rounded-lg p-2 shadow-lg"
                    >
                      {LABEL_OPTIONS.map((opt) => {
                        const c = LABEL_COLORS[opt!];
                        return (
                          <button
                            key={opt}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLabel(sentence.id, opt);
                            }}
                            className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-colors ${c.bg} ${c.border} ${c.text} hover:opacity-80`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            {!checked ? (
              <button
                className="demo-btn"
                disabled={!allLabeled}
                onClick={handleCheck}
              >
                检查答案
              </button>
            ) : (
              <button className="demo-btn-outline flex items-center gap-1.5" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" />
                重新开始
              </button>
            )}
            {checked && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium"
              >
                得分：
                <span className={score === SENTENCES.length ? "text-success" : "text-warning"}>
                  {score}/{SENTENCES.length}
                </span>
              </motion.span>
            )}
          </div>
        </div>

        {/* Right: structure visualization */}
        <div className="lg:w-56 shrink-0">
          <h3 className="text-sm font-semibold mb-3 text-text-muted">
            段落结构
          </h3>
          <div className="space-y-2">
            {SENTENCES.map((sentence) => {
              const label = labels[sentence.id];
              const colors = label ? LABEL_COLORS[label] : null;
              const indent =
                label === "支撑句" ? "ml-4" : label === "结论" ? "ml-0" : "ml-0";

              return (
                <motion.div
                  key={sentence.id}
                  layout
                  className={`flex items-center gap-2 ${indent}`}
                >
                  <div
                    className={`w-1.5 h-8 rounded-full transition-colors ${
                      colors ? colors.bar : "bg-border"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-muted truncate">
                      句 {sentence.id + 1}
                    </p>
                    {label ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-xs font-medium ${colors!.text}`}
                      >
                        {label}
                      </motion.p>
                    ) : (
                      <p className="text-xs text-text-muted/50">未标注</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-1.5">
            <p className="text-xs text-text-muted font-medium mb-2">图例</p>
            {LABEL_OPTIONS.map((opt) => {
              const c = LABEL_COLORS[opt!];
              return (
                <div key={opt} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${c.bar}`} />
                  <span className={`text-xs ${c.text}`}>{opt}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DemoShell>
  );
}
