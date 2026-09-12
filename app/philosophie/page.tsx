import Link from "next/link";
import { Bookmark, Compass, Eye, Heart, Layers, Send, type LucideIcon } from "lucide-react";
import { getCarnets, getCompteursListe } from "@/lib/carnets";
import { EnTetePage } from "../components/EnTetePage";

// Relue en base à la requête depuis la section "Ma liste" (12/09/2026) : ses compteurs viennent de
// la base, et une page prérendue resservirait des chiffres périmés.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ma philosophie — Le Voyage des Émotions",
  alternates: { canonical: "/philosophie" },
};

// Même habillage que /pros (12/09/2026, demande de Soumia : "le même look and feel que On
// collabore") : colonne unique alignée à gauche, pastille terracotta, citation en italique à filet,
// surtitre + titre par section, cartes terracotta clair à icône ronde, dégradé en pied de page.
// Les textes n'ont pas bougé, seule la mise en page a changé.

// Textes définitifs validés par Soumia le 23/08/2026.
const PILLARS: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Tout au même endroit",
    description:
      "Libère ton esprit. Plus besoin de multiplier les onglets : retrouve l'inspiration, les itinéraires et les adresses pépites centralisés en un seul endroit.",
    icon: Layers,
  },
  {
    title: "La vérité de l'expérience",
    description:
      "Une sélection exigeante et incarnée. Pas de listes impersonnelles ou d'attrapes-touristes, uniquement des lieux qui ont une vraie âme.",
    icon: Eye,
  },
  {
    title: "À la hauteur de tes émotions",
    description:
      "Parce que chaque voyageur est unique, je connecte tes envies profondes aux destinations qui leur répondent, grâce à Travel Match.",
    icon: Heart,
  },
];

// Mêmes classes que les cartes "Option 1 / Option 2" de /pros.
const CARTE =
  "rounded-2xl bg-lve-terracotta-bg border border-lve-terracotta/20 p-6 transition-all hover:-translate-y-1 hover:shadow-md";
const PASTILLE_ICONE = "w-10 h-10 rounded-full bg-lve-terracotta text-white flex items-center justify-center mb-4";

function Surtitre({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-xs uppercase tracking-[0.25em] text-lve-terracotta-ink font-semibold mb-2"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {children}
    </span>
  );
}

function TitreSection({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-6 leading-tight text-lve-charcoal"
      style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2rem, 4.5vw, 2.8rem)" }}
    >
      {children}
    </h2>
  );
}

function Citation({ children }: { children: React.ReactNode }) {
  return (
    <p className="italic border-l-4 border-lve-terracotta pl-4 text-lve-charcoal/90" style={{ fontSize: "1.15rem" }}>
      {children}
    </p>
  );
}

