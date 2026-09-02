import {
  COMPANIONS_TO_LOGISTICS_KEY,
  SCORE_KEYS,
  type Destination,
  type ScoreKey,
  type UserAnswers,
} from "./types";
import { getCombosFor } from "./combos";

// Axes "priorité" (2 septembre 2026) — ceux de la question "C'est quoi ta priorité pour ce
// séjour ?" (questionnaire.ts). Le curseur y exprime une IMPORTANCE, pas un niveau souhaité :
// répondre 2 en gastronomie veut dire "ce n'est pas ma priorité", jamais "je veux mal manger".
// Avant cette refonte, la distance euclidienne symétrique pénalisait une destination excellente en
// gastronomie auprès de quelqu'un qui n'en avait simplement pas fait sa priorité — et poussait à
// noter toutes les destinations 5/5 sur ces axes (une note basse se lisant comme un jugement),
// d'où 10 destinations sur 15 à 5/5 en gastronomie, axe devenu incapable de trier quoi que ce soit.
// Les axes du "décor idéal" (nature/plage/effervescence) et le rythme gardent une logique de cible
// symétrique : y répondre 1 veut vraiment dire "je n'en veux pas", et leurs notes sont saines.
const PRIORITY_AXES = new Set<ScoreKey>(["repos", "exploration", "gastronomie"]);

// Curseurs 1-5 : 3 = "je n'ai pas d'avis", 1 ou 5 = "j'y tiens".
const NEUTRAL_SLIDER = 3;
const MIN_SLIDER = 1;
const MAX_SLIDER = 5;

// Pondération par l'intensité de la demande (2 septembre 2026) — avant, les 7 axes comptaient
// exactement pareil : quelqu'un qui mettait 5 en gastronomie et 3 partout ailleurs était traité
// comme quelqu'un de tiède sur tout. `1 + écart au neutre` va de 1 (curseur au milieu) à 3
// (curseur à fond) : une envie forte pèse 3 fois plus qu'un axe sur lequel la personne n'a pas
// d'avis, sans jamais annuler complètement un axe (le +1 garde le comportement d'avant quand tous
// les curseurs sont au neutre).
function axisWeight(userValue: number): number {
  return 1 + Math.abs(userValue - NEUTRAL_SLIDER);
}

// Écart réellement pénalisant sur un axe. Sur un axe "priorité", une destination qui offre PLUS que
// demandé n'est pas pénalisée (écart 0) — seul le manque compte.
function axisGap(key: ScoreKey, userValue: number, destValue: number): number {
  const gap = userValue - destValue;
  if (PRIORITY_AXES.has(key)) return Math.max(0, gap);
  return Math.abs(gap);
}

// Écart maximum atteignable sur cet axe POUR CET UTILISATEUR (pire destination possible), utilisé
// comme dénominateur de normalisation. Le calculer en fonction de la réponse — plutôt que de garder
// l'ancien maximum théorique fixe sqrt(7 × 4²) — évite que les axes devenus asymétriques gonflent
// artificiellement tous les scores : un axe qui ne peut plus rien pénaliser ne compte plus non plus
// dans le total de référence.
function axisMaxGap(key: ScoreKey, userValue: number): number {
  if (PRIORITY_AXES.has(key)) return userValue - MIN_SLIDER;
  return Math.max(Math.abs(userValue - MIN_SLIDER), Math.abs(userValue - MAX_SLIDER));
}

// Calibration : remonte les scores vers une fourchette lisible (objectif de Soumia du 22/08/2026 :
// les bons matchs affichent 70-90%, pas un score écrasé). Constantes revérifiées empiriquement
// après la refonte du 2 septembre 2026 (voir scripts/calibrate-matching.ts).
const SCORE_FLOOR = 70;
const SCORE_SPREAD = 0.28;

// Proximité brute 0-100 (100 = la destination répond exactement à la demande). Exportée pour la
// passe de calibration (scripts/calibrate-matching.ts), qui a besoin de la valeur avant mise à
// l'échelle pour choisir SCORE_FLOOR/SCORE_SPREAD sur des chiffres réels.
export function emotionalProximity(user: UserAnswers, dest: Destination): number {
  let weightedSquares = 0;
  let maxWeightedSquares = 0;
  for (const key of SCORE_KEYS) {
    const weight = axisWeight(user.scores[key]);
    weightedSquares += weight * Math.pow(axisGap(key, user.scores[key], dest.scores[key]), 2);
    maxWeightedSquares += weight * Math.pow(axisMaxGap(key, user.scores[key]), 2);
  }
  // maxWeightedSquares ne peut pas être nul : les axes symétriques ont toujours un écart max ≥ 2.
  const ratio = Math.sqrt(weightedSquares) / Math.sqrt(maxWeightedSquares);
  return 100 * (1 - ratio);
}

