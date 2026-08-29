import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Photo remise en place (29/08/2026, demande explicite de Soumia — revient sur la décision
          du 26/08/2026 "plus d'image du tout"). Aile d'avion au coucher de soleil, dernière photo
          ajoutée à public/images/ (redimensionnée à 2400px de large). Même traitement voile sombre
          que DestinationHero pour garder le texte blanc lisible. */}
      <div
        className="relative h-[85vh] flex items-center justify-center text-center px-6 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/hero-accueil.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h1
            className="text-white tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2.4rem, 7vw, 4rem)" }}
          >
            L&apos;art du voyage, <br className="hidden sm:inline" />raconté sans filtre.
          </h1>
          {/* Respiration ajustée (29/08/2026, demande Gemini) : leading un peu plus ample +
              tracking léger, plus d'air avant le CTA (pt-4 → pt-6). */}
          <p
            className="text-white/70 max-w-xl mx-auto tracking-wide"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1rem, 2vw, 1.15rem)", lineHeight: 1.8 }}
          >
            Carnets d&apos;expériences, lieux d&apos;exception et adresses curatées avec exigence.
          </p>
          <div className="pt-6">
            <Link
              href="/questionnaire"
              className="inline-block bg-lve-terracotta hover:bg-lve-terracotta-dark text-white font-medium text-[11px] tracking-widest uppercase px-8 py-4 rounded-lg shadow-lg transition-all hover:-translate-y-0.5 no-underline"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Lancer Travel Match
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 sm:px-8">
        <div className="my-16 sm:my-24 -mx-6 sm:-mx-8 px-6 sm:px-8 py-20 bg-lve-ivory">
          <div className="max-w-4xl mx-auto space-y-8 text-left">
            <span
              className="text-xs uppercase tracking-[0.25em] text-lve-terracotta font-semibold block"
              style={{ fontFamily: "var(--font-display)" }}
            >
              À Propos — Le Manifeste
            </span>

            <h2
              className="text-3xl sm:text-4xl text-lve-charcoal leading-tight max-w-2xl"
              style={{ fontFamily: "var(--font-title)" }}
            >
              Un regard humain, des adresses incarnées et la vérité de l&apos;expérience.
            </h2>

            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2 text-lve-charcoal/80 text-base leading-relaxed"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <div>
                <p>
                  Derrière <strong className="font-medium text-lve-charcoal">Le Voyage des Émotions</strong>,
                  il y a une démarche singulière : capturer l&apos;essence d&apos;un lieu à travers la
                  photographie et le récit, sans la version lissée que l&apos;on retrouve partout.
                </p>
              </div>

              <div className="space-y-4">
                <p>Chaque destination bénéficie d&apos;une clarté absolue :</p>
                <ul className="space-y-3 text-sm border-l-2 border-lve-terracotta pl-4 list-none m-0">
                  <li>
                    <strong className="text-lve-charcoal">Testée :</strong> Vécue, approuvée et
                    photographiée sur le terrain.
                  </li>
                  <li>
                    <strong className="text-lve-charcoal">Curatée :</strong> Sélectionnée pour son
                    potentiel émotif et sa pertinence.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div
          className="my-16 sm:my-24 -mx-6 sm:-mx-8 px-6 sm:px-8 py-20 bg-lve-ivory border-y border-lve-charcoal/5 text-center"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            <span
              className="text-xs uppercase tracking-[0.25em] text-lve-terracotta font-semibold block"
              style={{ fontFamily: "var(--font-display)" }}
            >
              9 questions — 2 minutes
            </span>

            <h2
              className="text-3xl sm:text-5xl text-lve-charcoal leading-tight"
              style={{ fontFamily: "var(--font-title)" }}
            >
              Trouvez le voyage qui vous ressemble
            </h2>

            <p
              className="text-base sm:text-lg text-lve-charcoal/70 max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Votre profil voyageur, une destination parfaitement alignée et une sélection
              d&apos;adresses exclusives.
            </p>

            <div className="pt-4">
              <Link
                href="/questionnaire"
                className="inline-block bg-lve-terracotta hover:bg-lve-terracotta-dark text-white text-xs uppercase tracking-[0.2em] font-medium px-8 py-4 rounded-lg shadow-md transition-all hover:-translate-y-0.5 no-underline"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Lancer Travel Match
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
