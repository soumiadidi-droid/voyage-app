import Link from "next/link";
import { ArrowRight, Quote, Sparkles } from "lucide-react";
import { getCarnets, getCompteursListe } from "@/lib/carnets";
import { BADGE_LABEL } from "../components/CarnetCard";
import { PHOTO_GRADE } from "@/lib/photo-grade";

// Relue en base à la requête depuis la section "Ma liste" (12/09/2026) : ses compteurs et ses
// vignettes viennent de la base, et une page prérendue resservirait des chiffres périmés.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ma philosophie — Le Voyage des Émotions",
  alternates: { canonical: "/philosophie" },
};

// Textes définitifs validés par Soumia le 23/08/2026.
const PILLARS = [
  {
    title: "Tout au même endroit",
    description:
      "Libère ton esprit. Plus besoin de multiplier les onglets : retrouve l'inspiration, les itinéraires et les adresses pépites centralisés en un seul endroit.",
  },
  {
    title: "La vérité de l'expérience",
    description:
      "Une sélection exigeante et incarnée. Pas de listes impersonnelles ou d'attrapes-touristes, uniquement des lieux qui ont une vraie âme.",
  },
  {
    title: "À la hauteur de tes émotions",
    description:
      "Parce que chaque voyageur est unique, je connecte tes envies profondes aux destinations qui leur répondent, grâce à Travel Match.",
  },
];

// Inclinaisons des trois vignettes empilées de la section "Ma liste" — un carnet posé sur la table,
// pas une grille.
const TILTS = ["-rotate-6", "rotate-3", "-rotate-2"];

