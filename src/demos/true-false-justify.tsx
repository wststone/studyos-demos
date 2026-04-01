import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Send, RotateCcw } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface Statement {
  id: number;
  text: string;
  isTrue: boolean;
  explanation: string;
}

const STATEMENTS: Statement[] = [
  {
    id: 1,
    text: "人体最大的器官是肝脏。",
    isTrue: false,
    explanation: "人体最大的器官是皮肤，成年人的皮肤面积约为1.5-2平方米。肝脏是人体最大的内脏器官。",
  },
  {
    id: 2,
    text: "红细胞没有细胞核。",
    isTrue: true,
    explanation: "成熟的哺乳动物红细胞确实没有细胞核，这使得它们能够携带更多的血红蛋白来运输氧气。",
  },
  {
    id: 3,
    text: "植物细胞和动物细胞都有细胞壁。",
    isTrue: false,
    explanation: "只有植物细胞有细胞壁，动物细胞没有细胞壁，只有细胞膜。细胞壁主要由纤维素构成，为植物细胞提供支撑。",
  },
  {
    id: 4,
    text: "DNA的双螺旋结构由沃森和克里克发现。",
    isTrue: true,
    explanation: "1953年，詹姆斯·沃森和弗朗西斯·克里克提出了DNA双螺旋结构模型，这是分子生物学的里程碑。",
  },
  {
    id: 5,
    text: "光合作用只在白天进行，呼吸作用只在夜晚进行。",
    isTrue: false,
    explanation: "光合作用确实需要光照（白天进行），但呼吸作用是全天候进行的，无论白天还是夜晚，活细胞都在进行呼吸作用。",
  },
];

export function TrueFalseJustify() {
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [justifications, setJustifications] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = STATEMENTS.every((s) => answers[s.id] != null);

  const score = submitted
    ? STATEMENTS.filter((s) => answers[s.id] === s.isTrue).length
    : 0;

  function handleToggle(id: number, value: boolean) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function handleJustification(id: number, value: string) {
    if (submitted) return;
    setJustifications((prev) => ({ ...prev, [id]: value }));
  }

  function handleSubmit() {
    if (!allAnswered) return;
    setSubmitted(true);
  }

  function handleReset() {
    setAnswers({});
    setJustifications({});
    setSubmitted(false);
  }

  return (
    <DemoShell
      title="判断并说明理由"
      description="判断以下生物学陈述的正误，并写出你的理由。"
      tags={["生物", "判断题", "批判性思维"]}
    >
      <div className="space-y-5">
        {STATEMENTS.map((stmt, idx) => {
          const userAnswer = answers[stmt.id];
          const isCorrect = submitted && userAnswer === stmt.isTrue;
          const isWrong = submitted && userAnswer !== stmt.isTrue;

          return (
            <motion.div
              key={stmt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`rounded-lg border p-4 transition-colors ${
                isCorrect
                  ? "border-success/50 bg-success/5"
                  : isWrong
                    ? "border-error/50 bg-error/5"
                    : "border-border bg-surface-alt"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary-light">
                  {idx + 1}
                </span>
                <div className="flex-1 space-y-3">
                  <p className="font-medium leading-relaxed">{stmt.text}</p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggle(stmt.id, true)}
                      className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                        userAnswer === true
                          ? "bg-success text-white"
                          : "demo-btn-outline"
                      }`}
                    >
                      正确
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle(stmt.id, false)}
                      className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                        userAnswer === false
                          ? "bg-error text-white"
                          : "demo-btn-outline"
                      }`}
                    >
                      错误
                    </button>
                  </div>

                  <textarea
                    className="demo-input w-full resize-none text-sm"
                    rows={2}
                    placeholder="写下你的理由..."
                    value={justifications[stmt.id] ?? ""}
                    onChange={(e) => handleJustification(stmt.id, e.target.value)}
                    readOnly={submitted}
                  />

                  <AnimatePresence>
                    {submitted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div
                          className={`flex items-start gap-2 rounded-md p-3 text-sm ${
                            isCorrect
                              ? "bg-success/10 text-success"
                              : "bg-error/10 text-error"
                          }`}
                        >
                          {isCorrect ? (
                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          ) : (
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          )}
                          <div>
                            <p className="font-medium">
                              {isCorrect ? "回答正确！" : "回答错误"}
                              {" — 正确答案："}
                              {stmt.isTrue ? "正确" : "错误"}
                            </p>
                            <p className="mt-1 text-text-muted">
                              {stmt.explanation}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 rounded-lg border border-primary/30 bg-primary/10 p-5 text-center"
          >
            <p className="text-lg font-bold">
              得分：{score} / {STATEMENTS.length}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              {score === STATEMENTS.length
                ? "全部正确，太棒了！"
                : score >= STATEMENTS.length * 0.6
                  ? "不错，继续加油！"
                  : "再复习一下吧！"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex gap-3">
        {!submitted ? (
          <button
            type="button"
            className="demo-btn inline-flex items-center gap-2"
            disabled={!allAnswered}
            onClick={handleSubmit}
          >
            <Send className="h-4 w-4" />
            提交答案
          </button>
        ) : (
          <button
            type="button"
            className="demo-btn-outline inline-flex items-center gap-2"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
            重新作答
          </button>
        )}
      </div>
    </DemoShell>
  );
}
