"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lightbulb, MessageSquare, Smartphone } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "kaafi_welcomed";

const STEPS = [
  {
    icon: Lightbulb,
    color: "#7c5cfc",
    bg: "rgba(124,92,252,0.12)",
    title: "Describe your idea",
    desc: "One sentence. That's all we need to get started.",
  },
  {
    icon: MessageSquare,
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.10)",
    title: "Answer our questions",
    desc: "We ask. You pick. No blank page, no confusion.",
  },
  {
    icon: Smartphone,
    color: "#34d399",
    bg: "rgba(52,211,153,0.10)",
    title: "Get your native app",
    desc: "Real React Native code, ready to export.",
  },
];

export default function WelcomeModal({ isFirstTime }: { isFirstTime: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isFirstTime) return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setOpen(true);
  }, [isFirstTime]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 12 }}
              transition={{ type: "spring", damping: 22, stiffness: 260 }}
              className="w-full max-w-md rounded-3xl p-8"
              style={{
                background: "#0e0e1c",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 40px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Header */}
              <div className="mb-7">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#22d3ee] flex items-center justify-center">
                    <span className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-playfair)" }}>K</span>
                  </div>
                  <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-playfair)" }}>Kaafi</span>
                </div>
                <h2
                  className="text-2xl font-bold text-white mb-2 leading-tight"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Welcome! Let&apos;s build your first app.
                </h2>
                <p className="text-[#64748b] text-sm" style={{ fontFamily: "var(--font-inter)" }}>
                  Here&apos;s how it works — three steps, about 3 minutes.
                </p>
              </div>

              {/* Steps */}
              <div className="flex flex-col gap-3 mb-7">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className="flex items-start gap-3 p-3.5 rounded-2xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: step.bg }}
                      >
                        <Icon size={16} style={{ color: step.color }} />
                      </div>
                      <div>
                        <p
                          className="text-white text-sm font-semibold mb-0.5"
                          style={{ fontFamily: "var(--font-inter)" }}
                        >
                          {step.title}
                        </p>
                        <p
                          className="text-[#64748b] text-xs leading-relaxed"
                          style={{ fontFamily: "var(--font-inter)" }}
                        >
                          {step.desc}
                        </p>
                      </div>
                      <span
                        className="ml-auto text-xs font-bold flex-shrink-0 mt-1"
                        style={{ color: step.color, fontFamily: "var(--font-inter)" }}
                      >
                        0{i + 1}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* CTAs */}
              <div className="flex gap-3">
                <Link href="/new" className="flex-1" onClick={dismiss}>
                  <button className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
                    Build my first app
                    <ArrowRight size={14} />
                  </button>
                </Link>
                <button
                  onClick={dismiss}
                  className="btn-outline px-4 py-3 text-sm flex-shrink-0"
                >
                  Skip
                </button>
              </div>

              <p
                className="text-center text-[#3a3a5a] text-xs mt-4"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                You have 30 free credits to start — no card needed.
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