export default async function PhilosophiePage() {
  const [carnets, { vecues, radar }] = await Promise.all([getCarnets(), getCompteursListe()]);
  // Une vignette vécue et, s'il en existe, une repérée : la pile montre les deux moitiés de la liste.
  const vecus = carnets.filter((c) => c.badge === "tested_approved");
  const reperes = carnets.filter((c) => c.badge !== "tested_approved");
  const vignettes = [vecus[0], reperes[0], vecus[1]].filter((c) => c !== undefined);
  while (vignettes.length < 3 && carnets[vignettes.length]) vignettes.push(carnets[vignettes.length]);

  const ETAPES = [
    { verbe: "Je repère", chiffre: radar, detail: "adresses sur mon radar", couleur: "var(--lve-slate-dark)" },
    { verbe: "Je teste", chiffre: vecues, detail: "adresses vécues", couleur: "var(--lve-sage-dark)" },
    { verbe: "Je te recommande", chiffre: carnets.length, detail: "carnets ouverts", couleur: "var(--lve-terracotta-ink)" },
  ];

  return (
    // Fond et encre claires fixes (relecture du 11/09/2026) : sections sur couleurs de marque fixes,
    // le texte ne doit pas suivre le mode sombre.
    <div className="surface-claire bg-lve-bg">
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
              est simple : te décharger de la recherche pour t&apos;offrir des expériences
              sincères, à la hauteur de ce que tu viens chercher — de l&apos;émotion.
            </p>
          </div>
        </div>
      </div>

      {/* "Ma liste" (12/09/2026, demande de Soumia) : la suite de son histoire, dictée par elle —
          je repère sans arrêt, je teste dès que je peux, et mes amis me demandent toujours où
          aller. Le mot de la fondatrice au-dessus reste intact ; ceci est un second chapitre.
          Les chiffres viennent de la base, jamais inventés. */}
      <div className="bg-lve-sand/60 py-16 sm:py-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-16 items-center">
          <div>
            <span
              className="inline-block text-xs uppercase tracking-[0.25em] text-lve-terracotta-ink font-semibold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Et aujourd&apos;hui
            </span>
            <h2
              className="text-3xl sm:text-4xl text-lve-charcoal leading-tight mb-6"
              style={{ fontFamily: "var(--font-title)" }}
            >
              Et puis, il y a ma liste.
            </h2>
            <div
              className="text-lve-charcoal/80 leading-relaxed space-y-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <p>
                Je regarde beaucoup. Je repère, je note, je garde de côté des endroits où je ne
                suis pas encore allée. Ma liste est interminable.
              </p>
              <p>Alors dès que je peux, je teste. Une table, un hôtel, une ville entière.</p>
              <p>
                Et quand j&apos;aime, je recommande. Mes amis le savent&nbsp;: c&apos;est à moi qu&apos;ils
                demandent où partir, où dormir, où aller manger.
              </p>
              <p className="text-lve-charcoal font-medium">
                Un jour, je me suis dit&nbsp;: pourquoi garder tout ça pour quelques-uns&nbsp;? Ce
                site, c&apos;est ma liste, ouverte.
              </p>
            </div>
          </div>

          {/* Trois photos posées en éventail, façon carnet : de vrais carnets du site, avec leur
              vrai statut. Légende = le pays, court, pour qu'aucune ne soit coupée ni recouverte. */}
          <div className="relative h-64 sm:h-80 mx-auto w-[92%] sm:w-full max-w-md" aria-hidden="true">
            {vignettes.map((c, i) => (
              <div
                key={c.slug}
                className={`absolute bg-white p-2.5 pb-9 shadow-xl ${TILTS[i]} w-36 sm:w-48`}
                style={{ left: `${i * 31}%`, top: ["10%", "0%", "16%"][i], zIndex: i === 1 ? 3 : i }}
              >
                <div
                  className="relative h-40 sm:h-52 bg-lve-border"
                  style={{
                    backgroundImage: `url('${c.image}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: PHOTO_GRADE.filtre,
                  }}
                >
                  <span
                    className={`absolute ${i === 2 ? "right-2" : "left-2"} top-2 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em]`}
                    style={{
                      fontFamily: "var(--font-display)",
                      ...(c.badge === "tested_approved"
                        ? { background: "var(--lve-sage-bg)", color: "var(--lve-sage-dark)" }
                        : {
                            background: "var(--lve-slate-bg)",
                            color: "var(--lve-slate-dark)",
                            border: "1px dashed var(--lve-slate-dark)",
                          }),
                    }}
                  >
                    {BADGE_LABEL[c.badge]}
                  </span>
                </div>
                <span
                  className="absolute bottom-2 left-3 right-3 text-lve-charcoal text-lg sm:text-xl leading-none truncate"
                  style={{ fontFamily: "var(--font-title)" }}
                >
                  {c.country}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Les trois temps de la liste, chiffrés en direct. */}
        <ol className="max-w-5xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 list-none p-0">
          {ETAPES.map((e, i) => (
            <li key={e.verbe} className="relative bg-white rounded-2xl p-6 shadow-sm text-center sm:text-left">
              <span
                className="block text-xs uppercase tracking-[0.2em] font-semibold mb-2"
                style={{ fontFamily: "var(--font-display)", color: e.couleur }}
              >
                {String(i + 1).padStart(2, "0")} · {e.verbe}
              </span>
              <span
                className="block text-5xl font-semibold text-lve-charcoal leading-none mb-2"
                // Bricolage et pas Cormorant : ses chiffres à l'ancienne font lire "61" comme "6I".
                style={{ fontFamily: "var(--font-display)" }}
              >
                {e.chiffre}
              </span>
              <span className="text-sm text-lve-charcoal/70" style={{ fontFamily: "var(--font-display)" }}>
                {e.detail}
              </span>
              {i < ETAPES.length - 1 && (
                <ArrowRight
                  className="hidden sm:block absolute -right-5 top-1/2 -translate-y-1/2 text-lve-terracotta z-10"
                  size={22}
                />
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* Piliers (29/08/2026) : trait fin remplacé par un badge numéroté rond terracotta + carte
          surélevée (fond blanc, ombre, hover lift) — plus de relief que 3 colonnes de texte nu.
          Habillage "passeport" de la carte profil de /resultat (11/09/2026, Soumia : "fade") :
          la bordure terracotta-bg était invisible sur l'ivoire, les cartes blanches se fondaient
          dans la section. Liseré terracotta + double filet intérieur, comme TravelerProfileCard. */}
      <div className="bg-lve-ivory py-16 sm:py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.title}
              className="text-center sm:text-left bg-white rounded-2xl p-6 transition-all hover:-translate-y-1"
              style={{
                border: "1px solid var(--lve-terracotta)",
                boxShadow: "0 20px 40px -24px rgba(26, 26, 26, 0.25), inset 0 0 0 4px var(--lve-terracotta-bg)",
              }}
            >
              <div
                className="w-9 h-9 rounded-full bg-lve-terracotta text-white flex items-center justify-center mb-4 mx-auto sm:mx-0 font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {i + 1}
              </div>
              <h3
                className="text-2xl font-semibold text-lve-terracotta-dark leading-tight mb-3"
                style={{ fontFamily: "var(--font-title)" }}
              >
                {pillar.title}
              </h3>
              <p
                className="text-[15px] text-lve-charcoal/85 leading-relaxed"
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
          {/* Espaces insécables dans les guillemets (relecture du 11/09/2026) : sur téléphone, le
              guillemet fermant partait seul sur sa ligne. */}
          «&nbsp;Un regard humain, des adresses incarnées et la vérité de l&apos;expérience.&nbsp;»
        </p>
      </div>

      <div
        className="py-20 sm:py-28 px-6 text-center"
        style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%, var(--lve-terracotta-bg), var(--lve-ivory))" }}
      >
        <Link href="/questionnaire" className="btn-principal">
          Lancer Travel Match
        </Link>
      </div>
    </div>
  );
}
