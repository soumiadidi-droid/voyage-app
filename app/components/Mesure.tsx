"use client";

import { Analytics } from "@vercel/analytics/next";

// Robots écartés du comptage (22/09/2026). En septembre, 18 « visiteurs » américains sur 18 avaient
// vu exactement une page, toujours l'accueil, quand les visiteurs français en voyaient 7,6 chacun :
// des programmes qui parcourent le web, pas des lecteurs. Ceux qui pilotent un vrai navigateur
// s'annoncent (`navigator.webdriver`), et ne sont plus comptés — l'agent relecteur du site compris.
// Les robots qui ne lisent que le texte de la page n'ont jamais été comptés : la mesure a besoin
// d'un navigateur pour se déclencher.
export default function Mesure() {
  return (
    <Analytics
      beforeSend={(evenement) =>
        typeof navigator !== "undefined" && navigator.webdriver ? null : evenement
      }
    />
  );
}
