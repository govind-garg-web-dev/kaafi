import { NextRequest, NextResponse } from "next/server";

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    if (!LOOPS_API_KEY) {
      // Dev mode — no key yet, just pretend it worked
      console.warn("[waitlist] LOOPS_API_KEY not set — skipping Loops API call");
      return NextResponse.json({ ok: true });
    }

    const res = await fetch("https://app.loops.so/api/v1/contacts/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOOPS_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        source: "kaafi-waitlist",
        userGroup: "Waitlist",
        subscribed: true,
      }),
    });

    const data = await res.json();

    // Loops returns { success: true } or { success: false, message: "..." }
    if (!res.ok && data.message !== "Contact already exists.") {
      console.error("[waitlist] Loops error:", data);
      return NextResponse.json({ error: "Failed to join waitlist." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[waitlist]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
