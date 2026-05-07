"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Brain,
  Smartphone,
  Paintbrush,
  Eye,
  RefreshCw,
  DollarSign,
  Download,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "Guided MCQ Wizard",
    description:
      "We ask, you pick. Our AI generates 5–7 contextual questions from your idea — vibe, features, auth, monetisation. No more blank-page paralysis.",
    tag: "Core",
    tagColor: "#7c5cfc",
    color: "from-violet-600 to-violet-500",
    glow: "rgba(124, 92, 252, 0.2)",
    size: "large",
  },
  {
    icon: Smartphone,
    title: "Real Native Output",
    description:
      "React Native + Expo SDK. Not a web app in a wrapper. A real APK you can upload to the Play Store.",
    tag: "Unique",
    tagColor: "#22d3ee",
    color: "from-cyan-600 to-cyan-500",
    glow: "rgba(34, 211, 238, 0.15)",
    size: "normal",
  },
  {
    icon: Eye,
    title: "Cost Preview Before You Send",
    description:
      "See exactly how many credits an edit will cost before you click send. Nobody else does this.",
    tag: "Transparent",
    tagColor: "#f59e0b",
    color: "from-amber-600 to-amber-500",
    glow: "rgba(245, 158, 11, 0.15)",
    size: "normal",
  },
  {
    icon: Paintbrush,
    title: "Visual Edits — Free Forever",
    description:
      "Change colours, text, icons directly on the preview. No AI call, no credit charge. Unlimited.",
    tag: "0 credits",
    tagColor: "#34d399",
    color: "from-emerald-600 to-emerald-500",
    glow: "rgba(52, 211, 153, 0.15)",
    size: "normal",
  },
  {
    icon: RefreshCw,
    title: "Auto-Retry on Failure",
    description:
      "If generation fails, we retry on our dime — twice. You don't pay for the AI's mistakes.",
    tag: "0 credits",
    tagColor: "#34d399",
    color: "from-emerald-600 to-teal-500",
    glow: "rgba(20, 184, 166, 0.15)",
    size: "normal",
  },
  {
    icon: DollarSign,
    title: "India-First Pricing",
    description:
      "₹499/month. UPI and Razorpay accepted. Hindi UI. Regional app templates for local use cases.",
    tag: "India 🇮🇳",
    tagColor: "#f97316",
    color: "from-orange-600 to-orange-500",
    glow: "rgba(249, 115, 22, 0.15)",
    size: "normal",
  },
  {
    icon: Download,
    title: "One-Click APK Build",
    description:
      "Studio tier users get a cloud build pipeline. Click once, get an APK or TestFlight link in your inbox.",
    tag: "Studio",
    tagColor: "#a78bfa",
    color: "from-violet-700 to-indigo-600",
    glow: "rgba(139, 92, 246, 0.15)",
    size: "normal",
  },
  {
    icon: Zap,
    title: "Instant Rollback",
    description:
      "Every successful generation is auto-checkpointed. One click to undo any change, free of charge.",
    tag: "0 credits",
    tagColor: "#34d399",
    color: "from-emerald-600 to-cyan-600",
    glow: "rgba(34, 211, 238, 0.12)",
    size: "normal",
  },
];

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="relative py-28 bg-grid-fine overflow-hidden" ref={ref}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_80%_40%,rgba(34,211,238,0.05),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_50%_at_20%_60%,rgba(124,92,252,0.06),transparent)]" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-purple text-sm mb-5">
            <span className="text-violet-400 font-medium">Features</span>
          </div>
          <h2
            className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Everything other builders miss{" "}
            <span
              style={{
                fontFamily: "var(--font-dancing)",
                fontSize: "1.1em",
                background: "linear-gradient(135deg, #f59e0b, #f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              for mobile.
            </span>
          </h2>
          <p
            className="text-[#64748b] text-lg max-w-xl mx-auto"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Built for non-coders who want real apps, not browser wrappers.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Large card — first feature */}
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            const isLarge = feat.size === "large";
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className={isLarge ? "lg:col-span-2 lg:row-span-1" : ""}
              >
                <div
                  className="glass rounded-2xl p-6 h-full relative overflow-hidden group cursor-default hover:border-white/12 transition-all duration-300"
                  style={{
                    boxShadow: `0 0 0 1px rgba(255,255,255,0.06)`,
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${feat.glow}, transparent 65%)`,
                    }}
                  />

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4 shadow-lg relative`}
                    style={{ boxShadow: `0 6px 20px ${feat.glow}` }}
                  >
                    <Icon size={18} className="text-white" />
                  </div>

                  {/* Tag */}
                  <span
                    className="inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full mb-3"
                    style={{
                      background: `${feat.tagColor}18`,
                      color: feat.tagColor,
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    {feat.tag.toUpperCase()}
                  </span>

                  {/* Title */}
                  <h3
                    className={`font-bold text-white mb-2 ${isLarge ? "text-xl" : "text-base"}`}
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {feat.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-[#64748b] text-sm leading-relaxed"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
