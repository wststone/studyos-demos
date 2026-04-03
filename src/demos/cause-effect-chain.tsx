import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  ArrowDown,
  CheckCircle,
  RotateCcw,
  Lightbulb,
  Link2,
} from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface ChainNode {
  id: string;
  text: string;
}

interface Scenario {
  id: string;
  title: string;
  subject: string;
  prompt: string;
  starterNodes: ChainNode[];
  exampleChain: string[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "s1",
    title: "工业革命的连锁反应",
    subject: "历史",
    prompt: "从蒸汽机的发明出发，构建它如何改变了世界的因果链。",
    starterNodes: [
      { id: "n1", text: "瓦特改良蒸汽机" },
      { id: "n2", text: "" },
      { id: "n3", text: "" },
    ],
    exampleChain: [
      "瓦特改良蒸汽机",
      "工厂不再依赖水力，可建在任何地方",
      "大量农村人口进入城市工厂工作",
      "城市化加速，贫民窟和公共卫生问题出现",
      "促使政府制定工厂法和公共卫生法",
    ],
  },
  {
    id: "s2",
    title: "温室效应的因果链",
    subject: "地理",
    prompt: "从化石燃料燃烧开始，分析温室效应的因果链。",
    starterNodes: [
      { id: "n1", text: "大量燃烧化石燃料" },
      { id: "n2", text: "" },
      { id: "n3", text: "" },
    ],
    exampleChain: [
      "大量燃烧化石燃料",
      "大气中CO₂浓度升高",
      "温室效应增强，全球平均气温上升",
      "极地冰川融化，海平面上升",
      "沿海低地被淹没，生态系统遭到破坏",
    ],
  },
  {
    id: "s3",
    title: "牛顿第三定律的应用",
    subject: "物理",
    prompt: "从火箭发射出发，分析作用力与反作用力的因果链。",
    starterNodes: [
      { id: "n1", text: "火箭燃料燃烧产生高温高压气体" },
      { id: "n2", text: "" },
      { id: "n3", text: "" },
    ],
    exampleChain: [
      "火箭燃料燃烧产生高温高压气体",
      "气体从喷嘴高速向下喷出（作用力）",
      "气体对火箭产生向上的反作用力（推力）",
      "推力大于火箭重力时，火箭加速上升",
      "火箭克服地球引力，进入预定轨道",
    ],
  },
  {
    id: "s4",
    title: "生态系统的食物链中断",
    subject: "生物",
    prompt: "如果草原上的狼被完全消灭，会发生什么？构建因果链。",
    starterNodes: [
      { id: "n1", text: "草原上的狼被完全消灭" },
      { id: "n2", text: "" },
      { id: "n3", text: "" },
    ],
    exampleChain: [
      "草原上的狼被完全消灭",
      "鹿等食草动物失去天敌，数量激增",
      "过度啃食导致草原植被退化",
      "水土流失加剧，土壤肥力下降",
      "生态系统失衡，生物多样性降低",
    ],
  },
];

let nextId = 100;

export function CauseEffectChain() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [nodes, setNodes] = useState<ChainNode[]>(() =>
    SCENARIOS[0].starterNodes.map((n) => ({ ...n })),
  );
  const [showExample, setShowExample] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const scenario = SCENARIOS[scenarioIdx];

  const updateNode = useCallback((id: string, text: string) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  }, []);

  const addNode = useCallback(() => {
    setNodes((prev) => [...prev, { id: `n${nextId++}`, text: "" }]);
  }, []);

  const removeNode = useCallback((id: string) => {
    setNodes((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  const filledCount = nodes.filter((n) => n.text.trim().length > 0).length;

  function switchScenario(idx: number) {
    setScenarioIdx(idx);
    setNodes(SCENARIOS[idx].starterNodes.map((n) => ({ ...n })));
    setShowExample(false);
    setSubmitted(false);
  }

  function reset() {
    setNodes(scenario.starterNodes.map((n) => ({ ...n })));
    setShowExample(false);
    setSubmitted(false);
  }

  return (
    <DemoShell
      title="因果链构建器"
      description="从一个起因出发，逐步推导后续事件，训练因果推理能力。"
      tags={["因果推理", "逻辑思维", "历史", "物理", "生物", "地理"]}
    >
      <div className="space-y-5">
        {/* Scenario selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link2 className="h-4 w-4 text-primary-light shrink-0" />
          {SCENARIOS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => switchScenario(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                scenarioIdx === i
                  ? "bg-primary text-white"
                  : "bg-surface-alt text-text-muted hover:bg-surface-hover"
              }`}
            >
              {s.subject}
            </button>
          ))}
        </div>

        {/* Prompt */}
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-primary/10 border border-primary/30"
        >
          <p className="text-xs text-text-muted mb-1">{scenario.subject} · {scenario.title}</p>
          <p className="text-sm font-medium">{scenario.prompt}</p>
        </motion.div>

        {/* Chain builder */}
        <div className="space-y-0">
          {nodes.map((node, idx) => (
            <div key={node.id}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  submitted
                    ? node.text.trim()
                      ? "border-success/50 bg-success/5"
                      : "border-warning/50 bg-warning/5"
                    : "border-border bg-surface-alt"
                }`}
              >
                {/* Node number */}
                <div className="flex flex-col items-center shrink-0">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0
                        ? "bg-primary text-white"
                        : "bg-surface-hover text-text-muted border border-border"
                    }`}
                  >
                    {idx + 1}
                  </span>
                </div>

                {/* Input */}
                <input
                  className="demo-input flex-1 text-sm"
                  placeholder={
                    idx === 0
                      ? "起因（初始事件）"
                      : `第 ${idx + 1} 步：由此导致...`
                  }
                  value={node.text}
                  onChange={(e) => updateNode(node.id, e.target.value)}
                  disabled={submitted}
                />

                {/* Delete button */}
                {nodes.length > 2 && !submitted && (
                  <button
                    onClick={() => removeNode(node.id)}
                    className="text-text-muted hover:text-error transition-colors shrink-0 mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </motion.div>

              {/* Arrow between nodes */}
              {idx < nodes.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-4 w-4 text-text-muted/50" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add node button */}
        {!submitted && (
          <button
            onClick={addNode}
            className="w-full py-2 rounded-lg border border-dashed border-border text-sm text-text-muted hover:border-primary/50 hover:text-primary-light transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            添加下一个环节
          </button>
        )}

        {/* Submitted feedback */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-center"
            >
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-lg font-bold">因果链已完成！</p>
              <p className="text-sm text-text-muted mt-1">
                共 {filledCount} 个环节
                {filledCount >= 4
                  ? "，推理链条完整！"
                  : "，试试能否推导出更多后续影响。"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example chain */}
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
                <div className="mt-2 p-4 rounded-lg bg-surface-alt border border-border space-y-2">
                  {scenario.exampleChain.map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs font-bold text-primary-light shrink-0 mt-0.5">
                        {i + 1}.
                      </span>
                      <p className="text-sm text-text-muted">{step}</p>
                    </div>
                  ))}
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
              disabled={filledCount < 2}
            >
              <CheckCircle className="h-4 w-4" />
              提交因果链
            </button>
          ) : (
            <button
              className="demo-btn-outline inline-flex items-center gap-2 text-sm"
              onClick={reset}
            >
              <RotateCcw className="h-4 w-4" />
              重新构建
            </button>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
