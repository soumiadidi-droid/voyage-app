import Link from "next/link";
import photos from "@/lib/sans-filtre-photos.json";
import { GalerieSansFiltre, type VoyageBrut } from "./GalerieSansFiltre";

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
// Même habillage que /pros et /philosophie. La liste vit dans lib/sans-filtre-photos.json, du plus
// récent au plus ancien.
export default function SansFiltrePage() {
  const voyages = photos as VoyageBrut[];
  const total = voyages.reduce((s, v) => s + v.photos.length, 0);

  return (
    <div className="surface-claire bg-lve-bg">
      <div
        className="px-6 sm:px-8 py-10 sm:py-14"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, var(--lve-terracotta-bg), var(--lve-ivory))" }}
      >
        <div className="max-w-5xl mx-auto">
          <span
            className="inline-block text-xs uppercase tracking-[0.25em] text-white bg-lve-terracotta font-semibold rounded-full px-4 py-1.5 mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {total} photos · {voyages.length} voyages
          </span>
          <h1
            className="mb-6 leading-tight text-lve-charcoal"
            style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2.4rem, 5.5vw, 3.6rem)" }}
          >
            Sans filtre
          </h1>
          <p
            className="italic border-l-4 border-lve-terracotta pl-4 text-lve-charcoal/90 max-w-3xl"
            style={{ fontSize: "1.15rem" }}
          >
            Mes photos telles que je les ai prises. Pas de retouche, pas de mise en scène&nbsp;: juste
            ce que j&apos;ai vu.
          </p>
        </div>
      </div>

      <div className="pt-10 sm:pt-14">
        <GalerieSansFiltre voyages={voyages} />
      </div>

      <div
        className="text-center py-10 sm:py-14 px-6"
        style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%, var(--lve-terracotta-bg), var(--lve-ivory))" }}
      >
        <h2
          className="mb-3 leading-tight text-lve-charcoal"
          style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2rem, 4.5vw, 2.8rem)" }}
        >
          Et toi, tu cherches quoi&nbsp;?
        </h2>
        <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
          8 questions pour trouver la destination qui répond à tes envies.
        </p>
        <Link href="/questionnaire" className="btn-principal px-6 py-3.5">
          Lancer Travel Match
        </Link>
      </div>
    </div>
  );
}
