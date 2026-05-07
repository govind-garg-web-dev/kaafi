import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Prices in paise (1 INR = 100 paise)
const PLAN_PRICES: Record<string, { amount: number; name: string }> = {
  builder: { amount: 49900,  name: "Kaafi Builder — ₹499/mo" },
  studio:  { amount: 149900, name: "Kaafi Studio — ₹1,499/mo" },
  topup:   { amount: 19900,  name: "Kaafi Credits — 50 credits (₹199)" },
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { plan } = await req.json();
    const planConfig = PLAN_PRICES[plan];
    if (!planConfig) return NextResponse.json({ error: "Invalid plan." }, { status: 400 });

    const order = await razorpay.orders.create({
      amount: planConfig.amount,
      currency: "INR",
      receipt: `kaafi_${user.id}_${Date.now()}`,
      notes: { user_id: user.id, plan, description: planConfig.name },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: planConfig.amount,
      currency: "INR",
      name: planConfig.name,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[/api/billing/create-order]", err);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}
