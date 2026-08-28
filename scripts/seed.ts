// Seed Neon depuis les modules statiques actuels — transcription fidèle, rien d'inventé.
// Relançable (upserts / delete+insert par parent) : node --env-file=.env.local -r tsx/cjs
// n'est pas utilisé ici, on lance via `npx tsx scripts/seed.ts`.
import { neon } from "@neondatabase/serverless";
import { DESTINATIONS } from "../lib/travel-match/destinations";
import { VOYAGES } from "../content/voyages";

const sql = neon(process.env.DATABASE_URL!);

async function seedVoyages() {
  for (const voyage of VOYAGES) {
    await sql.query(
      `insert into voyages (slug, hero, intro, gallery)
       values ($1, $2::jsonb, $3, $4::jsonb)
       on conflict (slug) do update
         set hero = excluded.hero, intro = excluded.intro, gallery = excluded.gallery, updated_at = now()`,
      [voyage.slug, JSON.stringify(voyage.hero), voyage.intro, JSON.stringify(voyage.gallery)]
    );

    // delete+insert plutôt qu'upsert par position : correct même si le nombre d'adresses change
    // d'une exécution à l'autre (ajout/suppression d'une adresse dans le JSON source).
    await sql.query(`delete from voyage_addresses where voyage_slug = $1`, [voyage.slug]);

    const categories = [
      ["stay", voyage.stays],
      ["eat", voyage.eats],
      ["activity", voyage.activities],
    ] as const;

    for (const [category, cards] of categories) {
      for (const [position, card] of cards.entries()) {
        await sql.query(
          `insert into voyage_addresses
             (voyage_slug, category, position, name, status, location, review, tags, link, link_label, is_partner, image, family_fit)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb)`,
          [
            voyage.slug,
            category,
            position,
            card.name,
            card.status,
            card.location,
            card.review,
            card.tags,
            card.link,
            card.linkLabel,
            card.isPartner ?? false,
            card.image ?? null,
            card.familyFit ? JSON.stringify(card.familyFit) : null,
          ]
        );
      }
    }
  }
  console.log(`✓ ${VOYAGES.length} voyages + adresses seedés`);
}

async function seedDestinations() {
  for (const dest of DESTINATIONS) {
    await sql.query(
      `insert into destinations
         (id, title, authenticity_badge, content_slug, summary, hero_image, filters, scores, logistics, tags, regional_transport)
       values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10,$11::jsonb)
       on conflict (id) do update set
         title = excluded.title, authenticity_badge = excluded.authenticity_badge,
         content_slug = excluded.content_slug, summary = excluded.summary, hero_image = excluded.hero_image,
         filters = excluded.filters, scores = excluded.scores, logistics = excluded.logistics,
         tags = excluded.tags, regional_transport = excluded.regional_transport, updated_at = now()`,
      [
        dest.id,
        dest.title,
        dest.authenticity_badge,
        dest.content_slug,
        dest.summary,
        dest.hero_image,
        JSON.stringify(dest.filters),
        JSON.stringify(dest.scores),
        JSON.stringify(dest.logistics),
        dest.tags,
        dest.regional_transport ? JSON.stringify(dest.regional_transport) : null,
      ]
    );
  }
  console.log(`✓ ${DESTINATIONS.length} destinations seedées`);
}

async function seedCombos() {
  let count = 0;
  for (const dest of DESTINATIONS) {
    // delete+insert par destination "phare" (source) — un combo n'est saisi qu'une fois côté
    // destination qui le porte (voir lib/travel-match/combos.ts, convention du 23/08/2026).
    await sql.query(`delete from combos where source_destination_id = $1`, [dest.id]);
    for (const combo of dest.suggested_combos) {
      await sql.query(
        `insert into combos
           (id, source_destination_id, target_destination_id, title, vibe_type, description, transition_logistics, min_duration_required)
         values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)`,
        [
          combo.id,
          dest.id,
          combo.target_destination_id,
          combo.title,
          combo.vibe_type,
          combo.description,
          JSON.stringify(combo.transition_logistics),
          combo.min_duration_required,
        ]
      );
      count++;
    }
  }
  console.log(`✓ ${count} combos seedés`);
}

async function main() {
  // Ordre : voyages avant destinations (FK content_slug), destinations avant combos (FK source/target).
  await seedVoyages();
  await seedDestinations();
  await seedCombos();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
