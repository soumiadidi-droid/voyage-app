// GABARIT réutilisable pour créer une nouvelle destination en une seule exécution (30/08/2026,
// demande Soumia). Copier ce fichier (ex. scripts/_new-hong-kong.ts), remplir les valeurs
// réelles ci-dessous, puis lancer :
//   npx tsx --env-file=.env.local scripts/_new-hong-kong.ts
// Supprimer le fichier une fois l'exécution réussie (fichier jetable, pas destiné à rester dans
// le repo — comme les scripts _write-*.ts utilisés au fil de cette session).
//
// Règle du skill voyage-ingest (.claude/skills/voyage-ingest/SKILL.md), inchangée ici : ne JAMAIS
// inventer une valeur. Un champ non renseigné doit rester vide/absent (undefined, tableau vide),
// jamais rempli d'une supposition — Claude propose une première passe sur les champs devinables
// (scores, filtres), Soumia valide avant exécution.
import { ingestBatch, printBatchSummary, type BatchItem } from "../lib/travel-match/ingest";
import type {
  AuthenticityBadge,
  Filters,
  Scores,
  Logistics,
  RegionalTransport,
  PracticalInfo,
  WhenToGo,
  TravelFromParis,
  Seasonality,
} from "../lib/travel-match/types";

// ─────────────────────────────────────────────────────────────────────────
// 1. IDENTITÉ — voyage (contenu éditorial) + destination (matching)
// ─────────────────────────────────────────────────────────────────────────
const SLUG = "id-destination"; // ex. "hong-kong" — sert de voyages.slug ET destinations.id/content_slug
const TITLE = "Nom de la destination";

const HERO = {
  image: "", // photo hero libre de droit (voir règle du skill : chercher sur Unsplash, jamais à l'aveugle)
  country: "",
  tags: [] as string[], // ex. ["ville", "skyline"]
  title: TITLE,
  tagline: "", // 1 phrase max, contraste/émotion dominante — voir gabarit éditorial du skill
  photoCount: "0 photographies",
};

const INTRO = ""; // texte d'intro affiché sous le hero

const SUMMARY = ""; // résumé court affiché sur la carte résultat (/resultat)

const AUTHENTICITY_BADGE: AuthenticityBadge = "discovery"; // tested_approved | bucket_list | discovery

// ─────────────────────────────────────────────────────────────────────────
// 2. FILTRES — valeurs fermées, servent au filtrage strict (engine.ts)
// ─────────────────────────────────────────────────────────────────────────
const FILTERS: Filters = {
  distance: [], // "proche" | "europe" | "long_courrier"
  climate: [], // "chaleur" | "douceur" | "hiver_cosy"
  transport: [], // "sans_voiture" | "transports_possibles" | "voiture_necessaire"
  sport_level: [], // "tranquille" | "actif"
  duration: [], // "week_end" | "semaine" | "grand_voyage"
  budget: [], // "eco" | "confort" | "premium"
};

// ─────────────────────────────────────────────────────────────────────────
// 3. SCORES — 7 axes réels et uniquement ceux-là, 1 à 5 (voir SCORE_KEYS, types.ts)
// ─────────────────────────────────────────────────────────────────────────
const SCORES: Scores = {
  repos: 3,
  exploration: 3,
  gastronomie: 3,
  nature: 3,
  plage: 3,
  effervescence_urbaine: 3,
  rythme: 3,
};

const LOGISTICS: Logistics = { solo: true, duo: true, friends: true, family: true };

const TAGS: string[] = []; // ex. ["GrandesVilles", "Foodie"]

// ─────────────────────────────────────────────────────────────────────────
// 4. LOGISTIQUE & CLIMAT — bloc "Logistique & Climat" de la fiche voyage
// ─────────────────────────────────────────────────────────────────────────
const TRAVEL_FROM_PARIS: TravelFromParis | undefined = undefined;
// {
//   mode: "Vol direct",
//   duration: "Xh",
//   details: "...",
//   booking_platform: "...",
//   booking_url: "...",
//   advance_booking_notice: "...",
//   insider_tip: undefined, // jamais généré automatiquement — uniquement si Soumia le donne
// };

