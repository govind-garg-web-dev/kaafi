import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { logAICost } from "@/lib/logAICost";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Kaafi's app planning assistant. Generate targeted multiple-choice questions for a mobile app idea.

CRITICAL: Return ONLY raw JSON. No markdown, no code fences, no explanation. Start your response with { and end with }`;

const USER_PROMPT = (idea: string) => `
The user wants to build: "${idea}"

Generate exactly 18 multiple-choice questions covering:
1. Target audience, 2. Visual vibe, 3. Color personality, 4. Navigation style,
5. Sign-in method, 6. Core feature #1, 7. Core feature #2, 8. Content source,
9. Social features, 10. Search & discovery, 11. Notifications, 12. Monetisation,
13. Pricing, 14. Offline mode, 15. Device features, 16. Data sensitivity,
17. Geographic target, 18. First screen after login

Return this exact JSON shape (start with { immediately, no preamble):
{"questions":[{"id":"q1","category":"audience","question":"...","options":[{"id":"a","icon":"🧑","label":"Short Label","description":"One sentence, max 8 words."},{"id":"b","icon":"👩","label":"Short Label","description":"One sentence, max 8 words."},{"id":"c","icon":"👴","label":"Short Label","description":"One sentence, max 8 words."}]}]}

Rules:
- Every question must be specific to "${idea}", never generic
- 3-4 options per question
- Icons: single emoji only
- Labels: 2-4 words max
- Descriptions: max 8 words (SHORT — prevents token overflow)
- Return ONLY the JSON object, nothing else
`;

function extractAndParseJSON(raw: string): { questions: unknown[] } {
  // Try 1: parse as-is (clean response)
  try {
    return JSON.parse(raw.trim());
  } catch { /* try next */ }

  // Try 2: strip markdown fences then parse
  try {
    const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(stripped);
  } catch { /* try next */ }

  // Try 3: find outermost { } and parse that slice
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return JSON.parse(raw.slice(start, end + 1));
  }

  throw new Error("Could not extract valid JSON from AI response");
}

export async function POST(req: NextRequest) {
  try {
    const { idea } = await req.json();

    if (!idea || typeof idea !== "string" || idea.trim().length < 3) {
      return NextResponse.json({ error: "App idea is required." }, { status: 400 });
    }

    const ideaTrimmed = idea.trim();

    async function attempt(isRetry: boolean) {
      const systemMsg = isRetry
        ? `${SYSTEM_PROMPT}\n\nPREVIOUS ATTEMPT FAILED: your JSON was malformed. This time, be extra careful with JSON syntax. Keep descriptions very short (5 words max) to avoid any issues.`
        : SYSTEM_PROMPT;

      return client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 6000, // reduced to avoid truncation
        system: systemMsg,
        messages: [{ role: "user", content: USER_PROMPT(ideaTrimmed) }],
      });
    }

    let message;
    let parsed: { questions: unknown[] };

    try {
      message = await attempt(false);
      const raw = message.content[0].type === "text" ? message.content[0].text : "";
      parsed = extractAndParseJSON(raw);
    } catch (firstErr) {
      console.warn("[/api/ai/mcq] Attempt 1 failed:", firstErr instanceof Error ? firstErr.message : firstErr);
      try {
        message = await attempt(true);
        const raw = message.content[0].type === "text" ? message.content[0].text : "";
        parsed = extractAndParseJSON(raw);
      } catch (secondErr) {
        console.error("[/api/ai/mcq] Both attempts failed:", secondErr instanceof Error ? secondErr.message : secondErr);
        return NextResponse.json(
          { error: "Failed to generate questions. Please try again." },
          { status: 500 }
        );
      }
    }

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return NextResponse.json({ error: "No questions generated. Please try again." }, { status: 500 });
    }

    logAICost({
      model: "claude-haiku-4-5-20251001",
      action: "mcq",
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    });

    return NextResponse.json(parsed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/ai/mcq]", msg);
    return NextResponse.json({ error: "Failed to generate questions. Please try again." }, { status: 500 });
  }
}
