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

const SYSTEM_PROMPT = `You are Kaafi's app content and design generator. You fill in values for a React Native app template. Think like a senior product designer, not a developer filling blanks.

Your output determines how professional and distinctive the app feels. Be specific, creative, and on-brand.

Return ONLY valid JSON. No markdown. No explanation.`;

// ── Design enhancement prompt ─────────────────────────────
// Used in a second pass to polish the main screen's visual design
const DESIGN_SYSTEM_PROMPT = `You are a senior React Native UI designer who has shipped dozens of 5-star apps on the App Store.

You will receive a React Native + NativeWind (Tailwind CSS) screen file. Your job is to make it look STUNNING — modern, polished, and premium — without changing any logic, state, imports, or data.

APPLY THESE SPECIFIC IMPROVEMENTS:

TYPOGRAPHY
- Main header: text-3xl font-bold tracking-tight (not text-2xl)
- Section titles: text-lg font-bold text-gray-900 mb-1
- Body text: text-sm leading-relaxed
- Meta/secondary: text-xs text-gray-400 font-medium
- Prices/highlights: font-bold + primary color via style prop

CARDS & LISTS
- Cards: rounded-2xl (never rounded-xl for cards), bg-white, no border, add shadow-sm
- Card padding: p-4 minimum (not p-3)
- Gap between cards: gap-4 (not gap-3)
- Image/emoji containers: h-32 or taller, rounded-2xl, use primaryColor + "15" for background
- List items: generous vertical padding py-4

HEADER AREA
- Safe area: always pt-14 for the top container (iPhone notch)
- Give headers more visual weight — bigger text, a short bold subtitle beneath
- Search bars: rounded-2xl (not rounded-xl), add border border-gray-200 bg-gray-50

BUTTONS & CTAs
- Primary buttons: rounded-xl py-3 px-5 font-semibold shadow-sm
- Icon buttons: minimum w-9 h-9, rounded-xl
- CTA inside cards: rounded-lg px-3 py-1.5 font-semibold text-xs

SPACING
- Horizontal scroll containers: px-5 (not px-4)
- Bottom of scroll content: pb-8 (leaves room above tab bar)
- Between major sections: mt-6 or gap-6

PRIMARY COLOR USAGE — use it richly, not just on one button:
- Category chip (first one selected): backgroundColor primaryColor, text white
- Icon containers: backgroundColor primaryColor + "12" or "18"
- Price/rating text: color primaryColor
- CTA buttons: backgroundColor primaryColor
- Badge/tag backgrounds: backgroundColor primaryColor + "15", text primaryColor

WHAT NOT TO CHANGE:
- All imports, state variables, props, functions
- All data references and logic
- File structure and exports

Return ONLY the improved file content. No markdown fences. No comments. No explanation.`;

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

User preferences:
${answerLines}

Fill EVERY slot. Return a flat JSON object. Think like a designer — every value should feel like it came from a real, polished app.

Slots to fill:
${slots.join("\n")}

RULES FOR EACH SLOT:

APP IDENTITY
- KAAFI_SLOT_APP_NAME: 2–3 words, catchy, memorable. NOT generic ("TrackIt", "ShopEasy"). Think real App Store names.
- KAAFI_SLOT_APP_SLUG: lowercase-hyphenated version
- KAAFI_SLOT_APP_DESCRIPTION: One confident sentence describing the value, like an App Store subtitle.
- KAAFI_SLOT_APP_ICON: Ionicons name that perfectly represents the app (not just "apps-outline"). Be specific.

COLOR — this is critical. Do NOT default to purple every time.
- KAAFI_SLOT_PRIMARY_COLOR: Choose a DISTINCTIVE color that fits the exact app type:
  · Food/restaurant/delivery → warm tones: #f97316 (orange), #ef4444 (red), #f59e0b (amber)
  · Finance/money/expense → trust tones: #2563eb (blue), #0d9488 (teal), #16a34a (green)
  · Health/fitness/wellness → fresh tones: #10b981 (emerald), #06b6d4 (cyan), #8b5cf6 (violet)
  · Social/community/chat → vibrant tones: #ec4899 (pink), #f97316 (orange), #6366f1 (indigo)
  · Marketplace/shopping → bold tones: #7c3aed (purple), #2563eb (blue), #dc2626 (red)
  · Services/booking/local → professional: #1e40af (navy), #0369a1 (dark blue), #065f46 (forest)
  · Pets → playful warm: #f59e0b, #fb923c, #10b981
  Pick a rich, saturated hex that a professional app designer would be proud of.
