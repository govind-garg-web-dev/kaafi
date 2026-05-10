"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Zap, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

const PLANS = [
  {
    id: "builder",
    name: "Builder",
    price: "₹499",
    period: "/mo",
    annual: "₹399/mo on annual",
    description: "For solo founders shipping real apps",
    features: [
      "120 credits/month",
      "Full source code export (ZIP)",
      "5 active projects",
      "Private projects",
      "Credit rollover",
    ],
    color: "#7c5cfc",
    highlight: true,
    badge: "Most popular",
  },
  {
    id: "studio",
    name: "Studio",
    price: "₹1,499",
    period: "/mo",
    annual: "₹1,199/mo on annual",
    description: "Ship to the App Store without Xcode",
    features: [
      "350 credits/month",
      "1-click APK / TestFlight build",
      "Team workspace (3 seats)",
      "Priority generation queue",
      "No watermark",
    ],
    color: "#f59e0b",
    highlight: false,
    badge: null,
  },
];

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type Props = {
  feature: string;           // e.g. "Export ZIP", "Build APK"
  requiredPlan: "builder" | "studio";  // minimum plan needed
  onClose: () => void;
  onSuccess: () => void;     // called after successful upgrade
};

export default function UpgradeModal({ feature, requiredPlan, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const toast = useToast();

  // Show only plans that meet or exceed the required plan
  const visiblePlans = requiredPlan === "studio"
    ? PLANS.filter((p) => p.id === "studio")
    : PLANS;

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay failed to load.");

      const orderRes = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error);

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Kaafi",
        description: order.name,
        order_id: order.orderId,
        theme: { color: "#7c5cfc" },
        prefill: {},
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId,
            }),
          });
          const result = await verifyRes.json();
          if (result.ok) {
            toast.success("Plan upgraded!", `Welcome to ${planId}. You can now use ${feature}.`);
            onSuccess();
            onClose();
          }
        },
      });

      rzp.open();
    } catch (err) {
      toast.error("Payment failed", err instanceof Error ? err.message : "Try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
      >
        <div
          className="w-full max-w-lg rounded-2xl pointer-events-auto"
          style={{
            background: "#0d0d1a",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 40px 120px rgba(0,0,0,0.7)",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4">
            <div>
              <p className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-playfair)" }}>
                Unlock {feature}
              </p>
              <p className="text-[#64748b] text-sm mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
                {requiredPlan === "studio"
                  ? "This feature is available on the Studio plan."
                  : "This feature is available on Builder and above."}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#4a5568] hover:text-white transition-colors p-1 mt-0.5"
            >
              <X size={16} />
            </button>
          </div>

          {/* Payment note */}
          <div
            className="mx-6 mb-5 px-4 py-2.5 rounded-xl flex items-center gap-2"
            style={{ background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.15)" }}
          >
            <Zap size={13} className="text-violet-400 flex-shrink-0" />
            <p className="text-xs text-[#94a3b8]" style={{ fontFamily: "var(--font-inter)" }}>
              UPI · Cards · NetBanking · Wallets — powered by Razorpay
            </p>
          </div>

          {/* Plan cards */}
          <div className={`px-6 pb-6 grid gap-4 ${visiblePlans.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {visiblePlans.map((plan) => {
              const isRequired = plan.id === requiredPlan || (requiredPlan === "builder" && plan.id === "builder");
              return (
                <div
                  key={plan.id}
                  className="relative rounded-xl p-5 flex flex-col"
                  style={plan.highlight ? {
                    background: "rgba(124,92,252,0.09)",
                    border: "1px solid rgba(124,92,252,0.3)",
                  } : {
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {plan.badge && (
                    <span
                      className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white"
                      style={{ background: "linear-gradient(to right, #7c3aed, #6d28d9)" }}
                    >
                      {plan.badge}
                    </span>
                  )}

                  <p className="font-bold text-white text-base mb-0.5" style={{ fontFamily: "var(--font-playfair)" }}>
                    {plan.name}
                  </p>
                  <p className="text-[#64748b] text-xs mb-3" style={{ fontFamily: "var(--font-inter)" }}>
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
                      {plan.price}
                    </span>
                    <span className="text-xs text-[#64748b]">{plan.period}</span>
                  </div>
                  <p className="text-[10px] text-violet-400 mb-4" style={{ fontFamily: "var(--font-inter)" }}>
                    {plan.annual}
                  </p>

                  <ul className="flex flex-col gap-1.5 flex-1 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check size={11} className="text-violet-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-[#94a3b8]" style={{ fontFamily: "var(--font-inter)" }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading !== null}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{
                      background: plan.highlight ? "rgba(124,92,252,0.85)" : "rgba(245,158,11,0.15)",
                      border: `1px solid ${plan.highlight ? "rgba(124,92,252,0.6)" : "rgba(245,158,11,0.4)"}`,
                      color: plan.highlight ? "white" : "#f59e0b",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    {loading === plan.id
                      ? <Loader2 size={13} className="animate-spin" />
                      : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
