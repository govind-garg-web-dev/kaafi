"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGES = [
  { text: "Kaafi is thinking…", emoji: "🤔" },
  { text: "Did you have Kaafi today?", emoji: "☕" },
  { text: "Asking the important questions…", emoji: "💭" },
  { text: "Kaafi kaam kar raha hai…", emoji: "🛠️" },
  { text: "One app a day keeps boredom away.", emoji: "📱" },
  { text: "Your idea has legs. Let's give it wings.", emoji: "🚀" },
  { text: "Connecting brain cells…", emoji: "🧠" },
  { text: "Brewing your perfect plan…", emoji: "☕" },
  { text: "This is the good part.", emoji: "✨" },
  { text: "Almost there. Probably.", emoji: "⏳" },
];

export default function LoadingScreen({ idea }: { idea: string }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIdx((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    const dotTimer = setInterval(() => {
      setDots((d) => (d + 1) % 4);
    }, 400);
    return () => {
      clearInterval(msgTimer);
      clearInterval(dotTimer);
    };
  }, []);

  const current = MESSAGES[msgIdx];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Animated logo orb */}
      <div className="relative mb-10">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-violet-500/40"
        >
          <span className="text-white font-bold text-3xl" style={{ fontFamily: "var(--font-playfair)" }}>
            K
          </span>
        </motion.div>

        {/* Orbiting dot */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
          style={{ transformOrigin: "center" }}
        >
          <div
            className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/60"
            style={{ top: -6, left: "50%", transform: "translateX(-50%)" }}
          />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
          style={{ transformOrigin: "center" }}
        >
          <div
            className="absolute w-2 h-2 rounded-full bg-violet-400 shadow-lg shadow-violet-400/60"
            style={{ bottom: -4, left: "50%", transform: "translateX(-50%)" }}
          />
        </motion.div>
      </div>

      {/* Idea being processed */}
      <div
        className="mb-6 px-5 py-3 rounded-2xl max-w-sm"
        style={{ background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.2)" }}
      >
        <p className="text-[#94a3b8] text-xs mb-1" style={{ fontFamily: "var(--font-inter)" }}>
          Analysing your idea
        </p>
        <p className="text-white text-sm font-medium leading-snug" style={{ fontFamily: "var(--font-inter)" }}>
          &ldquo;{idea.length > 80 ? idea.slice(0, 80) + "…" : idea}&rdquo;
        </p>
      </div>

      {/* Rotating message */}
      <div className="h-14 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={msgIdx}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="text-2xl">{current.emoji}</span>
            <p
              className="text-[#94a3b8] text-sm"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {current.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: i === dots ? 1 : 0.2, scale: i === dots ? 1.3 : 1 }}
            transition={{ duration: 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-violet-400"
          />
        ))}
      </div>

      {/* Generating label */}
      <p
        className="text-[#4a5568] text-xs mt-5"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Generating {18} personalised questions just for you…
      </p>
    </div>
  );
}
