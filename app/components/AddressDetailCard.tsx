"use client";

import { Users } from "lucide-react";
import { useState } from "react";
import { type Card } from "@/content/voyages";
import { type AddressCategory } from "@/lib/category-images";
import { FAMILY_PROFILE_OPTIONS, type FamilyProfile } from "@/lib/travel-match/types";
import { InstagramPopup } from "./InstagramPopup";
import { CATEGORY_META } from "./AddressGrid";

const FAMILY_PROFILE_LABEL: Record<FamilyProfile, string> = Object.fromEntries(
  FAMILY_PROFILE_OPTIONS.map((o) => [o.value, o.label])
) as Record<FamilyProfile, string>;

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
    <div
      className="relative flex h-full w-full flex-col rounded-xl p-5"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
    >
      {/* `min-h` (28/08/2026) : réserve la hauteur d'une rangée de badges — sans ça, une carte
          avec juste le badge catégorie vs une autre avec catégorie + "Partenaire" + statut
          décalait tout le contenu en dessous entre les deux. */}
      <div className="mb-3 flex min-h-[1.75rem] flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium tracking-widest uppercase"
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
      {card.location && (
        <p
          className="mono mb-2 line-clamp-1 min-h-[1.3rem]"
          style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
        >
          {card.location}
        </p>
      )}
      {card.price && (
        <p className="mono mb-2" style={{ color: "var(--lve-terracotta-dark)", fontSize: "0.85rem" }}>
          {card.price}
        </p>
      )}

      {card.instagramUrl && (
        <button
          type="button"
          onClick={() => setIgOpen(true)}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-6 text-sm font-medium transition-colors hover:opacity-90"
          style={{ background: "var(--bg-guide)", color: "var(--text-secondary)" }}
        >
          📸 Découvrir l&apos;ambiance Insta
        </button>
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
      {card.tags.length > 0 && (
        <div className="mb-4 flex min-h-[2.25rem] flex-wrap gap-2">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="mono px-2 py-1 border text-xs"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {familyProfile && <FamilyFitBlock card={card} familyProfile={familyProfile} />}

      {card.link && (
        <a
          className="mt-auto inline-block w-full px-4 py-2 mono text-sm text-center no-underline"
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