- KAAFI_SLOT_ACCENT_COLOR: A color that harmonizes — either analogous (nearby on color wheel) or complementary

TEXT & UX COPY
- KAAFI_SLOT_LOGIN_TAGLINE: Warm, brand-voice welcome. NOT "Sign in to continue". E.g. "Your walks, simplified." or "Good food, faster."
- KAAFI_SLOT_SIGNUP_TAGLINE: Excitement-building. E.g. "Join 10,000+ happy customers." or "Get started in 30 seconds."
- KAAFI_SLOT_GREETING: Warm, time-aware. Options: "Good morning", "Hey there", "Welcome back", "Ready to go?"
- KAAFI_SLOT_HEADER_TITLE: The bold statement at the top of the home screen. NOT the app name. E.g. "What's for dinner?", "Today's walks", "Track your spend"
- KAAFI_SLOT_SEARCH_PLACEHOLDER: Contextual and specific. NOT "Search...". E.g. "Search restaurants near you", "Find a dog walker", "Search expenses..."

NAVIGATION
- KAAFI_SLOT_TAB1_LABEL, TAB1_ICON: Primary tab name + Ionicons icon (e.g. home-outline, storefront-outline, map-outline)
- KAAFI_SLOT_TAB2_LABEL, TAB2_ICON: Discovery tab + icon (e.g. search-outline, compass-outline, grid-outline)
- KAAFI_SLOT_EXPLORE_SUBTITLE: 1 line below the explore header. E.g. "Find top-rated walkers in your area"
- KAAFI_SLOT_EXPLORE_EMPTY_STATE: Friendly, helpful empty state message. E.g. "No results yet — try a different search"

CATEGORIES (KAAFI_SLOT_CAT1–CAT4)
- 4 short, specific category labels relevant to THIS exact app. NOT "All, Popular, New, Featured".
  E.g. for a food app: "Breakfast", "Lunch", "Dinner", "Snacks"
  E.g. for a services app: "Cleaning", "Plumbing", "Electrical", "Moving"

PROFILE
- KAAFI_SLOT_PROFILE_NAME: A realistic first + last name (appropriate for the target market)
- KAAFI_SLOT_PROFILE_META: Something contextual, e.g. "Member since March 2024", "Gold Member · 47 orders"
- KAAFI_SLOT_MENU1/2/3 + MENU1_ICON/MENU2_ICON/MENU3_ICON: 3 profile menu items that make sense for this app
  (e.g. "My Orders" / receipt-outline, "Saved Addresses" / location-outline, "Payment Methods" / card-outline)

SAMPLE DATA — MOST IMPORTANT. Make it ultra-realistic for this specific app.
- KAAFI_SLOT_ITEM1 through ITEM5 each have: _TITLE, _SUBTITLE, _EMOJI, _META
- _TITLE: A specific, real-world item name. NOT "Item 1" or "Sample Product".
  For expense tracker: "Whole Foods Run", "Netflix · Spotify", "Electricity Bill"
  For dog walkers: "Bruno's Morning Walk", "Bella's Park Run", "Max's Afternoon Stroll"
  For restaurant: "Chicken Tikka Masala", "Veg Hakka Noodles", "Butter Garlic Prawns"
- _SUBTITLE: Descriptive, specific context for this item
- _EMOJI: The most fitting single emoji for the item
- _META: Key metric shown on the card (price, rating, time, distance — whatever makes sense)

