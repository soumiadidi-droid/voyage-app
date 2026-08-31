"use client";

import { useEffect, useRef, useState } from "react";
import { Share2 } from "lucide-react";
import { ShareModal } from "./ShareModal";

// Bouton de partage (31/08/2026) — même style "verre" que LikeButton (app/components/LikeButton.tsx),
// posé dans les mêmes coins qu'elle (DestinationCard, DestinationHero). Ouvre ShareModal en popover
// ancré juste en dessous, pas une modale plein écran (réservée à InstagramPopup).
export function ShareButton({
  path,
  title,
  description,
  imageUrl,
  matchScore,
  profile,
  size = "md",
}: {
  path: string;
  title: string;
  description?: string;
  imageUrl?: string;
  matchScore?: number;
  // Archétype réel de l'utilisateur (1er septembre 2026, carte Story "Profil : X") — seulement
  // disponible sur /resultat (getArchetypeTitle(answers)), absent sur la fiche voyage en accès
  // direct : la ligne "Profil" ne s'affiche simplement pas dans ce cas.
  profile?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iconSize = size === "sm" ? 16 : 20;

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Partager"
        aria-expanded={open}
        className="inline-flex items-center justify-center rounded-full border border-white/15 bg-black/30 p-2.5 text-white backdrop-blur-md transition-all hover:bg-black/50 cursor-pointer"
      >
        <Share2 size={iconSize} strokeWidth={1.75} />
      </button>
      {open && (
        <ShareModal
          path={path}
          title={title}
          description={description}
          imageUrl={imageUrl}
          matchScore={matchScore}
          profile={profile}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
