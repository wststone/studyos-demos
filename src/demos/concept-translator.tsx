import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  RotateCcw,
  ArrowRight,
  ArrowRightLeft,
  Lightbulb,
} from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

type RepType = "text" | "formula" | "graph" | "code" | "analogy";

const REP_LABELS: Record<RepType, string> = {
  text: "📝 文字描述",
  formula: "📐 数学公式",
  graph: "📈 图表描述",
  code: "💻 代码",
  analogy: "🌍 现实类比",
};

interface Challenge {
  id: string;
  concept: string;
  subject: string;
  sourceType: RepType;
  sourceContent: string;
  targetType: RepType;
  targetHint: string;
  exampleAnswer: string;
}

const CHALLENGES: Challenge[] = [
  {
    id: "c1",
    concept: "指数增长",
    subject: "数学",
    sourceType: "text",
    sourceContent: "一个量按照固定比率不断增长，每经过一个周期，增长量本身也在增加——增长越来越快。",
    targetType: "formula",
    targetHint: "写出指数增长的一般数学表达式",
    exampleAnswer: "y = a · bˣ（其中 a 为初始值，b > 1 为增长率，x 为时间）",
  },
  {
    id: "c2",
    concept: "指数增长",
    subject: "数学",
    sourceType: "formula",
    sourceContent: "y = 2ˣ（x = 0 时 y = 1，x = 10 时 y = 1024）",
    targetType: "analogy",
    targetHint: "用一个生活中的例子来类比这个数学关系",
    exampleAnswer: "细菌每小时分裂一次：1个变2个、2个变4个、4个变8个……10小时后就有1024个。",
  },
  {
    id: "c3",
    concept: "牛顿第二定律",
    subject: "物理",
    sourceType: "formula",
    sourceContent: "F = m · a（力 = 质量 × 加速度）",
    targetType: "analogy",
    targetHint: "用日常生活中的体验来解释这个公式",
    exampleAnswer: "推超市购物车：空车很轻（m小），轻轻一推就加速快；装满商品后（m大），同样的力推起来加速慢多了。",
  },
  {
    id: "c4",
    concept: "牛顿第二定律",
    subject: "物理",
    sourceType: "analogy",
    sourceContent: "推超市购物车：空车轻轻一推就飞出去，满载时使劲推也走不快。",
    targetType: "text",
    targetHint: "用严谨的物理语言描述这个现象背后的规律",
    exampleAnswer: "物体的加速度与作用在它上面的合力成正比，与物体的质量成反比。质量越大的物体，产生相同加速度所需的力越大。",
  },
  {
    id: "c5",
    concept: "条件判断",
    subject: "信息技术",
    sourceType: "code",
    sourceContent: "if (score >= 90) grade = 'A'\nelse if (score >= 80) grade = 'B'\nelse if (score >= 60) grade = 'C'\nelse grade = 'F'",
    targetType: "text",
    targetHint: "用自然语言描述这段代码的逻辑",
    exampleAnswer: "根据分数划分等级：90分及以上为A，80-89分为B，60-79分为C，60分以下为F。",
  },
  {
    id: "c6",
    concept: "供需关系",
    subject: "经济",
    sourceType: "text",
    sourceContent: "当商品价格上升时，供给量增加但需求量减少；当价格下降时，供给量减少但需求量增加。价格最终会趋向供需平衡点。",
    targetType: "graph",
    targetHint: "描述供需曲线图的样子（坐标轴、两条线的走势、交点）",
    exampleAnswer: "横轴为数量Q，纵轴为价格P。需求曲线D从左上到右下（下降），供给曲线S从左下到右上（上升），两线交于均衡点E。",
  },
];

function checkAnswer(userAnswer: string, challenge: Challenge): { score: number; feedback: string } {
  const len = userAnswer.trim().length;
  if (len === 0) return { score: 0, feedback: "请写下你的翻译。" };

  // Simple heuristic scoring
  const keywords = challenge.exampleAnswer
    .replace(/[（）()，。、：——]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);

  const matchedKeywords = keywords.filter((kw) =>
    userAnswer.toLowerCase().includes(kw.toLowerCase()),
  );

  const ratio = keywords.length > 0 ? matchedKeywords.length / keywords.length : 0;

  if (ratio > 0.5 || len > 30) {
    return { score: 3, feedback: "很好！你的翻译准确地传达了概念的核心含义。" };
  } else if (ratio > 0.2 || len > 15) {
    return { score: 2, feedback: "基本正确，但可以更完整地表达概念的关键特征。" };
  } else {
    return { score: 1, feedback: "还需要更深入地理解这个概念，试着抓住核心特征。" };
  }
}

