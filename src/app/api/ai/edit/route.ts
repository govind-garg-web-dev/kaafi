import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Kaafi's code editor. The user has an existing React Native + Expo app and wants to make a change.

Given their instruction and the current files, return ONLY the files that need to change.

Output format (return ONLY this JSON, no markdown, no explanation):
{
  "patches": [{ "path": "...", "content": "... full updated file content ..." }],
  "reply": "Done! I changed X."
}

Important:
- Only include files that actually need to change
- Return the complete file content for each changed file, not just the diff
- Keep unchanged files out of patches entirely`;

function extractJSON(raw: string): { patches: { path: string; content: string }[]; reply: string } {
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON found in response");
  return JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message, files } = await req.json();

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

    const userPrompt = `User instruction: "${message}"\n\nCurrent files:\n${filesContext}`;

    async function attempt(isRetry: boolean) {
      const systemMsg = isRetry
        ? `${SYSTEM_PROMPT}\n\nIMPORTANT: Your previous response was cut off or had invalid JSON. Return ONLY the JSON object. Make file content as concise as possible while keeping it valid.`
        : SYSTEM_PROMPT;

      return client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 16000,
        system: systemMsg,
        messages: [{ role: "user", content: userPrompt }],
      });
    }

    let parsed: { patches: { path: string; content: string }[]; reply: string };

    try {
      const response = await attempt(false);
      const raw = response.content[0].type === "text" ? response.content[0].text : "";
      parsed = extractJSON(raw);
    } catch (firstErr) {
      console.warn("[/api/ai/edit] Attempt 1 failed, retrying:", firstErr);
      try {
        const response = await attempt(true);
        const raw = response.content[0].type === "text" ? response.content[0].text : "";
        parsed = extractJSON(raw);
      } catch (secondErr) {
        const msg = secondErr instanceof Error ? secondErr.message : "Unknown error";
        console.error("[/api/ai/edit] Both attempts failed:", msg);
        return NextResponse.json(
          { error: "The AI couldn't complete this edit. Try a simpler instruction or break it into smaller steps." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      patches: parsed.patches ?? [],
      reply: parsed.reply ?? "Changes ready to apply.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/ai/edit]", msg);
    return NextResponse.json({ error: `Edit failed: ${msg}` }, { status: 500 });
  }
}