- KAAFI_SLOT_FEED_TITLE: Section heading on the home screen. E.g. "Popular near you", "Recent transactions", "Today's specials"
- KAAFI_SLOT_FEED_ITEM_TYPE: What each card represents (e.g. "restaurant", "walker", "expense", "product")
- KAAFI_SLOT_CTA_LABEL: The button inside each card. 1–2 words. E.g. "Book", "Order", "View", "Hire", "Track"

Return ONLY the JSON object. Make every value feel like it came from a real, live app.`;
}

// ── Custom screen generation ──────────────────────────────
// Writes complete, custom React Native screens using ALL 18 user answers.
// This REPLACES the slot-fill approach for the main UI screens.
// Slot values are still used for branding (color, name, items) and boilerplate.

const SCREEN_GEN_SYSTEM_PROMPT = `You are an expert React Native developer building a beautiful, production-quality mobile app.

The user has answered 18 questions about their app. You must write COMPLETE, CUSTOM React Native screens that reflect EVERY answer.

TECH STACK — use exactly these:
- React Native: View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, SafeAreaView, Alert, KeyboardAvoidingView, Platform
- Expo Router: import { router } from "expo-router"
- Icons: import { Ionicons } from "@expo/vector-icons"
- React: useState, useEffect
- NativeWind: className prop for ALL styling. Use style prop ONLY for dynamic values (primaryColor).

DESIGN RULES — every screen must look like a 5-star App Store app:
- Page background: className="flex-1 bg-gray-50"
- Header: pt-14 (safe area), bold large title (text-3xl font-bold text-gray-900), subtitle below
- Cards: bg-white rounded-2xl shadow-sm p-4, gap-4 between cards in the list
- Primary color usage: ALWAYS via style={{ backgroundColor: PRIMARY }} or style={{ color: PRIMARY }} — never as a className
- Search bar: bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 flex-row items-center gap-2
- Primary button: py-4 rounded-xl items-center + style={{ backgroundColor: PRIMARY }} + text-white font-semibold
- Bottom scroll padding: pb-24 so content isn't hidden behind tab bar
- Section headers: text-lg font-bold text-gray-900 mb-3

OUTPUT FORMAT — JSON array ONLY, no markdown, no explanation:
[
  {"path": "app/(auth)/login.tsx", "content": "...complete file..."},
  {"path": "app/(tabs)/index.tsx", "content": "...complete file..."},
  {"path": "app/(tabs)/profile.tsx", "content": "...complete file..."}
]`;

async function generateCustomScreens(
  idea: string,
  questions: { id: string; question: string; options: { id: string; label: string }[] }[],
  answers: Record<string, string>,
  slotValues: Record<string, string>,
  model: string,
): Promise<{ path: string; content: string }[]> {
  try {
    const PRIMARY = slotValues.KAAFI_SLOT_PRIMARY_COLOR ?? "#7c5cfc";
    const APP_NAME = slotValues.KAAFI_SLOT_APP_NAME ?? "My App";
    const APP_ICON = slotValues.KAAFI_SLOT_APP_ICON ?? "apps-outline";
    const LOGIN_TAGLINE = slotValues.KAAFI_SLOT_LOGIN_TAGLINE ?? "Welcome back";
    const SIGNUP_TAGLINE = slotValues.KAAFI_SLOT_SIGNUP_TAGLINE ?? "Create your account";
    const HEADER_TITLE = slotValues.KAAFI_SLOT_HEADER_TITLE ?? "Home";
    const SEARCH_PLACEHOLDER = slotValues.KAAFI_SLOT_SEARCH_PLACEHOLDER ?? "Search...";
    const CTA_LABEL = slotValues.KAAFI_SLOT_CTA_LABEL ?? "View";
    const GREETING = slotValues.KAAFI_SLOT_GREETING ?? "Hey there";

    // Build sample data string from slot values
    const sampleItems = [1, 2, 3, 4, 5].map((n) => {
      const title    = slotValues[`KAAFI_SLOT_ITEM${n}_TITLE`]    ?? `Item ${n}`;
      const subtitle = slotValues[`KAAFI_SLOT_ITEM${n}_SUBTITLE`] ?? "";
      const emoji    = slotValues[`KAAFI_SLOT_ITEM${n}_EMOJI`]    ?? "⭐";
      const meta     = slotValues[`KAAFI_SLOT_ITEM${n}_META`]     ?? "";
      return `  { id: "${n}", title: "${title}", subtitle: "${subtitle}", emoji: "${emoji}", meta: "${meta}" }`;
    }).join(",\n");

    // ALL 18 answers in plain English
    const allAnswers = questions.map((q) => {
      const opt = q.options.find((o) => o.id === answers[q.id]);
      return `• ${q.question}: ${opt?.label ?? "(not answered)"}`;
    }).join("\n");

    const userPrompt = `Build a React Native app for: "${idea}"

