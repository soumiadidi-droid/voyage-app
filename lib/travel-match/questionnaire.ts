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

// Écran d'intentions (11/09/2026) — remplace les deux écrans de curseurs.
//
// Pourquoi : un curseur demande de NOTER une envie de 1 à 5. C'est un geste d'analyste, pas de
// voyageur, et sur mobile c'est pénible. Sept curseurs répartis sur deux écrans arrivaient en plus
// à la fin d'un parcours déjà long, une fois l'élan retombé.
//
// Ce que ça ne change PAS : chaque carte correspond à un axe de score existant, et la sélection
// produit exactement les mêmes valeurs qu'avant (axe choisi = 5, axe non choisi = 3, la valeur
// neutre qu'avait le curseur par défaut). Le moteur de matching, la page de résultats et l'adresse
// transmise sont inchangés — voir QuestionnaireClient.submit.
// `image` : photos libres de droit (licence Unsplash), choisies le 11/09/2026 à la demande de
// Soumia et regardées une par une avant d'être posées. Ses propres photos avaient été essayées
// d'abord, mais elles illustrent des LIEUX, pas des envies — deux plages différentes se
// retrouvaient sur deux intentions distinctes, ce qui brouillait la lecture. Même logique et mêmes
// crédits que lib/hero-images.ts.
export type CardDef = { key: ScoreKey; label: string; hint: string; image: string };

export type CardsQuestion = {
  type: "cards";
  id: "intentions";
  question: string;
  helper: string;
  min: number;
  max: number;
  cards: CardDef[];
};

export type TravelMatchQuestion = ChoiceQuestion | CardsQuestion;

export const TRAVEL_MATCH_QUESTIONS: TravelMatchQuestion[] = [
  {
    type: "cards",
    id: "intentions",
    question: "De quoi as-tu profondément envie ?",
    helper: "Choisissez-en deux ou trois",
    min: 2,
    max: 3,
    cards: [
      // Moulin de Mykonos — Jason Mavrommatis, https://unsplash.com/photos/tc5z7vlztuY
      { image: "https://images.unsplash.com/photo-1494356830678-78f6cd754f1a?fm=jpg&q=80&w=1200&auto=format&fit=crop", key: "repos", label: "Déconnecter", hint: "Ne penser à rien, souffler" },
      // Duomo de Florence au lever du jour — Henrique Ferreira, https://unsplash.com/photos/zMFxCtkn9vI
      { image: "https://images.unsplash.com/photo-1776377231754-d36928e6ee4d?fm=jpg&q=80&w=1200&auto=format&fit=crop", key: "exploration", label: "Nourrir sa curiosité", hint: "Voir autre chose, comprendre" },
      // Table de mezze — Hari Nandakumar, https://unsplash.com/photos/fi9kJ8-8BEk
      { image: "https://images.unsplash.com/photo-1534824394572-a24ff25bbb5e?fm=jpg&q=80&w=1200&auto=format&fit=crop", key: "gastronomie", label: "Se régaler", hint: "Prendre le temps de bien manger" },
      // Sentier dans les Dolomites — Vadim Matei, https://unsplash.com/photos/RpY04izMaeo
      { image: "https://images.unsplash.com/photo-1786352260444-20539d92fee0?fm=jpg&q=80&w=1200&auto=format&fit=crop", key: "nature", label: "Le grand air", hint: "De l'espace, du vert, du silence" },
      // Balos Beach, Crète — Ignacio Correia, https://unsplash.com/photos/C5eXdxCS74c
      { image: "https://images.unsplash.com/photo-1585320806322-db6d9f35b0c8?fm=jpg&q=80&w=1200&auto=format&fit=crop", key: "plage", label: "Le bord de l'eau", hint: "La mer, le sel, lâcher prise" },
      // Rue de Shinjuku la nuit — Johan Mouchet, https://unsplash.com/photos/wZLX8vQqa08
      { image: "https://images.unsplash.com/photo-1749813482475-3c12a8c4a5bd?fm=jpg&q=80&w=1200&auto=format&fit=crop", key: "effervescence_urbaine", label: "Une ville qui vibre", hint: "De l'énergie, du monde, des nuits" },
      // Deux surfeurs entrant dans l'eau — Ivo Sousa Martins, https://unsplash.com/photos/f4UBbjjvkCg
      { image: "https://images.unsplash.com/photo-1745594151310-d771b97211cc?fm=jpg&q=80&w=1200&auto=format&fit=crop", key: "rythme", label: "Bouger", hint: "Des journées pleines, se dépenser" },
    ],
  },
  {
    type: "choice",
    id: "duration",
    question: "Combien de temps peux-tu couper le contact ?",
    options: [
      { value: "week_end", label: "Un week-end, 2 à 4 jours" },
      { value: "semaine", label: "Une semaine, 5 à 8 jours" },
      { value: "grand_voyage", label: "Un grand voyage, 9 jours et plus" },
    ],
  },
  {
    type: "choice",
    id: "budget",
    question: "Quel budget, pour que le plaisir reste entier ?",
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
    question: "Jusqu'où irais-tu pour changer d'air ?",
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
    question: "Quelle lumière te fait du bien ?",
    options: [
      { value: "chaleur", label: "Le plein soleil, sans négociation" },
      { value: "douceur", label: "Le climat parfait (ni canicule, ni doudoune)" },
      { value: "hiver_cosy", label: "Ambiance plaid, feu de cheminée et gros pull" },
    ],
  },
  {
    type: "choice",
    id: "transport",
    question: "Une fois sur place, comment aimes-tu explorer ?",
    options: [
      { value: "sans_voiture", label: "À pied, en train, à vélo — sans voiture" },
      { value: "voiture_necessaire", label: "Au volant, pour s'arrêter où l'on veut" },
      { value: "transports_possibles", label: "Je m'adapte, tant qu'on arrive à bon port" },
    ],
  },
  {
    type: "choice",
    id: "sport_level",
    question: "Et l'effort physique, tu en veux un peu, ou pas du tout ?",
    options: [
      { value: "tranquille", label: "Aucun, je ne me force sur rien" },
      { value: "actif", label: "Volontiers, marcher et grimper ne me fait pas peur" },
    ],
  },
  {
    type: "choice",
    id: "companions",
    question: "Avec qui partages-tu cette échappée ?",
    options: [
      { value: "solo", label: "Solo" },
      { value: "duo", label: "En duo, en amoureux" },
      { value: "amis", label: "Entre amis" },
      { value: "famille", label: "En famille" },
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
  question: "Quel est le profil de ta tribu ?",
  options: FAMILY_PROFILE_OPTIONS,
};
