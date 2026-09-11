"use client";

import { useState } from "react";
import {
  CalendarDays, CalendarRange, Compass, PiggyBank, Wallet, Gem, Home, Plane, Globe, Sparkles,
  Sun, CloudSun, Snowflake, Footprints, TramFront, Car, Armchair, Mountain, User, Heart, Users,
  Baby, type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  TRAVEL_MATCH_QUESTIONS,
  FAMILY_PROFILE_QUESTION,
  type TravelMatchQuestion,
} from "@/lib/travel-match/questionnaire";
import { SCORE_KEYS, type ScoreKey } from "@/lib/travel-match/types";

// Immersion (29/08/2026, demande Gemini transmise par Soumia — "manque d'immersion, trop sondage
// plat") : icône contextuelle par option, clé "questionId:value" pour rester non-ambigu entre
// questions (ex. deux "actif" différents sur deux questions n'existent pas ici, mais la clé
// composée évite le risque). Couvre TOUTES les questions à choix, pas seulement l'exemple donné
// (durée) — une carte sans icône dans le lot aurait détonné visuellement.
// Icônes en trait fin plutôt qu'emojis (11/09/2026, demande de Soumia). Les emojis tiraient
// l'écran vers le bas à côté des cartes photo de l'écran d'intentions, et surtout ils ne se
// dessinent pas pareil d'un appareil à l'autre — la mise en page dépendait de glyphes système
// qu'on ne contrôle pas. Lucide est déjà utilisé sur les fiches et la page collaboration.
const OPTION_ICON: Record<string, LucideIcon> = {
  "duration:week_end": CalendarDays,
  "duration:semaine": CalendarRange,
  "duration:grand_voyage": Compass,
  "budget:eco": PiggyBank,
  "budget:confort": Wallet,
  "budget:premium": Gem,
  "distance:proche": Home,
  "distance:europe": Plane,
  "distance:long_courrier": Globe,
  "distance:ouvert": Sparkles,
  "climate:chaleur": Sun,
  "climate:douceur": CloudSun,
  "climate:hiver_cosy": Snowflake,
  "transport:sans_voiture": Footprints,
  "transport:transports_possibles": TramFront,
  "transport:voiture_necessaire": Car,
  "sport_level:tranquille": Armchair,
  "sport_level:actif": Mountain,
  "companions:solo": User,
  "companions:duo": Heart,
  "companions:amis": Users,
  "companions:famille": Baby,
};

// Convention typo française : espace avant "?" — remplacée par une espace insécable pour que le
// "?" ne se retrouve jamais seul sur sa ligne (demande Gemini). Fait à l'affichage plutôt que dans
// lib/travel-match/questionnaire.ts pour ne pas toucher le texte source des questions.
function withUnbreakableQuestionMark(text: string): string {
  return text.replace(/ \?$/, " ?");
}

// Titre court + explication (29/08/2026, demande Gemini) : certains labels d'option suivent déjà
// le format "Titre — explication" (ex. la question distance) — réutilisé plutôt que d'inventer une
// description pour les options qui n'en ont pas. Sans tiret, le label entier devient le titre,
// pas de ligne de description en dessous (rien à inventer).
function splitOptionLabel(label: string): { title: string; description?: string } {
  const [title, ...rest] = label.split(" — ");
  return rest.length > 0 ? { title, description: rest.join(" — ") } : { title };
}

type SliderAnswers = Record<ScoreKey, number>;

// Traduction des intentions en scores. C'est le seul endroit où la nouvelle interface touche au
// format attendu par le moteur : il reçoit exactement ce qu'il recevait du temps des curseurs.
const VALEUR_CHOISIE = 5;
const VALEUR_NEUTRE = 3;

function scoresDepuisIntentions(intentions: ScoreKey[]): SliderAnswers {
  const scores = {} as SliderAnswers;
  for (const key of SCORE_KEYS) scores[key] = intentions.includes(key) ? VALEUR_CHOISIE : VALEUR_NEUTRE;
  return scores;
}

