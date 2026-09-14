import Link from "next/link";
import { PromesseTravelMatch } from "@/app/components/PromesseTravelMatch";
import { HeroLandingPage, type DemoItem } from "./components/HeroLandingPage";
import { TRAVEL_MATCH_QUESTIONS } from "@/lib/travel-match/questionnaire";
import { ARCHETYPES, SCORE_AXES, type ScoreAxis } from "./components/TravelerProfileCard";

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
// affichés sur /resultat) — décidé le 31/08/2026, reskin teaser sombre. Emojis retirés le 14/09/2026.

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
// HeroLandingPage.tsx). La photo vient des cartes du questionnaire depuis le 11/09/2026 (voir
// AXIS_CARD_KEY).
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

// Photo du hero par archétype (11/09/2026, demande Soumia) : les mêmes photos que les cartes
// d'envies du questionnaire, pour que l'accueil et le questionnaire partagent une seule ambiance
// (lumière chaude et douce, photos choisies une par une par Soumia). Remplace la photo de la
// destination du catalogue qui gagnait l'axe : L'Âme Curieuse et L'Électron Urbain tombaient tous
// les deux sur New York. L'Âme Tranquille n'a pas de carte à elle ("Déconnecter" a été retirée) :
// elle prend celle de "Lâcher prise". Changer une photo de carte change donc aussi l'accueil.
const AXIS_CARD_KEY: Record<ScoreAxis, string> = {
  repos: "plage",
  exploration: "exploration",
  gastronomie: "gastronomie",
  nature_plage: "nature",
  effervescence_urbaine: "effervescence_urbaine",
};

function cardImageForAxis(axis: ScoreAxis): string | undefined {
  const intentions = TRAVEL_MATCH_QUESTIONS.find((q) => q.type === "cards");
  if (intentions?.type !== "cards") return undefined;
  const card = intentions.cards.find((c) => c.key === AXIS_CARD_KEY[axis]);
  // Les cartes sont servies en 1200px de large, le hero est plein écran.
  return card?.image.replace("w=1200", "w=2400");
}

function buildDemoItems(): DemoItem[] {
  return SCORE_AXES.map((axis) => {
    const archetype = ARCHETYPES[axis];
    const teaser = AXIS_TEASER[axis];
    return {
      id: axis,
      label: archetype.title,
      tag: teaser.tag,
      badge: archetype.subtitle,
      matchScore: AXIS_MATCH_SCORE[axis],
      destinationTitle: teaser.title,
      heroImage: cardImageForAxis(axis),
    };
  });
}

export default function Home() {
  // Section "Récits & destinations à la une" retirée le 03/09/2026, après que Soumia l'a vue en
  // preview : afficher les vraies destinations sur l'accueil révèle la réponse du Travel Match
  // avant que le visiteur ne le passe. Même raison que le retrait du nom des destinations sur la
  // carte teaser du hero le 01/09/2026. Ne pas la remettre sans son accord explicite.
  const demoItems = buildDemoItems();

  return (
    <div>
      {/* Ancien hero photo (aile d'avion + "Le voyage qui te ressemble existe déjà.") remplacé
          le 31/08/2026 par HeroLandingPage — fusion hero + démo interactive, habillage fourni par
          Soumia. La photo d'avion (public/images/hero-accueil.jpg) n'est plus utilisée sur cette
          page — signalé explicitement, cf. message de fin de tour, à remettre si ce n'était pas
          l'intention en remplaçant ce composant. */}
      {demoItems.length > 0 && <HeroLandingPage items={demoItems} />}

      <main className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Sable doux (11/09/2026, demande Soumia — "trop blanc, pas assez de contraste") : l'ivoire
            d'avant (#faf6f0) était indiscernable du fond de page (#faf7f0), et depuis le header
            clair la page n'était plus qu'un seul aplat crème. Le Manifeste en sable, le bloc CTA
            en crème et le footer sombre redonnent un rythme.
            Couleur pleine et encre claire fixes (relecture du 11/09/2026) : en transparence sur le
            fond de page, le sable virait au brun terne en mode sombre et le texte y disparaissait. */}
        <div
          className="surface-claire my-16 sm:my-24 -mx-6 sm:-mx-8 px-6 sm:px-8 py-20"
          style={{ background: "var(--surface-sand)" }}
        >
          <div className="max-w-4xl mx-auto space-y-8 text-left">
            <span
              className="text-xs uppercase tracking-[0.25em] text-lve-terracotta-ink font-semibold block"
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
              className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2 text-lve-charcoal/90 text-base leading-relaxed"
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
                  {/* Même vocabulaire que les étiquettes des adresses (relecture du 11/09/2026) :
                      "Testée / Curatée" ici, "J'ai testé / Sur mon radar" sur les fiches, deux
                      mots pour la même idée. */}
                  <li>
                    <strong className="text-lve-charcoal">J&apos;ai testé :</strong> vécue, approuvée
                    et photographiée sur le terrain.
                  </li>
                  <li>
                    <strong className="text-lve-charcoal">Sur mon radar :</strong> sélectionnée pour
                    son potentiel émotif et sa pertinence.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div
          className="my-16 sm:my-24 -mx-6 sm:-mx-8 px-6 sm:px-8 py-20 text-center"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Couleurs de thème (relecture du 11/09/2026) : ce bloc est posé sur le fond de page,
                son texte doit suivre le mode sombre — en Charcoal fixe, il disparaissait sur fond
                presque noir. 8 questions : le parcours en compte 8 depuis les cartes d'envies. */}
            <span
              className="text-xs uppercase tracking-[0.25em] font-semibold block"
              style={{ fontFamily: "var(--font-display)", color: "var(--accent-text)" }}
            >
              8 questions — 2 minutes
            </span>

            {/* Synchronisé avec le hero du haut (29/08/2026) — les deux blocs avaient dérivé,
                repéré par Soumia. */}
            <h2
              className="text-3xl sm:text-5xl text-text leading-tight"
              style={{ fontFamily: "var(--font-title)" }}
            >
              Le voyage qui te ressemble existe déjà.
            </h2>

            <p
              className="text-base sm:text-lg text-text/80 max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ton match idéal et mes adresses, testées une par une.
            </p>

            <div className="pt-4">
              <Link href="/questionnaire" className="btn-principal">
                Lancer Travel Match
              </Link>
              <PromesseTravelMatch className="mt-3 justify-center" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
