"use client";

import { Users } from "lucide-react";
import { useState } from "react";
import { type Card } from "@/content/voyages";
import { type AddressCategory } from "@/lib/category-images";
import { usePlaceFavorites } from "@/lib/favorites";
import { FAMILY_PROFILE_OPTIONS, type FamilyProfile } from "@/lib/travel-match/types";
import { InstagramPopup } from "./InstagramPopup";
import { LikeButton } from "./LikeButton";
import { CATEGORY_META, ACTIVITY_TYPE_META } from "./AddressGrid";
import { typeActivite } from "@/lib/type-activite";
import { InstagramGlyph } from "./BrandGlyphs";
import { libellesEtiquettes } from "@/lib/etiquettes";
import { insecables } from "@/lib/typo";

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
      <p className="font-display flex items-center gap-1.5 mb-2" style={{ color: "var(--aurora)", fontSize: "0.75rem" }}>
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
// Vécu ou repéré (11/09/2026, demande de Soumia) : jusqu'ici toutes les étiquettes de statut
// s'affichaient dans la même pastille verte, qu'elle ait dormi sur place ou qu'elle rêve d'y aller.
// Or c'est LA distinction que le site revendique partout — un visiteur devait lire l'étiquette mot
// à mot pour la saisir. Le vécu garde le vert (validé), le repéré passe en ardoise avec un trait
// discontinu : on voit au premier coup d'œil que ce n'est pas encore fait.
const STATUTS_VECUS = ["J’ai testé", "J'ai testé", "Testé", "J’ai dormi ici", "J'ai dormi ici"];

function statusStyle(status: string): React.CSSProperties {
  const vecu = STATUTS_VECUS.includes(status.trim());
  return vecu
    ? {
        background: "var(--lve-sage-bg)",
        color: "var(--lve-sage-dark)",
        border: "1px solid color-mix(in srgb, var(--lve-sage-dark) 20%, transparent)",
      }
    : {
        background: "var(--lve-slate-bg)",
        color: "var(--lve-slate-dark)",
        border: "1px dashed color-mix(in srgb, var(--lve-slate-dark) 35%, transparent)",
      };
}

