import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, RotateCcw, Highlighter } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface EvidenceSpan {
  start: number;
  end: number;
}

const CLAIM = "人工智能正在深刻改变现代教育的方式和效果。";

const PASSAGE =
  "近年来，人工智能技术在教育领域得到了广泛应用。" +
  "智能辅导系统能够根据每个学生的学习进度和薄弱环节，提供个性化的学习路径和练习题。" +
  "研究表明，使用AI辅助教学的班级，学生的平均成绩提高了15%至20%。" +
  "此外，自然语言处理技术使得自动批改作文和提供写作反馈成为可能，大幅减轻了教师的工作负担。" +
  "然而，也有学者担忧过度依赖技术可能削弱学生的独立思考能力。";

const CORRECT_SPANS: EvidenceSpan[] = [
  { start: 21, end: 68 },
  { start: 68, end: 101 },
  { start: 101, end: 142 },
];

function spansOverlap(a: EvidenceSpan, b: EvidenceSpan): boolean {
  return a.start < b.end && b.start < a.end;
}

function mergeSpans(spans: EvidenceSpan[]): EvidenceSpan[] {
  if (spans.length === 0) return [];
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  const merged: EvidenceSpan[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (sorted[i].start <= last.end) {
      last.end = Math.max(last.end, sorted[i].end);
    } else {
      merged.push(sorted[i]);
    }
  }
  return merged;
}

function isInSpans(index: number, spans: EvidenceSpan[]): boolean {
  return spans.some((s) => index >= s.start && index < s.end);
}

function getSpanAt(index: number, spans: EvidenceSpan[]): EvidenceSpan | null {
  return spans.find((s) => index >= s.start && index < s.end) ?? null;
}

export function HighlightEvidence() {
  const [highlights, setHighlights] = useState<EvidenceSpan[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleMouseUp = useCallback(() => {
    if (submitted) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const container = document.getElementById("passage-container");
    if (!container || !container.contains(range.startContainer) || !container.contains(range.endContainer)) {
      return;
    }

    // Calculate offset within the passage text
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let offset = 0;
    let startOffset = -1;
    let endOffset = -1;

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node === range.startContainer) {
        startOffset = offset + range.startOffset;
      }
      if (node === range.endContainer) {
        endOffset = offset + range.endOffset;
      }
      offset += node.textContent?.length ?? 0;
    }

    if (startOffset >= 0 && endOffset > startOffset) {
      setHighlights((prev) =>
        mergeSpans([...prev, { start: startOffset, end: endOffset }])
      );
    }
    selection.removeAllRanges();
  }, [submitted]);

  const removeHighlight = (span: EvidenceSpan) => {
    if (submitted) return;
    setHighlights((prev) => prev.filter((s) => s.start !== span.start || s.end !== span.end));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setHighlights([]);
    setSubmitted(false);
  };

  // Scoring
  const correctFound = submitted
    ? CORRECT_SPANS.filter((cs) =>
        highlights.some((h) => spansOverlap(h, cs))
      ).length
    : 0;
  const correctTotal = CORRECT_SPANS.length;

  // Render passage with highlights
  const renderPassage = () => {
    const chars: React.ReactNode[] = [];
    for (let i = 0; i < PASSAGE.length; i++) {
      const inUserHighlight = isInSpans(i, highlights);
      const inCorrectSpan = submitted && isInSpans(i, CORRECT_SPANS);
      const userSpan = getSpanAt(i, highlights);

      let bgClass = "";
      if (submitted) {
        if (inUserHighlight && inCorrectSpan) {
          bgClass = "bg-success/25 text-success";
        } else if (inUserHighlight && !inCorrectSpan) {
          bgClass = "bg-error/25 text-error line-through";
        } else if (!inUserHighlight && inCorrectSpan) {
          bgClass = "bg-warning/20 border-b-2 border-warning text-warning";
        }
      } else if (inUserHighlight) {
        bgClass = "bg-primary/30 text-primary-light";
      }

      chars.push(
        <span
          key={i}
          className={`${bgClass} ${inUserHighlight && !submitted ? "cursor-pointer" : ""}`}
          onClick={() => {
            if (inUserHighlight && !submitted && userSpan) {
              removeHighlight(userSpan);
            }
          }}
        >
          {PASSAGE[i]}
        </span>
      );
    }
    return chars;
  };

  return (
    <DemoShell
      title="证据高亮"
      description="在文章中标出支持论点的关键证据"
      tags={["阅读理解", "证据分析", "文本标注"]}
    >
      <div className="space-y-5">
        {/* Claim */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/30">
          <Highlighter className="w-5 h-5 text-primary-light shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-primary-light font-medium mb-1">论点</p>
            <p className="text-sm font-medium">{CLAIM}</p>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-sm text-text-muted">
          {submitted
            ? "查看结果：绿色=正确标注，红色=错误标注，黄色=遗漏的证据"
            : "用鼠标选中文本来高亮证据，点击已高亮的文本可取消选择："}
        </p>

        {/* Passage */}
        <div
          id="passage-container"
          onMouseUp={handleMouseUp}
          className={`p-4 rounded-lg border border-border bg-surface-alt leading-8 text-sm select-text ${
            submitted ? "" : "cursor-text"
          }`}
        >
          {renderPassage()}
        </div>

        {/* Highlight count */}
        {!submitted && highlights.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-text-muted"
          >
            已高亮 {highlights.length} 个片段（点击已高亮文本可取消）
          </motion.p>
        )}

        {/* Results */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>
                    找到证据：{correctFound}/{correctTotal}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 text-xs p-2 rounded bg-success/10 border border-success/20">
                  <div className="w-3 h-3 rounded-sm bg-success/40" />
                  <span className="text-success">正确标注</span>
                </div>
                <div className="flex items-center gap-2 text-xs p-2 rounded bg-error/10 border border-error/20">
                  <div className="w-3 h-3 rounded-sm bg-error/40" />
                  <span className="text-error">错误标注</span>
                </div>
                <div className="flex items-center gap-2 text-xs p-2 rounded bg-warning/10 border border-warning/20">
                  <div className="w-3 h-3 rounded-sm bg-warning/40" />
                  <span className="text-warning">遗漏证据</span>
                </div>
              </div>

              {correctFound === correctTotal ? (
                <p className="text-sm text-success font-medium">
                  太棒了！你找到了所有关键证据！
                </p>
              ) : (
                <p className="text-sm text-text-muted">
                  共有 {correctTotal} 处关键证据，你找到了 {correctFound} 处。
                  再试一次看看能不能全部找到！
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!submitted ? (
            <button
              className="demo-btn"
              disabled={highlights.length === 0}
              onClick={handleSubmit}
            >
              提交
            </button>
          ) : (
            <button
              className="demo-btn-outline flex items-center gap-1.5"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4" />
              重新开始
            </button>
          )}
          {!submitted && highlights.length > 0 && (
            <button
              className="demo-btn-outline"
              onClick={() => setHighlights([])}
            >
              清除所有
            </button>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
