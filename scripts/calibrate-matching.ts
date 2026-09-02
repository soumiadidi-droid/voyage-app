// Passe empirique de calibration du moteur de matching (2 septembre 2026, refonte axes "priorité"
// asymétriques + pondération par intensité). Fait passer une série de profils types dans le moteur
// et affiche la distribution réelle des scores, pour vérifier que SCORE_FLOOR/SCORE_SPREAD
// (engine.ts) donnent encore une fourchette lisible : un excellent match ~90-95%, un match moyen
// ~70-75%, et un écart visible entre le 1er et le 3e résultat.
//
// Usage : export $(grep '^DATABASE_URL=' .env.local | xargs) && npx tsx scripts/calibrate-matching.ts
import { getDestinations } from "../lib/travel-match/data";
import { matchTravel, emotionalProximity } from "../lib/travel-match/engine";
import { SCORE_KEYS, type Destination, type UserAnswers } from "../lib/travel-match/types";

type Profile = { name: string; scores: Partial<UserAnswers["scores"]> };

// Profils volontairement contrastés : des envies tranchées (le cas que la pondération doit servir),
// des envies tièdes, et un profil totalement neutre (tous les curseurs au milieu) qui sert de
// témoin — c'est le cas où le moteur doit se comporter comme avant la refonte.
const PROFILES: Profile[] = [
  { name: "Gastronome absolu", scores: { gastronomie: 5, repos: 3, exploration: 3, nature: 3, plage: 3, effervescence_urbaine: 3, rythme: 3 } },
  { name: "Repos total, zéro ville", scores: { repos: 5, effervescence_urbaine: 1, rythme: 1, nature: 4, plage: 4, exploration: 2, gastronomie: 3 } },
  { name: "Citadin intense", scores: { effervescence_urbaine: 5, rythme: 5, exploration: 5, nature: 1, plage: 1, repos: 2, gastronomie: 4 } },
  { name: "Plage et rien d'autre", scores: { plage: 5, repos: 5, nature: 2, effervescence_urbaine: 1, rythme: 1, exploration: 2, gastronomie: 3 } },
  { name: "Nature/montagne", scores: { nature: 5, plage: 1, repos: 4, effervescence_urbaine: 1, rythme: 2, exploration: 4, gastronomie: 3 } },
  { name: "Curieux culturel", scores: { exploration: 5, gastronomie: 4, effervescence_urbaine: 4, nature: 2, plage: 2, repos: 2, rythme: 4 } },
  { name: "Tiède (tout au neutre)", scores: {} },
];

// Copie de référence de l'ANCIENNE formule (avant le 2 septembre 2026) : distance euclidienne
// symétrique, tous les axes au même poids. Sert uniquement à mesurer l'impact de la refonte dans ce
// script — ne pas réutiliser ailleurs, le moteur réel est dans engine.ts.
function legacyProximity(user: UserAnswers, dest: Destination): number {
  let sum = 0;
  for (const key of SCORE_KEYS) sum += Math.pow(user.scores[key] - dest.scores[key], 2);
  const maxDistance = Math.sqrt(SCORE_KEYS.length * 16);
  return 100 * (1 - Math.sqrt(sum) / maxDistance);
}

function legacyTop3(user: UserAnswers, destinations: Destination[]): string[] {
  return [...destinations]
    .sort((a, b) => legacyProximity(user, b) - legacyProximity(user, a))
    .slice(0, 3)
    .map((d) => d.title);
}

function buildAnswers(profile: Profile): UserAnswers {
  const scores = {} as UserAnswers["scores"];
  for (const key of SCORE_KEYS) scores[key] = profile.scores[key] ?? 3;
  return {
    // Filtres volontairement permissifs : on isole ici le score émotionnel, pas les malus.
    filters: {
      distance: "ouvert",
      climate: "douceur",
      transport: "transports_possibles",
      sport_level: "tranquille",
      duration: "semaine",
      budget: "confort",
    },
    companions: "duo",
    scores,
  };
}

(async () => {
  const destinations = await getDestinations();
  console.log(`${destinations.length} destinations\n`);

  const allTopRaw: number[] = [];
  const allWorstRaw: number[] = [];

  for (const profile of PROFILES) {
    const answers = buildAnswers(profile);
    const { results } = matchTravel(answers, destinations);
    const top3 = results.slice(0, 3);
    const last = results[results.length - 1];

    const raw = (d: (typeof results)[number]) => emotionalProximity(answers, d.destination);
    allTopRaw.push(raw(top3[0]));
    allWorstRaw.push(raw(last));

    console.log(`■ ${profile.name}`);
    console.log(`   AVANT : ${legacyTop3(answers, destinations).join(" / ")}`);
    console.log(`   APRÈS :`);
    for (const r of top3) {
      console.log(`   affiché ${r.score}%  (brut ${raw(r).toFixed(1)})  ${r.destination.title}`);
    }
    console.log(`   … dernier : affiché ${last.score}%  (brut ${raw(last).toFixed(1)})  ${last.destination.title}`);
    console.log(`   écart affiché top1→top3 : ${top3[0].score - top3[2].score} pts | brut : ${(raw(top3[0]) - raw(top3[2])).toFixed(1)}\n`);
  }

  const avg = (xs: number[]) => (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1);
  console.log("--- synthèse des valeurs BRUTES (avant mise à l'échelle) ---");
  console.log(`meilleur : min ${Math.min(...allTopRaw).toFixed(1)} / moy ${avg(allTopRaw)} / max ${Math.max(...allTopRaw).toFixed(1)}`);
  console.log(`pire     : min ${Math.min(...allWorstRaw).toFixed(1)} / moy ${avg(allWorstRaw)} / max ${Math.max(...allWorstRaw).toFixed(1)}`);
  console.log("\nPour afficher un excellent match à ~93% et un mauvais à ~70%, il faut mapper");
  console.log("l'intervalle brut réellement utilisé (ci-dessus) sur [70, 95].");
})();
