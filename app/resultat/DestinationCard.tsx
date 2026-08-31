import { TriangleAlert } from "lucide-react";
import { LikeButton } from "../components/LikeButton";
import { ShareButton } from "../components/ShareButton";
import { DESTINATION_HERO_IMAGE } from "@/lib/hero-images";
import type { ScoredDestination } from "@/lib/travel-match/engine";

// Refonte visuelle (27/08/2026) : cartes à plat → cartes blanches avec hiérarchie (titre serif,
// score en pastille terracotta, tags en pills, alerte d'incompatibilité en encadré ambré au lieu
// d'une ligne monospace qui détonnait avec le reste du site).
//
// Photo de couverture + badge Match (29/08/2026, demande Gemini — "ajoute OBLIGATOIREMENT une
// photo immersive") : même source que la fiche voyage et Favoris (DESTINATION_HERO_IMAGE), pour
// ne jamais afficher une photo différente d'un endroit à l'autre du site.
export function DestinationCard({
  destination,
  score,
  brokenFilters,
  hasComboOpportunity,
  href,
}: ScoredDestination & { href: string }) {
  const heroImage = DESTINATION_HERO_IMAGE[destination.content_slug];

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
      {heroImage && (
        <div className="relative h-48 sm:h-56">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: `url('${heroImage}')`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          {/* Pas d'assombrissement de la photo (29/08/2026, "je veux que le texte soit direct sur
              l'image") : lisibilité du titre via text-shadow, badge/cœur ont leur propre fond
              plein — aucun voile sur la photo. */}
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <ShareButton
              path={href}
              title={destination.title}
              description={destination.summary}
              imageUrl={heroImage}
              eyebrow={destination.tags.slice(0, 2).join(" · ")}
              matchScore={score}
              travelFromParis={destination.travel_from_paris}
              bestMonths={destination.seasonality?.best_months}
              size="sm"
            />
            <LikeButton id={destination.id} size="sm" />
          </div>
          {/* Titre remonté sur la photo (29/08/2026, repéré par Soumia en testant Porto — le nom
              de la destination vivait dans la zone blanche en dessous, pas "sur l'image" comme sur
              les cartes Favoris/la fiche voyage). Badge Match juste au-dessus, même coin. */}
          <div className="absolute bottom-4 left-4 right-4">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-white shadow-md mb-2"
              style={{ background: "var(--lve-terracotta)", fontFamily: "var(--font-display)" }}
            >
              ✨ {score}% Match
            </span>
            <h2
              className="font-semibold text-white"
              style={{
                fontFamily: "var(--font-title)",
                fontSize: "1.8rem",
                textShadow: "0 2px 16px rgba(0,0,0,0.6)",
              }}
            >
              {destination.title}
            </h2>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Sans photo (rare, tant que DESTINATION_HERO_IMAGE n'a pas d'entrée pour cette
            destination) : titre + badge + favori repassent ici, repli identique à l'ancien
            comportement plutôt que de les faire disparaître. */}
        {!heroImage && (
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2
              className="font-semibold"
              style={{ fontFamily: "var(--font-title)", fontSize: "1.6rem" }}
            >
              {destination.title}
            </h2>
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ background: "var(--lve-terracotta)", fontFamily: "var(--font-display)" }}
              >
                ✨ {score}% Match
              </span>
              <ShareButton
                path={href}
                title={destination.title}
                description={destination.summary}
                eyebrow={destination.tags.slice(0, 2).join(" · ")}
                matchScore={score}
                travelFromParis={destination.travel_from_paris}
                bestMonths={destination.seasonality?.best_months}
                size="sm"
              />
              <LikeButton id={destination.id} size="sm" />
            </div>
          </div>
        )}

        <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
          {destination.summary}
        </p>

      {hasComboOpportunity && (
        <p
          className="mono mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
          style={{ background: "var(--bg-guide)", color: "var(--aurora)" }}
        >
          🔀 Combo possible — cette destination propose une extension
        </p>
      )}

      <ul className="mb-4 flex flex-wrap gap-2">
        {destination.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full px-3 py-1 text-xs"
            style={{ background: "var(--bg-guide)", color: "var(--text-secondary)" }}
          >
            {tag}
          </li>
        ))}
      </ul>

      {brokenFilters.length > 0 && (
        <div
          className="mb-4 flex items-start gap-2 rounded-lg p-3 text-sm"
          style={{ background: "var(--lve-warning-bg)", color: "var(--lve-warning-text)" }}
        >
          <TriangleAlert size={16} className="mt-0.5 shrink-0" />
          <ul className="flex flex-col gap-0.5">
            {brokenFilters.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>
      )}

      <a
        href={href}
        className="mono group inline-flex items-center gap-1.5"
        style={{ color: "var(--lve-terracotta-dark)" }}
      >
        Voir la fiche voyage
        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
      </a>
      </div>
    </div>
  );
}