APP BRANDING:
- Name: ${APP_NAME}
- Primary color (hex): ${PRIMARY}
- Icon: ${APP_ICON} (from Ionicons)
- Login tagline: "${LOGIN_TAGLINE}"
- Signup tagline: "${SIGNUP_TAGLINE}"
- Header title: "${HEADER_TITLE}"
- Search placeholder: "${SEARCH_PLACEHOLDER}"
- CTA button label: "${CTA_LABEL}"
- Greeting: "${GREETING}"

ALL 18 USER REQUIREMENTS — implement EVERY one:
${allAnswers}

SAMPLE DATA (use exactly these in the home screen cards):
[
${sampleItems}
]
const PRIMARY = "${PRIMARY}"; // use this variable for all primary color styling

---

Write these 3 complete screen files. Each must be specific to "${idea}", not generic.

### SCREEN 1: app/(auth)/login.tsx
Look at the "sign-in method" answer above and implement accordingly:
- "Email only" → email + password TextInput fields, sign in button
- "Google / Apple" → a "Continue with Google" button with logo-google icon + separate "Continue with Apple"
- "Phone / OTP" → phone number TextInput + "Send OTP" button (no password)
- "No login / Guest" → single "Explore ${APP_NAME}" button that goes to /(tabs)
Show: Ionicons icon (${APP_ICON}) in a primary color rounded square, app name (${APP_NAME}), tagline.
Login button goes to router.replace("/(tabs)"), signup link goes to router.push("/(auth)/signup")

### SCREEN 2: app/(tabs)/index.tsx
This is the MOST IMPORTANT screen — make it completely reflect the app idea and user choices.
- Header shows: greeting "${GREETING}", bold title "${HEADER_TITLE}", search bar
- If notifications chosen: bell icon with a red dot (•) in the header right
- Category filter row: horizontal scroll, 4 chip buttons for the app's categories
- Main list: cards using the SAMPLE DATA above
- Each card must show: emoji icon, title, subtitle, meta, and a CTA button ("${CTA_LABEL}")
- If "Likes / Comments" chosen in social: add ❤️ icon + count and 💬 icon + count below each card
- If "Ratings / Reviews" chosen: add ⭐ rating + count to each card
- If "Real-time tracking" chosen: add a green "● Live" badge to relevant cards
- Make the card content and UI SPECIFIC to this exact app — not generic shopping cards

### SCREEN 3: app/(tabs)/profile.tsx
- Large avatar circle (primary color bg) with user emoji 👤
- Name and member meta text
- Look at monetization answer:
  - "Subscription / Freemium" → show a highlighted "⭐ Go Premium" card with 2-3 bullet benefits before the menu
  - "Commission-based" → show an "Earnings This Month: ₹2,400" stats card
  - "Free" or other → skip special monetization card
- Profile menu list with app-appropriate items (use 3 relevant menu items for this app type)
- Red "Sign out" button at the bottom

