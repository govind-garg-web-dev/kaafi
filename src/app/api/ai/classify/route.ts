import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You classify a user's app edit request as either "light" or "heavy".

light (1 credit): text changes, color changes, label changes, icon swap, minor layout tweak, wording update
heavy (2 credits): new screen, new feature, navigation change, new component, major redesign, adding functionality, data model change

Reply with ONLY one word: light OR heavy`;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string" || message.trim().length < 3) {
      return NextResponse.json({ type: "light", credits: 1 });
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 5,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message.trim() }],
    });

    const result = response.content[0].type === "text"
      ? response.content[0].text.trim().toLowerCase()
      : "light";

    const type = result.includes("heavy") ? "heavy" : "light";
    return NextResponse.json({ type, credits: type === "heavy" ? 2 : 1 });
  } catch {
    // On any error, default to light — never block the user
    return NextResponse.json({ type: "light", credits: 1 });
  }
}
