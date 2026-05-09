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

  // CTA label from index screen
  let ctaLabel = FALLBACK.ctaLabel;
  const indexContent = get("app/(tabs)/index.tsx");
  const ctaMatch = indexContent.match(/KAAFI_SLOT_CTA_LABEL["']?\s*\}|["']([^"']{1,20})["']\s*<\/Text>\s*<\/TouchableOpacity>/);
  if (ctaMatch?.[1]) ctaLabel = ctaMatch[1];
  // Also try direct extraction from rendered code
  const ctaDirect = indexContent.match(/<Text[^>]*>\s*([A-Za-z ]{2,15})\s*<\/Text>\s*<\/TouchableOpacity>/);
  if (ctaDirect?.[1] && !ctaDirect[1].includes("KAAFI")) ctaLabel = ctaDirect[1].trim();

  // Header title
  let headerTitle = FALLBACK.headerTitle;
  const headerMatch = indexContent.match(/text-xl font-bold[^>]*>\s*([^<\n]{2,30})\s*<\/Text>/);
  if (headerMatch?.[1] && !headerMatch[1].includes("KAAFI")) headerTitle = headerMatch[1].trim();

  // Search placeholder
  let searchPlaceholder = FALLBACK.searchPlaceholder;
  const searchMatch = indexContent.match(/placeholder=["']([^"']{3,40})["']/);
  if (searchMatch?.[1] && !searchMatch[1].includes("KAAFI")) searchPlaceholder = searchMatch[1];

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
  // Match: { id: "1", title/name: "...", subtitle/description: "...", emoji: "...", ...meta/price/rating: "..." }
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
