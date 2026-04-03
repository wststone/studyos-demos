import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  RotateCcw,
  Lightbulb,
  Search,
  ArrowRight,
} from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface Fragment {
  id: string;
  text: string;
  isBlank: boolean;
  answer: string;
  hint: string;
}

interface Artifact {
  id: string;
  title: string;
  subject: string;
  intro: string;
  fragments: Fragment[];
  source: string;
}

const ARTIFACTS: Artifact[] = [
  {
    id: "a1",
    title: "残损的实验报告",
    subject: "物理",
    intro: "一份关于自由落体实验的报告被水浸损，部分内容模糊不清。请根据上下文和物理知识还原缺失内容。",
    fragments: [
      { id: "f1", text: "实验目的：验证自由落体运动中，物体下落的加速度为", isBlank: false, answer: "", hint: "" },
      { id: "f2", text: "______", isBlank: true, answer: "9.8 m/s²", hint: "地球表面的重力加速度值" },
      { id: "f3", text: "，与物体的质量无关。\n\n实验器材：电磁打点计时器、铁架台、纸带、", isBlank: false, answer: "", hint: "" },
      { id: "f4", text: "______", isBlank: true, answer: "重锤", hint: "自由落体实验中被释放的物体" },
      { id: "f5", text: "、毫米刻度尺。\n\n实验结论：在误差允许范围内，自由落体运动是", isBlank: false, answer: "", hint: "" },
      { id: "f6", text: "______", isBlank: true, answer: "匀加速直线运动", hint: "加速度恒定的直线运动叫什么？" },
      { id: "f7", text: "，加速度约为 g。", isBlank: false, answer: "", hint: "" },
    ],
    source: "高中物理必修一·自由落体运动实验",
  },
  {
    id: "a2",
    title: "褪色的历史文献",
    subject: "历史",
    intro: "一份记录五四运动的文献因年代久远部分文字褪色。请根据历史知识还原关键信息。",
    fragments: [
      { id: "f1", text: "1919年5月4日，北京大学等校学生在天安门前集会，抗议", isBlank: false, answer: "", hint: "" },
      { id: "f2", text: "______", isBlank: true, answer: "巴黎和会", hint: "一战后在法国召开的和平会议" },
      { id: "f3", text: '上中国外交的失败。学生们提出的口号是\u201C外争国权，', isBlank: false, answer: "", hint: "" },
      { id: "f4", text: "______", isBlank: true, answer: "内除国贼", hint: '与\u201C外争国权\u201D对仗的口号' },
      { id: "f5", text: '\u201D。这场运动标志着中国', isBlank: false, answer: "", hint: "" },
      { id: "f6", text: "______", isBlank: true, answer: "新民主主义革命", hint: "区别于旧民主主义革命的新阶段" },
      { id: "f7", text: "的开端。", isBlank: false, answer: "", hint: "" },
    ],
    source: "中国近代史·五四运动",
  },
  {
    id: "a3",
    title: "破损的代码文件",
    subject: "信息技术",
    intro: "一段实现冒泡排序的代码文件部分损坏。请根据算法逻辑补全缺失代码。",
    fragments: [
      { id: "f1", text: "function bubbleSort(arr) {\n  for (let i = 0; i < arr.length - 1; i++) {\n    for (let j = 0; j < ", isBlank: false, answer: "", hint: "" },
      { id: "f2", text: "______", isBlank: true, answer: "arr.length - 1 - i", hint: "每轮排序后最后i个元素已有序" },
      { id: "f3", text: "; j++) {\n      if (arr[j] > arr[j + 1]) {\n        ", isBlank: false, answer: "", hint: "" },
      { id: "f4", text: "______", isBlank: true, answer: "[arr[j], arr[j+1]] = [arr[j+1], arr[j]]", hint: "交换两个相邻元素的值" },
      { id: "f5", text: ";\n      }\n    }\n  }\n  return ", isBlank: false, answer: "", hint: "" },
      { id: "f6", text: "______", isBlank: true, answer: "arr", hint: "函数应该返回排序后的什么？" },
      { id: "f7", text: ";\n}", isBlank: false, answer: "", hint: "" },
    ],
    source: "数据结构·排序算法",
  },
  {
    id: "a4",
    title: "模糊的生物笔记",
    subject: "生物",
    intro: "一份关于光合作用的课堂笔记被咖啡浸湿，部分内容无法辨认。请还原关键内容。",
    fragments: [
      { id: "f1", text: "光合作用的场所是", isBlank: false, answer: "", hint: "" },
      { id: "f2", text: "______", isBlank: true, answer: "叶绿体", hint: "含有叶绿素的细胞器" },
      { id: "f3", text: "。\n\n光反应阶段：在类囊体薄膜上进行，需要光照。水被分解为", isBlank: false, answer: "", hint: "" },
      { id: "f4", text: "______", isBlank: true, answer: "氧气和[H]", hint: "水的光解产物（两种）" },
      { id: "f5", text: "。\n\n暗反应阶段：在基质中进行，CO₂与C5结合生成", isBlank: false, answer: "", hint: "" },
      { id: "f6", text: "______", isBlank: true, answer: "C3", hint: "三碳化合物的简写" },
      { id: "f7", text: "，再被[H]还原为有机物。", isBlank: false, answer: "", hint: "" },
    ],
    source: "高中生物必修一·光合作用",
  },
];

