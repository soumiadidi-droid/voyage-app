// Nouveau modèle de données "Travel Match" — voir CLAUDE.md, section
// "Refactor moteur de matching Travel Match" pour le contexte et les décisions.

export type DistanceFilter = "proche" | "europe" | "long_courrier";
export type ClimateFilter = "chaleur" | "douceur" | "hiver_cosy";
export type TransportFilter = "sans_voiture" | "transports_possibles" | "voiture_necessaire";
export type SportLevelFilter = "tranquille" | "actif";

export type Filters = {
  distance: DistanceFilter[];
  climate: ClimateFilter[];
  transport: TransportFilter[];
  sport_level: SportLevelFilter[];
};

export type Logistics = {
  solo_friendly: boolean;
  duo_romantic: boolean;
  friends_group: boolean;
  family_kids_under_6: boolean;
  family_kids_over_6: boolean;
};

export const EMOTION_KEYS = [
  "deconnexion",
  "emerveillement",
  "reconnexion",
  "lacher_prise",
  "inspiration",
] as const;
export type EmotionKey = (typeof EMOTION_KEYS)[number];
export type Emotions = Record<EmotionKey, number>; // 1 à 5

export const VIBE_KEYS = ["pression_horaire", "densite_urbaine", "gourmandise", "nature"] as const;
export type VibeKey = (typeof VIBE_KEYS)[number];
export type Vibe = Record<VibeKey, number>; // 1 à 5

// "tested" = voyage vécu, qualifié par Soumia. "wishlist" = voyage recherché/projeté, pas encore
// fait (décidé le 22/08/2026).
export type DestinationStatus = "tested" | "wishlist";

export type Destination = {
  id: string;
  title: string;
  status: DestinationStatus;
  content_slug: string;
  summary: string;
  hero_image: string;
  filters: Filters;
  emotions: Emotions;
  vibe: Vibe;
  logistics: Logistics;
  tags: string[];
};

export type Companions = "solo" | "duo" | "amis" | "famille_moins_6" | "famille_plus_6";

// Réponses collectées par le questionnaire, dans le langage direct du nouveau modèle.
export type UserAnswers = {
  filters: {
    distance: DistanceFilter;
    climate: ClimateFilter;
    transport: TransportFilter;
    sport_level: SportLevelFilter;
  };
  companions: Companions;
  emotions: Emotions;
  vibe: Vibe;
};

export const COMPANIONS_TO_LOGISTICS_KEY: Record<Companions, keyof Logistics> = {
  solo: "solo_friendly",
  duo: "duo_romantic",
  amis: "friends_group",
  famille_moins_6: "family_kids_under_6",
  famille_plus_6: "family_kids_over_6",
};
