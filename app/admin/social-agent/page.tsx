import { SocialAgent } from "../../components/SocialAgent";
import { getDestinations } from "@/lib/travel-match/data";

export const metadata = {
  title: "L.V.E — Agent Social Media",
  // Hors index Google (03/09/2026). Posé en balise sur la page plutôt qu'en Disallow dans
  // robots.txt : robots.txt est un fichier public, y lister une URL revient à l'annoncer.
  robots: { index: false, follow: false },
};

// Sans ça, Next.js pré-génère cette page au build (aucun searchParams/cookies ne la force en
// dynamique) et fige les destinations lues à ce moment-là — contraire à l'objectif de la
// migration DB (contenu qui évolue sans redéploiement). Forcé en dynamique pour refléter Neon à
// chaque requête, comme /resultat et /voyages/[slug].
export const dynamic = "force-dynamic";

export default async function SocialAgentPage() {
  const destinations = await getDestinations();
  return <SocialAgent destinations={destinations} />;
}
