import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Brain,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { DemoShell } from "@/components/demo-shell";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  misconceptionType?: string;
  misconceptionLabel?: string;
  explanation: string;
}

interface Question {
  id: number;
  subject: string;
  question: string;
  options: Option[];
  correctExplanation: string;
  visualType: "earth-tilt" | "circuit" | "evolution";
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    subject: "物理",
    question: "为什么夏天比冬天热？",
    correctExplanation:
      "夏天热是因为地球自转轴倾斜约23.5度。夏季时，你所在的半球朝向太阳倾斜，阳光以更大的角度照射地面，单位面积接收更多能量，且白昼更长。",
    visualType: "earth-tilt",
    options: [
      {
        id: "a",
        text: "地球自转轴倾斜，夏季时阳光照射角度更直，能量更集中",
        isCorrect: true,
        explanation:
          "正确！地轴倾斜23.5度导致不同季节阳光入射角不同，夏季阳光更直射，单位面积获得更多热量。",
      },
      {
        id: "b",
        text: "夏天地球离太阳更近",
        isCorrect: false,
        misconceptionType: "距离误区",
        misconceptionLabel: "distance",
        explanation:
          "这是常见的距离误区。实际上北半球夏天时地球反而离太阳更远（远日点在7月）。南北半球季节相反也证明距离不是原因。",
      },
      {
        id: "c",
        text: "太阳在夏天释放更多热量",
        isCorrect: false,
        misconceptionType: "热源误区",
        misconceptionLabel: "source",
        explanation:
          "这是热源误区。太阳的能量输出非常稳定，四季变化与太阳本身的热量变化无关，而是与地球接收方式有关。",
      },
      {
        id: "d",
        text: "大气层在夏天更薄，挡住的热量更少",
        isCorrect: false,
        misconceptionType: "介质误区",
        misconceptionLabel: "medium",
        explanation:
          "这是介质误区。大气层厚度不会随季节显著变化。季节温度差异的根本原因是太阳光入射角度的变化。",
      },
    ],
  },
  {
    id: 2,
    subject: "物理",
    question: "在一个简单电路中，电流通过灯泡后会怎样？",
    correctExplanation:
      "电流在整个串联电路中是相同的。电流不会被灯泡「消耗」，灯泡消耗的是电能（转化为光和热），但电流（电荷流动）在电路各处相等。",
    visualType: "circuit",
    options: [
      {
        id: "a",
        text: "电流在电路各处相同，灯泡只消耗电能而非电流",
        isCorrect: true,
        explanation:
          "正确！根据基尔霍夫电流定律，串联电路中电流处处相等。灯泡将电能转化为光能和热能，但电流本身不会减少。",
      },
      {
        id: "b",
        text: "电流通过灯泡后会变小，因为被灯泡消耗了一部分",
        isCorrect: false,
        misconceptionType: "消耗模型误区",
        misconceptionLabel: "consumption",
        explanation:
          "这是经典的「电流消耗」误区。电流不会被消耗，灯泡消耗的是电能。你可以把电流想象成传送带上的工人，他们搬运能量但自己不会消失。",
      },
      {
        id: "c",
        text: "电流会变快，因为通过灯泡时被加速了",
        isCorrect: false,
        misconceptionType: "加速模型误区",
        misconceptionLabel: "acceleration",
        explanation:
          "这是加速模型误区。灯泡的电阻实际上阻碍电流流动，不会加速电流。在稳态下，电路中各处电流速率是均匀的。",
      },
      {
        id: "d",
        text: "电流全部被灯泡吸收，不会继续流到后面的电路",
        isCorrect: false,
        misconceptionType: "终点模型误区",
        misconceptionLabel: "sink",
        explanation:
          "这是终点模型误区。如果电流到灯泡就停了，电路就断开了，灯泡根本不会亮。电流必须形成完整回路才能持续流动。",
      },
    ],
  },
  {
    id: 3,
    subject: "生物",
    question: "关于进化论，以下哪个说法是正确的？",
    correctExplanation:
      "进化是种群层面的变化，通过自然选择，适应环境的个体更可能存活并繁殖，其基因在种群中比例逐渐增加。个体本身不会「进化」。",
    visualType: "evolution",
    options: [
      {
        id: "a",
        text: "自然选择使适应环境的特征在种群中逐渐增多",
        isCorrect: true,
        explanation:
          "正确！进化通过自然选择作用于种群：拥有有利变异的个体更可能存活繁殖，使这些特征在后代中比例增加。",
      },
      {
        id: "b",
        text: "长颈鹿的脖子是因为不断伸长而逐渐变长的",
        isCorrect: false,
        misconceptionType: "拉马克误区",
        misconceptionLabel: "lamarck",
        explanation:
          "这是拉马克（用进废退）误区。后天获得的特征不会遗传。长颈鹿脖子长是因为基因变异中脖子较长的个体更能获取食物，存活率更高。",
      },
      {
        id: "c",
        text: "进化的目标是让物种变得越来越完美",
        isCorrect: false,
        misconceptionType: "目的论误区",
        misconceptionLabel: "teleology",
        explanation:
          "这是目的论误区。进化没有方向和目标，不追求「完美」。它只是适应当前环境的过程，环境变了，之前的「优势」可能变成劣势。",
      },
      {
        id: "d",
        text: "人类是从现代猿猴进化来的",
        isCorrect: false,
        misconceptionType: "线性进化误区",
        misconceptionLabel: "linear",
        explanation:
          "这是线性进化误区。人类和现代猿猴是从共同祖先分化而来，是「表亲」关系而非「祖孙」关系。进化是树状分支，不是线性阶梯。",
      },
    ],
  },
];

