import { InstaStudio } from "../components/InstaStudio/InstaStudio";

export const metadata = {
  title: "L.V.E — Studio",
  // Hors index Google (03/09/2026). Posé en balise sur la page plutôt qu'en Disallow dans
  // robots.txt : robots.txt est un fichier public, y lister une URL revient à l'annoncer.
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <InstaStudio />;
}
