// Couche d'écriture Neon pour l'ajout/mise à jour de contenu, un élément à la fois — pensée pour
// un usage interactif (Claude structure ce que Soumia dicte, puis appelle une de ces fonctions),
// contrairement à scripts/seed.ts qui fait un resync complet en bloc depuis les fichiers statiques.
// Voir .claude/skills/voyage-ingest/SKILL.md pour le workflow complet et le format attendu.
import { neon } from "@neondatabase/serverless";
import type {
  AuthenticityBadge,
  Filters,
  Scores,
  Logistics,
  RegionalTransport,
  SuggestedCombo,
  TransitionLogistics,
  FamilyProfile,
  PracticalInfo,
  WhenToGo,
} from "./types";
import type { FamilyFit, GalleryItem, VoyageContent } from "@/content/voyages";

const sql = neon(process.env.DATABASE_URL!);

export type NewVoyageInput = {
  slug: string;
  hero: VoyageContent["hero"];
  intro: string;
  gallery?: GalleryItem[];
};

export async function upsertVoyage(input: NewVoyageInput): Promise<void> {
  await sql.query(
    `insert into voyages (slug, hero, intro, gallery)
     values ($1,$2::jsonb,$3,$4::jsonb)
     on conflict (slug) do update
       set hero = excluded.hero, intro = excluded.intro, gallery = excluded.gallery, updated_at = now()`,
    [input.slug, JSON.stringify(input.hero), input.intro, JSON.stringify(input.gallery ?? [])]
  );
}

export type NewDestinationInput = {
  id: string;
  title: string;
  authenticity_badge: AuthenticityBadge;
  content_slug: string; // doit référencer un voyages.slug existant — upsertVoyage() d'abord si besoin
  summary: string;
  hero_image: string;
  filters: Filters;
  scores: Scores; // les 7 vrais axes uniquement (repos/exploration/gastronomie/nature/plage/effervescence_urbaine/rythme)
  logistics: Logistics;
  tags: string[];
  regional_transport?: RegionalTransport;
  // 4 cartes d'infos pratiques (28/08/2026) — voir le type PracticalInfo. Jamais généré
  // automatiquement (pas de clé API IA configurée sur ce projet, exprès) : Claude les rédige à
  // partir de ce que Soumia donne, comme le reste du contenu du site. Champ non renseigné =
  // absent de l'affichage, jamais rempli de banalités.
  practical_info?: PracticalInfo;
  // "Quand y aller" conditionné au climat choisi au questionnaire (29/08/2026) — voir WhenToGo.
  // Même règle que practical_info : jamais généré automatiquement, vide tant que Soumia n'a pas
  // donné le vrai conseil saisonnier.
  when_to_go?: WhenToGo;
};

// N'attribue JAMAIS d'archétype ici — l'archétype est calculé côté voyageur à partir de ses
// réponses au questionnaire (app/components/TravelerProfileCard.tsx), jamais stocké sur une
// destination.
//
// Attention (comportement hérité, pas nouveau) : `regional_transport`/`practical_info` sont
// écrasés à chaque appel avec la valeur donnée (null si omise) — pas de fusion partielle. Pour
// mettre à jour un seul champ sans perdre l'autre, relire la destination via getDestinations()
// d'abord et renvoyer l'objet complet.
export async function upsertDestination(input: NewDestinationInput): Promise<void> {
  await sql.query(
    `insert into destinations
       (id, title, authenticity_badge, content_slug, summary, hero_image, filters, scores, logistics, tags, regional_transport, practical_info, when_to_go)
     values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10,$11::jsonb,$12::jsonb,$13::jsonb)
     on conflict (id) do update set
       title = excluded.title, authenticity_badge = excluded.authenticity_badge,
       content_slug = excluded.content_slug, summary = excluded.summary, hero_image = excluded.hero_image,
       filters = excluded.filters, scores = excluded.scores, logistics = excluded.logistics,
       tags = excluded.tags, regional_transport = excluded.regional_transport,
       practical_info = excluded.practical_info, when_to_go = excluded.when_to_go, updated_at = now()`,
    [
      input.id,
      input.title,
      input.authenticity_badge,
      input.content_slug,
      input.summary,
      input.hero_image,
      JSON.stringify(input.filters),
      JSON.stringify(input.scores),
      JSON.stringify(input.logistics),
      input.tags,
      input.regional_transport ? JSON.stringify(input.regional_transport) : null,
      input.practical_info ? JSON.stringify(input.practical_info) : null,
      input.when_to_go ? JSON.stringify(input.when_to_go) : null,
    ]
  );
}

export type AddressCategoryDb = "stay" | "eat" | "activity";

