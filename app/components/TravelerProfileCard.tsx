import {
  Moon,
  Compass,
  UtensilsCrossed,
  Mountain,
  Building2,
  Zap,
  Leaf,
  Backpack,
  Home,
  Sparkles,
  Activity,
  type LucideIcon,
} from "lucide-react";
import type { UserAnswers } from "@/lib/travel-match/types";

// "Profil Voyageur" sur /resultat — décidé le 23/08/2026 (reste à faire noté dans CLAUDE.md depuis
// la refonte du moteur Travel Match du 22/08). Titre d'archétype + phrase d'intro + pills calculés
// à partir des VRAIES réponses (answers.scores/filters), pas mockés. Les 5 titres/intros
// d'archétype sont les textes définitifs rédigés et validés par Soumia le 23/08/2026 (voir
// ARCHETYPES plus bas) ; seul le libellé des pills reste une première passe de Claude.
// Emojis → icônes au trait (27/08/2026, refonte visuelle "magazine premium") : le libellé de
// chaque pill reste identique, seul le rendu de l'icône change.

type Pill = { icon: LucideIcon; label: string };

const SCORE_AXES = ["repos", "exploration", "gastronomie", "nature_plage", "effervescence_urbaine"] as const;
type ScoreAxis = (typeof SCORE_AXES)[number];

const SCORE_PILLS: Record<ScoreAxis, Pill> = {
  repos: { icon: Moon, label: "Détente & Ressourcement" },
  exploration: { icon: Compass, label: "Exploration & Découverte" },
  gastronomie: { icon: UtensilsCrossed, label: "Gastronomie & Terroir" },
  // Icône + libellé neutralisés le 30/08/2026 (demande Soumia) : "Nature & Littoral" + Waves
  // étaient trop marqués mer pour un profil calculé sur MAX(nature, plage) — un profil 100%
  // montagne pouvait recevoir ce badge. Mountain reste un choix imparfait (penche visuellement
  // montagne plutôt que neutre), mais moins trompeur qu'une vague pour un profil plage.
  nature_plage: { icon: Mountain, label: "Grands Espaces" },
  effervescence_urbaine: { icon: Building2, label: "Énergie Urbaine" },
};

const BUDGET_PILLS: Record<UserAnswers["filters"]["budget"], Pill> = {
  eco: { icon: Backpack, label: "Bons Plans" },
  confort: { icon: Home, label: "Hôtels de Charme" },
  premium: { icon: Sparkles, label: "Expérience Premium" },
};

type Archetype = { title: string; subtitle: string; intro: string };

// Textes définitifs validés par Soumia le 29/08/2026 (réécriture complète — les titres/intros du
// 23/08/2026 sont remplacés, plume plus incarnée/sensible, + nouveau champ `subtitle`) — ne plus
// modifier sans son accord. Mêmes 5 clés/axes qu'avant, aucun changement côté moteur de scoring.
const ARCHETYPES: Record<ScoreAxis, Archetype> = {
  repos: {
    title: "La Parenthèse Intimiste",
    subtitle: "Déconnexion choisie & adresses secrètes",
    intro:
      "Tu ne pars pas pour accumuler des visites, mais pour ralentir le temps. Ton luxe ultime ? Une adresse enveloppante, du calme absolu, une belle lumière du soir et zéro contrainte horaire. Un séjour pensé comme un cocon où l'on débranche tout pour réapprendre à savourer le moment présent.",
  },
  exploration: {
    title: "L'Âme Curieuse",
    subtitle: "Savoir-faire, histoire & pépites hors-piste",
    intro:
      "Les itinéraires tout faits très peu pour toi. Ce qui te fait vibrer, c'est l'authenticité brute : rencontrer un artisan passionné au détour d'une ruelle, dénicher une pépite patrimoniale cachée et comprendre l'histoire d'un lieu à travers ceux qui le font vivre.",
  },
  gastronomie: {
    title: "La Quête Hédoniste",
    subtitle: "Tables vibrantes, terroir & bons flacons",
    intro:
      "Pour toi, une destination se découvre d'abord avec le palais. Du néobistro inspiré à la table de village authentique, en passant par le marché de producteurs locaux, tes journées sont rythmées par le plaisir de la table et l'art de recevoir. Le voyage gourmand dans toute sa noblesse.",
  },
  nature_plage: {
    title: "Le Souffle Sauvage",
    // Texte ajusté le 30/08/2026 (demande Soumia) : la version précédente était trop marquée
    // littoral/embruns pour un profil calculé sur MAX(nature, plage) — un profil 100% montagne
    // (nature=5, plage=1) obtenait quand même ce texte. Vocabulaire neutralisé vers grand air/
    // éléments/horizons, plus aucun terme exclusivement maritime (iodé, embruns, vagues).
    subtitle: "Grands espaces, éléments & horizon",
    intro:
      "Ton équilibre passe par la nature et le grand air. Que ce soit une crête balayée par le vent, un sommet silencieux ou une crique sauvage loin de la foule, tu cherches l'apaisement par l'horizon. Une immersion brute dans les éléments pour faire le plein d'énergie.",
  },
  effervescence_urbaine: {
    title: "L'Électron Urbain",
    subtitle: "Quartiers vivants, design & effervescence",
    intro:
      "Tu aimes sentir le pouls d'une ville qui bouge. Les coffee shops de spécialité, les galeries inspirantes, le design affirmé et les terrasses baignées de lumière : tu flânes l'esprit ouvert pour capturer l'énergie unique des plus beaux quartiers citadins.",
  },
};

