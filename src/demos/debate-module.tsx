import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  Send,
  Timer,
  Trophy,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface Argument {
  id: number;
  side: "for" | "against";
  text: string;
  author: string;
  upvotes: number;
  downvotes: number;
}

const TOPIC = "人工智能会取代大多数工作吗？";

const INITIAL_ARGUMENTS: Argument[] = [
  {
    id: 1,
    side: "for",
    text: "AI在数据处理、模式识别等领域已超越人类，自动化将不可避免地取代重复性工作。",
    author: "张同学",
    upvotes: 12,
    downvotes: 3,
  },
  {
    id: 2,
    side: "for",
    text: "历史上每次技术革命都消灭了大量旧岗位，AI革命的规模更大、速度更快。",
    author: "李同学",
    upvotes: 8,
    downvotes: 5,
  },
  {
    id: 3,
    side: "for",
    text: "AI不需要休息、不会犯人为错误，企业从成本角度必然选择AI替代人力。",
    author: "王同学",
    upvotes: 6,
    downvotes: 4,
  },
  {
    id: 4,
    side: "against",
    text: "AI缺乏真正的创造力和情感理解，艺术、心理咨询等领域无法被取代。",
    author: "赵同学",
    upvotes: 15,
    downvotes: 2,
  },
  {
    id: 5,
    side: "against",
    text: "新技术总会创造新的工作岗位，就像互联网催生了程序员、设计师等新职业。",
    author: "孙同学",
    upvotes: 10,
    downvotes: 4,
  },
  {
    id: 6,
    side: "against",
    text: "人类的社交需求决定了许多服务行业（教育、医疗、护理）仍需要人与人的互动。",
    author: "周同学",
    upvotes: 9,
    downvotes: 3,
  },
];

const ROUND_DURATION = 120;

