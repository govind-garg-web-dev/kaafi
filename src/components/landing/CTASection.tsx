"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

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
    <section className="relative py-28 overflow-hidden" ref={ref}>
      {/* Large orbs */}
      <div className="orb w-[700px] h-[700px] bg-violet-700/15 -top-60 left-1/2 -translate-x-1/2" />
      <div className="orb w-[400px] h-[400px] bg-cyan-600/10 bottom-0 left-1/4" />

      <div className="max-w-4xl mx-auto px-6 text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Pre-headline */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-purple text-sm mb-8">
            <span className="text-2xl">🚀</span>
            <span className="text-violet-300 font-medium">Early access is open</span>
          </div>

          {/* Headline */}
          <h2
            className="text-5xl lg:text-7xl font-bold text-white mb-4 leading-[1.05]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Your app deserves
          </h2>
          <h3
            className="text-4xl lg:text-6xl font-normal mb-8"
            style={{
              fontFamily: "var(--font-dancing)",
              background: "linear-gradient(135deg, #a78bfa 0%, #22d3ee 60%, #34d399 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            more than a blank chat box.
          </h3>

          <p
            className="text-[#64748b] text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Join builders who are building their first mobile app with Kaafi.
            No coding. No Xcode. No confusion.
          </p>

          {/* Form */}
          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 glass-purple rounded-2xl px-8 py-5"
            >
              <span className="text-3xl">🎉</span>
              <div className="text-left">
                <p className="text-white font-semibold">You&apos;re on the list!</p>
                <p className="text-[#94a3b8] text-sm mt-0.5">
                  We&apos;ll email you when Kaafi launches.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="max-w-md mx-auto mb-6">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="kaafi-input flex-1 px-5 py-4 text-base"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-6 py-4 text-base flex items-center gap-2 justify-center whitespace-nowrap disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Joining…
                    </>
                  ) : (
                    <>
                      Join the waitlist
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
              {formError && (
                <p className="text-red-400 text-sm mt-2" style={{ fontFamily: "var(--font-inter)" }}>
                  {formError}
                </p>
              )}
            </div>
          )}

          {/* Or try demo */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-24 bg-white/10" />
            <span className="text-[#4a5568] text-sm" style={{ fontFamily: "var(--font-inter)" }}>or</span>
            <div className="h-px w-24 bg-white/10" />
          </div>
          <Link href="/demo">
            <button className="mt-4 btn-outline px-6 py-3 flex items-center gap-2 mx-auto text-sm">
              Try the interactive demo — no signup needed
              <ArrowRight size={14} className="text-violet-400" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
