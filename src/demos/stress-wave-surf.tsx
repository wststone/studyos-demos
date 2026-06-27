import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, ChevronRight, Eye, EyeOff } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface Syllable {
  text: string;
  stressed: boolean;
}

interface SentenceData {
  id: string;
  glossZh: string;
  syllables: Syllable[];
}

const SENTENCES: SentenceData[] = [
  {
    id: "s1",
    glossZh: "我想去商店。",
    syllables: [
      { text: "I", stressed: false },
      { text: "WANT", stressed: true },
      { text: "to", stressed: false },
      { text: "GO", stressed: true },
      { text: "to", stressed: false },
      { text: "the", stressed: false },
      { text: "STORE", stressed: true },
    ],
  },
  {
    id: "s2",
    glossZh: "她不敢相信这个消息。",
    syllables: [
      { text: "She", stressed: false },
      { text: "CAN", stressed: true },
      { text: "not", stressed: false },
      { text: "be", stressed: false },
      { text: "LIEVE", stressed: true },
      { text: "the", stressed: false },
      { text: "NEWS", stressed: true },
    ],
  },
  {
    id: "s3",
    glossZh: "美丽的花园正在盛开。",
    syllables: [
      { text: "The", stressed: false },
      { text: "BEAU", stressed: true },
      { text: "ti", stressed: false },
      { text: "ful", stressed: false },
      { text: "GAR", stressed: true },
      { text: "den", stressed: false },
      { text: "is", stressed: false },
      { text: "BLOOM", stressed: true },
      { text: "ing", stressed: false },
    ],
  },
  {
    id: "s4",
    glossZh: "他以前从未去过巴黎。",
    syllables: [
      { text: "He's", stressed: false },
      { text: "NEV", stressed: true },
      { text: "er", stressed: false },
      { text: "BEEN", stressed: true },
      { text: "to", stressed: false },
      { text: "Pa", stressed: false },
      { text: "RIS", stressed: true },
      { text: "be", stressed: false },
      { text: "FORE", stressed: true },
    ],
  },
];

const CANVAS_W = 720;
const CANVAS_H = 220;
const HIT_X = CANVAS_W / 2;
const WAVE_BASE_Y = CANVAS_H / 2 + 10;
const BASE_AMP = 14;
const BURST_AMP = 36;
const BASE_SPEED = 130; // px/s
const SYLLABLE_SPACING = 110; // px between syllable centers
const HIT_WINDOW_S = 0.22;

type GameState = "idle" | "playing" | "paused" | "finished";
type SyllableState = "pending" | "hit" | "miss" | "passed";

