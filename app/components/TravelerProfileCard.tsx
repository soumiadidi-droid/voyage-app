import type { UserAnswers } from "@/lib/travel-match/types";

// "Profil Voyageur" sur /resultat — décidé le 23/08/2026 (reste à faire noté dans CLAUDE.md depuis
// la refonte du moteur Travel Match du 22/08). Titre d'archétype + phrase d'intro + pills calculés
// à partir des VRAIES réponses (answers.scores/filters), pas mockés. Les 5 titres/intros
// d'archétype sont les textes définitifs rédigés et validés par Soumia le 23/08/2026 (voir
// ARCHETYPES plus bas) ; seul le libellé des pills reste une première passe de Claude.

type Pill = { emoji: string; label: string };

const SCORE_AXES = ["repos", "exploration", "gastronomie", "nature_plage", "effervescence_urbaine"] as const;
type ScoreAxis = (typeof SCORE_AXES)[number];

const SCORE_PILLS: Record<ScoreAxis, Pill> = {
  repos: { emoji: "🧘", label: "Détente & Ressourcement" },
  exploration: { emoji: "🧭", label: "Exploration & Découverte" },
  gastronomie: { emoji: "🍷", label: "Gastronomie & Terroir" },
  nature_plage: { emoji: "🌊", label: "Nature & Littoral" },
  effervescence_urbaine: { emoji: "🏙️", label: "Énergie Urbaine" },
};

const BUDGET_PILLS: Record<UserAnswers["filters"]["budget"], Pill> = {
  eco: { emoji: "🎒", label: "Bons Plans" },
  confort: { emoji: "🏡", label: "Hôtels de Charme" },
  premium: { emoji: "✨", label: "Expérience Premium" },
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
  if (answers.scores.rythme >= 4) pills.push({ emoji: "⚡", label: "Rythme Soutenu" });
  if (answers.scores.rythme <= 2) pills.push({ emoji: "🌿", label: "Rythme Modéré" });
  pills.push(BUDGET_PILLS[answers.filters.budget]);
  if (answers.filters.sport_level === "actif") pills.push({ emoji: "🏄", label: "Sport & Aventure" });
  return pills;
}

export function TravelerProfileCard({ answers }: { answers: UserAnswers }) {
  const archetype = ARCHETYPES[topAxis(answers.scores)];
  const pills = buildPills(answers);

  return (
    <div className="bg-lve-sand/20 border border-lve-border/60 rounded-2xl p-6 md:p-8 mb-12">
      <p className="text-[11px] tracking-widest text-lve-terracotta-dark font-medium mb-3">
        VOTRE PROFIL TRAVEL MATCH
      </p>
      <h2
        className="font-semibold mb-3"
        style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}
      >
        {archetype.title}
      </h2>
      <p className="leading-relaxed mb-5" style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
        {archetype.intro}
      </p>
      <div className="flex flex-wrap gap-2">
        {pills.map((pill, i) => (
          <span
            key={i}
            className="bg-white/80 text-lve-charcoal text-xs px-3 py-1.5 rounded-full border border-lve-border/40 shadow-sm font-medium"
          >
            {pill.emoji} {pill.label}
          </span>
        ))}
      </div>
    </div>
  );
}