export function ConceptTranslator() {
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const challenge = CHALLENGES[challengeIdx];
  const result = submitted ? checkAnswer(answer, challenge) : null;

  const handleAnswer = useCallback(
    (val: string) => {
      if (!submitted) setAnswer(val);
    },
    [submitted],
  );

  function next() {
    setChallengeIdx((i) => (i + 1) % CHALLENGES.length);
    setAnswer("");
    setSubmitted(false);
    setShowExample(false);
  }

  function reset() {
    setAnswer("");
    setSubmitted(false);
    setShowExample(false);
  }

  return (
    <DemoShell
      title="概念翻译器"
      description="将同一个概念在文字、公式、图表、代码、类比之间自由转换。"
      tags={["跨模态", "深度理解", "多元表征", "AI评估"]}
    >
      <div className="space-y-5">
        {/* Challenge nav */}
        <div className="flex items-center gap-2 flex-wrap">
          <ArrowRightLeft className="h-4 w-4 text-primary-light shrink-0" />
          {CHALLENGES.map((c, i) => (
            <button
              key={c.id}
              onClick={() => {
                setChallengeIdx(i);
                setAnswer("");
                setSubmitted(false);
                setShowExample(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                challengeIdx === i
                  ? "bg-primary text-white"
                  : "bg-surface-alt text-text-muted hover:bg-surface-hover"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <span className="text-xs text-text-muted ml-1">{challenge.concept} · {challenge.subject}</span>
        </div>

        {/* Translation direction */}
        <div className="flex items-center gap-3 justify-center py-2">
          <span className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary-light text-sm font-medium">
            {REP_LABELS[challenge.sourceType]}
          </span>
          <ArrowRight className="h-5 w-5 text-text-muted" />
          <span className="px-3 py-1.5 rounded-lg bg-warning/20 text-warning text-sm font-medium">
            {REP_LABELS[challenge.targetType]}
          </span>
        </div>

        {/* Source content */}
        <motion.div
          key={challenge.id + "-src"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border border-primary/30 bg-primary/5 ${
            challenge.sourceType === "code" ? "font-mono" : ""
          }`}
        >
          <p className="text-xs text-text-muted mb-2">
            {REP_LABELS[challenge.sourceType]} · 源表征
          </p>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{challenge.sourceContent}</p>
        </motion.div>

        {/* Target input */}
        <div>
          <label className="text-xs font-semibold text-text-muted mb-1 block">
            {challenge.targetHint}
          </label>
          <textarea
            className={`demo-input w-full text-sm min-h-[100px] resize-y ${
              challenge.targetType === "code" || challenge.targetType === "formula"
                ? "font-mono"
                : ""
            }`}
            placeholder={`用 ${REP_LABELS[challenge.targetType].slice(2)} 来表达同一个概念...`}
            value={answer}
            onChange={(e) => handleAnswer(e.target.value)}
            disabled={submitted}
          />
        </div>

        {/* Result */}
        <AnimatePresence>
          {submitted && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-primary/30 bg-primary/10 p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-2 rounded-full ${
                        i < result.score ? "bg-primary" : "bg-surface-alt"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold">
                  {result.score === 3 ? "优秀" : result.score === 2 ? "良好" : "需改进"}
                </span>
              </div>
              <p className="text-sm text-text-muted">{result.feedback}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example answer */}
        <div>
          <button
            onClick={() => setShowExample(!showExample)}
            className="text-sm text-primary-light hover:underline flex items-center gap-1"
          >
            <Lightbulb className="h-4 w-4" />
            {showExample ? "隐藏参考答案" : "查看参考答案"}
          </button>
          <AnimatePresence>
            {showExample && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-4 rounded-lg bg-surface-alt border border-border">
                  <p className="text-sm text-text-muted whitespace-pre-wrap">
                    {challenge.exampleAnswer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {!submitted ? (
            <button
              className="demo-btn inline-flex items-center gap-2 text-sm"
              onClick={() => setSubmitted(true)}
              disabled={answer.trim().length < 3}
            >
              <CheckCircle className="h-4 w-4" />
              提交翻译
            </button>
          ) : (
            <>
              <button
                className="demo-btn inline-flex items-center gap-2 text-sm"
                onClick={next}
              >
                下一题 <ArrowRight className="h-4 w-4" />
              </button>
              <button
                className="demo-btn-outline inline-flex items-center gap-2 text-sm"
                onClick={reset}
              >
                <RotateCcw className="h-4 w-4" />
                重新翻译
              </button>
            </>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
