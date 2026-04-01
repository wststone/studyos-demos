import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Lock,
  BookOpen,
  Pencil,
  Headphones,
  MessageSquare,
  GraduationCap,
  Star,
  Mic,
  FileText,
  Globe,
  Brain,
  Clock,
  Target,
  X,
} from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface LessonNode {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "completed" | "current" | "locked";
  score?: number;
  timeSpent?: string;
  milestone?: string;
}

const LESSONS: LessonNode[] = [
  { id: 1, title: "基础发音", icon: Mic, status: "completed", score: 95, timeSpent: "12分钟" },
  { id: 2, title: "常用问候语", icon: MessageSquare, status: "completed", score: 88, timeSpent: "8分钟" },
  { id: 3, title: "数字与计数", icon: Pencil, status: "completed", score: 92, timeSpent: "15分钟", milestone: "第一章完成！" },
  { id: 4, title: "日常词汇", icon: BookOpen, status: "completed", score: 78, timeSpent: "20分钟" },
  { id: 5, title: "听力训练 I", icon: Headphones, status: "completed", score: 85, timeSpent: "18分钟" },
  { id: 6, title: "简单句型", icon: FileText, status: "completed", score: 90, timeSpent: "14分钟", milestone: "第二章完成！" },
  { id: 7, title: "阅读理解", icon: Globe, status: "current" },
  { id: 8, title: "语法基础", icon: Brain, status: "locked" },
  { id: 9, title: "对话练习", icon: MessageSquare, status: "locked", milestone: "第三章完成！" },
  { id: 10, title: "听力训练 II", icon: Headphones, status: "locked" },
  { id: 11, title: "写作入门", icon: Pencil, status: "locked" },
  { id: 12, title: "综合测试", icon: GraduationCap, status: "locked", milestone: "课程毕业！" },
];

export function ProgressPath() {
  const [selectedNode, setSelectedNode] = useState<LessonNode | null>(null);

  const completedCount = LESSONS.filter((l) => l.status === "completed").length;
  const progress = Math.round((completedCount / LESSONS.length) * 100);

  return (
    <DemoShell
      title="学习路径"
      description="沿着路径前进，解锁新课程，掌握每一个知识点。"
      tags={["课程", "路径", "进度"]}
    >
      {/* Overall progress */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-text-muted">总进度</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-surface-alt overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-success"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 text-warning" />
          <span className="font-bold">{completedCount}</span>
          <span className="text-text-muted">/ {LESSONS.length}</span>
        </div>
      </div>

      {/* Path */}
      <div className="relative py-4">
        {/* Connecting line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

        <div className="space-y-2">
          {LESSONS.map((lesson, idx) => {
            const isLeft = idx % 2 === 0;
            const Icon = lesson.icon;
            const statusStyles = {
              completed: "border-success bg-success/10 hover:bg-success/20",
              current: "border-primary bg-primary/10 hover:bg-primary/20 ring-2 ring-primary/40",
              locked: "border-border bg-surface-alt opacity-60",
            };
            const iconStyles = {
              completed: "bg-success text-white",
              current: "bg-primary text-white",
              locked: "bg-surface-alt text-text-muted",
            };

            return (
              <div key={lesson.id}>
                {/* Milestone */}
                {lesson.milestone && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative z-10 flex justify-center mb-2"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/20 text-warning px-3 py-1 text-xs font-semibold">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {lesson.milestone}
                    </span>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.07, type: "spring", stiffness: 120 }}
                  className={`relative flex items-center gap-4 ${isLeft ? "flex-row pr-[52%]" : "flex-row-reverse pl-[52%]"}`}
                >
                  {/* Node card */}
                  <button
                    type="button"
                    onClick={() => {
                      if (lesson.status === "completed") setSelectedNode(lesson);
                    }}
                    disabled={lesson.status === "locked"}
                    className={`flex-1 flex items-center gap-3 rounded-xl border p-3 transition-all cursor-pointer ${statusStyles[lesson.status]} ${
                      isLeft ? "" : "flex-row-reverse text-right"
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconStyles[lesson.status]}`}>
                      {lesson.status === "completed" ? (
                        <Check className="h-5 w-5" />
                      ) : lesson.status === "locked" ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className={isLeft ? "" : "flex-1"}>
                      <p className="font-medium text-sm leading-tight">{lesson.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {lesson.status === "completed"
                          ? `得分 ${lesson.score}%`
                          : lesson.status === "current"
                            ? "进行中"
                            : "未解锁"}
                      </p>
                    </div>
                  </button>

                  {/* Center dot on the line */}
                  <div className="absolute left-1/2 -translate-x-1/2">
                    <motion.div
                      className={`h-4 w-4 rounded-full border-2 ${
                        lesson.status === "completed"
                          ? "border-success bg-success"
                          : lesson.status === "current"
                            ? "border-primary bg-primary"
                            : "border-border bg-surface-alt"
                      }`}
                      animate={
                        lesson.status === "current"
                          ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }
                          : {}
                      }
                      transition={
                        lesson.status === "current"
                          ? { repeat: Infinity, duration: 1.5 }
                          : {}
                      }
                    />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail popover */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xs rounded-xl border border-border bg-surface p-5"
            >
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="absolute top-3 right-3 text-text-muted hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{selectedNode.title}</p>
                  <p className="text-xs text-success">已完成</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-text-muted">
                    <Target className="h-4 w-4" />
                    得分
                  </span>
                  <span className="font-bold">{selectedNode.score}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-alt overflow-hidden">
                  <div
                    className="h-full rounded-full bg-success"
                    style={{ width: `${selectedNode.score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-text-muted">
                    <Clock className="h-4 w-4" />
                    用时
                  </span>
                  <span className="font-bold">{selectedNode.timeSpent}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DemoShell>
  );
}
