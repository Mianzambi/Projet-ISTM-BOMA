import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DOCUMENTS } from "@/lib/documents";
import LogoutButton from "@/components/LogoutButton";
import AdminStudentDetail from "@/components/AdminStudentDetail";

export default async function AdminStudentPage({ params }) {
  const { userId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: adminRow } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  const isAdmin = adminRow || user.email === "admin@istmboma.cd";
  if (!isAdmin) redirect("/tableau-de-bord");

  const [{ data: profile }, { data: inscription }, { data: paiements }, { data: coupon }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("inscriptions").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("paiements").select("*").eq("user_id", userId).order("date_paiement", { ascending: false }),
      supabase.from("coupons").select("*").eq("user_id", userId).maybeSingle(),
    ]);

  if (!profile) notFound();

  let documentLinks = {};
  let montantFixe = null;
  if (inscription) {
    const entries = await Promise.all(
      DOCUMENTS.map(async (doc) => {
        const path = inscription[`${doc.key}_path`];
        if (!path) return [doc.key, null];
        const { data } = await supabase.storage.from("documents").createSignedUrl(path, 300);
        return [doc.key, data?.signedUrl || null];
      })
    );
    documentLinks = Object.fromEntries(entries);

    const { data: frais } = await supabase
      .from("frais_academiques")
      .select("*")
      .eq("niveau", inscription.niveau)
      .maybeSingle();
    montantFixe = frais || null;
  }

  let couponUrl = null;
  if (coupon) {
    const { data } = await supabase.storage.from("coupons").createSignedUrl(coupon.coupon_path, 300);
    couponUrl = data?.signedUrl || null;
  }

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

      <main className="wrap" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 900 }}>
        <a href="/admin" style={{ color: "var(--blue)", fontSize: "0.85rem", fontWeight: 600 }}>
          ← Retour à l&apos;accueil admin
        </a>
        <h1 style={{ fontSize: "1.8rem", margin: "12px 0 2px" }}>{profile.full_name || "Étudiant"}</h1>
        <p style={{ color: "var(--muted)", margin: "0 0 32px" }}>
          {profile.email}
          {inscription ? ` — ${inscription.niveau} ${inscription.filiere} (Vacation ${inscription.vacation || "—"})` : ""}
        </p>

        <AdminStudentDetail
          userId={userId}
          inscription={inscription}
          documentLinks={documentLinks}
          documents={DOCUMENTS}
          initialPaiements={paiements || []}
          montantFixe={montantFixe}
          initialCoupon={coupon}
          initialCouponUrl={couponUrl}
        />
      </main>
    </div>
  );
}
