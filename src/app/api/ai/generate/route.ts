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

// ── Full app generation (primary approach) ────────────────
// Claude acts as a senior developer and writes the ENTIRE app from scratch.
// No templates. No slot-filling. Complete custom code based on all 18 answers.

const FULL_APP_SYSTEM_PROMPT = `You are a senior React Native developer and UI/UX designer at a world-class mobile studio. You are building a complete, production-quality mobile app from scratch.

TECH STACK — use EXACTLY these:
• Expo SDK ~52.0.0 (managed workflow)
• TypeScript strict mode throughout
• Expo Router v4 (file-based routing with route groups)
• NativeWind v4 (Tailwind via className prop on all RN components)
• Zustand v5: import { create } from "zustand"
• Icons: import { Ionicons } from "@expo/vector-icons"
• Gradients: import { LinearGradient } from "expo-linear-gradient"

REQUIRED FILE STRUCTURE (generate ALL of these):
• app.json — Expo config with name, slug, splash color
• package.json — correct dependencies
• tailwind.config.js — with extend.colors.primary set to chosen color
• babel.config.js — NativeWind + Expo preset
• app/_layout.tsx — root Stack layout
• app/(auth)/_layout.tsx — auth Stack
• app/(auth)/login.tsx — login screen (auth method from user choice)
• app/(tabs)/_layout.tsx — bottom Tabs with icons + colors
• app/(tabs)/index.tsx — main home screen
• app/(tabs)/[second-tab-name].tsx — second tab screen (based on app type)
• app/(tabs)/profile.tsx — profile screen
• constants/theme.ts — COLORS object with primary, background, card, text, etc.
• types/index.ts — TypeScript interfaces for all data models
• store/[appName]Store.ts — Zustand store with relevant state
• data/seed.ts — realistic, app-specific sample data (minimum 8 items)
• components/Card.tsx — reusable card component used in list screens

DESIGN RULES — mandatory for every screen:
1. Page background: bg-slate-50
2. Cards: bg-white rounded-3xl shadow-md p-5, gap-5 between cards
3. Headers: pt-14 minimum, text-3xl font-bold text-gray-900, descriptive subtitle text-sm text-gray-400
4. Primary color: ONLY via style={{ backgroundColor: COLORS.primary }} or color: COLORS.primary — NEVER hardcoded hex strings in JSX
5. Bottom safe area: pb-28 on all scroll content (tab bar overlap)
6. Search bars: bg-white rounded-2xl border border-slate-200 px-4 py-3 flex-row items-center gap-3 shadow-sm
7. Primary CTA buttons: rounded-2xl py-4 items-center with style={{ backgroundColor: COLORS.primary }}
8. Use LinearGradient for: header hero sections, feature highlight cards, premium banners
9. Every card: emoji or icon in a rounded-2xl colored box (COLORS.primary + "18"), title bold, subtitle gray, meta in primary color, CTA button
10. Tab bar: backgroundColor white, borderTopColor slate-100, activeTintColor COLORS.primary

COMPLEXITY REQUIREMENTS:
• Minimum 5 main files of actual UI code
• Every screen must have real, working interactions (button presses, navigation)
• Sample data must be 100% specific to the exact app idea — never "Item 1" or "Product Name"
• The app must feel like a REAL published app, not a demo

OUTPUT FORMAT — return ONLY a valid JSON array, no markdown, no explanation:
[
  {"path": "app.json", "content": "..."},
  {"path": "package.json", "content": "..."},
  ...all other files...
]`;

