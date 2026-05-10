import { PostHog } from "posthog-node";

// Server-side PostHog client — used in API routes to track server events
let _client: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null;
  if (!_client) {
    _client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      flushAt: 1,   // flush immediately in serverless
      flushInterval: 0,
    });
  }
  return _client;
}

// Cost per token in USD
export const TOKEN_COST = {
  "claude-haiku-4-5-20251001": { input: 0.000001,  output: 0.000005  },
  "claude-sonnet-4-6":         { input: 0.000003,  output: 0.000015  },
  "claude-opus-4-7":           { input: 0.000005,  output: 0.000025  },
} as const;

export function calcCost(model: string, inputTokens: number, outputTokens: number): number {
  const rates = TOKEN_COST[model as keyof typeof TOKEN_COST] ?? { input: 0, output: 0 };
  return inputTokens * rates.input + outputTokens * rates.output;
}
