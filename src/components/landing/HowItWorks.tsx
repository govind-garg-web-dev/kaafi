"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Lightbulb, MessageSquare, Smartphone } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Lightbulb,
    title: "Describe your idea",
    subtitle: "5 seconds",
    description:
      "Type a single sentence. 'I want an app for local dog walkers.' That's all Kaafi needs to get started.",
    color: "from-violet-600 to-violet-400",
    glow: "rgba(124, 92, 252, 0.3)",
    accent: "#7c5cfc",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Answer our questions",
    subtitle: "2 minutes",
    description:
      "We ask. You pick. Vibe, features, login method — simple multiple-choice. No blank-page paralysis. No wasted credits.",
    color: "from-cyan-600 to-cyan-400",
    glow: "rgba(34, 211, 238, 0.25)",
    accent: "#22d3ee",
  },
  {
    number: "03",
    icon: Smartphone,
    title: "Get your native app",
    subtitle: "~2 minutes",
    description:
      "Kaafi builds a real React Native + Expo app with your choices baked in. Preview it instantly. Export the code. Publish to the App Store.",
    color: "from-emerald-600 to-emerald-400",
    glow: "rgba(52, 211, 153, 0.25)",
    accent: "#34d399",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="relative py-28 overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(124,92,252,0.06),transparent)]" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-purple text-sm mb-5">
            <span className="text-violet-400 font-medium">How it works</span>
          </div>
          <h2
            className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            From idea to app{" "}
            <span
              style={{
                fontFamily: "var(--font-dancing)",
                background: "linear-gradient(135deg, #a78bfa, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              in three steps
            </span>
          </h2>
          <p
            className="text-[#64748b] text-lg max-w-xl mx-auto"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Most AI app builders give you a blank chat. Kaafi gives you a guided plan.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-14 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-violet-600/50 via-cyan-600/50 to-emerald-600/50" />

          <div className="grid lg:grid-cols-3 gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 32 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="relative"
                >
                  {/* Card */}
                  <div
                    className="glass rounded-2xl p-8 h-full relative overflow-hidden group hover:border-white/15 transition-all duration-300"
                    style={{
                      boxShadow: `0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)`,
                    }}
                  >
                    {/* Glow on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                      style={{
                        background: `radial-gradient(circle at 50% 0%, ${step.glow}, transparent 70%)`,
                      }}
                    />

                    {/* Step number */}
                    <div
                      className="text-xs font-bold tracking-widest mb-5 opacity-40"
                      style={{ color: step.accent, fontFamily: "var(--font-inter)" }}
                    >
                      STEP {step.number}
                    </div>

                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-lg`}
                      style={{ boxShadow: `0 8px 24px ${step.glow}` }}
                    >
                      <Icon size={22} className="text-white" />
                    </div>

                    {/* Text */}
                    <div className="flex items-baseline gap-3 mb-3">
                      <h3
                        className="text-xl font-bold text-white"
                        style={{ fontFamily: "var(--font-playfair)" }}
                      >
                        {step.title}
                      </h3>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: `${step.accent}20`,
                          color: step.accent,
                          fontFamily: "var(--font-inter)",
                        }}
                      >
                        {step.subtitle}
                      </span>
                    </div>
                    <p
                      className="text-[#64748b] text-sm leading-relaxed"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