// Insère FAMILY_PROFILE_QUESTION juste après "companions" seulement si "famille" a été choisi
// (27/08/2026) — sinon la question saute directement aux émotions, sans étape famille.
function getEffectiveQuestions(choices: Record<string, string>): TravelMatchQuestion[] {
  if (choices.companions !== "famille") return TRAVEL_MATCH_QUESTIONS;
  const companionsIndex = TRAVEL_MATCH_QUESTIONS.findIndex((q) => q.id === "companions");
  return [
    ...TRAVEL_MATCH_QUESTIONS.slice(0, companionsIndex + 1),
    FAMILY_PROFILE_QUESTION,
    ...TRAVEL_MATCH_QUESTIONS.slice(companionsIndex + 1),
  ];
}

export function QuestionnaireClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<Record<string, string>>({});
  // Axes choisis sur l'écran d'intentions (11/09/2026). Convertis en scores au moment de
  // l'envoi : choisi = 5, non choisi = 3 (la valeur neutre qu'avait le curseur par défaut).
  const [intentions, setIntentions] = useState<ScoreKey[]>([]);

  const effectiveQuestions = getEffectiveQuestions(choices);
  const question = effectiveQuestions[Math.min(step, effectiveQuestions.length - 1)];
  const isLast = step === effectiveQuestions.length - 1;
  const progress = Math.round(((step + 1) / effectiveQuestions.length) * 100);

  function submit(finalChoices: Record<string, string>, finalIntentions: ScoreKey[]) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(finalChoices)) params.set(key, value);
    for (const [key, value] of Object.entries(scoresDepuisIntentions(finalIntentions))) {
      params.set(`score_${key}`, String(value));
    }
    router.push(`/resultat?${params.toString()}`);
  }

  function chooseOption(value: string) {
    if (question.type !== "choice") return;
    const next = { ...choices, [question.id]: value };
    setChoices(next);
    // Recalcule sur `next` (pas `choices`) : si on vient de répondre "famille" à la question
    // companions, la sous-question profil doit être prise en compte immédiatement, pas au rendu
    // suivant, sinon isLast/step avancent sur la mauvaise longueur de liste.
    const isLastNow = step === getEffectiveQuestions(next).length - 1;
    if (isLastNow) {
      submit(next, intentions);
    } else {
      setStep(step + 1);
    }
  }

  function continueFromCards() {
    if (isLast) {
      submit(choices, intentions);
    } else {
      setStep(step + 1);
    }
  }

  return (
    // max-w-2xl (29/08/2026, était max-w-xl) : plus d'air pour la grille de cartes à 3 colonnes
    // ci-dessous — demande Gemini "manque d'immersion, trop sondage plat". Halo terracotta très
    // doux en fond, même traitement que Notre Philosophie/Espace Pros pour cohérence de site.
    <div
      className="max-w-2xl mx-auto px-6 py-16 sm:py-24"
      style={{ background: "radial-gradient(ellipse 90% 60% at 50% 0%, var(--lve-terracotta-bg), transparent)" }}
    >
      <p className="text-[11px] tracking-widest uppercase font-medium text-text-secondary mb-3 text-center">
        Question {step + 1} sur {effectiveQuestions.length}
      </p>
      <div className="h-1 w-full bg-lve-border rounded-full overflow-hidden mb-10">
        <div
          className="h-1 bg-lve-terracotta transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <h1
        className="text-3xl md:text-4xl text-lve-charcoal font-normal text-center mb-8 mt-4"
        style={{ fontFamily: "var(--font-title)" }}
      >
        {withUnbreakableQuestionMark(question.question)}
      </h1>

      {question.type === "choice" ? (
        // Grille de cartes (29/08/2026, demande Gemini) — 3 colonnes pour les questions à 3
        // options (occupe l'espace plus franchement que la liste verticale d'avant), 2 colonnes
        // pour 2 ou 4+ options (un 4e élément en 3 colonnes aurait laissé une rangée bancale).
        <div
          className={
            question.options.length === 3
              ? "grid grid-cols-1 md:grid-cols-3 gap-4"
              : "grid grid-cols-1 sm:grid-cols-2 gap-4"
          }
        >
          {question.options.map((option) => {
            const Icon = OPTION_ICON[`${question.id}:${option.value}`];
            const selected = choices[question.id] === option.value;
            // Titre gras court + description 1 ligne max (29/08/2026, demande Gemini — "évite les
            // pavés de texte"), scale ramené à 1.01 (était 1.02, jugé trop marqué).
            const { title, description } = splitOptionLabel(option.label);
            return (
              <button
                key={option.value}
                onClick={() => chooseOption(option.value)}
                className={`flex flex-col items-center justify-center gap-3 bg-white hover:bg-white border rounded-2xl px-5 py-8 text-center transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-[1.01] cursor-pointer group ${
                  selected ? "border-lve-terracotta shadow-md" : "border-lve-border hover:border-lve-terracotta"
                }`}
              >
                {Icon && (
                  <Icon
                    size={26}
                    strokeWidth={1.25}
                    aria-hidden="true"
                    style={{ color: "var(--lve-terracotta)" }}
                  />
                )}
                <span
                  className="text-base md:text-lg text-lve-charcoal group-hover:text-lve-terracotta"
                  style={{ fontFamily: "var(--font-title)" }}
                >
                  {title}
                </span>
                {description && (
                  <span
                    className="text-xs line-clamp-2 max-w-[22ch]"
                    style={{ color: "var(--text-secondary)", fontFamily: "var(--font-display)" }}
                  >
                    {description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-8">
          <p className="mono mb-6 text-center" style={{ color: "var(--text-secondary)" }}>
            {question.helper}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {question.cards.map((card) => {
              const choisie = intentions.includes(card.key);
              const complet = intentions.length >= question.max && !choisie;
              return (
                <button
                  key={card.key}
                  disabled={complet}
                  onClick={() =>
                    setIntentions((prev) =>
                      prev.includes(card.key)
                        ? prev.filter((k) => k !== card.key)
                        : prev.length >= question.max
                          ? prev
                          : [...prev, card.key]
                    )
                  }
                  className={`group relative aspect-[4/5] overflow-hidden rounded-2xl border text-left transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                    choisie
                      ? "border-lve-terracotta shadow-md"
                      : "border-lve-border shadow-sm hover:shadow-lg hover:scale-[1.01] hover:border-lve-terracotta"
                  }`}
                >
                  <div
                    className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.04]"
                    style={{
                      backgroundImage: `url('${card.image}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  {/* Voile sombre : le texte doit rester lisible sur n'importe quelle photo, et la
                      carte choisie se teinte en terracotta pour que la sélection se voie d'un
                      coup d'œil, comme sur les écrans de questions suivants. */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: choisie
                        ? "linear-gradient(to top, color-mix(in srgb, var(--lve-terracotta-dark) 88%, transparent), color-mix(in srgb, var(--lve-terracotta-dark) 35%, transparent))"
                        : "linear-gradient(to top, rgba(26,23,20,0.82), rgba(26,23,20,0.15))",
                    }}
                  />
                  {choisie && (
                    <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-lve-terracotta-dark">
                      ✓
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <span
                      className="block text-white"
                      style={{ fontFamily: "var(--font-title)", fontSize: "1.15rem", lineHeight: 1.2 }}
                    >
                      {card.label}
                    </span>
                    <span
                      className="mt-1 block text-white/80"
                      style={{ fontFamily: "var(--font-display)", fontSize: "0.74rem" }}
                    >
                      {card.hint}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Le bouton ne s'allume qu'au minimum atteint : sans ça, quelqu'un qui ne choisit rien
              obtiendrait un profil entièrement neutre et des résultats interchangeables. */}
          <button
            onClick={continueFromCards}
            disabled={intentions.length < question.min}
            className="mt-8 w-full px-6 py-3.5 rounded-xl text-white transition-opacity disabled:opacity-40"
            style={{ background: "var(--lve-terracotta)" }}
          >
            {intentions.length < question.min
              ? `Choisissez-en encore ${question.min - intentions.length}`
              : "Continuer"}
          </button>
        </div>
      )}

      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mono mt-8"
          style={{ color: "var(--text-secondary)" }}
        >
          ← Question précédente
        </button>
      )}
    </div>
  );
}
