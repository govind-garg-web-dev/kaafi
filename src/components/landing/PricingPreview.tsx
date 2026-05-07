"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Hobby",
    price: "Free",
    period: "",
    inr: "₹0",
    description: "Explore Kaafi risk-free",
    features: [
      "5 credits/day (30/month)",
      "1 active project",
      "Web preview",
      "Kaafi watermark",
    ],
    cta: "Start free",
    ctaStyle: "outline",
    highlight: false,
  },
  {
    name: "Builder",
    price: "$19",
    period: "/mo",
    inr: "₹499/mo",
    description: "For solo founders shipping real apps",
    features: [
      "120 credits/month",
      "5 active projects",
      "Full source code export",
      "Private projects",
      "Credit rollover",
    ],
    cta: "Start building",
    ctaStyle: "primary",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Studio",
    price: "$49",
    period: "/mo",
    inr: "₹1,499/mo",
    description: "Ship to the App Store without Xcode",
    features: [
      "350 credits/month",
      "1-click APK / TestFlight build",
      "Team workspace (3 seats)",
      "Priority generation queue",
      "No watermark",
    ],
    cta: "Go Studio",
    ctaStyle: "outline",
    highlight: false,
  },
];

export default function PricingPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" className="relative py-28 overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_80%,rgba(124,92,252,0.08),transparent)]" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-purple text-sm mb-5">
            <span className="text-violet-400 font-medium">Pricing</span>
          </div>
          <h2
            className="text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Simple, transparent{" "}
            <span
              style={{
                fontFamily: "var(--font-dancing)",
                background: "linear-gradient(135deg, #a78bfa, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              pricing.
            </span>
          </h2>
          <p
            className="text-[#64748b] text-lg max-w-lg mx-auto"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            See the cost before you click send. No surprise bills.{" "}
            <span className="text-white">India pricing available in INR.</span>
          </p>
        </motion.div>

        {/* Credit legend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {[
            { label: "1 generation", credits: "3 credits" },
            { label: "Light edit", credits: "1 credit" },
            { label: "Heavy edit", credits: "2 credits" },
            { label: "Visual edits", credits: "Free ∞" },
            { label: "Auto-retry", credits: "Free" },
          ].map((item) => (
            <div
              key={item.label}
              className="glass rounded-xl px-4 py-2 flex items-center gap-2"
            >
              <span className="text-[#64748b] text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                {item.label}
              </span>
              <span
                className="text-white text-xs font-semibold"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                = {item.credits}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative"
            >
              {plan.highlight && (
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-violet-500/50 to-violet-500/10 pointer-events-none" />
              )}

              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-500/30">
                  {plan.badge}
                </div>
              )}

              <div
                className={`glass rounded-2xl p-6 h-full flex flex-col relative ${
                  plan.highlight ? "border-violet-500/30" : ""
                }`}
                style={
                  plan.highlight
                    ? {
                        background: "rgba(124,92,252,0.08)",
                        boxShadow:
                          "0 0 0 1px rgba(124,92,252,0.25), 0 20px 60px rgba(124,92,252,0.15)",
                      }
                    : {}
                }
              >
                {/* Plan name */}
                <div className="mb-4">
                  <h3
                    className="text-lg font-bold text-white mb-1"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className="text-[#64748b] text-xs"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-4xl font-bold text-white"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-[#64748b] text-sm" style={{ fontFamily: "var(--font-inter)" }}>
                        {plan.period} annual
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-violet-400 mt-1" style={{ fontFamily: "var(--font-inter)" }}>
                    {plan.inr}
                  </p>
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={9} className="text-violet-400" />
                      </div>
                      <span
                        className="text-sm text-[#94a3b8]"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={
                    plan.ctaStyle === "primary"
                      ? "btn-primary w-full py-3 text-sm"
                      : "btn-outline w-full py-3 text-sm"
                  }
                >
                  {plan.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top-up note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center text-[#4a5568] text-sm mt-8"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Need more credits? Top up anytime: $10 = 50 credits ($0.20/credit — cheaper than competitors)
        </motion.p>
      </div>
    </section>
  );
}
