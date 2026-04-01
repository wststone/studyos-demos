import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  RotateCcw,
  ChevronRight,
  MapPin,
  Circle,
} from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface Choice {
  id: string;
  label: string;
  nextStageId: string;
}

interface Stage {
  id: string;
  title: string;
  description: string;
  choices: Choice[];
}

const STAGES: Stage[] = [
  {
    id: "start",
    title: "创业抉择",
    description:
      "你是一家科技初创公司的CEO。公司开发了一款AI教育产品，刚获得种子轮融资500万。产品已有1000个测试用户，反馈不错但留存率只有30%。现在你面临一个关键决策：",
    choices: [
      {
        id: "s-a",
        label: "全力优化产品，提高留存率后再推广",
        nextStageId: "optimize",
      },
      {
        id: "s-b",
        label: "大规模市场推广，快速获取用户",
        nextStageId: "marketing",
      },
      {
        id: "s-c",
        label: "寻求与教育机构合作，走B2B路线",
        nextStageId: "b2b",
      },
    ],
  },
  {
    id: "optimize",
    title: "产品优化成效",
    description:
      "经过3个月的迭代，留存率提高到55%。但市场上出现了一个强劲竞争对手，融资了2000万，正在快速抢占市场。你的资金还能支撑8个月。",
    choices: [
      {
        id: "o-a",
        label: "加速融资A轮，用资本对抗竞争",
        nextStageId: "end-fundraise",
      },
      {
        id: "o-b",
        label: "差异化定位，专注细分市场",
        nextStageId: "end-niche",
      },
      {
        id: "o-c",
        label: "考虑与竞争对手合并",
        nextStageId: "end-merge",
      },
    ],
  },
  {
    id: "marketing",
    title: "推广的后果",
    description:
      "大规模推广后用户量增长到5万，但留存率降到15%，获客成本很高。投资人开始质疑烧钱速度。团队压力很大，两位核心工程师提出想离开。",
    choices: [
      {
        id: "m-a",
        label: "紧急刹车，回归产品打磨",
        nextStageId: "end-pivot-back",
      },
      {
        id: "m-b",
        label: "调整推广策略，精细化运营留住用户",
        nextStageId: "end-refine-marketing",
      },
      {
        id: "m-c",
        label: "挽留团队为先，暂停扩张稳定军心",
        nextStageId: "end-team-first",
      },
    ],
  },
  {
    id: "b2b",
    title: "B2B合作进展",
    description:
      "你联系了多家教育机构，其中一家大型培训集团有意合作，但要求你深度定制产品以满足他们的需求，这可能要占用团队80%的资源。同时另外有3家小型学校愿意以标准版本合作。",
    choices: [
      {
        id: "b-a",
        label: "与大型集团深度合作，赌一个大客户",
        nextStageId: "end-big-client",
      },
      {
        id: "b-b",
        label: "选择多个小客户，保持产品标准化",
        nextStageId: "end-multi-client",
      },
      {
        id: "b-c",
        label: "两边都接，快速扩充团队",
        nextStageId: "end-expand-team",
      },
    ],
  },
  // Terminal stages
  {
    id: "end-fundraise",
    title: "结局：资本竞赛",
    description:
      "凭借55%的高留存数据，你成功融到A轮1500万。虽然竞对也在扩张，但你的产品质量优势逐渐转化为口碑，6个月后市场份额稳步增长。投资人对你的耐心和判断力非常认可。",
    choices: [],
  },
  {
    id: "end-niche",
    title: "结局：细分王者",
    description:
      "你专注于K12数学教育这个细分领域，留存率提升至70%。虽然公司规模不大，但盈利能力很强，成为了细分市场的领导者。竞争对手虽然融资多，但产品广而不精，最终用户逐渐流失。",
    choices: [],
  },
  {
    id: "end-merge",
    title: "结局：强强联合",
    description:
      "经过谈判，你以技术合伙人的身份加入对方公司，合并后的新公司获得3000万融资。虽然失去了独立CEO的身份，但你的产品触达了更多用户，实现了更大的教育影响力。",
    choices: [],
  },
  {
    id: "end-pivot-back",
    title: "结局：浴火重生",
    description:
      "紧急收缩后资金紧张，但留下的5000核心用户非常活跃。你用半年时间把留存率拉回50%，然后进行精准推广。虽然走了弯路，但团队学到了宝贵的教训，最终找到了产品市场契合点。",
    choices: [],
  },
  {
    id: "end-refine-marketing",
    title: "结局：精细运营",
    description:
      "你引入了数据驱动的运营体系，把获客成本降低60%，留存率回升到35%。虽然增长不是最快的，但单位经济模型健康，投资人恢复了信心。最终以稳健的节奏完成了A轮融资。",
    choices: [],
  },
  {
    id: "end-team-first",
    title: "结局：团队为本",
    description:
      "你成功留住了核心团队，推行了更好的工作文化。虽然短期数据不亮眼，但稳定的团队快速迭代产品。一年后，产品口碑传播带来了稳定增长，公司文化成为了吸引人才的核心优势。",
    choices: [],
  },
  {
    id: "end-big-client",
    title: "结局：大树底下",
    description:
      "深度定制虽然辛苦，但大客户带来了稳定收入。不过产品高度定制化使得标准产品迭代放缓。你决定以服务收入养活团队，同时慢慢积累标准化产品。两年后形成了\u201C大客户+标准产品\u201D的双轮模式。",
    choices: [],
  },
  {
    id: "end-multi-client",
    title: "结局：标准化之路",
    description:
      "3家小学校的合作帮你验证了标准化方案。通过不断优化标准产品，你吸引了越来越多的中小教育机构。虽然单客收入不高，但长尾效应明显，一年后客户数达到50家，ARR突破200万。",
    choices: [],
  },
  {
    id: "end-expand-team",
    title: "结局：扩张的代价",
    description:
      "快速招人导致团队磨合困难，大客户项目延期，小客户也因支持不足而抱怨。资金消耗加速，6个月后不得不裁员收缩。经历阵痛后你学会了聚焦，最终选择专注标准产品逐步恢复。",
    choices: [],
  },
];

