import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, Play, Pause, RotateCcw, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface LectureData {
  title: string;
  topic: string;
  sentences: string[];
  /** Seconds between each sentence reveal */
  paceSeconds: number;
  keyPoints: string[];
  questions: {
    text: string;
    options: string[];
    correctIndex: number;
    relatedKeyPoint: number;
  }[];
  modelNotes: {
    mainTopic: string;
    keyPoints: string[];
    details: string;
  };
}

const LECTURES: LectureData[] = [
  {
    title: "Coral Reef Bleaching",
    topic: "Marine Biology",
    paceSeconds: 4,
    sentences: [
      "Today we'll discuss coral reef bleaching, one of the most visible indicators of ocean health decline.",
      "Coral reefs are often called the rainforests of the sea — they cover less than one percent of the ocean floor but support roughly 25 percent of all marine species.",
      "The vibrant colors we associate with healthy coral actually come from tiny algae called zooxanthellae that live within coral tissue.",
      "These algae aren't just decorative — they provide up to 90 percent of the energy coral needs to survive through photosynthesis.",
      "When ocean temperatures rise even one to two degrees Celsius above the normal summer maximum, corals become stressed and expel their zooxanthellae.",
      "This expulsion is what we call bleaching — the coral turns white because without the algae, the transparent tissue reveals the white calcium carbonate skeleton underneath.",
      "Now, bleaching doesn't mean the coral is dead immediately. If temperatures return to normal within a few weeks, the algae can recolonize and the coral may recover.",
      "However, if the elevated temperatures persist for eight weeks or longer, the coral typically starves and dies.",
      "The Great Barrier Reef has experienced mass bleaching events in 2016, 2017, 2020, and 2022, with each event affecting a larger area.",
      "Scientists estimate that we've already lost approximately 50 percent of the world's coral reefs since 1950.",
      "Current projections suggest that if global temperatures rise by 1.5 degrees Celsius, we could lose 70 to 90 percent of remaining reefs.",
      "Some researchers are exploring heat-resistant coral strains and assisted evolution, but these solutions remain experimental.",
    ],
    keyPoints: [
      "Zooxanthellae algae provide 90% of coral energy",
      "Bleaching occurs when temps rise 1-2°C above normal",
      "Coral can recover if temps normalize within weeks",
      "50% of reefs already lost since 1950",
      "1.5°C rise could destroy 70-90% of remaining reefs",
    ],
    questions: [
      {
        text: "What is the primary role of zooxanthellae in coral reefs?",
        options: [
          "They create the reef's physical structure",
          "They provide most of the coral's energy through photosynthesis",
          "They protect coral from predators",
          "They regulate ocean temperature around the reef",
        ],
        correctIndex: 1,
        relatedKeyPoint: 0,
      },
      {
        text: "Under what condition can bleached coral potentially recover?",
        options: [
          "If nutrients are added to the water",
          "If new zooxanthellae are introduced artificially",
          "If water temperatures return to normal within a few weeks",
          "If the coral is relocated to deeper water",
        ],
        correctIndex: 2,
        relatedKeyPoint: 2,
      },
      {
        text: "What does the lecturer suggest about the future of coral reefs?",
        options: [
          "New technology will fully solve the problem",
          "Coral reefs are adapting naturally to warmer temperatures",
          "Most remaining reefs could be lost with moderate warming",
          "Only the Great Barrier Reef is seriously threatened",
        ],
        correctIndex: 2,
        relatedKeyPoint: 4,
      },
      {
        text: "What percentage of marine species do coral reefs support?",
        options: [
          "About 10 percent",
          "About 25 percent",
          "About 50 percent",
          "About 75 percent",
        ],
        correctIndex: 1,
        relatedKeyPoint: 0,
      },
    ],
    modelNotes: {
      mainTopic: "Coral reef bleaching — causes, process, and outlook",
      keyPoints: [
        "Zooxanthellae algae live in coral, provide 90% energy via photosynthesis",
        "1-2°C temp rise → coral expels algae → bleaching (white skeleton visible)",
        "Recoverable if temp normalizes within weeks, dies if >8 weeks",
        "Great Barrier Reef bleached 2016, 2017, 2020, 2022",
        "50% reefs gone since 1950; 1.5°C rise → 70-90% loss",
        "Heat-resistant strains being researched but still experimental",
      ],
      details: "Reefs = <1% ocean floor but 25% of marine species. Bleaching = expulsion of algae, not immediate death.",
    },
  },
];

