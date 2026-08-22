import {
  COMPANIONS_TO_LOGISTICS_KEY,
  SCORE_KEYS,
  type Destination,
  type UserAnswers,
} from "./types";
import { DESTINATIONS } from "./destinations";

// Distance euclidienne max théorique sur 6 axes (repos/exploration/gastronomie/nature_plage/
// effervescence_urbaine/rythme), échelle 1-5 donc écart max de 4 par axe : sqrt(6 * 4^2).
const MAX_DISTANCE = Math.sqrt(SCORE_KEYS.length * Math.pow(4, 2));

function euclideanScore(user: UserAnswers, dest: Destination): number {
  let sumSquaredDiffs = 0;
  for (const key of SCORE_KEYS) {
    sumSquaredDiffs += Math.pow(user.scores[key] - dest.scores[key], 2);
  }
  const distance = Math.sqrt(sumSquaredDiffs);
  const rawScore = 100 * (1 - distance / MAX_DISTANCE);
  // Calibration : remonte les scores vers la fourchette 70-98% pour un rendu plus positif,
  // décidé par Soumia le 22/08/2026 (objectif 70-90% sur les bons matchs). Constantes inchangées
  // par le passage de 9 à 6 axes : rawScore est déjà normalisé 0-100 quel que soit le nombre d'axes.
  return Math.round(70 + rawScore * 0.28);
}

type FilterCheck = { ok: boolean; label: string };

// Un check par critère de filtrage strict, avec le libellé à afficher dans le badge
// d'avertissement du mode fallback (ex. "⚠️ Transport différent de ta recherche").
function filterChecks(user: UserAnswers, dest: Destination): FilterCheck[] {
  const logisticsKey = COMPANIONS_TO_LOGISTICS_KEY[user.companions];
  // Règle produit du 23/08/2026 : un week-end élimine d'office les destinations long-courrier,
  // même si la donnée de la destination autoriserait par erreur "week_end" dans son propre
  // filtre duration — garde-fou appliqué au niveau du moteur, pas seulement de la donnée.
  const weekendVsLongCourrier =
    !(user.filters.duration === "week_end" && dest.filters.distance.includes("long_courrier") &&
      !dest.filters.distance.some((d) => d !== "long_courrier"));

  return [
    { ok: dest.filters.distance.includes(user.filters.distance), label: "Distance différente de ta recherche" },
    { ok: dest.filters.climate.includes(user.filters.climate), label: "Climat différent de ta recherche" },
    { ok: dest.filters.transport.includes(user.filters.transport), label: "Transport différent de ta recherche" },
    { ok: dest.filters.sport_level.includes(user.filters.sport_level), label: "Niveau physique différent de ta recherche" },
    { ok: dest.filters.duration.includes(user.filters.duration), label: "Durée de séjour différente de ta recherche" },
    { ok: dest.filters.budget.includes(user.filters.budget), label: "Budget différent de ta recherche" },
    { ok: weekendVsLongCourrier, label: "Pas adapté à un week-end (destination long-courrier)" },
    { ok: dest.logistics[logisticsKey], label: "Pas adapté à ta configuration de voyage" },
  ];
}

function passesStrictFilters(user: UserAnswers, dest: Destination): boolean {
  return filterChecks(user, dest).every((c) => c.ok);
}

// Combo : détecté quand l'utilisateur exprime une envie forte à la fois de nature/plage et
// d'effervescence urbaine (deux curseurs indépendants, décidé le 23/08/2026 précisément pour
// permettre cette détection — impossible avec un seul axe bipolaire). Affiché comme un badge
// visuel sur la carte résultat, sans influencer le score (validé par Soumia le 23/08/2026).
const COMBO_THRESHOLD = 4;

function hasComboOpportunity(user: UserAnswers, dest: Destination): boolean {
  return (
    dest.suggested_combos.length > 0 &&
    user.scores.nature_plage >= COMBO_THRESHOLD &&
    user.scores.effervescence_urbaine >= COMBO_THRESHOLD
  );
}

export type ScoredDestination = {
  destination: Destination;
  score: number;
  brokenFilters: string[]; // vide en mode normal, rempli seulement en mode fallback
  hasComboOpportunity: boolean;
};

export type MatchOutcome = {
  fallback: boolean;
  results: ScoredDestination[];
};

export function matchTravel(user: UserAnswers, destinations: Destination[] = DESTINATIONS): MatchOutcome {
  const eligible = destinations.filter((d) => passesStrictFilters(user, d));

  if (eligible.length > 0) {
    const results = eligible
      .map((destination) => ({
        destination,
        score: euclideanScore(user, destination),
        brokenFilters: [],
        hasComboOpportunity: hasComboOpportunity(user, destination),
      }))
      .sort((a, b) => b.score - a.score);
    return { fallback: false, results };
  }

  // Fallback : aucune destination ne passe le filtrage strict — on l'ignore et on renvoie le
  // Top 3 au score global, avec le détail des critères non respectés pour affichage en badge
  // d'avertissement (comportement validé par Soumia le 22/08/2026).
  const results = destinations
    .map((destination) => ({
      destination,
      score: euclideanScore(user, destination),
      brokenFilters: filterChecks(user, destination)
        .filter((c) => !c.ok)
        .map((c) => c.label),
      hasComboOpportunity: hasComboOpportunity(user, destination),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return { fallback: true, results };
}
