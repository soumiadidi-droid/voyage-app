import { notFound } from "next/navigation";
import { Navigation, CalendarDays, Sparkles, Lightbulb, type LucideIcon } from "lucide-react";
import { DestinationHero } from "../../components/DestinationHero";
import { AddressGrid } from "../../components/AddressGrid";
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
import { DESTINATION_HERO_IMAGE } from "@/lib/hero-images";

// generateStaticParams retiré (27/08/2026, migration DB) : la page était déjà rendue
// dynamiquement à chaque requête (searchParams la force en `ƒ`), donc la pré-génération
// n'apportait aucun gain SSG réel — juste une dépendance DB au moment du build.

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const voyage = await getVoyage(slug);
  return { title: voyage ? `${voyage.hero.title} — Le Voyage des Émotions` : "Voyage" };
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
      <AddressGrid stays={stays} eats={eats} activities={activities} familyProfile={familyProfile} />
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
