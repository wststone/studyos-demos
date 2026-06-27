import {
  BookOpen, Brain, Pencil, Calculator, Repeat, Gamepad2, Users, Sparkles, FlaskConical, Meh, Rocket, Bot, Hexagon, GraduationCap,
  type LucideIcon,
} from "lucide-react";

export interface Demo {
  path: string;
  label: string;
  desc: string;
  cat: string;
  icon: LucideIcon;
  subjects: string[];
  tags: string[];
  isNew?: boolean;
}

export interface Category {
  title: string;
  icon: LucideIcon;
  items: { path: string; label: string; isNew?: boolean }[];
}

export const BORING_CAT = "没那么有趣的";
export const AI_CAT = "AI判定";
export const HIDDEN_CATS = [BORING_CAT, AI_CAT];

export const demos: Demo[] = [
  { path: "/paragraph-structure-map", label: "段落结构图", desc: "标记主题句/支撑句/结论", cat: "理解与结构", icon: BookOpen, subjects: ["English", "Chinese"], tags: ["annotation", "visualization", "text-structure", "reading-comprehension", "writing"] },
  { path: "/highlight-evidence", label: "证据高亮", desc: "在文章中标出支持某观点的句子", cat: "理解与结构", icon: BookOpen, subjects: ["English", "Chinese", "History"], tags: ["text-selection", "critical-thinking", "evidence-based", "reading-comprehension"] },
  { path: "/concept-map-builder", label: "概念图构建器", desc: "构建知识之间的关系网络", cat: "理解与结构", icon: BookOpen, subjects: ["Biology", "Physics", "Chemistry", "History", "Geography"], tags: ["drag-and-drop", "graph", "knowledge-mapping", "cross-disciplinary"] },
  { path: "/true-false-justify", label: "判断并解释", desc: "判断对错 + 填写理由", cat: "推理与思维", icon: Brain, subjects: ["Physics", "Biology", "Chemistry", "English"], tags: ["higher-order-thinking", "open-response", "justification", "critical-thinking"] },
  { path: "/scenario-decision", label: "情境决策题", desc: "给定情境，选择策略", cat: "推理与思维", icon: Brain, subjects: ["History", "Geography", "Economics"], tags: ["branching", "decision-making", "scenario-based", "ethics", "social-science"] },
  { path: "/error-correction", label: "找错改错", desc: "在文本或公式中找错误", cat: "推理与思维", icon: Brain, subjects: ["English", "Chinese", "Math", "Computer Science"], tags: ["debugging", "interactive", "error-analysis", "grammar"] },
  { path: "/explain-your-thinking", label: "思路展示", desc: "分步骤写出解题过程", cat: "AI判定", icon: Bot, subjects: ["Math", "Physics"], tags: ["step-by-step", "AI-grading", "metacognition", "problem-solving"] },
  { path: "/voice-storytelling", label: "语音讲故事", desc: "看图说话 / 复述", cat: "AI判定", icon: Bot, subjects: ["English", "Chinese"], tags: ["speech-recognition", "AI-grading", "oral-production", "ESL", "early-childhood"] },
  { path: "/timed-writing", label: "限时写作", desc: "模拟考试环境", cat: "表达与输出", icon: Pencil, subjects: ["English", "Chinese"], tags: ["timer", "auto-save", "exam-simulation", "writing", "ESL"] },
  { path: "/equation-builder", label: "公式构建器", desc: "拖拽符号组成公式", cat: "数学专用", icon: Calculator, subjects: ["Math"], tags: ["drag-and-drop", "formula", "input-validation", "elementary"] },
  { path: "/graph-plotter", label: "函数绘图", desc: "输入函数，实时显示图像", cat: "数学专用", icon: Calculator, subjects: ["Math"], tags: ["real-time", "visualization", "graphing", "algebra", "calculus"] },
  { path: "/fraction-manipulator", label: "分数操作器", desc: "可视化分数加减", cat: "数学专用", icon: Calculator, subjects: ["Math"], tags: ["visualization", "manipulative", "interactive", "elementary", "fractions"] },
  { path: "/spaced-repetition-tracker", label: "间隔重复", desc: "自动安排复习", cat: "没那么有趣的", icon: Meh, subjects: ["English", "Chinese", "Math", "Physics", "Chemistry", "Biology", "History"], tags: ["SRS", "flashcard", "long-term-retention", "cross-disciplinary"] },
  { path: "/rapid-fire-quiz", label: "快问快答", desc: "高频强化，连击机制", cat: "记忆强化", icon: Repeat, subjects: ["English", "Chinese", "Math", "Physics", "Chemistry", "Biology", "History"], tags: ["gamification", "timer", "leaderboard", "speed-drill", "cross-disciplinary"] },
  { path: "/memory-grid", label: "记忆翻牌", desc: "图片配对记忆", cat: "记忆强化", icon: Repeat, subjects: ["English", "Chinese"], tags: ["gamification", "matching", "memory", "early-childhood", "vocabulary"] },
  { path: "/progress-path", label: "学习路径", desc: "可视化学习进度", cat: "没那么有趣的", icon: Meh, subjects: ["English", "Chinese", "Math", "Physics", "Chemistry", "Biology", "History"], tags: ["gamification", "progress-tracking", "learning-path", "cross-disciplinary"] },
  { path: "/boss-challenge", label: "挑战关卡", desc: "综合考察多个技能", cat: "游戏化", icon: Gamepad2, subjects: ["English", "Chinese", "Math", "Physics", "Chemistry", "Biology", "History"], tags: ["gamification", "assessment", "milestone", "cross-disciplinary"] },
  { path: "/debate-module", label: "辩论组件", desc: "双方提交观点 + 投票", cat: "协作与诊断", icon: Users, subjects: ["English", "Chinese", "History"], tags: ["collaboration", "voting", "argumentation", "philosophy", "social-science"] },
  { path: "/misconception-detector", label: "误区识别", desc: "基于错误类型进行反馈", cat: "协作与诊断", icon: Users, subjects: ["Math", "Physics", "Chemistry", "Biology"], tags: ["diagnostic", "adaptive-feedback", "misconception-mapping"] },
  { path: "/branching-story-learning", label: "分支剧情", desc: "分支剧情学习", cat: "沉浸式", icon: Sparkles, subjects: ["English", "Chinese", "History", "Biology"], tags: ["branching", "narrative", "choice-driven", "ethics"] },
  { path: "/timeline-builder", label: "时间轴构建", desc: "历史/事件排序", cat: "沉浸式", icon: Sparkles, subjects: ["History", "Biology", "Physics"], tags: ["drag-and-drop", "chronological", "sequencing"] },
  { path: "/word-morphology-lab", label: "词形变化实验室", desc: "练习词性变化与构词法", cat: "语言与科学", icon: FlaskConical, subjects: ["English", "Chinese"], tags: ["drag-and-drop", "morphology", "vocabulary-building", "interactive"], isNew: true },
  { path: "/data-interpretation", label: "数据解读", desc: "观察图表回答分析问题", cat: "AI判定", icon: Bot, subjects: ["Math", "Geography", "Economics", "Biology"], tags: ["data-literacy", "chart-reading", "AI-grading", "critical-thinking"], isNew: true },
  { path: "/lab-report-builder", label: "实验报告生成器", desc: "按标准格式撰写实验报告", cat: "AI判定", icon: Bot, subjects: ["Physics", "Chemistry", "Biology"], tags: ["scaffolded-writing", "scientific-method", "AI-grading"], isNew: true },
  { path: "/pronunciation-trainer", label: "发音训练器", desc: "录音对比练习发音", cat: "AI判定", icon: Bot, subjects: ["English", "Chinese"], tags: ["speech-recognition", "AI-grading", "pronunciation", "ESL"], isNew: true },
  { path: "/cause-effect-chain", label: "因果链构建器", desc: "推导事件因果关系链", cat: "语言与科学", icon: FlaskConical, subjects: ["History", "Physics", "Biology", "Geography"], tags: ["drag-and-drop", "causal-reasoning", "logic-training"], isNew: true },
  { path: "/knowledge-archaeology", label: "知识考古", desc: "修复残损文献，推断缺失内容", cat: "创新实验", icon: Rocket, subjects: ["History", "English", "Chinese", "Physics", "Biology", "Computer Science"], tags: ["reconstruction", "contextual-reasoning", "scaffolded-difficulty", "critical-thinking"], isNew: true },
  { path: "/concept-translator", label: "概念翻译器", desc: "文字↔公式↔图表↔代码↔类比转换", cat: "AI判定", icon: Bot, subjects: ["Math", "Physics", "Chemistry", "Economics", "Computer Science"], tags: ["multimodal", "cross-representation", "AI-grading", "deep-understanding"], isNew: true },
  { path: "/tessellation-studio", label: "镶嵌工坊", desc: "设计瓷砖形状，观察无缝铺满平面", cat: "创新实验", icon: Hexagon, subjects: ["Math"], tags: ["spatial", "geometry", "creative", "interactive", "symmetry"], isNew: true },
  { path: "/evidence-pairing", label: "证据配对训练", desc: "匹配结论与文本证据，练习SAT阅读证据题", cat: "考试训练", icon: GraduationCap, subjects: ["English"], tags: ["SAT", "reading-comprehension", "evidence", "matching"], isNew: true },
  { path: "/transition-workshop", label: "过渡词工坊", desc: "选择过渡词并实时预览段落逻辑变化", cat: "考试训练", icon: GraduationCap, subjects: ["English"], tags: ["SAT", "writing", "transitions", "logic"], isNew: true },
  { path: "/vocab-in-context", label: "语境词义", desc: "同一单词多个语境，匹配正确释义", cat: "考试训练", icon: GraduationCap, subjects: ["English"], tags: ["SAT", "TOEFL", "vocabulary", "polysemy", "context"], isNew: true },
  { path: "/listening-notepad", label: "听力笔记板", desc: "边听边记笔记，仅凭笔记答题", cat: "考试训练", icon: GraduationCap, subjects: ["English"], tags: ["TOEFL", "listening", "note-taking", "audio"], isNew: true },
  { path: "/passage-pacing", label: "阅读节奏训练器", desc: "限时做阅读题，分析每题用时与答题策略", cat: "考试训练", icon: GraduationCap, subjects: ["English"], tags: ["SAT", "reading", "pacing", "timer", "strategy"], isNew: true },
  { path: "/intonation-painter", label: "语调画板", desc: "画出英语句子的音高曲线，听到语调随你的画作改变", cat: "创新实验", icon: Rocket, subjects: ["English"], tags: ["intonation", "speech-synthesis", "drawing", "prosody", "interactive"], isNew: true },
  { path: "/tense-timeline", label: "时态时间轴", desc: "把英语句子拖到对应的时态形状上，建立空间-时间直觉", cat: "语言与科学", icon: FlaskConical, subjects: ["English"], tags: ["grammar", "tense", "spatial-mapping", "drag-and-drop"], isNew: true },
  { path: "/collocation-constellation", label: "搭配星座", desc: "搭配词围绕核心词运行，自然搭配被吸入轨道，错误搭配被排斥", cat: "创新实验", icon: Rocket, subjects: ["English"], tags: ["collocation", "vocabulary", "physics", "drag-and-drop"], isNew: true },
  { path: "/stress-wave-surf", label: "重音冲浪", desc: "在重读音节经过中线时点击，节奏游戏练英语重音", cat: "游戏化", icon: Gamepad2, subjects: ["English"], tags: ["pronunciation", "rhythm", "stress", "gamification", "timing"], isNew: true },
  { path: "/etymology-tree", label: "词根生长树", desc: "动画生长展示词根的祖先与派生词，把词汇变成网络发现", cat: "创新实验", icon: Rocket, subjects: ["English"], tags: ["etymology", "vocabulary", "animation", "roots", "interactive"], isNew: true },
];

export const SUBJECT_LABELS: Record<string, string> = {
  English: "英语",
  Chinese: "语文",
  Math: "数学",
  Physics: "物理",
  Chemistry: "化学",
  Biology: "生物",
  History: "历史",
  Geography: "地理",
  Economics: "经济",
  "Computer Science": "信息技术",
};

/** Derive sidebar categories from demos, preserving display order. */
export function getCategories(): Category[] {
  const catOrder: string[] = [];
  const catMap = new Map<string, { icon: LucideIcon; items: { path: string; label: string; isNew?: boolean }[] }>();

  for (const d of demos) {
    if (!catMap.has(d.cat)) {
      catOrder.push(d.cat);
      catMap.set(d.cat, { icon: d.icon, items: [] });
    }
    catMap.get(d.cat)!.items.push({ path: d.path, label: d.label, isNew: d.isNew });
  }

  // Put hidden categories at the end
  const sorted = catOrder.filter((c) => !HIDDEN_CATS.includes(c));
  for (const hc of HIDDEN_CATS) {
    if (catMap.has(hc)) sorted.push(hc);
  }

  return sorted.map((title) => ({
    title,
    icon: catMap.get(title)!.icon,
    items: catMap.get(title)!.items,
  }));
}
