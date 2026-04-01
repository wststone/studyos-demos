import { NavLink, Outlet } from "react-router-dom";
import { BookOpen, Brain, Pencil, Calculator, Repeat, Gamepad2, Users, Search, Sparkles } from "lucide-react";

const categories = [
  {
    title: "理解与结构",
    icon: BookOpen,
    items: [
      { path: "/paragraph-structure-map", label: "段落结构图" },
      { path: "/highlight-evidence", label: "证据高亮" },
      { path: "/concept-map-builder", label: "概念图构建器" },
    ],
  },
  {
    title: "推理与思维",
    icon: Brain,
    items: [
      { path: "/true-false-justify", label: "判断并解释" },
      { path: "/scenario-decision", label: "情境决策题" },
      { path: "/error-correction", label: "找错改错" },
      { path: "/explain-your-thinking", label: "思路展示" },
    ],
  },
  {
    title: "表达与输出",
    icon: Pencil,
    items: [
      { path: "/voice-storytelling", label: "语音讲故事" },
      { path: "/timed-writing", label: "限时写作" },
    ],
  },
  {
    title: "数学专用",
    icon: Calculator,
    items: [
      { path: "/equation-builder", label: "公式构建器" },
      { path: "/graph-plotter", label: "函数绘图" },
      { path: "/fraction-manipulator", label: "分数操作器" },
    ],
  },
  {
    title: "记忆强化",
    icon: Repeat,
    items: [
      { path: "/spaced-repetition-tracker", label: "间隔重复" },
      { path: "/rapid-fire-quiz", label: "快问快答" },
      { path: "/memory-grid", label: "记忆翻牌" },
    ],
  },
  {
    title: "游戏化",
    icon: Gamepad2,
    items: [
      { path: "/progress-path", label: "学习路径" },
      { path: "/boss-challenge", label: "挑战关卡" },
    ],
  },
  {
    title: "协作与诊断",
    icon: Users,
    items: [
      { path: "/debate-module", label: "辩论组件" },
      { path: "/misconception-detector", label: "误区识别" },
    ],
  },
  {
    title: "沉浸式",
    icon: Sparkles,
    items: [
      { path: "/branching-story-learning", label: "分支剧情" },
      { path: "/timeline-builder", label: "时间轴构建" },
    ],
  },
];

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 shrink-0 border-r border-border bg-surface overflow-y-auto">
        <NavLink to="/" className="flex items-center gap-2 px-5 py-4 border-b border-border hover:bg-surface-hover transition-colors">
          <Search className="w-5 h-5 text-primary-light" />
          <span className="font-semibold text-lg text-text">StudyOS Demos</span>
        </NavLink>
        <nav className="py-2">
          {categories.map((cat) => (
            <div key={cat.title} className="mb-1">
              <div className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                <cat.icon className="w-3.5 h-3.5" />
                {cat.title}
              </div>
              {cat.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block px-5 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "text-primary-light bg-primary/10 border-r-2 border-primary"
                        : "text-text-muted hover:text-text hover:bg-surface-hover"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