// Depuis le split nature_plage → nature/plage (29/08/2026, demande Soumia), l'archétype et les
// pills restent au nombre de 5 (décision explicite : pas de 6e archétype pour la plage) — on
// dérive un "nature_plage" synthétique = MAX(nature, plage) pour réutiliser tel quel le système
// existant. Max plutôt que moyenne : un profil marqué sur un seul des deux (ex. nature=5/plage=1,
// montagnard pur) doit garder son intensité, une moyenne l'aurait fait passer sous le seuil des
// pills (>= 4). Choix de Claude, pas encore validé par Soumia.
function derivedAxisScores(scores: UserAnswers["scores"]): Record<ScoreAxis, number> {
  return {
    repos: scores.repos,
    exploration: scores.exploration,
    gastronomie: scores.gastronomie,
    nature_plage: Math.max(scores.nature, scores.plage),
    effervescence_urbaine: scores.effervescence_urbaine,
  };
}

function topAxis(scores: Record<ScoreAxis, number>): ScoreAxis {
  return SCORE_AXES.reduce<ScoreAxis>(
    (best, axis) => (scores[axis] > scores[best] ? axis : best),
    SCORE_AXES[0]
  );
}

function buildPills(answers: UserAnswers): Pill[] {
  const derived = derivedAxisScores(answers.scores);
  const pills: Pill[] = [];
  for (const axis of SCORE_AXES) {
    if (derived[axis] >= 4) pills.push(SCORE_PILLS[axis]);
  }
  if (answers.scores.rythme >= 4) pills.push({ icon: Zap, label: "Rythme Soutenu" });
  if (answers.scores.rythme <= 2) pills.push({ icon: Leaf, label: "Rythme Modéré" });
  pills.push(BUDGET_PILLS[answers.filters.budget]);
  if (answers.filters.sport_level === "actif") pills.push({ icon: Activity, label: "Sport & Aventure" });
  return pills;
}

// Exporté (30/08/2026) pour être réutilisé hors de la carte elle-même — EmailCapture a besoin du
// même titre d'archétype pour le récap envoyé par mail, sans dupliquer la logique de calcul.
export function getArchetypeTitle(answers: UserAnswers): string {
  return ARCHETYPES[topAxis(derivedAxisScores(answers.scores))].title;
}

export function TravelerProfileCard({ answers }: { answers: UserAnswers }) {
  const archetype = ARCHETYPES[topAxis(derivedAxisScores(answers.scores))];
  const pills = buildPills(answers);

  return (
    // Carnet/passeport (29/08/2026, demande Gemini — "univers graphique chaleureux et poétique")
    // : fond ivoire (plus blanc plat), double liseré terracotta façon page de passeport, grand
    // Compass en filigrane. Textes de l'archétype INCHANGÉS (validés par Soumia le 23/08/2026),
    // seul l'habillage visuel change.
    <div
      className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-12"
      style={{
        background: "var(--lve-ivory)",
        border: "1px solid var(--lve-terracotta)",
        boxShadow: "0 20px 40px -20px rgba(26, 26, 26, 0.12), inset 0 0 0 4px var(--lve-terracotta-bg)",
      }}
    >
      <Compass
        size={180}
        strokeWidth={0.75}
        className="pointer-events-none absolute -right-8 -top-8 opacity-[0.06]"
        style={{ color: "var(--lve-terracotta-dark)" }}
        aria-hidden="true"
      />
      <div className="relative">
        <span
          className="inline-flex items-center gap-2 text-[11px] tracking-widest font-medium uppercase text-white rounded-full px-3.5 py-1.5 mb-5"
          style={{ background: "var(--lve-terracotta)" }}
        >
          <Sparkles size={12} strokeWidth={2} />
          Votre profil Travel Match
        </span>
        <h2
          className="font-semibold mb-3"
          style={{
            fontFamily: "var(--font-title)",
            fontSize: "clamp(2rem, 4.5vw, 2.8rem)",
            color: "var(--lve-terracotta-dark)",
          }}
        >
          {archetype.title}
        </h2>
        {/* Sous-titre (29/08/2026, nouveau champ de la réécriture) : tagline courte, pas en
            italique pour se distinguer visuellement du corps de texte juste en dessous. */}
        <p
          className="mb-4 font-medium"
          style={{ color: "var(--lve-terracotta-dark)", fontSize: "0.95rem", fontFamily: "var(--font-display)" }}
        >
          {archetype.subtitle}
        </p>
        <p className="leading-relaxed mb-5 italic" style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
          {archetype.intro}
        </p>
        <div className="flex flex-wrap gap-2">
          {pills.map(({ icon: Icon, label }, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white"
              style={{ color: "var(--lve-terracotta-dark)" }}
            >
              <Icon size={14} strokeWidth={1.75} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
