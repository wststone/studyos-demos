import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface WordToken {
  id: number;
  text: string;
  errorCorrection: string | null; // null = no error
}

const PASSAGE_TOKENS: WordToken[] = [
  { id: 0, text: "地球", errorCorrection: null },
  { id: 1, text: "是", errorCorrection: null },
  { id: 2, text: "太阳系", errorCorrection: null },
  { id: 3, text: "中", errorCorrection: null },
  { id: 4, text: "唯一", errorCorrection: null },
  { id: 5, text: "以知", errorCorrection: "已知" },
  { id: 6, text: "拥有", errorCorrection: null },
  { id: 7, text: "生命", errorCorrection: null },
  { id: 8, text: "的", errorCorrection: null },
  { id: 9, text: "行星。", errorCorrection: null },
  { id: 10, text: "地球", errorCorrection: null },
  { id: 11, text: "表面", errorCorrection: null },
  { id: 12, text: "约", errorCorrection: null },
  { id: 13, text: "71%", errorCorrection: null },
  { id: 14, text: "被", errorCorrection: null },
  { id: 15, text: "海洋", errorCorrection: null },
  { id: 16, text: "复盖，", errorCorrection: "覆盖，" },
  { id: 17, text: "其余", errorCorrection: null },
  { id: 18, text: "为", errorCorrection: null },
  { id: 19, text: "陆地。", errorCorrection: null },
  { id: 20, text: "大气层", errorCorrection: null },
  { id: 21, text: "主要", errorCorrection: null },
  { id: 22, text: "由", errorCorrection: null },
  { id: 23, text: "氮气", errorCorrection: null },
  { id: 24, text: "和", errorCorrection: null },
  { id: 25, text: "氧气", errorCorrection: null },
  { id: 26, text: "组成，", errorCorrection: null },
  { id: 27, text: "能够", errorCorrection: null },
  { id: 28, text: "有效的", errorCorrection: "有效地" },
  { id: 29, text: "保护", errorCorrection: null },
  { id: 30, text: "地球", errorCorrection: null },
  { id: 31, text: "免受", errorCorrection: null },
  { id: 32, text: "太阳", errorCorrection: null },
  { id: 33, text: "幅射", errorCorrection: "辐射" },
  { id: 34, text: "的", errorCorrection: null },
  { id: 35, text: "伤害。", errorCorrection: null },
  { id: 36, text: "地球", errorCorrection: null },
  { id: 37, text: "的", errorCorrection: null },
  { id: 38, text: "自转", errorCorrection: null },
  { id: 39, text: "周期", errorCorrection: null },
  { id: 40, text: "约为", errorCorrection: null },
  { id: 41, text: "24", errorCorrection: null },
  { id: 42, text: "小时，", errorCorrection: null },
  { id: 43, text: "公转", errorCorrection: null },
  { id: 44, text: "周期", errorCorrection: null },
  { id: 45, text: "约为", errorCorrection: null },
  { id: 46, text: "365", errorCorrection: null },
  { id: 47, text: "天。", errorCorrection: null },
  { id: 48, text: "地球", errorCorrection: null },
  { id: 49, text: "与", errorCorrection: null },
  { id: 50, text: "月球", errorCorrection: null },
  { id: 51, text: "之间", errorCorrection: null },
  { id: 52, text: "的", errorCorrection: null },
  { id: 53, text: "引力", errorCorrection: null },
  { id: 54, text: "做用", errorCorrection: "作用" },
  { id: 55, text: "产生了", errorCorrection: null },
  { id: 56, text: "潮汐", errorCorrection: null },
  { id: 57, text: "现像。", errorCorrection: "现象。" },
];

const TOTAL_ERRORS = PASSAGE_TOKENS.filter((t) => t.errorCorrection !== null).length;

interface UserCorrection {
  tokenId: number;
  correction: string;
}

