import { createClient } from "@supabase/supabase-js";
import { calcCost } from "@/lib/posthog";

// Fire-and-forget cost logger — never throws, never blocks the response
export function logAICost(opts: {
  userId?: string | null;
  model: string;
  action: "mcq" | "generate" | "edit" | "classify";
  inputTokens: number;
  outputTokens: number;
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  const costUsd = calcCost(opts.model, opts.inputTokens, opts.outputTokens);

  // Intentionally not awaited — log in background, don't delay response
  const supabase = createClient(url, key);
  supabase.from("ai_cost_log").insert({
    user_id: opts.userId ?? null,
    model: opts.model,
    action: opts.action,
    input_tokens: opts.inputTokens,
    output_tokens: opts.outputTokens,
    cost_usd: costUsd,
  }).then(({ error }) => {
    if (error) console.warn("[logAICost]", error.message);
  });
}
