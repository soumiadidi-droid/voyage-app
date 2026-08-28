// Applique scripts/schema.sql contre Neon. Exécuté une fois avec :
//   node --env-file=.env.local scripts/apply-schema.mjs
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const script = readFileSync(new URL("./schema.sql", import.meta.url), "utf-8");

// Découpe naïve sur `;` en fin de ligne — le schéma ne contient aucun `;` dans une chaîne ou un
// bloc dollar-quoted qui pourrait tromper ce split (vérifié à l'œil dans schema.sql).
const statements = script
  .split(/;\s*\n/)
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  console.log("→", statement.split("\n")[0].slice(0, 70));
  try {
    await sql.query(statement);
  } catch (err) {
    // 42710 = duplicate_object (ex. "create type address_category" rejoué) — le script est
    // relançable pendant l'itération, ce n'est pas une vraie erreur.
    if (err.code === "42710") {
      console.log("  (déjà existant, ignoré)");
    } else {
      throw err;
    }
  }
}
console.log(`✓ ${statements.length} statements appliqués`);
