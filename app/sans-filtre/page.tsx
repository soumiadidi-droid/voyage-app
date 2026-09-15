import photos from "@/lib/sans-filtre-photos.json";
import { EnTetePage } from "../components/EnTetePage";
import { GalerieSansFiltre, type PhotoBrute } from "./GalerieSansFiltre";

// Nouvel ordre tiré au hasard à chaque visite : la page ne doit pas se lire comme une chronologie.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sans filtre — Le Voyage des Émotions",
  description: "Mes photos de voyage telles que je les ai prises, sans retouche.",
  alternates: { canonical: "/sans-filtre" },
};

// Page "Sans filtre" (12/09/2026, demande de Soumia : "ma galerie brute"). Ressuscite l'idée de la
// page /photos abandonnée le 22/08/2026, à sa demande explicite.
//
// Source : dix archives Google Photos de Soumia (Téléchargements, août 2026), 289 photos triées :
// retirées les photos où l'on reconnaît des passants ou un enfant, et les quasi-doublons. Les
// vidéos ne sont pas reprises. Photos redimensionnées (1800 px et vignettes 720 px) et
// DÉBARRASSÉES DE LEURS MÉTADONNÉES (position GPS comprise) avant envoi sur Vercel Blob. Tout ajout
// futur doit passer par le même nettoyage.
//
// Mise en page (12/09/2026, 2e version, Soumia : "un truc un peu artistique qui habite toute la
// page") : un titre discret puis un mur d'images bord à bord, mélangé, sans lieu, sans date, sans
// section. Remplace une première version rangée par voyage et datée.
function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

export default function SansFiltrePage() {
  // Essai du 15/09/2026 : sur la version de test, les photos légendées passent en tête pour qu'on
  // les trouve. À retirer quand toutes les photos auront leur légende.
  const toutes = melanger(photos as PhotoBrute[]);
  const melange = [...toutes.filter((p) => p.legende), ...toutes.filter((p) => !p.legende)];

  return (
    <div className="surface-claire bg-lve-bg">
      {/* En-tête commun (13/09/2026). */}
      <EnTetePage
        pastille="Mes photos telles que je les ai prises"
        titre="Sans filtre"
        citation="Juste ce que j'ai vu."
        largeur="6xl"
      />

      <div className="h-1.5" />
      <GalerieSansFiltre photos={melange} />
    </div>
  );
}
