"use client";

// Univers d'une grande destination en onglets (14/09/2026, demande Soumia : « comme la météo, été,
// hiver… chaque fois que tu cliques, ça change »). Mêmes pastilles que les saisons, onglet actif en terracotta de
// DestinationPracticalCard. L'onglet ouvert par défaut est l'univers du visiteur (?univers= venu de
// /resultat), sinon le premier qui a des adresses. Les univers encore vides restent cliquables et
// l'annoncent : Soumia voulait voir la forme complète avant de les remplir.
import { useState } from "react";
import { type Card } from "@/content/voyages";
import { type FamilyProfile } from "@/lib/travel-match/types";
import type { Univers } from "@/lib/travel-match/univers";
import { AddressGrid } from "./AddressGrid";

export function UniversTabs({
  univers,
  stays,
  eats,
  activities,
  universInitial,
  familyProfile,
}: {
  univers: Univers[];
  stays: Card[];
  eats: Card[];
  activities: Card[];
  universInitial?: string;
  familyProfile?: FamilyProfile;
}) {
  const dans = (slug: string) => (c: Card) => (c.univers ?? []).includes(slug);
  const nbAdresses = (slug: string) => [...stays, ...eats, ...activities].filter(dans(slug)).length;
  const parDefaut =
    univers.find((u) => u.slug === universInitial)?.slug ?? univers.find((u) => nbAdresses(u.slug) > 0)?.slug ?? univers[0]?.slug;
  const [actif, setActif] = useState(parDefaut);
  const courant = univers.find((u) => u.slug === actif);
  if (!courant) return null;
  const vide = nbAdresses(courant.slug) === 0;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8" role="tablist">
        {univers.map((u) => {
          const active = u.slug === actif;
          return (
            <button
              key={u.slug}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActif(u.slug)}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
              style={
                active
                  ? { background: "var(--lve-terracotta-dark)", color: "#fff", fontWeight: 600 }
                  : { background: "#fff", color: "var(--lve-charcoal)", border: "1px solid var(--lve-border)" }
              }
            >
              {u.nom}
            </button>
          );
        })}
      </div>

      <h3 className="mb-2 font-semibold" style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
        {courant.nom}
      </h3>
      {courant.phrase && (
        <p className="mb-1 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
          {courant.phrase}
        </p>
      )}
      {courant.entree && (
        <p className="mb-2 max-w-2xl italic" style={{ fontFamily: "var(--font-body)", fontSize: "1.1rem", color: "var(--text)" }}>
          {courant.entree}
        </p>
      )}
      {courant.lieux && (
        <p
          className="mb-6 text-xs uppercase tracking-[0.2em] font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "var(--accent-text)" }}
        >
          {courant.lieux}
        </p>
      )}

      {vide ? (
        <p
          className="surface-claire rounded-2xl px-6 py-8 text-center"
          style={{ background: "var(--surface-sand)", color: "var(--lve-charcoal)" }}
        >
          Je prépare mes adresses pour ce Paris‑là. Elles arrivent bientôt.
        </p>
      ) : (
        <AddressGrid
          stays={stays.filter(dans(courant.slug))}
          eats={eats.filter(dans(courant.slug))}
          activities={activities.filter(dans(courant.slug))}
          familyProfile={familyProfile}
        />
      )}
    </div>
  );
}
