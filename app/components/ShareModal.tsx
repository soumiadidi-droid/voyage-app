"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Check, Link2, X as CloseIcon } from "lucide-react";
import { InstagramGlyph, WhatsAppGlyph, PinterestGlyph, XGlyph, LinkedInGlyph } from "./BrandGlyphs";

// Popover de partage (31/08/2026) — rendu par ShareButton.tsx. Copie de lien + 4 réseaux (ouverture
// d'intent en nouvel onglet) + export Story Instagram (carte cachée 1080×1920 exportée en PNG via
// html-to-image, même technique que InstaStudio.tsx).
export function ShareModal({
  path,
  title,
  description,
  imageUrl,
  onClose,
}: {
  path: string;
  title: string;
  description?: string;
  imageUrl?: string;
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
          technique que InstaStudio.tsx (toPng + pixelRatio 2). */}
      {imageUrl && (
        <div style={{ position: "fixed", top: 0, left: "-9999px", pointerEvents: "none" }} aria-hidden="true">
          <div
            ref={storyRef}
            style={{
              width: 540,
              height: 960,
              position: "relative",
              overflow: "hidden",
              backgroundImage: `url('${imageUrl}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 45%, transparent 70%)",
              }}
            />
            <div style={{ position: "absolute", left: 40, right: 40, bottom: 56, color: "#fff" }}>
              <p className="font-title" style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.05, marginBottom: 14 }}>
                {title}
              </p>
              {description && (
                <p
                  className="font-body"
                  style={{ fontSize: 20, fontStyle: "italic", opacity: 0.95, marginBottom: 24 }}
                >
                  {description}
                </p>
              )}
              <p className="font-signature" style={{ fontSize: 30, color: "var(--lve-sand)" }}>
                @voyagedesemotions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
