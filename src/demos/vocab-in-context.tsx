import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, RotateCcw, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface WordData {
  word: string;
  contexts: { id: string; sentence: string; correctDefId: string; before: string; after: string }[];
  definitions: { id: string; text: string }[];
}

const WORDS: WordData[] = [
  {
    word: "address",
    contexts: [
      {
        id: "a1",
        before: "The president will ",
        after: " the nation tonight regarding the new economic policy.",
        sentence: "The president will address the nation tonight regarding the new economic policy.",
        correctDefId: "d1",
      },
      {
        id: "a2",
        before: "The committee failed to ",
        after: " the underlying causes of the budget shortfall.",
        sentence: "The committee failed to address the underlying causes of the budget shortfall.",
        correctDefId: "d2",
      },
      {
        id: "a3",
        before: "Please confirm your mailing ",
        after: " before we ship the package.",
        sentence: "Please confirm your mailing address before we ship the package.",
        correctDefId: "d3",
      },
    ],
    definitions: [
      { id: "d1", text: "to speak to (a group of people)" },
      { id: "d2", text: "to deal with or give attention to (a problem)" },
      { id: "d3", text: "the location where someone lives or receives mail" },
    ],
  },
  {
    word: "grave",
    contexts: [
      {
        id: "g1",
        before: "The doctor's ",
        after: " expression told the family that the news was not good.",
        sentence: "The doctor's grave expression told the family that the news was not good.",
        correctDefId: "d1",
      },
      {
        id: "g2",
        before: "They laid flowers on their grandmother's ",
        after: " every Sunday morning.",
        sentence: "They laid flowers on their grandmother's grave every Sunday morning.",
        correctDefId: "d2",
      },
      {
        id: "g3",
        before: "The inspector warned that the structural damage posed a ",
        after: " threat to public safety.",
        sentence: "The inspector warned that the structural damage posed a grave threat to public safety.",
        correctDefId: "d3",
      },
    ],
    definitions: [
      { id: "d1", text: "serious and solemn in manner or expression" },
      { id: "d2", text: "a place of burial" },
      { id: "d3", text: "requiring serious thought; critical and dangerous" },
    ],
  },
  {
    word: "sound",
    contexts: [
      {
        id: "s1",
        before: "After reviewing the evidence, the jury found the argument to be ",
        after: " and well-supported.",
        sentence: "After reviewing the evidence, the jury found the argument to be sound and well-supported.",
        correctDefId: "d1",
      },
      {
        id: "s2",
        before: "The ",
        after: " of the church bells echoed through the valley every morning.",
        sentence: "The sound of the church bells echoed through the valley every morning.",
        correctDefId: "d2",
      },
      {
        id: "s3",
        before: "The patient appeared to be in ",
        after: " health despite being over ninety years old.",
        sentence: "The patient appeared to be in sound health despite being over ninety years old.",
        correctDefId: "d3",
      },
    ],
    definitions: [
      { id: "d1", text: "based on valid reasoning; logically solid" },
      { id: "d2", text: "a noise or auditory sensation" },
      { id: "d3", text: "in good condition; healthy and strong" },
    ],
  },
  {
    word: "elevated",
    contexts: [
      {
        id: "e1",
        before: "The patient's ",
        after: " heart rate concerned the attending physician.",
        sentence: "The patient's elevated heart rate concerned the attending physician.",
        correctDefId: "d1",
      },
      {
        id: "e2",
        before: "The senator's ",
        after: " rhetoric inspired the crowd but lacked practical specifics.",
        sentence: "The senator's elevated rhetoric inspired the crowd but lacked practical specifics.",
        correctDefId: "d2",
      },
      {
        id: "e3",
        before: "The train runs on an ",
        after: " track above the city streets.",
        sentence: "The train runs on an elevated track above the city streets.",
        correctDefId: "d3",
      },
    ],
    definitions: [
      { id: "d1", text: "higher than normal in amount or level" },
      { id: "d2", text: "lofty or grand in style or tone" },
      { id: "d3", text: "raised up above ground level; physically higher" },
    ],
  },
];

