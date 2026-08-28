"use server";

import { getDestinations, getVoyages } from "@/lib/travel-match/data";
import type { Destination } from "@/lib/travel-match/types";
import type { Card, VoyageContent } from "@/content/voyages";

export type LikedItem =
  | { kind: "destination"; key: string; destination: Destination }
  | { kind: "content"; key: string; voyage: VoyageContent };

// Établissement enregistré (28/08/2026, cf. lib/favorites.ts usePlaceFavorites) — distinct des
// favoris destination ci-dessus, résolu séparément car la clé (l'UUID de l'adresse) ne vit pas
// dans le même espace de noms que les ids de destination.
export type PlaceLikedItem = {
  key: string;
  card: Card;
  voyageSlug: string;
  voyageTitle: string;
  category: "Hôtel" | "Resto" | "Activité";
};

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

// Même principe que resolveFavorites ci-dessus, mais cherche dans les adresses (stays/eats/
// activities) de tous les voyages plutôt que dans les destinations — les clés viennent du store
// localStorage séparé usePlaceFavorites (lib/favorites.ts).
export async function resolvePlaceFavorites(keys: string[]): Promise<PlaceLikedItem[]> {
  if (keys.length === 0) return [];

  const voyages = await getVoyages();

  const items: PlaceLikedItem[] = [];
  for (const key of keys) {
    for (const voyage of voyages) {
      const buckets: { category: PlaceLikedItem["category"]; cards: Card[] }[] = [
        { category: "Hôtel", cards: voyage.stays },
        { category: "Resto", cards: voyage.eats },
        { category: "Activité", cards: voyage.activities },
      ];
      const match = buckets
        .flatMap((b) => b.cards.map((card) => ({ card, category: b.category })))
        .find((entry) => entry.card.id === key);
      if (match) {
        items.push({
          key,
          card: match.card,
          voyageSlug: voyage.slug,
          voyageTitle: voyage.hero.title,
          category: match.category,
        });
        break;
      }
    }
  }
  return items;
}
