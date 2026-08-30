import { notFound } from "next/navigation";
import { Navigation, CalendarDays, Sun, Sparkles, type LucideIcon } from "lucide-react";
import { DestinationHero } from "../../components/DestinationHero";
import { AddressGrid } from "../../components/AddressGrid";
import { TripExtensionCard } from "../../components/TripExtensionCard";
import { type Card } from "@/content/voyages";
import { getVoyage, getDestinations } from "@/lib/travel-match/data";
import { getCombosFor } from "@/lib/travel-match/combos";
import {
  FAMILY_PROFILE_OPTIONS,
  type ClimateFilter,
  type DurationFilter,
  type FamilyProfile,
  type PracticalInfo,
} from "@/lib/travel-match/types";

const FAMILY_PROFILE_VALUES: FamilyProfile[] = FAMILY_PROFILE_OPTIONS.map((o) => o.value);
import { DESTINATION_HERO_IMAGE } from "@/lib/hero-images";

// generateStaticParams retiré (27/08/2026, migration DB) : la page était déjà rendue
// dynamiquement à chaque requête (searchParams la force en `ƒ`), donc la pré-génération
// n'apportait aucun gain SSG réel — juste une dépendance DB au moment du build.

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const voyage = await getVoyage(slug);
  return { title: voyage ? `${voyage.hero.title} — Le Voyage des Émotions` : "Voyage" };
}

// Pictos pratico-pratiques compacts (28/08/2026, remplace les 4 grandes cartes du même jour —
// demande explicite de Soumia : juste transport et saison, en petit badge sous le Hero, pas tout
// le bloc "Infos pratiques" d'origine). `atmosphere`/`insider_tips` ne sont plus affichés ici
// tant qu'elle ne redemande pas de les remettre ailleurs — jamais générés automatiquement (voir
// lib/travel-match/ingest.ts, NewDestinationInput.practical_info), affiché seulement si renseigné.
const PRACTICAL_INFO_BADGES: {
  key: Extract<keyof PracticalInfo, "access" | "duration">;
  icon: LucideIcon;
}[] = [
  { key: "access", icon: Navigation },
  { key: "duration", icon: CalendarDays },
];

function PracticalInfoSection({ info, whenToGo }: { info?: PracticalInfo; whenToGo?: string }) {
  const badges = PRACTICAL_INFO_BADGES.filter(({ key }) => info?.[key]);
  if (badges.length === 0 && !whenToGo) return null;

  return (
    <div className="my-8 sm:my-10 flex flex-wrap gap-3">
      {/* "Quand y aller" (29/08/2026) — résolu côté page à partir de destination.when_to_go et du
          climat demandé au questionnaire (?climate=...), pas une clé de PracticalInfo comme les
          deux badges ci-dessous : affiché en premier quand présent. */}
      {whenToGo && (
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-md text-xs font-medium"
          style={{
            background: "color-mix(in srgb, var(--bg-guide) 70%, transparent)",
            fontFamily: "var(--font-display)",
          }}
        >
          <Sun size={15} style={{ color: "var(--lve-terracotta-dark)" }} />
          {whenToGo}
        </span>
      )}
      {/* Sans-serif moderne (29/08/2026, demande Gemini) : var(--font-display) = Bricolage
          Grotesque, remplace le style code/mono jugé trop technique pour un badge pratique. */}
      {badges.map(({ key, icon: Icon }) => (
        <span
          key={key}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-md text-xs font-medium"
          style={{
            background: "color-mix(in srgb, var(--bg-guide) 70%, transparent)",
            fontFamily: "var(--font-display)",
          }}
        >
          <Icon size={15} style={{ color: "var(--lve-terracotta-dark)" }} />
          {info?.[key]}
        </span>
      ))}
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
      {/* Serif éditoriale (29/08/2026, demande Gemini) : var(--font-title), cohérent avec le H1
          du hero juste au-dessus (même changement appliqué). */}
      <h2
        className="font-extrabold mb-8"
        style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.9rem, 4vw, 2.6rem)" }}
      >
        Nos adresses pépites &amp; coups de cœur
      </h2>
      <AddressGrid stays={stays} eats={eats} activities={activities} familyProfile={familyProfile} />
    </div>
  );
}

