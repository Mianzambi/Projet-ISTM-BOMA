import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import AdminCohortList from "@/components/AdminCohortList";

export default async function CohortPage({ params }) {
  const { vacation, filiere, niveau } = await params;
  const filiereDecoded = decodeURIComponent(filiere);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: adminRow } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  const isAdmin = adminRow || user.email === "admin@istmboma.cd";
  if (!isAdmin) redirect("/tableau-de-bord");

  const { data: inscriptions } = await supabase
    .from("inscriptions")
    .select("user_id")
    .eq("vacation", vacation)
    .eq("filiere", filiereDecoded)
    .eq("niveau", niveau);

  const userIds = (inscriptions || []).map((i) => i.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const students = (inscriptions || []).map((i) => ({
    user_id: i.user_id,
    full_name: profiles?.find((p) => p.id === i.user_id)?.full_name,
  }));

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
          <a href={`/admin/vacation/${vacation}`}>Vacation {vacation}</a> ·{" "}
          <a href={`/admin/vacation/${vacation}/${filiere}`}>{filiereDecoded}</a> · {niveau}
        </div>

        <div className="admin-hub-box">
          <div
            className="admin-hub-title"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}
          >
            <span>
              {niveau} {filiereDecoded}
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--muted)" }}>
              {students.length} étudiant{students.length > 1 ? "s" : ""}
            </span>
          </div>

          <AdminCohortList students={students} />
        </div>
      </main>
    </div>
  );
}
