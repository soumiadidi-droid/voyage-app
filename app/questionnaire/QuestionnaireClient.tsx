"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/lib/questionnaire";

export function QuestionnaireClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const progress = Math.round(((step + 1) / QUESTIONS.length) * 100);

  function choose(value: string) {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (isLast) {
      const params = new URLSearchParams(next);
      router.push(`/resultat?${params.toString()}`);
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
        Question {step + 1} / {QUESTIONS.length}
      </p>
      <h1
        className="font-extrabold mb-8"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.7rem, 4vw, 2.4rem)" }}
      >
        {question.question}
      </h1>
      <div className="flex flex-col gap-3">
        {question.options.map((option) => (
          <button
            key={option.value}
            onClick={() => choose(option.value)}
            className="text-left px-5 py-4 border transition-colors"
            style={{
              borderColor:
                answers[question.id] === option.value ? "var(--ember)" : "var(--border)",
              background: "var(--bg-elevated)",
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
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
