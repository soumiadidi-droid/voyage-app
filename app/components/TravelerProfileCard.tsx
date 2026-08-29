import {
  Moon,
  Compass,
  UtensilsCrossed,
  Waves,
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
  nature_plage: { icon: Waves, label: "Nature & Littoral" },
  effervescence_urbaine: { icon: Building2, label: "Énergie Urbaine" },
};

const BUDGET_PILLS: Record<UserAnswers["filters"]["budget"], Pill> = {
  eco: { icon: Backpack, label: "Bons Plans" },
  confort: { icon: Home, label: "Hôtels de Charme" },
  premium: { icon: Sparkles, label: "Expérience Premium" },
};

type Archetype = { title: string; intro: string };

// Textes définitifs validés par Soumia le 23/08/2026 — ne plus modifier sans son accord.
const ARCHETYPES: Record<ScoreAxis, Archetype> = {
  repos: {
    title: "Le Refuge Contemplatif",
    intro:
      "Un séjour pensé pour ralentir, déconnecter et privilégier des adresses intimistes, entre parenthèses bien-être et douceur de vivre.",
  },
  exploration: {
    title: "L'Esthète Curieux",
    intro:
      "Un itinéraire conçu comme un voyage de découvertes, mêlant patrimoine d'exception, savoir-faire locaux et pépites culturelles méconnues.",
  },
  gastronomie: {
    title: "Le Gourmet Épicurien",
    intro:
      "Un carnet de route articulé autour des plaisirs de la table, des rencontres avec des producteurs passionnés et de grandes expériences culinaires.",
  },
  nature_plage: {
    title: "L'Épicurien de l'Océan",
    intro:
      "Un séjour pensé pour concilier immersion en pleine nature, grands espaces préservés, gastronomie locale et parenthèses bien-être.",
  },
  effervescence_urbaine: {
    title: "Le Flâneur Élégant",
    intro:
      "Une immersion au cœur de destinations vivantes, pour capter l'énergie des quartiers, les adresses créatives et l'art de vivre local.",
  },
};

function topAxis(scores: UserAnswers["scores"]): ScoreAxis {
  return SCORE_AXES.reduce<ScoreAxis>(
    (best, axis) => (scores[axis] > scores[best] ? axis : best),
    SCORE_AXES[0]
  );
}

function buildPills(answers: UserAnswers): Pill[] {
  const pills: Pill[] = [];
  for (const axis of SCORE_AXES) {
    if (answers.scores[axis] >= 4) pills.push(SCORE_PILLS[axis]);
  }
  if (answers.scores.rythme >= 4) pills.push({ icon: Zap, label: "Rythme Soutenu" });
  if (answers.scores.rythme <= 2) pills.push({ icon: Leaf, label: "Rythme Modéré" });
  pills.push(BUDGET_PILLS[answers.filters.budget]);
  if (answers.filters.sport_level === "actif") pills.push({ icon: Activity, label: "Sport & Aventure" });
  return pills;
}

export function TravelerProfileCard({ answers }: { answers: UserAnswers }) {
  const archetype = ARCHETYPES[topAxis(answers.scores)];
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
