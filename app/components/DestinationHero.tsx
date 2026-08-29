import { LikeButton } from "./LikeButton";
import type { VoyageContent } from "@/content/voyages";

// Hero fixe (décidé le 26/08/2026 — plus de carrousel). Fond noir semi-transparent par défaut ;
// une image optionnelle peut être posée dessous destination par destination (ex. New York) sans
// remettre en place le système précédent (voile/texture systématique sur toutes les fiches).
//
// Photo + intro à nouveau réunies (29/08/2026, 2e demande de Soumia — "tu m'as coupé les images
// avec un gros bloc blanc, mets-moi la photo entière avec le texte sur l'image") : le passage
// 29/08 précédent avait détaché l'intro dans un bloc séparé sous la photo, pour éviter que
// `min-h` + `flex items-end` sur UNE SEULE boîte ne pousse la boîte (photo + texte confondus)
// bien plus haut que 60/70vh quand l'intro est longue — `background-size: cover` sur une boîte
// devenue très haute ne montrait plus qu'une bande centrale zoomée de la photo. Le bloc séparé a
// réglé le crop mais créé le nouveau problème signalé ici (bandeau visible sous la photo, quelle
// que soit sa couleur).
//
// Fix qui règle les deux à la fois : la PHOTO vit dans son propre calque à hauteur FIXE (`h-`,
// pas `min-h`) — `background-size: cover` s'applique donc toujours à un ratio de boîte stable, la
// photo ne "zoome" jamais quel que soit le texte. Le TEXTE (titre + accroche + intro) vit dans un
// calque à part, superposé (`absolute`, `z-10`), dans un conteneur EXTÉRIEUR à `min-h` : un texte
// court reste bien calé en bas de la photo (comme avant) ; un texte long grandit le conteneur
// extérieur au-delà de la hauteur de la photo, et continue naturellement sur le fond normal de la
// page juste en dessous — jamais de crop, jamais de bloc/bandeau visible.
//
// Hauteur passée à 100vh (`h-screen`, 29/08/2026, 3e itération — capture d'écran de Soumia sur
// Côte Basque montrant l'intro presque entièrement hors de la photo à 70vh) : donne beaucoup plus
// de place, la plupart des intros tiennent maintenant entièrement sur la photo. Les toutes plus
// longues (Carry-le-Rouet) peuvent encore déborder légèrement en dessous — accepté explicitement
// par Soumia plutôt que de risquer un retour du bug de crop avec une boîte à hauteur variable.
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
    <div className="relative min-h-screen">
      {heroImage ? (
        <div
          className="absolute inset-x-0 top-0 h-screen"
          style={{ backgroundImage: `url('${heroImage}')`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      ) : (
        // Sans image, le fond reste un noir plat uniforme sur toute la hauteur du contenu (rien à
        // révéler, pas concerné par le "photo entière" demandé) — inset-0 de l'extérieur à min-h
        // grandit avec le texte comme avant.
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} />
      )}

      <div className="absolute top-6 right-6 sm:top-14 sm:right-14 z-20">
        <LikeButton id={favoriteId} />
      </div>

      <div
        className="relative z-10 min-h-screen flex flex-col justify-end p-6 sm:p-14"
        style={{ color: "#f4f8f7" }}
      >
        <div className="max-w-2xl">
          <p
            className="mono opacity-90 mb-3"
            style={heroImage ? { textShadow: "0 1px 8px rgba(0,0,0,0.6)" } : undefined}
          >
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
            style={{
              fontFamily: "var(--font-title)",
              fontSize: "clamp(3rem, 9vw, 6.2rem)",
              textShadow: heroImage ? "0 2px 20px rgba(0,0,0,0.6)" : undefined,
            }}
          >
            {hero.title}
          </h1>
          <p
            className="italic max-w-xl opacity-95"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(1.05rem, 2vw, 1.35rem)",
              textShadow: heroImage ? "0 1px 12px rgba(0,0,0,0.6)" : undefined,
            }}
          >
            {hero.tagline}
          </p>
          {intro && (
            <p
              className="mt-4 leading-relaxed"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)",
                textShadow: heroImage ? "0 1px 12px rgba(0,0,0,0.6)" : undefined,
              }}
            >
              {intro}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
