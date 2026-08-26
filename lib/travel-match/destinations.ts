import type { Destination } from "./types";

// Scores (repos/exploration/gastronomie/nature_plage/effervescence_urbaine/rythme) migrés
// mécaniquement depuis l'ancien modèle émotions/vibe le 23/08/2026 :
// repos = moy(deconnexion, lacher_prise) ; exploration = moy(emerveillement, inspiration) ;
// gastronomie = ancien gourmandise ; nature_plage = ancien nature ;
// effervescence_urbaine = ancien densite_urbaine ; rythme = ancien pression_horaire.
// duration/budget : première passe de Claude, à valider par Soumia comme les précédentes.
export const DESTINATIONS: Destination[] = [
  {
    id: "italie-nord-culture",
    title: "Italie : Florence, Rome & Pise",
    authenticity_badge: "tested_approved",
    content_slug: "italie-nord-culture",
    summary:
      "Les trésors de la Renaissance, l'histoire romaine et les ruelles animées de la Toscane au Latium.",
    hero_image: "https://p65bp5tzcfivkgmn.public.blob.vercel-storage.com/italie/web-IMG_20260719_200001.jpg",
    filters: {
      distance: ["europe"],
      climate: ["chaleur", "douceur"],
      transport: ["transports_possibles"],
      sport_level: ["actif"],
      duration: ["week_end", "semaine", "grand_voyage"],
      budget: ["confort", "premium"],
    },
    scores: { repos: 3, exploration: 5, gastronomie: 5, nature_plage: 2, effervescence_urbaine: 4, rythme: 4 },
    logistics: { solo: true, duo: true, friends: true, family_kids_under_6: true, family_kids_over_6: true },
    tags: ["GrandesVilles", "Foodie", "RuelleAuthentique"],
    suggested_combos: [],
    regional_transport: {
      recommended_mode: "Train à grande vitesse (Frecciarossa)",
      pass_or_tip: "Réserver les billets à l'avance pour les meilleurs tarifs",
      summary: "Liaison rapide et fréquente entre Florence, Rome et Pise, sans avoir besoin de voiture.",
    },
  },
  {
    id: "italie-sorrente-amalfe",
    title: "Italie : Sorrente & Côte Amalfitaine",
    authenticity_badge: "tested_approved",
    content_slug: "italie-sorrente-amalfe",
    summary: "Falaises escarpées, citronniers, cités perchées et douceur méditerranéenne face à la mer.",
    hero_image: "https://p65bp5tzcfivkgmn.public.blob.vercel-storage.com/italie/web-IMG_20260723_201932.jpg",
    filters: {
      distance: ["europe"],
      climate: ["chaleur", "douceur"],
      transport: ["transports_possibles", "voiture_necessaire"],
      sport_level: ["actif", "tranquille"],
      duration: ["week_end", "semaine", "grand_voyage"],
      budget: ["confort", "premium"],
    },
    scores: { repos: 4, exploration: 5, gastronomie: 5, nature_plage: 4, effervescence_urbaine: 3, rythme: 2 },
    logistics: { solo: true, duo: true, friends: true, family_kids_under_6: true, family_kids_over_6: true },
    tags: ["BordDeMer", "SoleilDouceur", "Foodie", "SlowLife"],
    suggested_combos: [],
  },
  {
    id: "italie-pouilles",
    title: "Italie : Les Pouilles (Bari)",
    authenticity_badge: "tested_approved",
    content_slug: "italie-pouilles",
    summary: "Eaux turquoises, ruelles blanchies à la chaux, trulli et gastronomie authentique du Sud.",
    hero_image: "https://p65bp5tzcfivkgmn.public.blob.vercel-storage.com/italie/web-IMG_20260730_185631.jpg",
    filters: {
      distance: ["europe"],
      climate: ["chaleur"],
      transport: ["voiture_necessaire"],
      sport_level: ["tranquille"],
      duration: ["week_end", "semaine", "grand_voyage"],
      budget: ["eco", "confort", "premium"],
    },
    scores: { repos: 5, exploration: 4, gastronomie: 5, nature_plage: 4, effervescence_urbaine: 2, rythme: 1 },
    logistics: { solo: true, duo: true, friends: true, family_kids_under_6: true, family_kids_over_6: true },
    tags: ["BordDeMer", "Foodie", "RuelleAuthentique", "SlowLife"],
    suggested_combos: [],
  },
  {
    id: "montreal",
    title: "Montréal",
    authenticity_badge: "tested_approved",
    content_slug: "montreal",
    summary:
      "Vivre Montréal au rythme des 4 saisons — ruelles verdoyantes en été, couleurs de l'automne, Mont-Royal et froid extrême de l'hiver.",
    hero_image: "https://...",
    filters: {
      distance: ["long_courrier"],
      climate: ["chaleur", "douceur", "hiver_cosy"],
      transport: ["sans_voiture", "transports_possibles", "voiture_necessaire"],
      sport_level: ["actif"],
      duration: ["semaine", "grand_voyage"],
      budget: ["eco", "confort", "premium"],
    },
    scores: { repos: 4, exploration: 5, gastronomie: 4, nature_plage: 5, effervescence_urbaine: 4, rythme: 3 },
    logistics: { solo: true, duo: true, friends: true, family_kids_under_6: true, family_kids_over_6: true },
    tags: ["GrandesVilles", "HiverCosy", "EspacesSauvages", "Foodie"],
    // Le combo Montréal<->New York n'est déclaré qu'une seule fois, côté New York (voir plus bas) —
    // décidé le 23/08/2026 pour ne plus saisir la même paire deux fois. Le sens retour est déduit
    // automatiquement par lib/travel-match/combos.ts (getCombosFor).
    suggested_combos: [],
  },
  {
    id: "new-york",
    title: "New York",
    authenticity_badge: "tested_approved",
    content_slug: "new-york",
    summary:
      "Six voyages, mille facettes — l'énergie brute de Manhattan, la vibe de Brooklyn, Central Park et la magie de la ville en hiver.",
    hero_image: "https://...",
    filters: {
      distance: ["long_courrier"],
      climate: ["douceur", "hiver_cosy", "chaleur"],
      transport: ["sans_voiture", "transports_possibles"],
      sport_level: ["actif"],
      duration: ["semaine", "grand_voyage"],
      budget: ["confort", "premium"],
    },
    scores: { repos: 4, exploration: 5, gastronomie: 5, nature_plage: 2, effervescence_urbaine: 5, rythme: 5 },
    logistics: { solo: true, duo: true, friends: true, family_kids_under_6: true, family_kids_over_6: true },
    tags: ["GrandesVilles", "Foodie", "HiverCosy", "SoleilDouceur"],
    suggested_combos: [
      {
        id: "combo-nyc-montreal",
        target_destination_id: "montreal",
        title: "Combo Métropole & Nature : New York x Montréal",
        vibe_type: "Énergie urbaine & grand air",
        description:
          "Deux métropoles nord-américaines aux tempéraments complémentaires : l'effervescence électrique de Manhattan d'un côté, les grands espaces et la douceur québécoise de l'autre.",
        transition_logistics: {
          transport_mode: "Vol direct (1h30), voiture (6h) ou train/bus Amtrak (10h)",
          recommended_days: "3 à 4 jours sur place",
          practical_tip:
            "L'agence Vacances Dragon propose des forfaits pas chers avec hébergement en dehors de la ville mais transfert quotidien inclus — rapport qualité-prix imbattable.",
          partner_link: "https://vacancesdragon.com/fr",
          partner_link_label: "Voir les forfaits Vacances Dragon →",
        },
        min_duration_required: "semaine",
      },
    ],
  },
  {
    id: "crete",
    title: "Crète",
    authenticity_badge: "tested_approved",
    content_slug: "crete",
    summary: "Agios Nikolaos, la baie de Mirabello, et une eau d'un bleu qu'on n'attendait pas.",
    hero_image: "https://p65bp5tzcfivkgmn.public.blob.vercel-storage.com/crete/hero-eau-turquoise.jpg",
    filters: {
      distance: ["europe"],
      climate: ["chaleur", "douceur"],
      transport: ["voiture_necessaire"],
      sport_level: ["tranquille", "actif"],
      duration: ["week_end", "semaine", "grand_voyage"],
      budget: ["eco", "confort", "premium"],
    },
    scores: { repos: 5, exploration: 4, gastronomie: 4, nature_plage: 5, effervescence_urbaine: 2, rythme: 1 },
    logistics: { solo: true, duo: true, friends: true, family_kids_under_6: true, family_kids_over_6: true },
    tags: ["BordDeMer", "SoleilDouceur", "Authentique", "SlowLife"],
    suggested_combos: [],
  },
  {
    id: "japon-urbain",
    title: "Japon : Tokyo & Osaka",
    authenticity_badge: "tested_approved",
    content_slug: "japon-urbain",
    summary: "Néons, ruelles animées et street food à toute heure — le Japon qui ne s'arrête jamais.",
    hero_image: "https://files.catbox.moe/xwua06.jpg",
    // Ancienne fiche unique "japon" scindée en 2 le 23/08/2026 (Soumia) : elle mélangeait
    // Tokyo/Osaka (effervescence) et Kyoto/Fuji/ryokans (contemplation) sur les mêmes scores, ce
    // qui écrasait le matching pour les deux profils opposés. Voir japon-tradition-nature juste
    // après pour le pendant contemplatif — objectif : un score bien plus précis selon que
    // l'utilisateur cherche un choc culturel urbain ou une déconnexion nature/temples.
    // Contenu éditorial scindé au même moment (les adresses ne sont pas au même endroit) :
    // content/voyages/japon.json remplacé par japon-urbain.json (Osaka + Tokyo) et
    // japon-tradition-nature.json (Nara + Kyoto + Shimoda) — chaque fiche a désormais son propre
    // content_slug, plus de partage entre les deux comme pour Italie.
    filters: {
      distance: ["long_courrier"],
      climate: ["chaleur", "douceur", "hiver_cosy"],
      transport: ["sans_voiture", "transports_possibles"],
      sport_level: ["actif"],
      duration: ["semaine", "grand_voyage"],
      budget: ["eco", "confort", "premium"],
    },
    scores: { repos: 2, exploration: 5, gastronomie: 5, nature_plage: 1, effervescence_urbaine: 5, rythme: 5 },
    logistics: {
      solo: true,
      duo: true,
      friends: true,
      family_kids_under_6: true, // testé à 4 ans avec succès (Osaka / Universal Studios)
      family_kids_over_6: true,
    },
    tags: ["GrandesVilles", "Foodie", "Authentique"],
    suggested_combos: [],
    regional_transport: {
      recommended_mode: "Train à grande vitesse (Shinkansen)",
      pass_or_tip: "Acheter le JR Pass en avance",
      summary:
        "Réseau ferroviaire ultra-dense et ponctuel, idéal pour relier les grandes villes sans voiture.",
    },
  },
  {
    id: "japon-tradition-nature",
    title: "Japon : Kyoto, Mont Fuji & Shimoda",
    authenticity_badge: "tested_approved",
    content_slug: "japon-tradition-nature",
    // Titre/summary/filters/scores validés par Soumia le 23/08/2026 (remplace la première passe de
    // Claude) : sport_level élargi à actif (Arashiyama, parc des singes), budget resserré sur
    // confort/premium (ryokans + Shimoda), exploration/gastronomie/nature_plage remontés à 5.
    summary:
      "Temples séculaires, forêts de bambous, nuits en ryokan et escapade maritime à Shimoda face à l'océan.",
    hero_image: "https://files.catbox.moe/iu8l3a.jpg",
    filters: {
      distance: ["long_courrier"],
      climate: ["chaleur", "douceur", "hiver_cosy"],
      transport: ["sans_voiture", "transports_possibles"],
      sport_level: ["tranquille", "actif"],
      duration: ["semaine", "grand_voyage"],
      budget: ["confort", "premium"],
    },
    scores: { repos: 4, exploration: 5, gastronomie: 5, nature_plage: 5, effervescence_urbaine: 2, rythme: 2 },
    logistics: { solo: true, duo: true, friends: true, family_kids_under_6: true, family_kids_over_6: true },
    tags: ["Authentique", "SlowLife", "EspacesSauvages"],
    suggested_combos: [],
    regional_transport: {
      recommended_mode: "Train à grande vitesse (Shinkansen)",
      pass_or_tip: "Acheter le JR Pass en avance",
      summary:
        "Réseau ferroviaire ultra-dense et ponctuel, idéal pour relier les grandes villes sans voiture.",
    },
  },
  {
    id: "mykonos",
    title: "Mykonos",
    authenticity_badge: "tested_approved",
    content_slug: "mykonos",
    summary:
      "Quatre jours entre copines en juin — plages, ruelles blanches et moulins au coucher du soleil.",
    hero_image: "https://p65bp5tzcfivkgmn.public.blob.vercel-storage.com/mykonos/web-IMG_20260628_111432.jpg",
    filters: {
      distance: ["europe"],
      climate: ["chaleur"],
      transport: ["voiture_necessaire"],
      sport_level: ["tranquille"],
      duration: ["week_end", "semaine", "grand_voyage"],
      budget: ["confort", "premium"],
    },
    scores: { repos: 5, exploration: 5, gastronomie: 4, nature_plage: 4, effervescence_urbaine: 2, rythme: 1 },
    logistics: { solo: true, duo: true, friends: true, family_kids_under_6: false, family_kids_over_6: true },
    tags: ["BordDeMer", "SoleilDouceur", "EntreAmies", "SlowLife"],
    suggested_combos: [],
  },
  {
    id: "dubai",
    title: "Dubaï",
    authenticity_badge: "tested_approved",
    content_slug: "dubai",
    summary: "Gratte-ciel, plages et vieux quartier — le grand écart entre skyline et Al Fahidi.",
    hero_image: "https://p65bp5tzcfivkgmn.public.blob.vercel-storage.com/dubai/web-IMG_1047.jpg",
    filters: {
      distance: ["long_courrier"],
      climate: ["chaleur"],
      transport: ["transports_possibles", "voiture_necessaire"],
      sport_level: ["tranquille"],
      duration: ["semaine", "grand_voyage"],
      budget: ["confort", "premium"],
    },
    scores: { repos: 4, exploration: 5, gastronomie: 4, nature_plage: 2, effervescence_urbaine: 5, rythme: 1 },
    logistics: { solo: true, duo: true, friends: true, family_kids_under_6: true, family_kids_over_6: true },
    tags: ["GrandesVilles", "Luxe", "GrandEcart"],
    suggested_combos: [],
  },
  {
    id: "cote-basque",
    title: "Côte Basque",
    authenticity_badge: "tested_approved",
    content_slug: "cote-basque",
    summary:
      "Biarritz, Saint-Jean-de-Luz — surf, couchers de soleil et gâteau basque, en attendant Cap Breton, Seignosse et Hossegor.",
    hero_image: "https://p65bp5tzcfivkgmn.public.blob.vercel-storage.com/biarritz/web-IMG_20260429_210725.jpg",
    filters: {
      distance: ["proche"],
      climate: ["chaleur", "douceur"],
      transport: ["sans_voiture", "voiture_necessaire", "transports_possibles"],
      sport_level: ["tranquille", "actif"],
      duration: ["week_end", "semaine", "grand_voyage"],
      budget: ["eco", "confort", "premium"],
    },
    scores: { repos: 5, exploration: 4, gastronomie: 5, nature_plage: 4, effervescence_urbaine: 2, rythme: 1 },
    logistics: { solo: true, duo: true, friends: true, family_kids_under_6: true, family_kids_over_6: true },
    tags: ["BordDeMer", "Surf", "Foodie", "SoleilDouceur"],
    suggested_combos: [],
  },
  {
    id: "lisbonne",
    title: "Lisbonne",
    authenticity_badge: "tested_approved",
    content_slug: "lisbonne",
    summary: "Collines, azulejos et lumière atlantique — Lisbonne et une excursion à Sintra.",
    hero_image: "https://p65bp5tzcfivkgmn.public.blob.vercel-storage.com/lisbonne/web-IMG_9475.jpg",
    filters: {
      distance: ["europe"],
      climate: ["chaleur", "douceur"],
      transport: ["sans_voiture", "transports_possibles"],
      sport_level: ["actif"],
      duration: ["week_end", "semaine", "grand_voyage"],
      budget: ["eco", "confort", "premium"],
    },
    scores: { repos: 4, exploration: 4, gastronomie: 3, nature_plage: 2, effervescence_urbaine: 3, rythme: 2 },
    logistics: { solo: true, duo: true, friends: true, family_kids_under_6: true, family_kids_over_6: true },
    tags: ["GrandesVilles", "Authentique", "Foodie"],
    suggested_combos: [],
  },
  {
    id: "porto",
    title: "Porto",
    authenticity_badge: "tested_approved",
    content_slug: "porto",
    summary: "Toits en tuile, ruelles escarpées et la Douro en contrebas — l'autre grande ville du Portugal.",
    hero_image: "https://p65bp5tzcfivkgmn.public.blob.vercel-storage.com/porto/web-IMG_20231026_152531.jpg",
    filters: {
      distance: ["europe"],
      climate: ["douceur", "chaleur"],
      transport: ["sans_voiture", "transports_possibles"],
      sport_level: ["actif"],
      duration: ["week_end", "semaine", "grand_voyage"],
      budget: ["eco", "confort", "premium"],
    },
    scores: { repos: 4, exploration: 4, gastronomie: 5, nature_plage: 3, effervescence_urbaine: 3, rythme: 3 },
    logistics: { solo: true, duo: true, friends: true, family_kids_under_6: true, family_kids_over_6: true },
    tags: ["GrandesVilles", "Authentique", "Foodie"],
    suggested_combos: [],
  },
];
