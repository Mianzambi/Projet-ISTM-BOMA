export const sciencesInfirmieres = [
  "Sciences Infirmières (Soins Généraux)",
];

export const sageFemme = [
  "Sage-Femme",
];

export const gestionSante = [
  "Gestion des Organisations de Santé (Management des Services de Santé)",
];

export const biologieMedicale = [
  "Biologie Médicale (Techniques de Laboratoire)",
];

export const passerelle = [
  "Passerelle / Licence Spéciale — EASI",
  "Passerelle / Licence Spéciale — GIS",
  "Passerelle / Licence Spéciale — Santé Communautaire",
  "Passerelle / Licence Spéciale — Biologie Médicale",
];

export const licence = [
  ...sciencesInfirmieres,
  ...sageFemme,
  ...gestionSante,
  ...biologieMedicale,
];

export const master = [
  "Sciences Infirmières — Spécialité",
  "Santé Publique et Management de Santé",
];

export const niveauxParCycle = {
  Licence: ["L1", "L2", "L3"],
  Master: ["M1", "M2"],
  Passerelle: ["Passerelle"],
};

// Liste à plat de toutes les filières organisées de l'ISTM-BOMA
export const toutesLesFilieres = [
  ...licence,
  ...passerelle,
  ...master,
];

// Tous les niveaux possibles, utilisés pour la grille "Promotion" côté admin.
export const tousLesNiveaux = ["L1", "L2", "L3", "Passerelle", "M1", "M2"];
