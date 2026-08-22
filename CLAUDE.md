@AGENTS.md

# Le Voyage des Émotions

Projet perso de Soumia (hors TF1/Adsflow — les instructions du CLAUDE.md global ~/.claude/CLAUDE.md
sur le ton et la non-technicité ne s'appliquent pas ici, c'est un vrai projet de dev).

## C'est quoi

Site perso de récits de voyage. Une seule autrice (Soumia), un pays/une destination = une histoire
racontée avec photos, avec une distinction stricte annoncée partout : **voyage vécu** (testé,
photographié par elle) vs **voyage recherché** (sélectionné mais pas encore fait). Jamais mélangés.

- Baseline : "Un pays, une histoire, une photo à la fois."
- Titre H1 accueil : "Mes voyages, racontés vrai."
- Logo : monogramme "LVE" en Cormorant Garamond

## État actuel — IMPORTANT

Le site est **en ligne et fonctionnel** sur Vercel : https://voyage-app-sage.vercel.app
Projet Vercel : `voyage-app` (team `ai-product5` / `team_dRjUleuL4QiTSwUyVlEKalH1`,
id `prj_VoXzgnLHaF5PZDtACcE4teyiv2WS`).

Le dossier local a été perdu une première fois (aucun repo Git retrouvé sur la machine). On a
reconstruit depuis le 21/08/2026 : repo GitHub créé (https://github.com/soumiadidi-droid/voyage-app),
scaffold Next.js relancé, contenu du site en ligne récupéré et mis en cache dans `.recovery/`
(HTML brut des 9 fiches voyage + photos + partenariats + guides + code source exact du
questionnaire extrait du bundle JS). Ne JAMAIS perdre ce dossier de vue à nouveau : commit +
push régulièrement au fil du travail.

## Stack

- Next.js (App Router, TypeScript, Tailwind CSS) — scaffold via `create-next-app`
- Déploiement Vercel (à reconnecter au repo GitHub une fois le rebuild suffisamment avancé —
  voir plan `/Users/soumiadidi/.claude/plans/rosy-swimming-magpie.md`)
- Polices : Cormorant Garamond (titres/logo), Bricolage Grotesque / Source Serif 4 / IBM Plex Mono
  (corps), via Google Fonts
- Palette sombre chaleureuse observée sur le site en ligne : `#1A1714` / `#E8DFC8`, accents
  `--ember` et `--aurora`
- Images stockées sur Vercel Blob storage sur le site original (`*.public.blob.vercel-storage.com`)

## Pages — état au 22/08/2026

- `/` — accueil : hero, à propos, CTA questionnaire (fait)
- `/questionnaire` — 7 écrans du moteur Travel Match, voir section dédiée plus bas (fait, testé)
- `/resultat` — résultats du moteur Travel Match (fait, testé)
- `/voyages/[slug]` — fiche voyage complète par destination : galerie photo, "Mes adresses" (Où
  dormir / Où manger), Activités, bouton like (fait pour les 9 fiches : `amerique-du-nord-hiver`,
  `cote-basque`, `crete`, `dubai`, `italie`, `japon`, `lisbonne`, `mykonos`, `porto`)
- `/favoris` — destinations likées en localStorage (fait, voir section Favoris plus bas)

**Pages volontairement abandonnées (décidé le 22/08/2026)** : `/photos`, `/partenariats` ("Notre
offre"), `/guides` — jamais construites, et Soumia a tranché qu'elles ne sont plus nécessaires. Ne
pas les reproposer. Le contenu en cache (`.recovery/photos.html`, `.recovery/partenariats.html`,
`.recovery/guides.html`) est mort, supprimable sans risque.

`/voyages` (liste ouverte de toutes les destinations) a aussi été supprimée le 22/08/2026 — la
seule découverte des destinations passe par le questionnaire, voir section Favoris.

Déployé en **preview** sur Vercel le 22/08/2026 (`ai-product5/voyage-app`, projet lié via
`vercel link`) : https://voyage-77ioe9uw5-ai-product5.vercel.app (protégé, accessible uniquement à
Soumia). Pas encore en prod — attendre validation explicite avant `vercel --prod` (voir Phase 4 du
plan et section "Déploiement prudent").

## Contenu récupéré (dossier `.recovery/`)

- `.recovery/questionnaire_source.js` — code du questionnaire original, plus utilisé (le
  questionnaire a été entièrement refait pour Travel Match, voir plus bas). Peut être supprimé.
- `.recovery/voyages_content/*.html` + `.recovery/parse_voyages.py` — déjà parsés dans
  `content/voyages/*.json`, intégrés. Peut être supprimé si l'espace dérange, sinon inoffensif.
- `.recovery/photos.html`, `.recovery/partenariats.html`, `.recovery/guides.html` — mort, pages
  abandonnées (voir ci-dessus). Supprimable.

## Question sport — RÉSOLU

10ᵉ question ajoutée (`lib/questionnaire.ts`, id `sport`), attribut `sport` (0-100) intégré au
moteur de matching (`lib/destinations.ts`, `lib/matching.ts`). Scores `sport` par destination
validés par Soumia le 21/08/2026 (ex. Côte Basque 80 pour le surf, Mykonos 30 farniente). Ne pas
re-proposer de nouveaux scores sans qu'elle le demande.

Voir le plan détaillé : `/Users/soumiadidi/.claude/plans/rosy-swimming-magpie.md`

## Refactor moteur de matching "Travel Match" — EN COURS (depuis le 22/08/2026)

Soumia veut remplacer le moteur actuel (score unique par différence pondérée sur un profil plat
0-100) par un algo en **2 étapes**, plus fidèle à l'objectif "émotion recherchée / ambiance" plutôt
que checklist touristique :

1. **Filtrage strict (logistique)** — élimine les destinations incompatibles (via `filters` et
   `logistics`).
2. **Score de matching (%)** — calculé uniquement sur les destinations restantes, à partir de
   `emotions` et `vibe`.

Ça remplace `profile` (objet plat 0-100, 11 dimensions) + `context` dans `lib/destinations.ts`, et
l'algo à une seule passe dans `lib/matching.ts`. Le contenu éditorial (`content/voyages/*.json` —
galerie, hôtels, restos, activités) n'est pas concerné, il reste tel quel.

