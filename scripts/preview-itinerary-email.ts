// Prévisualisation du mail "itinéraire" (09/09/2026) — rend le mail avec les vraies données de la
// base et l'écrit dans un fichier HTML, SANS rien envoyer. Sert à valider le rendu et à surveiller
// la taille (Gmail tronque au-delà de ~102 Ko).
//
// Usage :
//   npx tsx --env-file=.env.local scripts/preview-itinerary-email.ts
//   npx tsx --env-file=.env.local scripts/preview-itinerary-email.ts cote-basque porto crete
//
// Le fichier produit est déposé dans ~/Downloads/apercu-mail-itineraire.html : Soumia l'ouvre dans
// son navigateur pour voir exactement ce que recevra un visiteur.
import { writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { getVoyage } from "../lib/travel-match/data";
import { buildItineraryEmailHtml, estimateSizeKb, GMAIL_CLIP_KB } from "../lib/email/itinerary";

const DEFAULT_SLUGS = ["cote-basque", "porto", "crete"];
const FAKE_SCORES = [94, 88, 81];

async function main() {
  const slugs = process.argv.slice(2).length > 0 ? process.argv.slice(2) : DEFAULT_SLUGS;

  const destinations = [];
  for (const [i, slug] of slugs.entries()) {
    const voyage = await getVoyage(slug);
    if (!voyage) {
      console.error(`Carnet introuvable en base : ${slug}`);
      process.exit(1);
    }
    destinations.push({
      id: slug,
      title: voyage.hero.title,
      slug,
      score: FAKE_SCORES[i] ?? 75,
      voyage,
    });
  }

  const html = buildItineraryEmailHtml({
    archetypeTitle: "L'Âme Contemplative",
    destinations,
  });

  const out = join(homedir(), "Downloads", "apercu-mail-itineraire.html");
  writeFileSync(out, html, "utf8");

  const sizeKb = estimateSizeKb(html);
  const counts = destinations
    .map((d) => `${d.title} : ${d.voyage.stays.length + d.voyage.eats.length + d.voyage.activities.length} adresses`)
    .join("\n  ");

  console.log(`Aperçu écrit : ${out}`);
  console.log(`  ${counts}`);
  console.log(`Taille : ${sizeKb} Ko (seuil de coupure Gmail : ${GMAIL_CLIP_KB} Ko)`);
  if (sizeKb > GMAIL_CLIP_KB) console.log("  ⚠ au-delà du seuil : la fin du mail serait tronquée par Gmail.");
}

main();
