import Link from "next/link";

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
      <div className="bg-lve-ivory pt-16 pb-6 sm:pt-20 sm:pb-8 px-6 text-center">
        <h1
          className="text-lve-charcoal leading-tight max-w-3xl mx-auto"
          style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2rem, 5vw, 3.2rem)" }}
        >
          L&apos;art du voyage raconté sans filtre, libéré de la charge de la recherche.
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 sm:px-8 pt-6 pb-16 sm:pt-8 sm:pb-24">
        {/* Texte définitif de Soumia (23/08/2026) — ne plus modifier sans son accord. */}
        <span
          className="text-xs uppercase tracking-[0.25em] text-lve-terracotta font-semibold block mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Le mot de la fondatrice
        </span>
        <h2
          className="text-3xl sm:text-4xl text-lve-charcoal leading-tight mb-6"
          style={{ fontFamily: "var(--font-title)" }}
        >
          Tout a commencé à 20 ans.
        </h2>
        <div
          className="text-lve-charcoal/80 leading-relaxed space-y-4"
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

      <div className="bg-lve-ivory py-16 sm:py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="text-center sm:text-left">
              <div className="w-10 h-0.5 bg-lve-terracotta mb-4 mx-auto sm:mx-0" />
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
            fabriqué. */}
        <p
          className="text-lve-ivory max-w-2xl mx-auto leading-snug"
          style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)" }}
        >
          « Un regard humain, des adresses incarnées et la vérité de l&apos;expérience. »
        </p>
      </div>

      <div className="bg-lve-ivory py-20 sm:py-28 px-6 text-center">
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
