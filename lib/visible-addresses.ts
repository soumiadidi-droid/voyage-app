// Définition unique de « les adresses que le site montre » (10/09/2026).
//
// Une adresse n'apparaît sur une fiche que si son lien Instagram est vérifié en base (règle du
// 29/08/2026). Ce filtre vivait en dur dans app/voyages/[slug]/page.tsx, et les mails d'itinéraire
// et de carnet, écrits le 09/09, lisaient eux la base entière : 6 adresses masquées à l'écran
// partaient quand même par mail (Japon urbain, Londres, Japon Kyoto, Porto, Chine nature).
// Repéré au grillage du 09/09 et corrigé ici, pour que « ce qu'on affiche » n'ait qu'une seule
// définition dans tout le projet.
//
// À ne PAS remonter dans lib/travel-match/data.ts : cette couche sert aussi à retrouver un
// établissement liké (app/favoris), qui doit continuer à s'afficher même sans lien Instagram
// (bug du 29/08/2026).
import type { VoyageContent } from "@/content/voyages";

export function withVisibleAddresses(voyage: VoyageContent): VoyageContent {
  return {
    ...voyage,
    stays: voyage.stays.filter((c) => c.instagramUrl),
    eats: voyage.eats.filter((c) => c.instagramUrl),
    activities: voyage.activities.filter((c) => c.instagramUrl),
  };
}
