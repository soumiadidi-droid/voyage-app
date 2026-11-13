// Référencement (13/11/2026). Décision de Soumia : les fiches sont la porte d'entrée depuis Google
// (option « a ») — Travel Match se découvre ensuite, via le bloc QuizCta en fin de fiche.
//
// Titres de recherche, un par carnet : ce que les gens tapent (« adresses Hossegor », « où manger
// Tokyo »), pas le seul nom de la ville. Écrits à la main, jamais générés : chaque titre doit rester
// vrai (pas de « testées » sur un carnet seulement repéré, cf. les deux carnets Chine en
// bucket_list). Un carnet absent de la liste garde son nom tout court.
import type { VoyageContent, Card } from "@/content/voyages";
import { SITE_URL } from "@/lib/site";
import { estVecue } from "@/lib/carnets";

export const TITRES_SEO: Record<string, string> = {
  paris: "Paris : mes adresses testées, par ambiance et par quartier",
  "val-d-europe": "Val d'Europe : les adresses d'une habitante",
  hossegor: "Hossegor hors saison : mes adresses entre lac et océan",
  "cote-basque": "Biarritz : mes adresses, entre surf et plages chics",
  marseille: "Marseille : mes adresses, du Vieux-Port aux calanques",
  "japon-urbain": "Tokyo et Osaka : mes adresses, street food et quartiers",
  "japon-tradition-nature": "Kyoto, mont Fuji et Shimoda : temples, ryokans et adresses",
  lisbonne: "Lisbonne et Sintra : mes adresses testées",
  porto: "Porto : mes adresses",
  londres: "Londres : palaces, rooftops et bonnes adresses",
  "new-york": "New York : mes adresses, de l'Empire State à l'Oculus",
  montreal: "Montréal en hiver : cafés, architecture et adresses",
  crete: "Crète : Agios Nikolaos et la baie de Mirabello, mes adresses",
  mykonos: "Mykonos entre copines : plages, ruelles et adresses",
  dubai: "Dubaï : entre gratte-ciel et vieux quartier",
  ibiza: "Ibiza hors saison : l'île en février",
  florence: "Florence : la Renaissance à pied",
  "italie-pouilles": "Bari et les Pouilles : mes adresses",
  "italie-sorrente-amalfe": "Sorrente et la côte amalfitaine",
  "chine-urbaine": "Hong Kong, Shanghai et Pékin : mes repérages",
  "chine-nature": "Yangshuo et Zhangjiajie : mes repérages",
};

export function titreSeo(voyage: VoyageContent): string {
  return TITRES_SEO[voyage.slug] ?? voyage.hero.title;
}

// Étiquettes pour Google (données structurées) : la fiche est un article signé qui parle d'une
// destination et cite des lieux réels — hôtels, restaurants, activités. Rien de plus que ce que la
// page affiche (adresses visibles seulement), et aucune note : Soumia raconte, elle ne note pas.
const TYPE_PAR_CATEGORIE = {
  stays: "LodgingBusiness",
  eats: "FoodEstablishment",
  activities: "TouristAttraction",
} as const;

function lieu(c: Card, type: string) {
  return {
    "@type": type,
    name: c.name,
    ...(c.location ? { address: c.location } : {}),
    ...(c.link && /^https?:\/\//.test(c.link) && !/instagram\.com/.test(c.link) ? { url: c.link } : {}),
  };
}

export function ficheJsonLd(voyage: VoyageContent, description: string, image?: string) {
  const url = `${SITE_URL}/voyages/${voyage.slug}`;
  const lieux = (["stays", "eats", "activities"] as const).flatMap((k) =>
    voyage[k].map((c) => lieu(c, TYPE_PAR_CATEGORIE[k]))
  );
  const vecues = [...voyage.stays, ...voyage.eats, ...voyage.activities].filter((c) => estVecue(c.status)).length;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: titreSeo(voyage),
    description,
    url,
    mainEntityOfPage: url,
    inLanguage: "fr-FR",
    ...(image ? { image: image.startsWith("http") ? image : `${SITE_URL}${image}` } : {}),
    author: { "@type": "Person", name: "Soumia", url: `${SITE_URL}/philosophie` },
    publisher: { "@type": "Organization", name: "Le Voyage des Émotions", url: SITE_URL },
    about: { "@type": "TouristDestination", name: voyage.hero.title, containedInPlace: { "@type": "Country", name: voyage.hero.country } },
    ...(lieux.length
      ? {
          mentions: lieux,
          // Indication honnête du vécu, lisible par un humain qui lit le code source aussi.
          abstract: vecues > 0 ? `${vecues} adresse${vecues > 1 ? "s" : ""} testée${vecues > 1 ? "s" : ""} sur place.` : undefined,
        }
      : {}),
  };
}