### Nouveau schéma par destination (définitif pour le moment)

```json
{
  "id": "cote-basque",
  "title": "Côte Basque",
  "status": "tested", // "tested" (voyage vécu) | "wishlist" (voyage recherché, pas encore fait) — décidé le 22/08/2026
  "summary": "...",
  "hero_image": "https://...",
  "filters": {
    "distance": ["proche"], // "proche" | "europe" | "long_courrier"
    "climate": ["chaleur", "douceur"], // "chaleur" | "douceur" | "hiver_cosy" | "peu_importe"
    "transport": ["voiture_necessaire", "transports_possibles"], // "sans_voiture" | "voiture_necessaire"
    "sport_level": ["tranquille", "actif"] // "tranquille" | "actif" uniquement — pas de "sportif" (décidé le 22/08 : les 9 destinations actuelles sont lifestyle/flânerie, un 3e niveau créait du bruit sans vraie distinction dans la donnée)
  },
  "emotions": { // 1 à 5, ces 5 axes fixes pour toutes les destinations
    "deconnexion": 4,
    "emerveillement": 4,
    "reconnexion": 5,
    "lacher_prise": 5,
    "inspiration": 3
  },
  "vibe": { // 1 à 5, ces 4 axes fixes pour toutes les destinations
    "pression_horaire": 1, // 1 = très slow, 5 = intense
    "densite_urbaine": 3,
    "gourmandise": 5,
    "nature": 4
  },
  "logistics": {
    "solo_friendly": true,
    "duo_romantic": true,
    "friends_group": true,
    "family_kids_under_6": true,
    "family_kids_over_6": true
  },
  "tags": ["BordDeMer", "SoleilDouceur", "Foodie", "SlowLife"],
  "content_slug": "cote-basque" // slug de content/voyages/*.json à afficher. Plusieurs destinations
                                 // de matching peuvent partager le même content_slug (ex. Italie
                                 // splittée en 3 destinations de matching, 1 seule fiche contenu
                                 // pour l'instant — décidé le 22/08/2026, split du contenu éditorial
                                 // remis à plus tard)
}
```

### Point de vigilance — sport_level

`filters.sport_level` remplace en partie l'ancien attribut `sport` (0-100, validé le 21/08). C'est
maintenant une catégorie (pas un score), donc ça nécessite une re-traduction des 9 destinations
existantes. **Même règle que pour le score sport initial : Claude propose une première passe,
Soumia valide/corrige, jamais l'inverse.**

Première passe validée par Soumia le 22/08/2026 : `["tranquille", "actif"]` pour les 8 destinations
(Amérique du Nord hiver, Côte Basque, Crète, Dubaï, Italie, Japon, Lisbonne, Porto), `["tranquille"]`
seul pour Mykonos (farniente explicite, pas de signal actif dans le contenu récupéré).

### Calibrage du score de matching — à faire