const MISCONCEPTION_COLORS: Record<string, string> = {
  distance: "#ef4444",
  source: "#f59e0b",
  medium: "#8b5cf6",
  consumption: "#ef4444",
  acceleration: "#f59e0b",
  sink: "#8b5cf6",
  lamarck: "#ef4444",
  teleology: "#f59e0b",
  linear: "#8b5cf6",
};

function EarthTiltVisual() {
  return (
    <div className="flex items-center justify-center gap-8 py-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)]" />
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-text-muted">太阳</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <svg width="60" height="8" className="text-primary-light">
          <line x1="0" y1="4" x2="50" y2="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
          <polygon points="50,0 60,4 50,8" fill="currentColor" />
        </svg>
        <span className="text-[10px] text-text-muted">阳光</span>
      </div>
      <div className="relative">
        <div
          className="w-14 h-14 rounded-full bg-blue-500 border-2 border-blue-400"
          style={{ background: "linear-gradient(135deg, #3b82f6 50%, #1e3a5f 50%)" }}
        />
        <div
          className="absolute -top-3 left-1/2 w-0.5 h-20 bg-text-muted origin-bottom"
          style={{ transform: "translateX(-50%) rotate(-23.5deg)" }}
        />
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-warning whitespace-nowrap">
          倾斜 23.5°
        </span>
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-text-muted">地球</span>
      </div>
    </div>
  );
}

function CircuitVisual() {
  return (
    <div className="flex items-center justify-center py-4">
      <svg width="220" height="100" viewBox="0 0 220 100">
        <rect x="10" y="10" width="200" height="80" rx="8" fill="none" stroke="#6366f1" strokeWidth="2" />
        <rect x="85" y="2" width="50" height="16" rx="4" fill="#3b3b52" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="110" y="13" textAnchor="middle" fill="#f59e0b" fontSize="8">电池</text>
        <circle cx="110" cy="90" r="12" fill="#3b3b52" stroke="#22c55e" strokeWidth="1.5" />
        <text x="110" y="93" textAnchor="middle" fill="#22c55e" fontSize="7">灯泡</text>
        {/* Current arrows */}
        <polygon points="45,15 55,10 55,20" fill="#818cf8" />
        <polygon points="175,15 165,10 165,20" fill="#818cf8" />
        <polygon points="15,55 10,45 20,45" fill="#818cf8" />
        <polygon points="205,55 210,65 200,65" fill="#818cf8" />
        <text x="35" y="40" fill="#818cf8" fontSize="7">电流相同</text>
        <text x="160" y="40" fill="#818cf8" fontSize="7">电流相同</text>
      </svg>
    </div>
  );
}

