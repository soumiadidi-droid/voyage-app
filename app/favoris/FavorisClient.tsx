"use client";

import Link from "next/link";
import { LikeButton } from "../components/LikeButton";
import { useFavorites } from "@/lib/favorites";
import { DESTINATIONS } from "@/lib/travel-match/destinations";

export function FavorisClient() {
  const { favorites } = useFavorites();
  const liked = DESTINATIONS.filter((d) => favorites.includes(d.id));

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
      <p className="mono mb-2" style={{ color: "var(--text-secondary)" }}>
        Mes favoris
      </p>
      <h1
        className="font-extrabold mb-10"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)" }}
      >
        Les voyages que tu as sauvegardés
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
          {liked.map((destination) => (
            <div key={destination.id} className="border p-6" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <h2
                  className="font-semibold"
                  style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}
                >
                  {destination.title}
                </h2>
                <LikeButton id={destination.id} />
              </div>
              <p className="mb-3" style={{ color: "var(--text-secondary)" }}>{destination.summary}</p>
              <ul
                className="mono flex flex-wrap gap-x-2 gap-y-1 mb-3"
                style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}
              >
                {destination.tags.map((tag) => (
                  <li key={tag}>#{tag}</li>
                ))}
              </ul>
              <a
                href={`/voyages/${destination.content_slug}?id=${destination.id}`}
                className="mono"
                style={{ color: "var(--ember)" }}
              >
                Voir la fiche voyage →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
