// Modèle de données "Travel Match" — voir CLAUDE.md, section "Refactor moteur de matching
// Travel Match" pour le contexte, et section "Simplification du questionnaire" (23/08/2026) pour
// cette évolution : durée/budget en filtres, scores repensés en 6 axes indépendants, combos.

// DistanceFilter reste réservé aux destinations (Destination.filters.distance) — une destination
// n'est jamais "ouvert", seule une réponse utilisateur peut l'être. DistanceAnswer (26/08/2026,
// question "intensité de dépaysement") est le type de la réponse : "ouvert" désactive le filtre
// éliminatoire (cf. engine.ts hardConstraintBroken) et laisse les autres critères décider.
export type DistanceFilter = "proche" | "europe" | "long_courrier";
export type DistanceAnswer = DistanceFilter | "ouvert";
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
  // Remplace family_kids_under_6/family_kids_over_6 (27/08/2026, demande de Soumia) : le filtre
  // éliminatoire "enfant +/- 6 ans" est supprimé, un seul flag générique "adapté aux familles"
  // suffit pour le moteur de matching. La granularité par âge (tout-petits/enfants/ados/tribu
  // multi-âges) vit désormais uniquement dans FamilyProfile, côté questionnaire et personnalisation
  // des fiches hôtel — elle n'influence plus le filtrage/malus des destinations.
  family: boolean;
};

// Profil d'âge de la tribu, demandé uniquement quand companions === "famille" (27/08/2026).
// N'intervient pas dans le matching de destination (voir Logistics.family ci-dessus) : sert à
// personnaliser le pavé "Adapté aux Familles" sur les fiches hôtel.
export type FamilyProfile = "tout_petits" | "enfants_juniors" | "ados" | "tribu_multi_ages";

export const FAMILY_PROFILE_OPTIONS: { value: FamilyProfile; label: string }[] = [
  { value: "tout_petits", label: "👶 Tout-petits (-3 ans)" },
  { value: "enfants_juniors", label: "🎒 Enfants / Juniors (3-12 ans)" },
  { value: "ados", label: "🎧 Ados (13 ans+)" },
  { value: "tribu_multi_ages", label: "👨‍👩‍👧‍👦 Tribu multi-âges" },
];

// 7 axes indépendants (remplace l'ancien modèle émotions/vibe à 9 axes, décidé le 23/08/2026).
// "cadre de vie" bipolaire a été scindé en 2 curseurs indépendants (nature_plage à l'origine,
// effervescence_urbaine) pour permettre la détection de combo (un utilisateur peut vouloir les
// deux à la fois, ce qu'un seul axe bipolaire ne permettait pas de capter).
// `nature_plage` scindé à son tour en `nature`/`plage` le 29/08/2026 (demande Soumia) : un seul
// axe combiné confondait des destinations très différentes (Dubaï = plage sans nature, montagne
// japonaise = nature sans plage). MAX_DISTANCE (engine.ts) se recalcule automatiquement sur
// SCORE_KEYS.length, donc ce passage de 6 à 7 axes change mécaniquement le calibrage du score —
// voir engine.ts pour la note associée.
export const SCORE_KEYS = [
  "repos",
  "exploration",
  "gastronomie",
  "nature",
  "plage",
  "effervescence_urbaine",
  "rythme",
] as const;
export type ScoreKey = (typeof SCORE_KEYS)[number];
export type Scores = Record<ScoreKey, number>; // 1 à 5

// "tested_approved" = voyage vécu, qualifié par Soumia. "bucket_list" = repérage qualifié sur le
// terrain, pas encore vécu. "discovery" = suggestion algorithmique, ni vécu ni repéré. Reprend le
// système à 3 badges du spec Gemini du 21/08/2026 (mis de côté puis réintégré le 23/08/2026).
export type AuthenticityBadge = "tested_approved" | "bucket_list" | "discovery";

