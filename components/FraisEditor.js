"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const NIVEAUX_CONFIG = [
  { key: "L1", label: "L1 (LMD)", type: "licence" },
  { key: "L2", label: "L2 (LMD)", type: "licence" },
  { key: "L3", label: "L3 (LMD)", type: "licence" },
  { key: "Passerelle", label: "Passerelle", type: "passerelle" },
  { key: "M1", label: "Master 1 (M1)", type: "master" },
  { key: "M2", label: "Master 2 (M2)", type: "master" },
];

export default function FraisEditor({ initialFrais }) {
  // Remplir avec les valeurs de la BD ou initialiser à 0 avec les clés exactes ("L1", "L2", etc.)
  const initializedFrais = NIVEAUX_CONFIG.map((cfg) => {
    // Chercher par la clé exacte ("L1") ou par l'ancien libellé ("L1 (LMD)" ou "Master 1")
    const existing = (initialFrais || []).find(
      (f) => f.niveau === cfg.key || f.niveau === cfg.label || (cfg.key === "M1" && f.niveau === "Master 1") || (cfg.key === "M2" && f.niveau === "Master 2")
    );
    return {
      niveauKey: cfg.key,
      label: cfg.label,
      type: cfg.type,
      montant: existing ? Number(existing.montant) : 0,
      devise: existing?.devise || "FC",
    };
  });

  const [frais, setFrais] = useState(initializedFrais);
  const [saving, setSaving] = useState(null);
  const [savedNiveau, setSavedNiveau] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  function handleChange(niveauKey, montant) {
    setFrais((prev) =>
      prev.map((f) => (f.niveauKey === niveauKey ? { ...f, montant } : f))
    );
  }

  async function handleSave(niveauKey) {
    const item = frais.find((f) => f.niveauKey === niveauKey);
    setSaving(niveauKey);
    setSavedNiveau(null);
    const supabase = createClient();

    // Enregistrer avec la clé exacte que les étudiants ont ("L1", "L2", "L3", "Passerelle", "M1", "M2")
    const { error } = await supabase.from("frais_academiques").upsert(
      { niveau: item.niveauKey, montant: Number(item.montant), devise: item.devise },
      { onConflict: "niveau" }
    );

    // Egalement enregistrer avec l'ancien libellé pour compatibilité au cas où
    if (item.label !== item.niveauKey) {
      await supabase.from("frais_academiques").upsert(
        { niveau: item.label, montant: Number(item.montant), devise: item.devise },
        { onConflict: "niveau" }
      );
    }

    setSaving(null);
    if (error) {
      setMessage({ type: "error", text: "Erreur lors de l'enregistrement : " + error.message });
      return;
    }
    setMessage({ type: "success", text: `Frais pour ${item.label} mis à jour avec succès (${item.montant.toLocaleString('fr-FR')} ${item.devise}).` });
    setSavedNiveau(niveauKey);
    setTimeout(() => setSavedNiveau(null), 2500);
  }

  return (
    <div className="space-y-6">
      {message.text && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border shadow-sm ${
            message.type === "error"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {frais.map((f) => {
          const isLicence = f.type === "licence";
          return (
            <div
              key={f.niveauKey}
              className={`p-5 rounded-2xl flex items-center justify-between gap-4 shadow-sm border transition-shadow hover:shadow-md ${
                isLicence
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-500"
                  : "bg-gradient-to-r from-slate-800 to-indigo-900 border-slate-700"
              }`}
            >
              <div className="flex flex-col">
                <span className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">
                  Niveau
                </span>
                <span className="text-white font-bold text-xl">{f.label}</span>
              </div>

              <div className="flex items-center gap-3 bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                <input
                  type="number"
                  value={f.montant}
                  onChange={(e) => handleChange(f.niveauKey, e.target.value)}
                  className="w-28 px-3 py-2 rounded-lg bg-white/90 text-slate-900 border-none text-right font-bold focus:ring-2 focus:ring-white/50 focus:outline-none"
                  placeholder="Montant"
                />
                <span className="text-white font-semibold text-sm">{f.devise}</span>

                <button
                  onClick={() => handleSave(f.niveauKey)}
                  disabled={saving === f.niveauKey}
                  className="ml-2 bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-70 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  {saving === f.niveauKey
                    ? "..."
                    : savedNiveau === f.niveauKey
                    ? "Enregistré ✓"
                    : "Valider"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
