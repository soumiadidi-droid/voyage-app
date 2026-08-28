---
name: voyage-ingest
description: Structure et écrit dans Neon (base du site "Le Voyage des Émotions") une destination, une adresse (hôtel/resto/activité) ou son profil famille, à partir d'une URL, d'un avis, de notes brutes, ou d'une LISTE de liens/notes à traiter d'un coup, données par Soumia. Utilise ce skill dès qu'elle donne du contenu (un seul élément ou plusieurs) à ajouter/mettre à jour sur une destination ou une adresse — jamais pour un combo entre deux destinations (voir combo-voyage à la place).
---

# Voyage ingest — structurer et écrire en base (Neon)

Depuis la migration du 27/08/2026, le contenu du site vit dans Neon (4 tables : `voyages`,
`destinations`, `voyage_addresses`, `combos`), plus dans des fichiers statiques. **Claude est la
partie "intelligente"** de ce skill : il n'existe aucune fonction magique qui comprend un avis
Google tout seul (aucune clé API IA n'est configurée sur ce projet, exprès — voir
`lib/social-agent/generate.ts`). Le processus est toujours : Soumia donne du texte brut → Claude le
lit et propose les champs structurés → Soumia valide (ou corrige) → Claude appelle une fonction
d'écriture de `lib/travel-match/ingest.ts`.

Ne JAMAIS écrire en base sans validation explicite de Soumia sur les champs proposés, surtout les
scores et le `familyFit` — même règle que pour les tickets Jira ou les scores sport migrés plus tôt
dans le projet : Claude propose une première passe, Soumia valide, jamais l'inverse.

## Schéma réel — ne pas dévier

**6 axes de score, et uniquement ceux-là** (`lib/travel-match/types.ts`, `SCORE_KEYS`) :
`repos`, `exploration`, `gastronomie`, `nature_plage`, `effervescence_urbaine`, `rythme` — chacun
1 à 5. Ne jamais utiliser d'anciens axes (déconnexion/culture/aventure/social...), abandonnés le
23/08/2026.

**Jamais d'archétype sur une destination.** L'archétype ("Le Refuge Contemplatif"...) est calculé
côté voyageur à partir de ses réponses (`app/components/TravelerProfileCard.tsx`), jamais stocké en
base sur une destination.

**3 catégories d'adresse** (`voyage_addresses.category`) : `stay` (hébergement), `eat`
(restauration), `activity` (activité).

