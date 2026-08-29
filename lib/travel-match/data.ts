// Couche d'accès Neon — réassemble exactement les mêmes formes TS que les anciens modules
// statiques (DESTINATIONS, VOYAGES, getVoyage). engine.ts/combos.ts ne changent pas : seule la
// provenance des données change. Voir le plan de migration
// (~/.claude/plans/moonlit-noodling-dolphin.md).
import { neon } from "@neondatabase/serverless";
import type { Destination, SuggestedCombo } from "./types";
import type { Card, VoyageContent } from "@/content/voyages";

const sql = neon(process.env.DATABASE_URL!);

type DestinationRow = {
  id: string;
  title: string;
  authenticity_badge: Destination["authenticity_badge"];
  content_slug: string;
  summary: string;
  hero_image: string;
  filters: Destination["filters"];
  scores: Destination["scores"];
  logistics: Destination["logistics"];
  tags: string[];
  regional_transport: Destination["regional_transport"] | null;
  practical_info: Destination["practical_info"] | null;
};

type ComboRow = {
  id: string;
  source_destination_id: string;
  target_destination_id: string;
  title: string;
  vibe_type: string;
  description: string;
  transition_logistics: SuggestedCombo["transition_logistics"];
  min_duration_required: SuggestedCombo["min_duration_required"];
};

export async function getDestinations(): Promise<Destination[]> {
  const [destinationRows, comboRows] = await Promise.all([
    sql.query(`select * from destinations`) as unknown as Promise<DestinationRow[]>,
    sql.query(`select * from combos`) as unknown as Promise<ComboRow[]>,
  ]);

  const combosBySource = new Map<string, SuggestedCombo[]>();
  for (const c of comboRows) {
    const combo: SuggestedCombo = {
      id: c.id,
      target_destination_id: c.target_destination_id,
      title: c.title,
      vibe_type: c.vibe_type,
      description: c.description,
      transition_logistics: c.transition_logistics,
      min_duration_required: c.min_duration_required,
    };
    const list = combosBySource.get(c.source_destination_id) ?? [];
    list.push(combo);
    combosBySource.set(c.source_destination_id, list);
  }

  return destinationRows.map((r) => ({
    id: r.id,
    title: r.title,
    authenticity_badge: r.authenticity_badge,
    content_slug: r.content_slug,
    summary: r.summary,
    hero_image: r.hero_image,
    filters: r.filters,
    scores: r.scores,
    logistics: r.logistics,
    tags: r.tags,
    suggested_combos: combosBySource.get(r.id) ?? [],
    regional_transport: r.regional_transport ?? undefined,
    practical_info: r.practical_info ?? undefined,
  }));
}

type VoyageRow = { slug: string; hero: VoyageContent["hero"]; intro: string; gallery: VoyageContent["gallery"] };

type AddressRow = {
  id: string;
  voyage_slug: string;
  category: "stay" | "eat" | "activity";
  name: string;
  status: string;
  location: string;
  review: string;
  tags: string[];
  link: string | null;
  link_label: string | null;
  is_partner: boolean;
  image: string | null;
  price: string | null;
  instagram_url: string | null;
  family_fit: Card["familyFit"] | null;
};

function rowToCard(a: AddressRow): Card {
  return {
    id: a.id,
    name: a.name,
    status: a.status,
    location: a.location,
    review: a.review,
    tags: a.tags,
    link: a.link,
    linkLabel: a.link_label,
    isPartner: a.is_partner,
    image: a.image ?? undefined,
    price: a.price ?? undefined,
    instagramUrl: a.instagram_url ?? undefined,
    familyFit: a.family_fit ?? undefined,
  };
}

export async function getVoyage(slug: string): Promise<VoyageContent | undefined> {
  const voyageRows = (await sql.query(`select * from voyages where slug = $1`, [slug])) as unknown as VoyageRow[];
  if (voyageRows.length === 0) return undefined;
  const v = voyageRows[0];

  const addressRows = (await sql.query(
    `select * from voyage_addresses where voyage_slug = $1 order by category, position`,
    [slug]
  )) as unknown as AddressRow[];

  const stays: Card[] = [];
  const eats: Card[] = [];
  const activities: Card[] = [];
  for (const a of addressRows) {
    const card = rowToCard(a);
    if (a.category === "stay") stays.push(card);
    else if (a.category === "eat") eats.push(card);
    else activities.push(card);
  }

  return { slug: v.slug, hero: v.hero, intro: v.intro, gallery: v.gallery, stays, eats, activities };
}

// Utilisé pour la résolution des favoris (voir app/favoris/page.tsx) — plus utilisé par
// generateStaticParams (retiré, la fiche voyage était déjà rendue dynamiquement à chaque
// requête avant cette migration, cf. plan).
export async function getVoyages(): Promise<VoyageContent[]> {
  const [voyageRows, addressRows] = await Promise.all([
    sql.query(`select * from voyages`) as unknown as Promise<VoyageRow[]>,
    sql.query(`select * from voyage_addresses order by voyage_slug, category, position`) as unknown as Promise<AddressRow[]>,
  ]);

  const addressesBySlug = new Map<string, { stays: Card[]; eats: Card[]; activities: Card[] }>();
  for (const a of addressRows) {
    const bucket = addressesBySlug.get(a.voyage_slug) ?? { stays: [], eats: [], activities: [] };
    const card = rowToCard(a);
    if (a.category === "stay") bucket.stays.push(card);
    else if (a.category === "eat") bucket.eats.push(card);
    else bucket.activities.push(card);
    addressesBySlug.set(a.voyage_slug, bucket);
  }

  return voyageRows.map((v) => ({
    slug: v.slug,
    hero: v.hero,
    intro: v.intro,
    gallery: v.gallery,
    ...(addressesBySlug.get(v.slug) ?? { stays: [], eats: [], activities: [] }),
  }));
}
