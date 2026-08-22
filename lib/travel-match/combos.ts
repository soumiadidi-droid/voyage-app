import type { Destination, SuggestedCombo } from "./types";
import { DESTINATIONS } from "./destinations";

// Un combo n'est déclaré qu'une seule fois, côté destination "phare" (celle qui a
// `target_destination_id` pointant vers l'autre) — décidé le 23/08/2026 pour éviter de saisir
// la même paire deux fois. Ce module reconstruit la relation dans les deux sens : la destination
// visée par `target_destination_id` doit aussi voir le combo apparaître sur sa propre fiche,
// sans qu'il y ait été saisi directement.
export type ResolvedCombo = {
  combo: SuggestedCombo;
  otherDestination: Destination;
  // "authored" = le combo est déclaré directement dans suggested_combos de cette destination.
  // "reverse" = déduit parce qu'une autre destination pointe vers celle-ci. Sert à savoir si on
  // peut afficher combo.title tel quel (rédigé pour le sens "authored") ou s'il faut un titre
  // générique côté affichage (le texte a été écrit dans l'autre sens).
  direction: "authored" | "reverse";
};

export function getCombosFor(
  destinationId: string,
  destinations: Destination[] = DESTINATIONS
): ResolvedCombo[] {
  const self = destinations.find((d) => d.id === destinationId);

  const authored: ResolvedCombo[] = (self?.suggested_combos ?? []).flatMap((combo) => {
    const other = destinations.find((d) => d.id === combo.target_destination_id);
    return other ? [{ combo, otherDestination: other, direction: "authored" as const }] : [];
  });

  const reverse: ResolvedCombo[] = destinations
    .filter((d) => d.id !== destinationId)
    .flatMap((other) =>
      other.suggested_combos
        .filter((combo) => combo.target_destination_id === destinationId)
        .map((combo) => ({ combo, otherDestination: other, direction: "reverse" as const }))
    );

  return [...authored, ...reverse];
}
