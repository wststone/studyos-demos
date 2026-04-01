import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  GitBranch,
  RotateCcw,
  ArrowRight,
  MapPin,
  Trophy,
  Lightbulb,
} from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface Choice {
  id: string;
  text: string;
  hint: string;
  leadsTo: string;
}

interface StoryNode {
  id: string;
  paragraph: string;
  choices?: Choice[];
  isEnding?: boolean;
  knowledge?: string[];
  endingSummary?: string;
}

const STORY_NODES: Record<string, StoryNode> = {
  start: {
    id: "start",
    paragraph:
      "公元前138年，汉武帝为联合大月氏夹击匈奴，派遣张骞率领百余人出使西域。你作为张骞的随从，踏上了这段改变历史的旅程。队伍刚出陇西，前方传来消息：匈奴骑兵正在前方巡逻。",
    choices: [
      {
        id: "sneak",
        text: "建议绕道走祁连山脉北麓，避开匈奴主力",
        hint: "学习地理知识：祁连山脉与河西走廊的地形",
        leadsTo: "mountain_path",
      },
      {
        id: "direct",
        text: "建议趁夜色直接穿越匈奴控制区",
        hint: "学习历史事实：张骞被匈奴俘虏的经历",
        leadsTo: "captured",
      },
      {
        id: "trade",
        text: "建议伪装成商队，以贸易为名通过",
        hint: "学习丝路经济：早期东西方贸易品与商路",
        leadsTo: "merchant_path",
      },
    ],
  },
  mountain_path: {
    id: "mountain_path",
    paragraph:
      "队伍翻越祁连山北麓，沿着河西走廊西行。你们发现这里的地形极其险要——南有祁连山，北有沙漠，中间是一条狭长的绿洲走廊。经过数日跋涉，你们到达了一个小绿洲城邦。当地人说，前方有两条路可以继续西行。",
    knowledge: ["河西走廊是连接中原与西域的咽喉要道，全长约1000公里", "祁连山融雪为走廊提供了宝贵的水源"],
    choices: [
      {
        id: "north_route",
        text: "走天山北道，经乌孙国前往大月氏",
        hint: "学习丝路北道的城邦：乌孙、龟兹等国",
        leadsTo: "wusun",
      },
      {
        id: "south_route",
        text: "走昆仑山北麓的南道，经于阗前行",
        hint: "学习丝路南道的特产：和田玉与丝绸贸易",
        leadsTo: "khotan",
      },
    ],
  },
  captured: {
    id: "captured",
    paragraph:
      "不幸的是，队伍在夜行中被匈奴骑兵发现。张骞和你们全部被俘，被带到了匈奴单于庭。单于扣留了你们，但并未杀害——匈奴想利用你们了解汉朝虚实。在被扣留的漫长岁月中，你有了新的选择。",
    knowledge: ["历史上张骞确实被匈奴扣留了整整十年", "匈奴采取游牧制度，随水草迁移"],
    choices: [
      {
        id: "learn",
        text: "利用被扣留的时间学习匈奴语言和习俗，等待逃跑时机",
        hint: "学习匈奴文化：游牧制度、军事组织",
        leadsTo: "escape",
      },
      {
        id: "adapt",
        text: "融入匈奴生活，但暗中收集关于西域的情报",
        hint: "学习地缘政治：匈奴与西域各国的关系",
        leadsTo: "intelligence",
      },
    ],
  },
  merchant_path: {
    id: "merchant_path",
    paragraph:
      "你们伪装成商队，带着丝绸和漆器西行。沿途你发现贸易在这条路上已有悠久历史——玉石从西域东传，丝绸从中原西运。在一处绿洲集市上，你遇到了来自不同国家的商人。一位粟特商人愿意做你们的向导。",
    knowledge: ["丝绸之路的命名来自德国地理学家李希霍芬", "粟特人是丝路上最活跃的中间商"],
    choices: [
      {
        id: "follow_sogdian",
        text: "跟随粟特商人走商业繁忙的北道",
        hint: "学习粟特文明：中亚贸易网络的枢纽",
        leadsTo: "wusun",
      },
      {
        id: "jade_road",
        text: "沿着玉石之路向南，经于阗寻找大月氏踪迹",
        hint: "学习玉石贸易：和田玉在中华文化中的地位",
        leadsTo: "khotan",
      },
    ],
  },
  wusun: {
    id: "wusun",
    paragraph:
      "你们到达了乌孙国——天山以北的游牧强国。乌孙国王昆莫热情接待了你们，但表示大月氏已被匈奴击败，西迁到了更远的地方。昆莫对与汉朝结盟表现出兴趣。经过长途跋涉，你们终于找到了大月氏，但他们已安居在阿姆河流域，不愿再东征复仇。",
    knowledge: [
      "乌孙国位于今伊犁河谷，是西域强国",
      "大月氏西迁后建立了贵霜帝国，成为四大帝国之一",
    ],
    isEnding: true,
    endingSummary:
      "你选择了北道路线。虽然未能完成联合大月氏的使命，但张骞带回了大量西域情报，汉武帝大喜，后来开辟了正式的丝绸之路。这次「凿空」之旅开启了东西方文明交流的新纪元。",
  },
  khotan: {
    id: "khotan",
    paragraph:
      "于阗国是一个以玉石闻名的绿洲王国。你在这里见识了精美的和田玉——从白玉到墨玉，品种繁多。于阗人告诉你，大月氏在更西边的大夏（巴克特里亚）。你们继续西行，翻越帕米尔高原，历尽千辛万苦终于到达大夏。然而大月氏已安居乐业，婉拒了联盟请求。",
    knowledge: [
      "于阗（今和田）是南道最重要的绿洲城邦",
      "帕米尔高原被称为「世界屋脊」，平均海拔4000米以上",
      "大夏即今天的阿富汗北部地区",
    ],
    isEnding: true,
    endingSummary:
      "你选择了南道路线，沿着古老的玉石之路穿越大漠。这条路虽然艰辛，但让你见识了于阗的玉石文化和帕米尔的壮丽。归途中，你们带回了葡萄、苜蓿等物种的种子，为中原农业增添了新品种。",
  },
  escape: {
    id: "escape",
    paragraph:
      "十年过去了。你学会了匈奴语，深入了解了草原文化。终于在一次匈奴内部混乱时，你和张骞趁机逃脱，继续西行使命。你们的匈奴语技能让你们顺利通过了多个游牧部落的领地，最终到达大月氏。虽然联盟未成，但你们掌握了珍贵的西域地理和各国情报。",
    knowledge: [
      "张骞在匈奴期间娶了匈奴妻子，生有子女",
      "掌握多种语言是古代外交使节的重要能力",
    ],
    isEnding: true,
    endingSummary:
      "你选择了隐忍学习的路线。虽然被困十年，但你精通了匈奴语言文化，这些知识成为汉朝制定对匈奴战略的关键情报。历史上，张骞正是走了这条路，他被誉为「丝绸之路的开拓者」。",
  },
  intelligence: {
    id: "intelligence",
    paragraph:
      "你在匈奴部落中生活了多年，秘密记录匈奴的军事部署、部落关系和西域商道信息。你发现匈奴通过控制西域获取了巨大的财富和战略优势。利用一次随匈奴使者出行的机会，你成功脱离并带着重要情报返回了长安。",
    knowledge: [
      "匈奴帝国控制了从蒙古高原到天山的广大地区",
      "汉武帝正是根据张骞的情报制定了「断匈奴右臂」的战略",
    ],
    isEnding: true,
    endingSummary:
      "你选择了情报收集路线。你带回的匈奴军事情报帮助汉武帝制定了精确的战略，最终通过河西之战切断了匈奴与西域的联系，奠定了汉朝对西域的控制。",
  },
};