function compressToDisplayScale(rawScore: number): number {
  return Math.round(SCORE_FLOOR + rawScore * SCORE_SPREAD);
}

type SoftCriterion = { ok: boolean; malus: number; label: string };

// Poids relatifs des frictions logistiques, fixés par Soumia le 23/08/2026 (budget/configuration
// pèsent plus qu'une préférence de rythme). Ces valeurs ne sont PAS des points d'affichage : elles
// servent uniquement à répartir la dégradation relative plafonnée (voir MAX_MALUS_IMPACT).
const SOFT_CRITERIA_MALUS = {
  climate: 8,
  transport: 6,
  sport_level: 6,
  duration: 5,
  budget: 10,
  companions: 15,
} as const;

// Total si TOUS les critères échouent — dérivé de la table plutôt que codé en dur, pour rester
// juste si un critère est ajouté/retiré plus tard.
const MAX_MALUS_POINTS = Object.values(SOFT_CRITERIA_MALUS).reduce((sum, m) => sum + m, 0);

// Plafond d'impact de la logistique sur le score (2 septembre 2026, demande Soumia) : au pire, la
// logistique retire 15% du score émotionnel. Avant, les malus étaient soustraits en points
// D'AFFICHAGE (8, 10, 15...) alors que tout le match émotionnel ne pèse que 28 points d'affichage
// (SCORE_SPREAD) — un seul malus effaçait donc un écart émotionnel énorme, et la logistique
// dominait l'émotion. Cas concret mesuré avant correction : sur un profil "plage avant tout",
// Mykonos était le meilleur match émotionnel du catalogue (87/100 brut) et finissait 7e derrière
// Marseille (71/100), à cause de 14 points de malus. Désormais la logistique module l'émotion sans
// jamais renverser un écart émotionnel fort.
const MAX_MALUS_IMPACT = 0.15;

// Refonte du 23/08/2026 (demande de Soumia) : plus aucun de ces critères n'élimine une
// destination — chacun dégrade le score si non respecté, pondéré selon le poids réel de la
// friction. Avant cette refonte, un .filter() strict excluait des destinations pertinentes mais
// "hybrides" (ex. le Japon, qui offre à la fois du calme à Kyoto et de l'effervescence à Tokyo)
// dès qu'un seul critère secondaire ne matchait pas exactement.
function softCriteria(user: UserAnswers, dest: Destination): SoftCriterion[] {
  const logisticsKey = COMPANIONS_TO_LOGISTICS_KEY[user.companions];
  return [
    // Distance retirée d'ici le 26/08/2026 : redevenue un filtre éliminatoire strict (cf.
    // hardConstraintBroken), plus un malus de score.
    { ok: dest.filters.climate.includes(user.filters.climate), malus: SOFT_CRITERIA_MALUS.climate, label: "Climat différent de ta recherche" },
    { ok: dest.filters.transport.includes(user.filters.transport), malus: SOFT_CRITERIA_MALUS.transport, label: "Transport différent de ta recherche" },
    { ok: dest.filters.sport_level.includes(user.filters.sport_level), malus: SOFT_CRITERIA_MALUS.sport_level, label: "Niveau physique différent de ta recherche" },
    { ok: dest.filters.duration.includes(user.filters.duration), malus: SOFT_CRITERIA_MALUS.duration, label: "Durée de séjour différente de ta recherche" },
    { ok: dest.filters.budget.includes(user.filters.budget), malus: SOFT_CRITERIA_MALUS.budget, label: "Budget différent de ta recherche" },
    { ok: dest.logistics[logisticsKey], malus: SOFT_CRITERIA_MALUS.companions, label: "Pas adapté à ta configuration de voyage" },
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

// Ordre des opérations (2 septembre 2026) : la dégradation logistique s'applique sur le score BRUT
// (échelle 0-100 du match émotionnel), AVANT la compression vers la fourchette d'affichage. Avant,
// les malus étaient soustraits après compression, donc sur une échelle 3,5× plus petite — d'où leur
// poids disproportionné face à l'émotion.
function scoreWithMalus(user: UserAnswers, dest: Destination): { score: number; brokenFilters: string[] } {
  const rawScore = emotionalProximity(user, dest);
  const failed = softCriteria(user, dest).filter((c) => !c.ok);
  const malusPoints = failed.reduce((sum, c) => sum + c.malus, 0);
  const impact = MAX_MALUS_IMPACT * (malusPoints / MAX_MALUS_POINTS);
  return {
    score: Math.max(MIN_SCORE, compressToDisplayScale(rawScore * (1 - impact))),
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