export function ListeningNotepad() {
  const [phase, setPhase] = useState<"listening" | "answering" | "review">("listening");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [notes, setNotes] = useState({ mainTopic: "", keyPoints: ["", "", "", "", ""], details: "" });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showTranscript, setShowTranscript] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lectureRef = useRef<HTMLDivElement>(null);

  const lecture = LECTURES[0];

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startPlayback = useCallback(() => {
    setIsPlaying(true);
    timerRef.current = setInterval(() => {
      setCurrentLine((prev) => {
        const next = prev + 1;
        if (next >= lecture.sentences.length) {
          stopTimer();
          setIsPlaying(false);
          return prev;
        }
        return next;
      });
    }, lecture.paceSeconds * 1000);
  }, [lecture.sentences.length, lecture.paceSeconds, stopTimer]);

  useEffect(() => {
    return stopTimer;
  }, [stopTimer]);

  // Auto-scroll to latest line
  useEffect(() => {
    if (lectureRef.current && currentLine >= 0) {
      const el = lectureRef.current.querySelector(`[data-line="${currentLine}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentLine]);

  function handlePlayPause() {
    if (isPlaying) {
      stopTimer();
      setIsPlaying(false);
    } else {
      if (currentLine < 0) setCurrentLine(0);
      startPlayback();
    }
  }

  function handleFinishListening() {
    stopTimer();
    setIsPlaying(false);
    setPhase("answering");
  }

  function handleSubmitAnswers() {
    setPhase("review");
  }

  function handleReset() {
    stopTimer();
    setIsPlaying(false);
    setCurrentLine(-1);
    setNotes({ mainTopic: "", keyPoints: ["", "", "", "", ""], details: "" });
    setAnswers({});
    setShowTranscript(false);
    setPhase("listening");
  }

  const allAnswered = lecture.questions.every((_, i) => answers[i] !== undefined);
  const correctCount = phase === "review"
    ? lecture.questions.filter((q, i) => answers[i] === q.correctIndex).length
    : 0;
  const isDone = currentLine >= lecture.sentences.length - 1 && !isPlaying;

  const progressPct = currentLine < 0 ? 0 : ((currentLine + 1) / lecture.sentences.length) * 100;

  return (
    <DemoShell
      title="听力笔记板"
      description="模拟 TOEFL 听力：边听边记笔记，仅凭笔记答题"
      tags={["TOEFL", "听力", "笔记", "策略训练"]}
    >
      <div className="space-y-5">
        {/* Phase indicator */}
        <div className="flex items-center gap-2">
          {["listening", "answering", "review"].map((p, i) => (
            <div key={p} className="flex items-center gap-2">
              {i > 0 && <div className="w-6 h-px bg-border" />}
              <span className={`text-xs px-2 py-1 rounded ${phase === p ? "bg-primary/15 text-primary-light font-medium" : "text-text-muted"}`}>
                {p === "listening" ? "① 听讲" : p === "answering" ? "② 答题" : "③ 复盘"}
              </span>
            </div>
          ))}
        </div>

        {phase === "listening" && (
          <>
            {/* Audio simulation */}
            <div className="rounded-lg border border-border bg-surface-alt p-4">
              <div className="flex items-center gap-3 mb-3">
                <Headphones className="w-5 h-5 text-primary-light" />
                <span className="text-sm font-medium">{lecture.title}</span>
                <span className="text-xs text-text-muted ml-auto">{lecture.topic}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden mb-3">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Playback controls */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="demo-btn flex items-center gap-1.5 text-sm"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? "暂停" : currentLine < 0 ? "开始播放" : "继续"}
                </button>
                {isDone && (
                  <button
                    type="button"
                    className="demo-btn flex items-center gap-1.5 text-sm"
                    onClick={handleFinishListening}
                  >
                    进入答题
                  </button>
                )}
                <span className="text-xs text-text-muted ml-auto">
                  {currentLine < 0 ? 0 : currentLine + 1} / {lecture.sentences.length} 句
                </span>
              </div>

              {/* Transcript (auto-reveal) */}
              {currentLine >= 0 && (
                <div ref={lectureRef} className="mt-4 max-h-48 overflow-y-auto space-y-1.5 pr-2">
                  {lecture.sentences.slice(0, currentLine + 1).map((s, i) => (
                    <motion.p
                      key={i}
                      data-line={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: i === currentLine ? 1 : 0.5, x: 0 }}
                      className={`text-sm ${i === currentLine ? "text-text font-medium" : "text-text-muted"}`}
                    >
                      {s}
                    </motion.p>
                  ))}
                </div>
              )}
            </div>

            {/* Note-taking template */}
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-sm font-medium mb-3">笔记区</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Main Topic</label>
                  <input
                    type="text"
                    className="demo-input w-full text-sm"
                    placeholder="What is this lecture about?"
                    value={notes.mainTopic}
                    onChange={(e) => setNotes((prev) => ({ ...prev, mainTopic: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Key Points</label>
                  {notes.keyPoints.map((kp, i) => (
                    <input
                      key={i}
                      type="text"
                      className="demo-input w-full text-sm mb-1.5"
                      placeholder={`Key point ${i + 1}`}
                      value={kp}
                      onChange={(e) => {
                        const newKP = [...notes.keyPoints];
                        newKP[i] = e.target.value;
                        setNotes((prev) => ({ ...prev, keyPoints: newKP }));
                      }}
                    />
                  ))}
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Details / Examples</label>
                  <textarea
                    className="demo-input w-full text-sm h-16 resize-none"
                    placeholder="Important details, numbers, examples..."
                    value={notes.details}
                    onChange={(e) => setNotes((prev) => ({ ...prev, details: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {phase === "answering" && (
          <>
            {/* Show student notes (read-only) */}
            <div className="rounded-lg border border-border bg-surface-alt p-4">
              <h3 className="text-sm font-medium mb-2">你的笔记（仅凭笔记答题）</h3>
              {notes.mainTopic && <p className="text-sm mb-1"><span className="text-text-muted">Topic:</span> {notes.mainTopic}</p>}
              {notes.keyPoints.filter(Boolean).map((kp, i) => (
                <p key={i} className="text-sm text-text-muted">• {kp}</p>
              ))}
              {notes.details && <p className="text-sm mt-1 text-text-muted italic">{notes.details}</p>}
              {!notes.mainTopic && !notes.keyPoints.some(Boolean) && !notes.details && (
                <p className="text-sm text-text-muted italic">（未记录笔记）</p>
              )}
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {lecture.questions.map((q, qi) => (
                <div key={qi} className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">{qi + 1}. {q.text}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = answers[qi] === oi;
                      return (
                        <button
                          key={oi}
                          type="button"
                          onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
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
                </div>
              ))}
            </div>

            <button type="button" className="demo-btn" disabled={!allAnswered} onClick={handleSubmitAnswers}>
              提交答案
            </button>
          </>
        )}

        {phase === "review" && (
          <>
            {/* Score */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-surface-alt p-4 text-center"
            >
              <p className="text-2xl font-bold">{correctCount} / {lecture.questions.length}</p>
              <p className="text-sm text-text-muted mt-1">
                {correctCount === lecture.questions.length ? "全部正确！笔记策略很有效" : "复盘笔记，找出遗漏的要点"}
              </p>
            </motion.div>

            {/* Question review */}
            <div className="space-y-3">
              {lecture.questions.map((q, qi) => {
                const isCorrect = answers[qi] === q.correctIndex;
                return (
                  <div key={qi} className={`rounded-lg border p-3 ${isCorrect ? "border-success/30 bg-success/5" : "border-error/30 bg-error/5"}`}>
                    <div className="flex items-start gap-2">
                      {isCorrect ? <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />}
                      <div className="text-sm">
                        <p className="font-medium">{q.text}</p>
                        {!isCorrect && (
                          <p className="mt-1 text-text-muted">
                            <span className="text-error line-through">{q.options[answers[qi]]}</span>
                            <span className="mx-1">→</span>
                            <span className="text-success">{q.options[q.correctIndex]}</span>
                          </p>
                        )}
                        <p className="mt-1 text-xs text-text-muted">
                          相关要点：{lecture.keyPoints[q.relatedKeyPoint]}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Key points coverage */}
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-sm font-medium mb-2">关键要点覆盖</h3>
              <div className="space-y-1.5">
                {lecture.keyPoints.map((kp, i) => {
                  const captured = notes.keyPoints.some(
                    (nkp) => nkp && kp.toLowerCase().split(" ").some((word) => word.length > 3 && nkp.toLowerCase().includes(word))
                  ) || (notes.details && kp.toLowerCase().split(" ").some((word) => word.length > 3 && notes.details.toLowerCase().includes(word)));
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {captured ? (
                        <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-error shrink-0" />
                      )}
                      <span className={captured ? "" : "text-text-muted"}>{kp}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Model notes comparison */}
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">范例笔记</h3>
              </div>
              <div className="text-sm space-y-1 text-text-muted">
                <p><span className="font-medium text-text">Topic:</span> {lecture.modelNotes.mainTopic}</p>
                {lecture.modelNotes.keyPoints.map((kp, i) => (
                  <p key={i}>• {kp}</p>
                ))}
                <p className="italic mt-1">{lecture.modelNotes.details}</p>
              </div>
            </div>

            {/* Full transcript toggle */}
            <div>
              <button
                type="button"
                className="demo-btn-outline flex items-center gap-1.5 text-sm"
                onClick={() => setShowTranscript(!showTranscript)}
              >
                {showTranscript ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showTranscript ? "隐藏原文" : "查看完整原文"}
              </button>
              <AnimatePresence>
                {showTranscript && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 rounded-lg border border-border bg-surface-alt p-4 text-sm leading-7 overflow-hidden"
                  >
                    {lecture.sentences.map((s, i) => (
                      <p key={i} className="mb-1">{s}</p>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
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
