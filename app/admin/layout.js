import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/connexion");
  }

  // Vérifie si l'utilisateur est dans la table admins
  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // Si on est dans la table OU si l'email est l'email admin par défaut
  const isAdmin = adminRow || user.email === "admin@istmboma.cd";

  if (!isAdmin) {
    redirect("/tableau-de-bord");
  }

  return <>{children}</>;
}