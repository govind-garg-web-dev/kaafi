import { createBrowserClient } from "@supabase/ssr";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const url = rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const key = rawKey.length > 10 ? rawKey : "placeholder-anon-key";
  return createBrowserClient<any>(url, key);
}
