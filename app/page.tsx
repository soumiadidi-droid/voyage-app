import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroLandingPage, type DemoItem } from "./components/HeroLandingPage";
import { CarnetCard } from "./components/CarnetCard";
import { getCarnets } from "@/lib/carnets";
import { getDestinations } from "@/lib/travel-match/data";
import { DESTINATION_HERO_IMAGE } from "@/lib/hero-images";
import { ARCHETYPES, SCORE_AXES, type ScoreAxis } from "./components/TravelerProfileCard";
import type { Destination } from "@/lib/travel-match/types";

// Relue en base à la requête (03/09/2026), comme /carnets : l'accueil affiche les 4 carnets mis
// en avant et le compteur "Voir les N carnets". Laissée statique, elle pouvait annoncer un nombre
// différent de celui affiché par /carnets après un ajout en base (cache de build).
export const dynamic = "force-dynamic";

// Canonique de l'accueil (03/09/2026) — posée page par page et pas sur le layout racine, où elle
// serait héritée par toutes les pages enfant qui ne la redéfinissent pas.
export const metadata = {
  alternates: { canonical: "/" },
};

// 5 puces = les 5 vrais "profils voyageur" (mêmes archétypes/textes validés que TravelerProfileCard,
// affichés sur /resultat) — décidé le 31/08/2026, reskin teaser sombre. Emoji cosmétique par axe
// pour le libellé du bouton, pas dans les textes validés eux-mêmes.
const AXIS_EMOJI: Record<ScoreAxis, string> = {
  repos: "🌿",
  exploration: "🎨",
  gastronomie: "🍷",
  nature_plage: "🌊",
  effervescence_urbaine: "🏙️",
};

// Décoratif (31/08/2026) — pas un vrai calcul, pas de réponses utilisateur dans cette démo.
const AXIS_MATCH_SCORE: Record<ScoreAxis, number> = {
  repos: 97,
  exploration: 94,
  gastronomie: 98,
  nature_plage: 96,
  effervescence_urbaine: 95,
};

// Habillage "teaser" par archétype (demande Soumia après retour sur la 1ère version qui donnait
// directement la destination + l'hôtel exacts, "l'utilisateur a déjà la réponse") — copy générique
// par type d'expérience, jamais le nom de la vraie destination gagnante. Simplifié le 1er septembre
// 2026 : plus de ligne transport ni de pictos "tout-en-un" (carte "épurée", CTA unique — voir
// HeroLandingPage.tsx), seule la photo reste tirée de la vraie destination qui gagne l'axe.
const AXIS_TEASER: Record<ScoreAxis, { title: string; tag: string }> = {
  repos: {
    title: "Parenthèse Nature & Grand Calme",
    tag: "Refuge & Calme Absolu",
  },
  exploration: {
    title: "Toscane & Ateliers Secrets",
    tag: "Patrimoine & Savoir-faire",
  },
  gastronomie: {
    title: "Route des Saveurs & Tables d'Exception",
    tag: "Terroir & Gastronomie",
  },
  nature_plage: {
    title: "Sentiers Sauvages & Horizon Marin",
    tag: "Grands Espaces & Mer",
  },
  effervescence_urbaine: {
    title: "City-Trip Design & Effervescence",
    tag: "Énergie Urbaine & Architecture",
  },
};

// Override photo teaser (1er septembre 2026, demande Soumia) — indépendant du calcul "meilleure
// destination réelle sur l'axe" (celui-ci reste la source pour tag/label/matchScore) : juste
// l'image affichée. "new-york" est une vraie destination du catalogue (DESTINATION_HERO_IMAGE), les
// autres sont de vraies photos Unsplash vérifiées, pas rattachées à une destination précise du
// catalogue — cohérent avec le teaser qui ne montre que l'ambiance.
const AXIS_HERO_IMAGE_OVERRIDE: Partial<Record<ScoreAxis, string>> = {
  // Philipp Deus — https://unsplash.com/photos/ocean-wave-crashing-with-water-splashing-Nu3xicKn_ZY
  nature_plage: "https://images.unsplash.com/photo-1774124941123-0d07a1546b57?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  effervescence_urbaine: DESTINATION_HERO_IMAGE["new-york"],
};

