import { LikeButton } from "../components/LikeButton";
import { matchTravel } from "@/lib/travel-match/engine";
import { DESTINATIONS } from "@/lib/travel-match/destinations";
import {
  EMOTION_KEYS,
  VIBE_KEYS,
  type UserAnswers,
  type DistanceFilter,
  type ClimateFilter,
  type TransportFilter,
  type SportLevelFilter,
  type Companions,
} from "@/lib/travel-match/types";

export const metadata = {
  title: "Ton résultat — Le Voyage des Émotions",
};

const DISTANCE_VALUES: DistanceFilter[] = ["proche", "europe", "long_courrier"];
const CLIMATE_VALUES: ClimateFilter[] = ["chaleur", "douceur", "hiver_cosy"];
const TRANSPORT_VALUES: TransportFilter[] = ["sans_voiture", "transports_possibles", "voiture_necessaire"];
const SPORT_VALUES: SportLevelFilter[] = ["tranquille", "actif"];
const COMPANIONS_VALUES: Companions[] = ["solo", "duo", "amis", "famille_moins_6", "famille_plus_6"];

// Reconstruit les réponses depuis la query string. Si les 5 questions à choix n'ont pas toutes
// répondu (ex. arrivée directe sur /resultat sans passer par le questionnaire), `complete` est
// false et la page affiche un message plutôt qu'un résultat basé sur des valeurs inventées.
function parseAnswers(raw: Record<string, string>): { answers: UserAnswers; complete: boolean } {
  const distance = DISTANCE_VALUES.includes(raw.distance as DistanceFilter)
    ? (raw.distance as DistanceFilter)
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
  const companions = COMPANIONS_VALUES.includes(raw.companions as Companions)
    ? (raw.companions as Companions)
    : "solo";

  const complete = ["distance", "climate", "transport", "sport_level", "companions"].every(
    (key) => key in raw
  );

  const emotions = {} as UserAnswers["emotions"];
  for (const key of EMOTION_KEYS) {
    const value = Number(raw[`emo_${key}`]);
    emotions[key] = Number.isFinite(value) && value >= 1 && value <= 5 ? value : 3;
  }

  const vibe = {} as UserAnswers["vibe"];
  for (const key of VIBE_KEYS) {
    const value = Number(raw[`vibe_${key}`]);
    vibe[key] = Number.isFinite(value) && value >= 1 && value <= 5 ? value : 3;
  }

  return {
    answers: { filters: { distance, climate, transport, sport_level }, companions, emotions, vibe },
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

  const { fallback, results } = matchTravel(answers, DESTINATIONS);
  const top = results.slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
      <p className="mono mb-2" style={{ color: "var(--text-secondary)" }}>
        Ton résultat
      </p>
      <h1
        className="font-extrabold mb-10"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)" }}
      >
        Les voyages qui te correspondent
      </h1>

      {fallback && (
        <p
          className="mb-10 px-5 py-4 border"
          style={{ borderColor: "var(--ember)", color: "var(--text-secondary)" }}
        >
          Aucune destination ne correspond à 100% à tous tes critères logistiques stricts, mais
          voici les voyages les plus proches de tes envies émotionnelles :
        </p>
      )}

      <div className="flex flex-col gap-8">
        {top.map(({ destination, score, brokenFilters }) => (
          <div key={destination.id} className="border p-6" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <h2
                className="font-semibold"
                style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}
              >
                {destination.title}
              </h2>
              <div className="flex items-center gap-3">
                <span className="mono" style={{ color: "var(--ember)" }}>
                  {score}%
                </span>
                <LikeButton id={destination.id} />
              </div>
            </div>
            <p className="mb-3" style={{ color: "var(--text-secondary)" }}>{destination.summary}</p>
            <ul
              className="mono flex flex-wrap gap-x-2 gap-y-1 mb-3"
              style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}
            >
              {destination.tags.map((tag) => (
                <li key={tag}>#{tag}</li>
              ))}
            </ul>
            {brokenFilters.length > 0 && (
              <ul
                className="mono flex flex-wrap gap-x-2 gap-y-1 mb-3"
                style={{ color: "var(--ember)", fontSize: "0.75rem" }}
              >
                {brokenFilters.map((label) => (
                  <li key={label}>⚠️ {label}</li>
                ))}
              </ul>
            )}
            <a
              href={`/voyages/${destination.content_slug}?id=${destination.id}`}
              className="mono"
              style={{ color: "var(--ember)" }}
            >
              Voir la fiche voyage →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
