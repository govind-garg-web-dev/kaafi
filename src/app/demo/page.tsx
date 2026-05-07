"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import MCQWizard from "@/components/mcq/MCQWizard";
import LoadingScreen from "@/components/mcq/LoadingScreen";
import type { MCQQuestion } from "@/lib/mcq-data";
import Link from "next/link";

type Stage = "idea" | "loading" | "wizard";

const EXAMPLE_CHIPS = [
  "local dog walkers marketplace",
  "tiffin delivery tracker",
  "expense tracker for couples",
  "appointment booking for salons",
  "kirana store inventory manager",
  "second-hand clothes marketplace",
];

export default function DemoPage() {
  const [stage, setStage] = useState<Stage>("idea");
  const [idea, setIdea] = useState("");
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (stage === "idea" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [stage]);

  const handleGenerate = async () => {
    const trimmed = idea.trim();
    if (trimmed.length < 5) return;

    setError(null);
    setStage("loading");

    try {
      const res = await fetch("/api/ai/mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Something went wrong");
      }

      setQuestions(data.questions);
      setStage("wizard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate questions.");
      setStage("idea");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-[#07070f] bg-grid-fine flex flex-col">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-[500px] h-[500px] bg-violet-700/15 -top-60 -left-40" />
        <div className="orb w-[350px] h-[350px] bg-cyan-600/10 bottom-0 right-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(124,92,252,0.1),transparent)]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 h-16 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#22d3ee] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-xs" style={{ fontFamily: "var(--font-playfair)" }}>K</span>
          </div>
          <span className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>
            Kaafi
          </span>
        </Link>

        <div className="flex items-center gap-2 text-[#64748b] text-sm" style={{ fontFamily: "var(--font-inter)" }}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
          Interactive demo
        </div>
      </nav>

      {/* Main */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">

            {/* STAGE: IDEA INPUT */}
            {stage === "idea" && (
              <motion.div
                key="idea"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Header */}
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-xl shadow-violet-500/30 mb-5"
                  >
                    <Sparkles size={24} className="text-white" />
                  </motion.div>

                  <h1
                    className="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    What do you want to build?
                  </h1>
                  <p
                    className="text-[#64748b] text-lg"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Describe your app idea in a sentence or two.{" "}
                    <span
                      className="font-medium"
                      style={{
                        background: "linear-gradient(135deg, #a78bfa, #22d3ee)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        fontFamily: "var(--font-dancing)",
                        fontSize: "1.15em",
                      }}
                    >
                      Kaafi does the rest.
                    </span>
                  </p>
                </div>

                {/* Text input */}
                <div
                  className="rounded-2xl p-1 mb-4"
                  style={{
                    background: "rgba(14,14,28,0.8)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  <textarea
                    ref={textareaRef}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. An app for local dog walkers where pet owners can find, book, and track their dog's walk in real time…"
                    rows={4}
                    className="w-full bg-transparent px-5 pt-4 pb-2 text-white text-base resize-none outline-none placeholder-[#3a3a5a] leading-relaxed"
                    style={{ fontFamily: "var(--font-inter)" }}
                    maxLength={400}
                  />
                  <div className="flex items-center justify-between px-5 pb-3">
                    <span className="text-[#3a3a5a] text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                      {idea.length}/400
                    </span>
                    <span className="text-[#3a3a5a] text-xs hidden sm:block" style={{ fontFamily: "var(--font-inter)" }}>
                      Press Enter to generate ↵
                    </span>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontFamily: "var(--font-inter)" }}
                  >
                    {error}
                  </motion.div>
                )}

                {/* Example chips */}
                <div className="mb-6">
                  <p className="text-[#4a5568] text-xs mb-3 px-1" style={{ fontFamily: "var(--font-inter)" }}>
                    Or try an example:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => setIdea(`I want an app for ${chip}`)}
                        className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 text-[#94a3b8] hover:text-white"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          fontFamily: "var(--font-inter)",
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate button */}
                <motion.button
                  onClick={handleGenerate}
                  disabled={idea.trim().length < 5}
                  whileHover={{ scale: idea.trim().length >= 5 ? 1.01 : 1 }}
                  whileTap={{ scale: 0.99 }}
                  className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  <Sparkles size={17} />
                  Generate my questions
                  <ArrowRight size={17} />
                </motion.button>

                <p className="text-center text-[#4a5568] text-xs mt-4" style={{ fontFamily: "var(--font-inter)" }}>
                  No account needed · Powered by Claude Haiku
                </p>
              </motion.div>
            )}

            {/* STAGE: LOADING */}
            {stage === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="rounded-3xl p-8"
                  style={{
                    background: "rgba(14,14,28,0.7)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 40px 120px rgba(0,0,0,0.5)",
                  }}
                >
                  <LoadingScreen idea={idea} />
                </div>
              </motion.div>
            )}

            {/* STAGE: WIZARD */}
            {stage === "wizard" && questions.length > 0 && (
              <motion.div
                key="wizard"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
              >
                {/* Back */}
                <button
                  onClick={() => { setStage("idea"); setQuestions([]); }}
                  className="flex items-center gap-1.5 text-[#64748b] hover:text-white transition-colors text-sm mb-6 group"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  <ArrowRight size={13} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                  Start over
                </button>

                {/* Idea recap */}
                <div
                  className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl"
                  style={{ background: "rgba(124,92,252,0.07)", border: "1px solid rgba(124,92,252,0.15)" }}
                >
                  <span className="text-xl">💡</span>
                  <p className="text-[#94a3b8] text-xs leading-snug line-clamp-2" style={{ fontFamily: "var(--font-inter)" }}>
                    <span className="text-violet-400 font-semibold">Your idea: </span>
                    {idea}
                  </p>
                </div>

                {/* Wizard card */}
                <div
                  className="rounded-3xl p-7"
                  style={{
                    background: "rgba(14,14,28,0.7)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 40px 120px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  <MCQWizard appIdea={idea} questions={questions} />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