export function DebateModule() {
  const [args, setArgs] = useState<Argument[]>(INITIAL_ARGUMENTS);
  const [inputFor, setInputFor] = useState("");
  const [inputAgainst, setInputAgainst] = useState("");
  const [vote, setVote] = useState<"for" | "against" | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [nextId, setNextId] = useState(7);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setTimerActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const forArgs = args.filter((a) => a.side === "for");
  const againstArgs = args.filter((a) => a.side === "against");

  const totalVotes = args.reduce((s, a) => s + a.upvotes, 0);
  const forVotes = forArgs.reduce((s, a) => s + a.upvotes, 0);
  const forPercent = totalVotes > 0 ? Math.round((forVotes / totalVotes) * 100) : 50;

  const handleVote = useCallback(
    (id: number, type: "up" | "down") => {
      setArgs((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                upvotes: type === "up" ? a.upvotes + 1 : a.upvotes,
                downvotes: type === "down" ? a.downvotes + 1 : a.downvotes,
              }
            : a,
        ),
      );
    },
    [],
  );

  function submitArgument(side: "for" | "against") {
    const text = side === "for" ? inputFor : inputAgainst;
    if (!text.trim()) return;
    setArgs((prev) => [
      ...prev,
      {
        id: nextId,
        side,
        text: text.trim(),
        author: "我",
        upvotes: 0,
        downvotes: 0,
      },
    ]);
    setNextId((n) => n + 1);
    if (side === "for") setInputFor("");
    else setInputAgainst("");
  }

  const bestFor = [...forArgs].sort((a, b) => b.upvotes - a.upvotes)[0];
  const bestAgainst = [...againstArgs].sort((a, b) => b.upvotes - a.upvotes)[0];

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function renderArgumentCard(arg: Argument, idx: number) {
    return (
      <motion.div
        key={arg.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="rounded-lg border border-border bg-surface-alt p-3 space-y-2"
      >
        <p className="text-sm leading-relaxed">{arg.text}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">{arg.author}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleVote(arg.id, "up")}
              className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-success transition-colors"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              {arg.upvotes}
            </button>
            <button
              type="button"
              onClick={() => handleVote(arg.id, "down")}
              className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-error transition-colors"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              {arg.downvotes}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <DemoShell
      title="辩论模块"
      description="围绕争议话题展开辩论，提交论点并投票评判。"
      tags={["批判性思维", "辩论", "协作学习"]}
    >
      {/* Topic & Timer */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide mb-1">辩题</p>
          <h2 className="text-lg font-bold">{TOPIC}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-alt px-3 py-2">
            <Timer className="h-4 w-4 text-primary-light" />
            <span className={`font-mono text-sm font-bold ${timeLeft <= 10 && timerActive ? "text-error" : ""}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <button
            type="button"
            className="demo-btn-outline text-sm inline-flex items-center gap-1"
            onClick={() => {
              if (timerActive) {
                setTimerActive(false);
              } else {
                if (timeLeft === 0) setTimeLeft(ROUND_DURATION);
                setTimerActive(true);
              }
            }}
          >
            {timerActive ? "暂停" : timeLeft === 0 ? "重置" : "开始"}
          </button>
        </div>
      </div>

      {/* Two Sides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* For Side */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-success/20 text-success text-xs font-bold">
              正
            </span>
            <h3 className="font-semibold text-success">正方</h3>
            <span className="text-xs text-text-muted">({forArgs.length} 条论点)</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {forArgs.map((a, i) => renderArgumentCard(a, i))}
          </div>
          <div className="flex gap-2">
            <input
              className="demo-input flex-1 text-sm"
              placeholder="输入正方论点..."
              value={inputFor}
              onChange={(e) => setInputFor(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitArgument("for")}
            />
            <button
              type="button"
              className="demo-btn inline-flex items-center gap-1 text-sm"
              onClick={() => submitArgument("for")}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Against Side */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-error/20 text-error text-xs font-bold">
              反
            </span>
            <h3 className="font-semibold text-error">反方</h3>
            <span className="text-xs text-text-muted">({againstArgs.length} 条论点)</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {againstArgs.map((a, i) => renderArgumentCard(a, i))}
          </div>
          <div className="flex gap-2">
            <input
              className="demo-input flex-1 text-sm"
              placeholder="输入反方论点..."
              value={inputAgainst}
              onChange={(e) => setInputAgainst(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitArgument("against")}
            />
            <button
              type="button"
              className="demo-btn inline-flex items-center gap-1 text-sm"
              onClick={() => submitArgument("against")}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Voting Section */}
      <div className="rounded-lg border border-border bg-surface-alt p-4 mb-6">
        <p className="text-sm font-medium mb-3">哪一方更有说服力？</p>
        <div className="flex gap-3 mb-3">
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              vote === "for"
                ? "bg-success/20 border border-success text-success"
                : "demo-btn-outline"
            }`}
            onClick={() => setVote("for")}
          >
            正方
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              vote === "against"
                ? "bg-error/20 border border-error text-error"
                : "demo-btn-outline"
            }`}
            onClick={() => setVote("against")}
          >
            反方
          </button>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-text-muted">
            <span>正方 {forPercent}%</span>
            <span>反方 {100 - forPercent}%</span>
          </div>
          <div className="h-3 rounded-full bg-surface overflow-hidden flex">
            <motion.div
              className="h-full bg-success rounded-l-full"
              initial={{ width: "50%" }}
              animate={{ width: `${forPercent}%` }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              className="h-full bg-error rounded-r-full"
              initial={{ width: "50%" }}
              animate={{ width: `${100 - forPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-primary-light" />
          <h3 className="font-semibold text-sm">最佳论点总结</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bestFor && (
            <div className="rounded-lg border border-success/30 bg-success/5 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare className="h-3.5 w-3.5 text-success" />
                <span className="text-xs font-medium text-success">正方最佳</span>
                <span className="text-xs text-text-muted ml-auto">{bestFor.upvotes} 赞</span>
              </div>
              <p className="text-sm text-text-muted">{bestFor.text}</p>
            </div>
          )}
          {bestAgainst && (
            <div className="rounded-lg border border-error/30 bg-error/5 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare className="h-3.5 w-3.5 text-error" />
                <span className="text-xs font-medium text-error">反方最佳</span>
                <span className="text-xs text-text-muted ml-auto">{bestAgainst.upvotes} 赞</span>
              </div>
              <p className="text-sm text-text-muted">{bestAgainst.text}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="demo-btn-outline inline-flex items-center gap-2 text-sm"
          onClick={() => {
            setArgs(INITIAL_ARGUMENTS);
            setVote(null);
            setInputFor("");
            setInputAgainst("");
            setTimeLeft(ROUND_DURATION);
            setTimerActive(false);
            setNextId(7);
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          重置辩论
        </button>
      </div>
    </DemoShell>
  );
}