export function KnowledgeArchaeology() {
  const [artifactIdx, setArtifactIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showHints, setShowHints] = useState<Set<string>>(new Set());

  const artifact = ARTIFACTS[artifactIdx];
  const blanks = artifact.fragments.filter((f) => f.isBlank);

  const updateAnswer = useCallback(
    (id: string, val: string) => {
      if (submitted) return;
      setAnswers((prev) => ({ ...prev, [id]: val }));
    },
    [submitted],
  );

  const toggleHint = useCallback((id: string) => {
    setShowHints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const results = blanks.map((b) => {
    const userAns = (answers[b.id] || "").trim();
    const correct = userAns.length > 0 && b.answer.toLowerCase().includes(userAns.toLowerCase());
    return { id: b.id, correct, answer: b.answer };
  });

  const correctCount = results.filter((r) => r.correct).length;

  function switchArtifact(idx: number) {
    setArtifactIdx(idx);
    setAnswers({});
    setSubmitted(false);
    setShowHints(new Set());
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
    setShowHints(new Set());
  }

  return (
    <DemoShell
      title="知识考古"
      description="像考古学家修复文物一样，根据上下文和知识推断缺失的内容。"
      tags={["推理还原", "上下文理解", "跨学科", "情境学习"]}
    >
      <div className="space-y-5">
        {/* Artifact selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <Search className="h-4 w-4 text-primary-light shrink-0" />
          {ARTIFACTS.map((a, i) => (
            <button
              key={a.id}
              onClick={() => switchArtifact(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                artifactIdx === i
                  ? "bg-primary text-white"
                  : "bg-surface-alt text-text-muted hover:bg-surface-hover"
              }`}
            >
              {a.subject}
            </button>
          ))}
        </div>

        {/* Intro */}
        <motion.div
          key={artifact.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-primary/10 border border-primary/30"
        >
          <p className="text-xs text-text-muted mb-1">
            📜 {artifact.subject} · {artifact.title}
          </p>
          <p className="text-sm">{artifact.intro}</p>
        </motion.div>

        {/* Document with blanks */}
        <div className="p-5 rounded-xl bg-surface-alt border border-border font-mono text-sm leading-relaxed whitespace-pre-wrap">
          {artifact.fragments.map((frag) => {
            if (!frag.isBlank) {
              return (
                <span key={frag.id} className="text-text">
                  {frag.text}
                </span>
              );
            }

            const result = submitted
              ? results.find((r) => r.id === frag.id)
              : null;

            return (
              <span key={frag.id} className="inline-flex flex-col items-start">
                <span className="relative inline-block">
                  <input
                    className={`inline-block w-48 px-2 py-0.5 rounded border text-sm font-mono transition-colors ${
                      submitted
                        ? result?.correct
                          ? "border-success bg-success/10 text-success"
                          : "border-error bg-error/10 text-error"
                        : "border-primary/50 bg-primary/5 text-text focus:border-primary"
                    }`}
                    placeholder="还原此处..."
                    value={answers[frag.id] || ""}
                    onChange={(e) => updateAnswer(frag.id, e.target.value)}
                    disabled={submitted}
                  />
                  {!submitted && (
                    <button
                      onClick={() => toggleHint(frag.id)}
                      className="ml-1 text-primary-light hover:text-primary"
                      title="提示"
                    >
                      <Lightbulb className="h-3.5 w-3.5 inline" />
                    </button>
                  )}
                </span>
                {showHints.has(frag.id) && !submitted && (
                  <span className="text-[10px] text-text-muted mt-0.5">
                    💡 {frag.hint}
                  </span>
                )}
                {submitted && !result?.correct && (
                  <span className="text-[10px] text-success mt-0.5">
                    ✓ {frag.answer}
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {/* Source */}
        <p className="text-[11px] text-text-muted text-right">
          —— 出处：{artifact.source}
        </p>

        {/* Result */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-center"
            >
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-lg font-bold">
                还原了 {correctCount}/{blanks.length} 处
              </p>
              <p className="text-sm text-text-muted mt-1">
                {correctCount === blanks.length
                  ? "完美修复！你的知识储备和推理能力都很强！"
                  : correctCount > blanks.length / 2
                    ? "修复了大部分内容，仔细看看上下文线索。"
                    : "这份文献损坏较严重，再多利用上下文推理试试。"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {!submitted ? (
            <button
              className="demo-btn inline-flex items-center gap-2 text-sm"
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(answers).length === 0}
            >
              <CheckCircle className="h-4 w-4" />
              提交还原
            </button>
          ) : (
            <>
              <button
                className="demo-btn inline-flex items-center gap-2 text-sm"
                onClick={() =>
                  switchArtifact((artifactIdx + 1) % ARTIFACTS.length)
                }
              >
                下一份文献 <ArrowRight className="h-4 w-4" />
              </button>
              <button
                className="demo-btn-outline inline-flex items-center gap-2 text-sm"
                onClick={reset}
              >
                <RotateCcw className="h-4 w-4" />
                重新修复
              </button>
            </>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
