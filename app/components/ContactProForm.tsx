"use client";

// Formulaire de contact de /pros (15/09/2026), remplace le lien « mailto: ». Vouvoiement, comme le
// reste de la page. L'adresse reste affichée en dessous pour ceux qui préfèrent leur messagerie.
import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { sendContactPro } from "@/app/actions/sendContactPro";

const CHAMP =
  "w-full rounded-lg border border-lve-border bg-white px-4 py-3 text-sm text-lve-charcoal outline-none shadow-sm focus:border-lve-terracotta";

export function ContactProForm() {
  const [nom, setNom] = useState("");
  const [etablissement, setEtablissement] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [piege, setPiege] = useState("");
  const [statut, setStatut] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [erreur, setErreur] = useState("");

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setStatut("loading");
    const r = await sendContactPro({ nom, etablissement, email, message, trap: piege });
    if (r.ok) setStatut("ok");
    else {
      setErreur(r.error);
      setStatut("error");
    }
  }

  if (statut === "ok") {
    return (
      <div className="surface-claire mx-auto max-w-xl rounded-2xl bg-white px-6 py-8 text-lve-charcoal shadow-sm">
        <CheckCircle2 className="mx-auto mb-3" size={28} style={{ color: "var(--lve-terracotta-dark)" }} />
        <p style={{ fontFamily: "var(--font-title)", fontSize: "1.6rem" }}>Merci, c&apos;est bien parti.</p>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          Je lis votre message et je reviens vers vous très vite.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={envoyer} className="surface-claire relative mx-auto max-w-xl space-y-3 text-left">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={CHAMP} placeholder="Votre nom" value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="name" />
        <input
          className={CHAMP}
          placeholder="Votre établissement"
          value={etablissement}
          onChange={(e) => setEtablissement(e.target.value)}
          autoComplete="organization"
        />
      </div>
      <input
        className={CHAMP}
        type="email"
        required
        placeholder="Votre email *"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <textarea
        className={`${CHAMP} min-h-[140px] resize-y`}
        required
        placeholder="Qui êtes-vous, et qu'est-ce qui vous tente ? *"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {/* Piège à robots : nom sans rapport avec un vrai champ, pour qu'aucun remplissage automatique
          du navigateur ne le touche (« website » risquait d'être rempli par l'autofill). */}
      <input
        type="text"
        name="lve_piege_x9"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={piege}
        onChange={(e) => setPiege(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      {statut === "error" && (
        <p className="text-sm" style={{ color: "var(--lve-warning-text)" }}>
          {erreur}
        </p>
      )}
      <div className="text-center">
        <button type="submit" disabled={statut === "loading"} className="btn-principal px-8">
          {statut === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Envoyer
        </button>
      </div>
    </form>
  );
}
