"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open, title, message, confirmLabel = "Delete", loading = false, onConfirm, onCancel,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ type: "spring", damping: 24, stiffness: 280 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{
                background: "#0e0e1c",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
              }}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center mb-4">
                <AlertTriangle size={18} className="text-red-400" />
              </div>

              {/* Text */}
              <h3
                className="text-white font-bold text-base mb-1"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {title}
              </h3>
              <p
                className="text-[#64748b] text-sm leading-relaxed mb-6"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={loading}
                  className="btn-outline flex-1 py-2.5 text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#f87171",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
