"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Shuffle, Sparkles, Check } from "lucide-react";
import type { MCQQuestion } from "@/lib/mcq-data";
import Link from "next/link";

type Answers = Record<string, string>;

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #7c5cfc, #a78bfa)" }}
            initial={{ width: 0 }}
            animate={{ width: i < current ? "100%" : i === current ? "40%" : "0%" }}
            transition={{ duration: 0.4 }}
          />
        </div>
      ))}
    </div>
  );
}

function QuestionCard({
  question,
  selected,
  onSelect,
  direction,
}: {
  question: MCQQuestion;
  selected: string | undefined;
  onSelect: (id: string) => void;
  direction: number;
}) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: direction * 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction * -60 }}
      transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full"
    >
      {/* Category label */}
      <div className="mb-3">
        <span
          className="text-xs font-bold tracking-widest text-violet-400/70 uppercase"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {question.category}
        </span>
      </div>

      {/* Question */}
      <h2
        className="text-2xl lg:text-3xl font-bold text-white mb-7 leading-tight"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {question.question}
      </h2>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt, i) => {
          const isSelected = selected === opt.id;
          return (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(opt.id)}
              className="relative text-left rounded-2xl p-4 transition-all duration-200"
              style={{
                background: isSelected ? "rgba(124,92,252,0.15)" : "rgba(255,255,255,0.03)",
                border: isSelected
                  ? "1px solid rgba(124,92,252,0.5)"
                  : "1px solid rgba(255,255,255,0.07)",
                boxShadow: isSelected
                  ? "0 0 0 1px rgba(124,92,252,0.18), 0 8px 32px rgba(124,92,252,0.12)"
                  : "none",
              }}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center"
                  >
                    <Check size={10} className="text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-2xl mb-2">{opt.icon}</div>
              <p
                className={`font-semibold text-sm mb-0.5 ${isSelected ? "text-white" : "text-[#e2e8f0]"}`}
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {opt.label}
              </p>
              <p
                className="text-[#64748b] text-xs leading-snug"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {opt.description}
              </p>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function SummaryCard({
  appIdea,
  questions,
  answers,
}: {
  appIdea: string;
  questions: MCQQuestion[];
  answers: Answers;
}) {
  const [joined, setJoined] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <p className="text-xs text-violet-400 font-bold tracking-widest uppercase" style={{ fontFamily: "var(--font-inter)" }}>
            Your app plan is ready
          </p>
          <h2
            className="text-xl font-bold text-white leading-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {appIdea.length > 60 ? appIdea.slice(0, 60) + "…" : appIdea}
          </h2>
        </div>
      </div>

      {/* Summary note */}
      <div
        className="rounded-2xl p-4 mb-5"
        style={{ background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.2)" }}
      >
        <p className="text-[#c4b5fd] text-sm leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
          We&apos;ve captured your preferences across {questions.length} dimensions. Kaafi would
          use this to generate a fully wired React Native app — tailored exactly to your answers.
        </p>
      </div>

      {/* Answers grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-7 max-h-72 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#2a2a4a transparent" }}>
        {questions.map((q) => {
          const answerId = answers[q.id];
          const option = q.options.find((o) => o.id === answerId);
          if (!option) return null;
          return (
            <div
              key={q.id}
              className="rounded-xl px-3 py-2.5 flex items-center gap-2.5 flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-base flex-shrink-0">{option.icon}</span>
              <div className="min-w-0">
                <p className="text-[#64748b] text-[9px] font-bold tracking-wider uppercase truncate" style={{ fontFamily: "var(--font-inter)" }}>
                  {q.category}
                </p>
                <p className="text-white text-xs font-medium truncate" style={{ fontFamily: "var(--font-inter)" }}>
                  {option.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        {joined ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-1 rounded-2xl px-5 py-4 flex items-center gap-3"
            style={{ background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.3)" }}
          >
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-inter)" }}>
                You&apos;re on the list!
              </p>
              <p className="text-[#94a3b8] text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                We&apos;ll build this for real when Kaafi launches.
              </p>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setJoined(true)}
            className="btn-primary flex-1 py-4 text-sm flex items-center justify-center gap-2"
          >
            <Sparkles size={15} />
            Generate my app — join the waitlist
          </button>
        )}
        <Link href="/" className="flex-shrink-0">
          <button className="btn-outline w-full sm:w-auto px-5 py-4 text-sm">
            ← Back to Kaafi
          </button>
        </Link>
      </div>

      <p className="text-[#4a5568] text-xs text-center mt-4" style={{ fontFamily: "var(--font-inter)" }}>
        This is a demo. No code is generated here — the real Kaafi does that.
      </p>
    </motion.div>
  );
}

export default function MCQWizard({
  appIdea,
  questions,
}: {
  appIdea: string;
  questions: MCQQuestion[];
}) {
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [direction, setDirection] = useState(1);
  const [done, setDone] = useState(false);

  const currentQuestion = questions[questionIdx];
  const total = questions.length;
  const selectedForCurrent = answers[currentQuestion?.id];
  const isLast = questionIdx === total - 1;

  const handleSelect = (optId: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optId }));
  };

  const handleSurprise = () => {
    const opts = currentQuestion.options;
    const random = opts[Math.floor(Math.random() * opts.length)];
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: random.id }));
  };

  const handleNext = () => {
    if (!selectedForCurrent) return;
    if (isLast) { setDone(true); return; }
    setDirection(1);
    setQuestionIdx((i) => i + 1);
  };

  const handleBack = () => {
    if (questionIdx === 0) return;
    setDirection(-1);
    setQuestionIdx((i) => i - 1);
  };

  if (done) {
    return <SummaryCard appIdea={appIdea} questions={questions} answers={answers} />;
  }

  return (
    <div className="w-full">
      {/* Progress */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#64748b] text-xs" style={{ fontFamily: "var(--font-inter)" }}>
            {questionIdx + 1} / {total}
          </span>
          <button
            onClick={handleSurprise}
            className="flex items-center gap-1.5 text-[#64748b] hover:text-violet-400 transition-colors text-xs"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <Shuffle size={12} />
            Surprise me
          </button>
        </div>
        <ProgressBar current={questionIdx} total={total} />
      </div>

      {/* Question */}
      <div className="relative overflow-hidden min-h-[460px] flex flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            selected={selectedForCurrent}
            onSelect={handleSelect}
            direction={direction}
          />
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5 pt-5 border-t border-white/5">
        <button
          onClick={handleBack}
          disabled={questionIdx === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed text-[#94a3b8] hover:text-white hover:bg-white/5"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!selectedForCurrent}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-35 disabled:cursor-not-allowed"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {isLast ? "See my plan" : "Next"}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
