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

// Traitement bichrome, réservé aux cartes d'intentions (11/09/2026).
//
// Le problème : sept photos de sept photographes — un moulin en plein jour, une rue de Tokyo la
// nuit, une table vue du dessus, une montagne au soleil rasant. Aucune correction de saturation ou
// de contraste ne les rend cousines, parce que ce qui les sépare, ce sont les lumières et les
// sujets.
//
// La réponse habituelle des marques face à des images d'origines diverses : leur imposer une
// teinte unique. On désature complètement, puis on recolorise dans le terracotta du site. Les
// photos gardent leur composition et leur lisibilité, mais deviennent une famille.
//
// Volontairement limité à cet écran : les photos des carnets doivent rester documentaires, ce sont
// des preuves de ce que Soumia a vu, pas des éléments graphiques.
export const PHOTO_DUOTONE = {
  filtre: "saturate(0.35) contrast(1.02) brightness(0.99)",
  teinte: { couleur: "#C4622D", melange: "color" as const, opacite: 0.9 },
} as const;
