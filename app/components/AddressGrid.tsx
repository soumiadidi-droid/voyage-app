"use client";

import { BedDouble, UtensilsCrossed, Compass, type LucideIcon } from "lucide-react";
import { type Card } from "@/content/voyages";
import { LVE_COLORS } from "@/lib/design-tokens";
import { type AddressCategory } from "@/lib/category-images";
import { type FamilyProfile } from "@/lib/travel-match/types";
import { AddressDetailCard } from "./AddressDetailCard";

// Grille éditoriale (28/08/2026, remplace la bande horizontale à repère sticky — demande
// explicite de Soumia après un souci de découvrabilité sur desktop : les restos/activités étaient
// cachés derrière un scroll horizontal peu visible). Vignette photo + clic pour révéler le détail
// essayée entre-temps, puis retirée sur nouvelle demande de Soumia (28/08/2026) : chaque carte
// affiche directement son détail complet, plus de texture/image de couverture à cliquer.
export const CATEGORY_META: Record<
  AddressCategory,
  { icon: LucideIcon; label: string; bg: string; color: string }
> = {
  Hôtel: { icon: BedDouble, label: "Hôtel de charme", bg: LVE_COLORS.terracotta.bg, color: LVE_COLORS.terracotta.dark },
  Resto: { icon: UtensilsCrossed, label: "Table épicurienne", bg: LVE_COLORS.sage.bg, color: LVE_COLORS.sage.dark },
  Activité: { icon: Compass, label: "Expérience", bg: LVE_COLORS.ocean.bg, color: LVE_COLORS.ocean.dark },
};

type GridItem = { card: Card; category: AddressCategory };

export function AddressGrid({
  stays,
  eats,
  activities,
  familyProfile,
}: {
  stays: Card[];
  eats: Card[];
  activities: Card[];
  familyProfile?: FamilyProfile;
}) {
  const items: GridItem[] = [
    ...stays.map((card) => ({ card, category: "Hôtel" as AddressCategory })),
    ...eats.map((card) => ({ card, category: "Resto" as AddressCategory })),
    ...activities.map((card) => ({ card, category: "Activité" as AddressCategory })),
  ];

  if (items.length === 0) return null;

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {items.map((item, i) => (
        <AddressDetailCard key={i} card={item.card} category={item.category} familyProfile={familyProfile} />
      ))}
    </div>
  );
}
