import { FavorisClient } from "./FavorisClient";

export const metadata = {
  title: "Mes favoris — Le Voyage des Émotions",
  // Hors index Google (03/09/2026). Posé en balise sur la page plutôt qu'en Disallow dans
  // robots.txt : robots.txt est un fichier public, y lister une URL revient à l'annoncer.
  robots: { index: false, follow: false },
};

export default function FavorisPage() {
  return <FavorisClient />;
}