// Build adjacency for tree visualization
const ALL_NODE_IDS = Object.keys(STORY_NODES);

interface TreeNode {
  id: string;
  label: string;
  children: string[];
  x: number;
  y: number;
}

function buildTree(): TreeNode[] {
  const nodes: TreeNode[] = [];
  const levels: Record<string, number> = { start: 0 };

  function assignLevel(id: string, level: number) {
    const node = STORY_NODES[id];
    if (!node?.choices) return;
    for (const c of node.choices) {
      if (levels[c.leadsTo] === undefined) {
        levels[c.leadsTo] = level + 1;
        assignLevel(c.leadsTo, level + 1);
      }
    }
  }
  assignLevel("start", 0);

  const levelCounts: Record<number, number> = {};
  const levelIndex: Record<number, number> = {};
  for (const id of ALL_NODE_IDS) {
    const lv = levels[id] ?? 0;
    levelCounts[lv] = (levelCounts[lv] ?? 0) + 1;
  }

  for (const id of ALL_NODE_IDS) {
    const lv = levels[id] ?? 0;
    const idx = levelIndex[lv] ?? 0;
    levelIndex[lv] = idx + 1;
    const totalInLevel = levelCounts[lv] ?? 1;
    const spacing = 300 / (totalInLevel + 1);

    const node = STORY_NODES[id];
    nodes.push({
      id,
      label: getNodeLabel(id),
      children: node.choices?.map((c) => c.leadsTo) ?? [],
      x: spacing * (idx + 1),
      y: lv * 60 + 20,
    });
  }
  return nodes;
}

function getNodeLabel(id: string): string {
  const labels: Record<string, string> = {
    start: "出发",
    mountain_path: "祁连山",
    captured: "被俘",
    merchant_path: "商队",
    wusun: "乌孙",
    khotan: "于阗",
    escape: "逃脱",
    intelligence: "情报",
  };
  return labels[id] ?? id;
}

