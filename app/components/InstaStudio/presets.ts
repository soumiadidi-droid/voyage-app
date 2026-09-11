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
