import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { SCAFFOLDS, selectTemplate } from "@/lib/scaffolds/selector";
import { logAICost } from "@/lib/logAICost";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const STANDARD_MODEL = "claude-sonnet-4-6";
const PREMIUM_MODEL  = "claude-opus-4-7";
const STANDARD_COST  = 3;
const PREMIUM_COST   = 5;

// ── Boilerplate (scaffold + slot-fill) ───────────────────
// Fast, reliable. Handles: app.json, package.json, babel config,
// tailwind config, navigation layouts, store, seed data.
// These files are the same structure for every app — only values differ.

function extractSlots(scaffold: Record<string, string>): string[] {
  const all = Object.values(scaffold).join("\n");
  return [...new Set(all.match(/KAAFI_SLOT_[A-Z0-9_]+/g) ?? [])];
}

function applySlots(template: string, slots: Record<string, string>): string {
  let result = template;
  for (const [k, v] of Object.entries(slots)) result = result.replaceAll(k, v);
  return result;
}

const SLOT_SYSTEM_PROMPT = `Fill slot values for a React Native app template. Return ONLY a flat JSON object — no markdown, no explanation.`;

function buildSlotPrompt(
  idea: string,
  answers: Record<string, string>,
  questions: { id: string; question: string; options: { id: string; label: string }[] }[],
  slots: string[]
): string {
  const lines = questions.map((q) => {
    const opt = q.options.find((o) => o.id === answers[q.id]);
    return `- ${q.question}: ${opt?.label ?? "(skipped)"}`;
  }).join("\n");

  return `App idea: "${idea}"
User choices:
${lines}

Fill these slots with specific, realistic values:
${slots.join("\n")}

Key rules:
- APP_NAME: 2-3 catchy words, sounds like a real app
- PRIMARY_COLOR: distinctive hex for this app type. Finance=blue(#2563eb), Food=orange(#f97316), Health=green(#10b981), Social=indigo(#6366f1), Pets=amber(#f59e0b), Services=navy(#1e40af). NOT always purple.
- ITEM titles/subtitles/emojis: ultra-realistic for "${idea}", not generic "Item 1"
- LOGIN_TAGLINE: warm, brand-voice (not "Sign in to continue")

Return ONLY the JSON object.`;
}

// ── Custom screen generation ──────────────────────────────
// Writes 4 key screens from scratch using ALL 18 user answers.
// Uses file delimiters (not JSON) to avoid quote-escaping failures.
// These replace the scaffold's main screens with fully custom code.

const SCREEN_GEN_SYSTEM_PROMPT = `You are a senior React Native developer. Write complete, production-quality TypeScript screens for a mobile app.

TECH STACK:
- React Native + Expo (import from "react-native", not "react-native-web")
- Expo Router: import { router } from "expo-router" for navigation
- Ionicons: import { Ionicons } from "@expo/vector-icons"
- NativeWind: use className prop for all static styles
- Dynamic colors (primary color): ONLY via style={{ backgroundColor: PRIMARY_COLOR }} or style={{ color: PRIMARY_COLOR }}
- State: useState from "react"

DESIGN RULES (non-negotiable):
- Page bg: className="flex-1 bg-slate-50"
- Status bar safe area: pt-14 on all screen headers
- Cards: bg-white rounded-3xl p-5, gap-5 between cards, no border (use shadow-sm)
- Bottom safe area: pb-28 on all ScrollView content (tab bar overlap)
- Headers: text-3xl font-bold text-gray-900 + text-sm text-slate-400 subtitle
- Primary buttons: py-4 rounded-2xl + style={{ backgroundColor: PRIMARY_COLOR }}
- Use PRIMARY_COLOR richly: icon backgrounds (opacity 15%), card accents, CTAs, badges

OUTPUT — use FILE MARKERS, write raw code (no JSON, no escaping):

<<<FILE: app/(auth)/login.tsx>>>
{complete TypeScript file content}
<<<FILE: app/(tabs)/_layout.tsx>>>
{complete TypeScript file content}
<<<FILE: app/(tabs)/index.tsx>>>
{complete TypeScript file content}
<<<FILE: app/(tabs)/profile.tsx>>>
{complete TypeScript file content}
<<<END>>>

Write ONLY these 4 files. Nothing else.`;

