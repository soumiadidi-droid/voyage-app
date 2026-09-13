"use client";

import { useEffect, useState } from "react";
import { PromesseTravelMatch } from "@/app/components/PromesseTravelMatch";
import Link from "next/link";
import { Bus, Car, Footprints, Heart, TrainFront, type LucideIcon } from "lucide-react";
import { EnTetePage } from "../components/EnTetePage";
import { LikeButton } from "../components/LikeButton";
import { AddressDetailCard } from "../components/AddressDetailCard";
import { useFavorites, usePlaceFavorites } from "@/lib/favorites";
import { DESTINATION_HERO_IMAGE } from "@/lib/hero-images";
import type { TransportFilter } from "@/lib/travel-match/types";
import { resolveFavorites, resolvePlaceFavorites, type LikedItem, type PlaceLikedItem } from "./actions";

// Même habillage que /pros, /philosophie et /sans-filtre (13/09/2026, demande de Soumia :
// "retravaille la page mes favoris") : en-tête commun EnTetePage, surtitre + titre par section, cartes de destination en grille avec dégradé bas (règle de la relecture du 11/09), plus
// d'emojis (icônes Lucide en trait fin, comme le questionnaire), état vide en carte terracotta clair.

// Pastilles d'infos pratiques (28/08/2026) — construites uniquement à partir de champs réels :
// `filters.transport` est toujours renseigné, `regional_transport.recommended_mode` est du texte
// rédigé par Soumia quand il existe, sinon simplement absent.
const TRANSPORT_BADGE: Record<TransportFilter, { label: string; icon: LucideIcon }> = {
  sans_voiture: { label: "Sans voiture", icon: Footprints },
  transports_possibles: { label: "Transports possibles", icon: Bus },
  voiture_necessaire: { label: "Voiture nécessaire", icon: Car },
};

// Filtres des adresses (29/08/2026) — les 3 catégories RÉELLES du schéma (PlaceLikedItem.category).
const PLACE_FILTERS = ["Tous", "Hôtel", "Resto", "Activité"] as const;
type PlaceFilter = (typeof PLACE_FILTERS)[number];
const PLACE_FILTER_LABEL: Record<PlaceFilter, string> = {
  Tous: "Tous",
  Hôtel: "Hôtels",
  Resto: "Restaurants",
  Activité: "Activités",
};

function pluriel(n: number, mot: string) {
  return `${n} ${mot}${n > 1 ? "s" : ""}`;
}

function Surtitre({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-xs uppercase tracking-[0.25em] text-lve-terracotta-ink font-semibold mb-2"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {children}
    </span>
  );
}

function TitreSection({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-6 leading-tight text-lve-charcoal"
      style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2rem, 4.5vw, 2.8rem)" }}
    >
      {children}
    </h2>
  );
}

