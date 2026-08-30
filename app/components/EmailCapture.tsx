"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { sendResultsEmail } from "@/app/actions/sendTravelMatch";

type Destination = { title: string; slug: string; id: string };

type Status = "idle" | "loading" | "success" | "error";

// Capture email sur /resultat (30/08/2026, demande Soumia) — envoie le récap Travel Match via
// sendResultsEmail (Server Action, app/actions/sendTravelMatch.ts). Tant que RESEND_API_KEY n'est
// pas configurée/le domaine pas vérifié dans Resend (voir .env.local), l'action renvoie une erreur
// explicite : jamais un faux succès.
//
// Redesign du 30/08/2026 : reprend un composant généré par Figma Make transmis par Soumia (carte
// dégradée + halos décoratifs flous, badge, icônes Send/CheckCircle2/Loader2) — palette Tailwind
// générique (amber/orange/slate) remplacée par les tokens réels du site (--lve-terracotta-bg,
// --lve-charcoal, --text-secondary...), et le handler d'envoi bidon du reference (`// Ton appel
// ici`) remplacé par le vrai appel à sendResultsEmail.
export function EmailCapture({
  archetypeTitle,
  destinations,
}: {
  archetypeTitle: string;
  destinations: Destination[];
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const result = await sendResultsEmail({ email, archetypeTitle, destinations });
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
              C&apos;est parti ! 💌
            </h3>
            <p className="text-sm max-w-md" style={{ color: "var(--text-secondary)" }}>
              Ton récapitulatif personnalisé vient d&apos;être envoyé à{" "}
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
                Garde ton itinéraire
              </span>
              <h3
                className="text-2xl md:text-3xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-title)", color: "var(--lve-charcoal)" }}
              >
                Recevoir ma sélection par email
              </h3>
              <p className="text-sm md:text-base max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
                Retrouve ton profil émotionnel et tes adresses sur mesure directement dans ta boîte
                mail.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="ton.email@exemple.com"
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
              Pas de spam. Tes données restent protégées chez Voyage des Émotions.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
