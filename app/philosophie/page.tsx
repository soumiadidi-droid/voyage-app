import Link from "next/link";
import { Quote, Sparkles } from "lucide-react";

export const metadata = {
  title: "Notre philosophie — Le Voyage des Émotions",
};

// Textes définitifs validés par Soumia le 23/08/2026.
const PILLARS = [
  {
    title: "Tout au même endroit",
    description:
      "Libérez votre esprit. Plus besoin de multiplier les onglets : retrouvez l'inspiration, les itinéraires et les adresses pépites centralisés en un seul endroit.",
  },
  {
    title: "La vérité de l'expérience",
    description:
      "Une sélection exigeante et incarnée. Pas de listes impersonnelles ou d'attrapes-touristes, uniquement des lieux qui ont une vraie âme.",
  },
  {
    title: "À la hauteur de vos émotions",
    description:
      "Parce que chaque voyageur est unique, nous connectons vos envies profondes aux meilleures destinations grâce à Travel Match.",
  },
];

export default function PhilosophiePage() {
  return (
    <div>
      {/* Halo terracotta (29/08/2026, "plus de peps") : dégradé radial très doux derrière le
          titre plutôt qu'un aplat ivoire plat — le texte reste inchangé, seul l'habillage change. */}
      <div
        className="pt-16 pb-6 sm:pt-20 sm:pb-8 px-6 text-center"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, var(--lve-terracotta-bg), var(--lve-ivory))" }}
      >
        <Sparkles className="mx-auto mb-4 text-lve-terracotta" size={22} strokeWidth={1.75} />
        <h1
          className="text-lve-charcoal leading-tight max-w-3xl mx-auto"
          style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2rem, 5vw, 3.2rem)" }}
        >
          L&apos;art du voyage raconté sans filtre, libéré de la charge de la recherche.
        </h1>
      </div>

      {/* Bandeau "mot de la fondatrice" (29/08/2026) : passé d'un simple label texte à un bloc
          teinté terracotta avec grand guillemet décoratif, pour ancrer visuellement que c'est la
          voix personnelle de Soumia qui parle — texte lui-même strictement inchangé. */}
      <div className="bg-lve-terracotta-bg py-16 sm:py-20 px-6">
        <div className="max-w-3xl mx-auto px-0 sm:px-2 relative">
          <Quote
            className="absolute -top-2 -left-1 sm:-left-8 text-lve-terracotta/25"
            size={72}
            strokeWidth={1.25}
            fill="currentColor"
          />
          <span
            className="relative inline-block text-xs uppercase tracking-[0.25em] text-white bg-lve-terracotta font-semibold rounded-full px-4 py-1.5 mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Le mot de la fondatrice
          </span>
          {/* Texte définitif de Soumia (23/08/2026) — ne plus modifier sans son accord. */}
          <h2
            className="relative text-3xl sm:text-4xl text-lve-charcoal leading-tight mb-6"
            style={{ fontFamily: "var(--font-title)" }}
          >
            Tout a commencé à 20 ans.
          </h2>
          <div
            className="relative text-lve-charcoal/80 leading-relaxed space-y-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <p>
              Mon histoire avec le voyage n&apos;a pas débuté sur les bancs de l&apos;école, mais
              plus tard, à l&apos;aube de mes 20 ans. C&apos;est à ce moment-là que j&apos;ai
              véritablement découvert ce que signifiait partir : l&apos;excitation du départ, la
              beauté des découvertes impromptues et ces émotions brutes qui restent gravées
              longtemps après le retour.
            </p>
            <p>
              Mais j&apos;ai aussi très vite fait l&apos;expérience de la réalité du voyageur
              moderne. Les heures infinies à chercher la bonne adresse, les dizaines d&apos;onglets
              ouverts, les avis contradictoires et cette charge mentale étouffante qui transforme la
              préparation en corvée. À force de vouloir tout optimiser, on en oubliait presque le
              plaisir d&apos;anticiper.
            </p>
            <p>
              C&apos;est de cette frustration qu&apos;est né Voyage des Émotions. J&apos;ai voulu
              créer l&apos;espace que j&apos;aurais aimé trouver : un endroit unique où tout est
              rassemblé, pensé avec soin et guidé par la sincérité. Mon objectif aujourd&apos;hui
              est simple : vous décharger de la recherche pour vous offrir des expériences
              sincères, à la hauteur de ce que vous venez chercher — de l&apos;émotion.
            </p>
          </div>
        </div>
      </div>

      {/* Piliers (29/08/2026) : trait fin remplacé par un badge numéroté rond terracotta + carte
          surélevée (fond blanc, ombre, hover lift) — plus de relief que 3 colonnes de texte nu. */}
      <div className="bg-lve-ivory py-16 sm:py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.title}
              className="text-center sm:text-left bg-white rounded-2xl p-6 shadow-sm border border-lve-terracotta-bg transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className="w-9 h-9 rounded-full bg-lve-terracotta text-white flex items-center justify-center mb-4 mx-auto sm:mx-0 font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {i + 1}
              </div>
              <h3
                className="text-xl text-lve-charcoal mb-3"
                style={{ fontFamily: "var(--font-title)" }}
              >
                {pillar.title}
              </h3>
              <p
                className="text-sm text-lve-charcoal/70 leading-relaxed"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-lve-charcoal py-20 sm:py-28 px-6 text-center">
        {/* Citation reprise telle quelle de la section Manifeste de l'accueil (déjà rédigée et en
            place sur le site) plutôt qu'inventée pour cette page — même voix, pas de nouveau texte
            fabriqué. Trait terracotta ajouté (29/08/2026) pour casser le bloc sombre uni. */}
        <div className="w-12 h-1 bg-lve-terracotta rounded-full mx-auto mb-8" />
        <p
          className="text-lve-ivory max-w-2xl mx-auto leading-snug"
          style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)" }}
        >
          « Un regard humain, des adresses incarnées et la vérité de l&apos;expérience. »
        </p>
      </div>

      <div
        className="py-20 sm:py-28 px-6 text-center"
        style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%, var(--lve-terracotta-bg), var(--lve-ivory))" }}
      >
        <Link
          href="/questionnaire"
          className="inline-block bg-lve-terracotta hover:bg-lve-terracotta-dark text-white font-medium text-[11px] tracking-widest uppercase px-8 py-4 rounded-lg shadow-md transition-all hover:-translate-y-0.5 no-underline"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Lancer Travel Match
        </Link>
      </div>
    </div>
  );
}
