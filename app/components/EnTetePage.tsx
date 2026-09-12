// En-tête commun des pages éditoriales (13/09/2026, demande de Soumia : "je veux que ce soit
// cohérent, même pour le titre"). Modèle : l'en-tête de /sans-filtre validé la veille. Utilisé par
// /pros, /philosophie, /favoris et /sans-filtre — toute nouvelle page de ce type le reprend plutôt
// que de recréer un titre à la main.
//
// Grand titre Cormorant avec UN mot en italique terracotta, une ligne en capitales encadrée de
// filets (filets masqués sur téléphone pour tenir sur une ligne), une chute en italique, sur le
// halo terracotta du site.
export function EnTetePage({
  avant = "",
  accent,
  apres = "",
  surtitre,
  chute,
}: {
  avant?: string;
  accent: string;
  apres?: string;
  surtitre: string;
  chute: React.ReactNode;
}) {
  return (
    <div
      className="px-6 sm:px-8 pt-14 sm:pt-20 pb-10 sm:pb-14 text-center"
      style={{ background: "radial-gradient(ellipse 70% 90% at 50% 0%, var(--lve-terracotta-bg), var(--lve-bg))" }}
    >
      <h1
        className="leading-[0.95] text-lve-charcoal mb-7 sm:mb-9"
        style={{ fontFamily: "var(--font-title)", fontSize: "clamp(3.2rem, 11vw, 8rem)", letterSpacing: "-0.02em" }}
      >
        {avant}
        <em className="italic text-lve-terracotta-dark">{accent}</em>
        {apres}
      </h1>
      <p
        className="flex items-center justify-center gap-5 text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.3em] font-semibold text-lve-terracotta-ink mb-3"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <span className="hidden sm:block h-px w-16 shrink-0 bg-lve-terracotta/50" aria-hidden="true" />
        {surtitre}
        <span className="hidden sm:block h-px w-16 shrink-0 bg-lve-terracotta/50" aria-hidden="true" />
      </p>
      <p
        className="italic text-lve-charcoal/75 max-w-2xl mx-auto leading-snug"
        style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.3rem, 2.8vw, 1.8rem)" }}
      >
        {chute}
      </p>
    </div>
  );
}
