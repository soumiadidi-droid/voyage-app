import Link from "next/link";
import { Compass } from "lucide-react";

// Bloc d'engagement vers le questionnaire (03/09/2026), affiché en fin de fiche voyage. Contexte :
// les fiches sont indexées, donc un visiteur peut atterrir directement sur une destination depuis
// Google sans jamais voir le Travel Match. Ce bloc est le rattrapage — il récupère cette visite et
// l'envoie vers le questionnaire, plutôt que de fermer l'accès aux fiches.
//
// Copy fournie par Soumia, à un mot près : "notre questionnaire" → "mon questionnaire", le site
// parle au "je" depuis le 03/09/2026 (cf. CLAUDE.md).
export function QuizCta() {
  return (
    <section className="my-16 sm:my-24">
      <div className="rounded-2xl border border-lve-terracotta/25 bg-lve-terracotta-bg px-6 py-10 sm:px-10 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center gap-8">
          <div className="flex-1 space-y-3">
            <span
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-lve-terracotta font-semibold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <Compass size={14} strokeWidth={2} />
              Travel Match
            </span>
            <h2
              className="text-lve-charcoal leading-tight m-0"
              style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
            >
              Tu hésites sur ta prochaine destination ?
            </h2>
            <p
              className="text-lve-charcoal/75 leading-relaxed m-0 max-w-xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Passe mon questionnaire sur-mesure pour trouver l&apos;expérience qui te ressemble.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/questionnaire"
              className="inline-block whitespace-nowrap bg-lve-terracotta hover:bg-lve-terracotta-dark text-white text-xs uppercase tracking-[0.2em] font-medium px-7 py-4 rounded-lg shadow-md transition-all hover:-translate-y-0.5 no-underline"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Lancer le questionnaire
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
