import { createBrowserClient } from "@supabase/ssr";

// ⚠️ Toujours importer createClient DEPUIS CE FICHIER pour parler à Supabase
// depuis un composant "use client" — jamais `createClient` depuis
// "@supabase/supabase-js" directement ailleurs dans le projet. Cet autre
// client stocke la session en localStorage au lieu des cookies, invisible
// pour proxy.js et les Server Components : ça a déjà causé un bug de
// connexion qui bouclait sans fin. (Si un autre outil IA régénère un
// fichier, rappelle-lui cette règle.)

// Client utilisé dans les composants "use client" (formulaires, boutons, etc.)
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-key";
  return createBrowserClient(url, key);
}