async function generateFullApp(
  idea: string,
  questions: { id: string; question: string; options: { id: string; label: string }[] }[],
  answers: Record<string, string>,
  model: string,
): Promise<{ path: string; content: string }[]> {
  // Format all 18 answers clearly
  const allAnswers = questions.map((q) => {
    const opt = q.options.find((o) => o.id === answers[q.id]);
    return `• ${q.question}\n  → ${opt?.label ?? "(not answered)"}`;
  }).join("\n\n");

  const userPrompt = `Build a complete React Native + Expo app for the following idea:

"${idea}"

═══════════════════════════════════════
THE USER'S 18 REQUIREMENTS
Every single answer below must be DIRECTLY REFLECTED in the generated code.
═══════════════════════════════════════

${allAnswers}

═══════════════════════════════════════
IMPLEMENTATION GUIDE — read carefully
═══════════════════════════════════════

AUTHENTICATION (implement exactly what was chosen):
• "Email only" → standard email + password login with validation
• "Google / Apple" → social sign-in buttons using logo-google / logo-apple Ionicons, skip password
• "Phone / OTP" → phone number input → "Send Code" button → OTP input screen
• "No login required" → single "Get Started" button going straight to /(tabs), no auth screens needed
• Show the app's icon (choose an appropriate Ionicons name), app name, and a welcoming tagline

CORE FEATURES (the two main features chosen → build actual screens for them):
• Each feature gets either its own tab or a dedicated section on the home screen
• If "Real-time tracking" → add a "● Live" green badge on relevant cards
• If "Map / Location" → include location distance (e.g., "0.3 km away") on cards
• If "Calendar / Booking" → show date/time slots in the feature screen
• If "Chat / Messaging" → show conversation list with last message preview
• If "Media / Photos" → show grid layout with image placeholders (emoji as stand-in)
• If "Analytics / Dashboard" → show stat cards with numbers and trend icons

SOCIAL FEATURES (add to content cards):
• "Likes + Comments" → ❤️ [count] and 💬 [count] row beneath each card
• "Reviews + Ratings" → ⭐ rating (e.g., "4.8") + review count on cards
• "Share" → share icon in card top-right
• "None" → clean cards without social elements

NOTIFICATIONS:
• "Yes/Push" → bell icon (notifications-outline) with a red badge dot in the top-right header area
• "No" → clean header

MONETIZATION (visible in profile screen):
• "Subscription / Freemium" → a premium upgrade card (LinearGradient background) showing 3 benefits + "Upgrade Now" button
• "Commission-based" → an earnings stats card: "This Month: ₹2,400" with a trend arrow
• "In-app purchases" → "Coins: 250" balance display in profile header
• "Free" → clean profile without monetization UI

FIRST SCREEN AFTER LOGIN (reorder the Tabs accordingly):
• The tab matching this choice must be index 0 in the Tabs navigator

DEVICE FEATURES:
• "Camera" → camera icon button (camera-outline) in the relevant screen header
• "GPS / Location" → show "📍 [distance] away" on each card
• "Push notifications" → handled via the notifications choice above

OFFLINE MODE:
• "Yes" → show a subtle "● Synced" or "○ Offline" badge somewhere visible
• "No" → ignore

═══════════════════════════════════════
CONTENT & SAMPLE DATA
═══════════════════════════════════════

Generate 8-10 ultra-realistic sample data items specific to this EXACT app idea.
Each item should look like REAL data a real user would see.

WRONG: { title: "Item 1", subtitle: "Description", meta: "Detail" }
RIGHT (expense tracker): { title: "Whole Foods · Groceries", amount: "₹1,840", emoji: "🛒", category: "Food", date: "Today" }
RIGHT (dog walkers): { name: "Sarah M.", rating: 4.9, walks: 142, price: "₹350/hr", emoji: "🐕", distance: "0.4 km" }
RIGHT (salon): { name: "Priya Sharma", specialty: "Hair & Makeup", rating: 4.8, price: "₹599", emoji: "💇", slots: "3 slots today" }

═══════════════════════════════════════
OUTPUT CHECKLIST
═══════════════════════════════════════

Before outputting, verify:
✓ All 18 answers are reflected somewhere in the code
✓ Auth screen matches the chosen auth method
✓ Sample data is 100% specific to "${idea}" — not generic
✓ At least 3 tabs with real content
✓ Profile shows the chosen monetization UI
✓ Social features appear on content cards
✓ Primary color is consistent and beautiful
✓ Every screen has pt-14 and pb-28
✓ TypeScript types are defined and used

Now generate the complete app. Return ONLY the JSON array.`;

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 16000,
      system: FULL_APP_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    logAICost({
      model,
      action: "generate",
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonStart = raw.indexOf("[");
    const jsonEnd = raw.lastIndexOf("]");
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON array found");

    const files: { path: string; content: string }[] = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));

    // Validate: must have at least the main screen and config
    const hasMain = files.some((f) => f.path.includes("index.tsx"));
    const hasConfig = files.some((f) => f.path === "app.json");
    if (!hasMain || !hasConfig) throw new Error("Generated files missing critical screens");

    // Filter out any empty or suspiciously short files
    return files.filter((f) => f.path && f.content && f.content.length > 50);

  } catch (err) {
    console.warn("[generate] Full app generation failed:", err instanceof Error ? err.message : err);
    return []; // caller will fall back to scaffold
  }
}

// ── Scaffold fallback (slot-fill approach) ────────────────
// Used when the full app generation fails. Keeps the service reliable.

function extractSlots(scaffold: Record<string, string>): string[] {
  const all = Object.values(scaffold).join("\n");
  const matches = all.match(/KAAFI_SLOT_[A-Z0-9_]+/g) ?? [];
  return [...new Set(matches)];
}

