import type { ScoreKey } from "./types";

// Copy validée par Soumia le 22/08/2026, complétée le 23/08/2026 (durée, budget, nouveaux
// sliders repos/exploration/gastronomie/nature_plage/effervescence_urbaine/rythme). Ne pas
// reformuler sans qu'elle le demande (même règle que pour les scores sport).
//
// Refonte de ton "humour, second degré & lifestyle" (23/08/2026) — 5 des 9 intitulés de question
// reformulés par Soumia (duration, companions, budget, sport_level, emotions). distance, climate,
// transport et ambiance gardent l'ancien ton "tu" neutre, pas reformulés faute de consigne — à
// harmoniser si Soumia le demande.

export type ChoiceOption = { value: string; label: string };

export type ChoiceQuestion = {
  type: "choice";
  id: "duration" | "budget" | "distance" | "climate" | "transport" | "sport_level" | "companions";
  question: string;
  options: ChoiceOption[];
};

export type SliderDef = {
  key: ScoreKey;
  label: string;
  lowLabel?: string;
  highLabel?: string;
};

export type SlidersQuestion = {
  type: "sliders";
  id: "emotions" | "ambiance";
  question: string;
  helper: string;
  sliders: SliderDef[];
};

export type TravelMatchQuestion = ChoiceQuestion | SlidersQuestion;

export const TRAVEL_MATCH_QUESTIONS: TravelMatchQuestion[] = [
  {
    type: "choice",
    id: "duration",
    question: "Tu te fais la malle combien de temps ?",
    options: [
      { value: "week_end", label: "Un week-end, 2 à 4 jours" },
      { value: "semaine", label: "Une semaine, 5 à 8 jours" },
      { value: "grand_voyage", label: "Un grand voyage, 9 jours et plus" },
    ],
  },
  {
    type: "choice",
    id: "budget",
    question: "Côté porte-monnaie, on vise quel niveau de kiff ?",
    options: [
      { value: "eco", label: "Petit budget, je fais des choix malins" },
      { value: "confort", label: "Confort, sans me ruiner" },
      { value: "premium", label: "Premium, je me fais plaisir" },
    ],
  },
  // Reformulé le 26/08/2026 (orienté intention/dépaysement plutôt que géographie brute) + ajout de
  // l'option "ouvert" : proche/europe/long_courrier filtrent le catalogue de façon stricte, "ouvert"
  // ne filtre rien (cf. lib/travel-match/engine.ts, DistanceAnswer).
  {
    type: "choice",
    id: "distance",
    question: "Quelle est l'intensité de dépaysement recherchée pour ce voyage ?",
    options: [
      { value: "proche", label: "Échappée proche (France) — Rester dans l'hexagone, privilégier la proximité." },
      { value: "europe", label: "Escale européenne — Changer d'air sans partir à l'autre bout du monde." },
      { value: "long_courrier", label: "Le grand large — Partir loin, changer de continent." },
      { value: "ouvert", label: "L'inspiration avant tout (Surprenez-moi) — Je cherche une émotion, peu importe la distance." },
    ],
  },
  {
    type: "choice",
    id: "climate",
    question: "Quel temps veux-tu retrouver là-bas ?",
    options: [
      { value: "chaleur", label: "Une vraie chaleur, soleil garanti" },
      { value: "douceur", label: "Une douceur agréable, ni trop chaud ni trop froid" },
      { value: "hiver_cosy", label: "Un hiver enneigé & cosy, quitte à sortir la grosse doudoune" },
    ],
  },
  {
    type: "choice",
    id: "transport",
    question: "Comment tu te déplaces une fois sur place ?",
    options: [
      { value: "sans_voiture", label: "Zéro voiture, tout à pied ou en transports" },
      { value: "transports_possibles", label: "Peu importe, selon les besoins" },
      { value: "voiture_necessaire", label: "Une voiture, indispensable" },
    ],
  },
  {
    type: "choice",
    id: "sport_level",
    question: "À quelle vitesse tu veux voir couler tes journées ?",
    options: [
      { value: "tranquille", label: "Tranquille, je ne me force sur rien" },
      { value: "actif", label: "Actif, j'aime bouger et remplir mes journées" },
    ],
  },
  {
    type: "choice",
    id: "companions",
    question: "C'est qui le crew pour cette aventure ?",
    options: [
      { value: "solo", label: "Solo" },
      { value: "duo", label: "En duo, en amoureux" },
      { value: "amis", label: "Entre amis" },
      { value: "famille_moins_6", label: "En famille, avec un enfant de moins de 6 ans" },
      { value: "famille_plus_6", label: "En famille, avec des enfants de plus de 6 ans" },
    ],
  },
  {
    type: "sliders",
    id: "emotions",
    question: "C'est quoi la priorité absolue pour que ton séjour soit un succès ?",
    helper: "1 = pas du tout, 5 = complètement",
    sliders: [
      { key: "repos", label: "Repos & déconnexion, ne penser à rien" },
      { key: "exploration", label: "Découverte & exploration, sortir des sentiers battus" },
      { key: "gastronomie", label: "Gastronomie & épicurisme, se régaler avant tout" },
    ],
  },
  {
    type: "sliders",
    id: "ambiance",
    question: "Et niveau ambiance ?",
    helper: "Ajuste chaque curseur selon ton envie",
    sliders: [
      { key: "nature_plage", label: "Envie de nature, de plage, de grands espaces" },
      { key: "effervescence_urbaine", label: "Envie de ville, d'animation, d'effervescence urbaine" },
      {
        key: "rythme",
        label: "Rythme du séjour",
        lowLabel: "Slow, libre",
        highLabel: "Actif, minuté",
      },
    ],
  },
];