export type NewAddressInput = {
  voyageSlug: string;
  category: AddressCategoryDb;
  name: string;
  status?: string;
  location?: string;
  review?: string;
  tags?: string[];
  link?: string | null;
  linkLabel?: string | null;
  isPartner?: boolean;
  image?: string | null;
  // Texte libre (28/08/2026), ex. "45€ la nuit", "Menu à partir de 25€" — jamais inventé, laisser
  // absent si aucun vrai prix n'a été donné.
  price?: string | null;
  // URL d'un post/reel Instagram source de l'adresse (28/08/2026) — normalisée par
  // normalizeInstagramUrl() avant écriture (voir plus bas). Accepte l'URL brute donnée par
  // Soumia (avec paramètres de tracking, etc.), rejette tout ce qui n'est pas un vrai post/reel
  // Instagram.
  instagramUrl?: string | null;
  // Seulement les 4 profils tribu (tout_petits/enfants_juniors/ados/tribu_multi_ages). Jamais de
  // sous-scoring solo/couple/amis inventé sur une adresse — ça n'existe pas dans le schéma.
  familyFit?: Partial<Record<FamilyProfile, FamilyFit>>;
};

// Valide et normalise une URL de post/reel Instagram : accepte /p/{id}/ ou /reel/{id}/, avec ou
// sans www., avec ou sans paramètres de tracking (?igsh=...) ou slash final, ET avec ou sans le
// nom de compte dans le chemin (ex. instagram.com/arlohotels/p/ABC123/ — le format standard
// quand on copie un lien depuis un post affiché sur le profil plutôt que depuis le fil) — bug
// trouvé le 28/08/2026 sur un vrai lien Arlo Hotels, corrigé. Retourne toujours la même forme
// canonique SANS le nom de compte, "https://www.instagram.com/{p|reel}/{id}/". Lève une erreur
// explicite si l'URL ne correspond à aucun post/reel (ex. lien de profil, story, page d'accueil)
// plutôt que d'enregistrer silencieusement une URL qui ne s'embedera jamais.
export function normalizeInstagramUrl(rawUrl: string): string {
  const match = rawUrl.match(/instagram\.com\/(?:[^/]+\/)?(p|reel)\/([A-Za-z0-9_-]+)/);
  if (!match) {
    throw new Error(`URL Instagram invalide (attendu un lien /p/ ou /reel/) : ${rawUrl}`);
  }
  const [, type, id] = match;
  return `https://www.instagram.com/${type}/${id}/`;
}

type ExistingAddressRow = { id: string };
type NextPositionRow = { next: number };

// Upsert par (voyage_slug, category, name) — pas par position — pour ajouter/mettre à jour UNE
// adresse à la fois sans écraser les autres déjà en base pour ce voyage/cette catégorie. Différent
// du delete+insert en bloc de scripts/seed.ts, pensé pour un resync complet, pas un ajout unitaire.
export async function upsertAddress(input: NewAddressInput): Promise<void> {
  const existing = (await sql.query(
    `select id from voyage_addresses where voyage_slug = $1 and category = $2 and name = $3`,
    [input.voyageSlug, input.category, input.name]
  )) as unknown as ExistingAddressRow[];

  const familyFit = input.familyFit ? JSON.stringify(input.familyFit) : null;
  const instagramUrl = input.instagramUrl ? normalizeInstagramUrl(input.instagramUrl) : null;

  if (existing.length > 0) {
    await sql.query(
      `update voyage_addresses set
         status = $1, location = $2, review = $3, tags = $4, link = $5, link_label = $6,
         is_partner = $7, image = $8, price = $9, instagram_url = $10, family_fit = $11::jsonb,
         updated_at = now()
       where id = $12`,
      [
        input.status ?? "",
        input.location ?? "",
        input.review ?? "",
        input.tags ?? [],
        input.link ?? null,
        input.linkLabel ?? null,
        input.isPartner ?? false,
        input.image ?? null,
        input.price ?? null,
        instagramUrl,
        familyFit,
        existing[0].id,
      ]
    );
    return;
  }

  const nextPositionRows = (await sql.query(
    `select coalesce(max(position), -1) + 1 as next from voyage_addresses where voyage_slug = $1 and category = $2`,
    [input.voyageSlug, input.category]
  )) as unknown as NextPositionRow[];

  await sql.query(
    `insert into voyage_addresses
       (voyage_slug, category, position, name, status, location, review, tags, link, link_label, is_partner, image, price, instagram_url, family_fit)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb)`,
    [
      input.voyageSlug,
      input.category,
      nextPositionRows[0].next,
      input.name,
      input.status ?? "",
      input.location ?? "",
      input.review ?? "",
      input.tags ?? [],
      input.link ?? null,
      input.linkLabel ?? null,
      input.isPartner ?? false,
      input.image ?? null,
      input.price ?? null,
      instagramUrl,
      familyFit,
    ]
  );
}

export type NewComboInput = {
  id: string;
  sourceDestinationId: string;
  targetDestinationId: string;
  title: string;
  vibeType: string;
  description: string;
  transitionLogistics: TransitionLogistics;
  minDurationRequired: SuggestedCombo["min_duration_required"];
};

