"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TRAVEL_MATCH_QUESTIONS } from "@/lib/travel-match/questionnaire";
import { EMOTION_KEYS, type EmotionKey, type VibeKey } from "@/lib/travel-match/types";

type SliderAnswers = Record<EmotionKey | VibeKey, number>;

function initialSliderAnswers(): SliderAnswers {
  const init = {} as SliderAnswers;
  for (const q of TRAVEL_MATCH_QUESTIONS) {
    if (q.type !== "sliders") continue;
    for (const s of q.sliders) init[s.key] = 3; // curseur au milieu par défaut, jamais biaisé
  }
  return init;
}

const EMOTION_KEY_SET: ReadonlySet<string> = new Set(EMOTION_KEYS);

export function QuestionnaireClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [sliders, setSliders] = useState<SliderAnswers>(initialSliderAnswers);

  const question = TRAVEL_MATCH_QUESTIONS[step];
  const isLast = step === TRAVEL_MATCH_QUESTIONS.length - 1;
  const progress = Math.round(((step + 1) / TRAVEL_MATCH_QUESTIONS.length) * 100);

  function submit(finalChoices: Record<string, string>, finalSliders: SliderAnswers) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(finalChoices)) params.set(key, value);
    for (const [key, value] of Object.entries(finalSliders)) {
      const prefix = EMOTION_KEY_SET.has(key) ? "emo_" : "vibe_";
      params.set(`${prefix}${key}`, String(value));
    }
    router.push(`/resultat?${params.toString()}`);
  }

  function chooseOption(value: string) {
    if (question.type !== "choice") return;
    const next = { ...choices, [question.id]: value };
    setChoices(next);
    if (isLast) {
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
      <div className="h-1 w-full mb-10" style={{ background: "var(--border)" }}>
        <div
          className="h-1 transition-all"
          style={{ background: "var(--ember)", width: `${progress}%` }}
        />
      </div>
      <p className="mono mb-4" style={{ color: "var(--text-secondary)" }}>
        Question {step + 1} / {TRAVEL_MATCH_QUESTIONS.length}
      </p>
      <h1
        className="font-extrabold mb-3"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.7rem, 4vw, 2.4rem)" }}
      >
        {question.question}
      </h1>

      {question.type === "choice" ? (
        <div className="flex flex-col gap-3 mt-8">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => chooseOption(option.value)}
              className="text-left px-5 py-4 border transition-colors"
              style={{
                borderColor:
                  choices[question.id] === option.value ? "var(--ember)" : "var(--border)",
                background: "var(--bg-elevated)",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <p className="mono mb-8" style={{ color: "var(--text-secondary)" }}>
            {question.helper}
          </p>
          <div className="flex flex-col gap-8">
            {question.sliders.map((s) => (
              <div key={s.key}>
                <div className="flex items-baseline justify-between mb-2 gap-4">
                  <span>{s.label}</span>
                  <span className="mono" style={{ color: "var(--ember)" }}>
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
                  className="w-full"
                  style={{ accentColor: "var(--ember)" }}
                />
                {s.lowLabel && s.highLabel && (
                  <div
                    className="mono flex justify-between mt-1"
                    style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}
                  >
                    <span>{s.lowLabel}</span>
                    <span>{s.highLabel}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={continueFromSliders}
            className="mt-10 px-6 py-3 border"
            style={{ borderColor: "var(--ember)", background: "var(--bg-elevated)" }}
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
