import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, RotateCcw, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface PassageSet {
  title: string;
  lines: string[];
  conclusions: { id: string; text: string }[];
  citations: { id: string; lineRef: string; text: string }[];
  correctPairs: Record<string, string>; // conclusionId → citationId
}

const PASSAGES: PassageSet[] = [
  {
    title: "Deep-Sea Hydrothermal Vents",
    lines: [
      "In 1977, scientists exploring the Galápagos Rift discovered thriving ecosystems",
      "in the deep ocean, existing in complete darkness thousands of meters below the surface.",
      "These communities centered around hydrothermal vents — fissures in the seafloor",
      "that release geothermally heated water rich in dissolved minerals and chemicals.",
      "Chemosynthetic bacteria at the base of these ecosystems derive energy from hydrogen",
      "sulfide rather than sunlight, forming the foundation of a unique food web.",
      "Giant tube worms, blind shrimp, and dense clusters of mussels were found thriving",
      "in conditions previously thought incompatible with complex life.",
      "The discovery fundamentally challenged the long-held assumption that all life on",
      "Earth ultimately depends on photosynthesis and solar energy.",
      "However, researchers have noted that when vent activity ceases due to shifts in",
      "tectonic processes, these biological communities collapse within months.",
    ],
    conclusions: [
      { id: "c1", text: "Life can exist without any dependence on sunlight." },
      { id: "c2", text: "The discovery changed fundamental biological assumptions." },
      { id: "c3", text: "Vent ecosystems rely on chemical energy sources." },
      { id: "c4", text: "These ecosystems are vulnerable to geological changes." },
    ],
    citations: [
      { id: "t1", lineRef: "Lines 1–2", text: "\"thriving ecosystems in the deep ocean, existing in complete darkness\"" },
      { id: "t2", lineRef: "Lines 5–6", text: "\"Chemosynthetic bacteria...derive energy from hydrogen sulfide rather than sunlight\"" },
      { id: "t3", lineRef: "Lines 9–10", text: "\"fundamentally challenged the long-held assumption that all life...depends on photosynthesis\"" },
      { id: "t4", lineRef: "Lines 11–12", text: "\"when vent activity ceases...these biological communities collapse within months\"" },
      { id: "t5", lineRef: "Lines 7–8", text: "\"Giant tube worms, blind shrimp...thriving in conditions previously thought incompatible\"" },
    ],
    correctPairs: { c1: "t1", c2: "t3", c3: "t2", c4: "t4" },
  },
  {
    title: "The Decline of Insect Populations",
    lines: [
      "A growing body of research indicates that global insect populations have declined",
      "by more than 40 percent over the past three decades, a trend some scientists have",
      "described as an \"insect apocalypse.\" Agricultural intensification, particularly the",
      "widespread use of neonicotinoid pesticides, has been identified as a primary driver",
      "of pollinator losses in both Europe and North America.",
      "Beyond direct chemical exposure, habitat fragmentation caused by urban sprawl and",
      "monoculture farming has reduced the diversity of plant species on which many",
      "insects depend for food and reproduction.",
      "The consequences extend far beyond the insects themselves: approximately 87 percent",
      "of flowering plant species require animal pollination, and insect decline threatens",
      "crop yields worth an estimated $235 billion annually worldwide.",
      "Some regions have begun implementing pesticide-free buffer zones around agricultural",
      "areas, though critics argue these measures remain insufficient given the scale of the crisis.",
    ],
    conclusions: [
      { id: "c1", text: "Pesticide use is a leading cause of insect decline." },
      { id: "c2", text: "Loss of natural habitats compounds the problem." },
      { id: "c3", text: "Insect decline has significant economic implications." },
      { id: "c4", text: "Current conservation efforts may be inadequate." },
    ],
    citations: [
      { id: "t1", lineRef: "Lines 3–5", text: "\"Agricultural intensification, particularly...neonicotinoid pesticides...identified as a primary driver\"" },
      { id: "t2", lineRef: "Lines 6–8", text: "\"habitat fragmentation caused by urban sprawl and monoculture farming has reduced the diversity\"" },
      { id: "t3", lineRef: "Lines 9–11", text: "\"insect decline threatens crop yields worth an estimated $235 billion annually\"" },
      { id: "t4", lineRef: "Lines 12–13", text: "\"critics argue these measures remain insufficient given the scale of the crisis\"" },
      { id: "t5", lineRef: "Lines 1–2", text: "\"global insect populations have declined by more than 40 percent over the past three decades\"" },
    ],
    correctPairs: { c1: "t1", c2: "t2", c3: "t3", c4: "t4" },
  },
];

