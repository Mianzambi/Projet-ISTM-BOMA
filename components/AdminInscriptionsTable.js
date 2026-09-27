"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { statutLabels } from "@/lib/statuts";

export default function AdminInscriptionsTable({ initialInscriptions, documents }) {
  const [inscriptions, setInscriptions] = useState(initialInscriptions);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("tous");
  const [updatingId, setUpdatingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  async function updateStatut(id, nouveauStatut) {
    setUpdatingId(id);
    const supabase = createClient();

    const { error } = await supabase
      .from("inscriptions")
      .update({ statut: nouveauStatut })
      .eq("id", id);

    setUpdatingId(null);

    if (error) {
      setStatusMessage({ type: "error", text: "Erreur lors de la mise à jour : " + error.message });
      return;
    }

    setStatusMessage({ type: "success", text: "Statut mis à jour avec succès." });

    setInscriptions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, statut: nouveauStatut } : item))
    );
  }

  // Filtrage en temps réel
  const filteredInscriptions = inscriptions.filter((item) => {
    const name = item.profile?.full_name?.toLowerCase() || "";
    const email = item.profile?.email?.toLowerCase() || "";
    const tel = item.telephone || "";
    const filiere = item.filiere?.toLowerCase() || "";
    const niveau = item.niveau?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      name.includes(term) ||
      email.includes(term) ||
      tel.includes(term) ||
      filiere.includes(term) ||
      niveau.includes(term);

    const matchesStatut = filterStatut === "tous" || item.statut === filterStatut;

    return matchesSearch && matchesStatut;
  });

  // Exportation CSV pour Excel
  function exportToCSV() {
    const headers = ["Nom Complet", "Email", "Téléphone", "Filière", "Niveau", "Vacation", "Sexe", "Statut"];
    const rows = filteredInscriptions.map((item) => [
      `"${item.profile?.full_name || 'Inconnu'}"`,
      `"${item.profile?.email || ''}"`,
      `"${item.telephone || ''}"`,
      `"${item.filiere || ''}"`,
      `"${item.niveau || ''}"`,
      `"${item.vacation || ''}"`,
      `"${item.sexe || ''}"`,
      `"${statutLabels[item.statut]?.text || item.statut}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inscriptions_ISTM_BOMA_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Impression PDF propre
  function handlePrint() {
    window.print();
  }

  if (inscriptions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <p className="text-slate-500 font-medium">Aucune inscription enregistrée pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Barre d'outils : Recherche + Filtres + Export */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center print:hidden">
        <div className="flex-1 w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
              type="text"
              placeholder="Recherche rapide par nom, email, téléphone, filière…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tous">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="validee">Validées</option>
            <option value="rejetee">Rejetées</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Exporter Excel (.CSV)
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4h10z"></path></svg>
            Imprimer / PDF
          </button>
        </div>
      </div>

      {statusMessage.text && (
        <div className={`p-4 rounded-xl text-sm font-medium border ${statusMessage.type === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
          {statusMessage.text}
        </div>
      )}

      {/* Tableau des données */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Étudiant</th>
                <th className="px-6 py-4">Filière / Niveau</th>
                <th className="px-6 py-4">Infos personnelles</th>
                <th className="px-6 py-4 print:hidden">Documents</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInscriptions.length > 0 ? (
                filteredInscriptions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{item.profile?.full_name || "Nom inconnu"}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{item.profile?.email}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{item.telephone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{item.filiere}</div>
                      <div className="text-slate-500 text-xs mt-0.5 font-medium">Niveau : <span className="text-slate-700">{item.niveau}</span></div>
                    </td>
                    <td className="px-6 py-4 text-xs space-y-1 text-slate-600">
                      <div><span className="font-medium text-slate-400">Sexe:</span> {item.sexe}</div>
                      <div><span className="font-medium text-slate-400">Né(e) le:</span> {item.date_naissance} à {item.lieu_naissance}</div>
                      <div><span className="font-medium text-slate-400">École:</span> {item.ecole_origine}</div>
                    </td>
                    <td className="px-6 py-4 print:hidden">
                      <div className="space-y-1">
                        {documents.map((doc) =>
                          item.documentLinks[doc.key] ? (
                            <a key={doc.key} href={item.documentLinks[doc.key]} target="_blank" rel="noreferrer" className="block text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
                              {doc.label} ↗
                            </a>
                          ) : (
                            <div key={doc.key} className="text-xs text-slate-400 italic">
                              {doc.label} — manquant
                            </div>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap
                        ${item.statut === 'en_attente' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                        ${item.statut === 'validee' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                        ${item.statut === 'rejetee' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                      `}>
                        {statutLabels[item.statut]?.text || item.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 print:hidden">
                      <div className="flex flex-col items-end gap-2">
                        <a href={`/admin/etudiant/${item.user_id}`} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors text-center w-full max-w-[100px]">
                          Gérer
                        </a>
                        <div className="flex gap-2 w-full max-w-[100px]">
                          <button onClick={() => updateStatut(item.id, "validee")} disabled={updatingId === item.id} className="flex-1 px-2 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-lg border border-emerald-200 transition-colors disabled:opacity-50">
                            Valider
                          </button>
                          <button onClick={() => updateStatut(item.id, "rejetee")} disabled={updatingId === item.id} className="flex-1 px-2 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold rounded-lg border border-red-200 transition-colors disabled:opacity-50">
                            Rejeter
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500 font-medium">
                    Aucun étudiant ne correspond à votre recherche "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
