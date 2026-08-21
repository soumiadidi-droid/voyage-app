import Link from "next/link";
import { Logo } from "./components/Logo";

export default function Home() {
  return (
    <div>
      <div
        className="grain relative flex flex-col items-center justify-center text-center px-6 py-24 sm:py-32 overflow-hidden"
        style={{ background: "#1A1714", color: "#E8DFC8" }}
      >
        <div className="mb-10" style={{ color: "#E8DFC8" }}>
          <Logo height={56} />
        </div>
        <h1
          className="mb-6"
          style={{
            fontFamily: "var(--font-title), serif",
            fontWeight: 300,
            fontSize: "clamp(2.4rem, 7vw, 4.4rem)",
            lineHeight: 1.05,
            letterSpacing: "0.01em",
          }}
        >
          Mes voyages,
          <br />
          racontés vrai.
        </h1>
        <div className="w-16 h-px mb-6" style={{ background: "#E8DFC8", opacity: 0.45 }} />
        <p className="italic mb-10 max-w-md opacity-90" style={{ fontFamily: "var(--font-body)", fontSize: "1.1rem" }}>
          Une photo, une histoire derrière — et une distinction claire entre ce que j&apos;ai
          vécu et ce que j&apos;ai simplement bien choisi.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            className="inline-block px-6 py-3 mono no-underline"
            href="/questionnaire"
            style={{ background: "var(--ember)", color: "#fff" }}
          >
            Trouver mon voyage
          </Link>
          <Link
            className="inline-block px-6 py-3 mono no-underline border"
            href="/voyages"
            style={{ borderColor: "#E8DFC8", opacity: 0.9 }}
          >
            Explorer mes voyages
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 sm:px-8">
        <div className="max-w-xl mx-auto my-16 sm:my-24 text-lg leading-relaxed text-center">
          <p className="mono mb-4" style={{ color: "var(--text-secondary)" }}>
            À propos
          </p>
          <p>
            <span className="drop-cap">D</span>errière Le Voyage des Émotions, il y a une seule
            personne : moi. Je voyage, je photographie, et j&apos;écris ce que chaque photo
            raconte vraiment — pas la version lissée qu&apos;on trouve partout ailleurs. Chaque
            destination est marquée clairement : <em>testée</em> quand j&apos;y suis allée,{" "}
            <em>recherchée</em> quand je l&apos;ai sélectionnée sans encore y avoir mis les pieds.
            Je ne mélange jamais les deux. Le tri et la mise en page, c&apos;est la technique. Le
            regard, lui, reste entièrement humain.
          </p>
        </div>

        <div
          className="my-16 sm:my-24 -mx-6 sm:-mx-8 px-6 sm:px-8 py-12 sm:py-20 border-t border-b text-center"
          style={{ background: "var(--bg-guide)", borderColor: "var(--border)" }}
        >
          <div className="max-w-xl mx-auto">
            <p className="mono mb-2" style={{ color: "var(--aurora)" }}>
              10 questions, 2 minutes
            </p>
            <h2
              className="font-extrabold mb-4"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 4vw, 2.6rem)" }}
            >
              Trouve le voyage qui te correspond
            </h2>
            <p className="mb-7" style={{ color: "var(--text-secondary)" }}>
              Ton profil voyageur, une destination qui colle vraiment, et mes adresses qui vont
              avec.
            </p>
            <Link
              className="inline-block px-6 py-3 mono no-underline"
              href="/questionnaire"
              style={{ background: "var(--aurora)", color: "#08120e" }}
            >
              Commencer le questionnaire
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
