// Fait tourner le VRAI moteur de matching sur un jeu d'envies, et affiche ce qu'il répond
// (12/09/2026). Sert à l'agent Travel Match (.claude/agents/travel-match.md) : sans lui, l'agent
// devrait deviner la destination gagnante — c'est-à-dire l'inventer, exactement ce que le site
// promet de ne jamais faire.
//
// Usage :
//   npx tsx --env-file=.env.local scripts/match.ts flaner deguster
//   npx tsx --env-file=.env.local scripts/match.ts respirer "lacher prise" --duree grand_voyage --budget premium --avec famille
//
// Options (toutes facultatives, valeurs par défaut entre parenthèses) :
//   --duree week_end|semaine|grand_voyage (semaine)
//   --budget eco|confort|premium (confort)
//   --avec solo|duo|amis|famille (duo)
//   --distance proche|europe|long_courrier|ouvert (ouvert)
//   --climat chaleur|douceur|hiver_cosy (douceur) — le questionnaire n'offre que ces trois-là, et
//            le moteur filtre strictement dessus : il n'y a pas de "peu importe" pour le climat.
//   --transport sans_voiture|transports_possibles|voiture_necessaire (transports_possibles)
//   --niveau tranquille|actif (tranquille)
import { getDestinations } from "../lib/travel-match/data";
import { matchTravel } from "../lib/travel-match/engine";
import { SCORE_KEYS, type ScoreKey, type UserAnswers } from "../lib/travel-match/types";
import { ARCHETYPES, SCORE_AXES, type ScoreAxis } from "../app/components/TravelerProfileCard";

// Les six cartes d'envies, avec les libellés affichés au visiteur (cf.
// lib/travel-match/questionnaire.ts) et les orthographes tolérées en ligne de commande.
const ENVIES: { cle: ScoreKey; label: string; alias: string[] }[] = [
  { cle: "exploration", label: "Flâner", alias: ["flaner", "flâner"] },
  { cle: "gastronomie", label: "Déguster", alias: ["deguster", "déguster", "se regaler", "se régaler"] },
  { cle: "nature", label: "Respirer", alias: ["respirer"] },
  { cle: "plage", label: "Lâcher prise", alias: ["lacher prise", "lâcher prise", "lacher-prise", "lacherprise"] },
  { cle: "effervescence_urbaine", label: "Vibrer", alias: ["vibrer"] },
  { cle: "rythme", label: "Bouger", alias: ["bouger"] },
];

const CHOISIE = 5;
const NEUTRE = 3;

function lireOptions(args: string[]) {
  const options: Record<string, string> = {};
  const envies: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      options[arg.slice(2)] = args[++i] ?? "";
    } else {
      envies.push(arg);
    }
  }
  return { options, envies };
}

function resoudreEnvie(saisie: string) {
  const propre = saisie.trim().toLowerCase().replace(/_/g, " ");
  const envie = ENVIES.find((e) => e.alias.includes(propre) || e.cle === propre);
  if (!envie) {
    const connues = ENVIES.map((e) => e.label).join(", ");
    throw new Error(`Envie inconnue : "${saisie}". Les six envies sont : ${connues}.`);
  }
  return envie;
}

// Le profil affiché combine les axes arrivés au maximum (cf. TravelerProfileCard). "nature" et
// "plage" partagent un seul archétype, dérivé sur le maximum des deux.
function axesDuProfil(scores: UserAnswers["scores"]): ScoreAxis[] {
  const derives: Record<ScoreAxis, number> = {
    repos: scores.repos,
    exploration: scores.exploration,
    gastronomie: scores.gastronomie,
    nature_plage: Math.max(scores.nature, scores.plage),
    effervescence_urbaine: scores.effervescence_urbaine,
  };
  const max = Math.max(...SCORE_AXES.map((a) => derives[a]));
  return SCORE_AXES.filter((a) => derives[a] === max).slice(0, 2);
}

async function main() {
  const { options, envies: saisies } = lireOptions(process.argv.slice(2));
  if (saisies.length === 0) {
    console.error("Donne au moins une envie. Ex. : npx tsx --env-file=.env.local scripts/match.ts flaner deguster");
    process.exit(1);
  }
  const choisies = saisies.map(resoudreEnvie);

  const scores = {} as UserAnswers["scores"];
  for (const cle of SCORE_KEYS) {
    scores[cle] = choisies.some((e) => e.cle === cle) ? CHOISIE : NEUTRE;
  }
  // "repos" n'a pas de carte : il reste au neutre pour tout le monde (retrait de "Déconnecter",
  // 11/09/2026).
  scores.repos = NEUTRE;

  const answers: UserAnswers = {
    filters: {
      distance: (options.distance ?? "ouvert") as UserAnswers["filters"]["distance"],
      climate: (options.climat ?? "douceur") as UserAnswers["filters"]["climate"],
      transport: (options.transport ?? "transports_possibles") as UserAnswers["filters"]["transport"],
      sport_level: (options.niveau ?? "tranquille") as UserAnswers["filters"]["sport_level"],
      duration: (options.duree ?? "semaine") as UserAnswers["filters"]["duration"],
      budget: (options.budget ?? "confort") as UserAnswers["filters"]["budget"],
    },
    companions: (options.avec ?? "duo") as UserAnswers["companions"],
    scores,
  };

  const destinations = await getDestinations();
  const { fallback, results } = matchTravel(answers, destinations);
  const top = results.slice(0, 3);

  const axes = axesDuProfil(scores);
  const nom = axes.map((a) => ARCHETYPES[a].title).join(" & ");

  console.log(`Envies choisies : ${choisies.map((e) => e.label).join(", ")}`);
  console.log(`Profil : ${nom}`);
  console.log(
    `Contexte : ${answers.filters.duration}, budget ${answers.filters.budget}, ${answers.companions}, ` +
      `${answers.filters.distance}, climat ${answers.filters.climate}, ${answers.filters.sport_level}`
  );
  if (fallback) {
    console.log("ATTENTION : aucune destination ne passe les filtres, le moteur est en repli (top 3 émotionnel).");
  }
  console.log("");

  for (const [rang, r] of top.entries()) {
    const d = r.destination;
    const notes = SCORE_KEYS.map((k) => `${k} ${d.scores[k]}`).join(" · ");
    console.log(`${rang + 1}. ${d.title} — ${r.score}% · ${d.authenticity_badge} · carnet "${d.content_slug}"`);
    console.log(`   ${d.summary}`);
    console.log(`   Notes de la destination : ${notes}`);
    console.log(`   Étiquettes : ${d.tags.join(", ")}`);
    if (r.brokenFilters.length > 0) console.log(`   Réserves : ${r.brokenFilters.join(" · ")}`);
    console.log("");
  }

  // Le vrai point faible connu du moteur (cf. CLAUDE.md) : quand tout est noté 4 ou 5, les scores
  // se tiennent en quelques points et le classement ne veut plus dire grand-chose. Mieux vaut que
  // l'agent le sache que de lui faire écrire un texte péremptoire sur un écart de 1 %.
  if (top.length >= 2) {
    const ecart = top[0].score - top[top.length - 1].score;
    if (ecart <= 3) {
      console.log(`ÉCART FAIBLE : ${ecart} points entre le 1er et le ${top.length}e. Le classement ne tranche pas vraiment.`);
    }
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
