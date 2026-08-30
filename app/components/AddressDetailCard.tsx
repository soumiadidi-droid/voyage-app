"use client";

import { Users } from "lucide-react";
import { useState } from "react";
import type { SVGProps } from "react";
import { type Card } from "@/content/voyages";
import { type AddressCategory } from "@/lib/category-images";
import { usePlaceFavorites } from "@/lib/favorites";
import { FAMILY_PROFILE_OPTIONS, type FamilyProfile } from "@/lib/travel-match/types";
import { InstagramPopup } from "./InstagramPopup";
import { LikeButton } from "./LikeButton";
import { CATEGORY_META } from "./AddressGrid";

const FAMILY_PROFILE_LABEL: Record<FamilyProfile, string> = Object.fromEntries(
  FAMILY_PROFILE_OPTIONS.map((o) => [o.value, o.label])
) as Record<FamilyProfile, string>;

// lucide-react n'a plus d'icônes de marque (Instagram retiré, cf. leur politique de licence) —
// glyphe maison au même gabarit que les icônes lucide environnantes (viewBox 24, strokeWidth 1.75).
function InstagramGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Pavé "Adapté aux Familles" — inchangé depuis l'ancienne AddressDetailModal. Pas de contenu par
// défaut/inventé : un hôtel sans entrée pour ce profil n'affiche simplement rien.
function FamilyFitBlock({ card, familyProfile }: { card: Card; familyProfile: FamilyProfile }) {
  const fit = card.familyFit?.[familyProfile];
  if (!fit) return null;

  const rows: { label: string; items: string[] }[] = [
    { label: "Lits & chambres", items: [fit.beds] },
    { label: "Équipements", items: fit.equipment },
    { label: "Services", items: fit.services },
    { label: "Activités", items: fit.activities },
  ].filter((row) => row.items.length > 0 && row.items.some(Boolean));

  if (rows.length === 0) return null;

  return (
    <div className="mt-4 p-3" style={{ background: "var(--bg-guide)", border: "1px solid var(--border)" }}>
      <p className="mono flex items-center gap-1.5 mb-2" style={{ color: "var(--aurora)", fontSize: "0.75rem" }}>
        <Users size={12} />
        Adapté aux Familles — {FAMILY_PROFILE_LABEL[familyProfile]}
      </p>
      <dl className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <div key={row.label} className="text-sm">
            <dt className="inline font-semibold">{row.label} : </dt>
            <dd className="inline" style={{ color: "var(--text-secondary)" }}>
              {row.items.filter(Boolean).join(", ")}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// Fiche détail (28/08/2026, remplace AddressDetailModal, puis retire le mécanisme vignette+clic
// introduit le même jour — nouvelle demande explicite de Soumia : chaque carte affiche
// directement son détail complet dans la grille, plus de texture/image de couverture à cliquer).
// L'embed Instagram reste sur son propre écran séparé (InstagramPopup), ouvert seulement au clic
// sur le badge dédié.
export function AddressDetailCard({
  card,
  category,
  familyProfile,
}: {
  card: Card;
  category: AddressCategory;
  familyProfile?: FamilyProfile;
}) {
  const { icon: CategoryIcon, label: categoryLabel, bg: categoryBg, color: categoryColor } = CATEGORY_META[category];
  const [igOpen, setIgOpen] = useState(false);

  return (
    // `flex h-full flex-col` (28/08/2026) : cellule de grille CSS (pas columns/masonry — demande
    // explicite de Soumia, "taille homogène alignement parfait") ; grid étire chaque carte à la
    // hauteur de la plus haute de sa rangée, ce wrapper remplit cet espace et pousse le lien en
    // bas via mt-auto plus loin, pour que toutes les cartes d'une même rangée s'alignent pile.
    //
    // Repris le look du bloc "Extensions possibles" (30/08/2026, demande Soumia — "même look and
    // feel") : dégradé subtil, coins très arrondis, barre d'accent latérale. Teintée par
    // catégorie (categoryBg/categoryColor déjà utilisés pour le badge) plutôt qu'aplatie en
    // terracotta partout — cohérent avec la distinction existante hôtel/resto/activité.
    <div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl p-5 pl-6"
      style={{
        background: `linear-gradient(135deg, ${categoryBg} 0%, #ffffff 60%, ${categoryBg} 100%)`,
        border: `1px solid color-mix(in srgb, ${categoryColor} 20%, transparent)`,
      }}
    >
      <div
        className="absolute left-0 top-0 h-full w-2"
        style={{ background: `linear-gradient(to bottom, color-mix(in srgb, ${categoryColor} 65%, white), ${categoryColor})` }}
      />
      {/* Icônes du coin haut-droit (29/08/2026, alignées ensemble dans une même rangée) : lien
          Instagram (ouvre InstagramPopup en autoLoad, remplace l'ancien gros bouton dégradé
          "Voir l'ambiance sur Instagram" — demande explicite de Soumia, juste l'icône déclenche
          l'embed) puis le favori établissement (28/08/2026, même mécanisme que le like
          destination, store localStorage séparé, cf. lib/favorites.ts). */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        {card.instagramUrl && (
          <button
            type="button"
            onClick={() => setIgOpen(true)}
            aria-label="Voir le post Instagram"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-black/30 p-2.5 text-white backdrop-blur-md transition-all hover:bg-black/50 cursor-pointer"
          >
            <InstagramGlyph width={16} height={16} />
          </button>
        )}
        {card.id && <LikeButton id={card.id} useStore={usePlaceFavorites} size="sm" />}
      </div>

      {/* `min-h` (28/08/2026) : réserve la hauteur d'une rangée de badges — sans ça, une carte
          avec juste le badge catégorie vs une autre avec catégorie + "Partenaire" + statut
          décalait tout le contenu en dessous entre les deux. `pr-24` (29/08/2026, était `pr-9`)
          laisse la place aux deux icônes du coin haut-droit désormais côte à côte. */}
      <div className="mb-3 flex min-h-[1.75rem] flex-wrap items-center gap-2 pr-24">
        <span
          className="inline-flex items-center gap-1.5 rounded-full py-0.5 px-2.5 text-[10px] font-medium tracking-widest uppercase"
          style={{ background: categoryBg, color: categoryColor }}
        >
          <CategoryIcon size={12} />
          {categoryLabel}
        </span>
        {card.isPartner && (
          <span className="mono px-2 py-1 text-xs font-semibold" style={{ background: "var(--ember)", color: "#fff" }}>
            Partenaire
          </span>
        )}
        {card.status && (
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              background: "var(--lve-sage-bg)",
              color: "var(--lve-sage-dark)",
              border: "1px solid color-mix(in srgb, var(--lve-sage-dark) 20%, transparent)",
            }}
          >
            {card.status}
          </span>
        )}
      </div>

      {/* `line-clamp-2` + `min-h` (28/08/2026) : sans ça, un nom court (1 ligne) vs un nom long
          (3 lignes, ex. "Le Talaia Hôtel & Spa Biarritz - MGallery Collection") décalait tout le
          contenu en dessous — repéré par Soumia. Hauteur réservée fixe pour 2 lignes max, peu
          importe le nombre réel de lignes du nom. */}
      <h3
        className="mb-1 line-clamp-2 min-h-[3.5rem] font-semibold"
        style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem" }}
      >
        {card.name}
      </h3>
      {/* Sans-serif moderne (29/08/2026, demande Gemini) : mono retiré, var(--font-display). */}
      {card.location && (
        <p
          className="mb-2 line-clamp-1 min-h-[1.3rem] text-xs font-medium"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-display)" }}
        >
          {card.location}
        </p>
      )}
      {card.price && (
        <p className="mono mb-2" style={{ color: "var(--lve-terracotta-dark)", fontSize: "0.85rem" }}>
          {card.price}
        </p>
      )}

      {/* `line-clamp-3` + `min-h` (28/08/2026) : même logique que le nom/la localisation — une
          description longue vs courte décalait les tags et le bouton du dessous entre cartes. */}
      {card.review && (
        <p className="mb-3 line-clamp-3 min-h-[4.3rem] leading-relaxed" style={{ fontSize: "0.95rem" }}>
          {card.review}
        </p>
      )}

      {/* `min-h` (28/08/2026) : réserve la hauteur d'une rangée de tags, pour que le bouton du bas
          (poussé par mt-auto) parte du même niveau même quand le nombre de tags diffère. */}
      {/* Pilules blanches/terracotta (29/08/2026, demande Gemini — était bordure grise/mono) :
          rounded-full, fond blanc, texte terracotta, sans-serif. */}
      {card.tags.length > 0 && (
        <div className="mb-4 flex min-h-[2.25rem] flex-wrap gap-2">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white py-0.5 px-2.5 text-xs font-medium leading-tight shadow-sm"
              style={{ color: "var(--lve-terracotta-dark)", fontFamily: "var(--font-display)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {familyProfile && <FamilyFitBlock card={card} familyProfile={familyProfile} />}

      {card.link && (
        <a
          className="mt-auto inline-block w-full rounded-lg px-4 py-2 mono text-sm text-center no-underline"
          href={card.link}
          target="_blank"
          rel="noopener noreferrer nofollow"
          style={{ background: "var(--ember)", color: "#fff" }}
        >
          {card.linkLabel || "Voir l'adresse →"}
        </a>
      )}

      {igOpen && card.instagramUrl && (
        <InstagramPopup url={card.instagramUrl} onClose={() => setIgOpen(false)} />
      )}
    </div>
  );
}
