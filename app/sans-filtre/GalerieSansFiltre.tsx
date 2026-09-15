"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// legende / carnet (15/09/2026, essai sur une photo) : affichés UNIQUEMENT dans la vue agrandie, jamais
// sur le mur, qui reste sans texte. `carnet` = slug de la fiche voyage, pour le lien « Voir le carnet ».
export type PhotoBrute = { w: number; h: number; src: string; vignette: string; legende?: string; carnet?: string };

// Galerie "Sans filtre" (12/09/2026) : les photos de Soumia telles qu'elle les a prises. Aucun
// PHOTO_GRADE ici, volontairement — c'est la preuve brute qu'elle y était, pas un visuel de marque.
//
// Un seul mur d'images, bord à bord, sans aucune légende (décision de Soumia, 12/09/2026) : pas de
// lieu, pas de date, pas d'ordre, pas de compteur. "Que les gens puissent voir sans se prendre la
// tête." L'ordre est tiré au hasard côté serveur à chaque visite (voir page.tsx). Seules les
// adresses des images et leurs dimensions arrivent au navigateur.
export function GalerieSansFiltre({ photos }: { photos: PhotoBrute[] }) {
  const [ouverte, setOuverte] = useState<number | null>(null);

  const fermer = useCallback(() => setOuverte(null), []);
  const decaler = useCallback(
    (pas: number) => setOuverte((i) => (i === null ? i : (i + pas + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (ouverte === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") fermer();
      if (e.key === "ArrowRight") decaler(1);
      if (e.key === "ArrowLeft") decaler(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [ouverte, fermer, decaler]);

  return (
    <>
      <div className="columns-2 sm:columns-3 lg:columns-4 2xl:columns-5 gap-1 sm:gap-1.5 px-1 sm:px-1.5 [&>*]:mb-1 sm:[&>*]:mb-1.5">
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => setOuverte(i)}
            className="group block w-full break-inside-avoid overflow-hidden bg-lve-border cursor-zoom-in"
            aria-label="Agrandir la photo"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- photos déjà redimensionnées
                à la source, pas besoin de l'optimiseur */}
            <img
              src={p.vignette}
              width={p.w}
              height={p.h}
              loading={i < 12 ? "eager" : "lazy"}
              alt="Photo de voyage"
              className="w-full h-auto block transition duration-700 group-hover:scale-[1.04] group-hover:brightness-105"
            />
          </button>
        ))}
      </div>

      {ouverte !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo de voyage"
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={fermer}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- voir plus haut */}
          <img
            src={photos[ouverte].src}
            alt={photos[ouverte].legende ?? "Photo de voyage"}
            className="max-h-[84vh] max-w-[94vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {photos[ouverte].legende && (
            <div
              className="absolute bottom-5 left-0 right-0 flex flex-col items-center gap-1.5 px-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="italic text-white/90" style={{ fontFamily: "var(--font-title)", fontSize: "1.35rem" }}>
                {photos[ouverte].legende}
              </p>
              {photos[ouverte].carnet && (
                <Link
                  href={`/voyages/${photos[ouverte].carnet}`}
                  className="text-xs uppercase tracking-[0.2em] text-white/75 underline underline-offset-4 hover:text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Voir le carnet →
                </Link>
              )}
            </div>
          )}
          <button type="button" onClick={fermer} aria-label="Fermer" className="absolute top-4 right-4 text-white p-2">
            <X size={28} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              decaler(-1);
            }}
            aria-label="Photo précédente"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white p-2"
          >
            <ChevronLeft size={36} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              decaler(1);
            }}
            aria-label="Photo suivante"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white p-2"
          >
            <ChevronRight size={36} />
          </button>
        </div>
      )}
    </>
  );
}
