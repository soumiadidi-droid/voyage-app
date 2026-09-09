"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { sendResultsEmail, sendCarnetEmail } from "@/app/actions/sendTravelMatch";

type Destination = { title: string; slug: string; id: string; score: number };

type Status = "idle" | "loading" | "success" | "error";

// Capture email sur /resultat (30/08/2026, demande Soumia) — envoie le récap Travel Match via
// sendResultsEmail (Server Action, app/actions/sendTravelMatch.ts). Tant que RESEND_API_KEY n'est
// pas configurée/le domaine pas vérifié dans Resend (voir .env.local), l'action renvoie une erreur
// explicite : jamais un faux succès.
//
// 09/09/2026 : le mail envoyé contient l'itinéraire — les 3 destinations et 3 adresses en aperçu
// pour chacune, le carnet complet restant sur le site (arbitrage de Soumia le même jour). D'où le
// `score` transmis avec chaque destination, affiché dans le mail, et la copie alignée sur le
// vouvoiement du reste de /resultat (elle tutoyait, seul reste du questionnaire).
//
// Redesign du 30/08/2026 : reprend un composant généré par Figma Make transmis par Soumia (carte
// dégradée + halos décoratifs flous, badge, icônes Send/CheckCircle2/Loader2) — palette Tailwind
// générique (amber/orange/slate) remplacée par les tokens réels du site (--lve-terracotta-bg,
// --lve-charcoal, --text-secondary...), et le handler d'envoi bidon du reference (`// Ton appel
// ici`) remplacé par le vrai appel à sendResultsEmail.
// Coquille visuelle partagée (09/09/2026) : le même bloc sert sur /resultat (envoi de
// l'itinéraire) et en bas d'une fiche destination (envoi du carnet). Seuls les textes et l'action
// d'envoi changent — dupliquer la carte dégradée + les halos aurait garanti qu'elles divergent à
// la première retouche.
function EmailCaptureShell({
  badge,
  title,
  description,
  successText,
  onSend,
}: {
  badge: string;
  title: string;
  description: string;
  successText: string;
  onSend: (email: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const result = await onSend(email);
    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(result.error);
    }
  }

  return (
    <section className="w-full my-12">
      <div
        className="relative overflow-hidden rounded-3xl p-8 md:p-10 text-center"
        style={{
          background: "linear-gradient(135deg, var(--lve-terracotta-bg) 0%, #ffffff 55%, var(--lve-sand) 100%)",
          border: "1px solid var(--lve-border)",
          boxShadow: "0 20px 40px -20px rgba(26, 26, 26, 0.15)",
        }}
      >
        {/* Halos décoratifs flous, repris tels quels du reference Figma Make */}
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl pointer-events-none"
          style={{ background: "color-mix(in srgb, var(--lve-terracotta) 30%, transparent)" }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full blur-2xl pointer-events-none"
          style={{ background: "color-mix(in srgb, var(--lve-sand) 60%, transparent)" }}
        />

        {status === "success" ? (
          <div className="relative z-10 flex flex-col items-center justify-center space-y-3 py-4">
            <CheckCircle2 size={48} style={{ color: "var(--lve-sage-dark)" }} />
            <h3
              className="text-xl font-semibold"
              style={{ fontFamily: "var(--font-title)", color: "var(--lve-charcoal)" }}
            >
              C&apos;est envoyé ! 💌
            </h3>
            <p className="text-sm max-w-md" style={{ color: "var(--text-secondary)" }}>
              {successText}{" "}
              <span className="font-medium" style={{ color: "var(--lve-charcoal)" }}>{email}</span>.
            </p>
          </div>
        ) : (
          <div className="relative z-10 space-y-6">
            <div className="space-y-2">
              <span
                className="inline-block px-3 py-1 text-xs font-semibold tracking-wider uppercase rounded-full"
                style={{ color: "var(--lve-terracotta-dark)", background: "var(--lve-terracotta-bg)" }}
              >
                {badge}
              </span>
              <h3
                className="text-2xl md:text-3xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-title)", color: "var(--lve-charcoal)" }}
              >
                {title}
              </h3>
              <p className="text-sm md:text-base max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
                {description}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="votre.email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                className="flex-1 px-4 py-3.5 rounded-2xl text-sm outline-none shadow-sm transition-all disabled:opacity-70"
                style={{ border: "1px solid var(--lve-border)", background: "rgba(255,255,255,0.9)", color: "var(--lve-charcoal)" }}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl text-white font-medium text-sm shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, var(--lve-terracotta) 0%, var(--lve-terracotta-dark) 100%)",
                  boxShadow: "0 10px 25px -8px color-mix(in srgb, var(--lve-terracotta-dark) 40%, transparent)",
                }}
              >
                {status === "loading" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>Envoyer</span>
                    <Send size={16} className="ml-2" />
                  </>
                )}
              </button>
            </form>

            {status === "error" && (
              <p className="text-xs font-medium" style={{ color: "#b91c1c" }}>
                {errorMessage}
              </p>
            )}

            <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
              Pas de spam. Vos données restent protégées chez Voyage des Émotions.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// Bloc de /resultat : envoie l'itinéraire (les 3 destinations, 3 adresses en aperçu chacune).
export function EmailCapture({
  archetypeTitle,
  destinations,
}: {
  archetypeTitle: string;
  destinations: Destination[];
}) {
  return (
    <EmailCaptureShell
      badge="Votre itinéraire, par écrit"
      title="Recevoir mon itinéraire par email"
      description="Vos trois destinations et un avant-goût de mes adresses testées sur place, directement dans votre boîte mail."
      successText="Votre itinéraire complet vient d'être envoyé à"
      onSend={(email) => sendResultsEmail({ email, archetypeTitle, destinations })}
    />
  );
}

// Bloc de fin de fiche destination (09/09/2026) : envoie le carnet ENTIER de cette destination —
// à l'inverse de l'aperçu ci-dessus. Quelqu'un qui est déjà sur la fiche a passé le stade de la
// vitrine : ce qu'il demande, c'est d'emporter les adresses avec lui.
export function CarnetEmailCapture({ slug, destinationTitle }: { slug: string; destinationTitle: string }) {
  return (
    <EmailCaptureShell
      badge="Emporter ce carnet"
      title={`Recevoir mes adresses de ${destinationTitle} par email`}
      description="Toutes les adresses de ce carnet — où dormir, où manger, quoi faire — dans votre boîte mail, pour les retrouver une fois sur place."
      successText="Votre carnet vient d'être envoyé à"
      onSend={(email) => sendCarnetEmail({ email, slug })}
    />
  );
}
