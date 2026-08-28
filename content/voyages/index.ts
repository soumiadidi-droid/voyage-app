import type { FamilyProfile } from "@/lib/travel-match/types";
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

// Contenu du pavé "Adapté aux Familles" d'une fiche hôtel, personnalisé par profil d'âge
// (27/08/2026). Un hôtel peut avoir 1 à 4 entrées (une par FamilyProfile pertinent) — pas
// forcément les 4 : un hôtel sans équipement bébé n'a simplement pas d'entrée "tout_petits".
export type FamilyFit = {
  beds: string; // ex. "Lit bébé sur demande, chambre communicante disponible"
  equipment: string[]; // ex. ["Chaise haute", "Baignoire bébé", "Kit sécurité prises"]
  services: string[]; // ex. ["Baby-sitting sur réservation", "Menu enfant au restaurant"]
  activities: string[]; // ex. ["Piscine peu profonde", "Club enfants (4-10 ans)"]
};

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
  // Pavé "Adapté aux Familles" (27/08/2026) — pertinent seulement pour les cartes de type hôtel
  // (`stays`), ignoré ailleurs. Optionnel et vide par défaut sur toutes les adresses existantes :
  // contenu à écrire hôtel par hôtel par Soumia, jamais inventé par Claude (même règle que pour
  // isPartner/image ci-dessus).
  familyFit?: Partial<Record<FamilyProfile, FamilyFit>>;
  // Prix (28/08/2026) — texte libre, ex. "45€ la nuit", "Menu à partir de 25€". Optionnel : aucune
  // adresse existante n'en a pour l'instant (aucun vrai prix n'a jamais été donné), à renseigner
  // adresse par adresse, jamais inventé.
  price?: string;
  // Post/reel Instagram source de l'adresse (28/08/2026) — URL canonique validée à l'ingestion
  // (https://www.instagram.com/p/{id}/ ou /reel/{id}/), affichée en embed sur la fiche via
  // app/components/InstagramEmbed.tsx. Optionnel, jamais inventé.
  instagramUrl?: string;
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
