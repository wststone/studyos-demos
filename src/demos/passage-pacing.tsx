import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Clock, Flag, RotateCcw, CheckCircle, XCircle, ChevronLeft, ChevronRight,
  BarChart3, AlertTriangle,
} from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface Question {
  text: string;
  options: string[];
  correctIndex: number;
  type: "main-idea" | "detail" | "inference" | "vocabulary" | "evidence";
}

interface PassageData {
  title: string;
  source: string;
  text: string;
  questions: Question[];
  totalTimeSeconds: number;
}

const TYPE_LABELS: Record<string, string> = {
  "main-idea": "主旨题",
  detail: "细节题",
  inference: "推断题",
  vocabulary: "词汇题",
  evidence: "证据题",
};

const PASSAGE: PassageData = {
  title: "The Rosetta Stone and the Decipherment of Hieroglyphics",
  source: "Adapted from a history of linguistics",
  totalTimeSeconds: 480, // 8 minutes for a shorter passage
  text: `For over a thousand years, Egyptian hieroglyphics remained one of history's greatest unsolved puzzles. Medieval scholars assumed the elaborate symbols were purely pictographic — each image representing an idea rather than a sound. This misconception persisted well into the eighteenth century, effectively blocking any progress toward decipherment.

The breakthrough began not in a library but on a battlefield. In 1799, during Napoleon's military campaign in Egypt, French soldiers discovered a large granite slab near the town of Rashid, known in English as Rosetta. The stone bore the same decree inscribed in three scripts: hieroglyphic, Demotic (a simplified Egyptian script), and ancient Greek. Since scholars could read Greek, the stone offered the first realistic key to unlocking the hieroglyphic code.

However, the path from discovery to decipherment proved far from straightforward. Thomas Young, a British polymath, made the initial breakthrough by identifying that some hieroglyphic signs within oval frames, called cartouches, represented royal names — specifically the name Ptolemy. Young correctly recognized that these particular signs were phonetic, representing sounds rather than ideas. Yet he failed to generalize this insight, continuing to believe that most hieroglyphics were ideographic.

It was Jean-François Champollion, a French linguist with a deep knowledge of Coptic — the latest form of the ancient Egyptian language — who achieved the full decipherment in 1822. Champollion realized that hieroglyphics operated on a dual system: some signs were indeed ideographic, but many others were phonetic, representing consonantal sounds. His knowledge of Coptic allowed him to connect the ancient signs to a living linguistic tradition, providing pronunciation clues unavailable to other scholars.

Champollion's achievement was not merely linguistic but conceptual. He overturned centuries of assumption by demonstrating that hieroglyphics were not a primitive picture-language but a sophisticated writing system combining logographic and alphabetic elements — structurally more similar to Chinese or Japanese writing than scholars had imagined.`,
  questions: [
    {
      text: "The primary purpose of the passage is to",
      options: [
        "compare the linguistic contributions of Young and Champollion",
        "describe how Egyptian hieroglyphics were finally decoded",
        "argue that the Rosetta Stone was the most important archaeological discovery in history",
        "explain why medieval scholars failed to understand ancient Egypt",
      ],
      correctIndex: 1,
      type: "main-idea",
    },
    {
      text: "According to the passage, what was the key misconception that prevented earlier decipherment?",
      options: [
        "Scholars believed hieroglyphics were a form of ancient Greek",
        "Researchers lacked access to Egyptian artifacts",
        "Scholars assumed the symbols represented ideas rather than sounds",
        "The Egyptian government restricted access to ancient texts",
      ],
      correctIndex: 2,
      type: "detail",
    },
    {
      text: "As used in the passage, \"cartouches\" (paragraph 3) most nearly refers to",
      options: [
        "decorative borders used in Egyptian art",
        "oval frames containing hieroglyphic signs",
        "ancient Egyptian greeting phrases",
        "a type of stone tablet used for record keeping",
      ],
      correctIndex: 1,
      type: "vocabulary",
    },
    {
      text: "It can be inferred from the passage that Champollion succeeded where Young failed primarily because Champollion",
      options: [
        "had access to more artifacts than Young",
        "received greater financial support for his research",
        "possessed relevant linguistic knowledge that Young lacked",
        "was more familiar with the Rosetta Stone's Greek text",
      ],
      correctIndex: 2,
      type: "inference",
    },
    {
      text: "Which statement best describes Young's contribution as presented in the passage?",
      options: [
        "He completed the decipherment but did not publish his findings",
        "He made a partial breakthrough but did not fully extend it",
        "He proved that all hieroglyphics were phonetic symbols",
        "He discovered the Rosetta Stone during Napoleon's campaign",
      ],
      correctIndex: 1,
      type: "evidence",
    },
    {
      text: "The author mentions Chinese and Japanese writing in the last paragraph in order to",
      options: [
        "suggest that Egyptian culture influenced East Asian writing",
        "argue that all ancient writing systems are fundamentally similar",
        "illustrate the sophistication of the hieroglyphic system",
        "compare the difficulty of learning different writing systems",
      ],
      correctIndex: 2,
      type: "inference",
    },
  ],
};

