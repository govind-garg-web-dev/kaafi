import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DAILY_GRANT = 5;
const HOBBY_CAP = 30;

function isAuthorized(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Service role client — bypasses RLS, safe for server-only cron use
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find all Hobby users whose credits are below the daily cap
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, credits_balance")
      .eq("plan", "hobby")
      .lt("credits_balance", HOBBY_CAP);

    if (error) throw error;

    if (!users || users.length === 0) {
      return NextResponse.json({ ok: true, updated: 0 });
    }

    // Top each one up by DAILY_GRANT, capped at HOBBY_CAP
    let updated = 0;
    for (const user of users) {
      const newBalance = Math.min(user.credits_balance + DAILY_GRANT, HOBBY_CAP);
      await supabase
        .from("profiles")
        .update({ credits_balance: newBalance })
        .eq("id", user.id);
      updated++;
    }

    console.log(`[cron/reset-credits] Topped up ${updated} Hobby users`);
    return NextResponse.json({ ok: true, updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[cron/reset-credits]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
