import { AUTH_FEED_SCAFFOLD } from "./auth-feed";
import { AUTH_MAP_SCAFFOLD } from "./auth-map";
import { AUTH_BOOKING_SCAFFOLD } from "./auth-booking";
import { AUTH_ECOMMERCE_SCAFFOLD } from "./auth-ecommerce";
import { AUTH_CHAT_SCAFFOLD } from "./auth-chat";

export type ScaffoldType = "auth-feed" | "auth-map" | "auth-booking" | "auth-ecommerce" | "auth-chat";

export const SCAFFOLDS: Record<ScaffoldType, Record<string, string>> = {
  "auth-feed":       AUTH_FEED_SCAFFOLD,
  "auth-map":        AUTH_MAP_SCAFFOLD,
  "auth-booking":    AUTH_BOOKING_SCAFFOLD,
  "auth-ecommerce":  AUTH_ECOMMERCE_SCAFFOLD,
  "auth-chat":       AUTH_CHAT_SCAFFOLD,
};

// Keyword-based heuristic — picks the best scaffold before AI generation
export function selectTemplate(idea: string, answers: Record<string, string>): ScaffoldType {
  const text = (idea + " " + Object.values(answers).join(" ")).toLowerCase();

  const signals: Record<ScaffoldType, string[]> = {
    "auth-map": [
      "map", "location", "nearby", "gps", "driver", "rider",
      "uber", "pickup", "drop", "navigate", "live location",
      "real-time location", "find near", "walkers near", "nearest"
    ],
    "auth-booking": [
      "book", "booking", "appointment", "schedule", "salon", "doctor",
      "tutor", "clinic", "slot", "calendar", "reservation", "consultation",
      "stylist", "barber", "dentist", "therapist"
    ],
    "auth-ecommerce": [
      "shop", "store", "buy", "sell", "product", "cart", "order",
      "marketplace", "ecommerce", "price", "catalog", "kirana",
      "inventory", "stock", "retail", "expense", "finance", "money",
      "budget", "spend", "purchase", "spending", "tracker"
    ],
    "auth-chat": [
      "chat", "message", "messaging", "community", "group", "forum",
      "talk", "conversation", "support", "inbox", "discussion", "social"
    ],
    "auth-feed": [
      "delivery", "tiffin", "meal", "food", "subscription", "feed",
      "news", "blog", "content", "post", "list", "track", "daily"
    ],
  };

  const scores: Record<ScaffoldType, number> = {
    "auth-feed": 0,
    "auth-map": 0,
    "auth-booking": 0,
    "auth-ecommerce": 0,
    "auth-chat": 0,
  };

  for (const [type, keywords] of Object.entries(signals) as [ScaffoldType, string[]][]) {
    for (const kw of keywords) {
      if (text.includes(kw)) scores[type]++;
    }
  }

  const best = (Object.entries(scores) as [ScaffoldType, number][])
    .sort(([, a], [, b]) => b - a)[0];

  // Fall back to auth-feed if no clear signal
  return best[1] > 0 ? best[0] : "auth-feed";
}
