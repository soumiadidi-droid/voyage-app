import { matchDestinations, buildPersona, type Answers } from "@/lib/matching";

export const metadata = {
  title: "Ton résultat — Le Voyage des Émotions",
};

export default async function ResultatPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const answers: Answers = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") answers[key] = value;
  }

  const results = matchDestinations(answers).slice(0, 3);
  const persona = buildPersona(answers);

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
      <p className="mono mb-2" style={{ color: "var(--text-secondary)" }}>
        Ton profil voyageur
      </p>
      <h1
        className="font-extrabold mb-3"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)" }}
      >
        {persona.title}
      </h1>
      <p className="mb-12 max-w-lg" style={{ color: "var(--text-secondary)" }}>
        {persona.description}
      </p>

      <p className="mono mb-6" style={{ color: "var(--text-secondary)" }}>
        Les destinations qui te correspondent
      </p>

      <div className="flex flex-col gap-8">
        {results.map(({ destination, score, tier, contextLines }) => (
          <div key={destination.slug} className="border p-6" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <h2
                className="font-semibold"
                style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}
              >
                {destination.title}
              </h2>
              <span className="mono" style={{ color: "var(--ember)" }}>
                {tier} — {score}%
              </span>
            </div>
            <p className="mb-3" style={{ color: "var(--text-secondary)" }}>
              {destination.tagline}
            </p>
            <ul className="mono flex flex-wrap gap-x-2 gap-y-1" style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
              {contextLines.map((line, i) => (
                <li key={i}>
                  {line.positive ? "+" : "−"} {line.text}
                  {i < contextLines.length - 1 ? " ·" : ""}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