// Détails pratiques de la liaison entre les deux destinations du combo — décidé le 23/08/2026
// pour que la carte combo soit vraiment exploitable (pas juste "il y a une extension possible").
export type TransitionLogistics = {
  transport_mode: string; // ex. "Vol direct (1h30) ou train Amtrak (10h)"
  recommended_days: string; // ex. "4 à 5 jours sur place"
  practical_tip?: string; // ex. "Prendre le vol du matin pour profiter de l'après-midi au Mont-Royal"
  // Lien vers un partenaire/agence recommandé pour ce trajet (ex. forfait vol + hébergement).
  // Optionnel — beaucoup de combos n'auront pas de partenaire précis à recommander.
  partner_link?: string;
  partner_link_label?: string;
};

export type SuggestedCombo = {
  id: string;
  // Destination précise vers laquelle ce combo pointe — évite tout lien ambigu ou "effet miroir"
  // (décidé le 23/08/2026). Doit correspondre à un `Destination.id` réel, jamais à soi-même.
  target_destination_id: string;
  title: string; // ex. "Extension Nature & Culture : Montréal"
  vibe_type: string; // ex. "Plein air & Ambiance Québécoise"
  description: string;
  transition_logistics: TransitionLogistics;
  // Conservé en plus de la demande de Soumia du 23/08 (pas dans son dernier message, mais
  // nécessaire pour le filtre d'affichage "seulement si la durée choisie le permet" déjà validé
  // le 23/08/2026 — à retirer si elle préfère toujours afficher les combos dès qu'ils existent).
  min_duration_required: Extract<DurationFilter, "semaine" | "grand_voyage">;
};

// Comment se déplacer ENTRE les étapes d'une même destination (pas entre deux destinations
// différentes comme les combos) — pertinent pour les pays/régions multi-villes type Japon ou
// Italie. Optionnel : affiché seulement quand renseigné, décidé le 23/08/2026.
export type RegionalTransport = {
  recommended_mode: string; // ex. "Train à grande vitesse (Shinkansen)"
  pass_or_tip?: string; // ex. "Acheter le JR Pass en avance"
  summary: string; // ex. "Réseau ferroviaire ultra-dense et ponctuel, idéal pour relier les grandes villes sans voiture."
  // Dernier kilomètre gare/aéroport → centre-ville (30/08/2026, demande Soumia) — distinct de
  // pass_or_tip (conseil sur un pass/billet), ex. "Bus 12 pour rejoindre le centre-ville, taxi
  // environ 8€" pour Biarritz.
  to_city_center?: string;
};

// 4 cartes d'infos pratiques (28/08/2026) — texte descriptif prêt à afficher, distinct des champs
// de matching existants même si le sujet se recoupe parfois : `filters.transport`/`filters.duration`
// servent au filtrage (valeurs fermées), `regional_transport` couvre la mobilité ENTRE les étapes
// d'une destination multi-villes — `practical_info` est le pendant "fiche pratique" lisible
// directement sur la page, jamais généré automatiquement (voir .claude/skills/voyage-ingest) :
// Claude rédige à partir de ce que Soumia donne, ou laisse le champ vide plutôt que d'inventer.
export type PracticalInfo = {
  access?: string; // ex. "TGV direct depuis Paris (4h) ou vol vers Biarritz, voiture utile sur place"
  duration?: string; // ex. "3 jours / 2 nuits, idéal au printemps ou à l'automne"
  atmosphere?: string; // 3 mots-clés, ex. "Iodé, chic, décontracté"
  insider_tips?: string; // ex. "Réserver le restaurant du port à l'avance en juillet-août"
};

// "Quand y aller" conditionné à la préférence climat du questionnaire (29/08/2026) — ex. un
// voyageur qui a répondu "chaleur" et se retrouve avec Montréal en résultat (grâce à d'autres
// critères) doit voir "juillet-août" plutôt qu'un conseil générique toutes saisons. `default` sert
// de repli quand le climat demandé n'a pas d'entrée dédiée (ex. réponse "douceur", ou arrivée
// directe sur la fiche sans être passé par le questionnaire). Jamais généré automatiquement —
// vide tant que Soumia n'a pas donné le vrai conseil saisonnier destination par destination (voir
// .claude/skills/voyage-ingest).
export type WhenToGo = {
  default?: string; // ex. "Le printemps et l'automne restent les saisons les plus agréables."
  chaleur?: string; // ex. "Juillet-août, pour une vraie chaleur estivale."
  hiver_cosy?: string; // ex. "Décembre-février, pour la neige et l'ambiance cosy."
};

