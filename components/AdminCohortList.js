"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCohortList({ students }) {
  const [selectedId, setSelectedId] = useState(null);
  const router = useRouter();

  function handleGerer() {
    if (selectedId) router.push(`/admin/etudiant/${selectedId}`);
  }

  if (students.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <p className="text-slate-500 font-medium">Aucun étudiant dans cette promotion pour l'instant.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Liste des inscrits validés ({students.length})</span>
        </div>
        <ul className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {students.map((s) => {
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
          })}
        </ul>
      </div>
      
      <div className="sticky top-24">
        <button
          onClick={handleGerer}
          disabled={!selectedId}
          className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 whitespace-nowrap"
        >
          Ouvrir le dossier
        </button>
      </div>
    </div>
  );
}
