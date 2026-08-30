"use client";

import { useState } from "react";
import { Compass, Sun, Train, Plane, Bike, Car, Flower, Leaf, Snowflake, ExternalLink, Sparkles, type LucideIcon } from "lucide-react";
import type { Seasonality, TravelFromParis, RegionalTransport } from "@/lib/travel-match/types";

type SeasonKey = keyof Seasonality["weather_profile"];

const SEASON_META: Record<SeasonKey, { label: string; icon: LucideIcon }> = {
  spring: { label: "Printemps", icon: Flower },
  summer: { label: "Été", icon: Sun },
  autumn: { label: "Automne", icon: Leaf },
  winter: { label: "Hiver", icon: Snowflake },
};
const SEASON_ORDER: SeasonKey[] = ["spring", "summer", "autumn", "winter"];

// Icône du transport sur place (30/08/2026, demande Soumia — "mets-moi un vélo") : dynamique
// plutôt que figée sur Train, sinon fausse pour les destinations où le vélo ou la voiture dominent
// (ex. Côte Basque "Vélo à Biarritz...", Mykonos "Voiture obligatoire").
function regionalTransportIcon(mode: string): LucideIcon {
  const lower = mode.toLowerCase();
  if (lower.includes("vélo") || lower.includes("velo") || lower.includes("bike")) return Bike;
  if (lower.includes("voiture") || lower.includes("scooter")) return Car;
  return Train;
}

