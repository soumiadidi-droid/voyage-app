// Ingestion par lot d'adresses depuis un fichier CSV (28/08/2026) — pure plomberie (parsing +
// validation + upsert), AUCUNE rédaction automatique : la colonne `review` doit déjà contenir le
// texte final au gabarit éditorial (voir .claude/skills/voyage-ingest/SKILL.md). Si vous partez de
// notes brutes, faites-les rédiger via une conversation avec Claude d'abord — ce script ne
// transforme jamais du texte brut en review structurée.
//
// Usage : npx tsx --env-file=.env.local scripts/ingest-csv.ts chemin/vers/fichier.csv
//
// Colonnes attendues (en-tête obligatoire, dans n'importe quel ordre) :
//   name             - nom de l'adresse (obligatoire)
//   destination      - voyages.slug cible, doit déjà exister (obligatoire)
//   category         - stay | eat | activity (obligatoire)
//   instagram_url    - lien post/reel Instagram (optionnel, normalisé automatiquement)
//   review           - texte déjà rédigé au gabarit (optionnel, mais review vide = carte quasi nue)
//   price            - texte libre, ex. "45€ la nuit" (optionnel)
//   status           - ex. "Testé", "Sur notre radar" (optionnel)
//   location         - sous-titre affiché sur la carte (optionnel)
//
// Un champ contenant une virgule ou un guillemet doit être entre guillemets doubles ("..."),
// avec les guillemets internes doublés ("") — format CSV standard (RFC 4180).

import { readFileSync } from "node:fs";
import { getDestinations } from "../lib/travel-match/data";
import { ingestBatch, printBatchSummary, type BatchItem, type AddressCategoryDb } from "../lib/travel-match/ingest";

const REQUIRED_COLUMNS = ["name", "destination", "category"];
const VALID_CATEGORIES: AddressCategoryDb[] = ["stay", "eat", "activity"];

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) throw new Error("Fichier CSV vide");

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    throw new Error(`Colonnes obligatoires manquantes dans l'en-tête : ${missing.join(", ")}`);
  }

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = (values[i] ?? "").trim()));
    return row;
  });
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage : npx tsx --env-file=.env.local scripts/ingest-csv.ts chemin/vers/fichier.csv");
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");
  const rows = parseCsv(content);
  console.log(`${rows.length} ligne(s) lue(s) dans ${filePath}`);

  // Validation des destinations cibles AVANT tout upsert — un fichier avec une seule destination
  // mal orthographiée doit être signalé clairement, pas produire 19 erreurs cryptiques une par une.
  const destinations = await getDestinations();
  const knownSlugs = new Set(destinations.map((d) => d.content_slug));

  const items: BatchItem[] = [];
  const rowErrors: string[] = [];

  rows.forEach((row, i) => {
    const lineNum = i + 2; // +1 pour l'en-tête, +1 pour l'index 0-based
    if (!row.name) {
      rowErrors.push(`Ligne ${lineNum} : "name" manquant, ignorée`);
      return;
    }
    if (!row.destination || !knownSlugs.has(row.destination)) {
      rowErrors.push(`Ligne ${lineNum} ("${row.name}") : destination "${row.destination}" inconnue, ignorée`);
      return;
    }
    if (!VALID_CATEGORIES.includes(row.category as AddressCategoryDb)) {
      rowErrors.push(`Ligne ${lineNum} ("${row.name}") : category "${row.category}" invalide (attendu stay/eat/activity), ignorée`);
      return;
    }

    items.push({
      kind: "address",
      data: {
        voyageSlug: row.destination,
        category: row.category as AddressCategoryDb,
        name: row.name,
        status: row.status || undefined,
        location: row.location || undefined,
        review: row.review || undefined,
        price: row.price || undefined,
        instagramUrl: row.instagram_url || undefined,
      },
    });
  });

  if (rowErrors.length > 0) {
    console.log(`\n⚠ ${rowErrors.length} ligne(s) ignorée(s) avant écriture :`);
    rowErrors.forEach((e) => console.log(`  - ${e}`));
  }

  if (items.length === 0) {
    console.log("\nAucune ligne valide à écrire.");
    return;
  }

  console.log(`\nÉcriture de ${items.length} adresse(s)...`);
  const summary = await ingestBatch(items);
  printBatchSummary(summary);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
