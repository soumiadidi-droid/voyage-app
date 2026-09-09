// Envoi RÉEL d'un mail d'itinéraire de test (09/09/2026) — sert à valider la chaîne complète une
// fois le domaine vérifié chez Resend. Contrairement à preview-itinerary-email.ts, celui-ci envoie
// vraiment : à n'utiliser que vers l'adresse de Soumia.
//
// Usage :
//   npx tsx --env-file=.env.local scripts/test-send-itinerary.ts soumia.didi@gmail.com
//
// La clé est lue dans .env.local (jamais affichée). Si l'envoi échoue, Resend renvoie la vraie
// raison — typiquement "domain not verified" tant que les entrées DNS ne sont pas posées.
import { Resend } from "resend";
import { getVoyage } from "../lib/travel-match/data";
import { buildItineraryEmailHtml } from "../lib/email/itinerary";

const SLUGS = ["new-york", "japon-urbain", "londres"];
const SCORES = [94, 88, 81];

async function main() {
  const to = process.argv[2];
  if (!to) {
    console.error("Indique l'adresse destinataire : npx tsx --env-file=.env.local scripts/test-send-itinerary.ts ton@email.fr");
    process.exit(1);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_ton_cle")) {
    console.error("RESEND_API_KEY absente ou encore sur le placeholder dans .env.local.");
    process.exit(1);
  }

  const destinations = [];
  for (const [i, slug] of SLUGS.entries()) {
    const voyage = await getVoyage(slug);
    if (!voyage) throw new Error(`Carnet introuvable : ${slug}`);
    destinations.push({ id: slug, title: voyage.hero.title, slug, score: SCORES[i], voyage });
  }

  const html = buildItineraryEmailHtml({ archetypeTitle: "L'Âme Contemplative", destinations });

  const { data, error } = await new Resend(apiKey).emails.send({
    from: "Voyage des Émotions <contact@levoyagedesemotions.fr>",
    to,
    subject: "[TEST] Votre itinéraire sur mesure 🌿",
    html,
  });

  if (error) {
    console.error("Échec de l'envoi :", error);
    process.exit(1);
  }
  console.log(`Envoyé à ${to} (id ${data?.id}).`);
}

main();
