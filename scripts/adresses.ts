// Cherche dans les adresses déjà en base (12/09/2026). Sert à l'agent Carnets
// (.claude/agents/carnets.md) : sans lui, "dédoublonner" voudrait dire comparer le vrac à sa
// mémoire, c'est-à-dire à rien. 155 adresses en base, personne ne les a toutes en tête.
//
// Usage :
//   npx tsx --env-file=.env.local scripts/adresses.ts loky          → cherche "loky" partout
//   npx tsx --env-file=.env.local scripts/adresses.ts --carnet porto → toutes les adresses d'un carnet
//   npx tsx --env-file=.env.local scripts/adresses.ts --carnets      → la liste des carnets
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const CATEGORIE_LISIBLE: Record<string, string> = {
  stay: "Où dormir",
  eat: "Où manger",
  activity: "Quoi faire",
};

type Ligne = {
  voyage_slug: string;
  category: string;
  name: string;
  status: string | null;
  location: string | null;
  price: string | null;
  tags: string[] | null;
  review: string | null;
  instagram_url: string | null;
  link: string | null;
};

function afficher(lignes: Ligne[]) {
  if (lignes.length === 0) {
    console.log("Aucune adresse ne correspond. C'est donc une nouvelle adresse.");
    return;
  }
  for (const a of lignes) {
    const insta = a.instagram_url ? "Instagram OK (visible sur le site)" : "SANS Instagram — MASQUÉE sur le site";
    console.log(`• ${a.name} — carnet "${a.voyage_slug}" · ${CATEGORIE_LISIBLE[a.category] ?? a.category}`);
    console.log(`  Statut : ${a.status ?? "—"} · Prix : ${a.price ?? "—"} · ${insta}`);
    console.log(`  Lieu : ${a.location ?? "—"}`);
    if (a.tags?.length) console.log(`  Étiquettes : ${a.tags.join(", ")}`);
    if (a.review) console.log(`  Avis : ${a.review.slice(0, 160)}${a.review.length > 160 ? "…" : ""}`);
    console.log("");
  }
  console.log(`${lignes.length} adresse(s).`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "--carnets") {
    const rows = (await sql.query(
      `select v.slug, v.published, count(a.id) as adresses
       from voyages v left join voyage_addresses a on a.voyage_slug = v.slug
       group by v.slug, v.published order by v.slug`
    )) as unknown as { slug: string; published: boolean; adresses: string }[];
    for (const r of rows) {
      console.log(`${r.slug} — ${r.adresses} adresses${r.published ? "" : " (brouillon, invisible)"}`);
    }
    return;
  }

  if (args[0] === "--carnet") {
    const slug = args[1];
    if (!slug) throw new Error("Donne le slug du carnet, ex. : --carnet porto");
    const rows = (await sql.query(
      `select * from voyage_addresses where voyage_slug = $1 order by category, position`,
      [slug]
    )) as unknown as Ligne[];
    afficher(rows);
    return;
  }

  const terme = args.join(" ").trim();
  if (!terme) {
    console.error('Donne un terme à chercher, ex. : npx tsx --env-file=.env.local scripts/adresses.ts "eden rock"');
    process.exit(1);
  }
  // Recherche large volontairement : le vrac de Soumia écrit rarement le nom exactement comme la
  // base. On cherche aussi dans le lieu et dans l'avis, pour rattraper "le café face au port".
  const rows = (await sql.query(
    `select * from voyage_addresses
     where name ilike $1 or location ilike $1 or review ilike $1
     order by voyage_slug, category, position`,
    [`%${terme}%`]
  )) as unknown as Ligne[];
  afficher(rows);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
