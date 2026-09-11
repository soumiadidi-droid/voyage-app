// Publier ou dépublier une destination (11/09/2026).
//
//   npx tsx --env-file=.env.local scripts/publier.ts            -> liste l'état de tout
//   npx tsx --env-file=.env.local scripts/publier.ts paris      -> publie (destination + carnet)
//   npx tsx --env-file=.env.local scripts/publier.ts paris off  -> repasse en brouillon
//
// Une destination en brouillon n'existe pour personne : absente du questionnaire, de /carnets, et
// son adresse directe renvoie une page introuvable.
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const [cible, etat] = process.argv.slice(2);
  const publier = etat !== "off";

  if (!cible) {
    const rows = await sql.query(
      `select d.id, d.title, d.published as destination, v.published as carnet
       from destinations d left join voyages v on v.slug = d.content_slug
       order by d.published, d.id`);
    console.table(rows);
    return;
  }

  const d = await sql.query(`update destinations set published = $2 where id = $1 returning content_slug`, [cible, publier]);
  if ((d as unknown as unknown[]).length === 0) {
    console.error(`Aucune destination avec l'identifiant "${cible}".`);
    process.exit(1);
  }
  const slug = (d as unknown as { content_slug: string }[])[0].content_slug;
  await sql.query(`update voyages set published = $2 where slug = $1`, [slug, publier]);
  console.log(`${cible} (carnet ${slug}) → ${publier ? "publiée" : "en brouillon"}`);
}
main();