Return ONLY the JSON array. No markdown. No explanation.`;

    const response = await client.messages.create({
      model,
      max_tokens: 14000,
      system: SCREEN_GEN_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonStart = raw.indexOf("[");
    const jsonEnd = raw.lastIndexOf("]");
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON array in screen gen response");

    const screens: { path: string; content: string }[] = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    // Validate: only accept files that look like valid React Native
    return screens.filter(
      (s) => s.path && s.content && s.content.includes("export default") && s.content.includes("import")
    );
  } catch (err) {
    console.warn("[generate] Screen generation failed, falling back to scaffold:", err instanceof Error ? err.message : err);
    return []; // fall back to slot-filled scaffold
  }
}

// ── Feature implementation pass ──────────────────────────
// Uses the user's 18 MCQ answers to make real code changes.
// Answers about auth method, core features, social, monetization etc.
// are NOT reflected in slot values — they need actual code modifications.

const FEATURE_IMPL_SYSTEM_PROMPT = `You are an expert React Native developer implementing user-chosen features in an existing app.

The user answered specific questions about what they want. Your job is to make those choices VISIBLE in the code.

WHAT TO IMPLEMENT (examples):
- Auth: "Google Sign-in" → Replace email/password fields with a Google button (use Ionicons logo-google), keep email field for display only
- Auth: "Phone / OTP" → Replace email input with a phone number input and an "Send OTP" button
- Auth: "No login required" → Change the login screen to just a "Continue without signing in" button that goes to tabs
- Auth: "Email only" → Keep as-is (this is the default)
- Social: "Likes and comments" → Add a row with a heart icon (❤️ count) and comment icon (💬 count) at the bottom of each card
- Social: "Reviews and ratings" → Add star rating (⭐ 4.8) and review count to each card
- Notifications: "Push alerts" → Add a bell icon with a red dot badge (🔴) in the header right side
- Monetization: "Subscription / Freemium" → Add a "⭐ Go Premium" banner card in the profile screen
- Monetization: "Commission-based" → Add a "Your earnings: ₹2,400" card in the profile screen
- First screen: "Map" → In _layout.tsx, move the map/location tab to index position 0
- First screen: "Feed" → Default, keep as-is
- Core feature: "Real-time tracking" → Add a "Live" badge/indicator (green dot) to relevant cards
- Core feature: "Chat / Messaging" → Add a chat bubble icon button to each list item
- Core feature: "Reviews" → Add a star rating row to cards
- Core feature: "Booking calendar" → Add a date badge (📅) to cards showing availability
- Device features: "Camera" → Add a camera icon button (📷) in the appropriate screen header
- Device features: "GPS / Location" → Add location text (📍 0.3 km away) to each card

RULES:
- Return ONLY files that changed — skip unchanged files
- Return complete file content (not diffs)
- Preserve all existing imports, state, data, and logic that doesn't need to change
- Add new imports at the top if needed
- Keep the code compilable — use valid React Native + NativeWind syntax
- Make changes MINIMAL but VISIBLE — real UI elements, not just comments

Return format — JSON array only, no markdown:
[{"path": "app/...", "content": "... complete updated file ..."}]`;

// Categories whose answers need real code changes (not just text slots)
const CODE_IMPACTING_KEYWORDS = [
  "sign-in", "sign in", "login", "auth",
  "social", "comment", "like", "review", "rating",
  "notification", "push",
  "monetis", "monetiz", "subscription", "premium", "commission",
  "first screen", "firstscreen",
  "core feature", "main feature",
  "device", "camera", "gps", "location",
  "navigation", "tab",
  "offline",
  "chat", "message",
];

async function implementUserFeatures(
  idea: string,
  questions: { id: string; category: string; question: string; options: { id: string; label: string }[] }[],
  answers: Record<string, string>,
  patches: { path: string; content: string }[]
): Promise<{ path: string; content: string }[]> {
  try {
    // Pick only answers that need code changes
    const featureLines = questions
      .map((q) => {
        const opt = q.options.find((o) => o.id === answers[q.id]);
        if (!opt) return null;
        const text = `${q.question}: ${opt.label}`.toLowerCase();
        const needsCode = CODE_IMPACTING_KEYWORDS.some((kw) => text.includes(kw));
        return needsCode ? `- ${q.question}: ${opt.label}` : null;
      })
      .filter(Boolean);

    if (featureLines.length === 0) return [];

    // Send only the key screens — keeps tokens manageable
    const KEY_SCREENS = [
      "app/(tabs)/index.tsx",
      "app/(tabs)/_layout.tsx",
      "app/(tabs)/profile.tsx",
      "app/(auth)/login.tsx",
    ];
    const screenContext = patches
      .filter((p) => KEY_SCREENS.includes(p.path))
      .map((p) => `### ${p.path}\n${p.content}`)
      .join("\n\n---\n\n");

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 14000,
      system: FEATURE_IMPL_SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: `App idea: "${idea}"

USER CHOSE THESE FEATURES — implement them all:
${featureLines.join("\n")}

CURRENT SCREENS:
${screenContext}

Make the user's choices visible. Return the JSON array of changed files only.`,
      }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonStart = raw.indexOf("[");
    const jsonEnd = raw.lastIndexOf("]");
    if (jsonStart === -1 || jsonEnd === -1) return [];

    const featurePatches: { path: string; content: string }[] = JSON.parse(
      raw.slice(jsonStart, jsonEnd + 1)
    );

    // Validate each patch looks like real code before using it
    return featurePatches.filter(
      (p) => p.path && p.content && p.content.length > 100 && p.content.includes("export default")
    );
  } catch (err) {
    console.warn("[generate] Feature pass failed, skipping:", err instanceof Error ? err.message : err);
    return []; // never fail the whole generation
  }
}

