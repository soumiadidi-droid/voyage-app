// Export d'adresses Neon vers un CSV compatible avec scripts/ingest-csv.ts (28/08/2026) — pour
// éviter de retaper à la main toutes les colonnes déjà connues (name, destination, category,
// status, location, review, price) quand il ne manque qu'un champ, typiquement `instagram_url`.
// Par défaut, n'exporte QUE les adresses sans instagram_url déjà renseigné — le but est de
// produire une liste "à compléter", pas un dump complet.
//
// Usage :
//   npx tsx --env-file=.env.local scripts/export-csv.ts                    -> toutes catégories, sans instagram_url
//   npx tsx --env-file=.env.local scripts/export-csv.ts stay               -> uniquement les hébergements
//   npx tsx --env-file=.env.local scripts/export-csv.ts stay --all         -> hébergements, y compris ceux qui ont déjà un lien
//
// Le fichier produit est déposé dans ~/Downloads/ — Soumia n'a plus qu'à remplir la colonne
// instagram_url (les autres colonnes sont déjà pré-remplies depuis la base) puis redonner le
// fichier à Claude, qui relance ingest-csv.ts dessus.

import { writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const COLUMNS = ["name", "destination", "category", "instagram_url", "review", "price", "status", "location"] as const;

function csvEscape(value: string | null | undefined): string {
  const v = value ?? "";
  // RFC 4180 : entourer de guillemets dès qu'il y a une virgule, un guillemet ou un retour à la
  // ligne, en doublant les guillemets internes — cohérent avec le parseur de ingest-csv.ts.
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

async function main() {
  const args = process.argv.slice(2);
  const includeAll = args.includes("--all");
  const category = args.find((a) => !a.startsWith("--"));

  let query = `select voyage_slug, category, name, status, location, review, price, instagram_url from voyage_addresses`;
  const conditions: string[] = [];
  const params: string[] = [];

  if (category) {
    conditions.push(`category = $${params.length + 1}`);
    params.push(category);
  }
  if (!includeAll) {
    conditions.push(`instagram_url is null`);
  }
  if (conditions.length > 0) query += ` where ${conditions.join(" and ")}`;
  query += ` order by voyage_slug, category, position`;

  const rows = (await sql.query(query, params)) as unknown as {
    voyage_slug: string;
    category: string;
    name: string;
    status: string;
    location: string;
    review: string;
    price: string | null;
    instagram_url: string | null;
  }[];

  if (rows.length === 0) {
    console.log("Aucune adresse à exporter (essayez --all ou vérifiez le filtre de catégorie).");
    return;
  }

  const lines = [COLUMNS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.name),
        csvEscape(r.voyage_slug),
        csvEscape(r.category),
        csvEscape(r.instagram_url),
        csvEscape(r.review),
        csvEscape(r.price),
        csvEscape(r.status),
        csvEscape(r.location),
      ].join(",")
    );
  }

  const filename = `adresses-a-completer-${category ?? "toutes"}-${new Date().toISOString().slice(0, 10)}.csv`;
  const outPath = join(homedir(), "Downloads", filename);
  writeFileSync(outPath, lines.join("\n"), "utf-8");

  console.log(`✓ ${rows.length} adresse(s) exportée(s) vers ${outPath}`);
  console.log(`  Remplis la colonne "instagram_url" puis redonne le fichier pour l'ingestion.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