export function BranchingStoryLearning() {
  const [path, setPath] = useState<string[]>(["start"]);
  const [finished, setFinished] = useState(false);

  const currentNodeId = path[path.length - 1];
  const currentNode = STORY_NODES[currentNodeId];
  const progress = path.length;
  const maxDepth = 3; // approximate max depth

  const treeNodes = useMemo(() => buildTree(), []);

  function handleChoice(choice: Choice) {
    const nextId = choice.leadsTo;
    setPath((p) => [...p, nextId]);
    const nextNode = STORY_NODES[nextId];
    if (nextNode?.isEnding) {
      setFinished(true);
    }
  }

  function handleReset() {
    setPath(["start"]);
    setFinished(false);
  }

  const allKnowledge = path.flatMap((nodeId) => STORY_NODES[nodeId]?.knowledge ?? []);

  return (
    <DemoShell
      title="分支故事学习"
      description="在丝绸之路的历史场景中做出选择，探索不同的学习路径。"
      tags={["历史", "互动叙事", "分支学习"]}
    >
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-5">
        <BookOpen className="h-4 w-4 text-primary-light" />
        <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${Math.min((progress / (maxDepth + 1)) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-xs text-text-muted">
          第 {progress} 步
        </span>
      </div>

      {/* Path breadcrumb */}
      <div className="flex items-center gap-1 mb-4 flex-wrap">
        {path.map((nodeId, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ArrowRight className="h-3 w-3 text-text-muted" />}
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                i === path.length - 1
                  ? "bg-primary/20 text-primary-light font-medium"
                  : "bg-surface-alt text-text-muted"
              }`}
            >
              {getNodeLabel(nodeId)}
            </span>
          </span>
        ))}
      </div>

      {/* Story content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentNodeId}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="space-y-4"
        >
          <p className="leading-relaxed text-sm">{currentNode.paragraph}</p>

          {/* Knowledge gained at this node */}
          {currentNode.knowledge && currentNode.knowledge.length > 0 && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className="h-3.5 w-3.5 text-primary-light" />
                <span className="text-xs font-medium text-primary-light">知识收获</span>
              </div>
              <ul className="text-xs text-text-muted space-y-1 ml-5 list-disc">
                {currentNode.knowledge.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Choices */}
          {!finished && currentNode.choices && (
            <div className="space-y-2">
              <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
                <MapPin className="inline h-3 w-3 mr-1" />
                做出选择
              </p>
              {currentNode.choices.map((choice) => (
                <motion.button
                  key={choice.id}
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleChoice(choice)}
                  className="w-full text-left rounded-lg border border-border hover:border-primary/50 bg-surface-alt p-3 transition-colors"
                >
                  <p className="text-sm font-medium">{choice.text}</p>
                  <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" />
                    {choice.hint}
                  </p>
                </motion.button>
              ))}
            </div>
          )}

          {/* Ending */}
          {finished && currentNode.isEnding && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-success" />
                  <span className="font-medium text-success text-sm">旅程结束</span>
                </div>
                <p className="text-sm text-text-muted">{currentNode.endingSummary}</p>
              </div>

              {/* All knowledge gained */}
              {allKnowledge.length > 0 && (
                <div className="rounded-lg border border-border bg-surface-alt p-4">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-primary-light" />
                    知识总结
                  </h3>
                  <ul className="text-xs text-text-muted space-y-1 ml-5 list-disc">
                    {allKnowledge.map((k, i) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Story tree */}
              <div className="rounded-lg border border-border bg-surface-alt p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <GitBranch className="h-4 w-4 text-primary-light" />
                  故事路径图
                </h3>
                <div className="overflow-x-auto">
                  <svg width="300" height={Math.max(...treeNodes.map((n) => n.y)) + 50} className="mx-auto">
                    {/* Edges */}
                    {treeNodes.map((node) =>
                      node.children.map((childId) => {
                        const child = treeNodes.find((n) => n.id === childId);
                        if (!child) return null;
                        const isOnPath =
                          path.includes(node.id) && path.includes(childId);
                        return (
                          <line
                            key={`${node.id}-${childId}`}
                            x1={node.x}
                            y1={node.y + 10}
                            x2={child.x}
                            y2={child.y - 10}
                            stroke={isOnPath ? "#6366f1" : "#3b3b52"}
                            strokeWidth={isOnPath ? 2 : 1}
                          />
                        );
                      }),
                    )}
                    {/* Nodes */}
                    {treeNodes.map((node) => {
                      const isOnPath = path.includes(node.id);
                      const isCurrent = node.id === currentNodeId;
                      return (
                        <g key={node.id}>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={isCurrent ? 10 : 8}
                            fill={
                              isCurrent
                                ? "#6366f1"
                                : isOnPath
                                  ? "#818cf8"
                                  : "#252538"
                            }
                            stroke={isOnPath ? "#6366f1" : "#3b3b52"}
                            strokeWidth={1.5}
                          />
                          <text
                            x={node.x}
                            y={node.y + 22}
                            textAnchor="middle"
                            fill={isOnPath ? "#e2e2f0" : "#9393a8"}
                            fontSize="9"
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                <p className="text-xs text-text-muted text-center mt-2">
                  高亮路径为你本次的选择，尝试不同选择可解锁更多知识
                </p>
              </div>

              <button
                type="button"
                className="demo-btn inline-flex items-center gap-2"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
                重新开始
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </DemoShell>
  );
}
