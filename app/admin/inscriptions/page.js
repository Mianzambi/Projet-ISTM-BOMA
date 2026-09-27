import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DOCUMENTS } from "@/lib/documents";
import LogoutButton from "@/components/LogoutButton";
import AdminInscriptionsTable from "@/components/AdminInscriptionsTable";

export default async function AdminInscriptionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  // La vérification admin est déjà assurée par app/admin/layout.js

  // 2. Récupérer toutes les inscriptions et la liste des administrateurs depuis la table profiles
  const [{ data: inscriptions, error }, { data: adminProfiles }] = await Promise.all([
    supabase.from("inscriptions").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id").eq("role", "admin"),
  ]);

  if (error) {
    return (
      <div className="wrap" style={{ paddingTop: 140 }}>
        <p>Erreur de chargement : {error.message}</p>
      </div>
    );
  }

  // 3. Exclure les comptes administrateurs de la liste des inscriptions d'étudiants
  const adminIds = new Set((adminProfiles || []).map((a) => a.id));
  const inscriptionsEtudiants = (inscriptions || []).filter((i) => !adminIds.has(i.user_id));

  const userIds = inscriptionsEtudiants.map((i) => i.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileById = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

  const inscriptionsWithLinks = await Promise.all(
    inscriptionsEtudiants.map(async (inscription) => {
      const documentLinks = {};
      for (const doc of DOCUMENTS) {
        const path = inscription[`${doc.key}_path`];
        if (path) {
          const { data } = await supabase.storage.from("documents").createSignedUrl(path, 300);
          documentLinks[doc.key] = data?.signedUrl || null;
        }
      }
      return {
        ...inscription,
        profile: profileById[inscription.user_id] || null,
        documentLinks,
      };
    })
  );

  return (
    <div style={{ background: "var(--bg-soft)", minHeight: "100vh" }}>
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
          <a href="/admin">Accueil admin</a> · Inscriptions en attente
        </div>

        <div style={{ marginBottom: 32 }}>
          <span className="eyebrow">Validation des dossiers</span>
          <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Inscriptions en attente</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            {inscriptionsWithLinks.length} dossier{inscriptionsWithLinks.length > 1 ? "s" : ""} à
            traiter
          </p>
        </div>

        <AdminInscriptionsTable initialInscriptions={inscriptionsWithLinks} documents={DOCUMENTS} />
      </main>
    </div>
  );
}