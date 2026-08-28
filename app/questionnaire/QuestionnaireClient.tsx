"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TRAVEL_MATCH_QUESTIONS,
  FAMILY_PROFILE_QUESTION,
  type TravelMatchQuestion,
} from "@/lib/travel-match/questionnaire";
import { SCORE_KEYS, type ScoreKey } from "@/lib/travel-match/types";

type SliderAnswers = Record<ScoreKey, number>;

function initialSliderAnswers(): SliderAnswers {
  const init = {} as SliderAnswers;
  for (const key of SCORE_KEYS) init[key] = 3; // curseur au milieu par défaut, jamais biaisé
  return init;
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
  const [sliders, setSliders] = useState<SliderAnswers>(initialSliderAnswers);

  const effectiveQuestions = getEffectiveQuestions(choices);
  const question = effectiveQuestions[Math.min(step, effectiveQuestions.length - 1)];
  const isLast = step === effectiveQuestions.length - 1;
  const progress = Math.round(((step + 1) / effectiveQuestions.length) * 100);

  function submit(finalChoices: Record<string, string>, finalSliders: SliderAnswers) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(finalChoices)) params.set(key, value);
    for (const [key, value] of Object.entries(finalSliders)) {
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
      submit(next, sliders);
    } else {
      setStep(step + 1);
    }
  }

  function continueFromSliders() {
    if (isLast) {
      submit(choices, sliders);
    } else {
      setStep(step + 1);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16 sm:py-24">
      <p className="text-[11px] tracking-widest uppercase font-medium text-text-secondary mb-3 text-center">
        Question {step + 1} sur {TRAVEL_MATCH_QUESTIONS.length}
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
        {question.question}
      </h1>

      {question.type === "choice" ? (
        <div
          className={
            question.options.length >= 4
              ? "grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto"
              : "flex flex-col gap-3 max-w-xl mx-auto"
          }
        >
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => chooseOption(option.value)}
              className={`bg-white/70 hover:bg-white border rounded-2xl p-5 text-center transition-all shadow-sm hover:shadow-md cursor-pointer group ${
                choices[question.id] === option.value
                  ? "border-lve-terracotta"
                  : "border-lve-border hover:border-lve-terracotta/60"
              }`}
            >
              <span
                className="text-sm md:text-base text-lve-charcoal group-hover:text-lve-terracotta font-medium"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div
          className="mt-8 p-5 sm:p-6 rounded-xl"
          style={{ background: "var(--lve-bg)" }}
        >
          <p className="mono mb-6" style={{ color: "var(--text-secondary)" }}>
            {question.helper}
          </p>
          <div className="flex flex-col gap-4">
            {question.sliders.map((s) => {
              const pct = ((sliders[s.key] - 1) / 4) * 100;
              return (
                <div
                  key={s.key}
                  className="bg-white rounded-xl shadow-sm p-5"
                >
                  <div className="flex items-baseline justify-between mb-4 gap-4">
                    <span
                      className="text-lve-charcoal"
                      style={{ fontFamily: "var(--font-title)", fontSize: "1.05rem" }}
                    >
                      {s.label}
                    </span>
                    <span
                      className="mono"
                      style={{ color: "var(--lve-terracotta-dark)", fontSize: "0.9rem" }}
                    >
                      {sliders[s.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={sliders[s.key]}
                    onChange={(e) =>
                      setSliders((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))
                    }
                    className="lve-slider w-full"
                    style={{
                      background: `linear-gradient(to right, var(--lve-terracotta) ${pct}%, var(--lve-border) ${pct}%)`,
                    }}
                  />
                  {s.lowLabel && s.highLabel && (
                    <div
                      className="mono flex justify-between mt-3"
                      style={{ color: "var(--text-secondary)", fontSize: "0.72rem" }}
                    >
                      <span>{s.lowLabel}</span>
                      <span>{s.highLabel}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button
            onClick={continueFromSliders}
            className="mt-8 px-6 py-3 rounded-xl text-white"
            style={{ background: "var(--lve-terracotta)" }}
          >
            Continuer
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
