import { LVE_COLORS } from "@/lib/design-tokens";

export type PresetId =
  | "minimalist"
  | "editorial"
  | "terracotta-mood"
  | "couverture"
  | "emotion"
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
  // Ajouté le 12/09/2026 pour la série des six envies (Flâner, Déguster, Respirer, Lâcher prise,
  // Vibrer, Bouger — les six cartes du questionnaire). Un post = deux images : le mot seul sur
  // fond obsidienne, puis la photo au swipe. Le sélecteur de face évite de ressaisir le texte
  // entre les deux exports.
  { id: "emotion", label: "Émotion" },
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

// Les deux faces d'un post "Émotion" (12/09/2026). Même contenu, deux images : la grille du profil
// ne montre que la première, donc les six posts y forment un bloc de six mots sur fond sombre, et
// la photo ne se découvre qu'en défilant — la règle posée pour les carnets, tenue ici aussi.
export type FaceId = "mot" | "photo";

export const FACES: { id: FaceId; label: string }[] = [
  { id: "mot", label: "1 · le mot" },
  { id: "photo", label: "2 · la photo" },
];

// Les six envies, avec leur couleur (12/09/2026). Soumia : six tuiles identiques ne contrastent pas
// dans la grille. On fait donc varier le fond — mais uniquement dans la charte, qui compte
// justement six couleurs profondes déjà utilisées ailleurs sur le site. Rien d'inventé pour
// l'occasion, et surtout six teintes de valeur équivalente : la grille varie en teinte, pas en
// poids, donc les six posts restent un bloc au lieu de virer à l'arc-en-ciel.
//
// L'association n'est pas décorative : le cuivre pour la pierre chaude des vieilles rues, le
// terracotta de la marque pour la table, la sauge pour le vert, l'océan pour la mer, la prune pour
// la nuit, l'ardoise pour l'effort du matin.
export const ENVIES: { verbe: string; phrase: string; fond: string }[] = [
  { verbe: "Flâner", phrase: "Des ruelles, des artisans, des histoires", fond: LVE_COLORS.terracotta.copperSmoke },
  { verbe: "Déguster", phrase: "Prendre le temps de bien manger", fond: LVE_COLORS.terracotta.dark },
  { verbe: "Respirer", phrase: "De l'espace, du vert, du silence", fond: LVE_COLORS.sage.dark },
  { verbe: "Lâcher prise", phrase: "La mer, le sel, le temps qui s'étire", fond: LVE_COLORS.ocean.dark },
  { verbe: "Vibrer", phrase: "De l'énergie, du monde, des nuits", fond: LVE_COLORS.plum.dark },
  { verbe: "Bouger", phrase: "Des journées pleines, se dépenser", fond: LVE_COLORS.slate.dark },
];
