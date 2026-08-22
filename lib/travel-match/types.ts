// Modèle de données "Travel Match" — voir CLAUDE.md, section "Refactor moteur de matching
// Travel Match" pour le contexte, et section "Simplification du questionnaire" (23/08/2026) pour
// cette évolution : durée/budget en filtres, scores repensés en 6 axes indépendants, combos.

export type DistanceFilter = "proche" | "europe" | "long_courrier";
export type ClimateFilter = "chaleur" | "douceur" | "hiver_cosy";
export type TransportFilter = "sans_voiture" | "transports_possibles" | "voiture_necessaire";
export type SportLevelFilter = "tranquille" | "actif";
export type DurationFilter = "week_end" | "semaine" | "grand_voyage";
export type BudgetFilter = "eco" | "confort" | "premium";

export type Filters = {
  distance: DistanceFilter[];
  climate: ClimateFilter[];
  transport: TransportFilter[];
  sport_level: SportLevelFilter[];
  duration: DurationFilter[];
  budget: BudgetFilter[];
};

export type Logistics = {
  solo: boolean;
  duo: boolean;
  friends: boolean;
  family_kids_under_6: boolean;
  family_kids_over_6: boolean;
};

// 6 axes indépendants (remplace l'ancien modèle émotions/vibe à 9 axes, décidé le 23/08/2026).
// "cadre de vie" bipolaire a été scindé en 2 curseurs indépendants (nature_plage,
// effervescence_urbaine) pour permettre la détection de combo (un utilisateur peut vouloir les
// deux à la fois, ce qu'un seul axe bipolaire ne permettait pas de capter).
export const SCORE_KEYS = [
  "repos",
  "exploration",
  "gastronomie",
  "nature_plage",
  "effervescence_urbaine",
  "rythme",
] as const;
export type ScoreKey = (typeof SCORE_KEYS)[number];
export type Scores = Record<ScoreKey, number>; // 1 à 5

// "tested_approved" = voyage vécu, qualifié par Soumia. "bucket_list" = repérage qualifié sur le
// terrain, pas encore vécu. "discovery" = suggestion algorithmique, ni vécu ni repéré. Reprend le
// système à 3 badges du spec Gemini du 21/08/2026 (mis de côté puis réintégré le 23/08/2026).
export type AuthenticityBadge = "tested_approved" | "bucket_list" | "discovery";

export type SuggestedCombo = {
  id: string;
  title: string; // ex. "Extension Plage : Tulum"
  duration: string; // ex. "4 à 5 jours" — texte libre, pas une valeur de DurationFilter
  transport_type: string; // ex. "Vol interne (3h)"
  vibe_type: string; // ex. "Lâcher-prise & Tropiques"
  description: string;
  min_duration_required: Extract<DurationFilter, "semaine" | "grand_voyage">;
};

export type Destination = {
  id: string;
  title: string;
  authenticity_badge: AuthenticityBadge;
  content_slug: string;
  summary: string;
  hero_image: string;
  filters: Filters;
  scores: Scores;
  logistics: Logistics;
  tags: string[];
  // Combos/extensions proposés pour cette destination — contenu éditorial de Soumia, pas généré.
  // Affichés sur la fiche détail uniquement si la durée choisie par l'utilisateur le permet
  // (min_duration_required). Vide par défaut, à peupler destination par destination.
  suggested_combos: SuggestedCombo[];
};

export type Companions = "solo" | "duo" | "amis" | "famille_moins_6" | "famille_plus_6";

// Réponses collectées par le questionnaire, dans le langage direct du modèle.
export type UserAnswers = {
  filters: {
    distance: DistanceFilter;
    climate: ClimateFilter;
    transport: TransportFilter;
    sport_level: SportLevelFilter;
    duration: DurationFilter;
    budget: BudgetFilter;
  };
  companions: Companions;
  scores: Scores;
};

export const COMPANIONS_TO_LOGISTICS_KEY: Record<Companions, keyof Logistics> = {
  solo: "solo",
  duo: "duo",
  amis: "friends",
  famille_moins_6: "family_kids_under_6",
  famille_plus_6: "family_kids_over_6",
};
