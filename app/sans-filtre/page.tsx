import photos from "@/lib/sans-filtre-photos.json";
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
  const melange = melanger(photos as PhotoBrute[]);

  return (
    <div className="surface-claire bg-lve-bg">
      <div className="px-6 sm:px-8 pt-12 sm:pt-16 pb-8 sm:pb-10 text-center">
        <h1
          className="leading-none text-lve-charcoal mb-4"
          style={{ fontFamily: "var(--font-title)", fontSize: "clamp(3rem, 9vw, 6.5rem)" }}
        >
          Sans filtre
        </h1>
        <p className="italic text-lve-charcoal/70 max-w-xl mx-auto" style={{ fontSize: "1.1rem" }}>
          Mes photos telles que je les ai prises. Juste ce que j&apos;ai vu.
        </p>
      </div>

      <GalerieSansFiltre photos={melange} />
    </div>
  );
}
