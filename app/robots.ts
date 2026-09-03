import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// robots.txt (03/09/2026) — le site n'en avait aucun. /admin et /studio sont le backoffice de
// Soumia (pas protégés par un mot de passe, juste non liés dans la nav pour un visiteur normal —
// cf. le commentaire du flag admin dans NavFooter.tsx) : les exclure de l'indexation évite qu'ils
// remontent dans Google, ce qui est le seul vrai risque de fuite aujourd'hui.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/studio", "/resultat", "/favoris", "/carnets"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
