import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, BarChart3, TrendingUp } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface DataQuestion {
  id: string;
  title: string;
  chart: { label: string; value: number; color: string }[];
  unit: string;
  questions: { q: string; options: string[]; answer: number }[];
}

const DATASETS: DataQuestion[] = [
  {
    id: "d1",
    title: "某班同学各科平均分",
    chart: [
      { label: "语文", value: 82, color: "bg-blue-500" },
      { label: "数学", value: 91, color: "bg-emerald-500" },
      { label: "英语", value: 78, color: "bg-amber-500" },
      { label: "物理", value: 85, color: "bg-purple-500" },
      { label: "化学", value: 88, color: "bg-rose-500" },
    ],
    unit: "分",
    questions: [
      { q: "哪科平均分最高？", options: ["语文", "数学", "化学", "物理"], answer: 1 },
      { q: "英语和数学的分差是多少？", options: ["10分", "13分", "9分", "15分"], answer: 1 },
      { q: "平均分超过85分的科目有几个？", options: ["1个", "2个", "3个", "4个"], answer: 1 },
    ],
  },
  {
    id: "d2",
    title: "某城市月平均气温 (°C)",
    chart: [
      { label: "1月", value: 2, color: "bg-blue-400" },
      { label: "3月", value: 11, color: "bg-cyan-400" },
      { label: "5月", value: 22, color: "bg-green-400" },
      { label: "7月", value: 33, color: "bg-orange-400" },
      { label: "9月", value: 24, color: "bg-yellow-400" },
      { label: "11月", value: 8, color: "bg-indigo-400" },
    ],
    unit: "°C",
    questions: [
      { q: "最热和最冷月份的温差是多少？", options: ["25°C", "31°C", "28°C", "33°C"], answer: 1 },
      { q: "气温开始下降是从哪个月？", options: ["5月", "7月", "9月", "11月"], answer: 2 },
      { q: "哪两个月温度最接近？", options: ["1月和11月", "3月和9月", "5月和9月", "3月和11月"], answer: 2 },
    ],
  },
  {
    id: "d3",
    title: "某农场各类作物种植面积 (亩)",
    chart: [
      { label: "水稻", value: 45, color: "bg-green-500" },
      { label: "小麦", value: 30, color: "bg-amber-500" },
      { label: "玉米", value: 25, color: "bg-yellow-500" },
      { label: "大豆", value: 15, color: "bg-lime-500" },
      { label: "蔬菜", value: 35, color: "bg-emerald-500" },
    ],
    unit: "亩",
    questions: [
      { q: "种植面积最大的作物是？", options: ["小麦", "水稻", "蔬菜", "玉米"], answer: 1 },
      { q: "大豆面积占水稻面积的百分之几？", options: ["25%", "30%", "约33%", "50%"], answer: 2 },
      { q: "总种植面积是多少亩？", options: ["140亩", "145亩", "150亩", "155亩"], answer: 2 },
    ],
  },
];

export function DataInterpretation() {
  const [dsIdx, setDsIdx] = useState(0);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);

  const dataset = DATASETS[dsIdx];
  const maxValue = Math.max(...dataset.chart.map((d) => d.value));

  const handleSelect = useCallback(
    (qIdx: number, optIdx: number) => {
      if (checked) return;
      setSelected((prev) => ({ ...prev, [qIdx]: optIdx }));
    },
    [checked],
  );

  const score = checked
    ? dataset.questions.reduce((s, q, i) => s + (selected[i] === q.answer ? 1 : 0), 0)
    : 0;

  function next() {
    setDsIdx((i) => (i + 1) % DATASETS.length);
    setSelected({});
    setChecked(false);
  }

  return (
    <DemoShell
      title="数据解读"
      description="观察图表数据，回答分析问题，培养数据素养。"
      tags={["数据分析", "图表", "数学", "地理"]}
    >
      <div className="space-y-6">
        {/* Dataset selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <BarChart3 className="h-4 w-4 text-primary-light" />
          {DATASETS.map((ds, i) => (
            <button
              key={ds.id}
              onClick={() => {
                setDsIdx(i);
                setSelected({});
                setChecked(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                dsIdx === i
                  ? "bg-primary text-white"
                  : "bg-surface-alt text-text-muted hover:bg-surface-hover"
              }`}
            >
              数据集 {i + 1}
            </button>
          ))}
        </div>

        {/* Chart title */}
        <div className="text-center">
          <h3 className="text-sm font-semibold flex items-center justify-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary-light" />
            {dataset.title}
          </h3>
        </div>

        {/* Bar chart */}
        <motion.div
          key={dataset.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-surface-alt p-5"
        >
          <div className="flex items-end gap-3 justify-center">
            {dataset.chart.map((bar, i) => {
              const height = (bar.value / maxValue) * 100;
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1 max-w-16">
                  <span className="text-xs font-mono font-bold">
                    {bar.value}
                    {dataset.unit}
                  </span>
                  <div className="w-full h-40 flex items-end">
                    <motion.div
                      className={`w-full rounded-t-md ${bar.color}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[11px] text-text-muted text-center leading-tight mt-1">
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Questions */}
        <div className="space-y-4">
          {dataset.questions.map((q, qIdx) => {
            const userChoice = selected[qIdx];
            const isCorrect = checked && userChoice === q.answer;
            const isWrong = checked && userChoice !== undefined && userChoice !== q.answer;

            return (
              <motion.div
                key={qIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIdx * 0.1 }}
                className={`p-4 rounded-lg border transition-colors ${
                  isCorrect
                    ? "border-success/50 bg-success/5"
                    : isWrong
                      ? "border-error/50 bg-error/5"
                      : "border-border bg-surface-alt"
                }`}
              >
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-xs font-bold text-primary-light shrink-0">
                    Q{qIdx + 1}
                  </span>
                  <p className="text-sm font-medium">{q.q}</p>
                  {checked && (
                    <div className="ml-auto shrink-0">
                      {isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-error" />
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userChoice === optIdx;
                    const isAnswer = checked && optIdx === q.answer;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelect(qIdx, optIdx)}
                        disabled={checked}
                        className={`px-3 py-2 text-sm rounded-lg border transition-all text-left ${
                          isAnswer
                            ? "border-success bg-success/10 text-success font-semibold"
                            : isSelected && isWrong
                              ? "border-error bg-error/10 text-error"
                              : isSelected
                                ? "border-primary bg-primary/10 text-primary-light"
                                : "border-border hover:border-primary/30 hover:bg-surface-hover"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
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
                {score} / {dataset.questions.length} 正确
              </p>
              <p className="text-sm text-text-muted mt-1">
                {score === dataset.questions.length
                  ? "数据分析能力很强！"
                  : "仔细观察图表中的数据关系！"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {!checked ? (
            <button
              className="demo-btn inline-flex items-center gap-2 text-sm"
              onClick={() => setChecked(true)}
              disabled={Object.keys(selected).length < dataset.questions.length}
            >
              <CheckCircle className="h-4 w-4" />
              检查答案
            </button>
          ) : (
            <button
              className="demo-btn inline-flex items-center gap-2 text-sm"
              onClick={next}
            >
              下一组 <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
