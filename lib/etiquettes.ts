// Étiquettes lisibles (relecture du 11/09/2026) — les tags sont saisis en base comme des mots-clés
// ("GrandesVilles", "hyde-park", "rapport-qualite-prix"), ce qui faisait fichier de travail sous les
// yeux d'un partenaire. On les affiche en vrais mots sans toucher à la base : le moteur et les
// métadonnées continuent de lire la valeur brute.

// Les cas qu'une règle générale ne sait pas deviner : accents absents de la saisie, noms propres,
// traits d'union qui font partie du mot.
const LIBELLES: Record<string, string> = {
  BordDeMer: "Bord de mer",
  EntreAmies: "Entre amies",
  EspacesSauvages: "Espaces sauvages",
  GrandEcart: "Grand écart",
  GrandesVilles: "Grandes villes",
  HiverCosy: "Hiver cosy",
  RuelleAuthentique: "Ruelles authentiques",
  SlowLife: "Slow life",
  SoleilDouceur: "Soleil & douceur",
  francais: "Français",
  musee: "Musée",
  "rapport-qualite-prix": "Rapport qualité-prix",
  "art-deco": "Art déco",
  "banh-mi": "Bánh mì",
  "bien-être": "Bien-être",
  "petit-déjeuner": "Petit-déjeuner",
  "centre-ville": "Centre-ville",
  "rooftop / onsen": "Rooftop & onsen",
  "hyde-park": "Hyde Park",
  "east-village": "East Village",
  nomad: "NoMad",
};

const QUARTIERS = new Set([
  "bloomsbury",
  "brooklyn",
  "chelsea",
  "greenwich",
  "kensington",
  "shoreditch",
  "soho",
  "westminster",
  "williamsburg",
]);

export function libelleEtiquette(tag: string): string {
  const brut = tag.trim();
  if (LIBELLES[brut]) return LIBELLES[brut];
  if (QUARTIERS.has(brut.toLowerCase())) return brut.charAt(0).toUpperCase() + brut.slice(1).toLowerCase();
  const mots = brut
    .replace(/([a-zà-ÿ])([A-Z])/g, "$1 $2")
    .replace(/-/g, " ")
    .toLowerCase();
  return mots.charAt(0).toUpperCase() + mots.slice(1);
}

// Dédoublonnées après mise en forme : la base contient à la fois "coucher-de-soleil" et
// "coucher de soleil", "francais" et "français".
export function libellesEtiquettes(tags: string[]): string[] {
  return [...new Set(tags.map(libelleEtiquette))];
}
