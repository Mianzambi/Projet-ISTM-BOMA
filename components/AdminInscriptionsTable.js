"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { statutLabels } from "@/lib/statuts";

export default function AdminInscriptionsTable({ initialInscriptions, documents }) {
  const [inscriptions, setInscriptions] = useState(initialInscriptions);
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

  if (inscriptions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <p className="text-slate-500 font-medium">Aucune inscription enregistrée pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {statusMessage.text && (
        <div className={`m-4 p-4 rounded-xl text-sm font-medium border ${statusMessage.type === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
          {statusMessage.text}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Étudiant</th>
              <th className="px-6 py-4">Filière / Niveau</th>
              <th className="px-6 py-4">Infos personnelles</th>
              <th className="px-6 py-4">Documents</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inscriptions.map((item) => (
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
                <td className="px-6 py-4">
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
                <td className="px-6 py-4">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
