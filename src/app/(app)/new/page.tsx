"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Crown, Zap, Lock, Check, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import MCQWizard from "@/components/mcq/MCQWizard";
import LoadingScreen from "@/components/mcq/LoadingScreen";
import UpgradeModal from "@/components/app/UpgradeModal";
import { createClient } from "@/lib/supabase/client";
import type { MCQQuestion } from "@/lib/mcq-data";
import type { Plan } from "@/lib/supabase/types";

type Stage = "idea" | "mcq-loading" | "wizard" | "summary" | "generating";

const EXAMPLE_CHIPS = [
  "local dog walkers marketplace",
  "tiffin delivery tracker",
  "expense tracker for couples",
  "appointment booking for salons",
  "kirana store inventory manager",
  "second-hand clothes marketplace",
];

// ── Generating screen ─────────────────────────────────────
function GeneratingScreen({ name, premium }: { name: string; premium: boolean }) {
  const STEPS = premium
    ? [
        "Reading your answers carefully…",
        "Selecting the best template…",
        "Writing screens with Opus 4.7…",
        "Adding complex logic…",
        "Wiring up navigation…",
        "Polishing the details…",
        "Almost there…",
      ]
    : [
        "Analysing your answers…",
        "Selecting the best template…",
        "Writing your screens…",
        "Wiring up navigation…",
        "Adding sample data…",
        "Almost done…",
      ];

  const [step, setStep] = useState(0);
  useState(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 4000);
    return () => clearInterval(t);
  });

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl mb-8"
        style={{
          background: premium
            ? "linear-gradient(135deg, #f59e0b, #ef4444)"
            : "linear-gradient(135deg, #7c5cfc, #06b6d4)",
          boxShadow: premium
            ? "0 20px 60px rgba(245,158,11,0.35)"
            : "0 20px 60px rgba(124,92,252,0.35)",
        }}
      >
        {premium ? <Crown size={26} className="text-white" /> : <Sparkles size={26} className="text-white" />}
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
        Building {name}
      </h2>
      {premium && (
        <p className="text-amber-400 text-xs font-semibold mb-1" style={{ fontFamily: "var(--font-inter)" }}>
          ✦ Opus 4.7 — our most powerful model
        </p>
      )}
      <p className="text-[#64748b] text-sm mb-8" style={{ fontFamily: "var(--font-inter)" }}>
        {premium ? "This takes about 90–150 seconds." : "This takes about 60–120 seconds."} Don&apos;t close this tab.
      </p>
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-sm font-medium"
          style={{
            fontFamily: "var(--font-inter)",
            color: premium ? "#fbbf24" : "#a78bfa",
          }}
        >
          {STEPS[step]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// ── Summary + Premium picker ──────────────────────────────
function SummaryAndGenerate({
  idea,
  questions,
  answers,
  userPlan,
  onGenerate,
  onBack,
}: {
  idea: string;
  questions: MCQQuestion[];
  answers: Record<string, string>;
  userPlan: Plan;
  onGenerate: (premium: boolean) => void;
  onBack: () => void;
}) {
  const [premium, setPremium] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const isHobby = userPlan === "hobby";

  const handlePickPremium = () => {
    if (isHobby) { setShowUpgrade(true); return; }
    setPremium(true);
  };

  // Show up to 8 answers as a compact grid
  const answeredQuestions = questions
    .map((q) => ({ q, opt: q.options.find((o) => o.id === answers[q.id]) }))
    .filter((x) => x.opt)
    .slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25 flex-shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <p className="text-xs text-violet-400 font-bold tracking-widest uppercase" style={{ fontFamily: "var(--font-inter)" }}>
            Your app plan is ready
          </p>
          <h2 className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>
            {idea.length > 55 ? idea.slice(0, 55) + "…" : idea}
          </h2>
        </div>
      </div>

      {/* Answers summary */}
      <div className="grid grid-cols-2 gap-2 mb-7">
        {answeredQuestions.map(({ q, opt }) => (
          <div
            key={q.id}
            className="rounded-xl px-3 py-2.5 flex items-center gap-2.5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-base flex-shrink-0">{opt!.icon}</span>
            <div className="min-w-0">
              <p className="text-[#64748b] text-[9px] font-bold tracking-wider uppercase truncate" style={{ fontFamily: "var(--font-inter)" }}>
                {q.category}
              </p>
              <p className="text-white text-xs font-medium truncate" style={{ fontFamily: "var(--font-inter)" }}>
                {opt!.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Model picker */}
      <p className="text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-inter)" }}>
        Choose how to build it
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Standard */}
        <button
          onClick={() => setPremium(false)}
          className="relative text-left rounded-2xl p-4 transition-all duration-200"
          style={{
            background: !premium ? "rgba(124,92,252,0.12)" : "rgba(255,255,255,0.03)",
            border: !premium ? "1px solid rgba(124,92,252,0.4)" : "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {!premium && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center"
            >
              <Check size={10} className="text-white" />
            </motion.div>
          )}
          <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center mb-3">
            <Zap size={16} className="text-violet-400" />
          </div>
          <p className="text-white font-bold text-sm mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>
            Standard
          </p>
          <p className="text-[#64748b] text-xs mb-3" style={{ fontFamily: "var(--font-inter)" }}>
            Great for most apps
          </p>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-violet-300" style={{ fontFamily: "var(--font-inter)" }}>Claude Sonnet 4.6</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full self-start"
              style={{ background: "rgba(124,92,252,0.15)", color: "#a78bfa", fontFamily: "var(--font-inter)" }}
            >
              3 credits
            </span>
          </div>
        </button>

        {/* Premium */}
        <button
          onClick={handlePickPremium}
          className="relative text-left rounded-2xl p-4 transition-all duration-200"
          style={{
            background: premium ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.03)",
            border: premium ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {premium && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "#f59e0b" }}
            >
              <Check size={10} className="text-white" />
            </motion.div>
          )}

          {/* Lock for hobby users */}
          {isHobby && !premium && (
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#1a1a2e] border border-white/10 flex items-center justify-center">
              <Lock size={9} className="text-[#64748b]" />
            </div>
          )}

          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
            style={{ background: "rgba(245,158,11,0.15)" }}
          >
            <Crown size={16} className="text-amber-400" />
          </div>
          <p className="text-white font-bold text-sm mb-0.5 flex items-center gap-1.5" style={{ fontFamily: "var(--font-inter)" }}>
            Premium
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
              ✦ New
            </span>
          </p>
          <p className="text-[#64748b] text-xs mb-3" style={{ fontFamily: "var(--font-inter)" }}>
            Complex apps, 5+ screens
          </p>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-amber-400" style={{ fontFamily: "var(--font-inter)" }}>Claude Opus 4.7</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full self-start"
              style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontFamily: "var(--font-inter)" }}
            >
              {isHobby ? "Builder required" : "5 credits"}
            </span>
          </div>
        </button>
      </div>

      {/* What Premium adds — only shown when selected */}
      <AnimatePresence>
        {premium && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5"
          >
            <div
              className="rounded-2xl px-4 py-3 flex flex-col gap-1.5"
              style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              <p className="text-amber-400 text-xs font-semibold mb-1" style={{ fontFamily: "var(--font-inter)" }}>
                ✦ What Opus 4.7 does better
              </p>
              {[
                "Handles 5+ screens without losing context",
                "More nuanced UI decisions (layouts, spacing, colours)",
                "Better business logic and data structures",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <Check size={11} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-[#94a3b8]" style={{ fontFamily: "var(--font-inter)" }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-3.5 rounded-xl text-sm text-[#64748b] hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", fontFamily: "var(--font-inter)" }}
        >
          <ArrowLeft size={14} />
          Edit answers
        </button>

        <button
          onClick={() => onGenerate(premium)}
          className="flex-1 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          style={{
            background: premium
              ? "linear-gradient(135deg, rgba(245,158,11,0.8), rgba(239,68,68,0.6))"
              : "linear-gradient(135deg, rgba(124,92,252,0.9), rgba(6,182,212,0.7))",
            color: "white",
            boxShadow: premium
              ? "0 8px 32px rgba(245,158,11,0.25)"
              : "0 8px 32px rgba(124,92,252,0.25)",
            fontFamily: "var(--font-inter)",
          }}
        >
          {premium ? <Crown size={15} /> : <Sparkles size={15} />}
          Generate my app — {premium ? "5" : "3"} credits
          <ArrowRight size={15} />
        </button>
      </div>

      {showUpgrade && (
        <UpgradeModal
          feature="Premium Generation"
          requiredPlan="builder"
          onClose={() => setShowUpgrade(false)}
          onSuccess={() => { setShowUpgrade(false); setPremium(true); }}
        />
      )}
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function NewProjectPage() {
  const [stage, setStage] = useState<Stage>("idea");
  const [idea, setIdea] = useState("");
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [projectName, setProjectName] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [userPlan, setUserPlan] = useState<Plan>("hobby");
  const router = useRouter();

  // Fetch user's plan on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("profiles").select("plan").eq("id", user.id).single()
        .then(({ data }) => { if (data?.plan) setUserPlan(data.plan); });
    });
  }, []);

  const handleIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim().length < 5) return;
    setError("");
    setStage("mcq-loading");
    try {
      const res = await fetch("/api/ai/mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions);
      setStage("wizard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate questions. Try again?");
      setStage("idea");
    }
  };

  // MCQ wizard done → go to summary screen, don't generate yet
  const handleAnswersComplete = (completedAnswers: Record<string, string>) => {
    setAnswers(completedAnswers);
    setStage("summary");
  };

  // User confirmed on summary → actually generate
  const handleGenerate = async (premium: boolean) => {
    setIsPremium(premium);
    setStage("generating");
    const name = idea.length > 40 ? idea.slice(0, 40) + "…" : idea;
    setProjectName(name);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim(), answers, questions, premium }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/project/${data.projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
      setStage("summary");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">

          {stage === "idea" && (
            <motion.div key="idea" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
                What do you want to build?
              </h1>
              <p className="text-[#64748b] mb-7" style={{ fontFamily: "var(--font-inter)" }}>
                Describe your idea. Kaafi asks the right questions and builds your app.
              </p>
              <form onSubmit={handleIdeaSubmit}>
                <div className="rounded-2xl p-1 mb-4" style={{
                  background: "rgba(14,14,28,0.8)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
                }}>
                  <textarea
                    autoFocus
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleIdeaSubmit(e as unknown as React.FormEvent); } }}
                    placeholder="e.g. An app where pet owners can find and book local dog walkers, track the walk live, and pay in-app…"
                    rows={4}
                    maxLength={400}
                    className="w-full bg-transparent px-5 pt-4 pb-2 text-white text-base resize-none outline-none placeholder-[#3a3a5a] leading-relaxed"
                    style={{ fontFamily: "var(--font-inter)" }}
                  />
                  <div className="flex justify-between px-5 pb-3">
                    <span className="text-[#3a3a5a] text-xs" style={{ fontFamily: "var(--font-inter)" }}>{idea.length}/400</span>
                    <span className="text-[#3a3a5a] text-xs hidden sm:block" style={{ fontFamily: "var(--font-inter)" }}>Enter to continue ↵</span>
                  </div>
                </div>
                {error && <p className="text-red-400 text-sm mb-3" style={{ fontFamily: "var(--font-inter)" }}>{error}</p>}
                <div className="mb-5">
                  <p className="text-[#4a5568] text-xs mb-2" style={{ fontFamily: "var(--font-inter)" }}>Or try an example:</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_CHIPS.map((c) => (
                      <button key={c} type="button" onClick={() => setIdea(`I want an app for ${c}`)}
                        className="text-xs px-3 py-1.5 rounded-full text-[#94a3b8] hover:text-white transition-all"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "var(--font-inter)" }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={idea.trim().length < 5}
                  className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2 disabled:opacity-35">
                  <Sparkles size={16} />
                  Generate my questions
                  <ArrowRight size={16} />
                </button>
              </form>
            </motion.div>
          )}

          {stage === "mcq-loading" && (
            <motion.div key="mcq-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="rounded-3xl p-8" style={{ background: "rgba(14,14,28,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <LoadingScreen idea={idea} />
              </div>
            </motion.div>
          )}

          {stage === "wizard" && questions.length > 0 && (
            <motion.div key="wizard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl"
                style={{ background: "rgba(124,92,252,0.07)", border: "1px solid rgba(124,92,252,0.15)" }}>
                <span className="text-base">💡</span>
                <p className="text-[#94a3b8] text-xs line-clamp-1" style={{ fontFamily: "var(--font-inter)" }}>
                  <span className="text-violet-400 font-semibold">Idea: </span>{idea}
                </p>
              </div>
              {error && <p className="text-red-400 text-sm mb-3" style={{ fontFamily: "var(--font-inter)" }}>{error}</p>}
              <div className="rounded-3xl p-7" style={{
                background: "rgba(14,14,28,0.7)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(20px)",
              }}>
                <MCQWizard
                  appIdea={idea}
                  questions={questions}
                  onComplete={handleAnswersComplete}
                />
              </div>
            </motion.div>
          )}

          {stage === "summary" && (
            <motion.div key="summary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {error && <p className="text-red-400 text-sm mb-3" style={{ fontFamily: "var(--font-inter)" }}>{error}</p>}
              <div className="rounded-3xl p-7" style={{
                background: "rgba(14,14,28,0.7)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(20px)",
              }}>
                <SummaryAndGenerate
                  idea={idea}
                  questions={questions}
                  answers={answers}
                  userPlan={userPlan}
                  onGenerate={handleGenerate}
                  onBack={() => setStage("wizard")}
                />
              </div>
            </motion.div>
          )}

          {stage === "generating" && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GeneratingScreen name={projectName} premium={isPremium} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
