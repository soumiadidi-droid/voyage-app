"use server";

import { getDestinations, getVoyages } from "@/lib/travel-match/data";
import type { Destination } from "@/lib/travel-match/types";
import type { VoyageContent } from "@/content/voyages";

export type LikedItem =
  | { kind: "destination"; key: string; destination: Destination }
  | { kind: "content"; key: string; voyage: VoyageContent };

// Les favoris ne vivent qu'en localStorage côté navigateur (lib/favorites.ts) — un Server
// Component parent ne peut pas les connaître au moment du rendu. FavorisClient appelle donc
// cette Server Action une fois les ids lus depuis localStorage, plutôt que de les résoudre par un
// import statique synchrone comme avant la migration DB.
export async function resolveFavorites(keys: string[]): Promise<LikedItem[]> {
  if (keys.length === 0) return [];

  const [destinations, voyages] = await Promise.all([getDestinations(), getVoyages()]);

  const items: LikedItem[] = [];
  for (const key of keys) {
    const destination = destinations.find((d) => d.id === key);
    if (destination) {
      items.push({ kind: "destination", key, destination });
      continue;
    }
    // Fallback pour les anciens likes enregistrés sous une clé content_slug plutôt qu'un id de
    // destination (voir l'ancien commentaire de resolveLikedItem, comportement inchangé).
    const voyage = voyages.find((v) => v.slug === key);
    if (voyage) items.push({ kind: "content", key, voyage });
  }
  return items;
}
