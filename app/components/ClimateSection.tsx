"use client";

import { useState } from "react";
import { Sun, CloudRain, Train, Plane, Flower, Leaf, Snowflake, type LucideIcon } from "lucide-react";
import type { Seasonality, TravelFromParis } from "@/lib/travel-match/types";

type SeasonKey = keyof Seasonality["weather_profile"];

const SEASON_META: Record<SeasonKey, { label: string; icon: LucideIcon }> = {
  spring: { label: "Printemps", icon: Flower },
  summer: { label: "Été", icon: Sun },
  autumn: { label: "Automne", icon: Leaf },
  winter: { label: "Hiver", icon: Snowflake },
};
const SEASON_ORDER: SeasonKey[] = ["spring", "summer", "autumn", "winter"];

// Mois → saison (hémisphère nord, cohérent avec toutes les destinations actuelles du catalogue) —
// sert uniquement à présélectionner un onglet pertinent à l'ouverture, purement cosmétique.
function currentSeason(): SeasonKey {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

// Bloc "Climat & Quand partir" (30/08/2026, demande Soumia) — trajet depuis Paris +
// météo/saisonnalité réelle, recherchées et vérifiées par Claude (pas le contenu narratif/vécu du
// reste du site). Rendu vide si aucune des deux données n'est renseignée pour la destination —
// même principe que les autres blocs optionnels (practical_info, regional_transport...).
export function ClimateSection({
  travelFromParis,
  seasonality,
}: {
  travelFromParis?: TravelFromParis;
  seasonality?: Seasonality;
}) {
  const [season, setSeason] = useState<SeasonKey>(currentSeason());

  if (!travelFromParis && !seasonality) return null;

  const TravelIcon = travelFromParis?.mode.toLowerCase().includes("vol") ? Plane : Train;
  const weather = seasonality?.weather_profile[season];

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 mb-8"
      style={{ background: "var(--lve-ivory)", border: "1px solid var(--lve-border)" }}
    >
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium tracking-widest uppercase mb-4"
        style={{ background: "var(--lve-terracotta-bg)", color: "var(--lve-terracotta-dark)" }}
      >
        <CloudRain size={12} />
        Climat & quand partir
      </span>

      {travelFromParis && (
        <div className="flex items-center gap-3 mb-5">
          <div
            className="p-2.5 rounded-xl shrink-0"
            style={{ background: "var(--lve-terracotta-bg)", color: "var(--lve-terracotta-dark)" }}
          >
            <TravelIcon size={18} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--lve-charcoal)" }}>
              {travelFromParis.mode} depuis Paris — {travelFromParis.duration}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {travelFromParis.details}
            </p>
          </div>
        </div>
      )}

      {seasonality && weather && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {SEASON_ORDER.map((key) => {
              const { label, icon: Icon } = SEASON_META[key];
              const active = key === season;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSeason(key)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
                  style={
                    active
                      ? { background: "var(--lve-terracotta)", color: "#fff" }
                      : { background: "#fff", color: "var(--text-secondary)", border: "1px solid var(--lve-border)" }
                  }
                >
                  <Icon size={13} />
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-baseline gap-3 mb-2">
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-title)", color: "var(--lve-charcoal)" }}
            >
              {weather.avg_temp}
            </span>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {SEASON_META[season].label.toLowerCase()}
            </span>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            {weather.tip}
          </p>

          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            <strong style={{ color: "var(--lve-charcoal)" }}>Meilleure période :</strong>{" "}
            {seasonality.best_months.join(", ")}
            {seasonality.peak_season.length > 0 && (
              <> · Haute saison : {seasonality.peak_season.join(", ")}</>
            )}
          </p>
        </>
      )}
    </div>
  );
}
