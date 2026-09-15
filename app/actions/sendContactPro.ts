"use server";

// Formulaire de contact de /pros (15/09/2026). Le lien « mailto: » dépendait de la messagerie
// installée chez le visiteur : chez Soumia elle-même, il n'a rien envoyé. Le message part par Resend
// vers contact@levoyagedesemotions.fr, redirigé vers la boîte de Soumia chez OVH ; « Répondre »
// dans sa messagerie répond directement au visiteur. Rien n'est enregistré en base, à part
// l'empreinte anti-abus d'une heure (lib/email/requests.ts). Page Confidentialité à jour.
import { Resend } from "resend";
import { allowSend } from "@/lib/email/requests";

export type ContactProInput = {
  nom?: string;
  etablissement?: string;
  email: string;
  message: string;
  trap?: string;
};

export type ContactProResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DESTINATAIRE = "contact@levoyagedesemotions.fr";
const LONGUEUR_MAX = 5000;

function echapper(texte: string): string {
  return texte.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function sendContactPro(input: ContactProInput): Promise<ContactProResult> {
  // Piège à robots : faux succès, comme pour les autres formulaires.
  if (input.trap && input.trap.trim().length > 0) return { ok: true };

  const email = input.email.trim();
  const message = input.message.trim();
  const nom = (input.nom ?? "").trim().slice(0, 200);
  const etablissement = (input.etablissement ?? "").trim().slice(0, 200);

  if (!EMAIL_RE.test(email)) return { ok: false, error: "Adresse email invalide." };
  if (message.length < 5) return { ok: false, error: "Votre message est vide." };
  if (message.length > LONGUEUR_MAX) return { ok: false, error: "Votre message est trop long." };

  if (!(await allowSend())) return { ok: false, error: "Trop de messages pour l'instant, réessayez dans un moment." };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_ton_cle")) {
    return { ok: false, error: "L'envoi n'est pas disponible pour l'instant. Écrivez-moi à contact@levoyagedesemotions.fr." };
  }

  const qui = [nom, etablissement].filter(Boolean).join(" — ") || email;
  const html = `
    <div style="font-family:Georgia,serif;color:#1c2433;line-height:1.6;max-width:600px">
      <p style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#8c4a32">Nouveau contact depuis « On collabore ? »</p>
      <p><strong>Nom :</strong> ${echapper(nom || "—")}<br>
      <strong>Établissement :</strong> ${echapper(etablissement || "—")}<br>
      <strong>Email :</strong> ${echapper(email)}</p>
      <p style="white-space:pre-wrap;border-left:3px solid #d27b5c;padding-left:14px">${echapper(message)}</p>
      <p style="font-size:13px;color:#6b6259">Répondre à ce mail écrit directement à ${echapper(email)}.</p>
    </div>`;

  const { error } = await new Resend(apiKey).emails.send({
    from: "Voyage des Émotions <contact@levoyagedesemotions.fr>",
    to: DESTINATAIRE,
    replyTo: email,
    subject: `Nouveau contact pro — ${qui}`,
    html,
  });
  if (error) {
    console.error("[sendContactPro] Resend error:", error);
    return { ok: false, error: "L'envoi a échoué. Écrivez-moi à contact@levoyagedesemotions.fr." };
  }
  return { ok: true };
}
