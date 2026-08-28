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
// essayée entre-temps, puis retirée : chaque carte affiche directement son détail complet, plus
// de texture/image de couverture à cliquer. Regroupée par catégorie (28/08/2026, demande
// explicite de Soumia) : une section "Où dormir"/"Où manger"/"Quoi faire" par catégorie non vide,
// chacune avec sa propre grille masonry.
export const CATEGORY_META: Record<
  AddressCategory,
  { icon: LucideIcon; label: string; bg: string; color: string }
> = {
  Hôtel: { icon: BedDouble, label: "Hôtel de charme", bg: LVE_COLORS.terracotta.bg, color: LVE_COLORS.terracotta.dark },
  Resto: { icon: UtensilsCrossed, label: "Table épicurienne", bg: LVE_COLORS.sage.bg, color: LVE_COLORS.sage.dark },
  Activité: { icon: Compass, label: "Expérience", bg: LVE_COLORS.ocean.bg, color: LVE_COLORS.ocean.dark },
};

const CATEGORY_SECTION_TITLE: Record<AddressCategory, string> = {
  Hôtel: "Où dormir",
  Resto: "Où manger",
  Activité: "Quoi faire",
};

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
  const allGroups: { category: AddressCategory; cards: Card[] }[] = [
    { category: "Hôtel", cards: stays },
    { category: "Resto", cards: eats },
    { category: "Activité", cards: activities },
  ];
  const groups = allGroups.filter((g) => g.cards.length > 0);

  if (groups.length === 0) return null;

  return (
    <>
      {groups.map((group) => {
        const { icon: CategoryIcon } = CATEGORY_META[group.category];
        return (
          <div key={group.category} className="mb-10 sm:mb-12">
            <h3
              className="flex items-center gap-2 font-semibold mb-4"
              style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}
            >
              <CategoryIcon size={18} style={{ color: "var(--lve-terracotta-dark)" }} />
              {CATEGORY_SECTION_TITLE[group.category]}
            </h3>
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {group.cards.map((card, i) => (
                <AddressDetailCard key={i} card={card} category={group.category} familyProfile={familyProfile} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
