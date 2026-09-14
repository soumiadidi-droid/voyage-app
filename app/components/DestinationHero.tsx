import { CreditPhoto } from "./CreditPhoto";
import { LikeButton } from "./LikeButton";
import { ShareButton } from "./ShareButton";
import type { VoyageContent } from "@/content/voyages";

// Hero fixe (décidé le 26/08/2026 — plus de carrousel). La PHOTO vit dans son propre calque à
// hauteur FIXE (`h-screen`, jamais de zoom/crop quel que soit le texte), le TEXTE vit dans un calque
// superposé à hauteur libre qui continue sur le fond de page si l'intro est longue.
//
// Bloc beige (13/09/2026, choisi par Soumia entre deux options mises à l'essai — "bloc beige
// j'adore") : le texte blanc sur photo était illisible dès que l'image avait des zones claires
// (Marseille). Le texte passe en bleu nuit dans un panneau crème semi-transparent, flouté derrière
// ("un peu plus transparent") : la photo reste lumineuse, sans voile sombre. L'autre option, un voile
// noir à 45 % sur toute la photo, a été écartée car elle ternissait l'image.
// Remplace le dégradé noir + texte blanc du 29/08/2026.

// Découpe l'intro en deux blocs, à la phrase la plus proche du milieu (13/09/2026, demande de
// Soumia : "aérer le grand paragraphe"). Une intro courte (une ou deux phrases) reste d'un seul
// tenant.
function decouperIntro(intro: string): string[] {
  const phrases = intro.split(/(?<=[.!?…])\s+/).filter(Boolean);
  if (phrases.length < 3) return [intro];
  const moitie = intro.length / 2;
  let cumul = 0;
  let coupe = 1;
  for (let i = 0; i < phrases.length - 1; i++) {
    cumul += phrases[i].length + 1;
    if (cumul >= moitie) {
      coupe = i + 1;
      break;
    }
  }
  return [phrases.slice(0, coupe).join(" "), phrases.slice(coupe).join(" ")];
}

const ENCRE = "#1c2433";

export function DestinationHero({
  hero,
  intro,
  favoriteId,
  heroImage,
  heroCredit,
  panneauADroite = false,
  heroPosition = "center",
  sharePath,
}: {
  hero: VoyageContent["hero"];
  intro: string;
  favoriteId: string;
  heroImage?: string;
  heroCredit?: { texte: string; lien: string };
  // Bloc de texte à droite, pour laisser voir le sujet de la photo quand il est à gauche (Paris : Garnier).
  panneauADroite?: boolean;
  // Cadrage de la photo (ex. « 18% center » pour garder le sujet visible sur téléphone).
  heroPosition?: string;
  sharePath: string;
}) {
  const eyebrow = hero.country + (hero.tags.length > 0 ? ` — ${hero.tags.join(" · ")}` : "");
  const blocs = intro ? decouperIntro(intro) : [];

  return (
    <div className="relative min-h-screen">
      {heroImage ? (
        <div
          className="absolute inset-x-0 top-0 h-screen"
          style={{ backgroundImage: `url('${heroImage}')`, backgroundSize: "cover", backgroundPosition: heroPosition }}
        >
          <CreditPhoto credit={heroCredit} className="left-2 top-2 sm:left-auto sm:top-auto sm:bottom-2 sm:right-2" />
        </div>
      ) : (
        // Sans image, le fond reste un noir plat uniforme sur toute la hauteur du contenu.
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} />
      )}

      <div className="absolute top-6 right-6 sm:top-14 sm:right-14 z-20 flex items-center gap-2">
        <ShareButton path={sharePath} title={hero.title} description={hero.tagline} imageUrl={heroImage} />
        <LikeButton id={favoriteId} />
      </div>

      <div className={`relative z-10 min-h-screen flex flex-col justify-end p-4 pt-24 sm:p-14 ${panneauADroite ? "sm:items-end" : ""}`}>
        {/* surface-claire : le panneau garde son encre sombre même en mode sombre. Marges latérales
            élargies (13/09/2026, Soumia : "que le texte ne frôle pas les bords"). */}
        <div
          className="surface-claire max-w-2xl rounded-2xl px-7 py-7 sm:px-14 sm:py-11 shadow-2xl backdrop-blur-md"
          style={{ background: "rgba(250, 246, 240, 0.82)", color: ENCRE }}
        >
          <p
            className="mb-3 text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--lve-terracotta-ink)" }}
          >
            {eyebrow}
          </p>
          {/* Cormorant Garamond, la police des titres du projet. leading 1.05 : en dessous de 1, les
              lignes se chevauchent dès qu'un titre passe sur 3 lignes (Italie : Sorrente & Côte
              Amalfitaine, 29/08/2026). */}
          <h1
            className="font-extrabold leading-[1.05] mb-4"
            style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2.6rem, 7vw, 4.8rem)" }}
          >
            {hero.title}
          </h1>
          <p
            className="italic leading-snug"
            style={{ fontFamily: "var(--font-body)", fontSize: "clamp(1.15rem, 2.2vw, 1.45rem)", opacity: 0.85 }}
          >
            {hero.tagline}
          </p>
          {blocs.length > 0 && (
            <div
              className="mt-6 pt-6 space-y-4"
              style={{
                borderTop: `1px solid ${ENCRE}26`,
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.98rem, 1.5vw, 1.08rem)",
                lineHeight: 1.8,
              }}
            >
              {/* Sur téléphone, la suite de l'intro se déplie (relecture du 14/09/2026 : une intro longue
                  recouvrait toute la photo). Sur ordinateur, tout est affiché. */}
              {blocs.map((b, i) =>
                i === 0 ? (
                  <p key={b.slice(0, 24)}>{b}</p>
                ) : (
                  <div key={b.slice(0, 24)}>
                    <p className="hidden sm:block">{b}</p>
                    <details className="sm:hidden">
                      <summary className="cursor-pointer text-sm font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--lve-terracotta-ink)" }}>
                        Lire la suite
                      </summary>
                      <p className="mt-3">{b}</p>
                    </details>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
