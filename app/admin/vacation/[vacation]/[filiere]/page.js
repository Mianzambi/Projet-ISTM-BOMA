import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import { tousLesNiveaux } from "@/lib/filieres";

export default async function PromotionPage({ params }) {
  const { vacation, filiere } = await params;
  const filiereDecoded = decodeURIComponent(filiere);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: adminRow } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  const isAdmin = adminRow || user.email === "admin@istmboma.cd";
  if (!isAdmin) redirect("/tableau-de-bord");

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
          <a href="/admin">Accueil admin</a> ·{" "}
          <a href={`/admin/vacation/${vacation}`}>Vacation {vacation}</a> · {filiereDecoded}
        </div>

        <div className="admin-hub-box">
          <div className="admin-hub-title">
            PROMOTION
            <div style={{ fontWeight: 400, fontSize: "0.85rem", color: "var(--muted)", marginTop: 4 }}>
              {filiereDecoded} — Vacation {vacation}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {tousLesNiveaux.map((n) => (
              <a
                key={n}
                href={`/admin/vacation/${vacation}/${filiere}/${n}`}
                className={`admin-hub-btn ${n.startsWith("L") ? "blue" : "navy"}`}
              >
                {n}
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
