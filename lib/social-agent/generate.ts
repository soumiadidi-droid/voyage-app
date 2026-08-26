import type { Destination } from "@/lib/travel-match/types";
import type { Card, VoyageContent } from "@/content/voyages";
import { CATEGORY_PHOTO_OVERRIDE, type AddressCategory } from "@/lib/category-images";
import { DESTINATION_HERO_IMAGE } from "@/lib/hero-images";

// Agent Social Media — décidé le 26/08/2026. Générateur par templates (pas d'appel à un modèle
// d'IA externe : aucune clé API n'est configurée sur ce projet, et le site s'interdit partout
// ailleurs d'inventer du contenu narratif — cf. règle "rien n'est inventé par Claude" appliquée
// aux fiches voyage). Ce générateur compose donc des textes à partir de données réelles
// (résumé de la destination, vraies adresses testées) sur des structures rédigées à l'avance —
// à relire et ajuster avant publication, comme tout premier jet.

export type SocialFormat = "carousel" | "linkedin" | "reel" | "newsletter";
export type SocialAngle = "gastronomie" | "nature" | "secret" | "urbain";

export const FORMATS: { value: SocialFormat; label: string }[] = [
  { value: "carousel", label: "Carousel Instagram" },
  { value: "linkedin", label: "Post LinkedIn" },
  { value: "reel", label: "Script Reel/TikTok" },
  { value: "newsletter", label: "Newsletter" },
];

export const ANGLES: { value: SocialAngle; label: string }[] = [
  { value: "gastronomie", label: "Gastronomie" },
  { value: "nature", label: "Nature & Calme" },
  { value: "secret", label: "Secret Spot" },
  { value: "urbain", label: "Flânerie Urbaine" },
];

const CTA = "Trouvez votre prochaine destination sur Travel Match — Lien en bio.";
const CTA_NEWSLETTER = "Trouvez votre prochaine destination sur Travel Match →";

// Accroches génériques (pas d'accord de genre/préposition avec le nom de la destination — le
// titre est toujours affiché à part, jamais imbriqué dans la phrase, pour rester correct quel que
// soit le nom : "Dubaï", "Italie : Florence, Rome & Pise", etc.).
const HOOKS: Record<SocialAngle, string[]> = {
  gastronomie: [
    "On ne se souvient jamais d'une ville par ses monuments. On s'en souvient par ce qu'on y a mangé.",
    "Le meilleur souvenir d'un voyage tient parfois dans une seule table, à la bonne heure.",
    "Ici, le vrai guide touristique, c'est l'appétit.",
  ],
  nature: [
    "Il y a des endroits où le temps ralentit tout seul.",
    "Pas de plan, pas d'horaire — juste l'envie de ne rien faire de spécial.",
    "Le luxe, parfois, c'est de ne plus regarder l'heure.",
  ],
  secret: [
    "On ne devrait peut-être pas partager ça.",
    "Ce qu'on garde d'habitude pour soi.",
    "Loin des cartes postales, il y a toujours autre chose.",
  ],
  urbain: [
    "Ça se marche, ça se perd, ça se recommence — sans itinéraire.",
    "La meilleure façon de découvrir une ville, c'est de ne pas savoir où on va.",
    "Vue d'en bas, au rythme d'une flânerie sans plan.",
  ],
};

const HASHTAGS: Record<SocialAngle, string> = {
  gastronomie: "#Foodie",
  nature: "#SlowTravel",
  secret: "#SecretSpot",
  urbain: "#CityGuide",
};

// `seed` déterministe (pas de Math.random()) : un composant client Next.js est d'abord rendu côté
// serveur puis réhydraté côté client, et un hasard réel donnerait deux résultats différents entre
// les deux passes — React lève alors une erreur d'hydratation. Le seed (ex. le compteur de
// régénérations) fait varier le choix sans jamais désynchroniser serveur et client.
function pickHook(angle: SocialAngle, seed: number): string {
  const options = HOOKS[angle];
  return options[seed % options.length];
}

export type AddressPick = { card: Card; category: AddressCategory };

