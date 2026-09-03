"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LikeButton } from "../components/LikeButton";
import { AddressDetailCard } from "../components/AddressDetailCard";
import { useFavorites, usePlaceFavorites } from "@/lib/favorites";
import { DESTINATION_HERO_IMAGE } from "@/lib/hero-images";
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

// Filtres pilules "Mes adresses enregistrées" (29/08/2026, demande Gemini transmise par Soumia) —
// adaptés aux 3 catégories RÉELLES du schéma (PlaceLikedItem.category : Hôtel/Resto/Activité, voir
// app/favoris/actions.ts). La demande d'origine listait une 4e catégorie "Cafés & Bars" qui
// n'existe pas dans les données (les cafés/bars sont rangés dans "Resto") — inventer un filtre qui
// ne matcherait jamais rien aurait été pire que de s'en tenir au schéma réel.
const PLACE_FILTERS = ["Tous", "Hôtel", "Resto", "Activité"] as const;
type PlaceFilter = (typeof PLACE_FILTERS)[number];
const PLACE_FILTER_LABEL: Record<PlaceFilter, string> = {
  Tous: "Tous",
  Hôtel: "Hôtels",
  Resto: "Restaurants",
  Activité: "Activités",
};

export function FavorisClient() {
  const { favorites } = useFavorites();
  const { favorites: placeFavorites } = usePlaceFavorites();
  const [liked, setLiked] = useState<LikedItem[] | null>(null);
  const [likedPlaces, setLikedPlaces] = useState<PlaceLikedItem[] | null>(null);
  const [placeFilter, setPlaceFilter] = useState<PlaceFilter>("Tous");

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
      {/* Serif éditoriale (29/08/2026, demande Gemini) : var(--font-title), cohérence avec les H1
          des fiches voyage et de Notre Philosophie. Noir pur → anthracite chaud (29/08/2026, 2e
          passe Gemini) : #2C2523 sur fond crème, moins dur que le noir. Graisse allégée
          (font-extrabold → font-normal) au même geste, jugée trop lourde sur fond clair. */}
      <h1
        className="font-normal mb-10"
        style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2rem, 5vw, 3rem)", color: "#2C2523" }}
      >
        Mes Favoris
      </h1>

      {isEmpty ? (
        <div className="text-center py-16">
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            Votre carnet de voyage est vide.
          </p>
          {/* Pointait vers /questionnaire jusqu'au 03/09/2026, faute de catalogue ouvert (celui
              du 22/08/2026 avait été supprimé). /carnets existe maintenant : depuis une page de
              favoris vide, envoyer vers la liste des carnets est plus direct qu'un questionnaire
              de neuf questions. */}
          <Link
            href="/carnets"
            className="inline-block rounded-lg px-6 py-3 mono no-underline"
            style={{ background: "var(--ember)", color: "#fff" }}
          >
            Découvrir mes carnets ↗
          </Link>
        </div>
      ) : (
        <>
          {liked.length > 0 && (
            <div>
              {/* Sous-titre ajouté (29/08/2026, demande Gemini) : fait écho à "Mes adresses
                  enregistrées" plus bas, même style que le H2 de cette section-là. Serif éditoriale
                  + anthracite chaud (29/08/2026, 2e passe Gemini, option A "unité visuelle") :
                  était sans-serif gras, harmonisé avec le H1. */}
              <h2
                className="font-normal mb-6"
                style={{ fontFamily: "var(--font-title)", fontSize: "1.8rem", color: "#2C2523" }}
              >
                Mes Carnets &amp; Voyages
              </h2>
              <div className="flex flex-col gap-5 mb-16">
              {liked.map((item) =>
                item.kind === "destination" ? (
                  // Carte horizontale avec photo de couverture en fond (28/08/2026).
                  // `destinations.hero_image` en base est un champ jamais tenu à jour (encore un
                  // "https://..." factice pour Montréal/New York, une vieille photo perso pour le
                  // reste) — la vraie photo de couverture, la même que sur la fiche voyage, vit
                  // dans DESTINATION_HERO_IMAGE (lib/hero-images.ts) depuis le 28/08/2026. Repéré
                  // par Soumia : l'image manquait carrément sur la carte Montréal des favoris.
                  //
                  // Overlay retiré (29/08/2026, "je veux que le texte soit direct sur l'image") :
                  // le dégradé montait jusqu'à 75% de noir en bas, jamais retouché pendant tout le
                  // reste du ménage "voile noir" fait sur l'accueil/les fiches voyage — repéré par
                  // Soumia ("j'en ai ras le bol de demander la même chose"). Lisibilité assurée par
                  // text-shadow sur le texte, plus par l'assombrissement de la photo.
                  <div
                    key={item.key}
                    className="relative flex min-h-[220px] items-end overflow-hidden rounded-2xl bg-cover bg-center p-6 sm:p-8"
                    style={{
                      backgroundImage: `url('${DESTINATION_HERO_IMAGE[item.destination.content_slug] ?? item.destination.hero_image}')`,
                    }}
                  >
                    <div className="absolute right-4 top-4 z-10">
                      <LikeButton id={item.key} />
                    </div>
                    <div className="relative z-10 w-full">
                      <h2
                        className="font-extrabold mb-2 text-white"
                        style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.6)" }}
                      >
                        {item.destination.title}
                      </h2>
                      <p className="mb-3" style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 2px 14px rgba(0,0,0,0.6)" }}>
                        {item.destination.summary}
                      </p>
                      <div className="mono flex flex-wrap gap-2 mb-4" style={{ fontSize: "0.8rem" }}>
                        {item.destination.filters.transport.map((t) => (
                          <span
                            key={t}
                            className="rounded-full px-3 py-1"
                            style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
                          >
                            {TRANSPORT_BADGE[t]}
                          </span>
                        ))}
                        {item.destination.regional_transport && (
                          <span
                            className="rounded-full px-3 py-1"
                            style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
                          >
                            🚆 {item.destination.regional_transport.recommended_mode}
                          </span>
                        )}
                      </div>
                      <a
                        href={`/voyages/${item.destination.content_slug}?id=${item.destination.id}`}
                        className="mono"
                        style={{ color: "#fff", textDecoration: "underline", textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
                      >
                        Voir la fiche voyage →
                      </a>
                    </div>
                  </div>
                ) : (
                  <div
                    key={item.key}
                    className="relative flex min-h-[220px] items-end overflow-hidden rounded-2xl bg-cover bg-center p-6 sm:p-8"
                    style={{
                      backgroundImage: `url('${DESTINATION_HERO_IMAGE[item.voyage.slug] ?? item.voyage.hero.image}')`,
                    }}
                  >
                    <div className="absolute right-4 top-4 z-10">
                      <LikeButton id={item.key} />
                    </div>
                    <div className="relative z-10 w-full">
                      <h2
                        className="font-extrabold mb-2 text-white"
                        style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.6)" }}
                      >
                        {item.voyage.hero.title}
                      </h2>
                      <p className="mb-4" style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 2px 14px rgba(0,0,0,0.6)" }}>
                        {item.voyage.hero.tagline}
                      </p>
                      <a
                        href={`/voyages/${item.voyage.slug}`}
                        className="mono"
                        style={{ color: "#fff", textDecoration: "underline", textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
                      >
                        Voir la fiche voyage →
                      </a>
                    </div>
                  </div>
                )
              )}
              </div>
            </div>
          )}

          {likedPlaces.length > 0 && (
            <div>
              {/* Serif éditoriale + anthracite chaud (29/08/2026, 2e passe Gemini) : même
                  harmonisation que "Mes Carnets & Voyages" juste au-dessus. */}
              <h2
                className="font-normal mb-6"
                style={{ fontFamily: "var(--font-title)", fontSize: "1.8rem", color: "#2C2523" }}
              >
                Mes adresses enregistrées
              </h2>
              {/* Filtres pilules (29/08/2026, demande Gemini) — purement client, ne re-résout
                  rien côté serveur, juste un .filter() sur ce qui est déjà chargé. */}
              <div className="flex flex-wrap gap-2 mb-6">
                {PLACE_FILTERS.map((f) => {
                  const active = placeFilter === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setPlaceFilter(f)}
                      className="rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
                      style={{
                        fontFamily: "var(--font-display)",
                        background: active ? "var(--lve-terracotta)" : "var(--lve-terracotta-bg)",
                        color: active ? "#fff" : "var(--lve-terracotta-dark)",
                      }}
                    >
                      {PLACE_FILTER_LABEL[f]}
                    </button>
                  );
                })}
              </div>
              {/* Réutilise AddressDetailCard tel quel (28/08/2026) — même carte que sur les
                  fiches voyage, badge/nom/description/tags/bouton Instagram/lien inclus, le
                  cœur de retrait est déjà intégré au composant. */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {likedPlaces
                  .filter((item) => placeFilter === "Tous" || item.category === placeFilter)
                  .map((item) => (
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
