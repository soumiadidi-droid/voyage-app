import { LikeButton } from "./LikeButton";
import { ShareButton } from "./ShareButton";
import type { VoyageContent } from "@/content/voyages";

// Hero fixe (décidé le 26/08/2026 — plus de carrousel). Fond noir semi-transparent par défaut ;
// une image optionnelle peut être posée dessous destination par destination (ex. New York) sans
// remettre en place le système précédent (voile/texture systématique sur toutes les fiches).
//
// Photo + intro réunies (29/08/2026), hauteur 100vh (`h-screen`, même jour, 3e itération) : la
// PHOTO vit dans son propre calque à hauteur FIXE (jamais de zoom/crop quel que soit le texte), le
// TEXTE (titre + accroche + intro) vit dans un calque superposé à hauteur libre qui continue
// naturellement sur le fond de page en dessous si l'intro est exceptionnellement longue.
//
// Retour à un overlay dégradé (29/08/2026, 4e itération — "correction d'urgence" demandée par
// Soumia) : la lisibilité reposait sur du text-shadow (technique choisie plus tôt dans la journée
// pour éviter tout assombrissement de la photo), remplacée ici par un dégradé noir classique
// (transparent en haut → sombre en bas) + texte blanc pur sans ombre, sur demande explicite malgré
// le sens inverse du choix précédent — confirmé par Soumia avant application.
export function DestinationHero({
  hero,
  intro,
  favoriteId,
  heroImage,
  sharePath,
}: {
  hero: VoyageContent["hero"];
  intro: string;
  favoriteId: string;
  heroImage?: string;
  sharePath: string;
}) {
  return (
    <div className="relative min-h-screen">
      {heroImage ? (
        <div
          className="absolute inset-x-0 top-0 h-screen"
          style={{ backgroundImage: `url('${heroImage}')`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      ) : (
        // Sans image, le fond reste un noir plat uniforme sur toute la hauteur du contenu.
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} />
      )}
      {heroImage && (
        <div className="absolute inset-x-0 top-0 h-screen bg-gradient-to-t from-black/60 via-black/30 to-black/20" />
      )}

      <div className="absolute top-6 right-6 sm:top-14 sm:right-14 z-20 flex items-center gap-2">
        <ShareButton path={sharePath} title={hero.title} description={hero.tagline} imageUrl={heroImage} />
        <LikeButton id={favoriteId} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-end p-6 sm:p-14 text-white">
        <div className="max-w-2xl">
          <p className="mono opacity-90 mb-3">
            {hero.country}
            {hero.tags.length > 0 && ` — ${hero.tags.join(" · ")}`}
          </p>
          {/* Serif éditoriale (29/08/2026, demande Gemini transmise par Soumia) : var(--font-title)
              = Cormorant Garamond, la vraie police "titres" du projet (pas de Playfair installé
              ici) — même police que le logo LVE et les H2 de Notre Philosophie, cohérence avec le
              reste du site plutôt qu'avec le nom générique donné dans la demande. */}
          {/* leading-[0.95] → 1.05 (29/08/2026, bug trouvé en testant toutes les fiches) : à
              clamp(3rem, 9vw, 6.2rem), un leading sous 1 fait chevaucher les lignes entre elles
              dès qu'un titre passe sur 3 lignes (ex. "Italie : Sorrente & Côte Amalfitaine") — le
              sous-titre juste en dessous se retrouvait visuellement fondu dans le titre. */}
          <h1
            className="font-extrabold leading-[1.05] mb-4"
            style={{ fontFamily: "var(--font-title)", fontSize: "clamp(3rem, 9vw, 6.2rem)" }}
          >
            {hero.title}
          </h1>
          <p
            className="italic max-w-xl opacity-95"
            style={{ fontFamily: "var(--font-body)", fontSize: "clamp(1.05rem, 2vw, 1.35rem)" }}
          >
            {hero.tagline}
          </p>
          {intro && (
            <p
              className="mt-4 leading-relaxed"
              style={{ fontFamily: "var(--font-body)", fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)" }}
            >
              {intro}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
