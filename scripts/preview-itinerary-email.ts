// Prévisualisation du mail "itinéraire" (09/09/2026) — rend le mail avec les vraies données de la
// base et l'écrit dans un fichier HTML, SANS rien envoyer. Sert à valider le rendu et à surveiller
// la taille (Gmail tronque au-delà de ~102 Ko).
//
// Usage :
//   npx tsx --env-file=.env.local scripts/preview-itinerary-email.ts
//   npx tsx --env-file=.env.local scripts/preview-itinerary-email.ts cote-basque porto crete
//   npx tsx --env-file=.env.local scripts/preview-itinerary-email.ts --carnet new-york   (mail de fiche)
//
// Le fichier produit est déposé dans ~/Downloads/apercu-mail-itineraire.html : Soumia l'ouvre dans
// son navigateur pour voir exactement ce que recevra un visiteur.
import { writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { getVoyage } from "../lib/travel-match/data";
import { buildItineraryEmailHtml, buildCarnetEmailHtml, estimateSizeKb, GMAIL_CLIP_KB } from "../lib/email/itinerary";

const DEFAULT_SLUGS = ["cote-basque", "porto", "crete"];
const FAKE_SCORES = [94, 88, 81];

async function main() {
  const args = process.argv.slice(2);

  // Mail "carnet" envoyé depuis une fiche destination : un seul carnet, en entier.
  if (args[0] === "--carnet") {
    const slug = args[1];
    const voyage = await getVoyage(slug);
    if (!voyage) {
      console.error(`Carnet introuvable en base : ${slug}`);
      process.exit(1);
    }
    const html = buildCarnetEmailHtml({ destinationTitle: voyage.hero.title, slug, voyage });
    const out = join(homedir(), "Downloads", "apercu-mail-carnet.html");
    writeFileSync(out, html, "utf8");
    const n = voyage.stays.length + voyage.eats.length + voyage.activities.length;
    console.log(`Aperçu écrit : ${out}`);
    console.log(`  ${voyage.hero.title} : ${n} adresses`);
    console.log(`Taille : ${estimateSizeKb(html)} Ko (seuil de coupure Gmail : ${GMAIL_CLIP_KB} Ko)`);
    return;
  }

  const slugs = args.length > 0 ? args : DEFAULT_SLUGS;

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
