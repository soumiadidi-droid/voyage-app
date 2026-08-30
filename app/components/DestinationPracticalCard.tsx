"use client";

import { useState } from "react";
import { Compass, Sun, Train, Plane, Flower, Leaf, Snowflake, ExternalLink, Sparkles, type LucideIcon } from "lucide-react";
import type { Seasonality, TravelFromParis, RegionalTransport } from "@/lib/travel-match/types";

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

// Bloc unique "Logistique & Climat" (30/08/2026, demande Soumia — "nettoie l'en-tête, ne garder
// QUE le grand bloc central combiné"). Remplace ClimateSection.tsx (renommé/restructuré), les
// anciennes pilules météo/transport de PracticalInfoSection, ET le bloc séparé "Se déplacer sur
// place" (regional_transport, ex. Shinkansen au Japon — demande explicite de Soumia du 30/08/2026,
// "ajouter aussi les transports internes"), tous supprimés de app/voyages/[slug]/page.tsx dans le
// même geste. Rendu vide si aucun des trois n'est renseigné.
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

  return (
    // Même look que TripExtensionCard (30/08/2026, demande Soumia — "je le veux étendu comme
    // suggestions d'extension avec un bandeau de la même couleur sur la gauche") : dégradé
    // slate-bg → blanc → sand, coins très arrondis, barre d'accent latérale.
    <div
      className="relative overflow-hidden rounded-3xl p-6 md:p-8 mb-8"
      style={{
        background: "linear-gradient(135deg, var(--lve-slate-bg) 0%, #ffffff 55%, var(--lve-sand) 100%)",
        border: "1px solid color-mix(in srgb, var(--lve-slate-dark) 20%, transparent)",
      }}
    >
      <div
        className="absolute top-0 left-0 w-2 h-full rounded-l-3xl"
        style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--lve-slate-dark) 65%, white), var(--lve-slate-dark))" }}
      />

      <div className="relative pl-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium tracking-widest uppercase mb-4"
          style={{ background: "var(--lve-slate-bg)", color: "var(--lve-slate-dark)" }}
        >
          <Compass size={12} />
          Logistique & climat
        </span>

        {/* Section Transport */}
        {travelFromParis && (
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl shrink-0"
              style={{ background: "var(--lve-slate-bg)", color: "var(--lve-slate-dark)" }}
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
              {travelFromParis.booking_platform && (
                <p className="text-sm mt-1">
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
            </div>
          </div>

          {/* Bulle "Conseil d'initié" — jamais générée automatiquement, absente tant que Soumia
              n'a pas donné le vrai conseil vécu (voir insider_tip dans types.ts). */}
          {travelFromParis.insider_tip && (
            <div
              className="mt-3 flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm"
              style={{ background: "var(--lve-slate-bg)", color: "var(--lve-slate-dark)" }}
            >
              <Sparkles size={15} className="shrink-0 mt-0.5" />
              <span>
                <strong>Conseil d&apos;initié —</strong> {travelFromParis.insider_tip}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Section Transport sur place (30/08/2026, demande Soumia) — mobilité interne à la
          destination (ex. Shinkansen entre Tokyo/Osaka/Kyoto), distincte du trajet Depuis Paris
          ci-dessus. N'existe que pour les destinations multi-villes (Japon, Italie Nord). */}
      {regionalTransport && (
        <div
          className={travelFromParis ? "flex items-center gap-3 mb-5 pt-5" : "flex items-center gap-3 mb-5"}
          style={travelFromParis ? { borderTop: "1px solid var(--lve-border)" } : undefined}
        >
          <div
            className="p-2.5 rounded-xl shrink-0"
            style={{ background: "var(--lve-slate-bg)", color: "var(--lve-slate-dark)" }}
          >
            <Train size={18} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--lve-charcoal)" }}>
              Sur place — {regionalTransport.recommended_mode}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {regionalTransport.summary}
            </p>
            {regionalTransport.pass_or_tip && (
              <p className="text-sm italic mt-1" style={{ color: "var(--text-secondary)" }}>
                {regionalTransport.pass_or_tip}
              </p>
            )}
            {regionalTransport.to_city_center && (
              <p className="text-sm mt-1">
                <span className="font-medium" style={{ color: "var(--lve-slate-dark)" }}>
                  Rejoindre le centre-ville —{" "}
                </span>
                <span style={{ color: "var(--text-secondary)" }}>{regionalTransport.to_city_center}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Section Météo & Saisons */}
      {seasonality && weather && (
        <div
          className={travelFromParis || regionalTransport ? "pt-5" : undefined}
          style={travelFromParis || regionalTransport ? { borderTop: "1px solid var(--lve-border)" } : undefined}
        >
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
