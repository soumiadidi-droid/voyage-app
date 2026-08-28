"use client";

import { X, Users } from "lucide-react";
import { useEffect } from "react";
import { type Card } from "@/content/voyages";
import { type AddressCategory } from "@/lib/category-images";
import { FAMILY_PROFILE_OPTIONS, type FamilyProfile } from "@/lib/travel-match/types";
import { InstagramEmbed } from "./InstagramEmbed";
import { CATEGORY_META } from "./AddressGrid";

const FAMILY_PROFILE_LABEL: Record<FamilyProfile, string> = Object.fromEntries(
  FAMILY_PROFILE_OPTIONS.map((o) => [o.value, o.label])
) as Record<FamilyProfile, string>;

// Pavé "Adapté aux Familles" — copié tel quel depuis l'ancienne AddressCard (page.tsx) lors du
// passage à la grille éditoriale + modale de détail (28/08/2026). Pas de contenu par défaut/
// inventé : un hôtel sans entrée pour ce profil n'affiche simplement rien.
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

export function AddressDetailModal({
  card,
  category,
  familyProfile,
  onClose,
}: {
  card: Card;
  category: AddressCategory;
  familyProfile?: FamilyProfile;
  onClose: () => void;
}) {
  const { icon: CategoryIcon, label: categoryLabel, bg: categoryBg, color: categoryColor } = CATEGORY_META[category];

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    // Empêche le scroll de la page derrière la modale ouverte.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 rounded-full p-1.5"
          style={{ background: "var(--bg-guide)", color: "var(--text)" }}
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-3">
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

        <h2 className="font-semibold mb-1" style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}>
          {card.name}
        </h2>
        {card.location && (
          <p className="mono mb-4" style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {card.location}
          </p>
        )}
        {card.price && (
          <p className="mono mb-4" style={{ color: "var(--lve-terracotta-dark)", fontSize: "0.85rem" }}>
            {card.price}
          </p>
        )}

        {card.instagramUrl && (
          // Click-to-load (comportement par défaut d'InstagramEmbed) : rien ne se charge tant que
          // l'utilisateur n'a pas ouvert cette modale ET cliqué sur le badge — pas de coût de
          // perf pour les adresses jamais consultées en détail.
          <div className="mb-4">
            <InstagramEmbed url={card.instagramUrl} />
          </div>
        )}

        {card.review && (
          <p className="leading-relaxed mb-3" style={{ fontSize: "0.95rem" }}>
            {card.review}
          </p>
        )}

        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
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
            className="mt-4 inline-block w-full px-4 py-2 mono text-sm text-center no-underline"
            href={card.link}
            target="_blank"
            rel="noopener noreferrer nofollow"
            style={{ background: "var(--ember)", color: "#fff" }}
          >
            {card.linkLabel || "Voir l'adresse →"}
          </a>
        )}
      </div>
    </div>
  );
}