export function PassagePacing() {
  const [phase, setPhase] = useState<"reading" | "answering" | "review">("reading");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [elapsed, setElapsed] = useState(0);
  const [questionTimes, setQuestionTimes] = useState<number[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const passage = PASSAGE;
  const totalQ = passage.questions.length;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= passage.totalTimeSeconds) {
            stopTimer();
            setIsRunning(false);
            return passage.totalTimeSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return stopTimer;
  }, [isRunning, passage.totalTimeSeconds, stopTimer]);

  function startTest() {
    setPhase("answering");
    setIsRunning(true);
    setQuestionStartTime(0);
    setQuestionTimes(new Array(totalQ).fill(0));
  }

  function recordTime() {
    const timeOnQ = elapsed - questionStartTime;
    setQuestionTimes((prev) => {
      const next = [...prev];
      next[currentQuestion] = (next[currentQuestion] || 0) + timeOnQ;
      return next;
    });
    setQuestionStartTime(elapsed);
  }

  function goToQuestion(index: number) {
    if (phase !== "answering") return;
    recordTime();
    setCurrentQuestion(index);
  }

  function handleAnswer(optionIndex: number) {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: optionIndex }));
  }

  function toggleFlag() {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion)) next.delete(currentQuestion);
      else next.add(currentQuestion);
      return next;
    });
  }

  function handleSubmit() {
    recordTime();
    stopTimer();
    setIsRunning(false);
    setPhase("review");
  }

  function handleReset() {
    stopTimer();
    setPhase("reading");
    setCurrentQuestion(0);
    setAnswers({});
    setFlagged(new Set());
    setElapsed(0);
    setQuestionTimes([]);
    setQuestionStartTime(0);
    setIsRunning(false);
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const remainingTime = passage.totalTimeSeconds - elapsed;
  const timePct = (elapsed / passage.totalTimeSeconds) * 100;
  const answeredCount = Object.keys(answers).length;
  const targetPace = passage.totalTimeSeconds / totalQ;

  const correctCount = phase === "review"
    ? passage.questions.filter((q, i) => answers[i] === q.correctIndex).length
    : 0;

  // Timer color
  const timerColor = remainingTime > passage.totalTimeSeconds * 0.5 ? "bg-success" : remainingTime > passage.totalTimeSeconds * 0.2 ? "bg-warning" : "bg-error";

  return (
    <DemoShell
      title="阅读节奏训练器"
      description="模拟 SAT 阅读限时答题，分析每题用时与答题策略"
      tags={["SAT", "阅读", "节奏", "策略"]}
    >
      <div className="space-y-5">
        {phase === "reading" && (
          <>
            <div className="rounded-lg border border-border bg-surface-alt p-4">
              <h3 className="font-medium text-sm mb-1">{passage.title}</h3>
              <p className="text-xs text-text-muted mb-3">{passage.source}</p>
              <div className="text-sm leading-7 whitespace-pre-line">{passage.text}</div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="demo-btn" onClick={startTest}>
                开始答题（{formatTime(passage.totalTimeSeconds)}）
              </button>
              <span className="text-xs text-text-muted">{totalQ} 道题，建议每题 {Math.round(targetPace)} 秒</span>
            </div>
          </>
        )}

        {phase === "answering" && (
          <>
            {/* Timer bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span className={`font-mono font-bold ${remainingTime <= 60 ? "text-error" : ""}`}>
                    {formatTime(remainingTime)}
                  </span>
                </div>
                <span className="text-text-muted">已答 {answeredCount}/{totalQ}</span>
              </div>
              <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden">
                <motion.div className={`h-full ${timerColor} rounded-full`} style={{ width: `${100 - timePct}%` }} />
              </div>
            </div>

            {/* Question navigation */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {passage.questions.map((_, i) => {
                const isCurrent = i === currentQuestion;
                const isAnswered = answers[i] !== undefined;
                const isFlagged = flagged.has(i);
                let cls = "w-8 h-8 rounded-md border text-xs font-medium transition-all relative ";
                if (isCurrent) cls += "border-primary bg-primary/15 text-primary-light";
                else if (isAnswered) cls += "border-success/50 bg-success/10 text-success";
                else cls += "border-border hover:border-primary/40";
                return (
                  <button key={i} type="button" className={cls} onClick={() => goToQuestion(i)}>
                    {i + 1}
                    {isFlagged && <Flag className="w-2.5 h-2.5 text-warning absolute -top-1 -right-1" />}
                  </button>
                );
              })}
            </div>

            {/* Passage (collapsible) + Question */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-surface-alt p-4 max-h-96 overflow-y-auto">
                <p className="text-xs text-text-muted mb-2">{passage.title}</p>
                <div className="text-sm leading-7 whitespace-pre-line">{passage.text}</div>
              </div>

              <div>
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-text-muted">
                      Question {currentQuestion + 1} of {totalQ}
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-surface-alt">{TYPE_LABELS[passage.questions[currentQuestion].type]}</span>
                    </span>
                    <button
                      type="button"
                      onClick={toggleFlag}
                      className={`text-xs flex items-center gap-1 px-2 py-1 rounded border transition-all ${
                        flagged.has(currentQuestion) ? "border-warning bg-warning/10 text-warning" : "border-border hover:border-warning/50"
                      }`}
                    >
                      <Flag className="w-3 h-3" />
                      {flagged.has(currentQuestion) ? "已标记" : "标记"}
                    </button>
                  </div>

                  <p className="text-sm font-medium mb-3">{passage.questions[currentQuestion].text}</p>

                  <div className="space-y-2">
                    {passage.questions[currentQuestion].options.map((opt, oi) => {
                      const isSelected = answers[currentQuestion] === oi;
                      return (
                        <button
                          key={oi}
                          type="button"
                          onClick={() => handleAnswer(oi)}
                          className={`w-full text-left p-2.5 rounded-md border text-sm transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary-light"
                              : "border-border hover:border-primary/40 cursor-pointer"
                          }`}
                        >
                          <span className="text-text-muted mr-2">{String.fromCharCode(65 + oi)}.</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-4">
                    <button
                      type="button"
                      className="demo-btn-outline text-sm flex items-center gap-1"
                      disabled={currentQuestion === 0}
                      onClick={() => goToQuestion(currentQuestion - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" /> 上一题
                    </button>
                    {currentQuestion < totalQ - 1 ? (
                      <button
                        type="button"
                        className="demo-btn text-sm flex items-center gap-1"
                        onClick={() => goToQuestion(currentQuestion + 1)}
                      >
                        下一题 <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button type="button" className="demo-btn text-sm" onClick={handleSubmit}>
                        提交
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {phase === "review" && (
          <>
            {/* Score summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-surface-alt p-6 text-center"
            >
              <p className="text-3xl font-bold">{correctCount} / {totalQ}</p>
              <p className="text-sm text-text-muted mt-1">总用时 {formatTime(elapsed)}</p>
            </motion.div>

            {/* Pacing chart */}
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-primary-light" />
                <h3 className="text-sm font-medium">每题用时分析</h3>
              </div>
              <div className="space-y-2">
                {passage.questions.map((q, i) => {
                  const time = questionTimes[i] || 0;
                  const isCorrect = answers[i] === q.correctIndex;
                  const isSlow = time > targetPace * 1.5;
                  const maxTime = Math.max(...questionTimes, targetPace * 2);
                  const barPct = Math.min((time / maxTime) * 100, 100);

                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs w-6 text-right text-text-muted">{i + 1}</span>
                      <div className="flex-1 h-6 bg-surface-alt rounded overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barPct}%` }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          className={`h-full rounded ${isCorrect ? "bg-success/40" : "bg-error/40"}`}
                        />
                        {/* Target pace line */}
                        <div
                          className="absolute top-0 bottom-0 w-px bg-text-muted/30"
                          style={{ left: `${(targetPace / maxTime) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-mono w-10 ${isSlow ? "text-warning font-bold" : "text-text-muted"}`}>
                        {formatTime(time)}
                      </span>
                      <span className="w-14 text-xs text-text-muted">{TYPE_LABELS[q.type]}</span>
                      {isCorrect ? (
                        <CheckCircle className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-error" />
                      )}
                      {flagged.has(i) && <Flag className="w-3 h-3 text-warning" />}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
                <div className="w-px h-3 bg-text-muted/30" />
                <span>虚线 = 目标节奏 ({Math.round(targetPace)}s/题)</span>
              </div>
            </div>

            {/* Strategy insights */}
            <div className="rounded-lg border border-border p-4 space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" /> 策略分析
              </h3>
              {(() => {
                const insights: string[] = [];
                const slowQs = questionTimes.filter((t) => t > targetPace * 1.5).length;
                const fastCorrect = passage.questions.filter((q, i) => answers[i] === q.correctIndex && (questionTimes[i] || 0) < targetPace).length;
                const slowWrong = passage.questions.filter((q, i) => answers[i] !== q.correctIndex && (questionTimes[i] || 0) > targetPace * 1.5).length;

                if (slowQs > 0) insights.push(`${slowQs} 道题超过目标时间 — 考虑先跳过难题，最后回来`);
                if (fastCorrect > 0) insights.push(`${fastCorrect} 道题在目标时间内正确完成 — 节奏很好`);
                if (slowWrong > 0) insights.push(`${slowWrong} 道题花了很长时间但答错了 — 这些时间可以更好地分配`);
                if (flagged.size > 0) insights.push(`标记了 ${flagged.size} 道题 — 合理使用标记功能`);
                if (elapsed < passage.totalTimeSeconds * 0.7) insights.push("总用时远低于限时 — 可以放慢节奏更仔细审题");
                if (insights.length === 0) insights.push("整体节奏均衡，继续保持！");

                return insights.map((ins, i) => (
                  <p key={i} className="text-sm text-text-muted">• {ins}</p>
                ));
              })()}
            </div>

            {/* Answer review */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">答案复盘</h3>
              {passage.questions.map((q, i) => {
                const isCorrect = answers[i] === q.correctIndex;
                return (
                  <div key={i} className={`rounded-lg border p-3 ${isCorrect ? "border-success/30 bg-success/5" : "border-error/30 bg-error/5"}`}>
                    <div className="flex items-start gap-2">
                      {isCorrect ? <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />}
                      <div className="text-sm">
                        <p className="font-medium">{i + 1}. {q.text}</p>
                        {!isCorrect && (
                          <p className="mt-1">
                            <span className="text-error line-through text-xs">{q.options[answers[i]] ?? "(未作答)"}</span>
                            <span className="mx-1 text-text-muted">→</span>
                            <span className="text-success text-xs">{q.options[q.correctIndex]}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button type="button" className="demo-btn-outline flex items-center gap-1.5" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" /> 重新练习
            </button>
          </>
        )}
      </div>
    </DemoShell>
  );
}