const REGIONAL_TRANSPORT: RegionalTransport | undefined = undefined;
// {
//   recommended_mode: "...",
//   summary: "...",
//   pass_or_tip: undefined,
//   to_city_center: undefined,
//   booking_platform: undefined,
//   booking_url: undefined,
// };

const SEASONALITY: Seasonality | undefined = undefined;
// {
//   best_months: [],
//   peak_season: [],
//   weather_profile: {
//     spring: { avg_temp: "", tip: "" },
//     summer: { avg_temp: "", tip: "" },
//     autumn: { avg_temp: "", tip: "" },
//     winter: { avg_temp: "", tip: "" },
//   },
// };

const PRACTICAL_INFO: PracticalInfo | undefined = undefined; // access/duration/atmosphere/insider_tips
const WHEN_TO_GO: WhenToGo | undefined = undefined; // default/chaleur/hiver_cosy

// ─────────────────────────────────────────────────────────────────────────
// 5. ADRESSES — hôtels/restos/activités (voir gabarits éditoriaux du skill pour la rédaction)
// ─────────────────────────────────────────────────────────────────────────
type AddressDraft = {
  category: "stay" | "eat" | "activity";
  name: string;
  status?: string;
  location?: string;
  review?: string;
  tags?: string[];
  link?: string;
  linkLabel?: string;
  price?: string;
  instagramUrl?: string;
};

const ADDRESSES: AddressDraft[] = [
  // { category: "stay", name: "...", status: "Testé", location: "...", review: "..." },
];

// ─────────────────────────────────────────────────────────────────────────
// 6. COMBO (optionnel) — extension vers une destination existante déjà en base
// ─────────────────────────────────────────────────────────────────────────
type ComboDraft = {
  targetDestinationId: string;
  title: string;
  vibeType: string;
  description: string;
  transportMode: string;
  recommendedDays: string;
  practicalTip?: string;
  minDurationRequired: "semaine" | "grand_voyage";
};

const COMBO: ComboDraft | undefined = undefined;
// {
//   targetDestinationId: "...",
//   title: "Combo ... : ... x ...",
//   vibeType: "...",
//   description: "...",
//   transportMode: "...",
//   recommendedDays: "...",
//   minDurationRequired: "semaine",
// };

// ─────────────────────────────────────────────────────────────────────────
// Assemblage — ne pas modifier au-delà de ce point
// ─────────────────────────────────────────────────────────────────────────
async function main() {
  const items: BatchItem[] = [
    { kind: "voyage", data: { slug: SLUG, hero: HERO, intro: INTRO, gallery: [] } },
    {
      kind: "destination",
      data: {
        id: SLUG,
        title: TITLE,
        authenticity_badge: AUTHENTICITY_BADGE,
        content_slug: SLUG,
        summary: SUMMARY,
        hero_image: HERO.image,
        filters: FILTERS,
        scores: SCORES,
        logistics: LOGISTICS,
        tags: TAGS,
        regional_transport: REGIONAL_TRANSPORT,
        practical_info: PRACTICAL_INFO,
        when_to_go: WHEN_TO_GO,
        travel_from_paris: TRAVEL_FROM_PARIS,
        seasonality: SEASONALITY,
      },
    },
    ...ADDRESSES.map(
      (a): BatchItem => ({
        kind: "address",
        data: {
          voyageSlug: SLUG,
          category: a.category,
          name: a.name,
          status: a.status,
          location: a.location,
          review: a.review,
          tags: a.tags,
          link: a.link,
          linkLabel: a.linkLabel,
          price: a.price,
          instagramUrl: a.instagramUrl,
        },
      })
    ),
    ...(COMBO
      ? [
          {
            kind: "combo" as const,
            data: {
              id: `combo-${SLUG}-${COMBO.targetDestinationId}`,
              sourceDestinationId: SLUG,
              targetDestinationId: COMBO.targetDestinationId,
              title: COMBO.title,
              vibeType: COMBO.vibeType,
              description: COMBO.description,
              transitionLogistics: {
                transport_mode: COMBO.transportMode,
                recommended_days: COMBO.recommendedDays,
                practical_tip: COMBO.practicalTip,
              },
              minDurationRequired: COMBO.minDurationRequired,
            },
          },
        ]
      : []),
  ];

  const summary = await ingestBatch(items);
  printBatchSummary(summary);
}
main();
