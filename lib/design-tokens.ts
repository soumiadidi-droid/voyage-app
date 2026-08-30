// Design System LVE — décidé le 23/08/2026. Source de vérité pour la palette de marque, en miroir
// des tokens CSS déclarés dans app/globals.css (--lve-*). Deux endroits différents parce que
// Tailwind a besoin des tokens en CSS pour générer les classes utilitaires (bg-lve-terracotta-bg,
// text-lve-sage-dark, ...), et le code React a besoin des mêmes valeurs en JS quand la couleur est
// choisie dynamiquement (ex: badge de catégorie selon la donnée) plutôt que fixée dans une classe.
// Si une valeur change, mettre à jour les deux fichiers ensemble.
export const LVE_COLORS = {
  bg: "#FBF9F5",
  charcoal: "#1A1A1A",
  ivory: "#FAF6F0",
  obsidian: "#22252A",
  sand: "#F1DAB1",
  border: "#E8E3DA",
  terracotta: {
    DEFAULT: "#D27B5C",
    dark: "#8C4A32",
    bg: "#F7EBE1",
    copperSmoke: "#4A2E1F",
  },
  sage: {
    dark: "#4A6B48",
    bg: "#EFF3EE",
  },
  ocean: {
    dark: "#2C5E73",
    bg: "#E8F0F3",
  },
  // 4e famille (30/08/2026, demande Soumia — "l'extension possible peut être une quatrième
  // couleur de la charte") : réservée aux "Extensions possibles" (TripExtensionCard), pour se
  // distinguer des 3 familles déjà prises par les catégories d'adresse (terracotta hôtel/sauge
  // resto/océan activité).
  plum: {
    dark: "#6B3B5E",
    bg: "#F3E8EE",
  },
  // 5e famille (30/08/2026, demande Soumia) — réservée au bloc "Logistique & Climat"
  // (DestinationPracticalCard), distincte des 4 familles déjà prises (terracotta hôtel/sauge
  // resto/océan activité/plum extensions). Bleu-gris ardoise, cohérent avec le thème pratique/
  // météo tout en restant clairement différent du bleu-vert d'ocean.
  slate: {
    dark: "#47586B",
    bg: "#EAEEF2",
  },
  // Alerte discrète (27/08/2026, refonte /resultat) — voir app/globals.css --lve-warning-*.
  warning: {
    bg: "#FFFBEB",
    text: "#92400E",
  },
} as const;

export type LveColorToken = typeof LVE_COLORS;