// ── Design enhancement pass ───────────────────────────────
// Takes a completed main screen and makes it visually polished
async function enhanceMainScreen(
  fileContent: string,
): Promise<string> {
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 6000,
      system: DESIGN_SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: `Improve this React Native screen's visual design. Keep all logic and data intact:\n\n${fileContent}`,
      }],
    });
    const improved = response.content[0].type === "text" ? response.content[0].text.trim() : "";
    // Only use the improvement if it looks like valid React Native code
    if (improved.includes("import") && improved.includes("export default") && improved.length > 200) {
      return improved;
    }
    return fileContent; // fallback to original if AI output looks wrong
  } catch {
    return fileContent; // never fail the whole generation because of a design pass
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Parse body first so we know premium flag before checking credits
    const { idea, answers, questions, premium = false } = await req.json();
    if (!idea || !answers) {
      return NextResponse.json({ error: "Missing idea or answers." }, { status: 400 });
    }

    const model       = premium ? PREMIUM_MODEL : STANDARD_MODEL;
    const creditCost  = premium ? PREMIUM_COST  : STANDARD_COST;
    const maxTokens   = premium ? 4096 : 2048;

    const { data: profile } = await supabase
      .from("profiles")
      .select("credits_balance, plan")
      .eq("id", user.id)
      .single();

    if (!profile || profile.credits_balance < creditCost) {
      return NextResponse.json({ error: "Not enough credits. Please top up." }, { status: 402 });
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
      .update({ credits_balance: profile.credits_balance - creditCost })
      .eq("id", user.id);

    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      delta: -creditCost,
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
        model,
        max_tokens: maxTokens,
        system: systemMsg,
        messages: [{ role: "user", content: prompt }],
      });

      const raw = message.content[0].type === "text" ? message.content[0].text : "{}";
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      logAICost({
        userId: user?.id,
        model,
        action: "generate",
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      });
      return JSON.parse(cleaned);
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
          delta: creditCost,
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

    // Apply slots to scaffold — gives us boilerplate files (app.json, layouts, store, etc.)
    let patches = Object.entries(scaffold).map(([path, template]) => ({
      path,
      content: applySlots(template, slotValues),
    }));

    // Custom screen generation — writes complete, specific React Native screens
    // using ALL 18 user answers. This replaces the main UI screens in the scaffold
    // with AI-written code that actually reflects what the user chose.
    const customScreens = await generateCustomScreens(
      idea, questions ?? [], answers, slotValues, model
    );
    if (customScreens.length > 0) {
      const screenMap = new Map(customScreens.map((s) => [s.path, s.content]));
      patches = patches.map((p) =>
        screenMap.has(p.path) ? { ...p, content: screenMap.get(p.path)! } : p
      );
    }

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
