"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
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
      "5 active projects",
      "Full source code export",
      "Private projects",
      "Credit rollover",
    ],
    highlight: true,
    badge: "Most popular",
    color: "#7c5cfc",
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
    highlight: false,
    badge: null,
    color: "#f59e0b",
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

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay failed to load.");

      // Create order
      const orderRes = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error);

      // Open Razorpay checkout
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
            toast.success("Plan upgraded!", "Your credits have been added. Welcome to " + planId + ".");
            router.push("/dashboard");
            router.refresh();
          }
        },
      });

      rzp.open();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[billing]", msg);
      toast.error("Payment failed", msg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
          Upgrade your plan
        </h1>
        <p className="text-[#64748b]" style={{ fontFamily: "var(--font-inter)" }}>
          Pay securely in INR via UPI, cards, or NetBanking. Cancel anytime.
        </p>
      </div>

      {/* Payment methods */}
      <div className="flex items-center gap-3 mb-8 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <Zap size={15} className="text-violet-400 flex-shrink-0" />
        <p className="text-[#94a3b8] text-sm" style={{ fontFamily: "var(--font-inter)" }}>
          Accepts <span className="text-white font-medium">UPI</span>,{" "}
          <span className="text-white font-medium">Credit / Debit cards</span>,{" "}
          <span className="text-white font-medium">NetBanking</span>, and{" "}
          <span className="text-white font-medium">Wallets</span> — powered by Razorpay
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {PLANS.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="relative"
          >
            {plan.badge && (
              <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-500/30" style={{ fontFamily: "var(--font-inter)" }}>
                {plan.badge}
              </div>
            )}

            <div
              className="rounded-2xl p-6 h-full flex flex-col"
              style={plan.highlight ? {
                background: "rgba(124,92,252,0.08)",
                border: "1px solid rgba(124,92,252,0.25)",
                boxShadow: "0 20px 60px rgba(124,92,252,0.12)",
              } : {
                background: "rgba(14,14,28,0.6)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="mb-5">
                <h3 className="text-xl font-bold text-white mb-0.5" style={{ fontFamily: "var(--font-playfair)" }}>
                  {plan.name}
                </h3>
                <p className="text-[#64748b] text-xs" style={{ fontFamily: "var(--font-inter)" }}>{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
                    {plan.price}
                  </span>
                  <span className="text-[#64748b] text-sm" style={{ fontFamily: "var(--font-inter)" }}>{plan.period}</span>
                </div>
                <p className="text-xs text-violet-400" style={{ fontFamily: "var(--font-inter)" }}>{plan.annual}</p>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <Check size={9} className="text-violet-400" />
                    </div>
                    <span className="text-sm text-[#94a3b8]" style={{ fontFamily: "var(--font-inter)" }}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading !== null}
                className={plan.highlight ? "btn-primary w-full py-3.5 text-sm disabled:opacity-60 flex items-center justify-center gap-2" : "btn-outline w-full py-3.5 text-sm disabled:opacity-60 flex items-center justify-center gap-2"}
              >
                {loading === plan.id ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  `Upgrade to ${plan.name}`
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top-up */}
      <div className="mt-6 p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white text-sm font-semibold mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>
              Just need more credits?
            </p>
            <p className="text-[#64748b] text-xs" style={{ fontFamily: "var(--font-inter)" }}>
              ₹199 = 50 credits · No plan change · Instant via UPI
            </p>
          </div>
          <button
            onClick={() => handleUpgrade("topup")}
            className="btn-outline px-5 py-2.5 text-sm"
          >
            Buy 50 credits — ₹199
          </button>
        </div>
      </div>
    </div>
  );
}
