import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Shuffle,
} from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface PronunciationWord {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  difficulty: "easy" | "medium" | "hard";
  tips: string;
}

const ENGLISH_WORDS: PronunciationWord[] = [
  {
    id: "en1",
    word: "through",
    phonetic: "/θruː/",
    meaning: "通过",
    difficulty: "medium",
    tips: "注意 th 发 /θ/ 音，舌尖放在上下齿之间",
  },
  {
    id: "en2",
    word: "vegetable",
    phonetic: "/ˈvedʒtəbl/",
    meaning: "蔬菜",
    difficulty: "medium",
    tips: "注意重音在第一个音节，中间的 e 弱化",
  },
  {
    id: "en3",
    word: "comfortable",
    phonetic: "/ˈkʌmftəbl/",
    meaning: "舒适的",
    difficulty: "hard",
    tips: "实际发音只有3个音节，不要把 for 读得太重",
  },
  {
    id: "en4",
    word: "schedule",
    phonetic: "/ˈskedʒuːl/",
    meaning: "时间表",
    difficulty: "medium",
    tips: "美式发音 sch 读 /sk/，英式读 /ʃ/",
  },
  {
    id: "en5",
    word: "pronunciation",
    phonetic: "/prəˌnʌnsiˈeɪʃn/",
    meaning: "发音",
    difficulty: "hard",
    tips: "注意不是 pro-NOUN-ciation，而是 pro-NUN-ciation",
  },
];

const CHINESE_WORDS: PronunciationWord[] = [
  {
    id: "zh1",
    word: "知道",
    phonetic: "zhī dào",
    meaning: "know",
    difficulty: "easy",
    tips: "zh 是翘舌音，舌尖卷起抵住硬腭",
  },
  {
    id: "zh2",
    word: "旅游",
    phonetic: "lǚ yóu",
    meaning: "travel",
    difficulty: "medium",
    tips: "注意 lǚ 是第三声，声调要先降后升",
  },
  {
    id: "zh3",
    word: "热情",
    phonetic: "rè qíng",
    meaning: "enthusiastic",
    difficulty: "medium",
    tips: "r 的发音与英语不同，舌尖卷起但不颤动",
  },
  {
    id: "zh4",
    word: "吃饭",
    phonetic: "chī fàn",
    meaning: "eat",
    difficulty: "easy",
    tips: "ch 是翘舌音送气音，与 zh 的区别在于送气",
  },
  {
    id: "zh5",
    word: "区别",
    phonetic: "qū bié",
    meaning: "difference",
    difficulty: "hard",
    tips: "q 是舌面前送气音，嘴唇圆成 ü 的形状",
  },
];

type Lang = "english" | "chinese";
type RecordingState = "idle" | "recording" | "done";

const DIFFICULTY_COLORS = {
  easy: "bg-success/20 text-success",
  medium: "bg-warning/20 text-warning",
  hard: "bg-error/20 text-error",
};

const DIFFICULTY_LABELS = { easy: "简单", medium: "中等", hard: "困难" };

