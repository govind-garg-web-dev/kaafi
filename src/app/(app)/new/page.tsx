"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import MCQWizard from "@/components/mcq/MCQWizard";
import LoadingScreen from "@/components/mcq/LoadingScreen";
import type { MCQQuestion } from "@/lib/mcq-data";

type Stage = "idea" | "mcq-loading" | "wizard" | "generating";

const EXAMPLE_CHIPS = [
  "local dog walkers marketplace",
  "tiffin delivery tracker",
  "expense tracker for couples",
  "appointment booking for salons",
  "kirana store inventory manager",
  "second-hand clothes marketplace",
];

function GeneratingScreen({ name }: { name: string }) {
  const STEPS = [
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
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-violet-500/30 mb-8"
      >
        <Sparkles size={26} className="text-white" />
      </motion.div>
      <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
        Building {name}
      </h2>
      <p className="text-[#64748b] text-sm mb-8" style={{ fontFamily: "var(--font-inter)" }}>
        This takes about 60–120 seconds. Don&apos;t close this tab.
      </p>
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-violet-300 text-sm font-medium"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {STEPS[step]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function NewProjectPage() {
  const [stage, setStage] = useState<Stage>("idea");
  const [idea, setIdea] = useState("");
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [error, setError] = useState("");
  const [projectName, setProjectName] = useState("");
  const router = useRouter();

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

  const handleAnswersComplete = async (answers: Record<string, string>) => {
    setStage("generating");
    const name = idea.length > 40 ? idea.slice(0, 40) + "…" : idea;
    setProjectName(name);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim(), answers, questions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/project/${data.projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
      setStage("wizard");
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

          {stage === "generating" && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GeneratingScreen name={projectName} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
