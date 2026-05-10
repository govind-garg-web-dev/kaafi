import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Kaafi's code editor. The user has an existing React Native + Expo app and wants to make a change.

Given their instruction and the current files, return:
1. A JSON array of file patches (only files that change)
2. A short, friendly reply describing what you changed

Output format (return ONLY this JSON, no markdown):
{
  "patches": [{ "path": "...", "content": "... full updated file ..." }],
  "reply": "Done! I changed X and Y."
}`;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message, files } = await req.json();

    // Check credits upfront so the user gets a clear error before the AI call
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", user.id)
      .single();

    if (!profile || profile.credits_balance < 1) {
      return NextResponse.json({ error: "Insufficient credits." }, { status: 402 });
    }

    const filesContext = (files as { path: string; content: string }[])
      .map((f) => `### ${f.path}\n${f.content}`)
      .join("\n\n---\n\n");

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: `User instruction: "${message}"\n\nCurrent files:\n${filesContext}`,
      }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";

    // Robust JSON extraction — find the outermost { } regardless of surrounding text or code fences
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("[/api/ai/edit] No JSON object found in response:", raw.slice(0, 200));
      return NextResponse.json({ error: "The AI returned an unexpected response. Please try rephrasing your edit." }, { status: 500 });
    }

    const { patches, reply } = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));

    // Return patches for the client to show in DiffViewer — no credits deducted yet, no DB writes yet
    return NextResponse.json({ patches: patches ?? [], reply: reply ?? "Changes ready to apply." });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/ai/edit]", msg);
    return NextResponse.json({ error: `Edit failed: ${msg}` }, { status: 500 });
  }
}
