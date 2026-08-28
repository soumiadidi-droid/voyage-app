"use client";

import { BedDouble, UtensilsCrossed, Compass, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { type Card } from "@/content/voyages";
import { LVE_COLORS } from "@/lib/design-tokens";
import { CATEGORY_PHOTO_OVERRIDE, type AddressCategory } from "@/lib/category-images";
import { type FamilyProfile } from "@/lib/travel-match/types";
import { Logo } from "./Logo";
import { AddressDetailCard } from "./AddressDetailCard";

// Grille éditoriale masonry (28/08/2026, remplace la bande horizontale à repère sticky — demande
// explicite de Soumia après un souci de découvrabilité sur desktop : les restos/activités étaient
// cachés derrière un scroll horizontal peu visible). Vignette seule dans la grille (pas d'embed
// Instagram chargé ici, coût de perf inutile pour une simple photo de couverture) ; le détail
// complet remplace l'image EN PLACE dans la grille au clic (AddressDetailCard, pas de pop-up
// flottante pour cet écran-là — demande explicite de Soumia).
export const CATEGORY_META: Record<
  AddressCategory,
  { icon: LucideIcon; label: string; bg: string; color: string }
> = {
  Hôtel: { icon: BedDouble, label: "Hôtel de charme", bg: LVE_COLORS.terracotta.bg, color: LVE_COLORS.terracotta.dark },
  Resto: { icon: UtensilsCrossed, label: "Table épicurienne", bg: LVE_COLORS.sage.bg, color: LVE_COLORS.sage.dark },
  Activité: { icon: Compass, label: "Expérience", bg: LVE_COLORS.ocean.bg, color: LVE_COLORS.ocean.dark },
};

type GridItem = { card: Card; category: AddressCategory };

function Thumbnail({ item }: { item: GridItem }) {
  const { card, category } = item;
  const { icon: CategoryIcon, label: categoryLabel, bg: categoryBg, color: categoryColor } = CATEGORY_META[category];
  // Même priorité que l'ancienne AddressCard : la texture catégorie (Hôtel/Resto) prime sur la
  // vraie photo si les deux existent, sinon la vraie photo, sinon un placeholder logo.
  const imageSrc = CATEGORY_PHOTO_OVERRIDE[category] || card.image || null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageSrc} alt={card.name} loading="lazy" className="block w-full h-auto" />
      ) : (
        <div
          className="flex aspect-[4/5] w-full items-center justify-center"
          style={{ background: "var(--bg-guide)", color: "var(--text-secondary)" }}
        >
          <Logo height={22} />
        </div>
      )}
      <span
        className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium tracking-widest uppercase"
        style={{ background: categoryBg, color: categoryColor }}
      >
        <CategoryIcon size={12} />
        {categoryLabel}
      </span>
      {/* Overlay hover (28/08/2026) : discret, nom du lieu révélé au survol/tap plutôt qu'affiché
          en permanence — la grille reste épurée, dominée par les photos. */}
      <div
        className="absolute inset-0 flex items-end bg-black/0 p-4 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100"
      >
        <span className="text-sm font-semibold text-white">{card.name}</span>
      </div>
    </div>
  );
}

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
  // Un seul index ouvert à la fois (28/08/2026) — cliquer sur une autre carte referme
  // automatiquement celle en cours, cohérent avec le comportement précédent (une seule fiche
  // visible à la fois, juste inline dans la grille au lieu d'une pop-up).
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const items: GridItem[] = [
    ...stays.map((card) => ({ card, category: "Hôtel" as AddressCategory })),
    ...eats.map((card) => ({ card, category: "Resto" as AddressCategory })),
    ...activities.map((card) => ({ card, category: "Activité" as AddressCategory })),
  ];

  if (items.length === 0) return null;

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {items.map((item, i) =>
        expandedIndex === i ? (
          <AddressDetailCard
            key={i}
            card={item.card}
            category={item.category}
            familyProfile={familyProfile}
            onClose={() => setExpandedIndex(null)}
          />
        ) : (
          <button
            key={i}
            type="button"
            onClick={() => setExpandedIndex(i)}
            className="group mb-4 block w-full break-inside-avoid text-left"
          >
            <Thumbnail item={item} />
          </button>
        )
      )}
    </div>
  );
}
