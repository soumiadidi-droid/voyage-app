import { FAMILY_PROFILE_OPTIONS, type ScoreKey } from "./types";

// Copy validée par Soumia le 22/08/2026, complétée le 23/08/2026 (durée, budget, nouveaux
// sliders repos/exploration/gastronomie/nature_plage/effervescence_urbaine/rythme). Ne pas
// reformuler sans qu'elle le demande (même règle que pour les scores sport).
//
// Slider nature_plage scindé en deux (nature / plage) le 29/08/2026 (demande Soumia, split de
// l'axe de score correspondant — voir types.ts). Libellés ci-dessous = première passe de Claude
// (simple découpe du libellé combiné d'origine, pas une reformulation de ton), à valider comme le
// reste de la copy.
//
// Refonte de ton "humour, second degré & lifestyle" (23/08/2026) — 5 des 9 intitulés de question
// reformulés par Soumia (duration, companions, budget, sport_level, emotions). distance, climate,
// transport et ambiance harmonisés au même ton le 29/08/2026 (titre + options pour distance/
// climate/transport, titre seul pour ambiance — les libellés des curseurs n'ont pas été redonnés
// cette fois, inchangés).

export type ChoiceOption = { value: string; label: string };

export type ChoiceQuestion = {
  type: "choice";
  id:
    | "duration"
    | "budget"
    | "distance"
    | "climate"
    | "transport"
    | "sport_level"
    | "companions"
    | "familyProfile";
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
  // ne filtre rien (cf. lib/travel-match/engine.ts, DistanceAnswer). Raccourci le 29/08/2026
  // (demande Gemini transmise par Soumia — "aller droit au but", exemple donné tel quel).
  {
    type: "choice",
    id: "distance",
    question: "Tu es prêt à faire combien de bornes ?",
    options: [
      { value: "proche", label: "À deux pas (la France, c'est très bien)" },
      { value: "europe", label: "Un petit saut de puce en Europe" },
      { value: "long_courrier", label: "On passe plusieurs fuseaux horaires, je veux du vrai dépaysement" },
      { value: "ouvert", label: "L'inspiration avant tout (surprends-moi, même au bout de la rue)" },
    ],
  },
  {
    type: "choice",
    id: "climate",
    question: "Côté météo, tu signes pour quoi ?",
    options: [
      { value: "chaleur", label: "Full soleil, option maillot et crème solaire 50" },
      { value: "douceur", label: "Le climat parfait (ni canicule, ni doudoune)" },
      { value: "hiver_cosy", label: "Ambiance plaid, feu de cheminée et gros pull" },
    ],
  },
  {
    type: "choice",
    id: "transport",
    question: "Une fois sur place, on bouge comment ?",
    options: [
      { value: "sans_voiture", label: "Team 100 % à pied, train ou vélo (zéro stress de créneau)" },
      { value: "voiture_necessaire", label: "Team roadtrip, j'aime avoir les clés et tracer" },
      { value: "transports_possibles", label: "Je m'adapte, tant qu'on arrive à bon port" },
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
      { value: "famille", label: "En famille" },
    ],
  },
  {
    type: "sliders",
    id: "emotions",
    // Raccourci le 29/08/2026 (demande Gemini, "aller droit au but").
    question: "C'est quoi ta priorité pour ce séjour ?",
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
    question: "C'est quoi ton décor idéal pour décrocher ?",
    helper: "Ajuste chaque curseur selon ton envie",
    sliders: [
      { key: "nature", label: "Envie de nature, de grands espaces" },
      { key: "plage", label: "Envie de plage, de bord de mer" },
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

// Sous-question conditionnelle (27/08/2026) : affichée uniquement quand la réponse à "companions"
// vaut "famille", juste après cette question, avant d'enchaîner sur les émotions/ambiance. Hors du
// tableau TRAVEL_MATCH_QUESTIONS car son affichage dépend d'une réponse précédente — insérée
// dynamiquement par QuestionnaireClient (voir getEffectiveQuestions). N'influence pas le matching de
// destination, sert uniquement à personnaliser le pavé "Adapté aux Familles" des fiches hôtel.
export const FAMILY_PROFILE_QUESTION: ChoiceQuestion = {
  type: "choice",
  id: "familyProfile",
  question: "Quel est le profil de votre tribu ?",
  options: FAMILY_PROFILE_OPTIONS,
};
