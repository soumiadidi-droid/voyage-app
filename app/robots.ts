import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// robots.txt (03/09/2026) — le site n'en avait aucun.
//
// AUCUNE liste de Disallow ici, volontairement (corrigé le 03/09/2026 après l'avoir d'abord
// écrite à tort). Deux raisons :
//   1. robots.txt est un fichier PUBLIC : y lister /carnets, /admin ou /studio revient à annoncer
//      ces URLs à qui le lit — exactement l'inverse du but pour la page réservée au démarchage.
//   2. Un Disallow empêche Google de venir LIRE la balise noindex de la page, donc une page déjà
//      référencée peut rester dans les résultats. Les deux mécanismes ne se combinent pas.
// Chaque page à exclure porte donc son propre `robots: { index: false, follow: false }` :
// /carnets, /resultat, /favoris, /studio, /admin, /admin/social-agent.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
