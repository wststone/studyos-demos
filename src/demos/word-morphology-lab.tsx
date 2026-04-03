import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Shuffle } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface MorphologyQuestion {
  id: string;
  base: string;
  hint: string;
  transforms: { label: string; answer: string }[];
}

const ENGLISH_QUESTIONS: MorphologyQuestion[] = [
  {
    id: "e1",
    base: "happy",
    hint: "形容词",
    transforms: [
      { label: "名词", answer: "happiness" },
      { label: "副词", answer: "happily" },
      { label: "反义词", answer: "unhappy" },
    ],
  },
  {
    id: "e2",
    base: "create",
    hint: "动词",
    transforms: [
      { label: "名词", answer: "creation" },
      { label: "形容词", answer: "creative" },
      { label: "名词(人)", answer: "creator" },
    ],
  },
  {
    id: "e3",
    base: "beauty",
    hint: "名词",
    transforms: [
      { label: "形容词", answer: "beautiful" },
      { label: "副词", answer: "beautifully" },
      { label: "动词", answer: "beautify" },
    ],
  },
];

const CHINESE_QUESTIONS: MorphologyQuestion[] = [
  {
    id: "c1",
    base: "学",
    hint: "动词",
    transforms: [
      { label: "名词(人)", answer: "学生" },
      { label: "名词(学科)", answer: "学问" },
      { label: "名词(场所)", answer: "学校" },
    ],
  },
  {
    id: "c2",
    base: "明",
    hint: "形容词",
    transforms: [
      { label: "名词(光)", answer: "光明" },
      { label: "动词(理解)", answer: "明白" },
      { label: "形容词(聪明)", answer: "聪明" },
    ],
  },
  {
    id: "c3",
    base: "动",
    hint: "动词",
    transforms: [
      { label: "名词(行为)", answer: "运动" },
      { label: "名词(物)", answer: "动物" },
      { label: "形容词", answer: "生动" },
    ],
  },
];

type Lang = "english" | "chinese";

export function WordMorphologyLab() {
  const [lang, setLang] = useState<Lang>("english");
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const questions = lang === "english" ? ENGLISH_QUESTIONS : CHINESE_QUESTIONS;
  const question = questions[qIdx];

  const handleInput = useCallback(
    (label: string, value: string) => {
      if (checked) return;
      setAnswers((prev) => ({ ...prev, [`${question.id}-${label}`]: value }));
    },
    [checked, question.id],
  );

  const handleCheck = useCallback(() => setChecked(true), []);

  const score = checked
    ? question.transforms.reduce((s, t) => {
        const userAns = (answers[`${question.id}-${t.label}`] || "").trim().toLowerCase();
        return s + (userAns === t.answer.toLowerCase() ? 1 : 0);
      }, 0)
    : 0;

  function nextQuestion() {
    setQIdx((i) => (i + 1) % questions.length);
    setChecked(false);
    setAnswers({});
  }

  function switchLang() {
    setLang((l) => (l === "english" ? "chinese" : "english"));
    setQIdx(0);
    setChecked(false);
    setAnswers({});
  }

  function reset() {
    setChecked(false);
    setAnswers({});
  }

  return (
    <DemoShell
      title="词形变化实验室"
      description="根据基础词，写出它的不同词性变化形式，掌握构词规律。"
      tags={["词汇", "构词法", "英语", "中文"]}
    >
      <div className="space-y-5">
        {/* Language toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={switchLang}
            className="demo-btn-outline inline-flex items-center gap-1.5 text-sm"
          >
            <Shuffle className="h-4 w-4" />
            {lang === "english" ? "切换到中文" : "Switch to English"}
          </button>
          <span className="text-xs text-text-muted">
            {qIdx + 1} / {questions.length}
          </span>
        </div>

        {/* Base word card */}
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-5 rounded-xl bg-primary/10 border border-primary/30"
        >
          <p className="text-xs text-text-muted mb-1">基础词 ({question.hint})</p>
          <p className="text-3xl font-bold tracking-wide">{question.base}</p>
        </motion.div>

        {/* Transform inputs */}
        <div className="space-y-3">
          {question.transforms.map((t) => {
            const key = `${question.id}-${t.label}`;
            const userAns = (answers[key] || "").trim().toLowerCase();
            const isCorrect = checked && userAns === t.answer.toLowerCase();
            const isWrong = checked && userAns !== t.answer.toLowerCase();

            return (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  isCorrect
                    ? "border-success/50 bg-success/5"
                    : isWrong
                      ? "border-error/50 bg-error/5"
                      : "border-border bg-surface-alt"
                }`}
              >
                <span className="text-sm font-medium text-text-muted w-24 shrink-0">
                  → {t.label}
                </span>
                <input
                  className="demo-input flex-1 text-sm"
                  placeholder={`写出${t.label}形式...`}
                  value={answers[key] || ""}
                  onChange={(e) => handleInput(t.label, e.target.value)}
                  disabled={checked}
                />
                {checked && (
                  <div className="flex items-center gap-2 shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-error" />
                        <span className="text-sm font-mono text-primary-light">{t.answer}</span>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Score */}
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-center"
            >
              <p className="text-lg font-bold">
                {score} / {question.transforms.length} 正确
              </p>
              <p className="text-sm text-text-muted mt-1">
                {score === question.transforms.length
                  ? "太棒了！完全掌握了这个词的变化形式！"
                  : "继续加油，多积累词形变化规律！"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {!checked ? (
            <button
              className="demo-btn inline-flex items-center gap-2 text-sm"
              onClick={handleCheck}
            >
              <CheckCircle className="h-4 w-4" />
              检查答案
            </button>
          ) : (
            <>
              <button
                className="demo-btn inline-flex items-center gap-2 text-sm"
                onClick={nextQuestion}
              >
                下一题 <ArrowRight className="h-4 w-4" />
              </button>
              <button
                className="demo-btn-outline inline-flex items-center gap-2 text-sm"
                onClick={reset}
              >
                <RotateCcw className="h-4 w-4" />
                重试
              </button>
            </>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
