"use server";

// Server Action (30/08/2026, demande Soumia) : envoi du récap Travel Match par email via Resend,
// pas de route /api — ce projet n'en avait aucune jusqu'ici (toutes les pages sont des composants
// serveur qui lisent Neon directement), une Server Action reste cohérent avec cette architecture.
//
// Ne fait RIEN tant que RESEND_API_KEY n'est pas une vraie clé (voir .env.local) : retourne une
// erreur explicite plutôt que de prétendre avoir envoyé un mail qui n'est jamais parti.
import { Resend } from "resend";

export type SendResultsEmailInput = {
  email: string;
  archetypeTitle: string;
  destinations: { title: string; slug: string; id: string }[];
};

export type SendResultsEmailResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildEmailHtml(input: SendResultsEmailInput): string {
  const destinationRows = input.destinations
    .map(
      (d) => `
        <li style="margin-bottom:12px;">
          <a href="https://levoyagedesemotions.fr/voyages/${d.slug}?id=${d.id}"
             style="color:#c4622d;text-decoration:none;font-weight:600;">
            ${d.title}
          </a>
        </li>`
    )
    .join("");

  return `
    <div style="background:#faf7f0;padding:32px 24px;font-family:Georgia,'Times New Roman',serif;color:#1a1714;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e4dfd3;">
        <p style="text-transform:uppercase;letter-spacing:0.08em;font-size:11px;color:#8c4a32;margin:0 0 12px;">
          Votre profil Travel Match
        </p>
        <h1 style="font-size:28px;margin:0 0 20px;color:#1a1714;">${input.archetypeTitle}</h1>
        <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">
          Voici les destinations qui correspondent le plus à tes envies de voyage :
        </p>
        <ul style="list-style:none;padding:0;margin:0 0 28px;">
          ${destinationRows}
        </ul>
        <a href="https://levoyagedesemotions.fr"
           style="display:inline-block;background:#c4622d;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Retourner sur Le Voyage des Émotions
        </a>
      </div>
    </div>`;
}

export async function sendResultsEmail(input: SendResultsEmailInput): Promise<SendResultsEmailResult> {
  if (!EMAIL_RE.test(input.email)) {
    return { ok: false, error: "Adresse email invalide." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_ton_cle")) {
    return { ok: false, error: "Envoi non configuré pour l'instant, réessaie plus tard." };
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: "Voyage des Émotions <contact@levoyagedesemotions.fr>",
      to: input.email,
      subject: "Ton profil Travel Match & tes destinations idéales 🌿",
      html: buildEmailHtml(input),
    });
    if (error) return { ok: false, error: "L'envoi a échoué, réessaie." };
    return { ok: true };
  } catch {
    return { ok: false, error: "L'envoi a échoué, réessaie." };
  }
}