Objectif explicite de Soumia (22/08/2026) : les bons matchs doivent afficher un score dans la
fourchette **70-90%**, pas un score écrasé/trop sévère. À garder en tête au moment de construire la
fonction de scoring émotionnel/vibe (étape 2 de l'algo) — ne pas se contenter d'une distance brute
non calibrée comme le fait `lib/matching.ts` actuellement.

### Statut — FONCTIONNEL, 12/12 destinations migrées (22/08/2026)

Moteur codé et branché en bout en bout :
- `lib/travel-match/types.ts` — schéma complet
- `lib/travel-match/destinations.ts` — 12 destinations migrées :
  - Italie ×3 (`italie-nord-culture`, `italie-sorrente-amalfe`, `italie-pouilles`) et Amérique du
    Nord ×2 (`montreal`, `new-york`) partagent chacune un `content_slug` commun (`italie` /
    `amerique-du-nord-hiver`), split éditorial remis à plus tard
  - Crète, Japon, Mykonos, Dubaï, Côte Basque, Lisbonne, Porto — chacune avec son propre
    `content_slug` (page dédiée existante). Émotions/vibe/filtres validés par Soumia le 22/08/2026 ;
    points notables : Japon climat multi-saisons (`chaleur`/`douceur`/`hiver_cosy`, testé en famille
    avec un enfant <6 ans), Mykonos exclut `family_kids_under_6`, Dubaï tranché en `long_courrier`
- `lib/travel-match/engine.ts` — filtrage strict + score euclidien calibré (formule exacte de
  Soumia) + fallback (top 3 émotionnel si le filtrage élimine tout, avec badges d'avertissement
  sur les critères logistiques non respectés)
- `lib/travel-match/questionnaire.ts` — 7 écrans (5 choix simples + 2 écrans de curseurs 1-5),
  copy validée par Soumia le 22/08/2026, curseurs positionnés au milieu (3) par défaut
- `app/questionnaire/QuestionnaireClient.tsx` et `app/resultat/page.tsx` réécrits pour utiliser
  ce nouveau moteur (ancien `lib/matching.ts` / `lib/destinations.ts` / `lib/questionnaire.ts`
  laissés de côté, plus utilisés par les pages, gardés pour référence en attendant la migration
  des 7 destinations restantes)

Testé : `tsc --noEmit` propre, `npm run build` propre, smoke-test manuel via `next dev` + curl sur
5 cas (arrivée directe sans réponses, match nominal Italie, filtres trop restrictifs → fallback,
match exact Japon, famille avec enfant <6 ans exclue de Mykonos par `logistics`) — tous corrects.

**Note** : `~/Downloads/Voyage_des_Emotions_x_Travel_Match_Business_Plan.docx` et
`..._Texte_Integral.docx` (rédigés avec Gemini le 21/08/2026) décrivent un premier algo (10
critères à plat, score unique, 3 badges de statut, mécanisme "Top Match débloqué"). Ce n'était pas
une mauvaise base, mais elle est **dépassée** par le moteur Travel Match ci-dessus (filtrage strict
+ score émotionnel calibré, destinations validées une par une) — confirmé par Soumia le
22/08/2026. Le volet business (B2B, tarifs, roadmap) de ces docs reste valable tel quel.

Deux idées du spec Gemini non reprises mais pas écartées, à considérer si besoin plus tard :
- Les **3 badges de statut** (Testé & Approuvé / Bucket List / Idée à découvrir) au lieu des 2
  valeurs actuelles (`tested` / `wishlist`) — cohérent avec un futur 3ᵉ statut type "pas encore
  vécu mais pas repéré par Soumia non plus".
- Le **"Top Match débloqué"** : seule la destination n°1 donnerait accès au détail complet, un
  mécanisme d'engagement pas implémenté aujourd'hui (tous les résultats du Top 3 affichent leurs
  infos directement).

**Reste à faire** :
- Pas de "profil voyageur" nommé dans la nouvelle page résultat (l'ancien système de personas
  reposait sur les anciens attributs, pas repris — à voir si Soumia veut un équivalent)
- Toujours en local, rien déployé sur Vercel — attendre validation explicite avant preview/prod
  (voir Phase 4 du plan). Soumia a prévu un test global en local avant de valider le déploiement.

## Favoris (❤️) — FONCTIONNEL (22/08/2026)

`/voyages` (catalogue ouvert) est volontairement supprimé — la seule porte d'entrée vers les
destinations est le questionnaire, pour ne pas spoiler la base. En complément, un système de
favoris permet de retrouver les destinations likées sans repasser par le questionnaire :

- `lib/favorites.ts` — store `useSyncExternalStore` sur `localStorage` (clé `lve-favoris`), 100%
  navigateur, aucun compte/backend. Ne suit pas d'un appareil à l'autre — accepté pour la V1, une
  vraie base de données est possible plus tard si besoin (comparé Supabase/Firebase/Airtable avec
  Soumia le 22/08, Supabase recommandé le jour où ça devient nécessaire)
- `app/components/LikeButton.tsx` — bouton ❤️/🤍, présent sur chaque carte de `/resultat` et dans
  le header de `/voyages/[slug]`
- `app/favoris/` — nouvelle page, remplace `/voyages` dans la nav. Liste les destinations likées,
  état vide avec message "Lâche un match ! ✨" + CTA vers `/questionnaire`
- Les favoris sont indexés par `id` de destination Travel Match. Le lien `/resultat` → fiche passe
  `?id=<id>` pour lever l'ambiguïté sur Italie et Amérique du Nord (plusieurs destinations, une
  seule fiche). Un accès direct à `/voyages/italie` sans ce paramètre enregistre la clé `slug`
  (`"italie"`) — `/favoris` la résout en repêchant la fiche de contenu correspondante (`content/
  voyages/*.json`) quand aucune destination ne matche cet id, donc rien n'est perdu, juste affiché
  au niveau de la fiche groupée plutôt que d'une destination précise (résolu le 22/08/2026).
