import { notFound } from "next/navigation";
import { BedDouble, UtensilsCrossed, Compass, type LucideIcon } from "lucide-react";
import { DestinationHero } from "../../components/DestinationHero";
import { Logo } from "../../components/Logo";
import { LVE_COLORS } from "@/lib/design-tokens";
import { VOYAGES, getVoyage, type Card } from "@/content/voyages";
import { DESTINATIONS } from "@/lib/travel-match/destinations";
import { getCombosFor } from "@/lib/travel-match/combos";
import type { DurationFilter } from "@/lib/travel-match/types";
import { DESTINATION_HERO_IMAGE } from "@/lib/hero-images";

export function generateStaticParams() {
  return VOYAGES.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const voyage = getVoyage(slug);
  return { title: voyage ? `${voyage.hero.title} — Le Voyage des Émotions` : "Voyage" };
}

type AddressCategory = "Hôtel" | "Resto" | "Activité";

// Étiquette catégorie minimaliste (icône fine + petite majuscule espacée) — décidé le 23/08/2026.
// Pas de 4e catégorie "Café" séparée de "Resto" : le modèle de données ne distingue pas les cafés
// des restaurants dans `eats`, donc pas de tri inventé par Claude — à revoir avec Soumia si elle
// veut ajouter ce champ.
// Code couleur pastel par catégorie — décidé le 23/08/2026, tokens centralisés dans
// lib/design-tokens.ts (Design System LVE) plutôt que des hex dupliqués ici.
const CATEGORY_META: Record<AddressCategory, { icon: LucideIcon; label: string; bg: string; color: string }> = {
  Hôtel: { icon: BedDouble, label: "Hôtel de charme", bg: LVE_COLORS.terracotta.bg, color: LVE_COLORS.terracotta.dark },
  Resto: { icon: UtensilsCrossed, label: "Table épicurienne", bg: LVE_COLORS.sage.bg, color: LVE_COLORS.sage.dark },
  Activité: { icon: Compass, label: "Expérience", bg: LVE_COLORS.ocean.bg, color: LVE_COLORS.ocean.dark },
};

// Texture en photo systématique par catégorie (décidé le 26/08/2026) — remplace la vraie photo de
// l'adresse, contrairement à CATEGORY_META qui ne concerne que le badge.
const CATEGORY_PHOTO_OVERRIDE: Partial<Record<AddressCategory, string>> = {
  Hôtel: "/images/textures/lin.jpg",
  Resto: "/images/textures/marbre.jpg",
  Activité: "/images/textures/activite.jpg",
};