function EvolutionVisual() {
  return (
    <div className="flex items-center justify-center py-4">
      <svg width="200" height="100" viewBox="0 0 200 100">
        <line x1="100" y1="90" x2="100" y2="50" stroke="#6366f1" strokeWidth="2" />
        <line x1="100" y1="50" x2="50" y2="15" stroke="#6366f1" strokeWidth="2" />
        <line x1="100" y1="50" x2="150" y2="15" stroke="#6366f1" strokeWidth="2" />
        <circle cx="100" cy="90" r="5" fill="#f59e0b" />
        <circle cx="50" cy="15" r="5" fill="#22c55e" />
        <circle cx="150" cy="15" r="5" fill="#22c55e" />
        <text x="100" y="103" textAnchor="middle" fill="#f59e0b" fontSize="8">共同祖先</text>
        <text x="50" y="8" textAnchor="middle" fill="#22c55e" fontSize="8">人类</text>
        <text x="150" y="8" textAnchor="middle" fill="#22c55e" fontSize="8">现代猿</text>
      </svg>
    </div>
  );
}

const VISUAL_MAP: Record<string, () => React.ReactElement> = {
  "earth-tilt": EarthTiltVisual,
  circuit: CircuitVisual,
  evolution: EvolutionVisual,
};

export function MisconceptionDetector() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [misconceptions, setMisconceptions] = useState<string[]>([]);
  const [history, setHistory] = useState<Array<{ qId: number; correct: boolean; misconception?: string }>>([]);
  const [showSummary, setShowSummary] = useState(false);

  const question = QUESTIONS[currentQ];

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    let correctCount = 0;
    for (const h of history) {
      if (h.correct) {
        correctCount++;
      } else if (h.misconception) {
        counts[h.misconception] = (counts[h.misconception] || 0) + 1;
      }
    }
    const data = [];
    if (correctCount > 0) data.push({ name: "正确", value: correctCount, color: "#22c55e" });
    for (const [key, val] of Object.entries(counts)) {
      const q = QUESTIONS.flatMap((q) => q.options).find(
        (o) => o.misconceptionLabel === key,
      );
      data.push({
        name: q?.misconceptionType ?? key,
        value: val,
        color: MISCONCEPTION_COLORS[key] ?? "#6366f1",
      });
    }
    return data;
  }, [history]);

  function handleSelect(optionId: string) {
    if (answered) return;
    setSelectedOption(optionId);
    setAnswered(true);

    const opt = question.options.find((o) => o.id === optionId);
    if (opt) {
      if (!opt.isCorrect && opt.misconceptionLabel) {
        setMisconceptions((prev) => [...prev, opt.misconceptionLabel!]);
      }
      setHistory((prev) => [
        ...prev,
        {
          qId: question.id,
          correct: opt.isCorrect,
          misconception: opt.misconceptionLabel,
        },
      ]);
    }
  }

  function handleNext() {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setShowSummary(true);
    }
  }

  function handleReset() {
    setCurrentQ(0);
    setSelectedOption(null);
    setAnswered(false);
    setMisconceptions([]);
    setHistory([]);
    setShowSummary(false);
  }

  const VisualComponent = VISUAL_MAP[question.visualType];

  if (showSummary) {
    const correctCount = history.filter((h) => h.correct).length;
    return (
      <DemoShell
        title="认知误区检测器"
        description="识别并纠正常见学习误区，追踪你的认知偏差模式。"
        tags={["元认知", "物理", "生物", "误区纠正"]}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <Brain className="h-10 w-10 text-primary-light mx-auto mb-3" />
            <h2 className="text-xl font-bold">认知偏差分析报告</h2>
            <p className="text-text-muted mt-1">
              正确 {correctCount} / {QUESTIONS.length} 题
            </p>
          </div>

          {pieData.length > 0 && (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={35}
                    dataKey="value"
                    label={// eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ((props: any) =>
                      `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                    ) as any}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#252538",
                      border: "1px solid #3b3b52",
                      borderRadius: "0.5rem",
                      color: "#e2e2f0",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">逐题回顾</h3>
            {history.map((h, i) => {
              const q = QUESTIONS.find((q) => q.id === h.qId)!;
              return (
                <div
                  key={i}
                  className={`rounded-lg border p-3 text-sm ${
                    h.correct
                      ? "border-success/30 bg-success/5"
                      : "border-error/30 bg-error/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {h.correct ? (
                      <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-error shrink-0" />
                    )}
                    <span className="font-medium">{q.question}</span>
                  </div>
                  {!h.correct && h.misconception && (
                    <p className="mt-1 ml-6 text-text-muted">
                      误区类型：
                      {q.options.find((o) => o.misconceptionLabel === h.misconception)?.misconceptionType}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {misconceptions.length > 0 && (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-warning">需要关注的误区模式</span>
              </div>
              <ul className="text-sm text-text-muted space-y-1 ml-6 list-disc">
                {[...new Set(misconceptions)].map((m) => {
                  const opt = QUESTIONS.flatMap((q) => q.options).find(
                    (o) => o.misconceptionLabel === m,
                  );
                  return <li key={m}>{opt?.misconceptionType ?? m}</li>;
                })}
              </ul>
            </div>
          )}

          <button
            type="button"
            className="demo-btn inline-flex items-center gap-2"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
            重新测试
          </button>
        </motion.div>
      </DemoShell>
    );
  }

  return (
    <DemoShell
      title="认知误区检测器"
      description="识别并纠正常见学习误区，追踪你的认知偏差模式。"
      tags={["元认知", "物理", "生物", "误区纠正"]}
    >
      {/* Progress */}
      <div className="flex items-center gap-2 mb-5">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < currentQ
                ? "bg-primary"
                : i === currentQ
                  ? "bg-primary-light"
                  : "bg-border"
            }`}
          />
        ))}
        <span className="text-xs text-text-muted ml-2">
          {currentQ + 1}/{QUESTIONS.length}
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="space-y-4"
        >
          <div>
            <span className="demo-tag mb-2">{question.subject}</span>
            <h2 className="text-lg font-bold mt-2">{question.question}</h2>
          </div>

          <div className="space-y-2">
            {question.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              let borderClass = "border-border";
              if (answered) {
                if (opt.isCorrect) borderClass = "border-success bg-success/5";
                else if (isSelected) borderClass = "border-error bg-error/5";
              } else if (isSelected) {
                borderClass = "border-primary";
              }

              return (
                <motion.button
                  key={opt.id}
                  type="button"
                  whileHover={answered ? {} : { scale: 1.01 }}
                  whileTap={answered ? {} : { scale: 0.99 }}
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${borderClass}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium">
                      {opt.id.toUpperCase()}
                    </span>
                    <span className="text-sm">{opt.text}</span>
                    {answered && opt.isCorrect && (
                      <CheckCircle className="h-4 w-4 text-success shrink-0 ml-auto mt-0.5" />
                    )}
                    {answered && isSelected && !opt.isCorrect && (
                      <XCircle className="h-4 w-4 text-error shrink-0 ml-auto mt-0.5" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {answered && selectedOption && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {(() => {
                  const opt = question.options.find((o) => o.id === selectedOption)!;
                  return (
                    <div className="space-y-3">
                      <div
                        className={`rounded-lg p-4 text-sm ${
                          opt.isCorrect ? "bg-success/10" : "bg-error/10"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {opt.isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-error" />
                          )}
                          <span className="font-medium">
                            {opt.isCorrect
                              ? "回答正确！"
                              : `误区识别：${opt.misconceptionType}`}
                          </span>
                        </div>
                        <p className="text-text-muted">{opt.explanation}</p>
                      </div>

                      {/* Visual explanation */}
                      <div className="rounded-lg border border-border bg-surface-alt p-3">
                        <p className="text-xs text-text-muted mb-1">图解说明</p>
                        {VisualComponent && <VisualComponent />}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next button */}
          {answered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button
                type="button"
                className="demo-btn inline-flex items-center gap-2"
                onClick={handleNext}
              >
                {currentQ < QUESTIONS.length - 1 ? (
                  <>
                    下一题 <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    查看分析报告 <Brain className="h-4 w-4" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </DemoShell>
  );
}
