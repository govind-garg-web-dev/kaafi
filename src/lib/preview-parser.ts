// Extracts preview-relevant data from generated project files
// Used to render an accurate dynamic preview without running the code

export type PreviewData = {
  appName: string;
  primaryColor: string;
  templateType: string;
  items: { id: string; title: string; subtitle: string; emoji: string; meta: string }[];
  ctaLabel: string;
  searchPlaceholder: string;
  headerTitle: string;
};

const FALLBACK: PreviewData = {
  appName: "My App",
  primaryColor: "#7c5cfc",
  templateType: "auth-feed",
  items: [
    { id: "1", title: "Item One",   subtitle: "Description here",   emoji: "⭐", meta: "Details" },
    { id: "2", title: "Item Two",   subtitle: "Another description", emoji: "🎯", meta: "Details" },
    { id: "3", title: "Item Three", subtitle: "More details",        emoji: "🚀", meta: "Details" },
  ],
  ctaLabel: "View",
  searchPlaceholder: "Search…",
  headerTitle: "Home",
};

export function parsePreviewData(
  files: { path: string; content: string }[],
  templateType: string
): PreviewData {
  const get = (path: string) => files.find((f) => f.path === path)?.content ?? "";

  // App name from app.json
  let appName = FALLBACK.appName;
  try {
    const appJson = JSON.parse(get("app.json"));
    appName = appJson?.expo?.name ?? appName;
  } catch { /* use fallback */ }

  // Primary color from tailwind.config.js
  let primaryColor = FALLBACK.primaryColor;
  const twContent = get("tailwind.config.js");
  const colorMatch = twContent.match(/primary:\s*["']([^"']+)["']/);
  if (colorMatch) primaryColor = colorMatch[1];

  // Items from data/seed.ts
  const seedContent = get("data/seed.ts");
  const items = parseSeedItems(seedContent);

  const indexContent = get("app/(tabs)/index.tsx");

  // Header title — match any font-bold Text across all scaffold sizes (xl, 2xl, 3xl)
  let headerTitle = FALLBACK.headerTitle;
  const headerMatch = indexContent.match(/text-(?:xl|2xl|3xl) font-bold[^"]*"[^>]*>\s*([^<\n]{2,40})\s*<\/Text>/);
  if (headerMatch?.[1] && !headerMatch[1].includes("KAAFI")) headerTitle = headerMatch[1].trim();

  // Search placeholder — specifically target the search TextInput (className contains flex-1,
  // not bg-gray-50 which is used by auth inputs like email/password)
  let searchPlaceholder = FALLBACK.searchPlaceholder;
  const searchMatch = indexContent.match(/placeholder=["']([^"']{3,60})["'][^>]*className=["'][^"']*flex-1|className=["'][^"']*flex-1[^"']*["'][^>]*placeholder=["']([^"']{3,60})["']/);
  if (searchMatch) {
    const val = (searchMatch[1] ?? searchMatch[2] ?? "").trim();
    if (val && !val.includes("KAAFI")) searchPlaceholder = val;
  }
  // Fallback: any placeholder that isn't an email/password hint
  if (searchPlaceholder === FALLBACK.searchPlaceholder) {
    const allPlaceholders = [...indexContent.matchAll(/placeholder=["']([^"']{3,60})["']/g)];
    for (const m of allPlaceholders) {
      const val = m[1];
      if (!val.includes("KAAFI") && !val.includes("@") && !val.includes("••") && val.length > 3) {
        searchPlaceholder = val;
        break;
      }
    }
  }

  // CTA label — Text inside a TouchableOpacity (white text with font-semibold)
  let ctaLabel = FALLBACK.ctaLabel;
  const ctaMatch = indexContent.match(/<Text className="text-white[^"]*font-semibold[^"]*">\s*([^<\n]{1,20})\s*<\/Text>/);
  if (ctaMatch?.[1] && !ctaMatch[1].includes("KAAFI")) ctaLabel = ctaMatch[1].trim();
  // Broader fallback
  if (ctaLabel === FALLBACK.ctaLabel) {
    const ctaFallback = indexContent.match(/<Text[^>]*>\s*([A-Za-z]{2,15})\s*<\/Text>\s*<\/TouchableOpacity>/);
    if (ctaFallback?.[1] && !ctaFallback[1].includes("KAAFI")) ctaLabel = ctaFallback[1].trim();
  }

  return {
    appName,
    primaryColor,
    templateType,
    items: items.length > 0 ? items : FALLBACK.items,
    ctaLabel,
    searchPlaceholder,
    headerTitle,
  };
}

function parseSeedItems(seed: string) {
  const pattern = /\{\s*id:\s*["'](\d+)["'][\s\S]*?(?:title|name):\s*["']([^"']+)["'][\s\S]*?(?:subtitle|description):\s*["']([^"']+)["'][\s\S]*?emoji:\s*["']([^"']+)["'][\s\S]*?(?:meta|price|rating):\s*["']([^"']+)["'][\s\S]*?\}/g;
  const items: PreviewData["items"] = [];
  let match;
  while ((match = pattern.exec(seed)) !== null && items.length < 5) {
    const [, id, title, subtitle, emoji, meta] = match;
    if (title && !title.includes("KAAFI_SLOT")) {
      items.push({ id, title, subtitle: subtitle ?? "", emoji: emoji ?? "⭐", meta: meta ?? "" });
    }
  }
  return items;
}
