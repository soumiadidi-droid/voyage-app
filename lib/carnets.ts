import { getDestinations, getVoyages } from "@/lib/travel-match/data";
import { DESTINATION_HERO_IMAGE } from "@/lib/hero-images";
import { BADGE_RANK, type Carnet } from "@/app/components/CarnetCard";
import type { AuthenticityBadge } from "@/lib/travel-match/types";

// Construction de la liste des carnets (03/09/2026) — partagée par /carnets (liste complète) et
// l'accueil (section "à la une"), pour que les deux affichent exactement le même ensemble, le
// même tri et les mêmes compteurs.
export async function getCarnets(): Promise<Carnet[]> {
  const [voyages, destinations] = await Promise.all([getVoyages(), getDestinations()]);

  // Plusieurs destinations peuvent partager un même content_slug (Italie, Amérique du Nord — cf.
  // app/voyages/[slug]/page.tsx). On garde le meilleur badge du groupe : un carnet dont une des
  // destinations est vécue est un carnet vécu.
  const badgeBySlug = new Map<string, AuthenticityBadge>();
  for (const d of destinations) {
    const current = badgeBySlug.get(d.content_slug);
    if (!current || BADGE_RANK[d.authenticity_badge] < BADGE_RANK[current]) {
      badgeBySlug.set(d.content_slug, d.authenticity_badge);
    }
  }

  return voyages
    .map((v) => ({
      slug: v.slug,
      title: v.hero.title,
      tagline: v.hero.tagline,
      country: v.hero.country,
      badge: badgeBySlug.get(v.slug) ?? ("discovery" as AuthenticityBadge),
      image: DESTINATION_HERO_IMAGE[v.slug] ?? v.hero.image,
      addressCount: v.stays.length + v.eats.length + v.activities.length,
    }))
    .sort(
      (a, b) => BADGE_RANK[a.badge] - BADGE_RANK[b.badge] || a.title.localeCompare(b.title, "fr")
    );
}