export function PronunciationTrainer() {
  const [lang, setLang] = useState<Lang>("english");
  const [wordIdx, setWordIdx] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [showTips, setShowTips] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [selfRating, setSelfRating] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const words = lang === "english" ? ENGLISH_WORDS : CHINESE_WORDS;
  const word = words[wordIdx];

  const speak = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = lang === "english" ? "en-US" : "zh-CN";
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }, [word.word, lang]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = URL.createObjectURL(blob);
        stream.getTracks().forEach((t) => t.stop());
        setRecordingState("done");
        setAttempts((a) => a + 1);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingState("recording");
    } catch {
      alert("无法访问麦克风，请检查浏览器权限设置。");
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const playBack = useCallback(() => {
    if (audioUrlRef.current) {
      new Audio(audioUrlRef.current).play();
    }
  }, []);

  function nextWord() {
    setWordIdx((i) => (i + 1) % words.length);
    setRecordingState("idle");
    setShowTips(false);
    setSelfRating(null);
    audioUrlRef.current = null;
  }

  function switchLang() {
    setLang((l) => (l === "english" ? "chinese" : "english"));
    setWordIdx(0);
    setRecordingState("idle");
    setShowTips(false);
    setAttempts(0);
    setSelfRating(null);
    audioUrlRef.current = null;
  }

  return (
    <DemoShell
      title="发音训练器"
      description="听标准发音，录制自己的发音进行对比练习。"
      tags={["发音", "口语", "英语", "中文"]}
    >
      <div className="space-y-5">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={switchLang}
            className="demo-btn-outline inline-flex items-center gap-1.5 text-sm"
          >
            <Shuffle className="h-4 w-4" />
            {lang === "english" ? "切换到中文" : "Switch to English"}
          </button>
          <span className="text-xs text-text-muted">
            {wordIdx + 1}/{words.length} · 已练习 {attempts} 次
          </span>
        </div>

        {/* Word card */}
        <motion.div
          key={word.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6 rounded-xl bg-surface-alt border border-border"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[word.difficulty]}`}
            >
              {DIFFICULTY_LABELS[word.difficulty]}
            </span>
          </div>
          <p className="text-4xl font-bold mb-2">{word.word}</p>
          <p className="text-lg text-primary-light font-mono mb-1">{word.phonetic}</p>
          <p className="text-sm text-text-muted">{word.meaning}</p>

          {/* Listen button */}
          <button
            onClick={speak}
            className="mt-4 demo-btn-outline inline-flex items-center gap-2 text-sm mx-auto"
          >
            <Volume2 className="h-4 w-4" />
            听标准发音
          </button>
        </motion.div>

        {/* Recording area */}
        <div className="flex flex-col items-center gap-4 py-4">
          {recordingState === "idle" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white shadow-lg hover:bg-primary/90 transition-colors"
            >
              <Mic className="h-8 w-8" />
            </motion.button>
          )}

          {recordingState === "recording" && (
            <motion.button
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              onClick={stopRecording}
              className="w-20 h-20 rounded-full bg-error flex items-center justify-center text-white shadow-lg"
            >
              <MicOff className="h-8 w-8" />
            </motion.button>
          )}

          {recordingState === "done" && (
            <div className="flex items-center gap-3">
              <button
                onClick={playBack}
                className="demo-btn-outline inline-flex items-center gap-2 text-sm"
              >
                <Volume2 className="h-4 w-4" />
                回放录音
              </button>
              <button
                onClick={speak}
                className="demo-btn-outline inline-flex items-center gap-2 text-sm"
              >
                <Volume2 className="h-4 w-4" />
                再听一遍
              </button>
              <button
                onClick={() => {
                  setRecordingState("idle");
                }}
                className="demo-btn-outline inline-flex items-center gap-2 text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                重录
              </button>
            </div>
          )}

          <p className="text-xs text-text-muted">
            {recordingState === "idle"
              ? "点击麦克风开始录音"
              : recordingState === "recording"
                ? "正在录音，点击停止..."
                : "录音完成！对比听听看"}
          </p>
        </div>

        {/* Self-rating */}
        <AnimatePresence>
          {recordingState === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-surface-alt p-4"
            >
              <p className="text-sm font-medium mb-3">自我评价：你觉得发音怎么样？</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSelfRating(n)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      selfRating === n
                        ? n >= 4
                          ? "bg-success/20 text-success border border-success/50"
                          : n >= 3
                            ? "bg-warning/20 text-warning border border-warning/50"
                            : "bg-error/20 text-error border border-error/50"
                        : "bg-surface-hover border border-border hover:border-primary/30"
                    }`}
                  >
                    {"⭐".repeat(n)}
                  </button>
                ))}
              </div>
              {selfRating !== null && selfRating < 4 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-text-muted mt-2"
                >
                  建议：多听标准发音，注意查看发音提示后再试一次！
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips */}
        <div>
          <button
            onClick={() => setShowTips(!showTips)}
            className="text-sm text-primary-light hover:underline flex items-center gap-1"
          >
            <AlertCircle className="h-4 w-4" />
            {showTips ? "隐藏发音提示" : "查看发音提示"}
          </button>
          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-3 rounded-lg bg-primary/10 border border-primary/30 text-sm">
                  {word.tips}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Next */}
        <div className="flex flex-wrap gap-3">
          <button
            className="demo-btn inline-flex items-center gap-2 text-sm"
            onClick={nextWord}
          >
            {selfRating && selfRating >= 4 ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            下一个词
          </button>
        </div>
      </div>
    </DemoShell>
  );
}
