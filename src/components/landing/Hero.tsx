"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const ROTATING_EXAMPLES = [
  "local dog walkers",
  "tiffin delivery tracker",
  "expense tracker",
  "kirana store manager",
  "appointment booking",
  "local services marketplace",
];

const PHONE_STEPS = [
  { bg: "from-violet-600/20 to-cyan-600/20", label: "What vibe?", emoji: "🎨" },
  { bg: "from-cyan-600/20 to-emerald-600/20", label: "Auth method?", emoji: "🔑" },
  { bg: "from-emerald-600/20 to-violet-600/20", label: "Core feature?", emoji: "⭐" },
];

function PhoneMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % PHONE_STEPS.length), 2800);
    return () => clearInterval(t);
  }, []);

  const current = PHONE_STEPS[step];

  return (
    <motion.div
      className="float relative mx-auto"
      style={{ width: 260, height: 520 }}
    >
      {/* Glow behind phone */}
      <div className="absolute inset-0 rounded-[44px] bg-gradient-to-br from-violet-600/30 to-cyan-600/20 blur-3xl scale-110" />

      {/* Phone frame */}
      <div
        className="relative w-full h-full rounded-[44px] overflow-hidden border border-white/10 shadow-2xl"
        style={{ background: "#0e0e1c" }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-7 bg-[#07070f] rounded-b-2xl z-10 flex items-center justify-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#1a1a2e]" />
          <div className="w-6 h-1.5 rounded-full bg-[#1a1a2e]" />
        </div>

        {/* Screen content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className={`absolute inset-0 bg-gradient-to-b ${current.bg} flex flex-col`}
          >
            {/* Status bar */}
            <div className="h-10 px-5 flex items-center justify-between mt-2">
              <span className="text-[10px] text-white/50">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-1.5 rounded-sm border border-white/30 relative">
                  <div className="absolute left-0.5 top-0.5 bottom-0.5 w-1.5 bg-white/60 rounded-sm" />
                </div>
                <div className="text-[9px] text-white/40">●●●●</div>
              </div>
            </div>

            {/* App content */}
            <div className="flex-1 px-5 pt-4 pb-6 flex flex-col">
              {/* Logo */}
              <div className="flex items-center gap-1.5 mb-6">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-cyan-500" />
                <span className="text-white/90 text-xs font-semibold" style={{ fontFamily: "var(--font-playfair)" }}>Kaafi</span>
              </div>

              {/* Progress */}
              <div className="flex gap-1 mb-5">
                {PHONE_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      i <= step ? "bg-violet-400" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Question emoji */}
              <div className="text-3xl mb-3">{current.emoji}</div>

              {/* Question */}
              <h3 className="text-white font-semibold text-sm leading-snug mb-4" style={{ fontFamily: "var(--font-inter)" }}>
                {current.label}
              </h3>

              {/* Options */}
              <div className="flex flex-col gap-2">
                {["Option A", "Option B", "Option C"].map((opt, i) => (
                  <motion.div
                    key={opt}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`px-3 py-2.5 rounded-xl border text-xs text-white/80 cursor-pointer transition-all ${
                      i === 0
                        ? "border-violet-500/60 bg-violet-500/15"
                        : "border-white/8 bg-white/4"
                    }`}
                  >
                    {opt}
                  </motion.div>
                ))}
              </div>

              {/* Next button */}
              <div className="mt-auto pt-4">
                <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 flex items-center justify-center gap-1.5">
                  <span className="text-white text-xs font-semibold">Next</span>
                  <ArrowRight size={11} className="text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Side buttons */}
      <div className="absolute right-[-4px] top-28 w-1 h-12 bg-[#1a1a2e] rounded-r-sm" />
      <div className="absolute left-[-4px] top-20 w-1 h-8 bg-[#1a1a2e] rounded-l-sm" />
      <div className="absolute left-[-4px] top-32 w-1 h-8 bg-[#1a1a2e] rounded-l-sm" />
    </motion.div>
  );
}

