import { TriangleAlert } from "lucide-react";
import { LikeButton } from "../components/LikeButton";
import type { ScoredDestination } from "@/lib/travel-match/engine";

// Refonte visuelle (27/08/2026) : cartes à plat → cartes blanches avec hiérarchie (titre serif,
// score en pastille terracotta, tags en pills, alerte d'incompatibilité en encadré ambré au lieu
// d'une ligne monospace qui détonnait avec le reste du site).
export function DestinationCard({
  destination,
  score,
  brokenFilters,
  hasComboOpportunity,
  href,
}: ScoredDestination & { href: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2
          className="font-semibold"
          style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}
        >
          {destination.title}
        </h2>
        <div className="flex items-center gap-3">
          <span
            className="mono rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "var(--lve-terracotta-bg)", color: "var(--lve-terracotta-dark)" }}
          >
            {score}%
          </span>
          <LikeButton id={destination.id} size="sm" />
        </div>
      </div>

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
  );
}
