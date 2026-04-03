import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  FileText,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface LabTemplate {
  id: string;
  title: string;
  subject: string;
  sections: {
    label: string;
    placeholder: string;
    hint: string;
    example: string;
  }[];
}

const TEMPLATES: LabTemplate[] = [
  {
    id: "t1",
    title: "探究弹簧的弹力与伸长量的关系",
    subject: "物理",
    sections: [
      {
        label: "实验目的",
        placeholder: "写出本实验要验证的结论...",
        hint: "明确要探究的物理量之间的关系",
        example: "验证在弹性限度内，弹簧弹力与弹簧伸长量成正比（胡克定律）。",
      },
      {
        label: "实验器材",
        placeholder: "列出所有使用的器材...",
        hint: "包括测量工具和被测物体",
        example: "弹簧、刻度尺、钩码（若干）、铁架台、记录表。",
      },
      {
        label: "实验步骤",
        placeholder: "按顺序写出操作步骤...",
        hint: "步骤应清晰、可复现",
        example:
          "1. 将弹簧悬挂于铁架台上，记录自然长度L₀\n2. 依次挂上1、2、3、4、5个钩码\n3. 每次记录弹簧总长度L\n4. 计算伸长量ΔL = L - L₀\n5. 记录对应弹力F = mg",
      },
      {
        label: "数据记录",
        placeholder: "填写实验数据...",
        hint: "可以用表格形式记录",
        example:
          "钩码数: 1  2  3  4  5\n弹力F(N): 1.0  2.0  3.0  4.0  5.0\n伸长量ΔL(cm): 2.0  4.1  5.9  8.0  10.1",
      },
      {
        label: "结论与分析",
        placeholder: "根据数据得出结论...",
        hint: "分析数据规律，是否验证了假设",
        example:
          "数据表明弹力与伸长量近似成正比关系，F/ΔL ≈ 0.5 N/cm，验证了胡克定律。误差可能来源于读数和弹簧本身的非理想性。",
      },
    ],
  },
  {
    id: "t2",
    title: "探究酸碱中和反应",
    subject: "化学",
    sections: [
      {
        label: "实验目的",
        placeholder: "写出本实验要验证的结论...",
        hint: "关注反应类型和反应现象",
        example: "观察酸碱中和反应过程，理解酸和碱反应生成盐和水的规律。",
      },
      {
        label: "实验器材",
        placeholder: "列出所有使用的器材和试剂...",
        hint: "分别列出器材和药品",
        example:
          "烧杯、滴管、玻璃棒、酚酞指示剂、稀盐酸(HCl)、氢氧化钠溶液(NaOH)、pH试纸。",
      },
      {
        label: "实验步骤",
        placeholder: "按顺序写出操作步骤...",
        hint: "注意安全操作",
        example:
          "1. 取10mL NaOH溶液于烧杯中\n2. 滴入2-3滴酚酞，溶液变红\n3. 用滴管逐滴加入稀盐酸，边加边搅拌\n4. 观察颜色变化\n5. 当溶液恰好变无色时停止\n6. 用pH试纸测终点pH值",
      },
      {
        label: "数据记录",
        placeholder: "记录实验现象...",
        hint: "描述颜色、温度等变化",
        example:
          "初始：溶液呈红色（碱性）\n滴加过程：红色逐渐变浅\n终点：溶液变为无色，pH≈7\n温度：溶液温度略有升高",
      },
      {
        label: "结论与分析",
        placeholder: "根据现象得出结论...",
        hint: "写出化学方程式和规律总结",
        example:
          "HCl + NaOH → NaCl + H₂O\n酸碱中和反应是放热反应，酚酞由红变无色说明溶液由碱性变为中性。",
      },
    ],
  },
  {
    id: "t3",
    title: "观察植物细胞的有丝分裂",
    subject: "生物",
    sections: [
      {
        label: "实验目的",
        placeholder: "写出本实验要观察的内容...",
        hint: "明确观察对象和目标",
        example: "观察洋葱根尖细胞有丝分裂各时期的特征，理解细胞分裂过程。",
      },
      {
        label: "实验器材",
        placeholder: "列出器材和试剂...",
        hint: "包括染色剂和观察工具",
        example:
          "洋葱根尖、显微镜、载玻片、盖玻片、龙胆紫（或醋酸洋红）、盐酸、酒精灯、镊子。",
      },
      {
        label: "实验步骤",
        placeholder: "写出制片和观察步骤...",
        hint: "制片→染色→观察",
        example:
          "1. 取洋葱根尖2-3mm\n2. 用盐酸解离15分钟\n3. 清水漂洗\n4. 龙胆紫染色5分钟\n5. 制作压片\n6. 低倍镜找到分裂区\n7. 高倍镜观察各时期",
      },
      {
        label: "数据记录",
        placeholder: "记录观察到的各期特征...",
        hint: "画出或描述各时期的细胞形态",
        example:
          "前期：染色质凝缩为染色体，核膜消失\n中期：染色体排列在赤道板\n后期：着丝点分裂，染色体移向两极\n末期：核膜重建，细胞板形成",
      },
      {
        label: "结论与分析",
        placeholder: "总结观察结果...",
        hint: "各期比例和细胞分裂规律",
        example:
          "间期细胞数量最多（约占80%），说明间期时间最长。有丝分裂保证了子细胞与母细胞遗传信息的一致性。",
      },
    ],
  },
];