export function ErrorCorrection() {
  const [corrections, setCorrections] = useState<UserCorrection[]>([]);
  const [activeTokenId, setActiveTokenId] = useState<number | null>(null);
  const [popupInput, setPopupInput] = useState("");
  const [checked, setChecked] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        activeTokenId !== null &&
        popupRef.current &&
        !popupRef.current.contains(e.target as Node)
      ) {
        setActiveTokenId(null);
        setPopupInput("");
      }
    },
    [activeTokenId],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (activeTokenId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeTokenId]);

  function handleTokenClick(tokenId: number) {
    if (checked) return;
    const existing = corrections.find((c) => c.tokenId === tokenId);
    if (existing) {
      // Remove correction
      setCorrections((prev) => prev.filter((c) => c.tokenId !== tokenId));
      return;
    }
    setActiveTokenId(tokenId);
    setPopupInput("");
  }

  function handleSubmitCorrection() {
    if (activeTokenId === null || !popupInput.trim()) return;
    setCorrections((prev) => [
      ...prev.filter((c) => c.tokenId !== activeTokenId),
      { tokenId: activeTokenId, correction: popupInput.trim() },
    ]);
    setActiveTokenId(null);
    setPopupInput("");
  }

  function getTokenStatus(token: WordToken) {
    if (!checked) return null;
    const userCorrection = corrections.find((c) => c.tokenId === token.id);
    if (token.errorCorrection) {
      if (userCorrection) return "correct-catch"; // found real error
      return "missed"; // missed a real error
    }
    if (userCorrection) return "false-positive"; // marked non-error
    return null;
  }

  const correctCatches = checked
    ? corrections.filter((c) => {
        const token = PASSAGE_TOKENS.find((t) => t.id === c.tokenId);
        return token?.errorCorrection != null;
      }).length
    : 0;

  const falsePositives = checked
    ? corrections.filter((c) => {
        const token = PASSAGE_TOKENS.find((t) => t.id === c.tokenId);
        return token?.errorCorrection == null;
      }).length
    : 0;

  const missed = checked ? TOTAL_ERRORS - correctCatches : 0;

  function handleReset() {
    setCorrections([]);
    setActiveTokenId(null);
    setPopupInput("");
    setChecked(false);
  }

  return (
    <DemoShell
      title="纠错练习"
      description="阅读下面的段落，点击你认为有错误的词语并输入正确的写法。"
      tags={["语文", "纠错", "细节观察"]}
    >
      {/* Instructions */}
      <div className="mb-4 rounded-md bg-primary/10 px-4 py-2.5 text-sm text-primary-light">
        <Search className="mr-1.5 inline h-4 w-4" />
        点击有误的词语，输入正确写法。再次点击已标记词语可取消。
      </div>

      {/* Passage */}
      <div className="relative mb-5 rounded-lg border border-border bg-surface-alt p-5 text-base leading-8">
        {PASSAGE_TOKENS.map((token) => {
          const isMarked = corrections.some((c) => c.tokenId === token.id);
          const status = getTokenStatus(token);
          const isActive = activeTokenId === token.id;

          let className =
            "relative cursor-pointer rounded px-0.5 transition-all ";
          if (checked) {
            if (status === "correct-catch")
              className += "bg-success/20 text-success underline decoration-success";
            else if (status === "missed")
              className += "bg-error/20 text-error underline decoration-error decoration-wavy";
            else if (status === "false-positive")
              className += "bg-warning/20 text-warning line-through";
          } else if (isMarked) {
            className += "bg-primary/20 text-primary-light underline";
          } else {
            className += "hover:bg-surface-hover";
          }

          return (
            <span key={token.id} className="relative inline">
              <span
                className={className}
                onClick={() => handleTokenClick(token.id)}
              >
                {token.text}
              </span>

              {/* Popup for entering correction */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    ref={popupRef}
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2"
                  >
                    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface p-2 shadow-xl">
                      <input
                        ref={inputRef}
                        type="text"
                        className="demo-input w-24 py-1 text-sm"
                        placeholder="正确写法"
                        value={popupInput}
                        onChange={(e) => setPopupInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSubmitCorrection();
                          if (e.key === "Escape") {
                            setActiveTokenId(null);
                            setPopupInput("");
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="demo-btn py-1 text-xs"
                        onClick={handleSubmitCorrection}
                      >
                        确定
                      </button>
                    </div>
                    <div className="mx-auto h-2 w-2 -translate-y-px rotate-45 border-b border-r border-border bg-surface" />
                  </motion.div>
                )}
              </AnimatePresence>
            </span>
          );
        })}
      </div>

      {/* User corrections list */}
      {corrections.length > 0 && !checked && (
        <div className="mb-4 rounded-lg border border-border bg-surface-alt p-4">
          <p className="mb-2 text-sm font-medium text-text-muted">
            已标记的修改 ({corrections.length})：
          </p>
          <div className="flex flex-wrap gap-2">
            {corrections.map((c) => {
              const token = PASSAGE_TOKENS.find((t) => t.id === c.tokenId)!;
              return (
                <span
                  key={c.tokenId}
                  className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-1 text-sm"
                >
                  <span className="line-through text-text-muted">
                    {token.text}
                  </span>
                  <span className="text-primary-light">→ {c.correction}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-lg border border-border bg-surface-alt p-4"
          >
            <h3 className="mb-3 font-bold">检查结果</h3>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-md bg-success/10 p-3">
                <CheckCircle className="mx-auto mb-1 h-5 w-5 text-success" />
                <p className="font-bold text-success">{correctCatches}</p>
                <p className="text-text-muted">正确发现</p>
              </div>
              <div className="rounded-md bg-error/10 p-3">
                <XCircle className="mx-auto mb-1 h-5 w-5 text-error" />
                <p className="font-bold text-error">{missed}</p>
                <p className="text-text-muted">遗漏错误</p>
              </div>
              <div className="rounded-md bg-warning/10 p-3">
                <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-warning" />
                <p className="font-bold text-warning">{falsePositives}</p>
                <p className="text-text-muted">误报</p>
              </div>
            </div>

            <div className="mt-4 rounded-md bg-primary/10 p-3 text-center">
              <p className="text-lg font-bold">
                得分：{correctCatches} / {TOTAL_ERRORS} 个错误
              </p>
            </div>

            {/* Show all errors with corrections */}
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-text-muted">所有错误：</p>
              {PASSAGE_TOKENS.filter((t) => t.errorCorrection).map((token) => {
                const userC = corrections.find((c) => c.tokenId === token.id);
                return (
                  <div
                    key={token.id}
                    className="flex items-center gap-2 rounded-md bg-surface px-3 py-2 text-sm"
                  >
                    <span className="line-through text-error">{token.text}</span>
                    <span className="text-text-muted">→</span>
                    <span className="text-success">{token.errorCorrection}</span>
                    {userC ? (
                      <CheckCircle className="ml-auto h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="ml-auto h-4 w-4 text-error" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3">
        {!checked ? (
          <button
            type="button"
            className="demo-btn inline-flex items-center gap-2"
            onClick={() => setChecked(true)}
          >
            <Search className="h-4 w-4" />
            检查
          </button>
        ) : (
          <button
            type="button"
            className="demo-btn-outline inline-flex items-center gap-2"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
            重新开始
          </button>
        )}
        {!checked && (
          <span className="self-center text-sm text-text-muted">
            已标记 {corrections.length} 处（共 {TOTAL_ERRORS} 个错误）
          </span>
        )}
      </div>
    </DemoShell>
  );
}
