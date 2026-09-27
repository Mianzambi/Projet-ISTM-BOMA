"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminStudentDetail({
  userId,
  inscription,
  documentLinks,
  documents,
  initialPaiements,
  montantFixe,
  initialCoupon,
  initialCouponUrl,
}) {
  const [paiements, setPaiements] = useState(initialPaiements);
  const [coupon, setCoupon] = useState(initialCoupon);
  const [couponUrl, setCouponUrl] = useState(initialCouponUrl);
  const [couponFile, setCouponFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [nouveauMontant, setNouveauMontant] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const totalPaye = paiements.reduce((sum, p) => sum + Number(p.montant), 0);
  const montantFixeVal = montantFixe ? Number(montantFixe.montant) : null;
  const resteAPayer = montantFixeVal !== null ? Math.max(montantFixeVal - totalPaye, 0) : null;
  const devise = montantFixe?.devise || "FC";

  function handleFileSelect(fileList) {
    const file = fileList[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Le coupon doit être un fichier PDF.");
      return;
    }
    setError(null);
    setCouponFile(file);
  }

  async function ajouterCoupon() {
    if (!couponFile) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const path = `${userId}/coupon.pdf`;
    const { error: uploadError } = await supabase.storage.from("coupons").upload(path, couponFile, { upsert: true });

    if (uploadError) {
      setSaving(false);
      setError(uploadError.message);
      return;
    }

    const { data, error: dbError } = await supabase
      .from("coupons")
      .upsert({ user_id: userId, coupon_path: path, uploaded_at: new Date().toISOString() }, { onConflict: "user_id" })
      .select()
      .single();

    setSaving(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }

    setCoupon(data);
    const { data: signed } = await supabase.storage.from("coupons").createSignedUrl(path, 300);
    setCouponUrl(signed?.signedUrl || null);
    setCouponFile(null);
  }

  async function confirmerPaiement() {
    if (!nouveauMontant) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { data, error: insertError } = await supabase
      .from("paiements")
      .insert({
        user_id: userId,
        montant: Number(nouveauMontant),
        devise,
        motif: "Frais académique",
        mode_paiement: "Espèces au guichet",
        date_paiement: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setPaiements((prev) => [data, ...prev]);
    setNouveauMontant("");
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm shadow-sm">
          {error}
        </div>
      )}

      {/* Dossier d'inscription */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Dossier d'inscription</h3>
        </div>

        {inscription ? (
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
              <span className="font-bold text-slate-900">{inscription.niveau}</span> — {inscription.filiere} — Vacation <span className="font-bold text-slate-900">{inscription.vacation || "—"}</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {documents.map((doc) => (
                <div key={doc.key} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                  <span className="text-sm font-medium text-slate-600">{doc.label}</span>
                  {documentLinks[doc.key] ? (
                    <a href={documentLinks[doc.key]} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                      Voir
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 italic">Manquant</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-slate-500">Cet étudiant n'a pas encore complété de demande d'inscription.</p>
        )}
      </div>

      {/* RESULTAT + FINANCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RESULTAT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Résultat (Bulletin)</h3>
          </div>

          {coupon && !couponFile && (
            <div className="mb-4 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between">
              <span className="text-sm text-emerald-800 font-medium">Coupon déjà envoyé</span>
              <a href={couponUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-700 hover:underline">
                Voir le PDF
              </a>
            </div>
          )}

          <div
            className={`flex-1 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[160px]
              ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"}
            `}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFileSelect(e.dataTransfer.files);
            }}
            onClick={() => document.getElementById(`coupon-input-${userId}`).click()}
          >
            {couponFile ? (
              <div className="text-blue-700 font-medium">
                <svg className="w-8 h-8 mx-auto mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {couponFile.name}<br/><span className="text-xs font-normal text-slate-500">Prêt à envoyer</span>
              </div>
            ) : (
              <div className="text-slate-500 text-sm">
                <svg className="w-8 h-8 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                Glissez-déposez le PDF ici<br/>ou cliquez pour parcourir
              </div>
            )}
            <input
              id={`coupon-input-${userId}`}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          <button
            onClick={ajouterCoupon}
            disabled={!couponFile || saving}
            className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            Publier le coupon
          </button>
        </div>

        {/* FINANCE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Finance</h3>
          </div>

          <div className="space-y-3 mb-6 flex-1">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
              <span className="text-slate-500 font-medium">Montant fixé</span>
              <span className="font-bold text-slate-900">
                {montantFixeVal !== null ? `${montantFixeVal.toLocaleString("fr-FR")} ${devise}` : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-emerald-100 bg-emerald-50/50 -mx-4 px-4 rounded-lg text-sm">
              <span className="text-slate-600 font-medium">Déjà payé</span>
              <span className="font-bold text-emerald-600">
                {totalPaye.toLocaleString("fr-FR")} {devise}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 bg-amber-50/50 -mx-4 px-4 rounded-lg text-sm">
              <span className="text-slate-600 font-medium">Reste à payer</span>
              <span className="font-bold text-amber-600">
                {resteAPayer !== null ? `${resteAPayer.toLocaleString("fr-FR")} ${devise}` : "—"}
              </span>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ajouter un versement reçu</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder={`Montant`}
                  value={nouveauMontant}
                  onChange={(e) => setNouveauMontant(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{devise}</span>
              </div>
              <button 
                onClick={confirmerPaiement} 
                disabled={!nouveauMontant || saving} 
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
