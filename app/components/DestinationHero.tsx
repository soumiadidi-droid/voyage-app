import { LikeButton } from "./LikeButton";
import type { VoyageContent } from "@/content/voyages";

// Hero fixe (décidé le 26/08/2026 — plus de carrousel). Fond noir semi-transparent par défaut ;
// une image optionnelle peut être posée dessous destination par destination (ex. New York) sans
// remettre en place le système précédent (voile/texture systématique sur toutes les fiches).
//
// Bande image + intro détachée en dessous (29/08/2026) : avant, `min-h` + `flex items-end`
// laissait le titre ET l'intro (parfois 4-5 lignes) pousser le bloc entier bien plus haut que
// 60/70vh sur mobile — l'image en `inset-0` s'étirait pour suivre, et `background-size: cover`
// sur une boîte devenue très haute et étroite ne laissait plus voir qu'une bande centrale zoomée
// de la photo ("la photo du hero est coupée"). L'intro (souvent longue) passe dans un bloc sombre
// séparé en dessous, pour ne plus faire gonfler la bande photo.
//
// Bien garder `min-h-` ici, PAS `h-` (bug du 29/08/2026, corrigé) : `h-` est une hauteur RIGIDE
// qui, combinée à `overflow-hidden`, coupe net tout contenu qui dépasse (repéré par Soumia :
// "tu m'as coupé le hero avec un bout noir" — un titre+accroche un peu longs sur mobile, avec le
// H1 en clamp(3rem, 9vw, 6.2rem), peut dépasser 60vh même une fois l'intro sortie du bloc). `min-h`
// grandit avec le contenu, donc le texte n'est jamais rogné ; le crop de l'image reste réglé
// puisque c'est l'intro (déjà déplacée) qui causait l'inflation excessive, pas le titre seul.
export function DestinationHero({
  hero,
  intro,
  favoriteId,
  heroImage,
}: {
  hero: VoyageContent["hero"];
  intro: string;
  favoriteId: string;
  heroImage?: string;
}) {
  return (
    <div>
      <div className="relative min-h-[60vh] sm:min-h-[70vh] flex items-end p-6 sm:p-14 overflow-hidden">
        {heroImage && (
          <div
            className="absolute inset-0"
            style={{ backgroundImage: `url('${heroImage}')`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
        )}
        {heroImage ? (
          // Dégradé gauche→droite (décidé le 26/08/2026, demandé sur NYC puis étendu à toute image
          // de Hero) : sombre sous le texte pour la lisibilité, plus léger à droite pour laisser
          // respirer la photo. Sans image, le fond reste un noir plat uniforme (rien à révéler).
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/15" />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} />
        )}

        <div className="absolute top-6 right-6 sm:top-14 sm:right-14 z-20">
          <LikeButton id={favoriteId} />
        </div>

        <div className="relative z-10 max-w-2xl" style={{ color: "#f4f8f7" }}>
          <p className="mono opacity-90 mb-3">
            {hero.country}
            {hero.tags.length > 0 && ` — ${hero.tags.join(" · ")}`}
          </p>
          <h1
            className="font-extrabold leading-[0.95] mb-4"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 9vw, 6.2rem)" }}
          >
            {hero.title}
          </h1>
          <p
            className="italic max-w-xl opacity-95"
            style={{ fontFamily: "var(--font-body)", fontSize: "clamp(1.05rem, 2vw, 1.35rem)" }}
          >
            {hero.tagline}
          </p>
        </div>
      </div>

      {intro && (
        <div
          className="p-6 sm:p-14"
          style={heroImage ? { background: "var(--lve-charcoal)" } : { backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="max-w-2xl" style={{ color: "#f4f8f7" }}>
            <p
              className="leading-relaxed opacity-95"
              style={{ fontFamily: "var(--font-body)", fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)" }}
            >
              {intro}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
