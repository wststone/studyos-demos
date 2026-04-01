import { useState, useRef, useCallback, useEffect } from "react";
import { DemoShell } from "@/components/demo-shell";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Pause, CheckCircle, XCircle } from "lucide-react";

const SCENE = {
  emoji: "🏔️🌅",
  title: "山顶日出",
  description:
    "请看这幅画面，用自己的话描述你看到的场景。试着包含以下关键词：",
  keywords: ["山峰", "日出", "云海", "光芒", "壮观"],
};

const MOCK_SCORE = {
  fluency: 85,
  keywordsCovered: ["山峰", "云海", "光芒"],
};

export function VoiceStorytelling() {
  const [state, setState] = useState<
    "idle" | "recording" | "recorded" | "playing" | "scored"
  >("idle");
  const [duration, setDuration] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const [bars, setBars] = useState<number[]>(new Array(24).fill(4));

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        audioCtx.close();
      };

      mr.start(100);
      setState("recording");
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      const updateBars = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const newBars = Array.from({ length: 24 }, (_, i) => {
          const idx = Math.floor((i / 24) * data.length);
          return Math.max(4, (data[idx] / 255) * 48);
        });
        setBars(newBars);
        animFrameRef.current = requestAnimationFrame(updateBars);
      };
      updateBars();
    } catch {
      alert("无法访问麦克风，请检查浏览器权限。");
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    setBars(new Array(24).fill(4));
    setState("recorded");
  }, []);

  const playAudio = useCallback(() => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setPlaybackTime(0);
    setState("playing");

    const timer = setInterval(() => {
      setPlaybackTime(Math.floor(audio.currentTime));
    }, 200);

    audio.onended = () => {
      clearInterval(timer);
      setState("recorded");
    };
    audio.play();
  }, [audioUrl]);

  const pauseAudio = useCallback(() => {
    audioRef.current?.pause();
    setState("recorded");
  }, []);

  const showScore = useCallback(() => {
    setState("scored");
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <DemoShell
      title="语音看图讲述"
      description="观察图片，录制你的口述描述，AI 将评估你的流利度和关键词覆盖率"
      tags={["语音", "口语表达", "AI 评分"]}
    >
      <div className="space-y-6">
        {/* Scene illustration */}
        <div className="rounded-xl bg-gradient-to-br from-indigo-900/60 to-purple-900/40 border border-border flex flex-col items-center justify-center py-12 select-none">
          <span className="text-7xl mb-3">{SCENE.emoji}</span>
          <h3 className="text-lg font-semibold">{SCENE.title}</h3>
          <p className="text-text-muted text-sm mt-2 max-w-md text-center px-4">
            {SCENE.description}
          </p>
          <div className="flex gap-2 mt-3 flex-wrap justify-center px-4">
            {SCENE.keywords.map((kw) => (
              <span key={kw} className="demo-tag">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Waveform / controls */}
        <div className="flex flex-col items-center gap-4">
          {state === "recording" && (
            <motion.div
              className="flex items-end gap-[3px] h-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  className="w-[5px] rounded-full bg-primary"
                  animate={{ height: h }}
                  transition={{ duration: 0.08 }}
                />
              ))}
            </motion.div>
          )}

          {state === "recording" && (
            <div className="flex items-center gap-2 text-error">
              <span className="inline-block w-2 h-2 rounded-full bg-error animate-pulse" />
              <span className="font-mono text-sm">{fmt(duration)}</span>
            </div>
          )}

          <div className="flex gap-3 items-center">
            {state === "idle" && (
              <button className="demo-btn flex items-center gap-2" onClick={startRecording}>
                <Mic className="w-4 h-4" /> 开始录音
              </button>
            )}
            {state === "recording" && (
              <button
                className="demo-btn flex items-center gap-2 !bg-error hover:!bg-red-600"
                onClick={stopRecording}
              >
                <Square className="w-4 h-4" /> 停止
              </button>
            )}
            {(state === "recorded" || state === "scored") && (
              <>
                <button className="demo-btn-outline flex items-center gap-2" onClick={playAudio}>
                  <Play className="w-4 h-4" /> 播放 ({fmt(duration)})
                </button>
                <button className="demo-btn flex items-center gap-2" onClick={showScore}>
                  查看 AI 评分
                </button>
                <button
                  className="demo-btn-outline flex items-center gap-2"
                  onClick={() => {
                    setAudioUrl(null);
                    setState("idle");
                    setDuration(0);
                  }}
                >
                  重录
                </button>
              </>
            )}
            {state === "playing" && (
              <button
                className="demo-btn-outline flex items-center gap-2"
                onClick={pauseAudio}
              >
                <Pause className="w-4 h-4" /> 暂停 ({fmt(playbackTime)})
              </button>
            )}
          </div>
        </div>

        {/* Scoring */}
        <AnimatePresence>
          {state === "scored" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-5 border border-border rounded-xl p-5 bg-surface-alt"
            >
              <h3 className="font-semibold text-lg">AI 评分结果</h3>

              {/* Fluency */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>流利度</span>
                  <span className="text-primary-light font-mono">{MOCK_SCORE.fluency}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${MOCK_SCORE.fluency}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Keywords */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>关键词覆盖</span>
                  <span className="text-primary-light font-mono">
                    {MOCK_SCORE.keywordsCovered.length}/{SCENE.keywords.length}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface overflow-hidden mb-3">
                  <motion.div
                    className="h-full rounded-full bg-success"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(MOCK_SCORE.keywordsCovered.length / SCENE.keywords.length) * 100}%`,
                    }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  />
                </div>
                <ul className="space-y-1">
                  {SCENE.keywords.map((kw) => {
                    const covered = MOCK_SCORE.keywordsCovered.includes(kw);
                    return (
                      <li key={kw} className="flex items-center gap-2 text-sm">
                        {covered ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <XCircle className="w-4 h-4 text-error" />
                        )}
                        <span className={covered ? "text-text" : "text-text-muted"}>{kw}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DemoShell>
  );
}
