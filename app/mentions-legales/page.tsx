// Mentions légales (10/09/2026) — rédigées après le grillage du 09/09.
//
// Choix assumé de Soumia : son nom n'apparaît pas. La loi l'autorise pour un site personnel non
// professionnel, à condition d'indiquer l'hébergeur et d'avoir communiqué son identité à celui-ci
// (LCEN, art. 6 III 2). Ce choix devra être revu au premier partenariat rémunéré ou lien
// d'affiliation : à partir de là le site devient commercial et l'identité complète est obligatoire.
export const metadata = {
  title: "Mentions légales — Le Voyage des Émotions",
};

const SECTIONS = [
  {
    title: "Éditeur du site",
    body: [
      "Le Voyage des Émotions — levoyagedesemotions.fr",
      "Site personnel à but non professionnel, édité par une personne physique dont l'identité a été communiquée à l'hébergeur, conformément à l'article 6 III 2 de la loi pour la confiance dans l'économie numérique.",
      "Contact : contact@levoyagedesemotions.fr",
    ],
  },
  {
    title: "Hébergement",
    body: [
      "Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.",
      "Les contenus du site (destinations, adresses) sont stockés dans une base de données hébergée par Neon Inc. au sein de l'Union européenne.",
      "L'envoi des emails est assuré par Resend (Plus Five Five, Inc.), avec des serveurs situés en Irlande.",
    ],
  },
  {
    title: "Propriété intellectuelle",
    body: [
      "Les textes, les récits et les photographies publiés sur ce site sont des créations originales. Toute reproduction, même partielle, sans autorisation préalable est interdite.",
      "Les marques, noms d'établissements et logos cités appartiennent à leurs propriétaires respectifs. Leur mention relève du droit de citation et ne suppose aucun lien commercial, sauf lorsque c'est explicitement indiqué sur la page concernée.",
    ],
  },
  {
    title: "Responsabilité",
    body: [
      "Les adresses recommandées le sont à titre personnel, sur la base d'une expérience vécue ou d'une sélection documentée, toujours signalée comme telle. Elles peuvent fermer, changer de propriétaire ou évoluer sans que ce site en soit informé.",
      "Les liens vers des sites tiers sont fournis pour votre commodité : leur contenu n'engage que leurs éditeurs.",
    ],
  },
  {
    title: "Données personnelles",
    body: [
      "Le traitement des données personnelles est décrit sur la page Confidentialité.",
    ],
  },
];

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
      <h1
        className="font-extrabold mb-10"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)" }}
      >
        Mentions légales
      </h1>

      {SECTIONS.map((section) => (
        <section key={section.title} className="mb-10">
          <h2
            className="mb-3 text-lg font-semibold"
            style={{ fontFamily: "var(--font-title)", color: "var(--lve-charcoal)" }}
          >
            {section.title}
          </h2>
          {section.body.map((paragraph) => (
            <p key={paragraph} className="mb-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <p className="mt-14 text-xs" style={{ color: "var(--text-secondary)" }}>
        Dernière mise à jour : 10 septembre 2026.
      </p>
    </div>
  );
}
