import Link from "next/link";
import { getCarnets } from "@/lib/carnets";
import { CarnetCard } from "../components/CarnetCard";

// Page liste de tous les carnets (03/09/2026). Remplace le stub "Page en cours de rédaction" et
// annule la décision du 23/08/2026 qui avait délié /carnets de la nav ("pas de section blog") :
// l'objectif du site est devenu un book de crédibilité B2B (démarchage offices de tourisme /
// hôtels), donc les récits doivent être atteignables sans passer par le questionnaire, et
// indexables. Le questionnaire reste accessible partout (CTA header + CTA en bas de cette page).
//
// /voyages et /destinations redirigent ici (next.config.ts) : les fiches détail vivent sur
// /voyages/[slug], une seule page d'index pour éviter le contenu dupliqué.

// Toujours relu en base à la requête (03/09/2026) : la page était prérendue au build, et le cache
// de build de Next a resservi une version périmée du catalogue après une modification en base
// (constaté sur le statut de Marseille pendant cette session). Comme le déploiement est manuel,
// une destination ajoutée en base pouvait rester invisible sans qu'on comprenne pourquoi.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Carnets de voyage — Le Voyage des Émotions",
  description:
    "Tous les carnets : des destinations testées sur le terrain et des adresses curatées, racontées une par une.",
  alternates: { canonical: "/carnets" },
  openGraph: {
    title: "Les carnets — Le Voyage des Émotions",
    description: "Des récits de voyages vrais, des adresses incarnées.",
    type: "website",
  },
};

export default async function CarnetsPage() {
  const carnets = await getCarnets();
  const testedCount = carnets.filter((c) => c.badge === "tested_approved").length;

  return (
    <div className="bg-lve-ivory">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <span
          className="text-xs uppercase tracking-[0.25em] text-lve-terracotta font-semibold block mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {/* "tous vécus" quand aucune destination n'est en curation : "15 carnets — 15 vécus"
              se lit comme une redondance. */}
          {carnets.length} carnets —{" "}
          {testedCount === carnets.length ? "tous vécus" : `${testedCount} vécus`} sur le terrain
        </span>

        <h1
          className="text-lve-charcoal font-extrabold leading-tight mb-5 max-w-2xl"
          style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2.2rem, 5vw, 3.4rem)" }}
        >
          Les carnets
        </h1>

        <p
          className="text-lve-charcoal/70 max-w-xl mb-12 text-base sm:text-lg leading-relaxed"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Chaque carnet indique clairement son statut :{" "}
          <strong className="font-medium text-lve-charcoal">Testée</strong> quand la destination a
          été vécue et photographiée sur le terrain,{" "}
          <strong className="font-medium text-lve-charcoal">Curatée</strong> quand elle a été
          sélectionnée pour sa pertinence. Jamais mélangés.
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 list-none m-0 p-0">
          {carnets.map((carnet) => (
            <li key={carnet.slug}>
              <CarnetCard carnet={carnet} headingLevel="h2" />
            </li>
          ))}
        </ul>

        {/* Le questionnaire reste accessible, mais il n'est plus le seul chemin vers les récits
            (03/09/2026) — il devient une entrée en plus, pas un péage. */}
        <div className="mt-16 sm:mt-20 rounded-2xl border border-lve-charcoal/10 bg-white px-6 py-12 text-center">
          <h2
            className="text-lve-charcoal mb-3"
            style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)" }}
          >
            Vous ne savez pas par où commencer ?
          </h2>
          <p
            className="text-lve-charcoal/70 max-w-lg mx-auto mb-7 leading-relaxed"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Neuf questions, deux minutes, et le carnet qui vous correspond.
          </p>
          <Link
            href="/questionnaire"
            className="inline-block bg-lve-terracotta hover:bg-lve-terracotta-dark text-white text-xs uppercase tracking-[0.2em] font-medium px-8 py-4 rounded-lg shadow-md transition-all hover:-translate-y-0.5 no-underline"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Trouver mon voyage sur-mesure
          </Link>
        </div>
      </div>
    </div>
  );
}
