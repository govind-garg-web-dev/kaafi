import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

const PLAN_CREDITS: Record<string, { credits: number; plan: string | null }> = {
  builder: { credits: 120, plan: "builder" },
  studio:  { credits: 350, plan: "studio" },
  topup:   { credits: 50,  plan: null }, // top-up doesn't change plan
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await req.json();

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    const config = PLAN_CREDITS[plan];
    if (!config) return NextResponse.json({ error: "Invalid plan." }, { status: 400 });

    // Get current balance for top-up
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", user.id)
      .single();

    const currentCredits = profile?.credits_balance ?? 0;
    const newCredits = config.plan ? config.credits : currentCredits + config.credits;

    const updateData: Record<string, unknown> = { credits_balance: newCredits };
    if (config.plan) updateData.plan = config.plan;

    await supabase.from("profiles").update(updateData).eq("id", user.id);

    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      delta: config.credits,
      reason: config.plan
        ? `Upgraded to ${config.plan} — ${config.credits} credits`
        : `Top-up — ${config.credits} credits added`,
    });

    return NextResponse.json({ ok: true, plan: config.plan });
  } catch (err) {
    console.error("[/api/billing/verify]", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
