import Link from "next/link";
import { VOYAGES } from "@/content/voyages";

export const metadata = {
  title: "Voyages — Le Voyage des Émotions",
};

export default function VoyagesPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16">
      <h1
        className="font-extrabold mb-3"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 5vw, 3.2rem)" }}
      >
        Explorer mes voyages
      </h1>
      <p className="mb-12" style={{ color: "var(--text-secondary)" }}>
        Chaque voyage, ses photos, ses adresses testées.
      </p>
      <div className="grid gap-8 sm:grid-cols-2">
        {VOYAGES.map((voyage) => (
          <Link
            key={voyage.slug}
            className="block no-underline group"
            href={`/voyages/${voyage.slug}`}
          >
            <div
              className="grain relative aspect-[4/3] overflow-hidden mb-4"
              style={{ background: "var(--border)" }}
            >
              {voyage.hero.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={voyage.hero.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  src={voyage.hero.image}
                />
              )}
            </div>
            <h2
              className="font-semibold mb-1"
              style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}
            >
              {voyage.hero.title}
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>{voyage.hero.tagline}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