// Parse <<<FILE: path>>> ... <<<END>>> delimiter format.
// No JSON = no escaping issues with code strings.
function parseFileDelimiters(raw: string): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];
  const parts = raw.split(/<<<FILE:\s*/);
  for (const part of parts) {
    const markerEnd = part.indexOf(">>>");
    if (markerEnd === -1) continue;
    const path = part.slice(0, markerEnd).trim();
    // Remove trailing <<<END>>> if present
    const content = part.slice(markerEnd + 3).replace(/<<<END>>>[\s\S]*$/, "").trim();
    if (path && content && content.length > 30 && content.includes("export default")) {
      files.push({ path, content });
    }
  }
  return files;
}

async function generateScreens(
  idea: string,
  questions: { id: string; question: string; options: { id: string; label: string }[] }[],
  answers: Record<string, string>,
  slotValues: Record<string, string>,
  model: string,
): Promise<{ path: string; content: string }[]> {

  const PRIMARY_COLOR = slotValues.KAAFI_SLOT_PRIMARY_COLOR ?? "#7c5cfc";
  const APP_NAME      = slotValues.KAAFI_SLOT_APP_NAME ?? "My App";
  const APP_ICON      = slotValues.KAAFI_SLOT_APP_ICON ?? "apps-outline";

  // Format all 18 answers for the prompt
  const allAnswers = questions.map((q) => {
    const opt = q.options.find((o) => o.id === answers[q.id]);
    return `  • ${q.question}: ${opt?.label ?? "not answered"}`;
  }).join("\n");

  // Build sample items from slot values
  const items = [1,2,3,4,5].map((n) => ({
    title:    slotValues[`KAAFI_SLOT_ITEM${n}_TITLE`]    ?? `Item ${n}`,
    subtitle: slotValues[`KAAFI_SLOT_ITEM${n}_SUBTITLE`] ?? "",
    emoji:    slotValues[`KAAFI_SLOT_ITEM${n}_EMOJI`]    ?? "⭐",
    meta:     slotValues[`KAAFI_SLOT_ITEM${n}_META`]     ?? "",
  }));
  const sampleData = `const SAMPLE_DATA = ${JSON.stringify(items, null, 2)};`;

  const userPrompt = `Build 4 React Native screens for: "${idea}"

PRIMARY_COLOR = "${PRIMARY_COLOR}"
APP_NAME = "${APP_NAME}"
APP_ICON = "${APP_ICON}" (Ionicons name)
LOGIN_TAGLINE = "${slotValues.KAAFI_SLOT_LOGIN_TAGLINE ?? "Welcome back"}"
HEADER_TITLE = "${slotValues.KAAFI_SLOT_HEADER_TITLE ?? "Home"}"
SEARCH_PLACEHOLDER = "${slotValues.KAAFI_SLOT_SEARCH_PLACEHOLDER ?? "Search..."}"
CTA_LABEL = "${slotValues.KAAFI_SLOT_CTA_LABEL ?? "View"}"

Sample data to use (copy this exactly into the code):
${sampleData}

══════════════════════════════════════
ALL 18 USER REQUIREMENTS — implement every one:
══════════════════════════════════════
${allAnswers}

══════════════════════════════════════
SCREEN 1: app/(auth)/login.tsx
══════════════════════════════════════
Read the "sign-in method" answer above, then implement:
• "Email only" → email TextInput + password TextInput + "Sign in" button
• "Google / Apple sign-in" → "Continue with Google" button (logo-google icon) + "Continue with Apple" (logo-apple) — NO password field
• "Phone number / OTP" → phone TextInput + "Send OTP" button (show a 4-digit code input row after)
• "No login / Guest" → ONE button "Explore ${APP_NAME}" that calls router.replace("/(tabs)"), no inputs needed

All variants: show Ionicons ${APP_ICON} icon in a PRIMARY_COLOR rounded square, APP_NAME in bold, LOGIN_TAGLINE beneath.
Sign in action: router.replace("/(tabs)")
Link to signup: router.push("/(auth)/signup")

══════════════════════════════════════
SCREEN 2: app/(tabs)/_layout.tsx
══════════════════════════════════════
Create the bottom tab navigator. Tabs must match the app's purpose:
- Read the "first screen after login" answer → that tab goes first (index 0)
- Read the "core feature 1" and "core feature 2" answers → choose tab names/icons that match
- Always include a Profile tab last
- Use Ionicons icons that match each tab's purpose
- Tab bar: backgroundColor white, activeTintColor PRIMARY_COLOR = "${PRIMARY_COLOR}"

Example for an expense tracker: tabs = Expenses (receipt-outline), Analytics (bar-chart-outline), Profile (person-outline)
Example for a dog walker app: tabs = Find Walkers (map-outline), My Bookings (calendar-outline), Profile (person-outline)
Make the tabs SPECIFIC to this exact app: "${idea}"

══════════════════════════════════════
SCREEN 3: app/(tabs)/index.tsx — THE MOST IMPORTANT SCREEN
══════════════════════════════════════
This is what users see first. Make it completely specific to "${idea}".

Header section:
- Greeting: "${slotValues.KAAFI_SLOT_GREETING ?? "Hey there"} 👋" + bold HEADER_TITLE
- If notifications answer = "Yes/Push alerts": add bell icon (notifications-outline) in header right with a red dot (View w/ bg-red-500 rounded-full absolute)

Category row (horizontal scroll):
- 4 filter chips specific to this app (not "All, Popular, New, Featured")
- First chip active: style={{ backgroundColor: PRIMARY_COLOR }}, text white
- Others: bg-slate-100 text-slate-600

Search bar: bg-white rounded-2xl border border-slate-200 px-4 py-3 flex-row items-center gap-3 shadow-sm

Card list — use SAMPLE_DATA above. Each card:
- White bg, rounded-3xl, shadow-sm, p-5
- Emoji in a rounded-2xl box with PRIMARY_COLOR opacity-15 background
- Title: font-bold text-base text-gray-900
- Subtitle: text-sm text-slate-400
- Meta: font-semibold + style={{ color: PRIMARY_COLOR }}
- CTA button: "${slotValues.KAAFI_SLOT_CTA_LABEL ?? "View"}" — rounded-xl px-4 py-2 + style={{ backgroundColor: PRIMARY_COLOR }}

Read and implement these from the answers:
• Social features: if "Likes + Comments" → add ❤️ [count] 💬 [count] row under each card; if "Reviews + Ratings" → add ⭐ 4.8 (142 reviews) text
• Core features: if "Real-time tracking" → add green "● Live" badge on cards; if "Booking/Appointment" → show "3 slots available" on cards; if "Chat" → show "Last message preview..." in subtitle; if "Analytics" → show trend arrow + percentage

══════════════════════════════════════
SCREEN 4: app/(tabs)/profile.tsx
══════════════════════════════════════
- Hero: large circle avatar (PRIMARY_COLOR bg) with "👤" text, APP_NAME below, ${slotValues.KAAFI_SLOT_PROFILE_META ?? "Member since 2024"}

Read the "monetization" answer:
• "Subscription / Freemium" → show a rounded-3xl card with LinearGradient (import it) from PRIMARY_COLOR to a darker shade, "⭐ Go Premium" title, 3 bullet benefits for this specific app, "Upgrade Now" button
• "Commission-based" → show a stats card: "Earnings This Month" + "₹2,400" in large text + trend
• "In-app purchases" → show "💰 Credits: 250" balance chip in the header
• "Free" or other → no special monetization card

Menu items (use app-appropriate options, not generic):
${slotValues.KAAFI_SLOT_MENU1 ? `- ${slotValues.KAAFI_SLOT_MENU1}` : "- My Activity"}
${slotValues.KAAFI_SLOT_MENU2 ? `- ${slotValues.KAAFI_SLOT_MENU2}` : "- Settings"}
${slotValues.KAAFI_SLOT_MENU3 ? `- ${slotValues.KAAFI_SLOT_MENU3}` : "- Help"}

Red "Sign out" at bottom.

══════════════════════════════════════
Remember: PRIMARY_COLOR = "${PRIMARY_COLOR}" — use style prop, not className.
Write all 4 screens now.`;

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 12000,
      stop_sequences: ["<<<END>>>"],
      system: SCREEN_GEN_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    logAICost({
      userId: undefined,
      model,
      action: "generate",
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    console.log("[generate] Screen gen: stop_reason=", response.stop_reason, "raw_length=", raw.length);

    const screens = parseFileDelimiters(raw);
    console.log("[generate] Screens parsed:", screens.map((s) => s.path));

    return screens;

  } catch (err) {
    console.error("[generate] Screen generation failed:", err instanceof Error ? err.message : err);
    return []; // fall back to scaffold screens
  }
}

// ── Main handler ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { idea, answers, questions, premium = false } = await req.json();
    if (!idea || !answers) return NextResponse.json({ error: "Missing idea or answers." }, { status: 400 });

    const model      = premium ? PREMIUM_MODEL : STANDARD_MODEL;
    const creditCost = premium ? PREMIUM_COST  : STANDARD_COST;

    const { data: profile } = await supabase
      .from("profiles").select("credits_balance, plan").eq("id", user.id).single();

    if (!profile || profile.credits_balance < creditCost)
      return NextResponse.json({ error: "Not enough credits. Please top up." }, { status: 402 });

    // Resolve answer IDs → labels (for template selector + slot prompt)
    type Q = { id: string; options: { id: string; label: string }[] };
    const resolvedAnswers: Record<string, string> = {};
    if (Array.isArray(questions)) {
      for (const q of questions as Q[]) {
        const opt = q.options.find((o) => o.id === answers[q.id]);
        if (opt) resolvedAnswers[q.id] = opt.label;
      }
    }

    // Deduct credits
    await supabase.from("profiles").update({ credits_balance: profile.credits_balance - creditCost }).eq("id", user.id);
    await supabase.from("credit_transactions").insert({
      user_id: user.id, delta: -creditCost,
      reason: premium ? "Premium app generation" : "App generation",
    });

    const projectName = idea.length > 50 ? idea.slice(0, 50) + "…" : idea;
    const scaffoldType = selectTemplate(idea, resolvedAnswers);

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name: projectName, prompt: idea, mcq_answers: answers, status: "generating", scaffold_type: scaffoldType })
      .select().single();

    if (projectError || !project) throw new Error("Failed to create project");

    // ── STEP 1: Slot-fill (Haiku) → branding values ───────
    const scaffold = SCAFFOLDS[scaffoldType];
    const slots = extractSlots(scaffold);
    const slotPrompt = buildSlotPrompt(idea, answers, questions ?? [], slots);

    let slotValues: Record<string, string> = {};
    try {
      const slotMsg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: SLOT_SYSTEM_PROMPT,
        messages: [{ role: "user", content: slotPrompt }],
      });
      logAICost({ userId: user.id, model: "claude-haiku-4-5-20251001", action: "generate", inputTokens: slotMsg.usage.input_tokens, outputTokens: slotMsg.usage.output_tokens });
      const raw = slotMsg.content[0].type === "text" ? slotMsg.content[0].text : "{}";
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      slotValues = JSON.parse(cleaned);
    } catch (err) {
      console.warn("[generate] Slot-fill failed:", err);
      // Continue with empty slot values — screens can still be generated
    }

    // ── STEP 2: Apply slots to scaffold → boilerplate ─────
    let patches = Object.entries(scaffold).map(([path, template]) => ({
      path, content: applySlots(template, slotValues),
    }));

    // ── STEP 3: Generate custom screens (Sonnet/Opus) ─────
    // These REPLACE the scaffold's main UI screens with fully custom code
    // that reflects the user's 18 MCQ answers.
    const customScreens = await generateScreens(idea, questions ?? [], answers, slotValues, model);

    if (customScreens.length > 0) {
      console.log("[generate] Applying", customScreens.length, "custom screens");
      const screenMap = new Map(customScreens.map((s) => [s.path, s.content]));
      // Replace matching scaffold files with custom screens
      patches = patches.map((p) => screenMap.has(p.path) ? { ...p, content: screenMap.get(p.path)! } : p);
      // Add any new files the AI created that aren't in the scaffold
      for (const screen of customScreens) {
        if (!patches.some((p) => p.path === screen.path)) {
          patches.push(screen);
        }
      }
    } else {
      console.warn("[generate] No custom screens generated, using scaffold screens");
    }

    // ── STEP 4: Save and complete ─────────────────────────
    await supabase.from("project_files").insert(
      patches.map((p) => ({ project_id: project.id, path: p.path, content: p.content }))
    );
    await supabase.from("projects").update({ status: "ready" }).eq("id", project.id);

    return NextResponse.json({ projectId: project.id, customScreens: customScreens.length });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Generation failed.";
    console.error("[/api/ai/generate]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
