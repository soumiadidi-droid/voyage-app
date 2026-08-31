"use client";

import { useState } from "react";
import Link from "next/link";
import { DestinationPracticalCard } from "./DestinationPracticalCard";
import { AddressDetailCard } from "./AddressDetailCard";
import type { TravelFromParis, Seasonality, RegionalTransport } from "@/lib/travel-match/types";
import type { Card } from "@/content/voyages";
import type { AddressCategory } from "@/lib/category-images";

export type DemoItem = {
  id: string;
  label: string;
  destinationTitle: string;
  travelFromParis?: TravelFromParis;
  seasonality?: Seasonality;
  regionalTransport?: RegionalTransport;
  addressCard?: Card;
  addressCategory: AddressCategory;
};

// Section "Découvrir la démo" (31/08/2026) — donne un aperçu du rendu du site sans passer par le
// questionnaire. 3 puces = 3 vraies destinations du catalogue (résolues côté serveur dans
// app/page.tsx), affichées ici via DestinationPracticalCard/AddressDetailCard réutilisés tels
// quels — pas de duplication de rendu, mêmes gardes "vide si non renseigné" que ces composants ont
// déjà.
export function InteractiveDemo({ items }: { items: DemoItem[] }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  if (!selected) return null;

  return (
    <div className="my-16 sm:my-24">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-10">
          <span
            className="text-xs uppercase tracking-[0.25em] text-lve-terracotta font-semibold block mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sans engagement
          </span>
          <h2
            className="text-3xl sm:text-4xl text-lve-charcoal leading-tight mb-4"
            style={{ fontFamily: "var(--font-title)" }}
          >
            Découvrir la démo
          </h2>
          <p
            className="text-base text-lve-charcoal/70 max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Un aperçu du rendu, avec de vraies destinations du catalogue — avant de faire le
            questionnaire.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {items.map((item) => {
            const active = item.id === selected.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className="rounded-full border px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer"
                style={
                  active
                    ? { borderColor: "var(--lve-terracotta)", background: "var(--lve-terracotta-bg)", color: "var(--lve-terracotta-dark)" }
                    : { borderColor: "var(--lve-border)", color: "var(--lve-charcoal)" }
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <p
          className="mono mb-4 text-center"
          style={{ color: "var(--text-secondary)" }}
        >
          {selected.destinationTitle}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <DestinationPracticalCard
            travelFromParis={selected.travelFromParis}
            seasonality={selected.seasonality}
            regionalTransport={selected.regionalTransport}
          />
          {selected.addressCard && (
            <AddressDetailCard card={selected.addressCard} category={selected.addressCategory} />
          )}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/questionnaire"
            className="inline-block bg-lve-terracotta hover:bg-lve-terracotta-dark text-white text-xs uppercase tracking-[0.2em] font-medium px-8 py-4 rounded-lg shadow-md transition-all hover:-translate-y-0.5 no-underline"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Créer mon propre voyage
          </Link>
        </div>
      </div>
    </div>
  );
}
