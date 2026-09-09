// Construction du mail "itinéraire" envoyé depuis /resultat (09/09/2026, demande Soumia).
//
// Remplace l'ancien mail du 30/08 qui ne contenait que le profil + 3 liens de destinations.
//
// Le mail est un APERÇU, pas une copie du site (arbitrage de Soumia le 09/09/2026, après avoir vu
// une première version qui reproduisait les carnets entiers) : 3 adresses par destination, une par
// catégorie quand c'est possible, et le reste reste sur la fiche. Recopier tout le contenu enlevait
// au visiteur toute raison de revenir sur le site.
//
// Volontairement sans images : elles sont bloquées par défaut par la plupart des messageries, et
// chaque photo alourdit un mail qui contient déjà ~60 adresses (voir le seuil de coupure Gmail
// documenté dans estimateSizeKb plus bas).
import type { Card, VoyageContent } from "@/content/voyages";

export type ItineraryDestination = {
  id: string;
  title: string;
  slug: string;
  score: number;
  voyage: VoyageContent;
};

export type ItineraryEmailInput = {
  archetypeTitle: string;
  destinations: ItineraryDestination[];
};

const SITE_URL = "https://levoyagedesemotions.fr";

// Palette du site, en dur : un mail ne peut pas lire les variables CSS de la page.
const C = {
  ink: "#1a1714",
  paper: "#faf7f0",
  card: "#ffffff",
  border: "#e4dfd3",
  terracotta: "#c4622d",
  terracottaDark: "#8c4a32",
  muted: "#6b6259",
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// L'avis de Soumia sur une adresse fait parfois plusieurs phrases : dans le mail on garde une
// accroche, le texte complet reste sur la fiche. Coupe sur un mot entier, jamais au milieu.
function truncate(value: string, max = 170): string {
  const clean = value.trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).replace(/[,;:.\s]+$/, "")}…`;
}

// Nombre d'adresses montrées par destination dans le mail (09/09/2026). Volontairement bas : le
// mail donne envie, la fiche donne tout.
export const PREVIEW_ADDRESSES_PER_DESTINATION = 3;

const CATEGORY_LABEL = { stay: "Où dormir", eat: "Où manger", activity: "Quoi faire" } as const;

type PreviewAddress = { card: Card; category: keyof typeof CATEGORY_LABEL };

// Choix des 3 adresses : une par catégorie d'abord (dormir, manger, faire) pour montrer l'étendue
// du carnet plutôt que trois restos d'affilée, puis on complète avec ce qui reste si une catégorie
// est vide (plusieurs carnets n'ont pas encore d'activité renseignée).
function pickPreviewAddresses(voyage: VoyageContent): PreviewAddress[] {
  const byCategory: PreviewAddress[][] = [
    voyage.stays.map((card) => ({ card, category: "stay" as const })),
    voyage.eats.map((card) => ({ card, category: "eat" as const })),
    voyage.activities.map((card) => ({ card, category: "activity" as const })),
  ];

  const picked: PreviewAddress[] = [];
  for (let round = 0; picked.length < PREVIEW_ADDRESSES_PER_DESTINATION; round++) {
    const before = picked.length;
    for (const list of byCategory) {
      if (picked.length >= PREVIEW_ADDRESSES_PER_DESTINATION) break;
      if (list[round]) picked.push(list[round]);
    }
    if (picked.length === before) break; // plus rien à prendre nulle part
  }
  return picked;
}

function addressRow({ card, category }: PreviewAddress, showLabel: boolean): string {
  const name = esc(card.name);
  // L'adresse renvoie vers son propre site quand Soumia a renseigné un lien, sinon elle reste en
  // texte : pas de lien inventé (même règle que sur la fiche).
  const nameHtml = card.link
    ? `<a href="${esc(card.link)}" style="color:${C.terracotta};text-decoration:none;font-weight:600;">${name}</a>`
    : `<span style="font-weight:600;color:${C.ink};">${name}</span>`;
  const location = card.location ? ` <span style="color:${C.muted};">· ${esc(card.location)}</span>` : "";
  const price = card.price ? ` <span style="color:${C.muted};">· ${esc(card.price)}</span>` : "";
  const review = card.review
    ? `<div style="font-size:13px;line-height:1.5;color:${C.muted};margin-top:2px;">${esc(truncate(card.review))}</div>`
    : "";

  return `<tr><td style="padding:0 0 16px;">
    ${
      showLabel
        ? `<p style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:${C.terracottaDark};margin:0 0 3px;font-weight:700;">
            ${CATEGORY_LABEL[category]}
          </p>`
        : ""
    }
    <div style="font-size:15px;line-height:1.4;">${nameHtml}${location}${price}</div>
    ${review}
  </td></tr>`;
}

function destinationBlock(destination: ItineraryDestination, rank: number): string {
  const { voyage } = destination;
  const ficheUrl = `${SITE_URL}/voyages/${destination.slug}?id=${destination.id}`;
  const addressCount = voyage.stays.length + voyage.eats.length + voyage.activities.length;
  const preview = pickPreviewAddresses(voyage);
  const remaining = addressCount - preview.length;

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background:${C.card};border:1px solid ${C.border};border-radius:14px;margin:0 0 20px;">
    <tr><td style="padding:24px;">
      <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${C.muted};margin:0 0 6px;">
        Destination ${rank} · ${destination.score}% de match
      </p>
      <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 10px;color:${C.ink};">
        ${esc(destination.title)}
      </h2>
      <p style="font-size:14px;line-height:1.6;color:${C.muted};margin:0;">
        ${esc(truncate(voyage.intro, 260))}
      </p>
      ${
        preview.length > 0
          ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;border-top:1px solid ${C.border};padding-top:4px;">
              <tr><td style="height:16px;"></td></tr>
              ${preview
                .map((entry, i) => addressRow(entry, i === 0 || preview[i - 1].category !== entry.category))
                .join("")}
            </table>`
          : ""
      }
      ${
        remaining > 0
          ? `<p style="font-size:13px;color:${C.muted};margin:0 0 16px;">
              + ${remaining} autre${remaining > 1 ? "s" : ""} adresse${remaining > 1 ? "s" : ""} dans le carnet.
            </p>`
          : ""
      }
      <p style="margin:${remaining > 0 ? "0" : "22px 0 0"};">
        <a href="${ficheUrl}" style="display:inline-block;background:${C.terracotta};color:#ffffff;padding:11px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
          Voir le carnet complet${addressCount > 0 ? ` (${addressCount} adresse${addressCount > 1 ? "s" : ""})` : ""}
        </a>
      </p>
    </td></tr>
  </table>`;
}

export function buildItineraryEmailHtml(input: ItineraryEmailInput): string {
  return `<!doctype html>