export function AddressDetailCard({
  card,
  category,
  familyProfile,
}: {
  card: Card;
  category: AddressCategory;
  familyProfile?: FamilyProfile;
}) {
  // Les activités affichent leur type (Sport, Shopping, Culture) à la place d'« Expérience ».
  const meta = category === "Activité" ? { ...CATEGORY_META[category], ...ACTIVITY_TYPE_META[typeActivite(card.name, card.tags)] } : CATEGORY_META[category];
  const { icon: CategoryIcon, label: categoryLabel, bg: categoryBg, color: categoryColor } = meta;
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
      className="surface-claire relative flex h-full w-full flex-col overflow-hidden rounded-3xl p-5 pl-6"
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
            className="inline-flex items-center justify-center rounded-full border border-lve-border bg-white/80 p-2.5 text-lve-charcoal backdrop-blur-md transition-all hover:bg-white cursor-pointer"
          >
            <InstagramGlyph width={16} height={16} />
          </button>
        )}
        {card.id && <LikeButton id={card.id} useStore={usePlaceFavorites} size="sm" surface="claire" />}
      </div>

      {/* `min-h` (28/08/2026) : réserve la hauteur d'une rangée de badges — sans ça, une carte
          avec juste le badge catégorie vs une autre avec catégorie + "Partenaire" + statut
          décalait tout le contenu en dessous entre les deux. `pr-24` (29/08/2026, était `pr-9`)
          laisse la place aux deux icônes du coin haut-droit désormais côte à côte. */}
      <div className="mb-2 flex min-h-[1.75rem] flex-wrap items-center gap-2 pr-24">
        <span
          className="inline-flex items-center gap-1.5 rounded-full py-0.5 px-2.5 text-[10px] font-medium tracking-widest uppercase"
          style={{ background: categoryBg, color: categoryColor }}
        >
          <CategoryIcon size={12} />
          {categoryLabel}
        </span>
        {card.isPartner && (
          <span className="font-display px-2 py-1 text-xs font-semibold" style={{ background: "var(--ember)", color: "#fff" }}>
            Partenaire
          </span>
        )}
        {card.status && (
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={statusStyle(card.status)}
          >
            {card.status}
          </span>
        )}
      </div>

      {/* Nom + lieu dans un même bloc à hauteur réservée (13/09/2026, Soumia : "remonter le titre,
          l'adresse et le sigle"). Avant, la hauteur de 2 lignes était réservée au nom seul : un nom
          court laissait un trou entre lui et le lieu. Le lieu colle maintenant au nom, et c'est
          sous le lieu que l'espace libre se loge, pour que les avis restent alignés d'une carte à
          l'autre (règle du 28/08/2026 : "Le Talaia Hôtel & Spa Biarritz - MGallery Collection"
          tient sur 2 lignes). */}
      <div className="mb-2 min-h-[4.4rem]">
      <h3
        className="mb-0.5 line-clamp-2 font-semibold leading-snug"
        style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem" }}
      >
        {card.name}
        {/* Gamme de prix à côté du nom (13/09/2026, demande de Soumia), plutôt que sur sa propre
            ligne sous le lieu : elle ne décale plus le contenu entre une carte avec prix et une
            carte sans. Insécable pour ne jamais se retrouver seule en début de ligne. */}
        {card.price && (
          <span
            className="whitespace-nowrap font-medium"
            style={{ color: "var(--lve-terracotta-ink)", fontSize: "0.85rem" }}
          >
            {"\u00a0\u00a0·\u00a0"}
            {card.price}
          </span>
        )}
      </h3>
      {/* Sans-serif moderne (29/08/2026, demande Gemini) : mono retiré, var(--font-display).
          Interligne calé sur la hauteur réservée (11/09/2026) : avec une ligne plus basse que le
          min-h, le haut de la 2e ligne coupée dépassait sous la 1re (vu sur Lagoondy). */}
      {card.location && (
        <p
          className="line-clamp-1 text-xs font-medium leading-[1.3rem]"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-display)" }}
        >
          {card.location}
        </p>
      )}
      </div>

      {/* `line-clamp-3` + `min-h` (28/08/2026) : même logique que le nom/la localisation — une
          description longue vs courte décalait les tags et le bouton du dessous entre cartes. */}
      {card.review && (
        <p className="mb-3 line-clamp-3 min-h-[4.3rem] leading-relaxed" style={{ fontSize: "0.95rem" }}>
          {insecables(card.review)}
        </p>
      )}

      {/* Limité à 2 tags (30/08/2026, demande Soumia) : au-delà d'une ligne, le `min-h` fixe
          (pensé pour UNE rangée) ne suffisait plus à absorber les cartes à 3+ tags — elles
          passaient sur 2 lignes et décalaient le bouton du bas par rapport aux cartes voisines.
          Plafonner à 2 tags garde une hauteur constante quel que soit le nombre réel de tags. */}
      {/* Pilules blanches/terracotta (29/08/2026, demande Gemini — était bordure grise/mono) :
          rounded-full, fond blanc, texte terracotta, sans-serif. Taille resserrée le 30/08/2026
          (text-[11px], moins de padding) pour un rendu moins "grosse pilule". */}
      {card.tags.length > 0 && (
        <div className="mb-4 flex items-center flex-wrap gap-1.5">
          {libellesEtiquettes(card.tags).slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-medium leading-tight shadow-sm"
              style={{
                color: "var(--lve-terracotta-ink)",
                fontFamily: "var(--font-display)",
                border: "1px solid color-mix(in srgb, var(--lve-terracotta) 20%, transparent)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {familyProfile && <FamilyFitBlock card={card} familyProfile={familyProfile} />}

      {card.link && (
        // Couleur du bouton alignée sur la catégorie (30/08/2026, demande Soumia — "les liens de
        // chaque catégorie doivent avoir la couleur des catégories") : categoryColor (terracotta
        // hôtel/sauge resto/océan activité) au lieu du var(--ember) fixe utilisé partout avant.
        <a
          className="mt-auto inline-block w-full rounded-lg px-4 py-2 font-display text-sm text-center no-underline"
          href={card.link}
          target="_blank"
          rel="noopener noreferrer nofollow"
          style={{ background: categoryColor, color: "#fff" }}
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
