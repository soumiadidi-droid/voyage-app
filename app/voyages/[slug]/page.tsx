import { notFound } from "next/navigation";
import { VOYAGES, getVoyage, type Card } from "@/content/voyages";

export function generateStaticParams() {
  return VOYAGES.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const voyage = getVoyage(slug);
  return { title: voyage ? `${voyage.hero.title} — Le Voyage des Émotions` : "Voyage" };
}

function CardSection({ title, cards }: { title: string; cards: Card[] }) {
  if (cards.length === 0) return null;
  return (
    <div className="my-16 sm:my-24">
      <p className="mono mb-2" style={{ color: "var(--text-secondary)" }}>
        Mes adresses
      </p>
      <h2
        className="font-extrabold mb-8"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 4vw, 2.6rem)" }}
      >
        {title}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {cards.map((card, i) => (
          <div
            key={i}
            className="border-b pb-6"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-baseline justify-between gap-4 mb-1 flex-wrap">
              <h3
                className="font-semibold"
                style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem" }}
              >
                {card.name}
              </h3>
              {card.status && (
                <span className="mono text-xs" style={{ color: "var(--aurora)" }}>
                  {card.status}
                </span>
              )}
            </div>
            {card.location && (
              <p className="mono mb-2" style={{ color: "var(--text-secondary)" }}>
                {card.location}
              </p>
            )}
            {card.review && <p className="leading-relaxed mb-2">{card.review}</p>}
            {card.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 my-2">
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
                className="mono text-sm inline-block mt-2"
                href={card.link}
                target="_blank"
                rel="noopener noreferrer nofollow"
                style={{ color: "var(--ember)" }}
              >
                {card.linkLabel || "Voir l'adresse →"}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function VoyagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const voyage = getVoyage(slug);
  if (!voyage) notFound();

  return (
    <div>
      <div
        className="grain relative min-h-[60vh] sm:min-h-[70vh] flex items-end p-6 sm:p-14 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(9,14,15,0.72) 0%, rgba(9,14,15,0.25) 42%, transparent 68%), url('${voyage.hero.image}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 max-w-2xl" style={{ color: "#f4f8f7" }}>
          <p className="mono mb-3 opacity-90">
            {voyage.hero.country}
            {voyage.hero.tags.length > 0 && ` — ${voyage.hero.tags.join(" · ")}`}
          </p>
          <h1
            className="font-extrabold leading-[0.95] mb-4"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 9vw, 6.2rem)" }}
          >
            {voyage.hero.title}
          </h1>
          <p
            className="italic mb-6 max-w-xl opacity-95"
            style={{ fontFamily: "var(--font-body)", fontSize: "clamp(1.05rem, 2vw, 1.35rem)" }}
          >
            {voyage.hero.tagline}
          </p>
          {voyage.hero.photoCount && <p className="mono opacity-80">{voyage.hero.photoCount}</p>}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 sm:px-8">
        {voyage.intro && (
          <div className="max-w-xl mx-auto my-16 sm:my-20 text-lg leading-relaxed">
            <p>
              <span className="drop-cap">{voyage.intro[0]}</span>
              {voyage.intro.slice(1)}
            </p>
          </div>
        )}

        <div className="my-14 sm:my-20 grid gap-6 sm:gap-8 sm:grid-cols-2">
          {voyage.gallery.map((photo, i) => (
            <div key={i} className={voyage.gallery.length % 2 === 1 && i === 0 ? "sm:col-span-2" : ""}>
              <a
                href={photo.hiresUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Voir la photo : ${photo.alt}`}
              >
                <div
                  className="grain relative overflow-hidden aspect-[4/5]"
                  style={{ background: "var(--border)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={photo.alt}
                    className="w-full h-full object-cover block"
                    loading="lazy"
                    src={photo.webUrl}
                  />
                </div>
              </a>
              <p className="mono mt-3" style={{ color: "var(--text-secondary)" }}>
                {photo.caption}
              </p>
              {photo.emotionalText && (
                <p className="mt-2 leading-relaxed" style={{ fontSize: "1.05rem" }}>
                  {photo.emotionalText}
                </p>
              )}
            </div>
          ))}
        </div>

        <CardSection title="Où dormir" cards={voyage.stays} />
        <CardSection title="Où manger" cards={voyage.eats} />
        <CardSection title="Activités" cards={voyage.activities} />
      </main>
    </div>
  );
}