export function LabReportBuilder() {
  const [templateIdx, setTemplateIdx] = useState(0);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const template = TEMPLATES[templateIdx];

  const handleInput = useCallback(
    (label: string, value: string) => {
      setInputs((prev) => ({ ...prev, [`${template.id}-${label}`]: value }));
    },
    [template.id],
  );

  const toggleHint = useCallback((label: string) => {
    setExpandedHints((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const filledCount = template.sections.filter(
    (s) => (inputs[`${template.id}-${s.label}`] || "").trim().length > 0,
  ).length;

  function submit() {
    setSubmitted(true);
  }

  function reset() {
    setInputs({});
    setSubmitted(false);
    setExpandedHints({});
  }

  function next() {
    setTemplateIdx((i) => (i + 1) % TEMPLATES.length);
    setInputs({});
    setSubmitted(false);
    setExpandedHints({});
  }

  return (
    <DemoShell
      title="实验报告生成器"
      description="按照科学实验报告的标准格式，逐步填写实验内容。"
      tags={["实验报告", "科学方法", "物理", "化学", "生物"]}
    >
      <div className="space-y-5">
        {/* Template selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <FlaskConical className="h-4 w-4 text-primary-light" />
          {TEMPLATES.map((t, i) => (
            <button
              key={t.id}
              onClick={() => {
                setTemplateIdx(i);
                setSubmitted(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                templateIdx === i
                  ? "bg-primary text-white"
                  : "bg-surface-alt text-text-muted hover:bg-surface-hover"
              }`}
            >
              {t.subject}
            </button>
          ))}
        </div>

        {/* Experiment title */}
        <motion.div
          key={template.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30"
        >
          <FileText className="h-5 w-5 text-primary-light shrink-0" />
          <div>
            <p className="text-xs text-text-muted">{template.subject}实验</p>
            <p className="text-sm font-semibold">{template.title}</p>
          </div>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-surface-alt overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${(filledCount / template.sections.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs text-text-muted">
            {filledCount}/{template.sections.length}
          </span>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {template.sections.map((section, idx) => {
            const key = `${template.id}-${section.label}`;
            const value = inputs[key] || "";
            const isFilled = value.trim().length > 0;
            const showHint = expandedHints[section.label];

            return (
              <motion.div
                key={section.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-lg border p-4 transition-colors ${
                  submitted
                    ? isFilled
                      ? "border-success/50 bg-success/5"
                      : "border-warning/50 bg-warning/5"
                    : "border-border bg-surface-alt"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-light text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    {section.label}
                  </label>
                  <button
                    onClick={() => toggleHint(section.label)}
                    className="text-xs text-primary-light hover:underline flex items-center gap-1"
                  >
                    {showHint ? (
                      <>
                        收起提示 <ChevronUp className="h-3 w-3" />
                      </>
                    ) : (
                      <>
                        查看提示 <ChevronDown className="h-3 w-3" />
                      </>
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="text-xs text-text-muted mb-2 p-2 rounded bg-surface-hover border border-border">
                        <p className="font-medium mb-1">提示：{section.hint}</p>
                        <p className="text-text-muted/70 whitespace-pre-wrap">
                          示例：{section.example}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <textarea
                  className="demo-input w-full text-sm min-h-[80px] resize-y"
                  placeholder={section.placeholder}
                  value={value}
                  onChange={(e) => handleInput(section.label, e.target.value)}
                  disabled={submitted}
                />
                {submitted && !isFilled && (
                  <p className="text-xs text-warning mt-1">此部分未填写</p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Submitted summary */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-center"
            >
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-lg font-bold">实验报告已提交！</p>
              <p className="text-sm text-text-muted mt-1">
                完成 {filledCount}/{template.sections.length} 个部分
                {filledCount === template.sections.length
                  ? "，报告结构完整！"
                  : "，建议补充未填写的部分。"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {!submitted ? (
            <button
              className="demo-btn inline-flex items-center gap-2 text-sm"
              onClick={submit}
              disabled={filledCount === 0}
            >
              <CheckCircle className="h-4 w-4" />
              提交报告
            </button>
          ) : (
            <>
              <button
                className="demo-btn inline-flex items-center gap-2 text-sm"
                onClick={next}
              >
                下一个实验 <ArrowRight className="h-4 w-4" />
              </button>
              <button
                className="demo-btn-outline inline-flex items-center gap-2 text-sm"
                onClick={reset}
              >
                <RotateCcw className="h-4 w-4" />
                重新填写
              </button>
            </>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