// Carte de destination — une seule forme pour les deux sortes de favoris (destination du Travel
// Match, ou ancienne clé de fiche). Photo dans un calque à part (11/09/2026) pour que le filtre ne
// touche pas le texte ; dégradé limité au bas de la photo pour la lisibilité.
function CarteVoyage({
  cle,
  image,
  titre,
  texte,
  href,
  pastilles = [],
}: {
  cle: string;
  image: string;
  titre: string;
  texte: string;
  href: string;
  pastilles?: { label: string; icon: LucideIcon }[];
}) {
  return (
    <div className="group relative flex min-h-[300px] sm:min-h-[340px] items-end overflow-hidden rounded-2xl shadow-sm">
      <div
        className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]"
        style={{ backgroundImage: `url('${image}')`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/0" />
      <div className="absolute right-4 top-4 z-10">
        <LikeButton id={cle} />
      </div>
      <div className="relative z-10 w-full p-6 sm:p-7">
        <h3
          className="mb-2 leading-tight text-white"
          style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.7rem, 3vw, 2.1rem)", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
        >
          {titre}
        </h3>
        <p className="mb-4 text-white/90 leading-relaxed text-[15px] line-clamp-3">{texte}</p>
        {pastilles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {pastilles.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-white bg-white/15 backdrop-blur-sm border border-white/25"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <Icon size={13} strokeWidth={1.75} />
                {label}
              </span>
            ))}
          </div>
        )}
        <a href={href} className="btn-principal px-5 py-2.5 text-xs">
          Voir le carnet
        </a>
      </div>
    </div>
  );
}

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

  const charge = liked !== null && likedPlaces !== null;
  const isEmpty = charge && liked.length === 0 && likedPlaces.length === 0;
  const adressesFiltrees = (likedPlaces ?? []).filter((item) => placeFilter === "Tous" || item.category === placeFilter);

  return (
    // Fond et encre claires fixes, comme /pros et /philosophie.
    <div className="surface-claire bg-lve-bg min-h-[70vh]">
      <EnTetePage
        pastille="Mon carnet de voyage"
        titre="Mes favoris"
        citation="Tout ce que tu as mis de côté, au même endroit."
        largeur="5xl"
      />

      {!charge ? (
        // Court instant pendant que la Server Action résout les favoris — rien à afficher tant qu'on
        // ne sait pas ce qui est vraiment liké.
        <div className="py-16" />
      ) : isEmpty ? (
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
          <div className="rounded-2xl bg-lve-terracotta-bg border border-lve-terracotta/20 p-8 sm:p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-lve-terracotta text-white flex items-center justify-center mb-5 mx-auto">
              <Heart size={20} strokeWidth={1.75} />
            </div>
            <h2
              className="mb-3 leading-tight text-lve-charcoal"
              style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.8rem, 4vw, 2.3rem)" }}
            >
              Ton carnet de voyage est vide.
            </h2>
            <p className="mb-7 text-lve-charcoal/75">
              Touche le cœur d&apos;une destination ou d&apos;une adresse pour la retrouver ici.
            </p>
            {/* Vers /questionnaire et jamais /carnets (page réservée au démarchage, 03/09/2026). */}
            <Link href="/questionnaire" className="btn-principal px-6 py-3.5">
              Découvrir mes destinations
            </Link>
            <PromesseTravelMatch className="mt-4 justify-center" />
          </div>
        </div>
      ) : (
        <>
          {liked.length > 0 && (
            <section className="max-w-5xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
              <Surtitre>{pluriel(liked.length, "carnet")}</Surtitre>
              <TitreSection>Mes carnets &amp; voyages</TitreSection>
              <div className="grid gap-5 sm:grid-cols-2">
                {liked.map((item) =>
                  item.kind === "destination" ? (
                    <CarteVoyage
                      key={item.key}
                      cle={item.key}
                      image={DESTINATION_HERO_IMAGE[item.destination.content_slug] ?? item.destination.hero_image}
                      titre={item.destination.title}
                      texte={item.destination.summary}
                      href={`/voyages/${item.destination.content_slug}?id=${item.destination.id}`}
                      pastilles={[
                        ...item.destination.filters.transport.map((t) => TRANSPORT_BADGE[t]),
                        ...(item.destination.regional_transport
                          ? [{ label: item.destination.regional_transport.recommended_mode, icon: TrainFront }]
                          : []),
                      ]}
                    />
                  ) : (
                    <CarteVoyage
                      key={item.key}
                      cle={item.key}
                      image={DESTINATION_HERO_IMAGE[item.voyage.slug] ?? item.voyage.hero.image}
                      titre={item.voyage.hero.title}
                      texte={item.voyage.hero.tagline}
                      href={`/voyages/${item.voyage.slug}`}
                    />
                  )
                )}
              </div>
            </section>
          )}

          {likedPlaces.length > 0 && (
            <section className={`max-w-5xl mx-auto px-6 sm:px-8 pb-10 sm:pb-14 ${liked.length === 0 ? "pt-10 sm:pt-14" : ""}`}>
              <Surtitre>{pluriel(likedPlaces.length, "adresse")}</Surtitre>
              <TitreSection>Mes adresses enregistrées</TitreSection>
              <div className="flex flex-wrap gap-2 mb-6">
                {PLACE_FILTERS.map((f) => {
                  const active = placeFilter === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setPlaceFilter(f)}
                      className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors border"
                      style={{
                        fontFamily: "var(--font-display)",
                        background: active ? "var(--lve-terracotta)" : "var(--lve-terracotta-bg)",
                        borderColor: active ? "var(--lve-terracotta)" : "color-mix(in srgb, var(--lve-terracotta) 20%, transparent)",
                        color: active ? "#fff" : "var(--lve-terracotta-ink)",
                      }}
                    >
                      {PLACE_FILTER_LABEL[f]}
                    </button>
                  );
                })}
              </div>
              {/* Même carte que sur les fiches voyage, cœur de retrait inclus (28/08/2026). */}
              {adressesFiltrees.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {adressesFiltrees.map((item) => (
                    <AddressDetailCard key={item.key} card={item.card} category={item.category} />
                  ))}
                </div>
              ) : (
                <p className="text-lve-charcoal/70 italic">Aucune adresse dans cette catégorie pour l&apos;instant.</p>
              )}
            </section>
          )}
        </>
      )}

      {charge && !isEmpty && (
        <div
          className="text-center py-10 sm:py-14 px-6"
          style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%, var(--lve-terracotta-bg), var(--lve-ivory))" }}
        >
          <h2
            className="mb-3 leading-tight text-lve-charcoal"
            style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2rem, 4.5vw, 2.8rem)" }}
          >
            Envie d&apos;allonger la liste&nbsp;?
          </h2>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            8 questions pour trouver la destination qui répond à tes envies.
          </p>
          <Link href="/questionnaire" className="btn-principal px-6 py-3.5">
            Lancer Travel Match
          </Link>
          <PromesseTravelMatch className="mt-4 justify-center" />
        </div>
      )}
    </div>
  );
}
