import amerique from "./amerique-du-nord-hiver.json";
import coteBasque from "./cote-basque.json";
import crete from "./crete.json";
import dubai from "./dubai.json";
import italie from "./italie.json";
import japon from "./japon.json";
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
  amerique, coteBasque, crete, dubai, italie, japon, lisbonne, mykonos, porto,
] as VoyageContent[];

export function getVoyage(slug: string): VoyageContent | undefined {
  return VOYAGES.find((v) => v.slug === slug);
}