function applySlots(template: string, slots: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(slots)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

const SLOT_SYSTEM_PROMPT = `You are filling in values for a React Native app template. Return a flat JSON object mapping slot names to values. Return ONLY valid JSON. No markdown.`;

function buildSlotPrompt(
  idea: string,
  answers: Record<string, string>,
  questions: { id: string; question: string; options: { id: string; label: string }[] }[],
  slots: string[]
): string {
  const answerLines = questions
    .map((q) => { const opt = q.options.find((o) => o.id === answers[q.id]); return `- ${q.question}: ${opt?.label ?? "(skipped)"}`; })
    .join("\n");
  return `App: "${idea}"\nUser choices:\n${answerLines}\n\nFill these slots with specific, realistic values for this exact app:\n${slots.join("\n")}\n\nRules: APP_NAME=catchy 2-3 words, PRIMARY_COLOR=distinctive hex matching app type (not always purple), ITEM titles/subtitles/emojis/meta=ultra-realistic for this specific app.\n\nReturn ONLY the JSON object.`;
}

// ── Main handler ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { idea, answers, questions, premium = false } = await req.json();
    if (!idea || !answers) {
      return NextResponse.json({ error: "Missing idea or answers." }, { status: 400 });
    }

    const model      = premium ? PREMIUM_MODEL : STANDARD_MODEL;
    const creditCost = premium ? PREMIUM_COST  : STANDARD_COST;

    const { data: profile } = await supabase
      .from("profiles")
      .select("credits_balance, plan")
      .eq("id", user.id)
      .single();

    if (!profile || profile.credits_balance < creditCost) {
      return NextResponse.json({ error: "Not enough credits. Please top up." }, { status: 402 });
    }

    // Resolve answers for template selector (fallback only)
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
    await supabase.from("credit_transactions").insert({ user_id: user.id, delta: -creditCost, reason: premium ? "Premium app generation (Opus)" : "App generation" });

    // Create project record
    const projectName = idea.length > 50 ? idea.slice(0, 50) + "…" : idea;
    const scaffoldType = selectTemplate(idea, resolvedAnswers); // used for fallback + project meta
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name: projectName, prompt: idea, mcq_answers: answers, status: "generating", scaffold_type: scaffoldType })
      .select().single();

    if (projectError || !project) throw new Error("Failed to create project");

    // ── PRIMARY: Full app generation ──────────────────────
    // Claude acts as a senior developer, writes the complete app from scratch.
    let patches = await generateFullApp(idea, questions ?? [], answers, model);
    let usedFullGen = patches.length > 0;

    // ── FALLBACK: Scaffold + slot-fill ────────────────────
    // If full generation failed, fall back to the template approach so the
    // user always gets something working.
    if (!usedFullGen) {
      console.warn("[generate] Falling back to scaffold for project", project.id);
      const scaffold = SCAFFOLDS[scaffoldType];
      const slots = extractSlots(scaffold);
      const slotPrompt = buildSlotPrompt(idea, answers, questions ?? [], slots);

      let slotValues: Record<string, string>;
      try {
        const msg = await client.messages.create({
          model: STANDARD_MODEL, // always use Sonnet for slot-fill fallback
          max_tokens: 2048,
          system: SLOT_SYSTEM_PROMPT,
          messages: [{ role: "user", content: slotPrompt }],
        });
        const raw = msg.content[0].type === "text" ? msg.content[0].text : "{}";
        const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        slotValues = JSON.parse(cleaned);
      } catch {
        // If even slot-fill fails, refund and error
        await supabase.from("profiles").update({ credits_balance: profile.credits_balance }).eq("id", user.id);
        await supabase.from("credit_transactions").insert({ user_id: user.id, delta: creditCost, reason: "Generation failed — credits refunded", project_id: project.id });
        await supabase.from("projects").update({ status: "error" }).eq("id", project.id);
        return NextResponse.json({ error: "Generation failed. Your credits have been refunded." }, { status: 500 });
      }

      patches = Object.entries(scaffold).map(([path, template]) => ({
        path,
        content: applySlots(template, slotValues),
      }));
    }

    // Save all generated files
    await supabase.from("project_files").insert(
      patches.map((p) => ({ project_id: project.id, path: p.path, content: p.content }))
    );

    await supabase.from("projects").update({ status: "ready" }).eq("id", project.id);

    return NextResponse.json({ projectId: project.id, fullGen: usedFullGen });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Generation failed.";
    console.error("[/api/ai/generate]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
