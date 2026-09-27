"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCohortList({ students }) {
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  function handleGerer() {
    if (selectedId) router.push(`/admin/etudiant/${selectedId}`);
  }

  const filteredStudents = students.filter((s) => {
    const name = s.full_name?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return name.includes(term);
  });

  function exportCohortCSV() {
    const headers = ["Nom Complet", "ID Étudiant"];
    const rows = filteredStudents.map((s) => [
      `"${s.full_name || 'Inconnu'}"`,
      `"${s.user_id || ''}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Liste_Promotion_ISTM_BOMA.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (students.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <p className="text-slate-500 font-medium">Aucun étudiant dans cette promotion pour l'instant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Barre de recherche & export */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center print:hidden">
        <div className="relative w-full sm:w-80">
          <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input
            type="text"
            placeholder="Rechercher un étudiant par son nom…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={exportCohortCSV}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Exporter cette promotion (Excel)
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            Imprimer / PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Liste des inscrits validés ({filteredStudents.length} / {students.length})
            </span>
          </div>
          <ul className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s) => {
                const isSelected = selectedId === s.user_id;
                return (
                  <li
                    key={s.user_id}
                    onClick={() => setSelectedId(s.user_id)}
                    className={`px-6 py-4 cursor-pointer transition-colors flex items-center justify-between
                      ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border
                        ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-500 border-slate-200'}
                      `}>
                        {s.full_name ? s.full_name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                        {s.full_name || "Nom inconnu"}
                      </span>
                    </div>
                    
                    {isSelected && (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="p-6 text-center text-slate-500 text-sm">
                Aucun étudiant ne correspond à "{searchTerm}".
              </li>
            )}
          </ul>
        </div>
        
        <div className="sticky top-24 print:hidden">
          <button
            onClick={handleGerer}
            disabled={!selectedId}
            className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 whitespace-nowrap"
          >
            Ouvrir le dossier
          </button>
        </div>
      </div>
    </div>
  );
}
