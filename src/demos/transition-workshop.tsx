import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

type Relationship = "contrast" | "addition" | "cause" | "example" | "summary";

interface BlankOption {
  word: string;
  relationship: Relationship;
}

interface TransitionBlank {
  id: string;
  options: BlankOption[];
  correctIndex: number;
}

interface PassageData {
  title: string;
  /** Use {{id}} as placeholder for blanks */
  template: string;
  blanks: TransitionBlank[];
  explanation: string;
}

const RELATIONSHIP_LABELS: Record<Relationship, { label: string; icon: string }> = {
  contrast: { label: "转折", icon: "↔" },
  addition: { label: "递进", icon: "+" },
  cause: { label: "因果", icon: "→" },
  example: { label: "举例", icon: "≈" },
  summary: { label: "总结", icon: "∴" },
};

const PASSAGES: PassageData[] = [
  {
    title: "The Evolution of Public Libraries",
    template: `Public libraries have undergone a dramatic transformation over the past century. Originally conceived as quiet repositories for books, they served primarily as reading rooms for scholars and the educated elite. {{b1}}, the modern library has evolved into a multifaceted community hub that offers far more than printed materials.

Today's libraries provide computer access, job training workshops, children's programming, and even recording studios. {{b2}}, the Brooklyn Public Library now offers courses in coding, financial literacy, and immigration services — programs unimaginable to the library's founders.

{{b3}}, this expansion of services has not been without controversy. Some traditionalists argue that libraries have strayed too far from their core mission of promoting literacy. {{b4}}, studies consistently show that communities with well-funded, service-oriented libraries report higher rates of civic engagement and educational attainment.`,
    blanks: [
      {
        id: "b1",
        options: [
          { word: "However", relationship: "contrast" },
          { word: "Similarly", relationship: "addition" },
          { word: "Therefore", relationship: "cause" },
          { word: "Meanwhile", relationship: "addition" },
        ],
        correctIndex: 0,
      },
      {
        id: "b2",
        options: [
          { word: "In contrast", relationship: "contrast" },
          { word: "For instance", relationship: "example" },
          { word: "Nevertheless", relationship: "contrast" },
          { word: "As a result", relationship: "cause" },
        ],
        correctIndex: 1,
      },
      {
        id: "b3",
        options: [
          { word: "Furthermore", relationship: "addition" },
          { word: "For example", relationship: "example" },
          { word: "Of course", relationship: "contrast" },
          { word: "In conclusion", relationship: "summary" },
        ],
        correctIndex: 2,
      },
      {
        id: "b4",
        options: [
          { word: "Likewise", relationship: "addition" },
          { word: "For instance", relationship: "example" },
          { word: "In other words", relationship: "summary" },
          { word: "Nonetheless", relationship: "contrast" },
        ],
        correctIndex: 3,
      },
    ],
    explanation:
      "This passage traces a shift from old libraries to modern ones (contrast), gives a specific example (Brooklyn), acknowledges criticism (concession with \"Of course\"), and counters it (\"Nonetheless\").",
  },
  {
    title: "Sleep and Academic Performance",
    template: `Research has consistently demonstrated a strong correlation between sleep quality and academic performance among college students. Students who regularly sleep fewer than six hours per night score, on average, a full letter grade lower than their well-rested peers. {{b1}}, sleep deprivation impairs the brain's ability to consolidate memories formed during the day, directly undermining the learning process.

Many universities have begun adjusting their schedules in response to these findings. {{b2}}, Duke University shifted its earliest class times from 7:30 to 8:30 a.m. and reported a measurable decrease in student absenteeism.

{{b3}}, simply pushing back start times does not address the root causes of student sleep deprivation. Late-night socializing, excessive screen time, and caffeine consumption continue to delay students' natural sleep onset. {{b4}}, a comprehensive approach that combines schedule adjustments with education about sleep hygiene is more likely to produce lasting improvements.`,
    blanks: [
      {
        id: "b1",
        options: [
          { word: "This is because", relationship: "cause" },
          { word: "However", relationship: "contrast" },
          { word: "For example", relationship: "example" },
          { word: "In addition", relationship: "addition" },
        ],
        correctIndex: 0,
      },
      {
        id: "b2",
        options: [
          { word: "In contrast", relationship: "contrast" },
          { word: "Therefore", relationship: "cause" },
          { word: "For example", relationship: "example" },
          { word: "In summary", relationship: "summary" },
        ],
        correctIndex: 2,
      },
      {
        id: "b3",
        options: [
          { word: "Furthermore", relationship: "addition" },
          { word: "However", relationship: "contrast" },
          { word: "As a result", relationship: "cause" },
          { word: "Similarly", relationship: "addition" },
        ],
        correctIndex: 1,
      },
      {
        id: "b4",
        options: [
          { word: "Nevertheless", relationship: "contrast" },
          { word: "For instance", relationship: "example" },
          { word: "Therefore", relationship: "cause" },
          { word: "In contrast", relationship: "contrast" },
        ],
        correctIndex: 2,
      },
    ],
    explanation:
      "The passage explains why sleep matters (cause), gives Duke as an example, introduces a limitation (contrast with \"However\"), and draws a conclusion (\"Therefore\").",
  },
];

