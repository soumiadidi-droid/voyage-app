"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Check, Link2, X as CloseIcon } from "lucide-react";
import { InstagramGlyph, WhatsAppGlyph, PinterestGlyph, XGlyph, LinkedInGlyph } from "./BrandGlyphs";
import type { TravelFromParis } from "@/lib/travel-match/types";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-display"
      style={{
        display: "inline-block",
        borderRadius: 999,
        background: "var(--lve-terracotta-bg)",
        color: "var(--lve-terracotta-dark)",
        fontSize: 15,
        fontWeight: 600,
        padding: "8px 16px",
      }}
    >
      {children}
    </span>
  );
}

// Popover de partage (31/08/2026, carte Story reprise le même jour — "générer une image avec le
// look and feel de la destination avec tout" : la 1ère version se limitait à photo + titre). Copie
// de lien + 4 réseaux (ouverture d'intent en nouvel onglet) + export Story Instagram (carte cachée
// 1080×1920 exportée en PNG via html-to-image, même technique que InstaStudio.tsx). La carte reprend
// le vrai langage visuel du site : photo + gradient + badge Match (DestinationCard), titre serif +
// eyebrow (DestinationHero), pastilles logistique/saison (DestinationPracticalCard), signature
// (InstaStudio).
export function ShareModal({
  path,
  title,
  description,
  imageUrl,
  eyebrow,
  matchScore,
  travelFromParis,
  bestMonths,
  onClose,
}: {
  path: string;
  title: string;
  description?: string;
  imageUrl?: string;
  eyebrow?: string;
  matchScore?: number;
  travelFromParis?: TravelFromParis;
  bestMonths?: string[];
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);

  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  function openShareLink(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function handleInstagramStory() {
    if (!storyRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(storyRef.current, { pixelRatio: 2, cacheBust: true });
      const filenameSlug = path.split("?")[0].split("/").filter(Boolean).pop() || "voyage";
      const link = document.createElement("a");
      link.download = `lve-story-${filenameSlug}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  }

  const shareText = description ? `${title} — ${description}` : title;

  const rows: { key: string; icon: typeof WhatsAppGlyph; color: string; label: string; onClick: () => void }[] = [
    {
      key: "whatsapp",
      icon: WhatsAppGlyph,
      color: "#25D366",
      label: "WhatsApp",
      onClick: () => openShareLink(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`),
    },
    {
      key: "pinterest",
      icon: PinterestGlyph,
      color: "#E60023",
      label: "Pinterest",
      onClick: () =>
        openShareLink(
          `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(
            imageUrl ?? ""
          )}&description=${encodeURIComponent(title)}`
        ),
    },
    {
      key: "x",
      icon: XGlyph,
      color: "var(--lve-charcoal)",
      label: "X (Twitter)",
      onClick: () =>
        openShareLink(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`),
    },
    {
      key: "linkedin",
      icon: LinkedInGlyph,
      color: "#0A66C2",
      label: "LinkedIn",
      onClick: () => openShareLink(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`),
    },
  ];

  return (
    <div
      className="absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-2xl bg-white p-2 shadow-xl"
      style={{ border: "1px solid var(--lve-border)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-1 flex items-center justify-between px-2 py-1">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-secondary)" }}
        >
          Partager
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="cursor-pointer text-lve-charcoal/50 hover:text-lve-charcoal"
        >
          <CloseIcon size={14} />
        </button>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-colors hover:bg-lve-terracotta-bg cursor-pointer"
      >
        <span
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--lve-terracotta-bg)", color: "var(--lve-terracotta-dark)" }}
        >
          {copied ? <Check size={16} /> : <Link2 size={16} />}
        </span>
        {copied ? "Lien copié !" : "Copier le lien"}
      </button>

      {rows.map(({ key, icon: Icon, color, label, onClick }) => (
        <button
          key={key}
          type="button"
          onClick={onClick}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-colors hover:bg-lve-terracotta-bg cursor-pointer"
        >
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: `color-mix(in srgb, ${color} 15%, white)`, color }}
          >
            <Icon width={16} height={16} />
          </span>
          {label}
        </button>
      ))}

      {imageUrl && (
        <button
          type="button"
          onClick={handleInstagramStory}
          disabled={exporting}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-colors hover:bg-lve-terracotta-bg cursor-pointer disabled:opacity-50"
        >
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: "var(--lve-plum-bg)", color: "var(--lve-plum-dark)" }}
          >
            <InstagramGlyph width={16} height={16} />
          </span>
          {exporting ? "Génération..." : "Partager en Story Instagram"}
        </button>
      )}

      {/* Carte cachée 1080×1920 (rendue à 540×960 css, exportée à pixelRatio 2), hors-écran — même
          technique que InstaStudio.tsx (toPng + pixelRatio 2). Zone photo (haut, 660px) + bandeau
          ivoire (bas, 300px) — même découpe que la carte "carnet" d'InstaStudio, mais avec les
          vraies infos de la destination plutôt qu'une saisie manuelle. */}
      {imageUrl && (
        <div style={{ position: "fixed", top: 0, left: "-9999px", pointerEvents: "none" }} aria-hidden="true">
          <div
            ref={storyRef}
            style={{ width: 540, height: 960, position: "relative", overflow: "hidden", background: "var(--lve-ivory)" }}
          >
            {/* Zone photo */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 660,
                backgroundImage: `url('${imageUrl}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 24%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 220,
                  background: "linear-gradient(to bottom, transparent, var(--lve-ivory))",
                }}
              />

              {eyebrow && (
                <span
                  className="font-mono-lve"
                  style={{
                    position: "absolute",
                    left: 40,
                    top: 36,
                    color: "#fff",
                    fontSize: 15,
                    letterSpacing: "0.04em",
                    textShadow: "0 1px 8px rgba(0,0,0,0.5)",
                  }}
                >
                  {eyebrow}
                </span>
              )}

              {matchScore != null && (
                <span
                  className="font-display"
                  style={{
                    position: "absolute",
                    right: 40,
                    top: 32,
                    background: "var(--lve-terracotta)",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    borderRadius: 999,
                    padding: "8px 16px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                  }}
                >
                  ✨ {matchScore}% Match
                </span>
              )}

              <p
                className="font-title"
                style={{
                  position: "absolute",
                  left: 40,
                  right: 40,
                  bottom: 40,
                  color: "#fff",
                  fontSize: 56,
                  fontWeight: 700,
                  lineHeight: 1.02,
                  textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                }}
              >
                {title}
              </p>
            </div>

            {/* Bandeau ivoire */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 660,
                bottom: 0,
                padding: "26px 40px 34px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                {description && (
                  <p
                    className="font-body"
                    style={{
                      fontSize: 19,
                      fontStyle: "italic",
                      color: "var(--lve-charcoal)",
                      lineHeight: 1.4,
                      marginBottom: 16,
                    }}
                  >
                    {description}
                  </p>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {travelFromParis && (
                    <Pill>
                      {travelFromParis.mode} · {travelFromParis.duration}
                    </Pill>
                  )}
                  {bestMonths && bestMonths.length > 0 && <Pill>Idéal en {bestMonths.slice(0, 3).join(", ")}</Pill>}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  className="font-title"
                  style={{ fontSize: 22, letterSpacing: "0.2em", color: "var(--lve-terracotta-dark)", fontWeight: 500 }}
                >
                  LVE
                </span>
                <span className="font-signature" style={{ fontSize: 26, color: "var(--lve-terracotta)" }}>
                  @voyagedesemotions
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
