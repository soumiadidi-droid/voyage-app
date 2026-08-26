import montreal from "./montreal.json";
import newYork from "./new-york.json";
import coteBasque from "./cote-basque.json";
import crete from "./crete.json";
import dubai from "./dubai.json";
import italieNordCulture from "./italie-nord-culture.json";
import italieSorrenteAmalfe from "./italie-sorrente-amalfe.json";
import italiePouilles from "./italie-pouilles.json";
import japonUrbain from "./japon-urbain.json";
import japonTraditionNature from "./japon-tradition-nature.json";
import lisbonne from "./lisbonne.json";
import mykonos from "./mykonos.json";
import porto from "./porto.json";

export type Card = {
  name: string;
  status: string;
  location: string;
  review: string;
  tags: string[];
  link: string | null;
  linkLabel: string | null;
  // Affiliation/partenariat B2B (badge "Partenaire" sur la fiche) — décidé le 23/08/2026.
  // Optionnel : aucune adresse existante n'est marquée, à renseigner par Soumia adresse par
  // adresse, jamais déduit ou inventé par Claude.
  isPartner?: boolean;
  // Vignette de la carte adresse — décidé le 23/08/2026. Optionnel : aucune adresse existante n'en
  // a pour l'instant (fallback visuel tant que le champ n'est pas renseigné), à ajouter adresse par
  // adresse par Soumia.
  image?: string;
};

export type GalleryItem = {
  hiresUrl: string;
  webUrl: string;
  alt: string;
  caption: string;
  emotionalText: string;
};

export type VoyageContent = {
  slug: string;
  hero: {
    image: string;
    country: string;
    tags: string[];
    title: string;
    tagline: string;
    photoCount: string;
  };
  intro: string;
  gallery: GalleryItem[];
  stays: Card[];
  eats: Card[];
  activities: Card[];
};

export const VOYAGES: VoyageContent[] = [
  montreal, newYork, coteBasque, crete, dubai, italieNordCulture, italieSorrenteAmalfe, italiePouilles,
  japonUrbain, japonTraditionNature, lisbonne, mykonos, porto,
] as VoyageContent[];

export function getVoyage(slug: string): VoyageContent | undefined {
  return VOYAGES.find((v) => v.slug === slug);
}