**`familyFit` : seulement 4 profils tribu**, jamais de sous-scoring solo/couple/amis sur une
adresse (n'existe pas dans le schéma) :
`tout_petits` (-3 ans), `enfants_juniors` (3-12 ans), `ados` (13 ans+), `tribu_multi_ages`.
Chaque profil renseigné a la forme `{ beds, equipment: string[], services: string[], activities:
string[] }` — voir `content/voyages/index.ts` (type `FamilyFit`). Ne renseigner que les profils pour
lesquels Soumia a vraiment donné de l'info, jamais inventer les autres.

**`price` (28/08/2026)** : texte libre sur une adresse (ex. "45€ la nuit", "Menu à partir de
25€"). Comme `familyFit`/`isPartner`/`image` : jamais inventé, absent tant qu'aucun vrai prix n'a
été donné.

## Charte éditoriale — gabarits de rédaction (28/08/2026)

Quand Claude rédige (jamais un générateur automatique, voir plus haut), suivre ces gabarits pour
rester cohérent sur tout le site. Toujours à partir de faits réels donnés par la source — ces
gabarits cadrent la FORME, jamais un prétexte pour combler avec du texte inventé si la matière
manque (mieux vaut un gabarit incomplet qu'un gabarit rempli de banalités).

**Phrase hero d'une destination** (`voyages.hero.tagline`) : 1 phrase max, qui pose le contraste/
l'émotion dominante. Interdits : "paradisiaque", "joyau caché", et tout cliché touristique
générique. Exemple validé : *"Biarritz : entre océan et gastronomie, le cœur balance."*

**Hébergement** (`review`, 3-4 phrases) : Style & déco → Ambiance & cadre → Petit-déjeuner (si
mentionné) → Équipements clés (si applicables) → Chambres & confort. Ajouter un tag `vue ...` dans
`tags` si une vue notable est mentionnée (`vue mer`, `vue montagne`, `vue vallée`...).

**Restauration** (`review`, 2-3 phrases) : Style & ambiance → L'assiette & spécialités → Moment
idéal & conseil insider. Tags dynamiques pertinents (type de cuisine, "terrasse", "vue mer"...).

**Activité** (`review`, 2-3 phrases) : L'expérience & l'émotion → Le cadre & décor →
Accessibilité & conseil insider (à qui ça s'adresse, équipement à prévoir, meilleur moment).

Ces gabarits donnent l'ORDRE et la longueur cible, pas un remplissage automatique — si la source
ne donne pas de quoi remplir une des étapes (ex. pas de petit-déjeuner mentionné), on saute cette
partie plutôt que d'inventer. Ne JAMAIS forcer le nombre de phrases cible si la matière source est
trop mince (ex. un avis d'une seule phrase comme "Validé à 100%, magnifique, rien à redire") —
mieux vaut une phrase honnête que 3-4 phrases dont la moitié est inventée.

**Jamais répéter dans `review` ce que `location`/le tag de localisation affiche déjà** — bug
repéré le 28/08/2026 : la reformulation batch du 28/08 ouvrait systématiquement les reviews
d'hébergement par une paraphrase de `location` ("Sur la péninsule d'Izu, à Shimoda." quand
`location` dit déjà "Shimoda, péninsule d'Izu"), corrigé sur 11 hôtels. Ne garder dans `review` que
les faits qui ne sont PAS déjà visibles ailleurs sur la carte (localisation, statut, prix).

**Ne pas réutiliser la même formule d'une adresse à l'autre** (ex. "Hôtel au design moderne" collé
sur deux hôtels différents sans rien de spécifique à chacun) — chaque review doit refléter des
faits propres à CETTE adresse, jamais un remplissage générique interchangeable.

## Étape 1 — Destination (si elle n'existe pas encore)

Vérifier d'abord avec `getDestinations()` (`lib/travel-match/data.ts`) si la zone géographique
existe déjà (par `id` ou `content_slug`). Si oui, pas besoin de la recréer, passer direct à l'étape
2/3.

Si c'est une nouvelle destination : elle a besoin d'un `voyages.slug` existant (`content_slug`).
S'il n'existe pas non plus, créer d'abord la fiche voyage avec `upsertVoyage()` (hero/intro/gallery
— gallery peut être vide `[]` au départ, à compléter plus tard), puis la destination avec
`upsertDestination()`.

**Règle (28/08/2026) : toujours chercher une photo hero libre de droit pour `voyages.hero.image`
et `destinations.hero_image` avant de considérer une nouvelle destination terminée** — même
démarche que pour Carry-le-Rouet/les 13 destinations existantes (voir `lib/hero-images.ts`) :
1. Chercher sur Unsplash une photo du LIEU géographique exact (pas d'un établissement précis —
   ça, c'est différent, voir plus bas), vérifier le lieu tagué et la licence (gratuite, pas
   Unsplash+) avant utilisation.
2. Télécharger et regarder l'image avant de l'utiliser (jamais à l'aveugle).
3. Si aucune photo fiable du lieu exact n'existe (ex. Carry-le-Rouet), le dire clairement et
   proposer la ville la plus proche plutôt que de laisser passer une photo mal étiquetée — c'est à
   Soumia de trancher si elle accepte l'approximation.
4. Uniquement `voyages.hero.image`/`destinations.hero_image` sont concernés par cette règle — les
   photos des adresses individuelles (hôtels/restos/activités) restent en texture générique,
   aucune photo libre de droit fiable n'existe pour un établissement précis (voir la conversation
   du 27/08/2026 à ce sujet).

```ts
import { upsertVoyage, upsertDestination } from "@/lib/travel-match/ingest";

await upsertVoyage({
  slug: "lisbonne-nouvelle-zone", // à valider avec Soumia, cohérent avec les slugs existants
  hero: { image: "...", country: "Portugal", tags: ["ville", "..."], title: "...", tagline: "...", photoCount: "N photographies" },
  intro: "...",
});

await upsertDestination({
  id: "lisbonne-nouvelle-zone",
  title: "...",
  authenticity_badge: "discovery", // tested_approved | bucket_list | discovery selon ce que Soumia précise
  content_slug: "lisbonne-nouvelle-zone",
  summary: "...",
  hero_image: "...",
  filters: { distance: [...], climate: [...], transport: [...], sport_level: [...], duration: [...], budget: [...] },
  scores: { repos: 3, exploration: 4, gastronomie: 4, nature_plage: 2, effervescence_urbaine: 4, rythme: 3 },
  logistics: { solo: true, duo: true, friends: true, family: true },
  tags: ["Ville", "..."],
  // Optionnel (28/08/2026) — 4 cartes d'infos pratiques affichées sur la fiche. Jamais générées
  // automatiquement : ne renseigner que ce que Soumia donne vraiment, laisser le champ absent
  // plutôt que remplir de banalités ("réservez à l'avance"...). Un champ non renseigné = pas de
  // carte affichée pour lui, pas d'erreur.
  practical_info: {
    access: "...", // ex. "TGV direct depuis Paris (4h), voiture utile sur place"
    duration: "...", // ex. "3 jours / 2 nuits, idéal au printemps ou à l'automne"
    atmosphere: "...", // 3 mots-clés, ex. "Iodé, chic, décontracté"
    insider_tips: "...", // ex. "Réserver le restaurant du port à l'avance en juillet-août"
  },
});
```

Attention : `regional_transport`/`practical_info` sont écrasés en entier à chaque appel (pas de
fusion partielle) — pour mettre à jour un seul des deux sans perdre l'autre sur une destination
existante, relire d'abord avec `getDestinations()` et renvoyer l'objet complet.

## Étape 2 — Adresse (hôtel/resto/activité)

Toujours rattachée à un `voyage_slug` existant (jamais à une destination directement — une
destination peut partager son `content_slug` avec d'autres, voir Italie).

```ts
import { upsertAddress } from "@/lib/travel-match/ingest";

await upsertAddress({
  voyageSlug: "cote-basque",
  category: "stay",
  name: "Bizipoz Hôtel",
  status: "J'ai dormi ici",
  location: "Proche de la gare, Saint-Jean-de-Luz",
  review: "...",
  tags: ["centre-ville", "familial"],
  link: "https://...", // jamais inventé, null si pas donné
  linkLabel: "Voir les disponibilités",
  familyFit: {
    tribu_multi_ages: {
      beds: "...",
      equipment: ["..."],
      services: [],
      activities: [],
    },
  },
});
```

`upsertAddress` fait la bonne chose automatiquement : si une adresse du même nom existe déjà pour
ce voyage/cette catégorie, elle est mise à jour (pas dupliquée) ; sinon elle est ajoutée à la suite
des adresses existantes de sa catégorie.

### Embed Instagram sur une adresse (28/08/2026)

Si Soumia donne un lien vers le post/reel Instagram source d'une adresse, le passer dans
`instagramUrl` — `upsertAddress()` valide et normalise automatiquement le format (accepte un lien
brut avec paramètres de tracking, `/p/` ou `/reel/`, avec ou sans `www.`) via
`normalizeInstagramUrl()`. Une URL qui n'est pas un vrai post/reel (lien de profil, story, page
d'accueil) fait échouer l'écriture avec un message explicite plutôt que d'enregistrer un lien mort.

```ts
await upsertAddress({
  voyageSlug: "cote-basque",
  category: "eat",
  name: "Café Loky",
  instagramUrl: "https://www.instagram.com/p/ABC123/?igsh=xyz", // normalisé automatiquement
});
```

L'embed s'affiche en **lazy-load au scroll** (28/08/2026, remplace un premier essai en
click-to-load pas apprécié) : un `IntersectionObserver` (`rootMargin: "400px"`) charge le script
officiel Instagram et affiche le blockquote automatiquement dès que la carte approche du
viewport, sans action de l'utilisateur. Reste nécessaire dès qu'une fiche voyage peut avoir
jusqu'à ~20 adresses : charger 20 iframes Instagram d'un coup au montage alourdirait gravement le
premier affichage de la page. Embed affiché en petite taille (`max-w-[280px]`, cohérent avec la
largeur standard des cartes d'adresse). Testé le 28/08/2026 : zéro requête `embed.js` tant que la
carte est loin dans la page, requête déclenchée dès qu'elle approche du viewport au scroll.

### Ingestion en lot depuis un fichier CSV (28/08/2026)

Pour ajouter beaucoup d'adresses d'un coup à partir d'un fichier fourni par Soumia :
`npx tsx --env-file=.env.local scripts/ingest-csv.ts chemin/vers/fichier.csv`

Colonnes attendues (voir l'en-tête de `scripts/ingest-csv.ts` pour le détail complet) :
`name`, `destination` (voyage_slug, doit déjà exister), `category` (stay/eat/activity),
`instagram_url`, `review`, `price`, `status`, `location`.

**Générer le CSV de départ depuis la base plutôt que le taper à la main** (28/08/2026) — utile
quand il ne manque qu'un ou deux champs (typiquement `instagram_url`) sur des adresses déjà
existantes : `npx tsx --env-file=.env.local scripts/export-csv.ts [category] [--all]`. Sans
argument, exporte toutes les adresses n'ayant pas encore d'`instagram_url` (c'est le cas d'usage
principal) ; `stay` filtre sur une catégorie ; `--all` inclut aussi celles qui en ont déjà un.
Dépose le fichier dans `~/Downloads/adresses-a-completer-*.csv`, avec toutes les colonnes déjà
pré-remplies depuis la base — il ne reste plus qu'à compléter `instagram_url` avant de relancer
`ingest-csv.ts` dessus. Format d'export directement compatible avec le format d'import (mêmes
colonnes, même échappement CSV).

**Important : ce script ne rédige rien.** La colonne `review` doit déjà contenir le texte final
au gabarit éditorial (voir plus haut) — si Soumia donne des notes brutes plutôt qu'un CSV déjà
rédigé, c'est à Claude de les lire et les structurer en conversation d'abord (comme pour toute
autre ingestion), puis de construire le CSV avec le texte déjà prêt. Le script se contente de
parser, valider (destination connue, catégorie valide) et écrire via `ingestBatch` — chaque ligne
invalide est rejetée avec un message clair, sans bloquer les lignes valides.

Le post s'affiche en embed natif Instagram (`app/components/InstagramEmbed.tsx`, chargé une seule
fois par page via le script officiel `embed.js`, squelette pendant le chargement, largeur max
400px). Testé en conditions réelles le 28/08/2026 : fonctionne même depuis `localhost`, aucune
config CSP supplémentaire nécessaire sur ce projet.

## Étape 3 — Combo entre deux destinations

**Pas ce skill** — utiliser `combo-voyage` à la place. `combos` relie deux destinations entre elles
(extension de voyage type New York ↔ Montréal), jamais une adresse à un voyage.

## Plusieurs éléments d'un coup (lot)

Deux formes d'entrée possibles pour un lot :

**A. Déjà structuré** — Soumia (ou une étape précédente) donne directement les champs. Construire
le tableau `BatchItem[]` sans étape d'extraction.

**B. Liste de liens/notes brutes** — Soumia donne plusieurs URLs, avis, ou notes en vrac (ex. 5
liens d'hôtels). Pour CHAQUE lien/note :

1. Récupérer le contenu (`WebFetch` pour une URL — demander explicitement de ne rien inventer, ne
   citer que ce qui est réellement présent sur la page, voir le prompt type plus bas).
2. Si c'est un avis/des notes de Soumia elle-même (pas un site officiel) : c'est son ressenti
   personnel, à retranscrire tel quel dans `review`, jamais à reformuler en copie marketing.
3. Qualifier selon le schéma réel (section "Schéma réel" ci-dessus) : catégorie, tags, `familyFit`
   uniquement si des infos famille sont vraiment présentes (jamais inventé pour compléter un
   profil).
4. Si la destination/le voyage cible n'existe pas encore (vérifier avec `getDestinations()`), ça
   devient aussi un item `voyage` + `destination` dans le même lot — mêmes règles que l'étape 1
   (6 axes réels, jamais d'archétype, première passe à signaler comme telle sur les champs devinés
   comme `filters`/`scores`/`budget`).

Prompt type pour `WebFetch` (site officiel d'un lieu) :
> "Décris [le lieu] en détail : nom exact, localisation précise, style/ambiance, équipements et
> services, types de chambres (dont chambres familiales/communicantes, équipements bébé/enfant
> s'il y en a), activités à proximité, et tout ce qui indique s'il convient aux familles (quel âge
> d'enfants). Cite les informations réellement présentes sur la page, sans en inventer."

**Avant d'appeler `ingestBatch()` dans les deux cas** : afficher à Soumia un récapitulatif lisible
de ce qui va être écrit (pas un bloc JSON brut) — surtout les champs devinés/inférés (scores,
filtres, familyFit détecté). Ce n'est pas un blocage systématique par item (`ingestBatch` gère déjà
le cas où un item serait à corriger via son rapport d'erreurs), mais Claude ne doit jamais écrire
en base le résultat d'un scraping sans que Soumia ait vu au moins une fois ce qui a été compris —
même principe que pour un seul élément, juste résumé en un seul passage pour tout le lot plutôt que
question par question.

```ts
import { ingestBatch, printBatchSummary, type BatchItem } from "@/lib/travel-match/ingest";

const items: BatchItem[] = [
  { kind: "address", data: { voyageSlug: "carry-le-rouet", category: "eat", name: "...", review: "..." } },
  { kind: "address", data: { voyageSlug: "carry-le-rouet", category: "activity", name: "...", review: "..." } },
];

const summary = await ingestBatch(items);
printBatchSummary(summary);
```

Pas de transaction globale : chaque item est indépendant, un échec isolé (ex. mauvais
`voyageSlug`) n'empêche pas les autres d'être écrits — `summary` détaille précisément ce qui a
marché ou pas.

## Après toute écriture

1. `npx tsc --noEmit`, `npx eslint app/ lib/ --quiet` — doivent être propres (le code de ce skill
   n'en a pas besoin, mais si Claude a aussi touché du code applicatif dans le même geste).
2. Vérifier en local (`npm run dev`) que le nouveau contenu s'affiche correctement sur la fiche
   voyage concernée (`/voyages/<slug>`) avant de considérer la tâche terminée.
