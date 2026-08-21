export type Attributes = Partial<{
  luxury: number;
  nightlife: number;
  family: number;
  authenticity: number;
  nature: number;
  food: number;
  culture: number;
  beach: number;
  city: number;
  shopping: number;
  sport: number;
}>;

export type QuestionOption = {
  value: string;
  label: string;
  attributes: Attributes;
  // tags carried through to /resultat for the contextual "comme recherché" copy
  tag?: Record<string, string>;
};

export type Question = {
  id: string;
  question: string;
  options: QuestionOption[];
};

// Les 9 premières questions sont le contenu EXACT du questionnaire original,
// récupéré verbatim depuis le bundle JS du site en ligne (voir .recovery/questionnaire_source.js)
// avant que le dossier local ne soit perdu. La question "sport" est la nouvelle 10e question.
export const QUESTIONS: Question[] = [
  {
    id: "esprit",
    question: "L'esprit du voyage",
    options: [
      { value: "luxe", label: "Luxe", attributes: { luxury: 9 } },
      {
        value: "lifestyle",
        label: "Lifestyle / Tendance",
        attributes: { luxury: 6, nightlife: 5 },
      },
      {
        value: "resort-famille",
        label: "Resort Famille",
        attributes: { family: 9, luxury: 5 },
      },
      {
        value: "backpacker",
        label: "Backpacker / Petit budget",
        attributes: { luxury: 2, authenticity: 6 },
      },
      {
        value: "aventure",
        label: "Aventure / Immersion",
        attributes: { authenticity: 8, nature: 5 },
      },
    ],
  },
  {
    id: "securite",
    question: "Exigence de sécurité",
    options: [
      {
        value: "maximale",
        label: "Sécurité maximale / zéro stress",
        attributes: {},
        tag: { safety: "maximale" },
      },
      {
        value: "standard",
        label: "Vigilance standard (réflexes urbains classiques)",
        attributes: {},
        tag: { safety: "standard" },
      },
      {
        value: "indifferent",
        label: "Indifférent, prêt à adapter mes habitudes",
        attributes: {},
        tag: { safety: "indifferent" },
      },
    ],
  },
  {
    id: "mobilite",
    question: "Mobilité sur place",
    options: [
      {
        value: "sans-voiture",
        label: "100 % sans voiture (à pied / transports)",
        attributes: {},
        tag: { mobility: "sans voiture" },
      },
      {
        value: "voiture",
        label: "Voiture / road-trip indispensable",
        attributes: {},
        tag: { mobility: "voiture recommandée" },
      },
      {
        value: "indifferent",
        label: "Indifférent",
        attributes: {},
        tag: { mobility: "indifferent" },
      },
    ],
  },
  {
    id: "gastronomie",
    question: "Importance de la cuisine / gastronomie",
    options: [
      {
        value: "priorite",
        label: "Priorité absolue (destination gourmande)",
        attributes: { food: 9 },
      },
      { value: "secondaire", label: "Secondaire", attributes: { food: 3 } },
    ],
  },
  {
    id: "culture",
    question: "Importance de la culture / histoire",
    options: [
      {
        value: "incontournable",
        label: "Incontournable (patrimoine, musées)",
        attributes: { culture: 9 },
      },
      { value: "secondaire", label: "Secondaire", attributes: { culture: 3 } },
    ],
  },
  {
    id: "climat",
    question: "Climat",
    options: [
      {
        value: "tropical",
        label: "Tropical / chaud",
        attributes: {},
        tag: { climate: "tropical" },
      },
      {
        value: "mediterraneen",
        label: "Doux / méditerranéen",
        attributes: {},
        tag: { climate: "méditerranéen" },
      },
      {
        value: "nordique",
        label: "Froid / nordique",
        attributes: {},
        tag: { climate: "nordique" },
      },
      {
        value: "desertique",
        label: "Désertique",
        attributes: {},
        tag: { climate: "désertique" },
      },
    ],
  },
  {
    id: "paysage",
    question: "Paysage",
    options: [
      {
        value: "plage",
        label: "Plage / île",
        attributes: { beach: 8 },
        tag: { landscape: "plage/île" },
      },
      {
        value: "montagne",
        label: "Montagne / nature",
        attributes: { nature: 8 },
        tag: { landscape: "montagne/nature" },
      },
      {
        value: "ville",
        label: "Ville / urbain",
        attributes: { city: 8 },
        tag: { landscape: "ville/urbain" },
      },
    ],
  },
  {
    id: "distance",
    question: "Distance",
    options: [
      {
        value: "court",
        label: "Court-courrier",
        attributes: {},
        tag: { distanceHaul: "court-courrier" },
      },
      {
        value: "moyen",
        label: "Moyen-courrier",
        attributes: {},
        tag: { distanceHaul: "moyen-courrier" },
      },
      {
        value: "long",
        label: "Long-courrier",
        attributes: {},
        tag: { distanceHaul: "long-courrier" },
      },
    ],
  },
  {
    id: "compagnons",
    question: "Avec qui tu voyages",
    options: [
      { value: "seul", label: "Solo", attributes: { authenticity: 6 } },
      { value: "couple", label: "Couple", attributes: { luxury: 5 } },
      { value: "famille", label: "Famille", attributes: { family: 9 } },
      { value: "amis", label: "Amis", attributes: { nightlife: 6 } },
    ],
  },
  {
    id: "sport",
    question: "Ton rapport au sport en vacances",
    options: [
      {
        value: "intense",
        label: "Sport tous les jours (rando, surf, vélo...)",
        attributes: { sport: 9, nature: 3 },
      },
      {
        value: "occasionnel",
        label: "Une activité de temps en temps",
        attributes: { sport: 5 },
      },
      {
        value: "zero",
        label: "Zéro sport, je suis en vacances",
        attributes: { sport: 1, luxury: 2 },
      },
    ],
  },
];
