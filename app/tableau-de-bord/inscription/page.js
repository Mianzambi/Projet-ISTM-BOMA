"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { licence, passerelle, master, niveauxParCycle } from "@/lib/filieres";
import { DOCUMENTS } from "@/lib/documents";
import { statutLabels } from "@/lib/statuts";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export default function InscriptionFormPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [statut, setStatut] = useState(null);

  // Type de dossier : 'reinscription' (déjà inscrit à l'ISTM) ou 'nouveau' (nouvelle demande)
  const [typeDossier, setTypeDossier] = useState("reinscription");

  const [cycle, setCycle] = useState("Licence");
  const [filiere, setFiliere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [vacation, setVacation] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [lieuNaissance, setLieuNaissance] = useState("");
  const [sexe, setSexe] = useState("");
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ecoleOrigine, setEcoleOrigine] = useState("");

  const [files, setFiles] = useState({});
  const [existingPaths, setExistingPaths] = useState({});

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/connexion");
        return;
      }
      const { data } = await supabase.from("inscriptions").select("*").eq("user_id", user.id).maybeSingle();

      if (data) {
        const isPasserelle = passerelle.includes(data.filiere);
        const isMaster = master.includes(data.filiere);
        setCycle(isPasserelle ? "Passerelle" : isMaster ? "Master" : "Licence");
        setFiliere(data.filiere || "");
        setNiveau(data.niveau || "");
        setVacation(data.vacation || "");
        setDateNaissance(data.date_naissance || "");
        setLieuNaissance(data.lieu_naissance || "");
        setSexe(data.sexe || "");
        setAdresse(data.adresse || "");
        setTelephone(data.telephone || "");
        setEcoleOrigine(data.ecole_origine || "");
        setStatut(data.statut);
        setExistingPaths({
          diplome: data.diplome_path,
          carte_identite: data.carte_identite_path,
          photo: data.photo_path,
          acte_naissance: data.acte_naissance_path,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const filieresDisponibles = cycle === "Licence" ? licence : cycle === "Passerelle" ? passerelle : master;
  const niveauxDisponibles = niveauxParCycle[cycle];

  function handleCycleChange(newCycle) {
    setCycle(newCycle);
    setFiliere("");
    setNiveau("");
  }

  function handleFileChange(key, fileList) {
    const file = fileList[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(`${file.name} : formats acceptés = PDF, JPG ou PNG.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`${file.name} dépasse 5 Mo.`);
      return;
    }
    setError(null);
    setFiles((prev) => ({ ...prev, [key]: file }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/connexion");
        return;
      }

      // Si c'est un nouveau candidat, exiger les pièces jointes
      if (typeDossier === "nouveau") {
        for (const doc of DOCUMENTS) {
          if (!files[doc.key] && !existingPaths[doc.key]) {
            throw new Error(`Pour une nouvelle inscription, le document "${doc.label}" est obligatoire.`);
          }
        }
      }

      const paths = { ...existingPaths };
      for (const doc of DOCUMENTS) {
        const file = files[doc.key];
        if (!file) continue;

        const ext = file.name.split(".").pop();
        const path = `${user.id}/${doc.key}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;
        paths[doc.key] = path;
      }

      const { error: upsertError } = await supabase.from("inscriptions").upsert(
        {
          user_id: user.id,
          filiere,
          niveau,
          vacation,
          date_naissance: dateNaissance || null,
          lieu_naissance: lieuNaissance,
          sexe,
          adresse,
          telephone,
          ecole_origine: ecoleOrigine || "ISTM-BOMA",
          diplome_path: paths.diplome || null,
          carte_identite_path: paths.carte_identite || null,
          photo_path: paths.photo || null,
          acte_naissance_path: paths.acte_naissance || null,
          statut: typeDossier === "reinscription" ? "validee" : "en_attente",
        },
        { onConflict: "user_id" }
      );

      if (upsertError) throw upsertError;

      setSuccess(true);
      setStatut(typeDossier === "reinscription" ? "validee" : "en_attente");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || "Une erreur est survenue, réessaie.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 font-medium animate-pulse">Chargement de votre dossier...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/tableau-de-bord')} className="text-slate-400 hover:text-slate-700 transition-colors">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <h1 className="font-bold text-slate-800">Dossier d'inscription académique</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 stagger">
        
        {statut && (
          <div className="mb-6 bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm reveal-scale">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Statut actuel du dossier</span>
            <span className={`px-3 py-1 text-sm font-bold rounded-lg border ${
              statut === 'validee' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}>
              {statutLabels[statut]?.text || statut}
            </span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm shadow-sm reveal-scale">
            <strong>C'est enregistré !</strong> Votre dossier a été mis à jour avec succès.
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm shadow-sm reveal-scale">
            <strong>Erreur :</strong> {error}
          </div>
        )}

        {/* Sélecteur de type de dossier */}
        <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm reveal">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Sélectionnez votre situation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
              typeDossier === "reinscription" ? "border-blue-600 bg-blue-50/50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
            }`}>
              <input 
                type="radio" 
                name="typeDossier" 
                value="reinscription" 
                checked={typeDossier === "reinscription"}
                onChange={() => setTypeDossier("reinscription")}
                className="mt-1 text-blue-600"
              />
              <div>
                <div className="font-bold text-slate-900 text-sm">Déjà étudiant à l'ISTM-BOMA</div>
                <div className="text-xs text-slate-500 mt-1">Réinscription / Poursuite d'études. Pièces jointes optionnelles.</div>
              </div>
            </label>

            <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
              typeDossier === "nouveau" ? "border-blue-600 bg-blue-50/50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
            }`}>
              <input 
                type="radio" 
                name="typeDossier" 
                value="nouveau" 
                checked={typeDossier === "nouveau"}
                onChange={() => setTypeDossier("nouveau")}
                className="mt-1 text-blue-600"
              />
              <div>
                <div className="font-bold text-slate-900 text-sm">Nouveau candidat</div>
                <div className="text-xs text-slate-500 mt-1">Première inscription à l'ISTM-BOMA. Pièces numérisées requises.</div>
              </div>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm reveal hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
              <h3 className="text-lg font-bold text-slate-800">Formation choisie</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cycle</label>
                <select 
                  value={cycle} 
                  onChange={(e) => handleCycleChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Licence">Licence (Sections Organisées)</option>
                  <option value="Passerelle">Passerelle (Licence Spéciale)</option>
                  <option value="Master">Master</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Niveau</label>
                <select 
                  value={niveau} 
                  onChange={(e) => setNiveau(e.target.value)} 
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Choisir…</option>
                  {niveauxDisponibles.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Filière / Spécialité</label>
                <select 
                  value={filiere} 
                  onChange={(e) => setFiliere(e.target.value)} 
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Choisir…</option>
                  {filieresDisponibles.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vacation (régime des cours)</label>
                <select 
                  value={vacation} 
                  onChange={(e) => setVacation(e.target.value)} 
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Choisir…</option>
                  <option value="Jour">Jour</option>
                  <option value="Soir">Soir</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm reveal hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">2</div>
              <h3 className="text-lg font-bold text-slate-800">Informations de l'étudiant</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date de naissance</label>
                <input type="date" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Lieu de naissance</label>
                <input type="text" value={lieuNaissance} onChange={(e) => setLieuNaissance(e.target.value)} required placeholder="Ex: Boma" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sexe</label>
                <select value={sexe} onChange={(e) => setSexe(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="" disabled>Choisir…</option>
                  <option value="Masculin">Masculin</option>
                  <option value="Féminin">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Téléphone</label>
                <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} required placeholder="+243..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Adresse résidentielle</label>
                <input type="text" value={adresse} onChange={(e) => setAdresse(e.target.value)} required placeholder="Commune, Quartier, Avenue, Numéro" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">École d'origine / Établissement précédent</label>
                <input type="text" value={ecoleOrigine} onChange={(e) => setEcoleOrigine(e.target.value)} placeholder="Ex: ISTM-BOMA ou Institut Médical" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm reveal hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">3</div>
                <h3 className="text-lg font-bold text-slate-800">Pièces justificatives</h3>
              </div>
              {typeDossier === "reinscription" && (
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md">Optionnel (Réinscription)</span>
              )}
            </div>
            
            <p className="text-xs text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
              ℹ️ Formats acceptés : PDF, JPG, PNG — <strong>5 Mo max par fichier</strong>.
            </p>
            
            <div className="space-y-4">
              {DOCUMENTS.map((doc) => (
                <div key={doc.key} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-800">
                        {doc.label} {typeDossier === "nouveau" && <span className="text-red-500">*</span>}
                      </label>
                      {existingPaths[doc.key] && !files[doc.key] && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold mt-1">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                          Document enregistré
                        </span>
                      )}
                    </div>
                    <div className="relative overflow-hidden inline-block w-full sm:w-auto">
                      <input 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                        onChange={(e) => handleFileChange(doc.key, e.target.files)} 
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 reveal text-center sm:text-right">
            <button 
              type="submit" 
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70"
              disabled={saving}
            >
              {saving ? "Enregistrement en cours…" : "Valider mon dossier académique"}
            </button>
          </div>
          
        </form>
      </main>
    </div>
  );
}
