"use server";

import { getVoyage as getVoyageFromDb } from "@/lib/travel-match/data";

// SocialAgent (Client Component) reçoit la liste des destinations en props depuis la page Server
// Component, mais doit résoudre la fiche voyage associée à la volée à chaque changement de
// sélection dans le <select> — d'où cette Server Action plutôt qu'un fetch de tout au chargement.
export async function getVoyageForSocialAgent(contentSlug: string) {
  return getVoyageFromDb(contentSlug);
}