export default function Hero() {
  const [rotIdx, setRotIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const t = setInterval(() => setRotIdx((i) => (i + 1) % ROTATING_EXAMPLES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    setFormError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSubmitted(true);
    } catch {
      setFormError("Hmm, something went wrong. Try again?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center bg-grid overflow-hidden pt-16">
      {/* Gradient orbs */}
      <div className="orb w-[600px] h-[600px] bg-violet-700/20 -top-40 -left-40" />
      <div className="orb w-[400px] h-[400px] bg-cyan-600/15 top-1/2 right-0" />
      <div className="orb w-[300px] h-[300px] bg-violet-500/10 bottom-0 left-1/3" />

      {/* Radial gradient center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(124,92,252,0.15),transparent)]" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center w-full">
        {/* Left — copy */}
        <div>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-purple text-sm mb-8"
          >
            <Sparkles size={13} className="text-violet-400" />
            <span className="text-violet-300 font-medium">Now in early access</span>
          </motion.div>

          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1
              className="text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white mb-2"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Build your app.
            </h1>
            <h2
              className="text-4xl lg:text-6xl font-normal leading-[1.15] mb-6"
              style={{
                fontFamily: "var(--font-dancing)",
                background: "linear-gradient(135deg, #a78bfa, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Just answer a few questions.
            </h2>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#94a3b8] text-lg leading-relaxed mb-10 max-w-md"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Kaafi guides you through a short quiz and builds a{" "}
            <span className="text-white font-medium">real native mobile app</span> — no blank
            chat box, no coding, no confusion.
          </motion.p>

          {/* Rotating prompt preview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <div className="glass rounded-2xl p-4 flex items-center gap-3 max-w-md">
              <div className="text-[#94a3b8] text-sm flex-shrink-0" style={{ fontFamily: "var(--font-inter)" }}>
                I want an app for
              </div>
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={rotIdx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    className="block text-white font-medium text-sm"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {ROTATING_EXAMPLES[rotIdx]}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="cursor-blink text-violet-400 font-light text-lg leading-none">|</div>
            </div>
          </motion.div>

          {/* Email capture */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            id="waitlist"
          >
            {submitted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-purple rounded-2xl px-6 py-4 max-w-md flex items-center gap-3"
              >
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-white font-semibold text-sm">You&apos;re on the list!</p>
                  <p className="text-[#94a3b8] text-xs mt-0.5">We&apos;ll let you know when Kaafi launches.</p>
                </div>
              </motion.div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="flex gap-3 max-w-md">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="kaafi-input flex-1 px-4 py-3 text-sm"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary px-5 py-3 text-sm flex-shrink-0 flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Joining…
                      </>
                    ) : (
                      <>
                        Get early access
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
                {formError && (
                  <p className="text-red-400 text-xs mt-2 ml-1" style={{ fontFamily: "var(--font-inter)" }}>
                    {formError}
                  </p>
                )}
              </>
            )}
            <p className="text-[#4a5568] text-xs mt-3 ml-1" style={{ fontFamily: "var(--font-inter)" }}>
              No spam. No credit card. Cancel anytime.
            </p>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {["🧑‍💻", "👩‍🎨", "👨‍🚀", "👩‍💼"].map((emoji, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center text-sm"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <p className="text-[#64748b] text-xs" style={{ fontFamily: "var(--font-inter)" }}>
              <span className="text-white font-semibold">500+</span> builders on the waitlist
            </p>
          </motion.div>
        </div>

        {/* Right — phone mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="relative flex justify-center items-center"
        >
          {/* Background ring */}
          <div className="absolute w-80 h-80 rounded-full border border-violet-500/10 animate-spin" style={{ animationDuration: "30s" }} />
          <div className="absolute w-96 h-96 rounded-full border border-cyan-500/5 animate-spin" style={{ animationDuration: "45s", animationDirection: "reverse" }} />

          <PhoneMockup />

          {/* Floating badges */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute left-0 top-1/4 glass rounded-xl px-3 py-2 shadow-xl"
          >
            <p className="text-xs text-[#94a3b8] mb-0.5">Time to first app</p>
            <p className="text-white font-bold text-sm">~2 minutes</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            className="absolute right-0 bottom-1/4 glass rounded-xl px-3 py-2 shadow-xl"
          >
            <p className="text-xs text-[#94a3b8] mb-0.5">Output</p>
            <p className="text-white font-bold text-sm">Real React Native ✦</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#07070f] to-transparent" />

      {/* Demo CTA strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-0 right-0 flex justify-center"
      >
        <Link href="/demo">
          <button className="btn-outline flex items-center gap-2 px-6 py-2.5 text-sm hover:scale-105 transition-transform">
            <span>Try the guided wizard</span>
            <ArrowRight size={14} className="text-violet-400" />
          </button>
        </Link>
      </motion.div>
    </section>
  );
}
