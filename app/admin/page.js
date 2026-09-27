import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const isAdmin = adminRow || user.email === "admin@istmboma.cd";
  
  if (!isAdmin) redirect("/tableau-de-bord");

  return (
    <div style={{ background: "var(--bg-soft)", minHeight: "100vh" }}>
      <header className="site-header scrolled sticky top-0 z-50">
        <div className="header-inner py-3">
          <div className="brand">
            <img src="/logo.jpg" alt="Logo ISTM" style={{ height: 32, width: "auto", borderRadius: 6, marginRight: 8 }} />
            Administration ISTM-BOMA
          </div>
          <div className="header-actions">
            <span className="text-sm text-slate-500 hidden sm:inline font-medium bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="wrap reveal-scale" style={{ paddingTop: 64, paddingBottom: 80 }}>
        <div className="admin-hub-box shadow-lg bg-white">
          <div className="admin-hub-title stagger">
            <span className="reveal inline-block">BIENVENUE AU TABLEAU DE BORD ADMINISTRATION</span>
            <br />
            <span className="reveal inline-block" style={{ color: "var(--blue)" }}>DE L'ISTM / BOMA</span>
          </div>

          <div className="admin-hub-grid stagger">
            <a href="/admin/vacation/Jour" className="admin-hub-btn blue reveal">
              Vacation Jour
            </a>
            <a href="/admin/vacation/Soir" className="admin-hub-btn navy reveal">
              Vacation Soir
            </a>
            <a href="/admin/inscriptions" className="admin-hub-btn reveal" style={{ background: 'linear-gradient(135deg, var(--teal), var(--emerald))' }}>
              Inscriptions en attente
            </a>
          </div>
          <div className="admin-hub-grid single stagger mt-4">
            <a href="/admin/frais" className="admin-hub-btn reveal" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
              Gestion des Frais Académiques
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