// Bloc remonté juste sous le Hero/intro (décidé le 23/08/2026, ajustement UX/monétisation) —
// les 3 listes (stays/eats/activities) sont fusionnées en une seule grille de cartes avec
// catégorie affichée, pour que les adresses (dont celles en affiliation) soient visibles sans
// scroller jusqu'en bas de la fiche.
function AddressesSection({
  stays,
  eats,
  activities,
}: {
  stays: Card[];
  eats: Card[];
  activities: Card[];
}) {
  const items: { card: Card; category: AddressCategory }[] = [
    ...stays.map((card) => ({ card, category: "Hôtel" as const })),
    ...eats.map((card) => ({ card, category: "Resto" as const })),
    ...activities.map((card) => ({ card, category: "Activité" as const })),
  ];
  if (items.length === 0) return null;

  return (
    <div className="my-16 sm:my-20">
      <p className="mono mb-2" style={{ color: "var(--text-secondary)" }}>
        Mes adresses
      </p>
      <h2
        className="font-extrabold mb-8"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 4vw, 2.6rem)" }}
      >
        Nos adresses pépites &amp; coups de cœur ✨
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map(({ card, category }, i) => {
          const { icon: CategoryIcon, label: categoryLabel, bg: categoryBg, color: categoryColor } =
            CATEGORY_META[category];
          return (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-xl"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
          >
            <div className="relative h-48 w-full">
              {CATEGORY_PHOTO_OVERRIDE[category] ? (
                // Texture en photo systématique pour Hôtel/Resto (décidé le 26/08/2026) — pas un
                // simple fallback, remplace la vraie photo même quand card.image existe. Le badge
                // catégorie n'est pas concerné, il garde sa couleur pastel plate (cf. plus bas).
                <div
                  className="grain h-48 w-full flex items-center justify-center"
                  style={{
                    backgroundImage: `url('${CATEGORY_PHOTO_OVERRIDE[category]}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ) : card.image ? (
                // Retour en arrière (décidé le 23/08/2026) : plus aucun filtre couleur (ni
                // "Obsidian" ni "Terracotta"), photo affichée telle quelle.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.image}
                  alt={card.name}
                  loading="lazy"
                  className="h-48 w-full object-cover block"
                />
              ) : (
                <div
                  className="h-48 w-full flex items-center justify-center"
                  style={{ background: "var(--bg-guide)", color: "var(--text-secondary)" }}
                >
                  <Logo height={22} />
                </div>
              )}
              <span
                className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium tracking-widest uppercase"
                style={{ background: categoryBg, color: categoryColor }}
              >
                <CategoryIcon size={12} />
                {categoryLabel}
              </span>
            </div>

            <div className="p-5 flex flex-col flex-1">
              {(card.isPartner || card.status) && (
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {card.isPartner && (
                    <span
                      className="mono px-2 py-1 text-xs font-semibold"
                      style={{ background: "var(--ember)", color: "#fff" }}
                    >
                      Partenaire
                    </span>
                  )}
                  {card.status && (
                    <span
                      className="mono px-2 py-1 text-xs font-semibold"
                      style={{ border: "1px solid var(--aurora)", color: "var(--aurora)" }}
                    >
                      {card.status}
                    </span>
                  )}
                </div>
              )}
              <h3
                className="font-semibold mb-1"
                style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem" }}
              >
                {card.name}
              </h3>
              {card.location && (
                <p className="mono mb-2" style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  {card.location}
                </p>
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
              {card.link && (
                <a
                  className="inline-block mt-auto px-4 py-2 mono text-sm text-center no-underline"
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
        })}
      </div>
    </div>
  );
}

export default async function VoyagePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id?: string; duration?: string }>;
}) {
  const { slug } = await params;
  const voyage = getVoyage(slug);
  if (!voyage) notFound();

  // `id` = l'identifiant précis de destination Travel Match (ex. "italie-pouilles"), transmis par
  // le lien depuis /resultat. Sans lui (accès direct à la fiche), on retombe sur le slug de
  // contenu — correct pour les 7 destinations à fiche dédiée, approximatif pour Italie/Amérique du
  // Nord qui partagent une fiche entre plusieurs destinations de matching.
  const { id: favoriteId, duration } = await searchParams;
  const destination = DESTINATIONS.find((d) => d.id === (favoriteId ?? slug));

  // Combos affichés seulement si la durée choisie par l'utilisateur couvre le minimum requis par
  // le combo (décidé le 23/08/2026). Sans `duration` transmis (accès direct), on n'affiche rien —
  // pas de deviner. Ordre : week_end < semaine < grand_voyage.
  const DURATION_ORDER: Record<DurationFilter, number> = { week_end: 0, semaine: 1, grand_voyage: 2 };
  const userDurationRank = duration && duration in DURATION_ORDER
    ? DURATION_ORDER[duration as DurationFilter]
    : -1;
  // getCombosFor reconstruit aussi les combos "sens inverse" (déclarés une seule fois côté
  // destination phare — décidé le 23/08/2026, voir lib/travel-match/combos.ts). Le titre du combo
  // est rédigé pour le sens "authored" ; côté "reverse" on affiche un titre générique à la place
  // pour éviter une phrase à l'envers.
  const eligibleCombos = getCombosFor(destination?.id ?? "").filter(
    ({ combo }) => userDurationRank >= DURATION_ORDER[combo.min_duration_required]
  );

  return (
    <div>
      {/* Plus de carrousel (décidé le 26/08/2026) : fond noir semi-transparent, avec une image en
          plus destination par destination si renseignée dans DESTINATION_HERO_IMAGE. */}
      <DestinationHero
        hero={voyage.hero}
        intro={voyage.intro}
        favoriteId={favoriteId ?? slug}
        heroImage={DESTINATION_HERO_IMAGE[voyage.slug]}
      />

      <main className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Cœur de page : le reste de la fiche est dédié aux adresses/partenariat B2B — décidé le
            23/08/2026, refonte éditoriale "Alternance Story/Photos". */}
        <AddressesSection stays={voyage.stays} eats={voyage.eats} activities={voyage.activities} />

        {destination?.regional_transport && (
          <div
            className="max-w-xl mx-auto mb-16 sm:mb-20 p-5"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
          >
            <p className="mono mb-2" style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Se déplacer sur place 🚆
            </p>
            <p className="mb-1">
              <strong>{destination.regional_transport.recommended_mode}</strong>
            </p>
            <p className="mb-1" style={{ color: "var(--text-secondary)" }}>
              {destination.regional_transport.summary}
            </p>
            {destination.regional_transport.pass_or_tip && (
              <p className="italic" style={{ color: "var(--text-secondary)" }}>
                {destination.regional_transport.pass_or_tip}
              </p>
            )}
          </div>
        )}

        {eligibleCombos.length > 0 && (
          <div className="my-16 sm:my-24">
            <p className="mono mb-2" style={{ color: "var(--text-secondary)" }}>
              🔀 Prolonger le voyage
            </p>
            <h2
              className="font-extrabold mb-8"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 4vw, 2.6rem)" }}
            >
              Extensions possibles
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {eligibleCombos.map(({ combo, otherDestination }) => (
                <div key={combo.id} className="border p-6" style={{ borderColor: "var(--border)" }}>
                  <h3
                    className="font-semibold mb-2"
                    style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem" }}
                  >
                    {combo.title}
                  </h3>
                  <p className="mono mb-3" style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    {combo.vibe_type}
                  </p>
                  <p className="leading-relaxed mb-4">{combo.description}</p>

                  <div
                    className="p-3 mb-4"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  >
                    <p className="mono mb-1" style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                      Comment faire la liaison
                    </p>
                    <p className="text-sm mb-1">
                      {combo.transition_logistics.transport_mode} —{" "}
                      {combo.transition_logistics.recommended_days}
                    </p>
                    {combo.transition_logistics.practical_tip && (
                      <p className="text-sm italic mb-1" style={{ color: "var(--text-secondary)" }}>
                        {combo.transition_logistics.practical_tip}
                      </p>
                    )}
                    {combo.transition_logistics.partner_link && (
                      <a
                        href={combo.transition_logistics.partner_link}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="mono text-sm inline-block mt-1"
                        style={{ color: "var(--ember)" }}
                      >
                        {combo.transition_logistics.partner_link_label || "Voir l'offre →"}
                      </a>
                    )}
                  </div>

                  <a
                    href={`/voyages/${otherDestination.content_slug}?id=${otherDestination.id}`}
                    className="mono"
                    style={{ color: "var(--ember)" }}
                  >
                    Découvrir {otherDestination.title} →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
