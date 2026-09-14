// Type d'une activité affiché sur sa carte (14/09/2026, demande Soumia : remplacer le badge générique
// « Expérience » par Sport, Shopping ou Culture). Déduit des étiquettes et du nom de l'adresse, pour
// ne rien avoir à ressaisir en base ; une activité qui ne rentre dans aucun type garde « Expérience ».
export type TypeActivite = "Sport" | "Shopping" | "Culture" | "Expérience";

const MOTS: [Exclude<TypeActivite, "Expérience">, string[]][] = [
  ["Sport", ["sport", "surf", "pilates", "golf", "paddle", "kayak", "canoë", "randonnée", "yoga", "vélo"]],
  ["Shopping", ["shopping", "mode", "bijoux", "outlet", "boutique", "concept store"]],
  ["Culture", ["culture", "musée", "musee", "opéra", "théâtre", "comédie musicale", "patrimoine", "temple", "galerie d'art", "expo"]],
];

export function typeActivite(nom: string, tags: string[]): TypeActivite {
  const texte = [nom, ...tags].join(" ").toLowerCase();
  for (const [type, mots] of MOTS) if (mots.some((m) => texte.includes(m))) return type;
  return "Expérience";
}
