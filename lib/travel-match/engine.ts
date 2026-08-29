import {
  COMPANIONS_TO_LOGISTICS_KEY,
  SCORE_KEYS,
  type Destination,
  type UserAnswers,
} from "./types";
import { getCombosFor } from "./combos";

// Distance euclidienne max théorique sur 7 axes (repos/exploration/gastronomie/nature/plage/
// effervescence_urbaine/rythme), échelle 1-5 donc écart max de 4 par axe : sqrt(7 * 4^2). Passé de
// 6 à 7 axes le 29/08/2026 (split nature_plage → nature/plage, demande Soumia) — recalculé
// automatiquement via SCORE_KEYS.length, comme lors du passage de 9 à 6 axes.
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
  // par le passage de 9 à 6 axes, puis de 6 à 7 (split nature_plage, 29/08/2026) : rawScore est
  // déjà normalisé 0-100 quel que soit le nombre d'axes (MAX_DISTANCE grandit avec SCORE_KEYS.length,
  // donc le ratio distance/MAX_DISTANCE reste comparable) — pas de recalcul de ces constantes
  // nécessaire mathématiquement. À reconfirmer par un test manuel sur quelques profils réels malgré
  // tout : plus d'axes indépendants peut légèrement changer la distribution des distances typiques.
  return Math.round(70 + rawScore * 0.28);
}

type SoftCriterion = { ok: boolean; malus: number; label: string };

// Refonte du 23/08/2026 (demande de Soumia) : plus aucun de ces critères n'élimine une
// destination — chacun retire des points au score si non respecté, pondérés selon le poids réel
// de la friction (budget/logistique pèsent plus qu'une simple préférence de rythme). Avant cette
// refonte, un .filter() strict excluait des destinations pertinentes mais "hybrides" (ex. le
// Japon, qui offre à la fois du calme à Kyoto et de l'effervescence à Tokyo) dès qu'un seul
// critère secondaire ne matchait pas exactement.
function softCriteria(user: UserAnswers, dest: Destination): SoftCriterion[] {
  const logisticsKey = COMPANIONS_TO_LOGISTICS_KEY[user.companions];
  return [
    // Distance retirée d'ici le 26/08/2026 : redevenue un filtre éliminatoire strict (cf.
    // hardConstraintBroken), plus un malus de score.
    { ok: dest.filters.climate.includes(user.filters.climate), malus: 8, label: "Climat différent de ta recherche" },
    { ok: dest.filters.transport.includes(user.filters.transport), malus: 6, label: "Transport différent de ta recherche" },
    { ok: dest.filters.sport_level.includes(user.filters.sport_level), malus: 6, label: "Niveau physique différent de ta recherche" },
    { ok: dest.filters.duration.includes(user.filters.duration), malus: 5, label: "Durée de séjour différente de ta recherche" },
    { ok: dest.filters.budget.includes(user.filters.budget), malus: 10, label: "Budget différent de ta recherche" },
    { ok: dest.logistics[logisticsKey], malus: 15, label: "Pas adapté à ta configuration de voyage" },
  ];
}

// Contraintes réellement absolues (garde-fous produit, pas des préférences négociables par des
// points) :
// 1. Le périmètre géographique choisi (proche/Europe/long-courrier) élimine directement les
//    destinations hors zone — redevenu un filtre strict le 26/08/2026 (retour de Soumia), après
//    être passé en malus de score le 23/08/2026. Chaque destination n'a qu'une seule valeur de
//    distance (jamais hybride sur cet axe, vérifié le 26/08/2026), donc pas de risque de reproduire
//    le bug du Japon (qui concernait des critères secondaires, pas la distance). Exception : la
//    réponse "ouvert" (L'inspiration avant tout — ajoutée le 26/08/2026) ne filtre rien du tout,
//    laisse les autres critères (ambiance, gastronomie, rythme...) décider seuls.
// 2. Un week-end ne permet pas de rejoindre une destination accessible uniquement en
//    long-courrier, quel que soit le score émotionnel par ailleurs.
// 3. Un climat "hiver cosy / enneigé" demandé ne peut pas être satisfait par une destination
//    marquée uniquement soleil/Méditerranée (aucun "hiver_cosy" dans ses climats) — c'est
//    physiquement incompatible, pas une histoire de goût. Ajouté le 23/08/2026 après un test où
//    la Crète ressortait en tête d'une recherche "hiver" malgré le malus climat (le match
//    émotionnel très fort par ailleurs compensait un malus pensé pour des préférences, pas pour
//    une impossibilité physique). Uniquement dans ce sens (hiver → pas de sun-only) : les autres
//    combinaisons de climat restent un malus normal, négociable.
function brokenHardConstraints(user: UserAnswers, dest: Destination): string[] {
  const labels: string[] = [];

  const outsidePerimeter =
    user.filters.distance !== "ouvert" && !dest.filters.distance.includes(user.filters.distance);
  if (outsidePerimeter) labels.push("Zone géographique différente de ta recherche");

  const weekendVsLongCourrier =
    user.filters.duration === "week_end" &&
    dest.filters.distance.includes("long_courrier") &&
    !dest.filters.distance.some((d) => d !== "long_courrier");
  if (weekendVsLongCourrier) labels.push("Accessible seulement en long-courrier, pas compatible avec un week-end");

  const winterVsSunOnly =
    user.filters.climate === "hiver_cosy" && !dest.filters.climate.includes("hiver_cosy");
  if (winterVsSunOnly) labels.push("Pas de climat hiver cosy disponible ici");

  return labels;
}