// Rappel (voir .claude/skills/combo-voyage/SKILL.md) : combos relie deux DESTINATIONS entre elles
// (extension de voyage type New York ↔ Montréal) — jamais utilisé pour rattacher une adresse à un
// voyage, c'est le rôle de upsertAddress (voyageSlug). Saisie à sens unique : seulement sur la
// destination "phare", getCombosFor() reconstruit le sens inverse automatiquement.
export async function upsertCombo(input: NewComboInput): Promise<void> {
  await sql.query(
    `insert into combos
       (id, source_destination_id, target_destination_id, title, vibe_type, description, transition_logistics, min_duration_required)
     values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
     on conflict (id) do update set
       source_destination_id = excluded.source_destination_id,
       target_destination_id = excluded.target_destination_id,
       title = excluded.title, vibe_type = excluded.vibe_type, description = excluded.description,
       transition_logistics = excluded.transition_logistics,
       min_duration_required = excluded.min_duration_required, updated_at = now()`,
    [
      input.id,
      input.sourceDestinationId,
      input.targetDestinationId,
      input.title,
      input.vibeType,
      input.description,
      JSON.stringify(input.transitionLogistics),
      input.minDurationRequired,
    ]
  );
}

// Ingestion par lots — traite plusieurs voyages/destinations/adresses/combos en une exécution.
// Réutilise les 4 fonctions ci-dessus telles quelles (mêmes règles de schéma, même upsert par clé
// naturelle) : aucune nouvelle validation nécessaire, les types de ce fichier empêchent déjà de
// construire un item invalide (ex. impossible de passer un archétype à une destination, ou un
// axe de score qui n'existe pas).
export type BatchItem =
  | { kind: "voyage"; data: NewVoyageInput }
  | { kind: "destination"; data: NewDestinationInput }
  | { kind: "address"; data: NewAddressInput }
  | { kind: "combo"; data: NewComboInput };

export type BatchItemResult = {
  kind: BatchItem["kind"];
  label: string;
  status: "ok" | "error";
  error?: string;
};

export type BatchSummary = {
  results: BatchItemResult[];
  counts: Record<BatchItem["kind"], number>;
  errorCount: number;
};

function itemLabel(item: BatchItem): string {
  switch (item.kind) {
    case "voyage":
      return item.data.slug;
    case "destination":
      return item.data.id;
    case "address":
      return `${item.data.voyageSlug} / ${item.data.name}`;
    case "combo":
      return item.data.id;
  }
}

// Ordre d'exécution forcé, quel que soit l'ordre du tableau d'entrée : voyages avant destinations
// (FK content_slug), puis adresses/combos — même logique que scripts/seed.ts. L'appelant peut
// mélanger les types dans n'importe quel ordre, ce n'est pas à lui d'y penser.
const KIND_ORDER: BatchItem["kind"][] = ["voyage", "destination", "address", "combo"];

// Best-effort, pas de transaction globale (voir SKILL.md) : chaque item est un ajout de contenu
// indépendant, pas une seule unité logique qui doit réussir ou échouer en bloc. Un item invalide
// ne fait pas perdre les autres déjà écrits — le rapport détaille précisément ce qui a marché ou
// pas, pour ne corriger que ce qui doit l'être plutôt que de tout rejouer.
export async function ingestBatch(items: BatchItem[]): Promise<BatchSummary> {
  const results: BatchItemResult[] = [];
  const counts: Record<BatchItem["kind"], number> = { voyage: 0, destination: 0, address: 0, combo: 0 };

  const sorted = [...items].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));

  for (const item of sorted) {
    const label = itemLabel(item);
    try {
      if (item.kind === "voyage") await upsertVoyage(item.data);
      else if (item.kind === "destination") await upsertDestination(item.data);
      else if (item.kind === "address") await upsertAddress(item.data);
      else await upsertCombo(item.data);

      results.push({ kind: item.kind, label, status: "ok" });
      counts[item.kind]++;
    } catch (err) {
      results.push({ kind: item.kind, label, status: "error", error: err instanceof Error ? err.message : String(err) });
    }
  }

  return { results, counts, errorCount: results.filter((r) => r.status === "error").length };
}

// Récapitulatif console demandé : X destinations, Y adresses, Z combos écrits, + détail des échecs.
export function printBatchSummary(summary: BatchSummary): void {
  console.log(
    `✓ ${summary.counts.voyage} voyage(s), ${summary.counts.destination} destination(s), ` +
      `${summary.counts.address} adresse(s), ${summary.counts.combo} combo(s) écrits`
  );
  const errors = summary.results.filter((r) => r.status === "error");
  if (errors.length > 0) {
    console.log(`✗ ${errors.length} échec(s) :`);
    for (const e of errors) console.log(`  - [${e.kind}] ${e.label} : ${e.error}`);
  }
}
