import { useState, useCallback } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import {
  GripVertical,
  CheckCircle,
  XCircle,
  Plus,
  RotateCcw,
  ArrowDown,
  Calendar,
  Trash2,
} from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  isCustom?: boolean;
}

const INITIAL_EVENTS: TimelineEvent[] = [
  {
    id: "e1",
    year: -221,
    title: "秦始皇统一六国",
    description: "嬴政建立中国历史上第一个大一统王朝，统一文字、度量衡和货币。",
  },
  {
    id: "e2",
    year: 105,
    title: "蔡伦改进造纸术",
    description: "东汉蔡伦用树皮、麻头等材料改进造纸工艺，使纸张大规模推广成为可能。",
  },
  {
    id: "e3",
    year: 618,
    title: "唐朝建立",
    description: "李渊在长安称帝建立唐朝，开启了中国古代最繁荣的时期之一。",
  },
  {
    id: "e4",
    year: 1405,
    title: "郑和首次下西洋",
    description: "明朝郑和率领庞大船队从南京出发，开启了七次远航的壮举。",
  },
  {
    id: "e5",
    year: -138,
    title: "张骞出使西域",
    description: "汉武帝派张骞出使西域，开辟了丝绸之路，促进东西方文明交流。",
  },
  {
    id: "e6",
    year: 1044,
    title: "火药配方首次记载",
    description: "北宋《武经总要》首次记载了火药的军事配方，是四大发明之一。",
  },
  {
    id: "e7",
    year: -551,
    title: "孔子诞生",
    description: "儒家学派创始人孔子出生于鲁国，其思想深刻影响了东亚文明。",
  },
  {
    id: "e8",
    year: 1271,
    title: "元朝建立",
    description: "忽必烈定国号为元，建立了横跨欧亚的蒙古帝国的东方部分。",
  },
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function formatYear(year: number): string {
  if (year < 0) return `公元前${Math.abs(year)}年`;
  return `公元${year}年`;
}

export function TimelineBuilder() {
  const [events, setEvents] = useState<TimelineEvent[]>(() =>
    shuffleArray(INITIAL_EVENTS),
  );
  const [checked, setChecked] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const correctOrder = [...events].sort((a, b) => a.year - b.year);
  const correctPositionMap = new Map(
    correctOrder.map((e, i) => [e.id, i]),
  );

  const score = checked
    ? events.reduce((s, e, i) => {
        return s + (correctPositionMap.get(e.id) === i ? 1 : 0);
      }, 0)
    : 0;

  const handleCheck = useCallback(() => {
    setChecked(true);
  }, []);

  function handleReset() {
    setChecked(false);
    setEvents(shuffleArray(INITIAL_EVENTS));
    setShowAddForm(false);
    setNewYear("");
    setNewTitle("");
    setNewDesc("");
  }

  function handleSortCorrectly() {
    setEvents(correctOrder);
    setChecked(true);
  }

  function handleAddEvent() {
    const yearNum = parseInt(newYear, 10);
    if (isNaN(yearNum) || !newTitle.trim()) return;
    const newEvent: TimelineEvent = {
      id: `custom_${Date.now()}`,
      year: yearNum,
      title: newTitle.trim(),
      description: newDesc.trim() || "自定义事件",
      isCustom: true,
    };
    setEvents((prev) => [...prev, newEvent]);
    setNewYear("");
    setNewTitle("");
    setNewDesc("");
    setShowAddForm(false);
    setChecked(false);
  }

  function handleRemoveCustom(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setChecked(false);
  }

  return (
    <DemoShell
      title="历史时间线排序"
      description="将打乱的历史事件按时间顺序排列，检验你的历史知识。"
      tags={["历史", "排序", "拖拽交互"]}
    >
      <div className="space-y-4">
        {/* Instructions */}
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <GripVertical className="h-4 w-4" />
          <span>拖拽事件卡片，按时间从早到晚排列</span>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <Reorder.Group
            axis="y"
            values={events}
            onReorder={(newOrder) => {
              if (!checked) setEvents(newOrder);
            }}
            className="space-y-3 relative"
          >
            {events.map((event, idx) => {
              const correctIdx = correctPositionMap.get(event.id) ?? idx;
              const isCorrect = correctIdx === idx;
              const diff = correctIdx - idx;

              return (
                <Reorder.Item
                  key={event.id}
                  value={event}
                  dragListener={!checked}
                  className="relative"
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`ml-10 rounded-lg border p-3 transition-colors cursor-grab active:cursor-grabbing ${
                      checked
                        ? isCorrect
                          ? "border-success/50 bg-success/5"
                          : "border-error/50 bg-error/5"
                        : "border-border bg-surface-alt hover:border-primary/30"
                    }`}
                  >
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 ${
                        checked
                          ? isCorrect
                            ? "bg-success border-success"
                            : "bg-error border-error"
                          : "bg-surface-alt border-primary"
                      }`}
                    />

                    <div className="flex items-start gap-3">
                      {!checked && (
                        <GripVertical className="h-4 w-4 text-text-muted shrink-0 mt-0.5" />
                      )}
                      {checked && (
                        <div className="shrink-0 mt-0.5">
                          {isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 text-error" />
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold">{event.title}</h3>
                          {event.isCustom && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/20 text-warning">
                              自定义
                            </span>
                          )}
                          {checked && (
                            <span className="text-xs font-mono text-primary-light ml-auto shrink-0">
                              {formatYear(event.year)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                          {event.description}
                        </p>
                        {checked && !isCorrect && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-error mt-1 flex items-center gap-1"
                          >
                            <ArrowDown
                              className={`h-3 w-3 ${diff < 0 ? "rotate-180" : ""}`}
                            />
                            应在{diff > 0 ? `下方第 ${diff} 位` : `上方第 ${Math.abs(diff)} 位`}
                          </motion.p>
                        )}
                      </div>
                      {event.isCustom && !checked && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCustom(event.id)}
                          className="text-text-muted hover:text-error transition-colors shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
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
                得分：{score} / {events.length}
              </p>
              <p className="text-sm text-text-muted mt-1">
                {score === events.length
                  ? "完美！你对历史的时间线了如指掌！"
                  : score >= events.length * 0.7
                    ? "不错！大部分事件排列正确。"
                    : "继续努力，多回顾历史年表吧！"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add custom event */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-lg border border-border bg-surface-alt p-4 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary-light" />
                  添加自定义事件
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    className="demo-input text-sm"
                    placeholder="年份（如 -206 或 1949）"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                  />
                  <input
                    className="demo-input text-sm"
                    placeholder="事件名称"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <input
                    className="demo-input text-sm"
                    placeholder="简要描述（可选）"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="demo-btn text-sm"
                    onClick={handleAddEvent}
                    disabled={!newYear || !newTitle.trim()}
                  >
                    添加
                  </button>
                  <button
                    type="button"
                    className="demo-btn-outline text-sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {!checked ? (
            <>
              <button
                type="button"
                className="demo-btn inline-flex items-center gap-2 text-sm"
                onClick={handleCheck}
              >
                <CheckCircle className="h-4 w-4" />
                检查顺序
              </button>
              <button
                type="button"
                className="demo-btn-outline inline-flex items-center gap-2 text-sm"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus className="h-4 w-4" />
                添加事件
              </button>
              <button
                type="button"
                className="demo-btn-outline inline-flex items-center gap-2 text-sm"
                onClick={handleSortCorrectly}
              >
                查看答案
              </button>
            </>
          ) : (
            <button
              type="button"
              className="demo-btn-outline inline-flex items-center gap-2 text-sm"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
              重新排列
            </button>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