// Score dérivé d'une destination sur un axe d'archétype — même règle que
// TravelerProfileCard.derivedAxisScores (nature_plage = MAX(nature, plage)), appliquée ici aux
// scores d'une destination plutôt qu'aux réponses d'un utilisateur (même forme de données).
function destinationAxisScore(scores: Destination["scores"], axis: ScoreAxis): number {
  return axis === "nature_plage" ? Math.max(scores.nature, scores.plage) : scores[axis];
}

// Pour chaque archétype, la vraie destination du catalogue qui le représente le mieux (score max
// sur l'axe) — calculé dynamiquement, jamais choisi/inventé à la main : reste correct même si le
// catalogue évolue. `excluded` évite qu'une même destination gagne 2 archétypes à la fois (ex.
// Crète en tête à la fois sur repos et nature_plage) : sans ça, la démo montrait la même
// destination sur 2 des 5 puces, moins parlant pour montrer la variété du catalogue — on garde
// quand même la meilleure réelle sur l'axe, juste parmi les destinations pas déjà utilisées.
function bestDestinationForAxis(destinations: Destination[], axis: ScoreAxis, excluded: Set<string>): Destination {
  const pool = destinations.filter((d) => !excluded.has(d.id));
  const candidates = pool.length > 0 ? pool : destinations;
  return candidates.reduce((best, d) =>
    destinationAxisScore(d.scores, axis) > destinationAxisScore(best.scores, axis) ? d : best
  );
}

async function buildDemoItems(): Promise<DemoItem[]> {
  const destinations = await getDestinations();
  if (destinations.length === 0) return [];

  const usedIds = new Set<string>();
  const items: DemoItem[] = [];
  for (const axis of SCORE_AXES) {
    // La vraie destination qui gagne l'axe sert uniquement à choisir la photo (ambiance réelle) —
    // jamais affichée par son nom (teaser, voir AXIS_TEASER ci-dessus).
    const destination = bestDestinationForAxis(destinations, axis, usedIds);
    usedIds.add(destination.id);
    const archetype = ARCHETYPES[axis];
    const teaser = AXIS_TEASER[axis];

    items.push({
      id: axis,
      label: `${AXIS_EMOJI[axis]} ${archetype.title}`,
      tag: teaser.tag,
      badge: archetype.subtitle,
      matchScore: AXIS_MATCH_SCORE[axis],
      destinationTitle: teaser.title,
      heroImage: AXIS_HERO_IMAGE_OVERRIDE[axis] ?? DESTINATION_HERO_IMAGE[destination.content_slug],
    });
  }
  return items;
}

