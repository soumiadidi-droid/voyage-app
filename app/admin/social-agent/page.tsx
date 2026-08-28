import { SocialAgent } from "../../components/SocialAgent";
import { getDestinations } from "@/lib/travel-match/data";

export const metadata = {
  title: "L.V.E — Agent Social Media",
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
