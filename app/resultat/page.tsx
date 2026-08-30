import { TravelerProfileCard, getArchetypeTitle } from "../components/TravelerProfileCard";
import { EmailCapture } from "../components/EmailCapture";
import { FallbackNotice } from "./FallbackNotice";
import { DestinationCard } from "./DestinationCard";
import { matchTravel, dedupeComboBadges } from "@/lib/travel-match/engine";
import { getDestinations } from "@/lib/travel-match/data";
import {
  SCORE_KEYS,
  FAMILY_PROFILE_OPTIONS,
  type UserAnswers,
  type DistanceAnswer,
  type ClimateFilter,
  type TransportFilter,
  type SportLevelFilter,
  type DurationFilter,
  type BudgetFilter,
  type Companions,
  type FamilyProfile,
} from "@/lib/travel-match/types";

// Masqué temporairement (30/08/2026, demande Soumia) — repasser à true pour réactiver.
const SHOW_EMAIL_CAPTURE = false;

export const metadata = {
  title: "Ton résultat — Le Voyage des Émotions",
};

const DISTANCE_VALUES: DistanceAnswer[] = ["proche", "europe", "long_courrier", "ouvert"];
const CLIMATE_VALUES: ClimateFilter[] = ["chaleur", "douceur", "hiver_cosy"];
const TRANSPORT_VALUES: TransportFilter[] = ["sans_voiture", "transports_possibles", "voiture_necessaire"];
const SPORT_VALUES: SportLevelFilter[] = ["tranquille", "actif"];
const DURATION_VALUES: DurationFilter[] = ["week_end", "semaine", "grand_voyage"];
const BUDGET_VALUES: BudgetFilter[] = ["eco", "confort", "premium"];
const COMPANIONS_VALUES: Companions[] = ["solo", "duo", "amis", "famille"];
const FAMILY_PROFILE_VALUES: FamilyProfile[] = FAMILY_PROFILE_OPTIONS.map((o) => o.value);

const REQUIRED_CHOICE_KEYS = ["distance", "climate", "transport", "sport_level", "duration", "budget", "companions"];

// Reconstruit les réponses depuis la query string. Si les 7 questions à choix n'ont pas toutes
// répondu (ex. arrivée directe sur /resultat sans passer par le questionnaire), `complete` est
// false et la page affiche un message plutôt qu'un résultat basé sur des valeurs inventées.
function parseAnswers(raw: Record<string, string>): { answers: UserAnswers; complete: boolean } {
  const distance = DISTANCE_VALUES.includes(raw.distance as DistanceAnswer)
    ? (raw.distance as DistanceAnswer)
    : "europe";
  const climate = CLIMATE_VALUES.includes(raw.climate as ClimateFilter)
    ? (raw.climate as ClimateFilter)
    : "douceur";
  const transport = TRANSPORT_VALUES.includes(raw.transport as TransportFilter)
    ? (raw.transport as TransportFilter)
    : "transports_possibles";
  const sport_level = SPORT_VALUES.includes(raw.sport_level as SportLevelFilter)
    ? (raw.sport_level as SportLevelFilter)
    : "tranquille";
  const duration = DURATION_VALUES.includes(raw.duration as DurationFilter)
    ? (raw.duration as DurationFilter)
    : "semaine";
  const budget = BUDGET_VALUES.includes(raw.budget as BudgetFilter)
    ? (raw.budget as BudgetFilter)
    : "confort";
  const companions = COMPANIONS_VALUES.includes(raw.companions as Companions)
    ? (raw.companions as Companions)
    : "solo";
  // Optionnel : présent seulement quand companions === "famille". Une valeur absente ou invalide ne
  // rend pas la réponse incomplète (contrairement aux REQUIRED_CHOICE_KEYS) — le pavé "Adapté aux
  // Familles" ne s'affichera simplement pas sur la fiche voyage.
  const familyProfile = FAMILY_PROFILE_VALUES.includes(raw.familyProfile as FamilyProfile)
    ? (raw.familyProfile as FamilyProfile)
    : undefined;

  const complete = REQUIRED_CHOICE_KEYS.every((key) => key in raw);

  const scores = {} as UserAnswers["scores"];
  for (const key of SCORE_KEYS) {
    const value = Number(raw[`score_${key}`]);
    scores[key] = Number.isFinite(value) && value >= 1 && value <= 5 ? value : 3;
  }

  return {
    answers: {
      filters: { distance, climate, transport, sport_level, duration, budget },
      companions,
      familyProfile,
      scores,
    },
    complete,
  };
}

export default async function ResultatPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const raw: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawParams)) {
    if (typeof value === "string") raw[key] = value;
  }

  const { answers, complete } = parseAnswers(raw);

  if (!complete) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
          On dirait que tu es arrivé·e ici sans passer par le questionnaire.
        </p>
        <a href="/questionnaire" className="mono" style={{ color: "var(--ember)" }}>
          Faire le questionnaire →
        </a>
      </div>
    );
  }

  const destinations = await getDestinations();
  const { fallback, results } = matchTravel(answers, destinations);
  const top = dedupeComboBadges(results.slice(0, 3), destinations);

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
      {/* Wording (29/08/2026, demande Gemini) : "Votre diagnostic" sonnait clinique, "les voyages
          qui te correspondent" mélangeait le tutoiement du questionnaire et le vouvoiement du
          reste du site — uniformisé sur le vouvoiement ici. */}
      <p
        className="text-[11px] font-medium uppercase tracking-widest mb-3"
        style={{ color: "var(--lve-terracotta-dark)" }}
      >
        Votre match émotionnel
      </p>
      <h1
        className="font-light mb-10 text-3xl md:text-4xl"
        style={{ fontFamily: "var(--font-title)" }}
      >
        Vos destinations idéales
      </h1>

      <TravelerProfileCard answers={answers} />

      {fallback && <FallbackNotice />}

      <div className="flex flex-col gap-8">
        {top.map((result) => (
          <DestinationCard
            key={result.destination.id}
            {...result}
            // climate ajouté (29/08/2026) : permet à la fiche voyage d'afficher un conseil
            // "quand y aller" adapté à ce que la personne a vraiment demandé (ex. "chaleur" +
            // Montréal en résultat → afficher juillet-août, pas un conseil toutes saisons).
            href={`/voyages/${result.destination.content_slug}?id=${result.destination.id}&duration=${answers.filters.duration}&climate=${answers.filters.climate}${
              answers.familyProfile ? `&familyProfile=${answers.familyProfile}` : ""
            }`}
          />
        ))}
      </div>

      {/* Masqué temporairement (30/08/2026, demande Soumia — "pour le moment, demain on règle
          ça") : l'envoi réel dépend de la vérification du domaine côté Resend, pas encore faite.
          SHOW_EMAIL_CAPTURE → true pour réactiver une fois le domaine vérifié. */}
      {SHOW_EMAIL_CAPTURE && (
        <EmailCapture
          archetypeTitle={getArchetypeTitle(answers)}
          destinations={top.map((r) => ({
            title: r.destination.title,
            slug: r.destination.content_slug,
            id: r.destination.id,
          }))}
        />
      )}
    </div>
  );
}