<html lang="fr"><body style="margin:0;padding:0;background:${C.paper};">
<div style="background:${C.paper};padding:32px 16px;font-family:Georgia,'Times New Roman',serif;color:${C.ink};">
  <div style="max-width:600px;margin:0 auto;">
    <p style="font-family:Georgia,serif;letter-spacing:0.18em;font-size:13px;color:${C.terracottaDark};margin:0 0 24px;text-align:center;">
      LVE · LE VOYAGE DES ÉMOTIONS
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background:${C.card};border:1px solid ${C.border};border-radius:14px;margin:0 0 20px;">
      <tr><td style="padding:28px 24px;">
        <p style="text-transform:uppercase;letter-spacing:0.08em;font-size:11px;color:${C.terracottaDark};margin:0 0 8px;">
          Votre profil de voyageur
        </p>
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:27px;margin:0 0 14px;color:${C.ink};">
          ${esc(input.archetypeTitle)}
        </h1>
        <p style="font-size:15px;line-height:1.6;margin:0;color:${C.muted};">
          Voici votre itinéraire : les trois destinations qui vous correspondent le plus, et un
          avant-goût de mes adresses testées sur place. Le carnet complet vous attend sur le site.
        </p>
      </td></tr>
    </table>

    ${input.destinations.map((d, i) => destinationBlock(d, i + 1)).join("")}

    <p style="font-size:12px;line-height:1.6;color:${C.muted};text-align:center;margin:26px 0 0;">
      Vous recevez ce message parce que vous avez demandé votre itinéraire sur
      <a href="${SITE_URL}" style="color:${C.terracottaDark};">levoyagedesemotions.fr</a>.<br>
      Un pays, une histoire, une photo à la fois.
    </p>
  </div>
</div>
</body></html>`;
}

// Gmail coupe un message au-delà de ~102 Ko et affiche un "Message tronqué" qui casse la fin du
// mail. Avec 3 carnets complets on s'en approche : cette mesure sert de garde-fou visible en log
// et en prévisualisation, pas de blocage.
export const GMAIL_CLIP_KB = 102;

export function estimateSizeKb(html: string): number {
  return Math.round((Buffer.byteLength(html, "utf8") / 1024) * 10) / 10;
}