// Mois → saison (hémisphère nord, cohérent avec toutes les destinations actuelles du catalogue) —
// sert uniquement à présélectionner un onglet pertinent à l'ouverture, purement cosmétique.
function currentSeason(): SeasonKey {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

// Bloc unique "Logistique & Climat" (30/08/2026). Remplace ClimateSection.tsx, les anciennes
// pilules météo/transport de PracticalInfoSection, ET l'ancien bloc séparé "Se déplacer sur
// place" — tous fusionnés ici. Rendu vide si rien n'est renseigné.
//
// Aéré en 2 sous-cartes côte à côte (30/08/2026, demande Soumia — "éviter l'effet trop chargé") :
// spec transmise en ambre/orange générique, remplacée par les tokens réels du site (--lve-slate-*,
// la 5e couleur dédiée à ce bloc, cohérent avec le reste de la charte) plutôt qu'une couleur hors
// système.
export function DestinationPracticalCard({
  travelFromParis,
  seasonality,
  regionalTransport,
}: {
  travelFromParis?: TravelFromParis;
  seasonality?: Seasonality;
  regionalTransport?: RegionalTransport;
}) {
  const [season, setSeason] = useState<SeasonKey>(currentSeason());

  if (!travelFromParis && !seasonality && !regionalTransport) return null;

  const TravelIcon = travelFromParis?.mode.toLowerCase().includes("vol") ? Plane : Train;
  const weather = seasonality?.weather_profile[season];
  const hasTransportGrid = Boolean(travelFromParis || regionalTransport);

  const subcardStyle = {
    background: "rgba(255,255,255,0.8)",
    border: "1px solid color-mix(in srgb, var(--lve-slate-dark) 15%, transparent)",
  };

  return (
    // Même look que TripExtensionCard : dégradé slate-bg → blanc → sand, coins très arrondis,
    // barre d'accent latérale.
    <div
      className="relative overflow-hidden rounded-3xl p-6 md:p-8 mb-8"
      style={{
        background: "linear-gradient(135deg, var(--lve-slate-bg) 0%, #ffffff 55%, var(--lve-sand) 100%)",
        border: "1px solid color-mix(in srgb, var(--lve-slate-dark) 20%, transparent)",
      }}
    >
      <div
        className="absolute top-0 left-0 w-1.5 h-full rounded-l-full"
        style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--lve-slate-dark) 65%, white), var(--lve-slate-dark))" }}
      />

      <div className="relative pl-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium tracking-widest uppercase mb-4"
          style={{ background: "var(--lve-slate-bg)", color: "var(--lve-slate-dark)" }}
        >
          <Compass size={12} />
          Logistique & climat
        </span>

        {hasTransportGrid && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Sous-carte 1 : Trajet depuis Paris */}
            {travelFromParis && (
              <div className="rounded-2xl p-4 shadow-sm" style={subcardStyle}>
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-xl shrink-0"
                    style={{ background: "var(--lve-slate-bg)", color: "var(--lve-slate-dark)" }}
                  >
                    <TravelIcon size={16} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--lve-slate-dark)" }}>
                    Trajet depuis Paris
                  </p>
                </div>
                <p className="font-semibold mt-3" style={{ color: "var(--lve-charcoal)" }}>
                  {travelFromParis.mode} — {travelFromParis.duration}
                </p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {travelFromParis.details}
                </p>
                {travelFromParis.booking_platform && (
                  <p className="text-sm mt-1.5">
                    {travelFromParis.booking_url ? (
                      <a
                        href={travelFromParis.booking_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1 font-medium"
                        style={{ color: "var(--lve-slate-dark)" }}
                      >
                        {travelFromParis.booking_platform}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="font-medium" style={{ color: "var(--lve-slate-dark)" }}>
                        {travelFromParis.booking_platform}
                      </span>
                    )}
                    {travelFromParis.advance_booking_notice && (
                      <span style={{ color: "var(--text-secondary)" }}> · {travelFromParis.advance_booking_notice}</span>
                    )}
                  </p>
                )}

                {/* Bulle "Conseil d'initié" — jamais générée automatiquement, absente tant que
                    Soumia n'a pas donné le vrai conseil vécu (voir insider_tip dans types.ts). */}
                {travelFromParis.insider_tip && (
                  <div
                    className="mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-sm"
                    style={{ background: "var(--lve-slate-bg)", color: "var(--lve-slate-dark)" }}
                  >
                    <Sparkles size={14} className="shrink-0 mt-0.5" />
                    <span>
                      <strong>Conseil d&apos;initié —</strong> {travelFromParis.insider_tip}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Sous-carte 2 : Sur place & Mobilité */}
            {regionalTransport && (
              <div className="rounded-2xl p-4 shadow-sm" style={subcardStyle}>
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-xl shrink-0"
                    style={{ background: "var(--lve-slate-bg)", color: "var(--lve-slate-dark)" }}
                  >
                    {(() => {
                      const RegionalIcon = regionalTransportIcon(regionalTransport.recommended_mode);
                      return <RegionalIcon size={16} />;
                    })()}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--lve-slate-dark)" }}>
                    Sur place & mobilité
                  </p>
                </div>
                <p className="font-semibold mt-3" style={{ color: "var(--lve-charcoal)" }}>
                  {regionalTransport.recommended_mode}
                </p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {regionalTransport.summary}
                </p>
                {regionalTransport.pass_or_tip && (
                  <p className="text-sm italic mt-1" style={{ color: "var(--text-secondary)" }}>
                    {regionalTransport.pass_or_tip}
                  </p>
                )}
                {/* Badge discret (30/08/2026, demande Soumia) — remplace l'ancienne ligne pleine
                    largeur, moins de poids visuel pour une info secondaire. */}
                {regionalTransport.to_city_center && (
                  <span
                    className="inline-block text-xs px-2.5 py-1 rounded-lg mt-2"
                    style={{
                      color: "var(--lve-slate-dark)",
                      background: "var(--lve-slate-bg)",
                      border: "1px solid color-mix(in srgb, var(--lve-slate-dark) 15%, transparent)",
                    }}
                  >
                    Centre-ville : {regionalTransport.to_city_center}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Séparateur entre transport et météo */}
        {hasTransportGrid && seasonality && weather && (
          <div className="my-5" style={{ borderTop: "1px solid color-mix(in srgb, var(--lve-slate-dark) 12%, transparent)" }} />
        )}

        {/* Section Météo & Saisons */}
        {seasonality && weather && (
          <div>
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
                        ? { background: "var(--lve-slate-dark)", color: "#fff" }
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

            <p className="text-sm font-semibold" style={{ color: "var(--lve-charcoal)" }}>
              Meilleure période : {seasonality.best_months.join(", ")}
              {seasonality.peak_season.length > 0 && (
                <> • Haute saison : {seasonality.peak_season.join(", ")}</>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
