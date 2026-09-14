// Univers d'une grande destination (14/09/2026, document de Soumia « Architecture de Paris dans Travel
// Match »). Paris reste UNE destination dans le moteur, avec un seul pourcentage ; l'univers dit
// seulement quelle façon de vivre Paris correspond au visiteur. Le questionnaire ne change pas :
// l'univers se déduit des cartes d'envies choisies.
//
// Règles validées par Soumia :
// - chaque univers est rattaché à deux envies (clés de score) ;
// - on garde l'univers qui partage le plus d'envies avec le visiteur ;
// - à égalité, l'univers qui a des adresses passe devant, puis l'ordre éditorial (position) ;
// - un univers sans adresse visible ne s'affiche jamais (pas de « Ton Paris : X » sur une fiche vide).
import type { ScoreKey, UserAnswers } from "./types";

export type Univers = {
  destinationId: string;
  slug: string;
  nom: string;
  phrase: string;
  lieux: string;
  envies: ScoreKey[];
  position: number;
};

// Une carte choisie envoie 5 (cf. QuestionnaireClient.scoresDepuisIntentions).
const CHOISIE = 5;

export function choisirUnivers(
  scores: UserAnswers["scores"],
  univers: Univers[],
  slugsAvecAdresses: Set<string>
): Univers | undefined {
  const candidats = univers
    .filter((u) => slugsAvecAdresses.has(u.slug))
    .map((u) => ({ u, communs: u.envies.filter((e) => scores[e] >= CHOISIE).length }))
    .filter((c) => c.communs > 0);
  if (candidats.length === 0) return undefined;

  // Le meilleur tous univers confondus : s'il n'a pas d'adresses, on n'affiche rien plutôt qu'un
  // univers moins pertinent — sauf égalité, où l'univers rempli l'emporte.
  const meilleurScore = Math.max(
    ...univers.map((u) => u.envies.filter((e) => scores[e] >= CHOISIE).length)
  );
  const gagnants = candidats
    .filter((c) => c.communs === meilleurScore)
    .sort((a, b) => a.u.position - b.u.position);
  return gagnants[0]?.u;
}
