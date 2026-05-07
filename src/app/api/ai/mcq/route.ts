import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Kaafi's app planning assistant. Your job is to deeply understand what mobile app someone wants to build by generating targeted multiple-choice questions. Be specific, clever, and relevant to the exact app idea — never generic.

Return ONLY a valid JSON object. No markdown, no explanation, no code fences. Just the raw JSON.`;

const USER_PROMPT = (idea: string) => `
The user wants to build: "${idea}"

Generate exactly 18 multiple-choice questions that will reveal everything needed to build this app.
Cover these areas (in roughly this order, but adapt to the app type):
1. Target audience — who are the primary users?
2. Visual vibe / aesthetic — what feeling should the app have?
3. Color personality — warm/cool/neutral/bold?
4. Navigation style — how users move through the app
5. Sign-in method — how users authenticate
6. #1 core feature — the single most important capability
7. #2 core feature — the second most important thing
8. Content source — who creates or provides the content?
9. Social features — how users interact with each other
10. Search & discovery — how users find things
11. Notifications — what should the app ping users about?
12. Monetisation model — how does this app make money?
13. Pricing (if paid) — what does it cost users?
14. Offline mode — does it work without internet?
15. Device features — camera, GPS, microphone, etc.?
16. Data sensitivity — how private is user data?
17. Geographic target — local, national, or global?
18. First screen after login — what does the user see first?

Return this exact JSON shape:
{
  "questions": [
    {
      "id": "q1",
      "category": "audience",
      "question": "...",
      "options": [
        { "id": "a", "icon": "🧑", "label": "Short Label", "description": "One sentence, under 10 words." },
        { "id": "b", "icon": "👩", "label": "Short Label", "description": "One sentence, under 10 words." },
        { "id": "c", "icon": "👴", "label": "Short Label", "description": "One sentence, under 10 words." },
        { "id": "d", "icon": "🏢", "label": "Short Label", "description": "One sentence, under 10 words." }
      ]
    }
  ]
}

Rules:
- Every question and every option MUST reference the specific app idea, not be generic.
- Each question has exactly 3 or 4 options (use 3 when 4 would be redundant).
- Icons: single emoji only.
- Labels: 2–4 words max.
- Descriptions: 1 sentence, ≤10 words.
- Return ONLY the JSON. No markdown. No extra text.
`;

export async function POST(req: NextRequest) {
  try {
    const { idea } = await req.json();

    if (!idea || typeof idea !== "string" || idea.trim().length < 3) {
      return NextResponse.json({ error: "App idea is required." }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: USER_PROMPT(idea.trim()) }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error("Invalid questions structure from AI");
    }

    return NextResponse.json(parsed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/ai/mcq]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
