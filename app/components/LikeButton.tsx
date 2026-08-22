"use client";

import { useFavorites } from "@/lib/favorites";

export function LikeButton({ id, size = "md" }: { id: string; size?: "sm" | "md" }) {
  const { isFavorite, toggle } = useFavorites();
  const liked = isFavorite(id);

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
      className="leading-none"
      style={{
        fontSize: size === "sm" ? "1.15rem" : "1.5rem",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {liked ? "❤️" : "🤍"}
    </button>
  );
}
