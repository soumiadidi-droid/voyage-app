// Étalonnage photo du site (11/09/2026) — une seule définition, partagée.
//
// Objectif : que des photos venant de sources différentes (banque d'images, appareils, moments de
// la journée) aient l'air d'appartenir à la même collection. C'est ce qui fait tenir une identité
// visuelle : pas le sujet des photos, leur traitement.
//
// "Sable" est l'ambiance retenue par Soumia après comparaison sur ses propres photos : elle
// réchauffe légèrement, désature un peu et remonte les noirs vers l'ivoire du site. Assez présente
// pour unifier, assez discrète pour ne pas abîmer une belle image.
export const PHOTO_GRADE = {
  filtre: "saturate(0.88) contrast(0.95) sepia(0.08) brightness(1.02)",
  voile: { couleur: "#E8DFC8", opacite: 0.07 },
} as const;
