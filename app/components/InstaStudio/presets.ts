export type PresetId =
  | "minimalist"
  | "editorial"
  | "terracotta-mood"
  | "couverture"
  | "carnet";

export const PRESETS: { id: PresetId; label: string }[] = [
  { id: "minimalist", label: "Citation Minimalist" },
  // Ajouté le 11/09/2026 d'après la référence de Soumia : le monogramme traité comme un motif
  // graphique, écrit en très grand à la verticale et volontairement coupé par le bord du cadre.
  // C'est ce procédé qui fait tenir une grille Instagram d'un post à l'autre.
  { id: "editorial", label: "Monogramme Éditorial" },
  { id: "terracotta-mood", label: "Terracotta Mood" },
  // Ajouté le 12/09/2026 : la page de garde du carrousel d'un carnet. Troisième tuile unie de la
  // famille, après l'ivoire (teaser 1) et le terracotta (teaser 3) — fond sable, aucune photo.
  // Décision de Soumia : dans un carrousel de carnet, les photos ne se découvrent qu'en défilant,
  // la première image ne montre rien. Elle annonce : la destination, et ce qu'il y a derrière.
  { id: "couverture", label: "Page de Garde" },
  { id: "carnet", label: "Carnet d'Adresse" },
];

// Formats de sortie (11/09/2026) : le même visuel sert sur plusieurs réseaux, mais pas au même
// gabarit. Pinterest est un moteur de recherche vertical — une image carrée y prend deux fois
// moins de place à l'écran et se fait dépasser par les épingles 2:3.
export type FormatId = "square" | "portrait" | "pin" | "story";

// `largeur` sert au calcul de finesse de l'export (12/09/2026) : l'aperçu ne fait que 420 px, et un
// export au double sortait des images de 840 px que les réseaux réétiraient. On vise la largeur
// réelle du gabarit.
export const FORMATS: {
  id: FormatId;
  label: string;
  ratio: string;
  hint: string;
  largeur: number;
}[] = [
  { id: "square", label: "Instagram · carré", ratio: "1 / 1", hint: "1080 × 1080", largeur: 1080 },
  // 4:5 ajouté le 12/09/2026 : c'est le gabarit des carrousels (1080 × 1350). Sans lui, la page de
  // garde exportée n'avait pas le même cadre que les slides qui la suivent, et Instagram recadrait.
  { id: "portrait", label: "Instagram · portrait", ratio: "4 / 5", hint: "1080 × 1350", largeur: 1080 },
  { id: "pin", label: "Pinterest · vertical", ratio: "2 / 3", hint: "1000 × 1500", largeur: 1000 },
  { id: "story", label: "Story · plein écran", ratio: "9 / 16", hint: "1080 × 1920", largeur: 1080 },
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
