import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import { DOCUMENTS } from "@/lib/documents";
import { statutLabels } from "@/lib/statuts";

export default async function TableauDeBordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const fullName = profile?.full_name || user.user_metadata?.full_name || "Étudiant";

  const [{ data: inscription }, { data: paiements }, { data: coupon }] = await Promise.all([
    supabase.from("inscriptions").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("paiements")
      .select("*")
      .eq("user_id", user.id)
      .order("date_paiement", { ascending: false }),
    supabase.from("coupons").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  let documentLinks = {};
  let horaires = [];
  let camarades = [];
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

    const { data: horairesData } = await supabase
      .from("horaires")
      .select("*")
      .eq("filiere", inscription.filiere)
      .eq("niveau", inscription.niveau)
      .order("jour", { ascending: true });
    horaires = horairesData || [];

    const { data: promotionData } = await supabase
      .from("promotion_publique")
      .select("*")
      .eq("filiere", inscription.filiere)
      .eq("niveau", inscription.niveau);
    camarades = promotionData || [];

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

  const totalPaye = (paiements || []).reduce((sum, p) => sum + Number(p.montant), 0);
  const devise = montantFixe?.devise || paiements?.[0]?.devise || "FC";
  const montantFixeVal = montantFixe ? Number(montantFixe.montant) : null;
  const resteAPayer = montantFixeVal !== null ? Math.max(montantFixeVal - totalPaye, 0) : null;

  const statutStyles = {
    en_attente: "bg-amber-100 text-amber-800 border-amber-200",
    validee: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejetee: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <header className="site-header scrolled sticky top-0 z-50">
        <div className="header-inner py-3">
          <div className="brand">
            <img src="/logo.jpg" alt="Logo ISTM" style={{ height: 32, width: "auto", borderRadius: 6, marginRight: 8 }} />
            Portail Étudiant
          </div>
          <div className="header-actions">
            <span className="text-sm text-slate-500 hidden sm:inline font-medium bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 mt-4">
        {/* Bannière de bienvenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm reveal-scale flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6" style={{ background: 'linear-gradient(to right, #ffffff, var(--bg-soft))' }}>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Bonjour, {fullName}</h2>
            <p className="text-sm text-slate-500 mt-1">{user.email}</p>
            {inscription && (
              <p className="text-sm font-medium text-blue-700 bg-blue-50 inline-block px-3 py-1.5 rounded-lg mt-3 border border-blue-100">
                <span className="mr-1">🎓</span> Étudiant(e) en {inscription.niveau} — {inscription.filiere}
                {inscription.vacation ? ` (Vacation ${inscription.vacation})` : ""}
              </p>
            )}
          </div>
          {inscription && (
            <div className={`px-4 py-2 border rounded-full text-sm font-bold whitespace-nowrap shadow-sm ${statutStyles[inscription.statut]}`}>
              ● {statutLabels[inscription.statut]?.text}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger">
          
          {/* Dossier d'inscription */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm reveal hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Dossier d'inscription</h3>
            </div>

            {inscription ? (
              <div className="flex-1 flex flex-col">
                <div className="space-y-3 text-sm flex-1">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Filière</span>
                    <span className="text-slate-900 font-semibold">{inscription.filiere}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Niveau</span>
                    <span className="text-slate-900 font-semibold">{inscription.niveau}</span>
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold uppercase text-slate-400 mb-3">Documents envoyés</h4>
                    <div className="space-y-2">
                      {DOCUMENTS.map((doc) => (
                        <div key={doc.key} className="flex justify-between items-center text-sm py-1">
                          <span className="text-slate-600">{doc.label}</span>
                          {documentLinks[doc.key] ? (
                            <a href={documentLinks[doc.key]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded text-xs font-bold transition-colors">
                              VOIR
                            </a>
                          ) : (
                            <span className="text-slate-300 font-medium">Manquant</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <a href="/tableau-de-bord/inscription" className="block text-center mt-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors">
                  Modifier mon dossier
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 py-6 text-center">
                <p className="text-sm text-slate-500 mb-4">Tu n'as pas encore complété ta demande d'inscription.</p>
                <a href="/tableau-de-bord/inscription" className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                  Remplir mon dossier
                </a>
              </div>
            )}
          </div>

          {/* Finance */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm reveal hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Finance</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                <span className="text-slate-500">Frais académiques fixés</span>
                <span className="text-slate-900 font-semibold">
                  {montantFixeVal !== null ? `${montantFixeVal.toLocaleString("fr-FR")} ${devise}` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-slate-100 bg-emerald-50/50 -mx-4 px-4 rounded-lg">
                <span className="text-slate-600 font-medium">Total payé</span>
                <span className="text-emerald-600 font-bold">{totalPaye.toLocaleString("fr-FR")} {devise}</span>
              </div>
              <div className="flex justify-between text-sm py-2 bg-amber-50/50 -mx-4 px-4 rounded-lg">
                <span className="text-slate-600 font-medium">Reste à payer</span>
                <span className="text-amber-600 font-bold">
                  {resteAPayer !== null ? `${resteAPayer.toLocaleString("fr-FR")} ${devise}` : "—"}
                </span>
              </div>
            </div>

            {paiements && paiements.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-semibold uppercase text-slate-400 mb-3">Historique des versements</h4>
                <div className="space-y-2">
                  {paiements.map((p) => (
                    <div key={p.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <div className="text-slate-900 font-medium">{p.motif}</div>
                        <div className="text-xs text-slate-500">{new Date(p.date_paiement).toLocaleDateString("fr-FR")}</div>
                      </div>
                      <span className="text-emerald-600 font-bold">
                        +{Number(p.montant).toLocaleString("fr-FR")} {p.devise}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coupon / Résultat */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm reveal hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Résultats & Bulletin</h3>
            </div>
            
            {couponUrl ? (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
                <p className="text-sm text-purple-800 mb-4 font-medium">Ton bulletin est disponible en téléchargement.</p>
                <a href={couponUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                  Télécharger le document PDF
                </a>
              </div>
            ) : (
              <p className="text-sm text-slate-500 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                Aucun résultat n'a encore été publié pour l'instant.
              </p>
            )}
          </div>

          {/* Ma promotion */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm reveal hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Ma promotion ({camarades.length})
              </h3>
            </div>
            
            {camarades.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                {camarades.map((c, i) => (
                  <div key={i} className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 font-medium flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    {c.full_name || "Étudiant(e)"}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                Aucun autre étudiant validé dans ta promotion.
              </p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