export function EvidencePairing() {
  const [currentSet, setCurrentSet] = useState(0);
  const [selectedConclusion, setSelectedConclusion] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const passage = PASSAGES[currentSet];

  function handleConclusionClick(id: string) {
    if (submitted) return;
    // If already paired, unpair it
    if (pairs[id]) {
      setPairs((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }
    setSelectedConclusion(id);
  }

  function handleCitationClick(id: string) {
    if (submitted || !selectedConclusion) return;
    // Check if citation is already used
    if (Object.values(pairs).includes(id)) return;
    setPairs((prev) => ({ ...prev, [selectedConclusion]: id }));
    setSelectedConclusion(null);
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function handleReset() {
    setPairs({});
    setSelectedConclusion(null);
    setSubmitted(false);
  }

  function handleNext() {
    setCurrentSet((prev) => (prev + 1) % PASSAGES.length);
    handleReset();
  }

  const correctCount = submitted
    ? Object.entries(pairs).filter(([cId, tId]) => passage.correctPairs[cId] === tId).length
    : 0;
  const totalPairs = passage.conclusions.length;
  const pairedCitationIds = new Set(Object.values(pairs));

  return (
    <DemoShell
      title="证据配对训练"
      description="阅读文章，将每个结论与最佳支持证据配对 — 练习 SAT 阅读证据题"
      tags={["SAT", "阅读理解", "证据分析"]}
    >
      <div className="space-y-5">
        {/* Passage */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">{passage.title}</h3>
          <div className="rounded-lg border border-border bg-surface-alt p-4 text-sm leading-7 font-mono">
            {passage.lines.map((line, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-text-muted select-none w-6 text-right shrink-0">{i + 1}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
          <Link2 className="w-4 h-4 text-primary-light shrink-0 mt-0.5" />
          <p className="text-sm text-primary-light">
            {submitted
              ? "查看结果：绿色=正确配对，红色=错误配对"
              : "点击左侧结论，再点击右侧引用来配对。点击已配对的结论可取消。"}
          </p>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Conclusions */}
          <div>
            <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Conclusions</p>
            <div className="space-y-2">
              {passage.conclusions.map((c) => {
                const isPaired = !!pairs[c.id];
                const isSelected = selectedConclusion === c.id;
                const isCorrect = submitted && isPaired && passage.correctPairs[c.id] === pairs[c.id];
                const isWrong = submitted && isPaired && passage.correctPairs[c.id] !== pairs[c.id];
                const isMissed = submitted && !isPaired;

                let borderClass = "border-border";
                if (isSelected) borderClass = "border-primary ring-2 ring-primary/30";
                else if (isCorrect) borderClass = "border-success bg-success/5";
                else if (isWrong) borderClass = "border-error bg-error/5";
                else if (isPaired && !submitted) borderClass = "border-primary/50 bg-primary/5";

                return (
                  <motion.button
                    key={c.id}
                    type="button"
                    layout
                    onClick={() => handleConclusionClick(c.id)}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${borderClass} ${submitted ? "" : "cursor-pointer hover:border-primary/50"}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 mt-0.5">
                        {isCorrect && <CheckCircle className="w-4 h-4 text-success" />}
                        {isWrong && <XCircle className="w-4 h-4 text-error" />}
                        {isMissed && <XCircle className="w-4 h-4 text-text-muted" />}
                        {!submitted && isPaired && <Link2 className="w-4 h-4 text-primary-light" />}
                        {!submitted && !isPaired && <div className="w-4 h-4 rounded-full border-2 border-text-muted" />}
                      </span>
                      <span>{c.text}</span>
                    </div>
                    {isPaired && (
                      <p className="mt-1.5 ml-6 text-xs text-text-muted">
                        → {passage.citations.find((t) => t.id === pairs[c.id])?.lineRef}
                      </p>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Citations */}
          <div>
            <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Evidence</p>
            <div className="space-y-2">
              {passage.citations.map((t) => {
                const isUsed = pairedCitationIds.has(t.id);
                const isSelectable = selectedConclusion && !isUsed && !submitted;
                const pairedConclusion = Object.entries(pairs).find(([, tId]) => tId === t.id)?.[0];
                const isCorrect = submitted && pairedConclusion && passage.correctPairs[pairedConclusion] === t.id;
                const isWrong = submitted && pairedConclusion && passage.correctPairs[pairedConclusion] !== t.id;

                let borderClass = "border-border";
                if (isCorrect) borderClass = "border-success bg-success/5";
                else if (isWrong) borderClass = "border-error bg-error/5";
                else if (isUsed && !submitted) borderClass = "border-primary/50 bg-primary/5 opacity-60";
                else if (isSelectable) borderClass = "border-primary/30 hover:border-primary hover:bg-primary/5";

                return (
                  <motion.button
                    key={t.id}
                    type="button"
                    layout
                    onClick={() => handleCitationClick(t.id)}
                    disabled={!isSelectable}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${borderClass} ${isSelectable ? "cursor-pointer" : submitted ? "" : "cursor-default"}`}
                  >
                    <p className="font-medium text-xs text-text-muted mb-1">{t.lineRef}</p>
                    <p className="text-xs italic">{t.text}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Correct answers on wrong */}
        <AnimatePresence>
          {submitted && correctCount < totalPairs && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-surface-alt p-4"
            >
              <p className="text-sm font-medium mb-3">正确配对：</p>
              <div className="space-y-2">
                {passage.conclusions.map((c) => {
                  const correctCitId = passage.correctPairs[c.id];
                  const correctCit = passage.citations.find((t) => t.id === correctCitId)!;
                  const userGotIt = pairs[c.id] === correctCitId;
                  return (
                    <div key={c.id} className={`text-xs p-2 rounded ${userGotIt ? "bg-success/10" : "bg-error/10"}`}>
                      <span className="font-medium">{c.text}</span>
                      <span className="text-text-muted"> → </span>
                      <span className="italic">{correctCit.lineRef}: {correctCit.text}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm"
            >
              <CheckCircle className="w-4 h-4 text-success" />
              <span>正确配对：{correctCount} / {totalPairs}</span>
              {correctCount === totalPairs && (
                <span className="text-success font-medium ml-2">全部正确！</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!submitted ? (
            <button
              type="button"
              className="demo-btn"
              disabled={Object.keys(pairs).length < totalPairs}
              onClick={handleSubmit}
            >
              提交
            </button>
          ) : (
            <>
              <button type="button" className="demo-btn-outline flex items-center gap-1.5" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" /> 重试
              </button>
              <button type="button" className="demo-btn flex items-center gap-1.5" onClick={handleNext}>
                下一篇 <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          {!submitted && (
            <span className="text-sm text-text-muted">
              已配对 {Object.keys(pairs).length} / {totalPairs}
            </span>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