// Trajet de référence depuis Paris (30/08/2026, demande Soumia) — structuré (mode/durée/détail
// séparés) plutôt que texte libre, pour être affichable avec une icône dédiée dans le nouveau bloc
// "Climat & Quand partir". Recoupe partiellement practical_info.access (texte libre déjà existant,
// ex. "TGV direct depuis Paris (4h)...") — les deux coexistent, celui-ci sert l'affichage structuré.
export type TravelFromParis = {
  mode: string; // ex. "TGV Direct", "Vol direct"
  duration: string; // ex. "4h10", "14h50"
  details: string; // ex. "TGV InOui au départ de Paris Montparnasse"
  // Conseils de réservation (30/08/2026) — booking_platform/booking_url/advance_booking_notice
  // sont factuels (recherchés et vérifiés, comme le reste de travel_from_paris). insider_tip suit
  // la même règle stricte que practical_info.insider_tips : jamais généré automatiquement, vide
  // tant que Soumia n'a pas donné le vrai conseil vécu (ex. "réserve le siège D pour voir le Mont
  // Fuji") — ne PAS confondre avec practical_info.insider_tips, champ différent, à ne pas dupliquer
  // sans raison si un seul des deux suffit pour une destination donnée.
  booking_platform?: string; // ex. "SmartEX (App officielle JR)", "SNCF Connect"
  booking_url?: string;
  advance_booking_notice?: string; // ex. "Ouverture des ventes 30 jours avant"
  insider_tip?: string;
};

export type SeasonWeather = {
  avg_temp: string; // ex. "22°C" — texte libre, pas de valeur numérique isolée ailleurs dans le schéma
  tip: string; // conseil d'ambiance court, ex. "Idéal pour les terrasses, penser à réserver"
};

// Saisonnalité réelle (30/08/2026, demande Soumia) — données factuelles (températures, meilleure
// période) recherchées et vérifiées par Claude, PAS le contenu narratif/vécu du reste du site
// (review, intro, tagline...) qui reste strictement réservé à ce que Soumia donne elle-même. Champ
// optionnel, absent tant qu'aucune recherche n'a été faite/validée pour la destination.
export type Seasonality = {
  best_months: string[]; // ex. ["Avril", "Mai", "Septembre", "Octobre"]
  peak_season: string[]; // ex. ["Juillet", "Août"]
  weather_profile: {
    spring: SeasonWeather;
    summer: SeasonWeather;
    autumn: SeasonWeather;
    winter: SeasonWeather;
  };
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
  regional_transport?: RegionalTransport;
  practical_info?: PracticalInfo;
  when_to_go?: WhenToGo;
  travel_from_paris?: TravelFromParis;
  seasonality?: Seasonality;
};

// "famille_moins_6"/"famille_plus_6" fusionnés en une seule valeur "famille" (27/08/2026, demande
// de Soumia) — le détail d'âge est maintenant capté par FamilyProfile (sous-question conditionnelle),
// plus par deux options de companions séparées.
export type Companions = "solo" | "duo" | "amis" | "famille";

// Réponses collectées par le questionnaire, dans le langage direct du modèle.
export type UserAnswers = {
  filters: {
    distance: DistanceAnswer;
    climate: ClimateFilter;
    transport: TransportFilter;
    sport_level: SportLevelFilter;
    duration: DurationFilter;
    budget: BudgetFilter;
  };
  companions: Companions;
  // Renseigné uniquement quand companions === "famille" (sous-question conditionnelle, 27/08/2026).
  familyProfile?: FamilyProfile;
  scores: Scores;
};

export const COMPANIONS_TO_LOGISTICS_KEY: Record<Companions, keyof Logistics> = {
  solo: "solo",
  duo: "duo",
  amis: "friends",
  famille: "family",
};
