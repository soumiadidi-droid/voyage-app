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
  onSend: (
    email: string,
    options: { consent: boolean; trap: string }
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  // Piège à robots (10/09/2026) : champ caché, jamais rempli par un humain. Voir isBot côté serveur.
  const [trap, setTrap] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const result = await onSend(email, { consent, trap });
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
        className="surface-claire relative overflow-hidden rounded-3xl p-8 md:p-10 text-center"
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
              C&apos;est envoyé !
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
                style={{ color: "var(--lve-terracotta-ink)", background: "var(--lve-terracotta-bg)" }}
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
                placeholder="ton.email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                className="flex-1 px-4 py-3.5 rounded-lg text-sm outline-none shadow-sm transition-all disabled:opacity-70"
                style={{ border: "1px solid var(--lve-border)", background: "rgba(255,255,255,0.9)", color: "var(--lve-charcoal)" }}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                // Bouton principal du site (relecture du 11/09/2026) : était un dégradé avec la
                // police du corps de texte, un 2e style de bouton à côté du terracotta plein.
                className="btn-principal px-6 py-3.5 whitespace-nowrap"
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
              {/* Champ piège : sorti de l'écran plutôt que display:none (certains robots ignorent
                  les champs masqués en CSS), retiré du parcours au clavier et de la lecture d'écran. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={trap}
                onChange={(e) => setTrap(e.target.value)}
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              />
            </form>

            {/* Facultative et décochée par défaut (décidé au grillage du 09/09/2026) : l'envoi de
                l'itinéraire est le service demandé, garder l'adresse pour recontacter est un accord
                distinct. Sans la case, aucune adresse n'est conservée. */}
            {/* items-center et non items-start (11/09/2026) : le libellé tient désormais sur une
                seule ligne, l'alignement haut décalait la case vers le haut pour rien. w-fit
                mx-auto centre le couple case + texte comme le reste du bloc, au lieu de centrer
                une boîte plus large dans laquelle le texte partait à gauche. */}
            <label
              className="flex w-fit mx-auto items-center gap-2.5 text-xs cursor-pointer select-none"
              style={{ color: "var(--text-secondary)" }}
            >
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="accent-[var(--lve-terracotta)] cursor-pointer"
              />
              {/* text-left (11/09/2026) : sur téléphone le libellé passe sur deux lignes et
                  héritait du centrage du bloc, loin de sa case. */}
              <span className="text-left">Je veux aussi recevoir les nouvelles destinations.</span>
            </label>

            {status === "error" && (
              <p className="text-xs font-medium" style={{ color: "#b91c1c" }}>
                {errorMessage}
              </p>
            )}

            {/* Lien vers la page Confidentialité (10/09/2026) : la mention "vos données sont
                protégées" ne renvoyait à rien tant que la page était vide. */}
            <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
              Pas de spam, aucune donnée revendue.{" "}
              <a href="/confidentialite" className="underline" style={{ color: "var(--text-secondary)" }}>
                Ce que je fais de ton adresse
              </a>
              .
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
      badge="Ton itinéraire, par écrit"
      title="Reçois mon itinéraire par email"
      description="Tes trois destinations et un avant-goût de mes adresses, directement dans ta boîte mail."
      successText="Ton itinéraire complet vient d'être envoyé à"
      onSend={(email, { consent, trap }) =>
        sendResultsEmail({ email, archetypeTitle, destinations, consent, trap })
      }
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
      title={`Reçois mes adresses de ${destinationTitle} par email`}
      description="Toutes les adresses de ce carnet — où dormir, où manger, quoi faire — dans ta boîte mail, pour les retrouver une fois sur place."
      successText="Ton carnet vient d'être envoyé à"
      onSend={(email, { consent, trap }) => sendCarnetEmail({ email, slug, consent, trap })}
    />
  );
}
