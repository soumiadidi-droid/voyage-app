"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { sendResultsEmail } from "@/app/actions/sendTravelMatch";

type Destination = { title: string; slug: string; id: string };

type Status = "idle" | "loading" | "success" | "error";

// Capture email sur /resultat (30/08/2026, demande Soumia) — envoie le récap Travel Match via
// sendResultsEmail (Server Action, app/actions/sendTravelMatch.ts). Tant que RESEND_API_KEY n'est
// pas une vraie clé (voir .env.local), l'action renvoie une erreur explicite : le formulaire
// affiche alors l'état "error", jamais un faux succès.
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
    <div
      className="mt-10 mb-12 rounded-2xl p-6 md:p-8"
      style={{ background: "var(--lve-sand)", border: "1px solid var(--lve-border)" }}
    >
      {status === "success" ? (
        <p className="text-center font-medium" style={{ color: "var(--lve-charcoal)" }}>
          C&apos;est envoyé ! Check ta boîte mail 📩
        </p>
      ) : (
        <>
          <h3
            className="mb-2 font-semibold"
            style={{ fontFamily: "var(--font-title)", fontSize: "1.6rem", color: "var(--lve-charcoal)" }}
          >
            On t&apos;envoie tout ça au chaud ?
          </h3>
          <p className="mb-5 opacity-80" style={{ color: "var(--lve-charcoal)" }}>
            Reçois ton profil complet, tes destinations sur mesure et nos adresses directement dans
            ta boîte mail.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton.email@exemple.com"
              className="flex-1 rounded-lg px-4 py-3 outline-none"
              style={{ border: "1px solid var(--lve-border)", background: "#fff", color: "var(--lve-charcoal)" }}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium text-white disabled:opacity-70"
              style={{ background: "var(--ember)" }}
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail size={16} />
                  Recevoir mon guide
                </>
              )}
            </button>
          </form>
          {status === "error" && (
            <p className="mt-2 text-sm" style={{ color: "#b91c1c" }}>
              {errorMessage}
            </p>
          )}
          <p className="mt-3 text-xs opacity-60" style={{ color: "var(--lve-charcoal)" }}>
            Uniquement pour t&apos;envoyer tes résultats. Désinscription en 1 clic.
          </p>
        </>
      )}
    </div>
  );
}