function hardConstraintBroken(user: UserAnswers, dest: Destination): boolean {
  return brokenHardConstraints(user, dest).length > 0;
}

const MIN_SCORE = 20;

function scoreWithMalus(user: UserAnswers, dest: Destination): { score: number; brokenFilters: string[] } {
  const base = euclideanScore(user, dest);
  const failed = softCriteria(user, dest).filter((c) => !c.ok);
  const totalMalus = failed.reduce((sum, c) => sum + c.malus, 0);
  return {
    score: Math.max(MIN_SCORE, base - totalMalus),
    brokenFilters: failed.map((c) => c.label),
  };
}

// Combo : détecté quand l'utilisateur exprime une envie forte à la fois de nature/plage et
// d'effervescence urbaine (deux curseurs indépendants, décidé le 23/08/2026 précisément pour
// permettre cette détection — impossible avec un seul axe bipolaire). Affiché comme un badge
// visuel sur la carte résultat, sans influencer le score (validé par Soumia le 23/08/2026).
const COMBO_THRESHOLD = 4;

// Depuis le split nature_plage → nature/plage (29/08/2026), on prend le MAX des deux curseurs
// plutôt qu'une moyenne : quelqu'un qui met 5 sur "nature" et 1 sur "plage" veut quand même
// fortement du grand air, ça doit continuer à déclencher le combo au même titre qu'avant le split.
// Une moyenne aurait dilué ce genre de profil tranché sous le seuil. Choix de Claude, pas encore
// validé par Soumia — à corriger si elle préfère exiger les deux curseurs hauts (nature ET plage).
function hasComboOpportunity(user: UserAnswers, dest: Destination, destinations: Destination[]): boolean {
  return (
    getCombosFor(dest.id, destinations).length > 0 &&
    Math.max(user.scores.nature, user.scores.plage) >= COMBO_THRESHOLD &&
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

function canonicalPairKey(idA: string, idB: string): string {
  return [idA, idB].sort().join("-");
}

// Dédoublonnage du badge combo (23/08/2026) : si Montréal ET New York apparaissent tous les deux
// dans le même lot affiché (ex. top 3), le badge 🔀 ne doit apparaître qu'une fois pour la paire,
// pas sur les deux cartes — sinon ça a l'air d'un doublon. On garde le badge sur le premier des
// deux rencontré (déjà trié par score décroissant), on le retire sur le second (miroir).
// À appliquer sur le lot réellement affiché (ex. après slice(0, 3)), pas sur la liste complète.
export function dedupeComboBadges(
  displayed: ScoredDestination[],
  destinations: Destination[]
): ScoredDestination[] {
  const shownPairs = new Set<string>();
  return displayed.map((result) => {
    if (!result.hasComboOpportunity) return result;

    const mirrored = getCombosFor(result.destination.id, destinations).find((resolved) =>
      displayed.some((other) => other.destination.id === resolved.otherDestination.id)
    );
    if (!mirrored) return result; // pas d'autre destination du combo affichée, rien à dédoublonner

    const pairKey = canonicalPairKey(result.destination.id, mirrored.otherDestination.id);
    if (shownPairs.has(pairKey)) {
      return { ...result, hasComboOpportunity: false };
    }
    shownPairs.add(pairKey);
    return result;
  });
}

export function matchTravel(user: UserAnswers, destinations: Destination[]): MatchOutcome {
  // Seule la contrainte absolue (week-end vs long-courrier, périmètre, climat hiver) retire
  // encore une destination de la liste — tout le reste devient un malus de score (voir
  // scoreWithMalus), plus jamais une élimination.
  const strictCandidates = destinations.filter((d) => !hardConstraintBroken(user, d));

  // Filet de sécurité (28/08/2026, demande de Soumia) : jamais de page de résultat vide. Si le
  // filtrage strict élimine TOUTES les destinations (ex. climat hiver demandé alors qu'aucune
  // destination dispo ne l'offre), on retombe sur le catalogue complet — chaque contrainte dure
  // cassée devient un badge d'avertissement au lieu d'une élimination silencieuse.
  const usingSafetyNet = strictCandidates.length === 0;
  const candidates = usingSafetyNet ? destinations : strictCandidates;

  const results = candidates
    .map((destination) => {
      const { score, brokenFilters } = scoreWithMalus(user, destination);
      const hardLabels = usingSafetyNet ? brokenHardConstraints(user, destination) : [];
      return {
        destination,
        score,
        brokenFilters: [...hardLabels, ...brokenFilters],
        hasComboOpportunity: hasComboOpportunity(user, destination, destinations),
      };
    })
    .sort((a, b) => b.score - a.score);

  // fallback ne signifie plus "le filtrage strict a tout éliminé" mais "même le meilleur résultat
  // n'est pas un match parfait" — déclenche le même message d'avertissement déjà affiché sur
  // /resultat, avec un sens désormais cohérent avec le scoring cumulatif.
  const fallback = results.length > 0 && results[0].brokenFilters.length > 0;

  return { fallback, results };
}