// Pioche 2 à 3 adresses réelles dans les catégories les plus pertinentes pour l'angle choisi,
// avec repli sur tout ce qui existe si la catégorie prioritaire est vide — jamais d'adresse
// inventée, seulement ce qui est déjà dans content/voyages/*.json. La catégorie est conservée
// pour choisir le bon visuel (texture) par adresse, cf. CATEGORY_PHOTO_OVERRIDE.
function pickAddresses(voyage: VoyageContent, angle: SocialAngle): AddressPick[] {
  const pools: Record<SocialAngle, { cards: Card[]; category: AddressCategory }[]> = {
    gastronomie: [
      { cards: voyage.eats, category: "Resto" },
      { cards: voyage.activities, category: "Activité" },
      { cards: voyage.stays, category: "Hôtel" },
    ],
    nature: [
      { cards: voyage.activities, category: "Activité" },
      { cards: voyage.eats, category: "Resto" },
      { cards: voyage.stays, category: "Hôtel" },
    ],
    secret: [
      { cards: voyage.activities, category: "Activité" },
      { cards: voyage.eats, category: "Resto" },
      { cards: voyage.stays, category: "Hôtel" },
    ],
    urbain: [
      { cards: voyage.stays, category: "Hôtel" },
      { cards: voyage.activities, category: "Activité" },
      { cards: voyage.eats, category: "Resto" },
    ],
  };
  for (const pool of pools[angle]) {
    if (pool.cards.length > 0) {
      return pool.cards.slice(0, 3).map((card) => ({ card, category: pool.category }));
    }
  }
  return [];
}

function formatAddressLine(pick: AddressPick, prefix: string): string {
  return `${prefix} ${pick.card.name} — ${pick.card.review}`;
}

export type Slide = {
  label: string; // "Diapo 1", "Diapo 2"...
  body: string;
  visual: string; // chemin d'image, toujours renseigné (cover ou texture de catégorie)
};

export type GeneratedPost = {
  angle: SocialAngle;
  format: SocialFormat;
  text: string; // texte complet à copier (caption Instagram, post LinkedIn, script, newsletter)
  coverImage?: string;
  // Renseigné uniquement pour le format carousel — une diapo par visuel à prévoir.
  slides?: Slide[];
};

export function generatePost(
  destination: Destination,
  voyage: VoyageContent,
  format: SocialFormat,
  angle: SocialAngle,
  seed = 0
): GeneratedPost {
  const hook = pickHook(angle, seed);
  const addresses = pickAddresses(voyage, angle);
  const hasAddresses = addresses.length > 0;
  const coverImage = DESTINATION_HERO_IMAGE[destination.content_slug];

  let text: string;
  let slides: Slide[] | undefined;

  if (format === "carousel") {
    const addressSlides: Slide[] = addresses.map((pick, i) => ({
      label: `Diapo ${i + 2}`,
      body: formatAddressLine(pick, "📍"),
      visual: CATEGORY_PHOTO_OVERRIDE[pick.category],
    }));
    slides = [
      { label: "Diapo 1", body: `${destination.title}\n${hook}`, visual: coverImage ?? CATEGORY_PHOTO_OVERRIDE.Activité },
      ...addressSlides,
      {
        label: `Diapo ${addresses.length + 2}`,
        body: `${destination.summary}\n\n${CTA}`,
        visual: coverImage ?? CATEGORY_PHOTO_OVERRIDE.Activité,
      },
    ];
    const tags = destination.tags.map((t) => `#${t}`).join(" ");
    text = `${slides.map((s) => `${s.label}\n${s.body}`).join("\n\n")}\n\n#TravelMatch #VoyageDesEmotions ${HASHTAGS[angle]} ${tags}`;
  } else if (format === "linkedin") {
    const body = hasAddresses
      ? `\n\nSur place :\n${addresses.map((p) => formatAddressLine(p, "—")).join("\n")}`
      : "";
    text = `${destination.title}\n\n${hook}\n\n${destination.summary}${body}\n\n${CTA}`;
  } else if (format === "reel") {
    const beats = addresses.map((pick, i) => {
      const start = 3 + i * 5;
      return `[${start}-${start + 5}s] ${formatAddressLine(pick, "→")}`;
    });
    const ctaStart = 3 + addresses.length * 5;
    text = [
      `[0-3s] ${hook} (plan sur ${destination.title})`,
      ...beats,
      `[${ctaStart}-${ctaStart + 2}s] ${CTA}`,
      "",
      `🎵 Suggestion son : ambiance ${ANGLES.find((a) => a.value === angle)?.label.toLowerCase()}`,
    ].join("\n");
  } else {
    const body = hasAddresses
      ? `\n\nNos adresses testées :\n${addresses.map((p) => formatAddressLine(p, "📍")).join("\n")}`
      : "";
    text = `Objet : ${destination.title} — ${hook}\n\nBonjour,\n\n${hook} ${destination.summary}${body}\n\n${CTA_NEWSLETTER}\n\n— L'équipe Voyage des Émotions`;
  }

  return { angle, format, text, coverImage, slides };
}
