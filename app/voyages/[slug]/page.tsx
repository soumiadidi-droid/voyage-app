import { notFound } from "next/navigation";
import {
  BedDouble,
  UtensilsCrossed,
  Compass,
  Users,
  Navigation,
  CalendarDays,
  Sparkles,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { DestinationHero } from "../../components/DestinationHero";
import { InstagramEmbed } from "../../components/InstagramEmbed";
import { Logo } from "../../components/Logo";
import { LVE_COLORS } from "@/lib/design-tokens";
import { type Card } from "@/content/voyages";
import { getVoyage, getDestinations } from "@/lib/travel-match/data";
import { getCombosFor } from "@/lib/travel-match/combos";
import {
  FAMILY_PROFILE_OPTIONS,
  type DurationFilter,
  type FamilyProfile,
  type PracticalInfo,
} from "@/lib/travel-match/types";

const FAMILY_PROFILE_VALUES: FamilyProfile[] = FAMILY_PROFILE_OPTIONS.map((o) => o.value);
const FAMILY_PROFILE_LABEL: Record<FamilyProfile, string> = Object.fromEntries(
  FAMILY_PROFILE_OPTIONS.map((o) => [o.value, o.label])
) as Record<FamilyProfile, string>;
import { DESTINATION_HERO_IMAGE } from "@/lib/hero-images";
import { CATEGORY_PHOTO_OVERRIDE, type AddressCategory } from "@/lib/category-images";

// generateStaticParams retiré (27/08/2026, migration DB) : la page était déjà rendue
// dynamiquement à chaque requête (searchParams la force en `ƒ`), donc la pré-génération
// n'apportait aucun gain SSG réel — juste une dépendance DB au moment du build.

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const voyage = await getVoyage(slug);
  return { title: voyage ? `${voyage.hero.title} — Le Voyage des Émotions` : "Voyage" };
}

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

// Bloc remonté juste sous le Hero/intro (décidé le 23/08/2026, ajustement UX/monétisation) —
// les 3 listes (stays/eats/activities) sont fusionnées en une seule grille de cartes avec
// catégorie affichée, pour que les adresses (dont celles en affiliation) soient visibles sans
// scroller jusqu'en bas de la fiche.
// Pavé "Adapté aux Familles" (27/08/2026) — affiché sur une carte hôtel uniquement quand le
// profil choisi au questionnaire correspond à une entrée renseignée dans card.familyFit. Pas de
// contenu par défaut/inventé : un hôtel sans entrée pour ce profil n'affiche simplement rien.
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
    <div
      className="mt-4 p-3"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
    >
      <p
        className="mono flex items-center gap-1.5 mb-2"
        style={{ color: "var(--aurora)", fontSize: "0.75rem" }}
      >
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