export default async function VoyagePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id?: string; duration?: string; familyProfile?: string; climate?: string }>;
}) {
  const { slug } = await params;
  const voyage = await getVoyage(slug);
  if (!voyage) notFound();

  // `id` = l'identifiant précis de destination Travel Match (ex. "italie-pouilles"), transmis par
  // le lien depuis /resultat. Sans lui (accès direct à la fiche), on retombe sur le slug de
  // contenu — correct pour les 7 destinations à fiche dédiée, approximatif pour Italie/Amérique du
  // Nord qui partagent une fiche entre plusieurs destinations de matching.
  const { id: favoriteId, duration, familyProfile: rawFamilyProfile, climate: rawClimate } = await searchParams;
  // Absent en accès direct à la fiche, ou si companions ≠ "famille" au questionnaire — le pavé ne
  // s'affiche simplement pas (27/08/2026).
  const familyProfile = FAMILY_PROFILE_VALUES.includes(rawFamilyProfile as FamilyProfile)
    ? (rawFamilyProfile as FamilyProfile)
    : undefined;
  const destinations = await getDestinations();
  const destination = destinations.find((d) => d.id === (favoriteId ?? slug));

  // "Quand y aller" résolu selon le climat demandé au questionnaire (29/08/2026) — ex. "chaleur"
  // + Montréal en résultat affiche le conseil été plutôt qu'un conseil toutes saisons. Repli sur
  // `default` si le climat n'a pas d'entrée dédiée (ex. "douceur") ou en accès direct sans
  // `?climate=`. `undefined` si rien n'est renseigné — jamais de texte inventé.
  const CLIMATE_VALUES: ClimateFilter[] = ["chaleur", "douceur", "hiver_cosy"];
  const climate = CLIMATE_VALUES.includes(rawClimate as ClimateFilter)
    ? (rawClimate as ClimateFilter)
    : undefined;
  // "douceur" n'a pas d'entrée dédiée dans WhenToGo (climat déjà tempéré, pas de saison à
  // pointer spécifiquement) — repli direct sur `default` pour cette valeur.
  const whenToGo =
    (climate === "chaleur" && destination?.when_to_go?.chaleur) ||
    (climate === "hiver_cosy" && destination?.when_to_go?.hiver_cosy) ||
    destination?.when_to_go?.default;

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

      {/* <div>, pas <main> (29/08/2026, bug trouvé au passage) : app/layout.tsx a déjà SON <main>
          autour de chaque page — ce <main> imbriqué ici cassait silencieusement max-w-6xl (le
          calculait à `none`), ce qui rétrécissait les cartes d'adresses par rapport à celles de
          Favoris (repéré par Soumia : "je veux la même taille que dans favoris"). max-w-6xl (était
          max-w-4xl) pour matcher exactement la largeur de app/favoris. Le bloc regional_transport
          garde son propre max-w-xl plus bas, non affecté. */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <PracticalInfoSection info={destination?.practical_info} whenToGo={whenToGo} />

        {/* Remonté juste après les badges pratiques (30/08/2026, demande Soumia) — vivait avant
            tout en bas de la page, après les adresses et les extensions, quasi invisible sans
            scroller jusqu'au bout. */}
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

        {/* Cœur de page : le reste de la fiche est dédié aux adresses/partenariat B2B — décidé le
            23/08/2026, refonte éditoriale "Alternance Story/Photos". */}
        <AddressesSection
          // Masquées tant qu'aucun lien Instagram vérifié n'est en base (29/08/2026) — filtré ici,
          // uniquement à l'affichage de la fiche voyage, PAS dans lib/travel-match/data.ts : cette
          // couche est aussi utilisée par app/favoris/actions.ts pour retrouver un établissement
          // déjà liké (usePlaceFavorites), qui doit continuer à s'afficher dans "Mes Favoris" même
          // sans lien Instagram — bug du 29/08/2026 où un like posé avant l'ajout du lien
          // disparaissait silencieusement de la page Favoris, corrigé en déplaçant le filtre ici.
          stays={voyage.stays.filter((c) => c.instagramUrl)}
          eats={voyage.eats.filter((c) => c.instagramUrl)}
          activities={voyage.activities.filter((c) => c.instagramUrl)}
          familyProfile={familyProfile}
        />

        {eligibleCombos.length > 0 && (
          <section className="my-16 sm:my-24">
            <div
              className="flex items-center gap-2 mb-4 text-xs font-semibold tracking-wider uppercase"
              style={{ color: "color-mix(in srgb, var(--lve-plum-dark) 80%, transparent)" }}
            >
              <Sparkles size={16} style={{ color: "var(--lve-plum-dark)" }} />
              <span>Prolonger le voyage</span>
            </div>
            <h2
              className="text-2xl md:text-3xl font-bold mb-6 tracking-tight"
              style={{ fontFamily: "var(--font-title)", color: "var(--lve-charcoal)" }}
            >
              Extensions possibles
            </h2>
            <div className="flex flex-col gap-6">
              {eligibleCombos.map(({ combo, otherDestination }) => (
                <TripExtensionCard key={combo.id} combo={combo} otherDestination={otherDestination} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