export function VocabInContext() {
  const [currentWord, setCurrentWord] = useState(0);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const wordData = WORDS[currentWord];
  const matchedDefIds = new Set(Object.values(matches));

  function handleContextClick(contextId: string) {
    if (submitted) return;
    if (matches[contextId]) {
      // Unpair
      setMatches((prev) => {
        const next = { ...prev };
        delete next[contextId];
        return next;
      });
      return;
    }
    setSelectedContext(contextId);
  }

  function handleDefClick(defId: string) {
    if (submitted || !selectedContext) return;
    if (matchedDefIds.has(defId)) return;
    setMatches((prev) => ({ ...prev, [selectedContext]: defId }));
    setSelectedContext(null);
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function handleReset() {
    setMatches({});
    setSelectedContext(null);
    setSubmitted(false);
  }

  function goToWord(index: number) {
    setCurrentWord(index);
    handleReset();
  }

  const allMatched = wordData.contexts.every((c) => matches[c.id]);
  const correctCount = submitted
    ? wordData.contexts.filter((c) => matches[c.id] === c.correctDefId).length
    : 0;
  return (
    <DemoShell
      title="语境词义"
      description="同一单词在不同语境中的含义不同 — 匹配每个用法的正确释义"
      tags={["SAT", "TOEFL", "词汇", "语境理解"]}
    >
      <div className="space-y-5">
        {/* Word navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {WORDS.map((w, i) => (
              <button
                key={w.word}
                type="button"
                onClick={() => goToWord(i)}
                className={`text-sm px-3 py-1 rounded-md border transition-all ${
                  i === currentWord
                    ? "border-primary bg-primary/15 text-primary-light font-medium"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {w.word}
              </button>
            ))}
          </div>
          <span className="text-xs text-text-muted">
            {currentWord + 1} / {WORDS.length}
          </span>
        </div>

        {/* Focus word */}
        <div className="text-center py-3">
          <motion.h2
            key={wordData.word}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-primary-light"
          >
            {wordData.word}
          </motion.h2>
          <p className="text-sm text-text-muted mt-1">点击句子，再点击对应释义来配对</p>
        </div>

        {/* Sentences */}
        <div>
          <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Sentences</p>
          <div className="space-y-2">
            {wordData.contexts.map((ctx, i) => {
              const isPaired = !!matches[ctx.id];
              const isSelected = selectedContext === ctx.id;
              const isCorrect = submitted && matches[ctx.id] === ctx.correctDefId;
              const isWrong = submitted && isPaired && matches[ctx.id] !== ctx.correctDefId;

              let borderClass = "border-border";
              if (isSelected) borderClass = "border-primary ring-2 ring-primary/30";
              else if (isCorrect) borderClass = "border-success bg-success/5";
              else if (isWrong) borderClass = "border-error bg-error/5";
              else if (isPaired) borderClass = "border-primary/40 bg-primary/5";

              return (
                <motion.button
                  key={ctx.id}
                  type="button"
                  layout
                  onClick={() => handleContextClick(ctx.id)}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${borderClass} ${submitted ? "" : "cursor-pointer hover:border-primary/40"}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-text-muted shrink-0 text-xs mt-1">{i + 1}.</span>
                    <p>
                      {ctx.before}
                      <span className="font-bold text-primary-light underline decoration-primary/40">{wordData.word}</span>
                      {ctx.after}
                    </p>
                  </div>
                  {isPaired && (
                    <p className="mt-1.5 ml-5 text-xs text-text-muted flex items-center gap-1">
                      {submitted && isCorrect && <CheckCircle className="w-3 h-3 text-success" />}
                      {submitted && isWrong && <XCircle className="w-3 h-3 text-error" />}
                      {!submitted && <BookOpen className="w-3 h-3" />}
                      → {wordData.definitions.find((d) => d.id === matches[ctx.id])?.text}
                    </p>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Definitions */}
        <div>
          <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Definitions</p>
          <div className="space-y-2">
            {wordData.definitions.map((def) => {
              const isUsed = matchedDefIds.has(def.id);
              const isSelectable = selectedContext && !isUsed && !submitted;
              const pairedCtx = Object.entries(matches).find(([, dId]) => dId === def.id)?.[0];
              const ctxData = pairedCtx ? wordData.contexts.find((c) => c.id === pairedCtx) : null;
              const isCorrect = submitted && ctxData && ctxData.correctDefId === def.id;

              let borderClass = "border-border";
              if (submitted && isCorrect) borderClass = "border-success bg-success/5";
              else if (submitted && isUsed && !isCorrect) borderClass = "border-error bg-error/5";
              else if (isUsed && !submitted) borderClass = "border-primary/40 bg-primary/5 opacity-60";
              else if (isSelectable) borderClass = "border-primary/30 hover:border-primary hover:bg-primary/5";

              return (
                <button
                  key={def.id}
                  type="button"
                  onClick={() => handleDefClick(def.id)}
                  disabled={!isSelectable}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${borderClass} ${isSelectable ? "cursor-pointer" : "cursor-default"}`}
                >
                  {def.text}
                </button>
              );
            })}
          </div>
        </div>

        {/* Correct answers */}
        <AnimatePresence>
          {submitted && correctCount < wordData.contexts.length && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-surface-alt p-3"
            >
              <p className="text-sm font-medium mb-2">正确答案：</p>
              <div className="space-y-1.5">
                {wordData.contexts.map((ctx, i) => {
                  const correctDef = wordData.definitions.find((d) => d.id === ctx.correctDefId)!;
                  return (
                    <div key={ctx.id} className="text-xs flex items-start gap-1.5">
                      <span className="text-text-muted">{i + 1}.</span>
                      <span className="italic">{correctDef.text}</span>
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
              <span>正确：{correctCount} / {wordData.contexts.length}</span>
              {correctCount === wordData.contexts.length && (
                <span className="text-success font-medium ml-2">全部正确！</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!submitted ? (
            <button type="button" className="demo-btn" disabled={!allMatched} onClick={handleSubmit}>
              提交
            </button>
          ) : (
            <>
              <button type="button" className="demo-btn-outline flex items-center gap-1.5" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" /> 重试
              </button>
              {currentWord < WORDS.length - 1 && (
                <button type="button" className="demo-btn flex items-center gap-1.5" onClick={() => goToWord(currentWord + 1)}>
                  下一词 <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}
          {!submitted && (
            <span className="text-sm text-text-muted">
              已配对 {Object.keys(matches).length} / {wordData.contexts.length}
            </span>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
