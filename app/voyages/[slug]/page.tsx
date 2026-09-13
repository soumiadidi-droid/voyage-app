import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { DestinationHero } from "../../components/DestinationHero";
import { AddressGrid } from "../../components/AddressGrid";
import { TripExtensionCard } from "../../components/TripExtensionCard";
import { DestinationPracticalCard } from "../../components/DestinationPracticalCard";
import { QuizCta } from "../../components/QuizCta";
import { CarnetEmailCapture } from "../../components/EmailCapture";
import { type Card } from "@/content/voyages";
import { getVoyage, getDestinations } from "@/lib/travel-match/data";

// Les brouillons sont lisibles sur les liens de test (preview Vercel) et en local, jamais en
// production : Soumia relit un carnet complet avant de le publier (13/09/2026).
const BROUILLONS_VISIBLES = process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development";
import { withVisibleAddresses } from "@/lib/visible-addresses";
import { estVecue } from "@/lib/carnets";
import { getCombosFor } from "@/lib/travel-match/combos";
import {
  FAMILY_PROFILE_OPTIONS,
  type DurationFilter,
  type FamilyProfile,
} from "@/lib/travel-match/types";

const FAMILY_PROFILE_VALUES: FamilyProfile[] = FAMILY_PROFILE_OPTIONS.map((o) => o.value);
import { DESTINATION_HERO_IMAGE, HERO_IMAGE_CREDIT } from "@/lib/hero-images";

// generateStaticParams retiré (27/08/2026, migration DB) : la page était déjà rendue
// dynamiquement à chaque requête (searchParams la force en `ƒ`), donc la pré-génération
// n'apportait aucun gain SSG réel — juste une dépendance DB au moment du build.

// OG tags (31/08/2026) : og:description croise l'accroche de la destination avec sa logistique
// transport réelle (travel_from_paris) quand elle existe. `destinations` reçoit une 2e requête
// Neon ici (déjà le cas pour getVoyage, appelé séparément par la page plus bas — même style que
// le reste du fichier, pas de cache/dedup particulier mis en place).
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const voyage = await getVoyage(slug, BROUILLONS_VISIBLES);
  if (!voyage) return { title: "Voyage" };

  const destinations = await getDestinations(BROUILLONS_VISIBLES);
  // Résolution par content_slug, sans `id` (pas transmis à generateMetadata) — même approximation
  // déjà acceptée ailleurs dans ce fichier pour Italie/Amérique du Nord (plusieurs destinations,
  // un seul content_slug) : la 1ère correspondance suffit pour une preview de partage.
  const destination = destinations.find((d) => d.content_slug === slug);
  const travelInfo = destination?.travel_from_paris
    ? `${destination.travel_from_paris.mode}, ${destination.travel_from_paris.duration} depuis Paris`
    : undefined;
  const image = DESTINATION_HERO_IMAGE[slug];

  // Complété le 03/09/2026 (fiches ouvertes à l'indexation) : la description reprenait la seule
  // accroche, trop courte pour un extrait de résultat de recherche. Elle annonce maintenant le
  // pays et le volume réel d'adresses de la fiche, qui est son vrai contenu.
  //
  // Google tronque l'extrait autour de 160 caractères : la logistique transport n'est ajoutée que
  // si elle tient dans ce budget, l'essentiel (pays, accroche, nombre d'adresses) passe d'abord.
  //
  // Corrigé le 13/09/2026 (repéré sur Marseille : "18 adresses testées" alors que 9 étaient sur le
  // radar) : on compte les seules adresses visibles, et on sépare le vécu du repéré — c'est la
  // distinction centrale du site, elle vaut aussi dans Google.
  const visibles = withVisibleAddresses(voyage);
  const adresses = [...visibles.stays, ...visibles.eats, ...visibles.activities];
  const vecues = adresses.filter((a) => estVecue(a.status)).length;
  const reperees = adresses.length - vecues;
  const s = (n: number) => (n > 1 ? "s" : "");
  const sentences = [`${voyage.hero.country} — ${voyage.hero.tagline}`];
  if (vecues > 0 && reperees > 0) sentences.push(`${vecues} adresse${s(vecues)} testée${s(vecues)}, ${reperees} sur mon radar.`);
  else if (vecues > 0) sentences.push(`${vecues} adresse${s(vecues)} testée${s(vecues)} et racontée${s(vecues)}.`);
  else if (reperees > 0) sentences.push(`${reperees} adresse${s(reperees)} sur mon radar.`);
  const essential = sentences.join(" ");
  const withTravel = travelInfo ? `${essential} ${travelInfo}.` : essential;
  const metaDescription = withTravel.length <= 160 ? withTravel : essential;

  return {
    title: `${voyage.hero.title} — Le Voyage des Émotions`,
    description: metaDescription,
    keywords: voyage.hero.tags,
    // Canonique explicite (03/09/2026) : la page accepte des searchParams (durée, profil famille
    // venant du questionnaire), qui créent autant d'URLs pour un même carnet. Sans canonique,
    // Google indexe ces variantes comme des pages distinctes au contenu quasi identique.
    alternates: { canonical: `/voyages/${slug}` },
    // Indexation explicite (03/09/2026) : les fiches sont la vraie porte d'entrée en recherche.
    // Un visiteur qui atterrit ici sans passer par le Travel Match est récupéré par le bloc
    // QuizCta en fin de page.
    robots: { index: true, follow: true },
    openGraph: {
      title: `Découvre ${voyage.hero.title} sur Voyage des Émotions`,
      description: metaDescription,
      url: `/voyages/${slug}`,
      siteName: "Le Voyage des Émotions",
      locale: "fr_FR",
      // "article" et non "website" : c'est un récit signé, pas une page de site.
      type: "article",
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: `${voyage.hero.title} — ${voyage.hero.country}` }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `Découvre ${voyage.hero.title} sur Voyage des Émotions`,
      description: metaDescription,
      images: image ? [image] : undefined,
    },
  };
}

