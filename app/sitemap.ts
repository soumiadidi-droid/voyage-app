import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getCarnets } from "@/lib/carnets";

// sitemap.xml (03/09/2026) — le site n'en avait aucun, donc aucune fiche voyage n'était soumise à
// l'indexation. Les 13 fiches sont générées depuis la base, comme la page /carnets : une nouvelle
// destination ajoutée en base apparaît automatiquement ici, sans rien à mettre à jour à la main.
//
// Pages volontairement absentes : /carnets (réservée au démarchage, en noindex — cf. la page
// elle-même), /resultat et /favoris (contenu propre à chaque visiteur, sans intérêt en recherche),
// /admin et /studio (backoffice), /questionnaire (formulaire).
// Même raison que /carnets : régénéré à la requête pour qu'une nouvelle destination en base
// apparaisse sans dépendre du cache de build.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const carnets = await getCarnets();
  const now = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/pros`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/philosophie`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...carnets.map((c) => ({
      url: `${SITE_URL}/voyages/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/mentions-legales`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.2 },
    { url: `${SITE_URL}/confidentialite`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.2 },
  ];
}
