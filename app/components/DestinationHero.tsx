import { LikeButton } from "./LikeButton";
import { ShareButton } from "./ShareButton";
import type { VoyageContent } from "@/content/voyages";
import { PHOTO_GRADE } from "@/lib/photo-grade";

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

export function DestinationHero({
  hero,
  intro,
  favoriteId,
  heroImage,
  sharePath,
  variante,
}: {
  hero: VoyageContent["hero"];
  intro: string;
  favoriteId: string;
  heroImage?: string;
  sharePath: string;
  // Deux options de lisibilité à l'essai (13/09/2026) : "voile" assombrit toute la photo et garde le
  // texte blanc ; "bloc" pose le texte sombre dans un panneau crème. Sans variante, rendu actuel.
  variante?: "voile" | "bloc";
}) {
  const eyebrow = hero.country + (hero.tags.length > 0 ? ` — ${hero.tags.join(" · ")}` : "");

  if (variante) {
    const blocs = intro ? decouperIntro(intro) : [];
    const surBloc = variante === "bloc";
    return (
      <div className="relative min-h-screen">
        {heroImage ? (
          <div
            className="absolute inset-x-0 top-0 h-screen"
            style={{ backgroundImage: `url('${heroImage}')`, backgroundSize: "cover", backgroundPosition: "center", filter: PHOTO_GRADE.filtre }}
          />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} />
        )}
        {heroImage && variante === "voile" && (
          // Option 1 : voile noir uniforme à 45 %, plus un fondu vers le bas pour que le texte reste
          // lisible s'il déborde sous la photo.
          <>
            <div className="absolute inset-x-0 top-0 h-screen" style={{ background: "rgba(0,0,0,0.45)" }} />
            <div className="absolute inset-x-0 top-0 h-screen bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </>
        )}

        <div className="absolute top-6 right-6 sm:top-14 sm:right-14 z-20 flex items-center gap-2">
          <ShareButton path={sharePath} title={hero.title} description={hero.tagline} imageUrl={heroImage} />
          <LikeButton id={favoriteId} />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col justify-end p-4 sm:p-14 pt-24">
          <div
            className={surBloc ? "surface-claire max-w-2xl rounded-2xl p-6 sm:p-10 shadow-2xl" : "max-w-2xl text-white"}
            style={surBloc ? { background: "rgba(250, 246, 240, 0.95)", color: "#1c2433" } : undefined}
          >
            <p
              className="mb-3 text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold"
              style={{ fontFamily: "var(--font-display)", color: surBloc ? "var(--lve-terracotta-ink)" : undefined }}
            >
              {eyebrow}
            </p>
            <h1
              className="font-extrabold leading-[1.05] mb-4"
              style={{ fontFamily: "var(--font-title)", fontSize: surBloc ? "clamp(2.6rem, 7vw, 4.8rem)" : "clamp(3rem, 9vw, 6.2rem)" }}
            >
              {hero.title}
            </h1>
            <p
              className="italic leading-snug"
              style={{ fontFamily: "var(--font-body)", fontSize: "clamp(1.15rem, 2.2vw, 1.45rem)", opacity: surBloc ? 0.85 : 0.95 }}
            >
              {hero.tagline}
            </p>
            {blocs.length > 0 && (
              <div
                className="mt-6 pt-6 space-y-4"
                style={{
                  borderTop: `1px solid ${surBloc ? "rgba(28,36,51,0.15)" : "rgba(255,255,255,0.3)"}`,
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(0.98rem, 1.5vw, 1.08rem)",
                  lineHeight: 1.8,
                }}
              >
                {blocs.map((b) => (
                  <p key={b.slice(0, 24)}>{b}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {heroImage ? (
        <div
          className="absolute inset-x-0 top-0 h-screen"
          style={{ backgroundImage: `url('${heroImage}')`, backgroundSize: "cover", backgroundPosition: "center", filter: PHOTO_GRADE.filtre }}
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
          {/* Bricolage en petites capitales, comme les surtitres de pays des carnets (relecture du
              11/09/2026, était en police machine à écrire). Ombre portée : sur Londres, le surtitre
              tombait sur le Parlement et se lisait mal. */}
          <p
            className="mb-3 text-xs sm:text-sm uppercase tracking-[0.2em]"
            style={{ fontFamily: "var(--font-display)", textShadow: "0 1px 12px rgba(0,0,0,0.75)" }}
          >
            {eyebrow}
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