export default async function PhilosophiePage() {
  const [carnets, { vecues, radar }] = await Promise.all([getCarnets(), getCompteursListe()]);

  // Les trois temps de la liste, chiffrés en direct — jamais écrits en dur.
  const ETAPES = [
    { verbe: "Je repère", chiffre: radar, detail: "adresses sur mon radar", icon: Bookmark },
    { verbe: "Je teste", chiffre: vecues, detail: "adresses vécues", icon: Compass },
    { verbe: "Je te recommande", chiffre: carnets.length, detail: "carnets ouverts", icon: Send },
  ];

  return (
    // Fond et encre claires fixes (relecture du 11/09/2026) : sections sur couleurs de marque fixes,
    // le texte ne doit pas suivre le mode sombre.
    <div className="surface-claire bg-lve-bg">
      {/* En-tête commun (13/09/2026). Chute = l'ancien grand titre de la page, mot pour mot ; ligne
          en capitales = le début de la citation du Manifeste de l'accueil. */}
      <EnTetePage
        avant="Ma "
        accent="philosophie"
        surtitre="Un regard humain, des adresses incarnées"
        chute="L'art du voyage raconté sans filtre, libéré de la charge de la recherche."
      />

      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
        <Surtitre>Le mot de la fondatrice</Surtitre>
        {/* Texte définitif de Soumia (23/08/2026) — ne plus modifier sans son accord. */}
        <TitreSection>Tout a commencé à 20 ans.</TitreSection>
        <div className="leading-relaxed space-y-4">
          <p>
            Mon histoire avec le voyage n&apos;a pas débuté sur les bancs de l&apos;école, mais plus
            tard, à l&apos;aube de mes 20 ans. C&apos;est à ce moment-là que j&apos;ai véritablement
            découvert ce que signifiait partir : l&apos;excitation du départ, la beauté des
            découvertes impromptues et ces émotions brutes qui restent gravées longtemps après le
            retour.
          </p>
          <p>
            Mais j&apos;ai aussi très vite fait l&apos;expérience de la réalité du voyageur moderne.
            Les heures infinies à chercher la bonne adresse, les dizaines d&apos;onglets ouverts, les
            avis contradictoires et cette charge mentale étouffante qui transforme la préparation en
            corvée. À force de vouloir tout optimiser, on en oubliait presque le plaisir
            d&apos;anticiper.
          </p>
          <p>
            C&apos;est de cette frustration qu&apos;est né Voyage des Émotions. J&apos;ai voulu créer
            l&apos;espace que j&apos;aurais aimé trouver : un endroit unique où tout est rassemblé,
            pensé avec soin et guidé par la sincérité. Mon objectif aujourd&apos;hui est simple : te
            décharger de la recherche pour t&apos;offrir des expériences sincères, à la hauteur de ce
            que tu viens chercher — de l&apos;émotion.
          </p>
        </div>
      </div>

      {/* "Ma liste" (12/09/2026, demande de Soumia) : la suite de son histoire, dictée par elle —
          je repère sans arrêt, je teste dès que je peux, et mes amis me demandent toujours où
          aller. Second chapitre, le mot de la fondatrice au-dessus reste intact. */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-10 sm:pb-14">
        <Surtitre>Et aujourd&apos;hui</Surtitre>
        <TitreSection>Et puis, il y a ma liste.</TitreSection>
        <div className="leading-relaxed space-y-4 mb-8">
          <p>
            Je regarde beaucoup. Je repère, je note, je garde de côté des endroits où je ne suis pas
            encore allée. Ma liste est interminable.
          </p>
          <p>Alors dès que je peux, je teste. Une table, un hôtel, une ville entière.</p>
          <p>
            Et quand j&apos;aime, je recommande. Mes amis le savent&nbsp;: c&apos;est à moi
            qu&apos;ils demandent où partir, où dormir, où aller manger.
          </p>
          <Citation>
            Un jour, je me suis dit&nbsp;: pourquoi garder tout ça pour quelques-uns&nbsp;? Ce site,
            c&apos;est ma liste, ouverte.
          </Citation>
        </div>

        <ol className="grid gap-6 sm:grid-cols-3 list-none m-0 p-0">
          {ETAPES.map(({ verbe, chiffre, detail, icon: Icon }, i) => (
            <li key={verbe} className={CARTE}>
              <div className={PASTILLE_ICONE}>
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <p
                className="mb-1 text-xs uppercase tracking-widest"
                style={{ color: "var(--lve-terracotta-ink)", fontFamily: "var(--font-display)" }}
              >
                {String(i + 1).padStart(2, "0")} · {verbe}
              </p>
              {/* Bricolage et pas Cormorant : ses chiffres à l'ancienne font lire "61" comme "6I". */}
              <span
                className="block text-4xl font-semibold leading-none mb-1 text-lve-terracotta-dark"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {chiffre}
              </span>
              <span className="text-sm text-lve-charcoal/75">{detail}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-10 sm:pb-14">
        <Surtitre>Au quotidien</Surtitre>
        <TitreSection>Ce qui me guide</TitreSection>
        {/* Une carte par ligne, icône à gauche : trois colonnes dans une colonne de lecture
            serraient les textes à cinq mots par ligne. */}
        <div className="grid gap-4">
          {PILLARS.map(({ title, description, icon: Icon }) => (
            <div key={title} className={`${CARTE} sm:flex sm:gap-5`}>
              <div className={`${PASTILLE_ICONE} shrink-0`}>
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <div>
                <h3
                  className="font-semibold mb-2 leading-tight text-lve-terracotta-dark"
                  style={{ fontFamily: "var(--font-title)", fontSize: "1.6rem" }}
                >
                  {title}
                </h3>
                <p className="leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
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
