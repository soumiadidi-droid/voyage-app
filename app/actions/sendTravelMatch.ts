"use server";

// Server Action (30/08/2026, demande Soumia) : envoi du récap Travel Match par email via Resend,
// pas de route /api — ce projet n'en avait aucune jusqu'ici (toutes les pages sont des composants
// serveur qui lisent Neon directement), une Server Action reste cohérent avec cette architecture.
//
// Ne fait RIEN tant que RESEND_API_KEY n'est pas une vraie clé (voir .env.local) : retourne une
// erreur explicite plutôt que de prétendre avoir envoyé un mail qui n'est jamais parti.
//
// 09/09/2026 — le mail contient maintenant l'itinéraire complet (les 3 carnets, adresse par
// adresse) et non plus 3 liens. Conséquence importante : le contenu des carnets est relu ICI depuis
// la base à partir des seuls slugs, il n'est jamais envoyé par le navigateur. Le client ne décide
// que de QUELLES destinations parler, jamais de ce qui est écrit dans le mail.
import { Resend } from "resend";
import { getVoyage } from "@/lib/travel-match/data";
import {
  buildItineraryEmailHtml,
  buildCarnetEmailHtml,
  estimateSizeKb,
  GMAIL_CLIP_KB,
  type ItineraryDestination,
} from "@/lib/email/itinerary";

export type SendResultsEmailInput = {
  email: string;
  archetypeTitle: string;
  destinations: { title: string; slug: string; id: string; score: number }[];
};

export type SendResultsEmailResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Garde-fou : /resultat n'affiche que 3 destinations, un appel qui en demanderait 15 ne peut venir
// que d'un navigateur bricolé.
const MAX_DESTINATIONS = 3;

export async function sendResultsEmail(input: SendResultsEmailInput): Promise<SendResultsEmailResult> {
  if (!EMAIL_RE.test(input.email)) {
    return { ok: false, error: "Adresse email invalide." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_ton_cle")) {
    return { ok: false, error: "Envoi non configuré pour l'instant, réessaie plus tard." };
  }

  // Italie et Amérique du Nord ont plusieurs destinations de matching pour une seule fiche de
  // contenu : sans ce dédoublonnage, le même carnet pourrait être imprimé deux fois dans le mail.
  const seenSlugs = new Set<string>();
  const wanted = input.destinations.filter((d) => {
    if (seenSlugs.has(d.slug)) return false;
    seenSlugs.add(d.slug);
    return true;
  }).slice(0, MAX_DESTINATIONS);

  const voyages = await Promise.all(wanted.map((d) => getVoyage(d.slug)));
  const destinations: ItineraryDestination[] = wanted.flatMap((d, i) => {
    const voyage = voyages[i];
    return voyage ? [{ ...d, voyage }] : [];
  });

  if (destinations.length === 0) {
    console.error("[sendResultsEmail] Aucun carnet trouvé pour:", wanted.map((d) => d.slug));
    return { ok: false, error: "L'envoi a échoué, réessaie." };
  }

  const html = buildItineraryEmailHtml({ archetypeTitle: input.archetypeTitle, destinations });

  // Pas bloquant (le mail part quand même) : sert à repérer dans les logs Vercel le jour où un
  // carnet grossit assez pour que Gmail commence à tronquer la fin.
  const sizeKb = estimateSizeKb(html);
  if (sizeKb > GMAIL_CLIP_KB) {
    console.warn(`[sendResultsEmail] Mail de ${sizeKb} Ko — au-delà du seuil de coupure Gmail (${GMAIL_CLIP_KB} Ko).`);
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: "Voyage des Émotions <contact@levoyagedesemotions.fr>",
      to: input.email,
      subject: "Votre itinéraire sur mesure 🌿",
      html,
    });
    // Loggé (30/08/2026) : le message affiché à l'utilisateur reste volontairement générique,
    // mais la vraie raison (souvent : domaine expéditeur pas encore vérifié dans Resend) doit être
    // visible côté logs Vercel pour pouvoir diagnostiquer sans deviner.
    if (error) {
      console.error("[sendResultsEmail] Resend error:", error);
      return { ok: false, error: "L'envoi a échoué, réessaie." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[sendResultsEmail] Exception:", err);
    return { ok: false, error: "L'envoi a échoué, réessaie." };
  }
}

// Envoi du carnet d'UNE destination depuis sa fiche (09/09/2026, demande Soumia). Même remarque que
// pour l'itinéraire : le navigateur ne transmet qu'un slug, tout le contenu est relu en base ici.
export async function sendCarnetEmail(input: {
  email: string;
  slug: string;
}): Promise<SendResultsEmailResult> {
  if (!EMAIL_RE.test(input.email)) {
    return { ok: false, error: "Adresse email invalide." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_ton_cle")) {
    return { ok: false, error: "Envoi non configuré pour l'instant, réessaie plus tard." };
  }

  const voyage = await getVoyage(input.slug);
  if (!voyage) {
    console.error("[sendCarnetEmail] Carnet introuvable:", input.slug);
    return { ok: false, error: "L'envoi a échoué, réessaie." };
  }

  const html = buildCarnetEmailHtml({
    destinationTitle: voyage.hero.title,
    slug: input.slug,
    voyage,
  });

  const sizeKb = estimateSizeKb(html);
  if (sizeKb > GMAIL_CLIP_KB) {
    console.warn(`[sendCarnetEmail] Mail de ${sizeKb} Ko — au-delà du seuil de coupure Gmail (${GMAIL_CLIP_KB} Ko).`);
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: "Voyage des Émotions <contact@levoyagedesemotions.fr>",
      to: input.email,
      subject: `Votre carnet : ${voyage.hero.title} 🌿`,
      html,
    });
    if (error) {
      console.error("[sendCarnetEmail] Resend error:", error);
      return { ok: false, error: "L'envoi a échoué, réessaie." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[sendCarnetEmail] Exception:", err);
    return { ok: false, error: "L'envoi a échoué, réessaie." };
  }
}
