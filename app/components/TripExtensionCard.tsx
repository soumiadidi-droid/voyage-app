import { ArrowRight, Train, Clock } from "lucide-react";
import type { Destination, SuggestedCombo } from "@/lib/travel-match/types";

// Carte "Extensions possibles" sur la fiche voyage (30/08/2026) — reprend un composant généré par
// Figma Make transmis par Soumia (carte dégradée, barre d'accent latérale, badge vibe_type, bloc
// infos pratiques avec icônes, lien de sortie animé). Palette Tailwind générique (amber/orange/
// slate) remplacée par les tokens réels du site. Contrairement au reference (contenu Japon en dur,
// lien `href="#"`), ce composant est piloté par les vraies données du combo — un seul jeu de props
// par carte, réutilisé pour chaque combo éligible dans app/voyages/[slug]/page.tsx.
//
// Le reference n'affichait qu'un seul bloc info (transport + durée) : `practical_tip` et
// `partner_link` (utilisés par le combo Montréal↔New York) n'existaient pas dans son exemple —
// conservés ici pour ne pas perdre de fonctionnalité déjà en prod.
//
// Repassé sur la 4e famille de couleur "plum" (30/08/2026, demande Soumia — "l'extension possible
// peut être une quatrième couleur de la charte") : les 3 familles existantes (terracotta/sage/
// ocean) étaient déjà prises par les catégories d'adresse, celle-ci distingue visuellement les
// extensions du reste de la fiche.
export function TripExtensionCard({
  combo,
  otherDestination,
}: {
  combo: SuggestedCombo;
  otherDestination: Destination;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-3xl p-6 md:p-8 shadow-md hover:shadow-xl transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, var(--lve-plum-bg) 0%, #ffffff 55%, var(--lve-sand) 100%)",
        border: "1px solid color-mix(in srgb, var(--lve-plum-dark) 20%, transparent)",
      }}
    >
      {/* Barre d'accent latérale, reprise telle quelle du reference */}
      <div
        className="absolute top-0 left-0 w-2 h-full rounded-l-3xl"
        style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--lve-plum-dark) 65%, white), var(--lve-plum-dark))" }}
      />

      <div className="pl-2 space-y-5">
        <div>
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3"
            style={{ color: "var(--lve-plum-dark)", background: "var(--lve-plum-bg)" }}
          >
            {combo.vibe_type}
          </span>
          <h3
            className="text-xl md:text-2xl font-bold leading-snug"
            style={{ fontFamily: "var(--font-title)", color: "var(--lve-charcoal)" }}
          >
            {combo.title}
          </h3>
        </div>

        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {combo.description}
        </p>

        <div
          className="rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs md:text-sm"
          style={{
            background: "rgba(255,255,255,0.8)",
            border: "1px solid color-mix(in srgb, var(--lve-plum-dark) 15%, transparent)",
            color: "var(--lve-charcoal)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl"
              style={{ background: "var(--lve-plum-bg)", color: "var(--lve-plum-dark)" }}
            >
              <Train size={16} />
            </div>
            <div>
              <span className="font-semibold block" style={{ color: "var(--lve-charcoal)" }}>
                {combo.transition_logistics.transport_mode}
              </span>
            </div>
          </div>

          <div
            className="flex items-center gap-2 md:border-l pt-2 md:pt-0 border-t md:border-t-0"
            style={{ borderColor: "var(--lve-border)" }}
          >
            <Clock size={16} style={{ color: "var(--lve-plum-dark)" }} />
            <span className="font-medium">{combo.transition_logistics.recommended_days}</span>
          </div>
        </div>

        {combo.transition_logistics.practical_tip && (
          <p className="text-sm italic" style={{ color: "var(--text-secondary)" }}>
            {combo.transition_logistics.practical_tip}
          </p>
        )}
        {combo.transition_logistics.partner_link && (
          <a
            href={combo.transition_logistics.partner_link}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-block text-sm font-semibold"
            style={{ color: "var(--ember)" }}
          >
            {combo.transition_logistics.partner_link_label || "Voir l'offre →"}
          </a>
        )}

        <div className="pt-2">
          <a
            href={`/voyages/${otherDestination.content_slug}?id=${otherDestination.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors group/link"
            style={{ color: "var(--lve-plum-dark)" }}
          >
            <span>Découvrir {otherDestination.title}</span>
            <ArrowRight size={16} className="transition-transform group-hover/link:translate-x-1" />
          </a>
        </div>
      </div>
    </div>
  );
}
