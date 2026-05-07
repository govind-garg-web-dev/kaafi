import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { AUTH_FEED_SCAFFOLD } from "@/lib/scaffolds/auth-feed";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Kaafi's code generator. Your job is to fill in a React Native + Expo scaffold template with content specific to the user's app idea and their answers.

Rules:
- Replace EVERY KAAFI_SLOT marker with real, meaningful content specific to the app.
- Keep all React Native / Expo code valid and complete.
- Use NativeWind (Tailwind) classes for all styling.
- Keep the file structure exactly as provided — do NOT add or remove files.
- Return ONLY a JSON array of file patches. No explanation. No markdown.

Output format:
[
  { "path": "app/_layout.tsx", "content": "... full file content ..." },
  { "path": "data/seed.ts", "content": "... full file content ..." }
]`;

function buildUserPrompt(
  idea: string,
  answers: Record<string, string>,
  questions: { id: string; question: string; options: { id: string; label: string }[] }[]
): string {
  const answerLines = questions
    .map((q) => {
      const opt = q.options.find((o) => o.id === answers[q.id]);
      return `- ${q.question}: ${opt?.label ?? answers[q.id] ?? "(skipped)"}`;
    })
    .join("\n");

  const scaffoldFiles = Object.entries(AUTH_FEED_SCAFFOLD)
    .map(([path, content]) => `### ${path}\n${content}`)
    .join("\n\n---\n\n");

  return `App idea: "${idea}"

User's answers:
${answerLines}

Here is the scaffold template to fill in. Replace ALL KAAFI_SLOT markers:

${scaffoldFiles}

Return a JSON array of file patches replacing every KAAFI_SLOT with content specific to this app idea.`;
}

const CREDIT_COST = 3;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check + deduct credits
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits_balance, plan")
      .eq("id", user.id)
      .single();

    if (!profile || profile.credits_balance < CREDIT_COST) {
      return NextResponse.json({ error: "Insufficient credits. Please top up." }, { status: 402 });
    }

    const { idea, answers, questions } = await req.json();

    if (!idea || !answers) {
      return NextResponse.json({ error: "Missing idea or answers." }, { status: 400 });
    }

    // Deduct credits first
    await supabase
      .from("profiles")
      .update({ credits_balance: profile.credits_balance - CREDIT_COST })
      .eq("id", user.id);

    // Log transaction
    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      delta: -CREDIT_COST,
      reason: "App generation",
    });

    // Create project record
    const projectName = idea.length > 50 ? idea.slice(0, 50) + "…" : idea;
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: projectName,
        prompt: idea,
        mcq_answers: answers,
        status: "generating",
        scaffold_type: "auth-feed",
      })
      .select()
      .single();

    if (projectError || !project) {
      throw new Error("Failed to create project");
    }

    // Call Sonnet 4.6 to fill the scaffold
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: buildUserPrompt(idea, answers, questions ?? []),
      }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "[]";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const patches: { path: string; content: string }[] = JSON.parse(cleaned);

    // Save files to DB
    if (patches.length > 0) {
      await supabase.from("project_files").insert(
        patches.map((p) => ({
          project_id: project.id,
          path: p.path,
          content: p.content,
        }))
      );
    }

    // Mark project as ready
    await supabase
      .from("projects")
      .update({ status: "ready" })
      .eq("id", project.id);

    return NextResponse.json({ projectId: project.id });
  } catch (err) {
    console.error("[/api/ai/generate]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed." },
      { status: 500 }
    );
  }
}