export default async function Home() {
  const [demoItems, carnets] = await Promise.all([buildDemoItems(), getCarnets()]);
  // 4 carnets mis en avant : getCarnets() trie déjà les destinations vécues en premier, donc on
  // met en avant la preuve de terrain, pas un choix au hasard (03/09/2026).
  const featured = carnets.slice(0, 4);

  return (
    <div>
      {/* Ancien hero photo (aile d'avion + "Le voyage qui vous ressemble existe déjà.") remplacé
          le 31/08/2026 par HeroLandingPage — fusion hero + démo interactive, habillage fourni par
          Soumia. La photo d'avion (public/images/hero-accueil.jpg) n'est plus utilisée sur cette
          page — signalé explicitement, cf. message de fin de tour, à remettre si ce n'était pas
          l'intention en remplaçant ce composant. */}
      {demoItems.length > 0 && <HeroLandingPage items={demoItems} />}

      <main className="max-w-4xl mx-auto px-6 sm:px-8">
        <div className="my-16 sm:my-24 -mx-6 sm:-mx-8 px-6 sm:px-8 py-20 bg-lve-ivory">
          <div className="max-w-4xl mx-auto space-y-8 text-left">
            <span
              className="text-xs uppercase tracking-[0.25em] text-lve-terracotta font-semibold block"
              style={{ fontFamily: "var(--font-display)" }}
            >
              À Propos — Le Manifeste
            </span>

            <h2
              className="text-3xl sm:text-4xl text-lve-charcoal leading-tight max-w-2xl"
              style={{ fontFamily: "var(--font-title)" }}
            >
              Un regard humain, des adresses incarnées et la vérité de l&apos;expérience.
            </h2>

            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2 text-lve-charcoal/80 text-base leading-relaxed"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <div>
                <p>
                  Derrière <strong className="font-medium text-lve-charcoal">Le Voyage des Émotions</strong>,
                  il y a une démarche singulière : capturer l&apos;essence d&apos;un lieu à travers la
                  photographie et le récit, sans la version lissée que l&apos;on retrouve partout.
                </p>
              </div>

              <div className="space-y-4">
                <p>Chaque destination bénéficie d&apos;une clarté absolue :</p>
                <ul className="space-y-3 text-sm border-l-2 border-lve-terracotta pl-4 list-none m-0">
                  <li>
                    <strong className="text-lve-charcoal">Testée :</strong> Vécue, approuvée et
                    photographiée sur le terrain.
                  </li>
                  <li>
                    <strong className="text-lve-charcoal">Curatée :</strong> Sélectionnée pour son
                    potentiel émotif et sa pertinence.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Récits & destinations à la une (03/09/2026) — jusqu'ici les 13 carnets n'étaient
            atteignables qu'en terminant le questionnaire : aucun accès direct depuis l'accueil,
            rien d'indexable. Accès direct aux fiches ici, liste complète sur /carnets. */}
        {featured.length > 0 && (
          <section className="my-16 sm:my-24">
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
                <div>
                  <span
                    className="text-xs uppercase tracking-[0.25em] text-lve-terracotta font-semibold block mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Récits &amp; destinations
                  </span>
                  <h2
                    className="text-3xl sm:text-4xl text-lve-charcoal leading-tight max-w-xl m-0"
                    style={{ fontFamily: "var(--font-title)" }}
                  >
                    À la une
                  </h2>
                </div>
                <Link
                  href="/carnets"
                  className="inline-flex items-center gap-2 no-underline text-sm text-lve-charcoal hover:text-lve-terracotta transition-colors border-b border-lve-charcoal/20 hover:border-lve-terracotta pb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Voir les {carnets.length} carnets
                  <ArrowRight size={15} strokeWidth={1.75} />
                </Link>
              </div>

              {/* 2x2 : cette section vit dans le conteneur max-w-4xl de l'accueil, 4 cartes sur
                  une seule ligne y seraient trop étroites pour que la photo respire. */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 list-none m-0 p-0">
                {featured.map((carnet) => (
                  <li key={carnet.slug}>
                    <CarnetCard carnet={carnet} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <div
          className="my-16 sm:my-24 -mx-6 sm:-mx-8 px-6 sm:px-8 py-20 bg-lve-ivory border-y border-lve-charcoal/5 text-center"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            <span
              className="text-xs uppercase tracking-[0.25em] text-lve-terracotta font-semibold block"
              style={{ fontFamily: "var(--font-display)" }}
            >
              9 questions — 2 minutes
            </span>

            {/* Synchronisé avec le hero du haut (29/08/2026) — les deux blocs avaient dérivé,
                repéré par Soumia. */}
            <h2
              className="text-3xl sm:text-5xl text-lve-charcoal leading-tight"
              style={{ fontFamily: "var(--font-title)" }}
            >
              Le voyage qui vous ressemble existe déjà.
            </h2>

            <p
              className="text-base sm:text-lg text-lve-charcoal/70 max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Votre match idéal et mes adresses, testées une par une.
            </p>

            <div className="pt-4">
              <Link
                href="/questionnaire"
                className="inline-block bg-lve-terracotta hover:bg-lve-terracotta-dark text-white text-xs uppercase tracking-[0.2em] font-medium px-8 py-4 rounded-lg shadow-md transition-all hover:-translate-y-0.5 no-underline"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Lancer Travel Match
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
