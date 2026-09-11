export type PresetId = "minimalist" | "editorial" | "terracotta-mood" | "carnet";

export const PRESETS: { id: PresetId; label: string }[] = [
  { id: "minimalist", label: "Citation Minimalist" },
  // Ajouté le 11/09/2026 d'après la référence de Soumia : le monogramme traité comme un motif
  // graphique, écrit en très grand à la verticale et volontairement coupé par le bord du cadre.
  // C'est ce procédé qui fait tenir une grille Instagram d'un post à l'autre.
  { id: "editorial", label: "Monogramme Éditorial" },
  { id: "terracotta-mood", label: "Terracotta Mood" },
  { id: "carnet", label: "Carnet d'Adresse" },
];

// Formats de sortie (11/09/2026) : le même visuel sert sur plusieurs réseaux, mais pas au même
// gabarit. Pinterest est un moteur de recherche vertical — une image carrée y prend deux fois
// moins de place à l'écran et se fait dépasser par les épingles 2:3.
export type FormatId = "square" | "pin" | "story";

export const FORMATS: { id: FormatId; label: string; ratio: string; hint: string }[] = [
  { id: "square", label: "Instagram · carré", ratio: "1 / 1", hint: "1080 × 1080" },
  { id: "pin", label: "Pinterest · vertical", ratio: "2 / 3", hint: "1000 × 1500" },
  { id: "story", label: "Story · plein écran", ratio: "9 / 16", hint: "1080 × 1920" },
];

// Ambiances photo (11/09/2026) — transposition en CSS des étalonnages testés sur les photos de la
// Côte Basque. `css` fait le gros du travail (saturation, contraste, chaleur) ; `voile` remonte les
// noirs en posant un voile clair très léger, ce qu'un filtre CSS seul ne sait pas faire. Les deux
// sont appliqués à l'image avant export, donc cuits dans le PNG téléchargé.
export type FiltreId = "aucun" | "sable" | "argentique" | "ocean";

export const FILTRES: {
  id: FiltreId;
  label: string;
  css: string;
  voile?: { couleur: string; opacite: number };
}[] = [
  { id: "aucun", label: "Sans filtre", css: "none" },
  {
    id: "sable",
    label: "Sable",
    css: "saturate(0.88) contrast(0.95) sepia(0.08) brightness(1.02)",
    voile: { couleur: "#E8DFC8", opacite: 0.07 },
  },
  {
    id: "argentique",
    label: "Argentique",
    css: "saturate(0.72) contrast(0.88) sepia(0.14) brightness(1.05)",
    voile: { couleur: "#FAF7F0", opacite: 0.12 },
  },
  { id: "ocean", label: "Océan", css: "saturate(0.95) contrast(1.08) hue-rotate(-4deg)" },
];
