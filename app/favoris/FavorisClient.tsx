"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LikeButton } from "../components/LikeButton";
import { AddressDetailCard } from "../components/AddressDetailCard";
import { useFavorites, usePlaceFavorites } from "@/lib/favorites";
import type { TransportFilter } from "@/lib/travel-match/types";
import { resolveFavorites, resolvePlaceFavorites, type LikedItem, type PlaceLikedItem } from "./actions";

// Pills d'infos pratiques (28/08/2026, remplace les hashtags bruts) — construites uniquement à
// partir de champs réels et jamais inventées : `filters.transport` est toujours renseigné (champ
// de matching obligatoire), `regional_transport.recommended_mode` est du texte déjà rédigé par
// Soumia quand il existe, sinon simplement absent de la carte plutôt que remplacé par un badge
// générique inventé.
const TRANSPORT_BADGE: Record<TransportFilter, string> = {
  sans_voiture: "🚶 Sans voiture",
  transports_possibles: "🚌 Transports possibles",
  voiture_necessaire: "🚗 Voiture nécessaire",
};

export function FavorisClient() {
  const { favorites } = useFavorites();
  const { favorites: placeFavorites } = usePlaceFavorites();
  const [liked, setLiked] = useState<LikedItem[] | null>(null);
  const [likedPlaces, setLikedPlaces] = useState<PlaceLikedItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    resolveFavorites(favorites).then((items) => {
      if (!cancelled) setLiked(items);
    });
    return () => {
      cancelled = true;
    };
  }, [favorites]);

  useEffect(() => {
    let cancelled = false;
    resolvePlaceFavorites(placeFavorites).then((items) => {
      if (!cancelled) setLikedPlaces(items);
    });
    return () => {
      cancelled = true;
    };
  }, [placeFavorites]);

  if (liked === null || likedPlaces === null) {
    // Court instant pendant que la Server Action résout les favoris (localStorage → DB) — pas de
    // contenu à afficher tant qu'on ne sait pas ce qui est vraiment liké.
    return <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24" />;
  }

  const isEmpty = liked.length === 0 && likedPlaces.length === 0;

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
      <h1
        className="font-extrabold mb-10"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)" }}
      >
        Mes Favoris
      </h1>

      {isEmpty ? (
        <div className="text-center py-16">
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            Votre carnet de voyage est vide.
          </p>
          {/* /questionnaire reste la seule porte d'entrée vers les destinations (le catalogue
              ouvert /voyages a été volontairement supprimé le 22/08/2026) — le libellé change,
              pas la destination du lien. */}
          <Link
            href="/questionnaire"
            className="inline-block px-6 py-3 mono no-underline"
            style={{ background: "var(--ember)", color: "#fff" }}
          >
            Découvrir nos destinations ↗
          </Link>
        </div>
      ) : (
        <>
          {liked.length > 0 && (
            <div className="flex flex-col gap-5 mb-16">
              {liked.map((item) =>
                item.kind === "destination" ? (
                  // Carte horizontale avec photo de couverture en fond (28/08/2026) — overlay
                  // sombre pour garder le texte blanc lisible peu importe la photo.
                  <div
                    key={item.key}
                    className="relative flex min-h-[220px] items-end overflow-hidden rounded-2xl bg-cover bg-center p-6 sm:p-8"
                    style={{ backgroundImage: `url('${item.destination.hero_image}')` }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%)",
                      }}
                    />
                    <div className="absolute right-4 top-4 z-10">
                      <LikeButton id={item.key} />
                    </div>
                    <div className="relative z-10 w-full">
                      <h2
                        className="font-extrabold mb-2 text-white"
                        style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem" }}
                      >
                        {item.destination.title}
                      </h2>
                      <p className="mb-3" style={{ color: "rgba(255,255,255,0.85)" }}>
                        {item.destination.summary}
                      </p>
                      <div className="mono flex flex-wrap gap-2 mb-4" style={{ fontSize: "0.8rem" }}>
                        {item.destination.filters.transport.map((t) => (
                          <span
                            key={t}
                            className="rounded-full px-3 py-1"
                            style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
                          >
                            {TRANSPORT_BADGE[t]}
                          </span>
                        ))}
                        {item.destination.regional_transport && (
                          <span
                            className="rounded-full px-3 py-1"
                            style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
                          >
                            🚆 {item.destination.regional_transport.recommended_mode}
                          </span>
                        )}
                      </div>
                      <a
                        href={`/voyages/${item.destination.content_slug}?id=${item.destination.id}`}
                        className="mono"
                        style={{ color: "#fff", textDecoration: "underline" }}
                      >
                        Voir la fiche voyage →
                      </a>
                    </div>
                  </div>
                ) : (
                  <div
                    key={item.key}
                    className="relative flex min-h-[220px] items-end overflow-hidden rounded-2xl bg-cover bg-center p-6 sm:p-8"
                    style={{ backgroundImage: `url('${item.voyage.hero.image}')` }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%)",
                      }}
                    />
                    <div className="absolute right-4 top-4 z-10">
                      <LikeButton id={item.key} />
                    </div>
                    <div className="relative z-10 w-full">
                      <h2
                        className="font-extrabold mb-2 text-white"
                        style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem" }}
                      >
                        {item.voyage.hero.title}
                      </h2>
                      <p className="mb-4" style={{ color: "rgba(255,255,255,0.85)" }}>
                        {item.voyage.hero.tagline}
                      </p>
                      <a
                        href={`/voyages/${item.voyage.slug}`}
                        className="mono"
                        style={{ color: "#fff", textDecoration: "underline" }}
                      >
                        Voir la fiche voyage →
                      </a>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {likedPlaces.length > 0 && (
            <div>
              <h2
                className="font-semibold mb-6"
                style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem" }}
              >
                Mes adresses enregistrées
              </h2>
              {/* Réutilise AddressDetailCard tel quel (28/08/2026) — même carte que sur les
                  fiches voyage, badge/nom/description/tags/bouton Instagram/lien inclus, le
                  cœur de retrait est déjà intégré au composant. */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {likedPlaces.map((item) => (
                  <AddressDetailCard key={item.key} card={item.card} category={item.category} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
