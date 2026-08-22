import type { EmotionKey, VibeKey } from "./types";

// Copy validée par Soumia le 22/08/2026 — voir CLAUDE.md, section "Refactor moteur de matching
// Travel Match". Ne pas reformuler sans qu'elle le demande (même règle que pour les scores sport).

export type ChoiceOption = { value: string; label: string };

export type ChoiceQuestion = {
  type: "choice";
  id: "distance" | "climate" | "transport" | "sport_level" | "companions";
  question: string;
  options: ChoiceOption[];
};

export type SliderDef = {
  key: EmotionKey | VibeKey;
  label: string;
  lowLabel?: string;
  highLabel?: string;
};

export type SlidersQuestion = {
  type: "sliders";
  id: "emotions" | "vibe";
  question: string;
  helper: string;
  sliders: SliderDef[];
};

export type TravelMatchQuestion = ChoiceQuestion | SlidersQuestion;

export const TRAVEL_MATCH_QUESTIONS: TravelMatchQuestion[] = [
  {
    type: "choice",
    id: "distance",
    question: "Où as-tu envie d'aller ?",
    options: [
      { value: "proche", label: "Je reste en France (ou tout près)" },
      { value: "europe", label: "Une évasion en Europe" },
      { value: "long_courrier", label: "Je pars loin, ça se mérite" },
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
    question: "Ton rythme sur place ?",
    options: [
      { value: "tranquille", label: "Tranquille, je ne me force sur rien" },
      { value: "actif", label: "Actif, j'aime bouger et remplir mes journées" },
    ],
  },
  {
    type: "choice",
    id: "companions",
    question: "Avec qui tu pars ?",
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
    question: "Qu'est-ce que tu recherches, au fond ?",
    helper: "1 = pas du tout, 5 = complètement",
    sliders: [
      { key: "deconnexion", label: "Déconnexion totale, couper avec le quotidien" },
      { key: "emerveillement", label: "Émerveillement, en prendre plein les yeux" },
      { key: "reconnexion", label: "Reconnexion (à soi, à l'autre, à l'essentiel)" },
      { key: "lacher_prise", label: "Lâcher-prise, ne rien avoir à gérer" },
      { key: "inspiration", label: "Inspiration, revenir avec des idées plein la tête" },
    ],
  },
  {
    type: "sliders",
    id: "vibe",
    question: "Et niveau ambiance ?",
    helper: "Le curseur part du milieu — glisse-le vers le pôle qui te parle",
    sliders: [
      { key: "pression_horaire", label: "Programme dense", lowLabel: "Très slow", highLabel: "Programme minuté" },
      { key: "densite_urbaine", label: "Grande ville", lowLabel: "Nature brute", highLabel: "Pleine métropole" },
      { key: "gourmandise", label: "Gastronomie", lowLabel: "Secondaire", highLabel: "Priorité absolue" },
      { key: "nature", label: "Nature", lowLabel: "Plutôt ville", highLabel: "100% nature" },
    ],
  },
];