export function TransitionWorkshop() {
  const [currentPassage, setCurrentPassage] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const passage = PASSAGES[currentPassage];

  function handleSelect(blankId: string, optionIndex: number) {
    if (submitted) return;
    setSelections((prev) => ({ ...prev, [blankId]: optionIndex }));
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function handleReset() {
    setSelections({});
    setSubmitted(false);
  }

  function handleNext() {
    setCurrentPassage((prev) => (prev + 1) % PASSAGES.length);
    handleReset();
  }

  const allFilled = passage.blanks.every((b) => selections[b.id] !== undefined);
  const correctCount = submitted
    ? passage.blanks.filter((b) => selections[b.id] === b.correctIndex).length
    : 0;

  // Render passage with inline selections
  function renderPassage() {
    const parts = passage.template.split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, i) => {
      const match = part.match(/^\{\{(\w+)\}\}$/);
      if (!match) return <span key={i}>{part}</span>;

      const blankId = match[1];
      const blank = passage.blanks.find((b) => b.id === blankId);
      if (!blank) return <span key={i}>{part}</span>;

      const selected = selections[blankId];
      const isCorrect = submitted && selected === blank.correctIndex;
      const isWrong = submitted && selected !== undefined && selected !== blank.correctIndex;

      if (selected !== undefined) {
        let cls = "font-bold px-1 py-0.5 rounded transition-all ";
        if (isCorrect) cls += "text-success bg-success/15";
        else if (isWrong) cls += "text-error bg-error/15 line-through";
        else cls += "text-primary-light bg-primary/15";
        return (
          <span key={i} className={cls}>
            {blank.options[selected].word}
            {isWrong && (
              <span className="text-success ml-1 no-underline" style={{ textDecoration: "none" }}>
                [{blank.options[blank.correctIndex].word}]
              </span>
            )}
          </span>
        );
      }

      return (
        <span key={i} className="inline-block border-b-2 border-dashed border-primary/50 px-2 mx-0.5 text-primary-light">
          ______
        </span>
      );
    });
  }

  return (
    <DemoShell
      title="过渡词工坊"
      description="选择合适的过渡词，实时预览段落逻辑变化 — 练习 SAT 写作高频题型"
      tags={["SAT", "写作", "过渡词", "逻辑"]}
    >
      <div className="space-y-5">
        {/* Passage with live preview */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">{passage.title}</h3>
          <div className="rounded-lg border border-border bg-surface-alt p-4 text-sm leading-8 whitespace-pre-line">
            {renderPassage()}
          </div>
        </div>

        {/* Blank options */}
        <div className="space-y-4">
          {passage.blanks.map((blank, bi) => {
            const selected = selections[blank.id];
            const isCorrect = submitted && selected === blank.correctIndex;
            const isWrong = submitted && selected !== undefined && selected !== blank.correctIndex;

            return (
              <div key={blank.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-text-muted">Blank {bi + 1}</span>
                  {submitted && isCorrect && <CheckCircle className="w-3.5 h-3.5 text-success" />}
                  {submitted && isWrong && <XCircle className="w-3.5 h-3.5 text-error" />}
                </div>
                <div className="flex flex-wrap gap-2">
                  {blank.options.map((opt, oi) => {
                    const isSelected = selected === oi;
                    const isAnswer = submitted && oi === blank.correctIndex;
                    let cls = "text-sm px-3 py-1.5 rounded-md border transition-all ";
                    if (submitted) {
                      if (isAnswer) cls += "border-success bg-success/15 text-success font-medium";
                      else if (isSelected && !isAnswer) cls += "border-error bg-error/10 text-error line-through";
                      else cls += "border-border text-text-muted";
                    } else if (isSelected) {
                      cls += "border-primary bg-primary/15 text-primary-light font-medium";
                    } else {
                      cls += "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer";
                    }

                    const rel = RELATIONSHIP_LABELS[opt.relationship];
                    return (
                      <button
                        key={oi}
                        type="button"
                        className={cls}
                        onClick={() => handleSelect(blank.id, oi)}
                        disabled={submitted}
                      >
                        {opt.word}
                        {isSelected && !submitted && (
                          <span className="ml-1.5 text-xs opacity-70">{rel.icon} {rel.label}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Results */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>正确：{correctCount} / {passage.blanks.length}</span>
                {correctCount === passage.blanks.length && (
                  <span className="text-success font-medium ml-2">全部正确！</span>
                )}
              </div>
              <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 text-sm text-primary-light">
                <p className="font-medium mb-1">解析：</p>
                <p>{passage.explanation}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!submitted ? (
            <button type="button" className="demo-btn" disabled={!allFilled} onClick={handleSubmit}>
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
        </div>
      </div>
    </DemoShell>
  );
}
