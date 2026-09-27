import { createBrowserClient } from "@supabase/ssr";

// Client utilisé dans les composants "use client" (formulaires, boutons, etc.)
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nnafbdarhqjzuekmqwqx.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-key";

  return createBrowserClient(url, key);
}