function AddressCard({
  card,
  category,
  familyProfile,
}: {
  card: Card;
  category: AddressCategory;
  familyProfile?: FamilyProfile;
}) {
  const { icon: CategoryIcon, label: categoryLabel, bg: categoryBg, color: categoryColor } =
    CATEGORY_META[category];

  return (
    <div
      // `shrink-0` nécessaire (28/08/2026) : carte directement enfant du flex row scrollable
      // d'AddressStrip, sinon flex-shrink:1 par défaut écrase sa largeur pour tout faire tenir
      // dans le viewport au lieu de déborder en scroll horizontal. Pleine largeur sous sm (une
      // seule carte visible à la fois sur mobile, cf. AddressStrip qui repasse en colonne en
      // dessous de ce point de rupture) ; largeur fixe à partir de sm — élargie quand la carte
      // contient un embed Instagram : 326px = largeur minimale documentée par Instagram pour son
      // embed (en dessous le header déborde, cf. InstagramEmbed.tsx), + 2×20px de padding (p-5).
      className={`flex w-full shrink-0 flex-col overflow-hidden rounded-xl ${
        card.instagramUrl ? "sm:w-[388px]" : "sm:w-[320px]"
      }`}
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
    >
      {card.instagramUrl ? (
        // Texture générique retirée (28/08/2026) quand un embed Instagram est présent : le vrai
        // post fait déjà office de visuel, la texture superposée en plus devenait redondante.
        // Le badge catégorie devient un petit label texte au lieu de flotter sur une photo.
        <div className="px-5 pt-4">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium tracking-widest uppercase"
            style={{ background: categoryBg, color: categoryColor }}
          >
            <CategoryIcon size={12} />
            {categoryLabel}
          </span>
        </div>
      ) : (
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
      )}

      <div className="p-5 flex flex-col flex-1">
        {card.instagramUrl && (
          <div className="mb-4">
            <InstagramEmbed url={card.instagramUrl} />
          </div>
        )}
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
        {card.price && (
          <p className="mono mb-2" style={{ color: "var(--lve-terracotta-dark)", fontSize: "0.85rem" }}>
            {card.price}
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
        {/* Plus restreint à category === "Hôtel" (27/08/2026) : familyFit peut aussi être
            renseigné sur une activité (ex. beach club kids-friendly) — FamilyFitBlock
            retourne déjà null tout seul si rien n'est renseigné pour ce profil. */}
        {familyProfile && <FamilyFitBlock card={card} familyProfile={familyProfile} />}
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
}

const CATEGORY_SECTION_TITLE: Record<AddressCategory, string> = {
  Hôtel: "Où dormir",
  Resto: "Où manger",
  Activité: "Quoi faire",
};

// Bande unique horizontale (28/08/2026, remplace la grille par catégorie du même jour — demande
// explicite de Soumia : hôtels/restos/activités s'enchaînent sur un seul scroll horizontal,
// plutôt que 3 sections empilées verticalement). Le repère de catégorie ("Où dormir"...) reste
// collé au bord gauche pendant qu'on traverse ses cartes (`position: sticky`, pas de JS de
// tracking de scroll), puis se fait pousser par le repère suivant à l'arrivée du prochain groupe.
function AddressStrip({
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

  return (
    // Responsive (28/08/2026) : la bande horizontale avec repère sticky ne fonctionne qu'à partir
    // de sm — sous ce point de rupture les cartes (pleine largeur, cf. AddressCard) et le repère
    // vertical (326-388px) ne laissaient presque plus rien voir d'une carte à la fois sur un
    // écran de téléphone. Sous sm : colonne verticale simple, un titre de section classique par
    // catégorie (plus de sticky/vertical-rl, ça n'a de sens qu'en scroll horizontal).
    <div className="flex flex-col gap-10 sm:flex-row sm:gap-4 sm:overflow-x-auto sm:pb-4">
      {groups.map((group) => {
        const { icon: CategoryIcon } = CATEGORY_META[group.category];
        return (
          // `sm:contents` (28/08/2026) : ce wrapper par catégorie sert à donner un gap plus
          // serré entre le titre et ses cartes sur mobile (colonne), mais doit disparaître de la
          // boîte au-delà de sm pour que titre + cartes redeviennent des flex-items DIRECTS de la
          // ligne parente (condition du pattern sticky-column pour le repère de catégorie).
          <div key={group.category} className="flex flex-col gap-4 sm:contents">
            <div className="flex shrink-0 items-center gap-2 sm:sticky sm:left-0 sm:z-10 sm:flex-col sm:justify-center sm:gap-3 sm:rounded-xl sm:px-3 sm:py-4 sm:bg-[var(--bg-guide)]">
              <CategoryIcon size={18} style={{ color: "var(--lve-terracotta-dark)" }} />
              <span
                className="font-semibold whitespace-nowrap sm:[writing-mode:vertical-rl]"
                style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}
              >
                {CATEGORY_SECTION_TITLE[group.category]}
              </span>
            </div>
            {group.cards.map((card, i) => (
              <AddressCard key={i} card={card} category={group.category} familyProfile={familyProfile} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// 4 cartes d'infos pratiques (28/08/2026) — jamais générées automatiquement (voir
// lib/travel-match/ingest.ts, NewDestinationInput.practical_info) : chaque carte n'apparaît que
// si Claude/Soumia l'a vraiment renseignée, jamais de texte générique en remplissage. Toute la
// section disparaît si aucun des 4 champs n'est renseigné.
const PRACTICAL_INFO_CARDS: {
  key: keyof PracticalInfo;
  icon: LucideIcon;
  label: string;
}[] = [
  { key: "access", icon: Navigation, label: "Accès & Transport" },
  { key: "duration", icon: CalendarDays, label: "Rythme & Durée idéale" },
  { key: "atmosphere", icon: Sparkles, label: "Esprit du lieu" },
  { key: "insider_tips", icon: Lightbulb, label: "Bon à savoir" },
];

function PracticalInfoSection({ info }: { info?: PracticalInfo }) {
  const cards = PRACTICAL_INFO_CARDS.filter(({ key }) => info?.[key]);
  if (cards.length === 0) return null;

  return (
    <div className="my-16 sm:my-20">
      <p className="mono mb-2" style={{ color: "var(--text-secondary)" }}>
        Infos pratiques
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ key, icon: Icon, label }) => (
          <div
            key={key}
            className="p-5 rounded-xl"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
          >
            <p
              className="mono flex items-center gap-2 mb-2"
              style={{ color: "var(--lve-terracotta-dark)", fontSize: "0.8rem" }}
            >
              <Icon size={15} />
              {label}
            </p>
            <p style={{ color: "var(--text-secondary)" }}>{info?.[key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddressesSection({
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
  if (stays.length === 0 && eats.length === 0 && activities.length === 0) return null;

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
      <AddressStrip stays={stays} eats={eats} activities={activities} familyProfile={familyProfile} />
    </div>
  );
}

export default async function VoyagePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id?: string; duration?: string; familyProfile?: string }>;
}) {
  const { slug } = await params;
  const voyage = await getVoyage(slug);
  if (!voyage) notFound();

  // `id` = l'identifiant précis de destination Travel Match (ex. "italie-pouilles"), transmis par
  // le lien depuis /resultat. Sans lui (accès direct à la fiche), on retombe sur le slug de
  // contenu — correct pour les 7 destinations à fiche dédiée, approximatif pour Italie/Amérique du
  // Nord qui partagent une fiche entre plusieurs destinations de matching.
  const { id: favoriteId, duration, familyProfile: rawFamilyProfile } = await searchParams;
  // Absent en accès direct à la fiche, ou si companions ≠ "famille" au questionnaire — le pavé ne
  // s'affiche simplement pas (27/08/2026).
  const familyProfile = FAMILY_PROFILE_VALUES.includes(rawFamilyProfile as FamilyProfile)
    ? (rawFamilyProfile as FamilyProfile)
    : undefined;
  const destinations = await getDestinations();
  const destination = destinations.find((d) => d.id === (favoriteId ?? slug));

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
  const eligibleCombos = getCombosFor(destination?.id ?? "", destinations).filter(
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
        <PracticalInfoSection info={destination?.practical_info} />

        {/* Cœur de page : le reste de la fiche est dédié aux adresses/partenariat B2B — décidé le
            23/08/2026, refonte éditoriale "Alternance Story/Photos". */}
        <AddressesSection
          stays={voyage.stays}
          eats={voyage.eats}
          activities={voyage.activities}
          familyProfile={familyProfile}
        />

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
