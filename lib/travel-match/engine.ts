import {
  COMPANIONS_TO_LOGISTICS_KEY,
  EMOTION_KEYS,
  VIBE_KEYS,
  type Destination,
  type UserAnswers,
} from "./types";
import { DESTINATIONS } from "./destinations";

// Distance euclidienne max théorique sur 9 axes (5 émotions + 4 vibe), échelle 1-5 donc écart
// max de 4 par axe : sqrt(9 * 4^2) = 12.
const MAX_DISTANCE = Math.sqrt(9 * Math.pow(4, 2));

function euclideanScore(user: UserAnswers, dest: Destination): number {
  let sumSquaredDiffs = 0;
  for (const key of EMOTION_KEYS) {
    sumSquaredDiffs += Math.pow(user.emotions[key] - dest.emotions[key], 2);
  }
  for (const key of VIBE_KEYS) {
    sumSquaredDiffs += Math.pow(user.vibe[key] - dest.vibe[key], 2);
  }
  const distance = Math.sqrt(sumSquaredDiffs);
  const rawScore = 100 * (1 - distance / MAX_DISTANCE);
  // Calibration : remonte les scores vers la fourchette 70-98% pour un rendu plus positif,
  // décidé par Soumia le 22/08/2026 (objectif 70-90% sur les bons matchs).
  return Math.round(70 + rawScore * 0.28);
}

type FilterCheck = { ok: boolean; label: string };

// Un check par critère de filtrage strict, avec le libellé à afficher dans le badge
// d'avertissement du mode fallback (ex. "⚠️ Nécessite une voiture").
function filterChecks(user: UserAnswers, dest: Destination): FilterCheck[] {
  const logisticsKey = COMPANIONS_TO_LOGISTICS_KEY[user.companions];
  return [
    { ok: dest.filters.distance.includes(user.filters.distance), label: "Distance différente de ta recherche" },
    { ok: dest.filters.climate.includes(user.filters.climate), label: "Climat différent de ta recherche" },
    { ok: dest.filters.transport.includes(user.filters.transport), label: "Nécessite une voiture" },
    { ok: dest.filters.sport_level.includes(user.filters.sport_level), label: "Niveau physique différent de ta recherche" },
    { ok: dest.logistics[logisticsKey], label: "Pas adapté à ta configuration de voyage" },
  ];
}

function passesStrictFilters(user: UserAnswers, dest: Destination): boolean {
  return filterChecks(user, dest).every((c) => c.ok);
}

export type ScoredDestination = {
  destination: Destination;
  score: number;
  brokenFilters: string[]; // vide en mode normal, rempli seulement en mode fallback
};

export type MatchOutcome = {
  fallback: boolean;
  results: ScoredDestination[];
};

export function matchTravel(user: UserAnswers, destinations: Destination[] = DESTINATIONS): MatchOutcome {
  const eligible = destinations.filter((d) => passesStrictFilters(user, d));

  if (eligible.length > 0) {
    const results = eligible
      .map((destination) => ({ destination, score: euclideanScore(user, destination), brokenFilters: [] }))
      .sort((a, b) => b.score - a.score);
    return { fallback: false, results };
  }

  // Fallback : aucune destination ne passe le filtrage strict — on l'ignore et on renvoie le
  // Top 3 au score émotionnel global, avec le détail des critères logistiques non respectés
  // pour affichage en badge d'avertissement (comportement validé par Soumia le 22/08/2026).
  const results = destinations
    .map((destination) => ({
      destination,
      score: euclideanScore(user, destination),
      brokenFilters: filterChecks(user, destination)
        .filter((c) => !c.ok)
        .map((c) => c.label),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return { fallback: true, results };
}
