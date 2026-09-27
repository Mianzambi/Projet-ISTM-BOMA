import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import FraisEditor from "@/components/FraisEditor";

export default async function FraisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: adminRow } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  const isAdmin = adminRow || user.email === "admin@istmboma.cd";
  if (!isAdmin) redirect("/tableau-de-bord");

  const { data: frais } = await supabase
    .from("frais_academiques")
    .select("*")
    .order("niveau", { ascending: true });

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <img src="/logo.jpg" alt="Logo ISTM" style={{ height: 32, width: "auto", borderRadius: 4, marginRight: 8 }} />
            Administration ISTM-BOMA
          </div>
          <div className="header-actions">
            <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="admin-breadcrumb">
          <a href="/admin">Accueil admin</a> · Frais académique
        </div>

        <div className="admin-hub-box">
          <div className="admin-hub-title">FRAIS ACADÉMIQUE</div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: -14, marginBottom: 20, textAlign: "center" }}>
            Ce montant s&apos;applique automatiquement à tous les étudiants du niveau concerné.
          </p>
          <FraisEditor initialFrais={frais || []} />
        </div>
      </main>
    </div>
  );
}
