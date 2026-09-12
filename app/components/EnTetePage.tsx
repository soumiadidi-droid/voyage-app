// En-tête commun des pages du site (13/09/2026, demande de Soumia : "l'actuel de Ma philosophie,
// mets-moi ce titre partout"). Modèle : le haut de /philosophie tel qu'il était en ligne le 12/09 —
// halo terracotta, pastille terracotta, grand titre Cormorant aligné à gauche, citation en italique
// à filet terracotta, et au besoin un paragraphe d'introduction (children).
//
// Utilisé par /pros, /philosophie, /favoris, /sans-filtre, /carnets, /mentions-legales et
// /confidentialite. Toute nouvelle page le reprend plutôt que de recréer un titre à la main.
// `largeur` aligne le bord gauche du titre sur la colonne de contenu de la page (même largeur maximale
// et même marge intérieure que les sections : max-w-… mx-auto px-6 sm:px-8).
//
// Le bloc porte sa propre classe surface-claire : ses couleurs de marque ne changent pas en mode
// sombre, même sur les pages légales dont le corps suit le thème.
export function EnTetePage({
  pastille,
  titre,
  citation,
  largeur = "3xl",
  children,
}: {
  pastille: React.ReactNode;
  titre: React.ReactNode;
  citation?: React.ReactNode;
  largeur?: "3xl" | "5xl" | "6xl";
  children?: React.ReactNode;
}) {
  const colonne = { "3xl": "max-w-3xl", "5xl": "max-w-5xl", "6xl": "max-w-6xl" }[largeur];
  return (
    <div
      className="surface-claire py-10 sm:py-14"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, var(--lve-terracotta-bg), var(--lve-ivory))" }}
    >
      <div className={`${colonne} mx-auto px-6 sm:px-8`}>
        <span
          className="inline-block text-xs uppercase tracking-[0.25em] text-white bg-lve-terracotta font-semibold rounded-full px-4 py-1.5 mb-5"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {pastille}
        </span>
        <h1
          className={`${citation || children ? "mb-6" : ""} leading-tight text-lve-charcoal max-w-3xl`}
          style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2.2rem, 5vw, 3.2rem)" }}
        >
          {titre}
        </h1>
        {citation && (
          <p
            className="italic border-l-4 border-lve-terracotta pl-4 text-lve-charcoal/90 max-w-3xl"
            style={{ fontSize: "1.15rem" }}
          >
            {citation}
          </p>
        )}
        {children && <div className="mt-8 leading-relaxed text-lve-charcoal max-w-3xl">{children}</div>}
      </div>
    </div>
  );
}

// Bloc orange clair pour le texte (13/09/2026, demande de Soumia : "l'orange avec du texte, je
// trouve ça beau") — même famille que les cartes terracotta clair de /pros et /philosophie.
export function BlocOrange({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`surface-claire rounded-2xl bg-lve-terracotta-bg border border-lve-terracotta/20 p-6 sm:p-10 ${className}`}>
      {children}
    </div>
  );
}
