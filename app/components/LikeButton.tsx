"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites";

// Badge rond effet verre (décidé le 23/08/2026, remplace l'ancien émoji ❤️/🤍) — icône filaire au
// repos, remplie blanche une fois liké.
export function LikeButton({ id, size = "md" }: { id: string; size?: "sm" | "md" }) {
  const { isFavorite, toggle } = useFavorites();
  const liked = isFavorite(id);
  const iconSize = size === "sm" ? 16 : 20;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={liked}
      className="inline-flex items-center justify-center rounded-full border border-white/15 bg-black/30 p-2.5 text-white backdrop-blur-md transition-all hover:bg-black/50 cursor-pointer"
    >
      <Heart
        size={iconSize}
        className={liked ? "fill-white stroke-white" : "fill-transparent stroke-white"}
        strokeWidth={1.75}
      />
    </button>
  );
}
