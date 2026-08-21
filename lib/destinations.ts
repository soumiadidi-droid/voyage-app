import type { Attributes } from "./questionnaire";

export type ContextTags = {
  climate: string;
  landscape: string;
  mobility: string;
  safety: string;
  distanceHaul: string;
};

export type Destination = {
  slug: string;
  title: string;
  tagline: string;
  // Profil d'attributs 0-100. Reconstruit à partir du contenu récupéré (pas les valeurs exactes
  // du moteur original, qui tourne côté serveur et n'est pas récupérable) — voir CLAUDE.md.
  profile: Required<Attributes>;
  context: ContextTags;
};

// sportScore : proposition initiale de Claude à valider par Soumia (voir CLAUDE.md, section
// "Question sport"). Basé sur les indices présents dans le contenu récupéré des fiches voyage
// (ex. surf mentionné explicitement à Côte Basque).
export const DESTINATIONS: Destination[] = [
  {
    slug: "crete",
    title: "Crète",
    tagline: "Agios Nikolaos, la baie de Mirabello, et une eau d'un bleu qu'on n'attendait pas.",
    profile: {
      luxury: 55, nightlife: 30, family: 40, authenticity: 55, nature: 55,
      food: 60, culture: 60, beach: 85, city: 20, shopping: 25, sport: 45,
    },
    context: { climate: "méditerranéen", landscape: "plage/île", mobility: "voiture recommandée", safety: "standard", distanceHaul: "moyen-courrier" },
  },
  {
    slug: "japon",
    title: "Japon",
    tagline: "Osaka, ses rues et sa décontraction — puis une côte où plus rien ne bouge.",
    profile: {
      luxury: 40, nightlife: 55, family: 35, authenticity: 65, nature: 45,
      food: 75, culture: 80, beach: 15, city: 85, shopping: 60, sport: 35,
    },
    context: { climate: "tempéré", landscape: "ville/urbain", mobility: "sans voiture", safety: "sécurisé", distanceHaul: "long-courrier" },
  },
  {
    slug: "mykonos",
    title: "Mykonos",
    tagline: "Quatre jours entre copines en juin — plages, ruelles blanches et moulins au coucher du soleil.",
    profile: {
      luxury: 70, nightlife: 85, family: 25, authenticity: 40, nature: 30,
      food: 55, culture: 30, beach: 90, city: 30, shopping: 70, sport: 30,
    },
    context: { climate: "méditerranéen", landscape: "plage/île", mobility: "flexible", safety: "standard", distanceHaul: "moyen-courrier" },
  },
  {
    slug: "dubai",
    title: "Dubaï",
    tagline: "Gratte-ciel, plages et vieux quartier — le grand écart entre skyline et Al Fahidi.",
    profile: {
      luxury: 90, nightlife: 60, family: 55, authenticity: 20, nature: 15,
      food: 55, culture: 35, beach: 55, city: 90, shopping: 90, sport: 30,
    },
    context: { climate: "désertique", landscape: "ville/urbain", mobility: "voiture recommandée", safety: "standard", distanceHaul: "moyen-courrier" },
  },
  {
    slug: "cote-basque",
    title: "Côte Basque",
    tagline: "Biarritz, Saint-Jean-de-Luz — surf, couchers de soleil et gâteau basque, en attendant Cap Breton, Seignosse et Hossegor.",
    profile: {
      luxury: 45, nightlife: 35, family: 55, authenticity: 60, nature: 55,
      food: 65, culture: 35, beach: 75, city: 30, shopping: 30, sport: 80,
    },
    context: { climate: "tempéré", landscape: "plage/île", mobility: "sans voiture", safety: "sécurisé", distanceHaul: "court-courrier" },
  },
  {
    slug: "lisbonne",
    title: "Lisbonne",
    tagline: "Collines, azulejos et lumière atlantique — Lisbonne et une excursion à Sintra.",
    profile: {
      luxury: 40, nightlife: 55, family: 35, authenticity: 65, nature: 25,
      food: 60, culture: 75, beach: 25, city: 80, shopping: 45, sport: 35,
    },
    context: { climate: "méditerranéen", landscape: "ville/urbain", mobility: "sans voiture", safety: "sécurisé", distanceHaul: "court-courrier" },
  },
  {
    slug: "porto",
    title: "Porto",
    tagline: "Toits en tuile, ruelles escarpées et la Douro en contrebas — l'autre grande ville du Portugal.",
    profile: {
      luxury: 35, nightlife: 40, family: 35, authenticity: 70, nature: 30,
      food: 65, culture: 70, beach: 20, city: 75, shopping: 35, sport: 30,
    },
    context: { climate: "tempéré", landscape: "ville/urbain", mobility: "sans voiture", safety: "sécurisé", distanceHaul: "court-courrier" },
  },
  {
    slug: "italie",
    title: "Italie",
    tagline: "Pise, Florence, Rome, Sorrente, Bari — cinq villes en Italie, en juillet.",
    profile: {
      luxury: 50, nightlife: 40, family: 50, authenticity: 60, nature: 35,
      food: 85, culture: 90, beach: 40, city: 70, shopping: 55, sport: 30,
    },
    context: { climate: "méditerranéen", landscape: "ville/urbain", mobility: "voiture recommandée", safety: "sécurisé", distanceHaul: "moyen-courrier" },
  },
  {
    slug: "amerique-du-nord-hiver",
    title: "Amérique du Nord en hiver",
    tagline: "Montréal sous la neige puis New York, entre Empire State et Oculus.",
    profile: {
      luxury: 45, nightlife: 40, family: 40, authenticity: 45, nature: 60,
      food: 55, culture: 55, beach: 5, city: 75, shopping: 55, sport: 55,
    },
    context: { climate: "nordique", landscape: "ville/urbain", mobility: "sans voiture", safety: "standard", distanceHaul: "long-courrier" },
  },
];
