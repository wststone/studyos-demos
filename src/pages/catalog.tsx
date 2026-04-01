import { Link } from "react-router-dom";
import {
  BookOpen, Brain, Pencil, Calculator, Repeat, Gamepad2, Users, Sparkles,
} from "lucide-react";

const demos = [
  { path: "/paragraph-structure-map", label: "段落结构图", desc: "标记主题句/支撑句/结论", cat: "理解与结构", icon: BookOpen },
  { path: "/highlight-evidence", label: "证据高亮", desc: "在文章中标出支持某观点的句子", cat: "理解与结构", icon: BookOpen },
  { path: "/concept-map-builder", label: "概念图构建器", desc: "构建知识之间的关系网络", cat: "理解与结构", icon: BookOpen },
  { path: "/true-false-justify", label: "判断并解释", desc: "判断对错 + 填写理由", cat: "推理与思维", icon: Brain },
  { path: "/scenario-decision", label: "情境决策题", desc: "给定情境，选择策略", cat: "推理与思维", icon: Brain },
  { path: "/error-correction", label: "找错改错", desc: "在文本或公式中找错误", cat: "推理与思维", icon: Brain },
  { path: "/explain-your-thinking", label: "思路展示", desc: "分步骤写出解题过程", cat: "推理与思维", icon: Brain },
  { path: "/voice-storytelling", label: "语音讲故事", desc: "看图说话 / 复述", cat: "表达与输出", icon: Pencil },
  { path: "/timed-writing", label: "限时写作", desc: "模拟考试环境", cat: "表达与输出", icon: Pencil },
  { path: "/equation-builder", label: "公式构建器", desc: "拖拽符号组成公式", cat: "数学专用", icon: Calculator },
  { path: "/graph-plotter", label: "函数绘图", desc: "输入函数，实时显示图像", cat: "数学专用", icon: Calculator },
  { path: "/fraction-manipulator", label: "分数操作器", desc: "可视化分数加减", cat: "数学专用", icon: Calculator },
  { path: "/spaced-repetition-tracker", label: "间隔重复", desc: "自动安排复习", cat: "记忆强化", icon: Repeat },
  { path: "/rapid-fire-quiz", label: "快问快答", desc: "高频强化，连击机制", cat: "记忆强化", icon: Repeat },
  { path: "/memory-grid", label: "记忆翻牌", desc: "图片配对记忆", cat: "记忆强化", icon: Repeat },
  { path: "/progress-path", label: "学习路径", desc: "可视化学习进度", cat: "游戏化", icon: Gamepad2 },
  { path: "/boss-challenge", label: "挑战关卡", desc: "综合考察多个技能", cat: "游戏化", icon: Gamepad2 },
  { path: "/debate-module", label: "辩论组件", desc: "双方提交观点 + 投票", cat: "协作与诊断", icon: Users },
  { path: "/misconception-detector", label: "误区识别", desc: "基于错误类型进行反馈", cat: "协作与诊断", icon: Users },
  { path: "/branching-story-learning", label: "分支剧情", desc: "分支剧情学习", cat: "沉浸式", icon: Sparkles },
  { path: "/timeline-builder", label: "时间轴构建", desc: "历史/事件排序", cat: "沉浸式", icon: Sparkles },
];

export function CatalogPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">StudyOS 教育组件 Demo</h1>
      <p className="text-text-muted mb-8">21 个交互式教育组件原型</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {demos.map((d) => (
          <Link
            key={d.path}
            to={d.path}
            className="demo-card hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary-light group-hover:bg-primary/20 transition-colors">
                <d.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-text group-hover:text-primary-light transition-colors">
                  {d.label}
                </h3>
                <p className="text-sm text-text-muted mt-1">{d.desc}</p>
                <span className="demo-tag mt-2">{d.cat}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
