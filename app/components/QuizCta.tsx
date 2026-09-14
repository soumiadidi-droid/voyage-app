import Link from "next/link";
import { PromesseTravelMatch } from "@/app/components/PromesseTravelMatch";
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
      {/* Sable doux (relecture du 11/09/2026) : en rosé juste après le bloc email pâle, les deux
          pastels se collaient. Surtitre en terracotta sombre, le clair passait sous le seuil. */}
      <div
        className="surface-claire rounded-2xl border border-lve-terracotta/25 px-6 py-10 sm:px-10 sm:py-12"
        style={{ background: "var(--surface-sand)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
          <div className="flex-1 space-y-3">
            <span
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-lve-terracotta-ink font-semibold"
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
          {/* Bloc droit centré, bouton et promesse ensemble ; `no-underline` en utilitaire pour
              battre tout soulignement hérité sur le lien (14/09/2026, soulignement parasite sous le « Q »). */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <Link href="/questionnaire" className="btn-principal no-underline whitespace-nowrap px-7">
              Lancer le questionnaire
            </Link>
            <PromesseTravelMatch className="justify-center" />
          </div>
        </div>
      </div>
    </section>
  );
}
