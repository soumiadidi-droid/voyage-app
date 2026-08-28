"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LikeButton } from "../components/LikeButton";
import { useFavorites } from "@/lib/favorites";
import { resolveFavorites, type LikedItem } from "./actions";

export function FavorisClient() {
  const { favorites } = useFavorites();
  const [liked, setLiked] = useState<LikedItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    resolveFavorites(favorites).then((items) => {
      if (!cancelled) setLiked(items);
    });
    return () => {
      cancelled = true;
    };
  }, [favorites]);

  if (liked === null) {
    // Court instant pendant que la Server Action résout les favoris (localStorage → DB) — pas de
    // contenu à afficher tant qu'on ne sait pas ce qui est vraiment liké.
    return <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-24" />;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
      <h1
        className="font-extrabold mb-10"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)" }}
      >
        Mes Favoris
      </h1>

      {liked.length === 0 ? (
        <div className="text-center py-16">
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            Aucun voyage sauvegardé pour l&apos;instant. Lâche un match ! ✨
          </p>
          <Link
            href="/questionnaire"
            className="inline-block px-6 py-3 mono no-underline"
            style={{ background: "var(--ember)", color: "#fff" }}
          >
            Trouver mon voyage
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {liked.map((item) =>
            item.kind === "destination" ? (
              <div
                key={item.key}
                className="border p-6"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <h2
                    className="font-semibold"
                    style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}
                  >
                    {item.destination.title}
                  </h2>
                  <LikeButton id={item.key} />
                </div>
                <p className="mb-3" style={{ color: "var(--text-secondary)" }}>
                  {item.destination.summary}
                </p>
                <ul
                  className="mono flex flex-wrap gap-x-2 gap-y-1 mb-3"
                  style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}
                >
                  {item.destination.tags.map((tag) => (
                    <li key={tag}>#{tag}</li>
                  ))}
                </ul>
                <a
                  href={`/voyages/${item.destination.content_slug}?id=${item.destination.id}`}
                  className="mono"
                  style={{ color: "var(--ember)" }}
                >
                  Voir la fiche voyage →
                </a>
              </div>
            ) : (
              <div key={item.key} className="border p-6" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <h2
                    className="font-semibold"
                    style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}
                  >
                    {item.voyage.hero.title}
                  </h2>
                  <LikeButton id={item.key} />
                </div>
                <p className="mb-3" style={{ color: "var(--text-secondary)" }}>
                  {item.voyage.hero.tagline}
                </p>
                <a href={`/voyages/${item.voyage.slug}`} className="mono" style={{ color: "var(--ember)" }}>
                  Voir la fiche voyage →
                </a>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
