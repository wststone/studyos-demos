import { useState, useRef, useEffect, useCallback } from "react";
import { DemoShell } from "@/components/demo-shell";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Save, CheckCircle, AlertTriangle } from "lucide-react";

const TOPIC = "描述你最难忘的一次旅行经历";
const TIME_OPTIONS = [
  { label: "10分钟", value: 600 },
  { label: "15分钟", value: 900 },
  { label: "30分钟", value: 1800 },
];

export function TimedWriting() {
  const [totalTime, setTotalTime] = useState(600);
  const [remaining, setRemaining] = useState(600);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [text, setText] = useState("");
  const [autoSaved, setAutoSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isWarning = remaining <= 120 && remaining > 0;

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const progress = remaining / totalTime;

  const start = useCallback(() => {
    setStarted(true);
    setFinished(false);
    setRemaining(totalTime);
    setText("");
  }, [totalTime]);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStarted(false);
    setFinished(false);
    setRemaining(totalTime);
    setText("");
  }, [totalTime]);

  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timerRef.current!);
          setFinished(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, finished]);

  // Mock auto-save
  useEffect(() => {
    if (!started || finished) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    setAutoSaved(false);
    autoSaveRef.current = setTimeout(() => {
      setAutoSaved(true);
    }, 1500);
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [text, started, finished]);

  return (
    <DemoShell
      title="限时写作"
      description="在限定时间内完成作文，锻炼快速表达能力"
      tags={["写作", "限时", "语文"]}
    >
      <div className="space-y-5">
        {/* Topic */}
        <div className="rounded-lg bg-surface-alt border border-border p-4">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">作文题目</p>
          <p className="text-lg font-semibold">{TOPIC}</p>
        </div>

        {!started ? (
          <div className="space-y-4">
            {/* Time selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-muted">时长：</span>
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTotalTime(opt.value);
                    setRemaining(opt.value);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    totalTime === opt.value
                      ? "bg-primary text-white"
                      : "bg-surface-alt text-text-muted hover:bg-surface-hover"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button className="demo-btn" onClick={start}>
              开始写作
            </button>
          </div>
        ) : (
          <>
            {/* Timer bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isWarning ? "text-warning" : "text-text-muted"}`} />
                  <span
                    className={`font-mono text-base ${isWarning ? "text-warning font-bold" : ""} ${finished ? "text-error" : ""}`}
                  >
                    {fmt(remaining)}
                  </span>
                  {isWarning && !finished && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-1 text-warning text-xs"
                    >
                      <AlertTriangle className="w-3 h-3" /> 时间即将用尽！
                    </motion.span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-text-muted text-xs">
                  <span>{charCount} 字</span>
                  <span>{wordCount} 词</span>
                  <AnimatePresence>
                    {autoSaved && !finished && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1 text-success"
                      >
                        <Save className="w-3 h-3" /> 已保存
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="h-2 rounded-full bg-surface-alt overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isWarning ? "bg-warning" : "bg-primary"} ${finished ? "!bg-error" : ""}`}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              readOnly={finished}
              placeholder="开始你的写作..."
              className={`demo-input w-full h-64 resize-none text-base leading-relaxed transition-colors ${
                isWarning && !finished ? "!border-warning" : ""
              } ${finished ? "opacity-70 cursor-not-allowed" : ""}`}
            />

            {/* Finished overlay */}
            <AnimatePresence>
              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-success/40 bg-success/10 p-5 flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">时间到！已自动提交</p>
                    <p className="text-sm text-text-muted mt-1">
                      共写了 {charCount} 个字，{wordCount} 个词。你的作文已保存。
                    </p>
                    <button className="demo-btn mt-3 text-sm" onClick={reset}>
                      再来一次
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </DemoShell>
  );
}
