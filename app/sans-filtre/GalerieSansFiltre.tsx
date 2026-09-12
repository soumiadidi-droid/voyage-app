"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type PhotoBrute = { n: number; w: number; h: number; src: string; vignette: string };
export type VoyageBrut = { cle: string; date: string; photos: PhotoBrute[] };

// Galerie "Sans filtre" (12/09/2026) : les photos de Soumia telles qu'elle les a prises. Aucun
// PHOTO_GRADE ici, volontairement — c'est la preuve brute qu'elle y était, pas un visuel de marque.
// Mosaïque en colonnes (les photos gardent leur format, portrait ou paysage) et visionneuse plein
// écran au clic, avec flèches du clavier.
//
// AUCUN NOM DE LIEU affiché (décision de Soumia, 12/09/2026) : même règle que /carnets et la carte
// teaser de l'accueil — nommer les destinations révélerait les réponses du Travel Match. Les
// sections sont titrées par leur date seule. Le lieu n'existe NULLE PART dans les données envoyées
// au navigateur ni dans les adresses des images (sans-filtre/AAAA-MM/NNN.jpg) : un curieux qui lit
// le code de la page ne doit pas pouvoir le retrouver.
export function GalerieSansFiltre({ voyages }: { voyages: VoyageBrut[] }) {
  const toutes = voyages.flatMap((v) => v.photos.map((p) => ({ ...p, voyage: v })));
  const [ouverte, setOuverte] = useState<number | null>(null);

  const fermer = useCallback(() => setOuverte(null), []);
  const decaler = useCallback(
    (pas: number) => setOuverte((i) => (i === null ? i : (i + pas + toutes.length) % toutes.length)),
    [toutes.length]
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

  let index = 0;
  const actuelle = ouverte === null ? null : toutes[ouverte];

  return (
    <>
      {voyages.map((v) => (
        <section key={v.cle} className="max-w-5xl mx-auto px-6 sm:px-8 pb-10 sm:pb-14">
          <span
            className="inline-block text-xs uppercase tracking-[0.25em] text-lve-terracotta-ink font-semibold mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {v.photos.length} photos
          </span>
          <h2
            className="mb-6 leading-tight text-lve-charcoal"
            style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2rem, 4.5vw, 2.8rem)" }}
          >
            {v.date}
          </h2>
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 [&>*]:mb-3">
            {v.photos.map((p) => {
              const i = index++;
              return (
                <button
                  key={p.n}
                  type="button"
                  onClick={() => setOuverte(i)}
                  className="block w-full break-inside-avoid overflow-hidden rounded-xl bg-lve-border cursor-zoom-in"
                  aria-label={`Agrandir la photo — ${v.date}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- photos déjà
                      redimensionnées à la source, pas besoin de l'optimiseur */}
                  <img
                    src={p.vignette}
                    width={p.w}
                    height={p.h}
                    loading="lazy"
                    alt={`Photo de voyage, ${v.date}`}
                    className="w-full h-auto block transition-transform duration-500 hover:scale-[1.03]"
                  />
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {actuelle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo de voyage, ${actuelle.voyage.date}`}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={fermer}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- voir plus haut */}
          <img
            src={actuelle.src}
            alt={`Photo de voyage, ${actuelle.voyage.date}`}
            className="max-h-[88vh] max-w-[92vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p
            className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/80"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {actuelle.voyage.date}
          </p>
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