// PracticalInfoSection (pilules météo/transport compactes) et le bloc ClimateSection séparé,
// supprimés le 30/08/2026 (demande Soumia — "ne garder QUE le grand bloc central combiné") :
// fusionnés en un seul DestinationPracticalCard (app/components/DestinationPracticalCard.tsx).
// practical_info.access/duration et le "quand y aller" conditionné au climat (?climate=...)
// n'ont plus d'emplacement d'affichage sur la page — signalé à Soumia, à rebrancher quelque part
// si elle le souhaite.

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
      <p
        className="mb-2 text-xs uppercase tracking-[0.25em] font-semibold"
        style={{ fontFamily: "var(--font-display)", color: "var(--accent-text)" }}
      >
        Mes adresses
      </p>
      {/* Serif éditoriale (29/08/2026, demande Gemini) : var(--font-title), cohérent avec le H1
          du hero juste au-dessus (même changement appliqué). */}
      <h2
        className="font-extrabold mb-8"
        style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.9rem, 4vw, 2.6rem)" }}
      >
        Mes adresses pépites &amp; coups de cœur
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
  const voyage = await getVoyage(slug, BROUILLONS_VISIBLES);
  if (!voyage) notFound();
  const visible = withVisibleAddresses(voyage);

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
  const destinations = await getDestinations(BROUILLONS_VISIBLES);
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
        heroCredit={HERO_IMAGE_CREDIT[voyage.slug]}
        sharePath={`/voyages/${slug}`}
      />

      {/* <div>, pas <main> (29/08/2026, bug trouvé au passage) : app/layout.tsx a déjà SON <main>
          autour de chaque page — ce <main> imbriqué ici cassait silencieusement max-w-6xl (le
          calculait à `none`), ce qui rétrécissait les cartes d'adresses par rapport à celles de
          Favoris (repéré par Soumia : "je veux la même taille que dans favoris"). max-w-6xl (était
          max-w-4xl) pour matcher exactement la largeur de app/favoris. Le bloc regional_transport
          garde son propre max-w-xl plus bas, non affecté. */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Bloc unique "Logistique & Climat" (30/08/2026) — remplace les anciennes pilules
            météo/transport ET l'ancien ClimateSection séparé. Étendu pleine largeur avec le même
            look que "Extensions possibles" (30/08/2026, 2e passe — demande explicite de Soumia).
            Vide tant que travel_from_paris/seasonality ne sont pas renseignés pour la destination. */}
        <div className="pt-8 sm:pt-10">
          <DestinationPracticalCard
            travelFromParis={destination?.travel_from_paris}
            seasonality={destination?.seasonality}
            regionalTransport={destination?.regional_transport}
          />
        </div>

        {/* Cœur de page : le reste de la fiche est dédié aux adresses/partenariat B2B — décidé le
            23/08/2026, refonte éditoriale "Alternance Story/Photos". */}
        <AddressesSection
          // Masquées tant qu'aucun lien Instagram vérifié n'est en base (29/08/2026). Le filtre vit
          // dans lib/visible-addresses.ts depuis le 10/09/2026 pour être partagé avec les mails —
          // et surtout PAS dans lib/travel-match/data.ts, cf. le commentaire de ce module.
          stays={visible.stays}
          eats={visible.eats}
          activities={visible.activities}
          familyProfile={familyProfile}
        />

        {/* Juste après les adresses (09/09/2026, demande Soumia) : c'est le moment où le lecteur
            vient de les parcourir et où "je veux garder ça" a du sens. Avant les extensions et le
            CTA questionnaire, qui l'emmènent tous les deux ailleurs. */}
        <CarnetEmailCapture slug={slug} destinationTitle={voyage.hero.title} />

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

        {/* En dernier, après les adresses et les extensions : le lecteur a vu le récit, c'est le
            moment de lui proposer le questionnaire (03/09/2026). */}
        <QuizCta />
      </div>
    </div>
  );
}