export function StressWaveSurf() {
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const sentence = SENTENCES[sentenceIdx];

  const [gameState, setGameState] = useState<GameState>("idle");
  const [, setTick] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [tempo, setTempo] = useState(1);
  const [hardMode, setHardMode] = useState(false);
  const showMarkers = true;
  const [finishedOnce, setFinishedOnce] = useState(false);

  const [syllStates, setSyllStates] = useState<SyllableState[]>(() =>
    sentence.syllables.map(() => "pending")
  );
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [feedback, setFeedback] = useState<{ idx: number; kind: "hit" | "miss" } | null>(null);
  const [waveBurst, setWaveBurst] = useState(0);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const stateRef = useRef<GameState>("idle");
  const tempoRef = useRef<number>(1);
  const syllStatesRef = useRef<SyllableState[]>(syllStates);
  const comboRef = useRef<number>(0);
  const bestComboRef = useRef<number>(0);

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    tempoRef.current = tempo;
  }, [tempo]);

  useEffect(() => {
    syllStatesRef.current = syllStates;
  }, [syllStates]);

  function syllableX(i: number, elapsedS: number) {
    const startOffset = CANVAS_W + 80;
    return startOffset + i * SYLLABLE_SPACING - elapsedS * BASE_SPEED * tempoRef.current;
  }

  function resetSentence() {
    setSyllStates(sentence.syllables.map(() => "pending"));
    syllStatesRef.current = sentence.syllables.map(() => "pending");
    setCombo(0);
    setBestCombo(0);
    comboRef.current = 0;
    bestComboRef.current = 0;
    setElapsed(0);
    elapsedRef.current = 0;
    setGameState("idle");
    stateRef.current = "idle";
    setFeedback(null);
    setWaveBurst(0);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function nextSentence() {
    const newIdx = (sentenceIdx + 1) % SENTENCES.length;
    setSentenceIdx(newIdx);
    const fresh = SENTENCES[newIdx].syllables.map(() => "pending" as SyllableState);
    setSyllStates(fresh);
    syllStatesRef.current = fresh;
    setCombo(0);
    setBestCombo(0);
    comboRef.current = 0;
    bestComboRef.current = 0;
    setElapsed(0);
    elapsedRef.current = 0;
    setGameState("idle");
    stateRef.current = "idle";
    setFeedback(null);
    setWaveBurst(0);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function start() {
    if (gameState === "finished") resetSentence();
    setGameState("playing");
    stateRef.current = "playing";
    lastTimeRef.current = performance.now();
    runFrame();
  }

  function pause() {
    setGameState("paused");
    stateRef.current = "paused";
  }

  function resume() {
    setGameState("playing");
    stateRef.current = "playing";
    lastTimeRef.current = performance.now();
    runFrame();
  }

  function runFrame() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    const loop = (now: number) => {
      if (stateRef.current !== "playing") return;
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      elapsedRef.current += dt;
      setElapsed(elapsedRef.current);
      setTick((t) => (t + 1) % 1_000_000);

      // Check passed-without-tap for pending syllables
      const currentStates = syllStatesRef.current.slice();
      let changed = false;
      sentence.syllables.forEach((s, i) => {
        if (currentStates[i] !== "pending") return;
        const x = syllableX(i, elapsedRef.current);
        if (x < HIT_X - 30) {
          if (s.stressed) {
            currentStates[i] = "miss";
            comboRef.current = 0;
          } else {
            currentStates[i] = "passed";
          }
          changed = true;
        }
      });
      if (changed) {
        syllStatesRef.current = currentStates;
        setSyllStates(currentStates);
        setCombo(comboRef.current);
      }

      // Check finished
      const lastX = syllableX(sentence.syllables.length - 1, elapsedRef.current);
      if (lastX < -60) {
        setGameState("finished");
        stateRef.current = "finished";
        setFinishedOnce(true);
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }

  function handleTap() {
    if (stateRef.current !== "playing") return;
    // Find pending syllable nearest to HIT_X
    let bestIdx = -1;
    let bestDist = Infinity;
    sentence.syllables.forEach((_, i) => {
      if (syllStatesRef.current[i] !== "pending") return;
      const x = syllableX(i, elapsedRef.current);
      const d = Math.abs(x - HIT_X);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    if (bestIdx === -1) return;

    const distSeconds = bestDist / (BASE_SPEED * tempoRef.current);
    const syll = sentence.syllables[bestIdx];
    const newStates = syllStatesRef.current.slice();

    if (syll.stressed && distSeconds <= HIT_WINDOW_S) {
      newStates[bestIdx] = "hit";
      comboRef.current += 1;
      bestComboRef.current = Math.max(bestComboRef.current, comboRef.current);
      setCombo(comboRef.current);
      setBestCombo(bestComboRef.current);
      setFeedback({ idx: bestIdx, kind: "hit" });
      setWaveBurst(BURST_AMP);
      window.setTimeout(() => setWaveBurst(0), 350);
    } else {
      newStates[bestIdx] = "miss";
      comboRef.current = 0;
      setCombo(0);
      setFeedback({ idx: bestIdx, kind: "miss" });
    }
    syllStatesRef.current = newStates;
    setSyllStates(newStates);
    window.setTimeout(() => setFeedback(null), 380);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        handleTap();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentenceIdx]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Wave path
  const waveAmp = BASE_AMP + waveBurst;
  const wavePath = (() => {
    const pts: string[] = [];
    const phase = elapsed * 2.5;
    for (let x = 0; x <= CANVAS_W; x += 6) {
      const y = WAVE_BASE_Y + Math.sin((x / 60) + phase) * waveAmp;
      pts.push(`${x === 0 ? "M" : "L"} ${x} ${y}`);
    }
    return pts.join(" ");
  })();

  const echoPath = (() => {
    const pts: string[] = [];
    const phase = elapsed * 1.5;
    for (let x = 0; x <= CANVAS_W; x += 8) {
      const y = WAVE_BASE_Y + Math.sin((x / 90) + phase) * (waveAmp * 0.4);
      pts.push(`${x === 0 ? "M" : "L"} ${x} ${y}`);
    }
    return pts.join(" ");
  })();

  const totalStressed = sentence.syllables.filter((s) => s.stressed).length;
  const hits = syllStates.filter((s) => s === "hit").length;
  const accuracy = totalStressed > 0 ? Math.round((hits / totalStressed) * 100) : 0;

  return (
    <DemoShell
      title="重音冲浪"
      description="英语重读节奏游戏 — 在重读音节经过中线时点击，感受英语的节拍"
      tags={["发音", "节奏", "重读", "游戏化"]}
    >
      <div className="space-y-5">
        {/* Sentence selector */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-wrap gap-2">
            {SENTENCES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (i === sentenceIdx) return;
                  setSentenceIdx(i);
                  const fresh = SENTENCES[i].syllables.map(() => "pending" as SyllableState);
                  setSyllStates(fresh);
                  syllStatesRef.current = fresh;
                  setCombo(0);
                  comboRef.current = 0;
                  setBestCombo(0);
                  bestComboRef.current = 0;
                  setElapsed(0);
                  elapsedRef.current = 0;
                  setGameState("idle");
                  stateRef.current = "idle";
                  if (rafRef.current !== null) {
                    cancelAnimationFrame(rafRef.current);
                    rafRef.current = null;
                  }
                }}
                className={`text-sm px-3 py-1 rounded-md border transition-all ${
                  i === sentenceIdx
                    ? "border-primary bg-primary/15 text-primary-light font-medium"
                    : "border-border hover:border-primary/50"
                }`}
              >
                Sentence {i + 1}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-text-muted">Combo: <span className="text-primary-light font-bold">{combo}</span></span>
            <span className="text-text-muted">最佳: {bestCombo}</span>
          </div>
        </div>

        {/* Gloss */}
        <p className="text-xs text-text-muted text-center italic">{sentence.glossZh}</p>

        {/* Canvas */}
        <div className="rounded-lg border border-border bg-surface-alt overflow-hidden">
          <svg
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            className="w-full"
            style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
          >
            {/* Hit zone band */}
            <rect x={HIT_X - 28} y={0} width={56} height={CANVAS_H} fill="rgba(124,156,255,0.07)" />

            {/* Hit line */}
            <line
              x1={HIT_X}
              x2={HIT_X}
              y1={20}
              y2={CANVAS_H - 20}
              stroke="rgba(124, 156, 255, 0.8)"
              strokeWidth={2}
              strokeDasharray="5 4"
            />
            <text x={HIT_X} y={14} fontSize="10" textAnchor="middle" fill="rgb(124,156,255)" opacity={0.8}>
              HIT
            </text>

            {/* Echo wave */}
            <path d={echoPath} fill="none" stroke="rgba(124,156,255,0.35)" strokeWidth={1.5} />
            {/* Main wave */}
            <path d={wavePath} fill="none" stroke="rgba(124,156,255,0.95)" strokeWidth={2.5} />

            {/* Syllable tiles */}
            {sentence.syllables.map((s, i) => {
              const x = syllableX(i, elapsed);
              if (x < -80 || x > CANVAS_W + 80) return null;
              const phaseY = WAVE_BASE_Y + Math.sin((x / 60) + elapsed * 2.5) * waveAmp;
              const state = syllStates[i];
              const isFeedback = feedback?.idx === i;
              let color = "rgb(180,180,200)";
              let bgFill = "rgba(40,40,60,0.85)";
              if (s.stressed && state === "pending") {
                color = "rgb(124,156,255)";
                bgFill = "rgba(60,80,140,0.85)";
              }
              if (state === "hit") {
                color = "rgb(74, 222, 128)";
                bgFill = "rgba(40,80,55,0.9)";
              }
              if (state === "miss") {
                color = "rgb(248,113,113)";
                bgFill = "rgba(80,40,40,0.9)";
              }
              const scale = isFeedback && feedback?.kind === "hit" ? 1.35 : 1;
              const fontSize = s.stressed ? 16 : 12;
              const padX = s.text.length * (s.stressed ? 5 : 4) + 10;

              return (
                <g
                  key={i}
                  transform={`translate(${x}, ${phaseY - 35}) scale(${scale})`}
                  style={{ transition: "transform 200ms" }}
                >
                  {showMarkers && !hardMode && s.stressed && (
                    <text x={0} y={-14} fontSize="10" textAnchor="middle" fill={color} opacity={0.85}>
                      ▲
                    </text>
                  )}
                  <rect
                    x={-padX / 2}
                    y={-fontSize}
                    width={padX}
                    height={fontSize + 8}
                    rx={5}
                    fill={bgFill}
                    stroke={color}
                    strokeOpacity={0.7}
                    strokeWidth={s.stressed ? 1.5 : 1}
                  />
                  <text
                    x={0}
                    y={2}
                    fontSize={fontSize}
                    textAnchor="middle"
                    fill={color}
                    fontWeight={s.stressed ? "bold" : "normal"}
                  >
                    {s.text}
                  </text>
                </g>
              );
            })}

            {/* Hit ripple */}
            {feedback?.kind === "hit" && (
              <circle
                cx={HIT_X}
                cy={WAVE_BASE_Y}
                r={waveBurst > 0 ? 50 : 20}
                fill="none"
                stroke="rgb(74,222,128)"
                strokeOpacity={0.5}
                strokeWidth={2}
                style={{ transition: "r 350ms ease-out" }}
              />
            )}
          </svg>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {gameState === "idle" || gameState === "finished" ? (
            <button type="button" className="demo-btn flex items-center gap-1.5" onClick={start}>
              <Play className="w-4 h-4" /> {gameState === "finished" ? "再来一次" : "开始"}
            </button>
          ) : gameState === "playing" ? (
            <button type="button" className="demo-btn-outline flex items-center gap-1.5" onClick={pause}>
              <Pause className="w-4 h-4" /> 暂停
            </button>
          ) : (
            <button type="button" className="demo-btn flex items-center gap-1.5" onClick={resume}>
              <Play className="w-4 h-4" /> 继续
            </button>
          )}
          <button
            type="button"
            className="demo-btn-outline flex items-center gap-1.5"
            onClick={resetSentence}
          >
            <RotateCcw className="w-4 h-4" /> 重置
          </button>

          {/* Tempo slider */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-muted">速度</span>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={tempo}
              disabled={gameState === "playing"}
              onChange={(e) => setTempo(parseFloat(e.target.value))}
              className="w-28"
            />
            <span className="text-text-muted tabular-nums w-10">{Math.round(tempo * 100)}%</span>
          </div>

          {finishedOnce && (
            <button
              type="button"
              className="demo-btn-outline flex items-center gap-1.5"
              onClick={() => setHardMode((p) => !p)}
            >
              {hardMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {hardMode ? "显示重音提示" : "Hard 模式"}
            </button>
          )}

          <button
            type="button"
            className="demo-btn-outline flex items-center gap-1.5 ml-auto"
            onClick={nextSentence}
          >
            下一句 <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tap button + instructions */}
        <button
          type="button"
          onClick={handleTap}
          disabled={gameState !== "playing"}
          className={`w-full py-4 rounded-lg border-2 text-lg font-bold transition-all ${
            gameState === "playing"
              ? "border-primary bg-primary/15 text-primary-light hover:bg-primary/25 active:scale-[0.99]"
              : "border-border bg-surface-alt text-text-muted opacity-60 cursor-not-allowed"
          }`}
        >
          TAP 重音 · SPACE
        </button>
        <p className="text-xs text-text-muted text-center">
          {showMarkers && !hardMode && "▲ = 重读音节 · "}
          重读音节经过中线时点击按钮或按空格 — 命中后波形会膨胀
        </p>

        {/* Results */}
        <AnimatePresence>
          {gameState === "finished" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-surface-alt p-3 space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span>命中重音：{hits} / {totalStressed}</span>
                <span>最佳连击：{bestCombo}</span>
                <span className="text-primary-light font-medium">
                  准确率 {accuracy}%
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sentence.syllables.map((s, i) => {
                  const st = syllStates[i];
                  let cls = "text-xs px-2 py-0.5 rounded border ";
                  if (!s.stressed) cls += "border-border text-text-muted opacity-50";
                  else if (st === "hit") cls += "border-success bg-success/15 text-success font-medium";
                  else cls += "border-error bg-error/10 text-error";
                  return (
                    <span key={i} className={cls}>
                      {s.text}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DemoShell>
  );
}
