"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Check, ChevronRight } from "lucide-react";
import type { FileDiff } from "@/lib/diff/patch";

type Props = {
  diffs: FileDiff[];
  reply: string;
  creditCost: number;
  onApply: () => Promise<void>;
  onDiscard: () => void;
};

export default function DiffViewer({ diffs, reply, creditCost, onApply, onDiscard }: Props) {
  const [activeFile, setActiveFile] = useState(0);
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    try {
      await onApply();
    } finally {
      setApplying(false);
    }
  };

  const current = diffs[activeFile];

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onDiscard}
      />

      {/* Modal */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
      >
        <div
          className="w-full max-w-2xl rounded-2xl flex flex-col pointer-events-auto"
          style={{
            background: "#0d0d1a",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 40px 120px rgba(0,0,0,0.7)",
            maxHeight: "80vh",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/6 flex-shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-white font-semibold text-sm mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
                Review changes
              </p>
              <p className="text-[#64748b] text-xs leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
                {reply}
              </p>
            </div>
            <button
              onClick={onDiscard}
              className="text-[#4a5568] hover:text-white transition-colors p-1 flex-shrink-0 mt-0.5"
            >
              <X size={15} />
            </button>
          </div>

          {/* File tabs */}
          {diffs.length > 1 && (
            <div
              className="flex overflow-x-auto border-b border-white/6 flex-shrink-0"
              style={{ scrollbarWidth: "none" }}
            >
              {diffs.map((d, i) => (
                <button
                  key={d.path}
                  onClick={() => setActiveFile(i)}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs whitespace-nowrap flex-shrink-0 border-r border-white/5 transition-colors"
                  style={{
                    fontFamily: "var(--font-inter)",
                    background: activeFile === i ? "rgba(124,92,252,0.1)" : "transparent",
                    color: activeFile === i ? "#a78bfa" : "#64748b",
                  }}
                >
                  {d.path.split("/").pop()}
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#64748b" }}
                  >
                    +{d.addedCount} -{d.removedCount}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Diff content */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#2a2a4a transparent" }}>
            {diffs.length === 1 && (
              <div className="px-4 pt-3 pb-1 flex items-center gap-2 border-b border-white/5">
                <ChevronRight size={11} className="text-[#4a5568]" />
                <span className="text-xs text-[#64748b]" style={{ fontFamily: "var(--font-inter)" }}>
                  {current.path}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#64748b", fontFamily: "var(--font-inter)" }}>
                  +{current.addedCount} -{current.removedCount}
                </span>
              </div>
            )}

            <div className="font-mono text-xs leading-5 overflow-x-auto">
              {current.lines.map((line, i) => (
                <div
                  key={i}
                  className="flex items-start px-4 py-px"
                  style={{
                    background:
                      line.type === "added"
                        ? "rgba(52, 211, 153, 0.08)"
                        : line.type === "removed"
                        ? "rgba(248, 113, 113, 0.08)"
                        : "transparent",
                  }}
                >
                  <span
                    className="w-4 flex-shrink-0 select-none mr-3"
                    style={{
                      color:
                        line.type === "added"
                          ? "#34d399"
                          : line.type === "removed"
                          ? "#f87171"
                          : "#2a2a4a",
                    }}
                  >
                    {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
                  </span>
                  <span
                    style={{
                      color:
                        line.type === "added"
                          ? "#6ee7b7"
                          : line.type === "removed"
                          ? "#fca5a5"
                          : "#475569",
                      whiteSpace: "pre",
                    }}
                  >
                    {line.value || " "}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-5 py-4 border-t border-white/6 flex-shrink-0"
            style={{ background: "rgba(0,0,0,0.2)" }}
          >
            <button
              onClick={onDiscard}
              disabled={applying}
              className="text-sm text-[#64748b] hover:text-white transition-colors disabled:opacity-40"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Discard — free
            </button>

            <button
              onClick={handleApply}
              disabled={applying}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
              style={{
                background: "rgba(124,92,252,0.2)",
                border: "1px solid rgba(124,92,252,0.4)",
                color: "#c4b5fd",
                fontFamily: "var(--font-inter)",
              }}
            >
              {applying ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Check size={13} />
              )}
              {applying ? "Applying…" : `Apply — ${creditCost} credit${creditCost > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