function getStage(id: string) {
  return STAGES.find((s) => s.id === id)!;
}

export function ScenarioDecision() {
  const [path, setPath] = useState<string[]>(["start"]);
  const [choiceLabels, setChoiceLabels] = useState<string[]>([]);

  const currentStageId = path[path.length - 1];
  const currentStage = getStage(currentStageId);
  const isEnd = currentStage.choices.length === 0;

  function handleChoice(choice: Choice) {
    setPath((prev) => [...prev, choice.nextStageId]);
    setChoiceLabels((prev) => [...prev, choice.label]);
  }

  function handleReset() {
    setPath(["start"]);
    setChoiceLabels([]);
  }

  return (
    <DemoShell
      title="情景决策模拟"
      description="扮演创业公司CEO，在关键节点做出选择，体验不同决策带来的后果。"
      tags={["商业思维", "决策模拟", "分支剧情"]}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStageId}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
        >
          {/* Progress indicator */}
          <div className="mb-4 flex items-center gap-2 text-sm text-text-muted">
            <MapPin className="h-4 w-4" />
            <span>
              第 {path.length} 步
              {isEnd ? " — 最终结局" : ""}
            </span>
          </div>

          {/* Stage content */}
          <div className="mb-5">
            <h2 className="text-xl font-bold">{currentStage.title}</h2>
            <p className="mt-3 leading-relaxed text-text-muted">
              {currentStage.description}
            </p>
          </div>

          {/* Choices */}
          {!isEnd && (
            <div className="space-y-3">
              {currentStage.choices.map((choice, idx) => (
                <motion.button
                  key={choice.id}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.08 }}
                  onClick={() => handleChoice(choice)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface-alt p-4 text-left transition-all hover:border-primary/50 hover:bg-surface-hover"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary-light">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 text-sm font-medium">
                    {choice.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-text-muted" />
                </motion.button>
              ))}
            </div>
          )}

          {/* End: decision tree visualization */}
          {isEnd && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <div className="rounded-lg border border-border bg-surface-alt p-5">
                <div className="mb-3 flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-primary-light" />
                  <h3 className="font-bold">你的决策路径</h3>
                </div>

                <div className="space-y-0">
                  {path.map((stageId, idx) => {
                    const stage = getStage(stageId);
                    const isLast = idx === path.length - 1;
                    return (
                      <div key={stageId} className="flex items-stretch gap-3">
                        {/* Tree line */}
                        <div className="flex w-5 flex-col items-center">
                          <Circle
                            className={`h-3 w-3 shrink-0 ${
                              isLast
                                ? "fill-primary text-primary"
                                : "fill-primary/40 text-primary/40"
                            }`}
                          />
                          {!isLast && (
                            <div className="w-px flex-1 bg-border" />
                          )}
                        </div>

                        <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
                          <p className="text-sm font-medium">{stage.title}</p>
                          {idx > 0 && (
                            <p className="mt-0.5 text-xs text-text-muted">
                              选择：{choiceLabels[idx - 1]}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                className="demo-btn-outline mt-4 inline-flex items-center gap-2"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
                重新开始，探索其他路线
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </DemoShell>
  );
}
