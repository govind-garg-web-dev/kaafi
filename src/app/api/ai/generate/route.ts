import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { SCAFFOLDS, selectTemplate } from "@/lib/scaffolds/selector";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const CREDIT_COST = 3;

// Extract every unique KAAFI_SLOT_* name from all scaffold files
function extractSlots(scaffold: Record<string, string>): string[] {
  const all = Object.values(scaffold).join("\n");
  const matches = all.match(/KAAFI_SLOT_[A-Z0-9_]+/g) ?? [];
  return [...new Set(matches)];
}

// Replace all slot occurrences in a string
function applySlots(template: string, slots: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(slots)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

const SYSTEM_PROMPT = `You are Kaafi's app content generator. Given an app idea and user preferences, return a JSON object mapping slot names to values that will be injected into a React Native app template.

Return ONLY valid JSON. No markdown. No explanation.`;

function buildSlotPrompt(
  idea: string,
  answers: Record<string, string>,
  questions: { id: string; question: string; options: { id: string; label: string }[] }[],
  slots: string[]
): string {
  const answerLines = questions
    .map((q) => {
      const opt = q.options.find((o) => o.id === answers[q.id]);
      return `- ${q.question}: ${opt?.label ?? answers[q.id] ?? "(skipped)"}`;
    })
    .join("\n");

  return `App idea: "${idea}"

User's preferences:
${answerLines}

Fill in EVERY slot below with a specific, realistic value for this app. Return a flat JSON object.

Slots to fill:
${slots.join("\n")}

Rules:
- KAAFI_SLOT_APP_NAME: short, catchy name (2-3 words max)
- KAAFI_SLOT_APP_SLUG: lowercase-hyphenated version of app name
- KAAFI_SLOT_PRIMARY_COLOR: a hex color matching the vibe (e.g. "#7C3AED")
- KAAFI_SLOT_ACCENT_COLOR: a complementary hex color
- KAAFI_SLOT_APP_ICON: a valid Ionicons icon name (e.g. "paw-outline", "restaurant-outline")
- KAAFI_SLOT_AUTH_METHOD: how users sign in (1 sentence)
- KAAFI_SLOT_VIBE: the aesthetic description
- KAAFI_SLOT_LOGIN_TAGLINE: 5-8 word welcome phrase
- KAAFI_SLOT_SIGNUP_TAGLINE: 5-8 word signup encouragement
- KAAFI_SLOT_GREETING: short greeting like "Good morning" or "Hey there"
- KAAFI_SLOT_HEADER_TITLE: the home screen header title (4 words max)
- KAAFI_SLOT_SEARCH_PLACEHOLDER: search bar placeholder text
- KAAFI_SLOT_FEED_TITLE: section title for the main feed
- KAAFI_SLOT_FEED_ITEM_TYPE: what each item in the feed represents
- KAAFI_SLOT_CTA_LABEL: action button label (1-2 words, e.g. "Book", "Order", "View")
- KAAFI_SLOT_TAB1_LABEL: first tab label (Home/Feed/Browse)
- KAAFI_SLOT_TAB1_ICON: Ionicons icon for tab 1 (e.g. "home-outline")
- KAAFI_SLOT_TAB2_LABEL: second tab label (Explore/Discover/Search)
- KAAFI_SLOT_TAB2_ICON: Ionicons icon for tab 2 (e.g. "search-outline")
- KAAFI_SLOT_EXPLORE_SUBTITLE: subtitle for explore/search screen
- KAAFI_SLOT_EXPLORE_EMPTY_STATE: friendly empty state message
- KAAFI_SLOT_CAT1 through CAT4: 4 category filter chip labels
- KAAFI_SLOT_PROFILE_NAME: placeholder profile name
- KAAFI_SLOT_PROFILE_META: profile subtitle (e.g. "Member since 2024")
- KAAFI_SLOT_MENU1 + MENU1_ICON, MENU2 + MENU2_ICON, MENU3 + MENU3_ICON: 3 profile menu items with Ionicons names
- KAAFI_SLOT_ITEM1 through ITEM5 (_TITLE, _SUBTITLE, _EMOJI, _META): 5 realistic sample feed items
- KAAFI_SLOT_APP_DESCRIPTION: one-sentence app description

Return ONLY the JSON object.`;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("credits_balance, plan")
      .eq("id", user.id)
      .single();

    if (!profile || profile.credits_balance < CREDIT_COST) {
      return NextResponse.json({ error: "Not enough credits. Please top up." }, { status: 402 });
    }

    const { idea, answers, questions } = await req.json();
    if (!idea || !answers) {
      return NextResponse.json({ error: "Missing idea or answers." }, { status: 400 });
    }

    // Resolve answer IDs → label text so the keyword selector works correctly
    type Q = { id: string; options: { id: string; label: string }[] };
    const resolvedAnswers: Record<string, string> = {};
    if (Array.isArray(questions)) {
      for (const q of questions as Q[]) {
        const answerId = answers[q.id];
        const opt = q.options.find((o) => o.id === answerId);
        if (opt) resolvedAnswers[q.id] = opt.label;
      }
    }

    // Pick scaffold early — needed for project record
    const scaffoldType = selectTemplate(idea, resolvedAnswers);
    const scaffold = SCAFFOLDS[scaffoldType];

    // Deduct credits
    await supabase
      .from("profiles")
      .update({ credits_balance: profile.credits_balance - CREDIT_COST })
      .eq("id", user.id);

    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      delta: -CREDIT_COST,
      reason: "App generation",
    });

    // Create project
    const projectName = idea.length > 50 ? idea.slice(0, 50) + "…" : idea;
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: projectName,
        prompt: idea,
        mcq_answers: answers,
        status: "generating",
        scaffold_type: scaffoldType,
      })
      .select()
      .single();

    if (projectError || !project) throw new Error("Failed to create project");

    // Extract slots from the chosen scaffold
    const slots = extractSlots(scaffold);
    const prompt = buildSlotPrompt(idea, answers, questions ?? [], slots);

    // Helper: call Sonnet and parse slot values
    async function attemptGeneration(isRetry: boolean): Promise<Record<string, string>> {
      const systemMsg = isRetry
        ? `${SYSTEM_PROMPT}\n\nIMPORTANT: Your previous attempt returned invalid JSON. This is a retry — return ONLY a valid, complete JSON object. Double-check all strings are properly closed.`
        : SYSTEM_PROMPT;

      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: systemMsg,
        messages: [{ role: "user", content: prompt }],
      });

      const raw = message.content[0].type === "text" ? message.content[0].text : "{}";
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      return JSON.parse(cleaned); // throws on invalid JSON
    }

    // Auto-retry: attempt 1, then attempt 2 — both on our cost
    let slotValues: Record<string, string>;
    try {
      slotValues = await attemptGeneration(false);
    } catch (firstErr) {
      console.warn("[/api/ai/generate] Attempt 1 failed, retrying…", firstErr);
      try {
        slotValues = await attemptGeneration(true);
      } catch (secondErr) {
        // Both attempts failed — refund credits and mark project as error
        console.error("[/api/ai/generate] Both attempts failed", secondErr);

        await supabase
          .from("profiles")
          .update({ credits_balance: profile.credits_balance }) // restore original
          .eq("id", user.id);

        await supabase.from("credit_transactions").insert({
          user_id: user.id,
          delta: CREDIT_COST,
          reason: "Generation failed — credits refunded",
          project_id: project.id,
        });

        await supabase
          .from("projects")
          .update({ status: "error" })
          .eq("id", project.id);

        return NextResponse.json(
          { error: "Generation failed after 2 attempts. Your credits have been refunded." },
          { status: 500 }
        );
      }
    }

    // Apply slots to every scaffold file programmatically
    const patches = Object.entries(scaffold).map(([path, template]) => ({
      path,
      content: applySlots(template, slotValues),
    }));

    // Save files
    await supabase.from("project_files").insert(
      patches.map((p) => ({
        project_id: project.id,
        path: p.path,
        content: p.content,
      }))
    );

    // Mark ready
    await supabase
      .from("projects")
      .update({ status: "ready" })
      .eq("id", project.id);

    return NextResponse.json({ projectId: project.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Generation failed.";
    console.error("[/api/ai/generate]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
