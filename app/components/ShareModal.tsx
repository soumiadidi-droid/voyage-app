"use client";

import { useState } from "react";
import { Check, Link2, X as CloseIcon } from "lucide-react";
import { InstagramGlyph, WhatsAppGlyph, PinterestGlyph, XGlyph, LinkedInGlyph } from "./BrandGlyphs";
import { ShareStoryModal } from "./ShareStoryModal";

// Popover de partage. Copie de lien + 4 réseaux (ouverture d'intent en nouvel onglet) + Story
// Instagram, déléguée à ShareStoryModal.tsx (1er septembre 2026, remplace l'export caché direct :
// aperçu visible + flux guidé en 3 étapes, capture via html2canvas).
export function ShareModal({
  path,
  title,
  description,
  imageUrl,
  matchScore,
  profile,
  onClose,
}: {
  path: string;
  title: string;
  description?: string;
  imageUrl?: string;
  matchScore?: number;
  profile?: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [storyModalOpen, setStoryModalOpen] = useState(false);

  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
  const filenameSlug = path.split("?")[0].split("/").filter(Boolean).pop() || "voyage";

  function openShareLink(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
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
          onClick={() => setStoryModalOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-colors hover:bg-lve-terracotta-bg cursor-pointer"
        >
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: "var(--lve-plum-bg)", color: "var(--lve-plum-dark)" }}
          >
            <InstagramGlyph width={16} height={16} />
          </span>
          Partager en Story Instagram
        </button>
      )}

      {imageUrl && (
        <ShareStoryModal
          isOpen={storyModalOpen}
          onClose={() => setStoryModalOpen(false)}
          imageUrl={imageUrl}
          profile={profile}
          matchScore={matchScore}
          shareUrl={url}
          filenameSlug={filenameSlug}
        />
      )}
    </div>
  );
}
