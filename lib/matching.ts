import { QUESTIONS, type Attributes } from "./questionnaire";
import { DESTINATIONS, type Destination } from "./destinations";

const DIMENSIONS: (keyof Attributes)[] = [
  "luxury", "nightlife", "family", "authenticity", "nature",
  "food", "culture", "beach", "city", "shopping", "sport",
];

// Valeur max théorique par dimension (somme des plus hautes valeurs possibles parmi les
// options qui touchent cette dimension), utilisée pour ramener le profil utilisateur sur
// une échelle 0-100 comparable à celle des destinations.
const DIMENSION_MAX: Record<string, number> = {
  luxury: 9 + 5 + 2, // esprit + compagnons(couple) + sport(zero)
  nightlife: 6 + 6, // esprit(lifestyle) + compagnons(amis)
  family: 9 + 9, // esprit(resort-famille) + compagnons(famille)
  authenticity: 8 + 6 + 6, // esprit(aventure/backpacker, on prend le max) + compagnons(seul)
  nature: 5 + 8 + 3, // esprit(aventure) + paysage(montagne) + sport(intense)
  food: 9,
  culture: 9,
  beach: 8,
  city: 8,
  shopping: 1, // aucune question ne pèse dessus directement pour l'instant
  sport: 9,
};

export type Answers = Record<string, string>;

export function buildUserProfile(answers: Answers): Record<string, number> {
  const raw: Record<string, number> = {};
  for (const q of QUESTIONS) {
    const chosen = q.options.find((o) => o.value === answers[q.id]);
    if (!chosen) continue;
    for (const [dim, val] of Object.entries(chosen.attributes)) {
      raw[dim] = (raw[dim] ?? 0) + (val ?? 0);
    }
  }
  const normalized: Record<string, number> = {};
  for (const dim of DIMENSIONS) {
    const max = DIMENSION_MAX[dim] || 9;
    normalized[dim] = Math.min(100, Math.round(((raw[dim] ?? 0) / max) * 100));
  }
  return normalized;
}

export type ContextLine = { positive: boolean; text: string };

export function buildContextLines(answers: Answers, dest: Destination): ContextLine[] {
  const lines: ContextLine[] = [];

  const espritOption = QUESTIONS[0].options.find((o) => o.value === answers.esprit);
  if (espritOption) {
    // Approximation : on ne connaît pas "l'esprit dominant" exact de chaque destination,
    // donc on compare simplement l'intitulé choisi au profil dominant déduit du profil destination.
    lines.push({ positive: true, text: `pensé pour ${espritOption.label.toLowerCase()}` });
  }

  if (answers.securite) {
    lines.push({ positive: true, text: `sécurité : ${dest.context.safety}` });
  }
  if (answers.mobilite) {
    lines.push({
      positive: true,
      text: `mobilité : ${dest.context.mobility}, comme tu le souhaites`,
    });
  }
  if (answers.climat) {
    const wanted = QUESTIONS.find((q) => q.id === "climat")!.options.find(
      (o) => o.value === answers.climat
    )?.tag?.climate;
    const match = wanted === dest.context.climate;
    lines.push({
      positive: match,
      text: `climat ${dest.context.climate}, ${match ? "comme recherché" : "différent de ce que tu recherches"}`,
    });
  }
  if (answers.paysage) {
    const wanted = QUESTIONS.find((q) => q.id === "paysage")!.options.find(
      (o) => o.value === answers.paysage
    )?.tag?.landscape;
    const match = wanted === dest.context.landscape;
    lines.push({
      positive: match,
      text: `paysage ${dest.context.landscape}${match ? ", comme recherché" : ""}`,
    });
  }
  if (answers.distance) {
    const wanted = QUESTIONS.find((q) => q.id === "distance")!.options.find(
      (o) => o.value === answers.distance
    )?.tag?.distanceHaul;
    const match = wanted === dest.context.distanceHaul;
    lines.push({
      positive: match,
      text: `${dest.context.distanceHaul}, ${match ? "comme recherché" : "différent de ce que tu recherches"}`,
    });
  }

  return lines;
}

export type ScoredDestination = {
  destination: Destination;
  score: number;
  tier: "Excellent match" | "Très bon match" | "Bon match" | "Match partiel";
  contextLines: ContextLine[];
};

function tierFor(score: number): ScoredDestination["tier"] {
  if (score >= 90) return "Excellent match";
  if (score >= 70) return "Très bon match";
  if (score >= 50) return "Bon match";
  return "Match partiel";
}

export function matchDestinations(answers: Answers): ScoredDestination[] {
  const user = buildUserProfile(answers);
  // dimensions sur lesquelles l'utilisateur a exprimé une vraie préférence (poids plus fort)
  const expressed = DIMENSIONS.filter((d) => (user[d] ?? 0) > 0);

  const scored = DESTINATIONS.map((destination) => {
    let weightedDiffSum = 0;
    let weightTotal = 0;
    for (const dim of DIMENSIONS) {
      const weight = expressed.includes(dim) ? 1 : 0.2;
      const diff = Math.abs((user[dim] ?? 0) - destination.profile[dim]);
      weightedDiffSum += diff * weight;
      weightTotal += 100 * weight;
    }
    const score = Math.max(0, Math.round(100 - (weightedDiffSum / weightTotal) * 100));
    return {
      destination,
      score,
      tier: tierFor(score),
      contextLines: buildContextLines(answers, destination),
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

const PERSONAS: {
  match: (answers: Answers) => boolean;
  title: string;
  description: string;
}[] = [
  {
    match: (a) => a.esprit === "aventure",
    title: "Le sac à dos authentique",
    description: "Tu fuis les sentiers battus, même si ça veut dire moins de confort.",
  },
  {
    match: (a) => a.esprit === "resort-famille" || (a.esprit === "luxe" && a.compagnons === "famille"),
    title: "La famille exploratrice",
    description: "Tu voyages pour créer des souvenirs à plusieurs générations, sans sacrifier le confort.",
  },
  {
    match: (a) => a.esprit === "lifestyle",
    title: "L'esthète du littoral",
    description: "Une belle plage, une bonne table, et un hébergement qui a du goût.",
  },
  {
    match: (a) => a.esprit === "backpacker",
    title: "Le voyageur curieux",
    description: "Tes envies sont variées — un bon signe : tu t'adaptes à ce que chaque destination a de mieux.",
  },
  {
    match: (a) => a.sport === "intense",
    title: "L'aventurier sportif",
    description: "Tes vacances se méritent : rando, surf ou vélo, tu ne restes jamais immobile longtemps.",
  },
  {
    match: () => true,
    title: "L'amateur de grand confort",
    description: "Tu veux du beau, du bon, sans complications.",
  },
];

export function buildPersona(answers: Answers) {
  return PERSONAS.find((p) => p.match(answers))!;
}
