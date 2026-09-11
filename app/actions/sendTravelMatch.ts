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
import { withVisibleAddresses } from "@/lib/visible-addresses";
import { allowSend, recordRequest } from "@/lib/email/requests";
import {
  buildItineraryEmailHtml,
  buildCarnetEmailHtml,
  estimateSizeKb,
  GMAIL_CLIP_KB,
  type ItineraryDestination,
} from "@/lib/email/itinerary";

// `consent` : la personne a coché la case de recontact (facultative, décochée par défaut).
// `trap` : champ caché du formulaire, invisible pour un humain — voir isBot ci-dessous.
export type SendResultsEmailInput = {
  email: string;
  archetypeTitle: string;
  destinations: { title: string; slug: string; id: string; score: number }[];
  consent?: boolean;
  trap?: string;
};

export type SendResultsEmailResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Piège à robots (10/09/2026, décidé au grillage) : le formulaire contient un champ caché qu'aucun
// humain ne voit ni ne remplit. Un robot qui remplit tout ce qu'il trouve se signale tout seul.
// On répond alors un faux succès : lui dire qu'il a été repéré l'inviterait à recommencer autrement.
function isBot(trap?: string): boolean {
  return Boolean(trap && trap.trim().length > 0);
}

const THROTTLED_MESSAGE = "Trop de demandes pour l'instant, réessayez dans un moment.";

const SITE_URL = "https://levoyagedesemotions.fr";

function unsubscribeUrl(token: string | null): string | null {
  return token ? `${SITE_URL}/desinscription?token=${token}` : null;
}

// Garde-fou : /resultat n'affiche que 3 destinations, un appel qui en demanderait 15 ne peut venir
// que d'un navigateur bricolé.
const MAX_DESTINATIONS = 3;

export async function sendResultsEmail(input: SendResultsEmailInput): Promise<SendResultsEmailResult> {
  if (isBot(input.trap)) return { ok: true };

  if (!EMAIL_RE.test(input.email)) {
    return { ok: false, error: "Adresse email invalide." };
  }

  if (!(await allowSend())) return { ok: false, error: THROTTLED_MESSAGE };

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
  // withVisibleAddresses (10/09/2026) : le mail ne doit contenir que ce que la fiche affiche —
  // sans ce filtre, des adresses masquées faute de lien Instagram vérifié partaient par mail.
  const destinations: ItineraryDestination[] = wanted.flatMap((d, i) => {
    const voyage = voyages[i];
    return voyage ? [{ ...d, voyage: withVisibleAddresses(voyage) }] : [];
  });

  if (destinations.length === 0) {
    console.error("[sendResultsEmail] Aucun carnet trouvé pour:", wanted.map((d) => d.slug));
    return { ok: false, error: "L'envoi a échoué, réessaie." };
  }

  // Enregistré AVANT l'envoi parce que le jeton de désinscription doit figurer dans le mail. Un
  // envoi qui échouerait ensuite laisse donc une demande comptée — écart assumé, les échecs sont
  // rares et tracés dans les logs.
  const { unsubscribeToken } = await recordRequest({
    kind: "itinerary",
    destinationSlugs: destinations.map((d) => d.slug),
    email: input.email,
    consent: Boolean(input.consent),
  });

  const html = buildItineraryEmailHtml({
    archetypeTitle: input.archetypeTitle,
    destinations,
    unsubscribeUrl: unsubscribeUrl(unsubscribeToken),
  });

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
      subject: "Ton itinéraire sur mesure 🌿",
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
  consent?: boolean;
  trap?: string;
}): Promise<SendResultsEmailResult> {
  if (isBot(input.trap)) return { ok: true };

  if (!EMAIL_RE.test(input.email)) {
    return { ok: false, error: "Adresse email invalide." };
  }

  if (!(await allowSend())) return { ok: false, error: THROTTLED_MESSAGE };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_ton_cle")) {
    return { ok: false, error: "Envoi non configuré pour l'instant, réessaie plus tard." };
  }

  const voyage = await getVoyage(input.slug);
  if (!voyage) {
    console.error("[sendCarnetEmail] Carnet introuvable:", input.slug);
    return { ok: false, error: "L'envoi a échoué, réessaie." };
  }

  const { unsubscribeToken } = await recordRequest({
    kind: "carnet",
    destinationSlugs: [input.slug],
    email: input.email,
    consent: Boolean(input.consent),
  });

  const html = buildCarnetEmailHtml({
    destinationTitle: voyage.hero.title,
    slug: input.slug,
    voyage: withVisibleAddresses(voyage),
    unsubscribeUrl: unsubscribeUrl(unsubscribeToken),
  });

  const sizeKb = estimateSizeKb(html);
  if (sizeKb > GMAIL_CLIP_KB) {
    console.warn(`[sendCarnetEmail] Mail de ${sizeKb} Ko — au-delà du seuil de coupure Gmail (${GMAIL_CLIP_KB} Ko).`);
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: "Voyage des Émotions <contact@levoyagedesemotions.fr>",
      to: input.email,
      subject: `Ton carnet : ${voyage.hero.title} 🌿`,
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
