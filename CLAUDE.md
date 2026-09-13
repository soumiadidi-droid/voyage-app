@AGENTS.md

# Le Voyage des Émotions

Projet perso de Soumia (hors TF1/Adsflow — les instructions du CLAUDE.md global ~/.claude/CLAUDE.md
sur le ton et la non-technicité ne s'appliquent pas ici, c'est un vrai projet de dev).

## C'est quoi

Site perso de récits de voyage. Une seule autrice (Soumia), un pays/une destination = une histoire
racontée avec photos, avec une distinction stricte annoncée partout : **voyage vécu** (testé,
photographié par elle) vs **voyage recherché** (sélectionné mais pas encore fait). Jamais mélangés.

- Baseline : "Un pays, une histoire, une photo à la fois." (affichée dans le footer depuis le
  03/09/2026, à la place d'une formule d'agence)
- Titre H1 accueil : "Des récits de voyages vrais, des adresses incarnées." (03/09/2026)
- Logo : monogramme "LVE" en Cormorant Garamond
- **Le site parle au "je"**, jamais au "nous" (décidé le 03/09/2026) : une seule personne, qui vend
  son regard. Aucun "nous/notre/nos" ne doit réapparaître dans la copie visible.

## État actuel — IMPORTANT

Le site est **en ligne et fonctionnel** sur son nom de domaine : **https://levoyagedesemotions.fr**
(acheté par Soumia). L'ancienne URL `voyage-app-sage.vercel.app` redirige dessus depuis le
03/09/2026 — ne plus l'utiliser nulle part.

Projet Vercel : `voyage-app` (team `ai-product5` / `team_dRjUleuL4QiTSwUyVlEKalH1`,
id `prj_VoXzgnLHaF5PZDtACcE4teyiv2WS`).

**Déploiement automatique depuis GitHub (vérifié le 07/09/2026)** : le repo
`soumiadidi-droid/voyage-app` est connecté au projet Vercel. Tout `git push origin main` déclenche
un déploiement **en production** sur levoyagedesemotions.fr, sans commande à lancer. Un push sur
n'importe quelle autre branche produit une preview protégée, visible seulement par Soumia — c'est
ce qu'il faut lui envoyer pour validation avant la prod. Conséquence : ne plus pousser sur `main`
ce qui n'est pas validé, le push EST la mise en ligne.

Déploiement manuel toujours possible en secours (`npx vercel --prod --yes --scope ai-product5`) —
le `--scope` est obligatoire, sans lui la commande échoue sur un `Not authorized` peu parlant.

**Le contenu vit en base (Neon/Postgres), plus dans les fichiers.** Depuis la migration du
27/08/2026 (`lib/travel-match/data.ts`, plan `~/.claude/plans/moonlit-noodling-dolphin.md`), les
destinations, fiches et adresses sont lues en base via `getDestinations()` / `getVoyage()` /
`getVoyages()`. Les JSON de `content/voyages/*.json` et `lib/travel-match/destinations.ts` sont du
**legacy** : les modifier ne change RIEN sur le site. Ils ne servent plus qu'à porter les types.

**Piège du cache de build** : une page prérendue au build peut resservir un contenu périmé après
une modification en base (constaté le 03/09/2026 sur le statut de Marseille — la page affichait
encore l'ancienne valeur après rebuild). L'accueil, `/carnets` et `sitemap.xml` sont pour cette
raison en `export const dynamic = "force-dynamic"`. Toute nouvelle page qui lit la base doit faire
pareil, sinon un ajout de destination reste invisible sans qu'on comprenne pourquoi.

Le dossier local a été perdu une première fois (aucun repo Git retrouvé sur la machine). On a
reconstruit depuis le 21/08/2026 : repo GitHub créé (https://github.com/soumiadidi-droid/voyage-app),
scaffold Next.js relancé, contenu du site en ligne récupéré et mis en cache dans `.recovery/`
(HTML brut des 9 fiches voyage + photos + partenariats + guides + code source exact du
questionnaire extrait du bundle JS). Ne JAMAIS perdre ce dossier de vue à nouveau : commit +
push régulièrement au fil du travail.

## Stack

- Next.js (App Router, TypeScript, Tailwind CSS) — scaffold via `create-next-app`
- Déploiement Vercel, connecté au repo GitHub : push sur `main` = mise en production automatique
  (voir la section "État actuel" plus haut)
- Polices : Cormorant Garamond (titres/logo), Bricolage Grotesque / Source Serif 4 / IBM Plex Mono
  (corps), via Google Fonts
- Palette sombre chaleureuse observée sur le site en ligne : `#1A1714` / `#E8DFC8`, accents
  `--ember` et `--aurora`
- **Images dans le projet (`public/images/`), plus sur Vercel Blob** — depuis le 13/09/2026. Le
  stockage Blob répond "Your store is blocked" (403) sur TOUTES ses images : plus de 1 600 envois et
  suppressions en une nuit (galerie Sans filtre) ont très probablement dépassé le quota de l'offre
  gratuite. Les 269 photos de `/sans-filtre` et les 100 fichiers de galerie des carnets ont été
  recréés depuis les originaux dans `public/images/sans-filtre/` et `public/images/voyages/`.
  **Ne plus envoyer de photos en masse sur Blob** : les ajouter dans `public/images/`.
  Reste à faire (refusé par le garde-fou automatique le 13/09, à valider par Soumia) : remplacer en
  base les adresses Blob de `voyages.hero`, `voyages.gallery` et `destinations.hero_image` par
  `/images/voyages/…` (mêmes chemins). Sans effet visible aujourd'hui : les couvertures passent par
  `lib/hero-images.ts` et les galeries ne sont affichées nulle part.

## Pages — état au 03/09/2026

- `/` — accueil : hero fusionné avec la démo Travel Match, manifeste, CTA questionnaire
- `/questionnaire` — les écrans du moteur Travel Match, voir section dédiée plus bas
- `/resultat` — résultats du moteur Travel Match
- `/voyages/[slug]` — fiche voyage complète par destination (haut de page depuis le 13/09/2026 :
  **bloc beige** semi-transparent et flouté posé sur la photo, texte bleu nuit, intro coupée en deux
  paragraphes — choisi par Soumia contre un voile noir à 45 %, qui ternissait la photo) : galerie, "Mes adresses" (Où dormir /
  Où manger), Activités, bouton like, extensions/combos. 15 fiches en base
- `/favoris` — destinations likées en localStorage (voir section Favoris plus bas)
- `/philosophie` — piliers + "mot de la fondatrice" (texte définitif de Soumia du 23/08/2026, ne
  pas modifier sans son accord). Libellé de nav : "Ma philosophie". **Depuis le 12/09/2026** :
  second chapitre "Et puis, il y a ma liste." (je repère, je teste, je recommande à mes amis — ce
  site, c'est ma liste ouverte), avec trois compteurs lus en base (`getCompteursListe()` dans
  `lib/carnets.ts`), et **même habillage que `/pros`** (colonne unique, pastille, citation à filet,
  cartes terracotta clair à icône ronde). Photos en éventail essayées puis retirées pour coller à
  `/pros`. Validé et mis en ligne par Soumia ("j'adore, go").
- `/sans-filtre` — **galerie brute de Soumia** (en ligne le 12/09/2026, dans le menu et le footer).
  Ressuscite l'idée de `/photos` à sa demande. Un mur d'images bord à bord, **mélangé à chaque
  visite, sans lieu, sans date, sans section, sans compteur** : nommer les lieux révélerait les
  réponses du Travel Match (même règle que `/carnets`). Le lieu n'existe ni dans
  `lib/sans-filtre-photos.json` ni dans les chemins des images (`/images/sans-filtre/AAAA-MM/NNN.jpg`).
  Photos jamais étalonnées (pas de PHOTO_GRADE, c'est la preuve brute). Tout ajout passe par :
  retrait des photos avec des personnes, redimensionnement 1600/720 px, **suppression des
  métadonnées dont le GPS**, dépôt dans `public/images/sans-filtre/` (plus sur Blob, bloqué). Scripts de préparation dans le scratchpad de la
  session du 12/09 (non versionnés) — détection de personnes via le framework Vision d'Apple,
  validée sur les 289 premières photos.
- `/pros` — l'offre de collaboration (voir plus bas). Libellé de nav : "On collabore ?", validé par
  Soumia le 29/08/2026 — ne pas le renommer
- `/mentions-legales`, `/confidentialite`
- `/studio`, `/admin`, `/admin/social-agent` — backoffice de Soumia. Pas protégés par mot de passe,
  juste non liés dans la nav (bouton révélé par `?admin=1`, mémorisé en localStorage). Exclus de
  l'indexation depuis le 03/09/2026
- `/carnets` — **page cachée, réservée au démarchage** (voir la section du 03/09/2026 plus bas)

**Pages volontairement abandonnées (décidé le 22/08/2026)** : `/photos`, `/guides` — jamais
construites, Soumia a tranché qu'elles ne sont plus nécessaires. Ne pas les reproposer. Le contenu
en cache (`.recovery/photos.html`, `.recovery/guides.html`) est mort, supprimable sans risque.

**Redirections en place (`next.config.ts`, 03/09/2026)** : `/partenariats` → `/pros`, `/voyages` et
`/destinations` → `/questionnaire`, et tout `voyage-app-sage.vercel.app/*` → le domaine.

**Pages volontairement abandonnées (décidé le 22/08/2026)** : `/photos`, `/guides` — jamais
construites, Soumia a tranché qu'elles ne sont plus nécessaires. Ne pas les reproposer. Le contenu
en cache (`.recovery/photos.html`, `.recovery/guides.html`) est mort, supprimable sans risque.

**La page d'offre s'appelle `/pros`** (fichier `app/pros/page.tsx`) — l'URL historique
`/partenariats` de l'ancien site n'existe plus et redirige dessus. Reconstruite le 23/08/2026 à
partir du contenu réel de l'ancien site en ligne, pas
depuis le Business Plan Gemini : **volontairement sans grille tarifaire publique** (pas de
Starter/Signature/Premium affichés), juste 2 modes de collaboration + un contact direct par email
(décidé par Soumia le 23/08/2026 — les tarifs du BP restent pour la prospection directe, pas
publics sur le site). Contenu source : `.recovery/partenariats.html`.

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

**Note** : `~/Documents/Le Voyage des Émotions/Documents de référence/Voyage_des_Emotions_x_Travel_Match_Business_Plan.docx` et
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

## Simplification du questionnaire — durée, budget, combos (23/08/2026)

Refonte du modèle de scores et ajout de filtres, décidée avec Soumia après une relecture qui a
fait remonter 3 points corrigés avant implémentation (détection combo, architecture, sport_level) :

- **Nouveaux filtres stricts** : `duration` (week_end/semaine/grand_voyage) et `budget`
  (eco/confort/premium), en tout début de questionnaire. Règle produit : un week-end élimine
  d'office toute destination qui ne supporte QUE le long-courrier — appliquée comme garde-fou au
  niveau du moteur (`engine.ts`), pas seulement comme une histoire de bonne saisie de données.
- **`sport_level` conservé** (Mykonos exclu du niveau actif, etc. — rien n'est perdu).
- **Scores repensés en 6 axes indépendants** (remplace l'ancien modèle émotions/vibe à 9 axes) :
  `repos`, `exploration`, `gastronomie`, `nature_plage`, `effervescence_urbaine`, `rythme`. L'ancien
  axe bipolaire "cadre de vie" (nature ↔ ville) a été scindé en deux curseurs indépendants
  (`nature_plage` / `effervescence_urbaine`) précisément pour permettre de détecter qu'un
  utilisateur veut les deux à la fois — impossible avec un seul axe bipolaire.
- **Migration des 12 destinations** : scores migrés mécaniquement depuis l'ancien modèle
  (`repos` = moyenne déconnexion/lâcher-prise, `exploration` = moyenne émerveillement/inspiration,
  le reste repris 1:1). `duration`/`budget` par destination = première passe de Claude, à valider
  par Soumia comme les précédentes migrations.
- **`logistics` renommé** : `solo_friendly`→`solo`, `duo_romantic`→`duo`, `friends_group`→`friends`
  (family_kids_under_6/over_6 inchangés).
- **`authenticity_badge`** remplace `status` : `tested_approved` / `bucket_list` / `discovery`
  (reprend les 3 badges du spec Gemini, mis de côté le 22/08 puis réintégré le 23/08). Les 12
  destinations actuelles sont toutes en `tested_approved`.
- **Combos/extensions** (`suggested_combos` par destination, type `SuggestedCombo`) : détecté quand
  l'utilisateur met ≥4 à la fois sur `nature_plage` et `effervescence_urbaine`. Affiché comme un
  **badge visuel** sur la carte résultat (🔀 Combo possible), sans influencer le score — décision
  explicite de Soumia pour ne pas re-toucher la formule de scoring calibrée. Sur la fiche détail
  (`/voyages/[slug]`), les combos s'affichent seulement si la durée choisie par l'utilisateur
  (transmise en query param depuis `/resultat`) couvre le `min_duration_required` du combo. Aucune
  destination n'a de combo renseigné pour l'instant (`suggested_combos: []` partout) — contenu à
  écrire par Soumia, pas inventé par Claude (comme toute la partie narrative du site).

Testé : `tsc`/lint/build propres, règle week-end vs long-courrier vérifiée (exclusion sans déclencher
le fallback à tort), filtre budget vérifié.

**Corrections du 23/08/2026 après test par Soumia** :
- Le libellé du badge fallback pour le critère transport disait à tort "Nécessite une voiture" même
  quand ce n'était pas le cas (ex. Italie, Japon) — remplacé par "Transport différent de ta
  recherche", cohérent avec les autres libellés.
- Amérique du Nord (Montréal + New York) : le split éditorial remis à plus tard le 22/08 a
  finalement été fait pour cette paire, à la demande de Soumia. `content/voyages/montreal.json` et
  `new-york.json` remplacent `amerique-du-nord-hiver.json` (supprimé), contenu réparti sans rien
  inventer (chaque photo/hôtel/café déjà attribuable à une ville précise dans les légendes
  existantes). `content_slug` mis à jour dans `lib/travel-match/destinations.ts`. Italie reste
  groupée sous une seule fiche (`italie`) pour l'instant — pas demandé de la splitter.
- Combo de test ajouté : Montréal ↔ New York (`suggested_combos`), pour valider visuellement le
  badge 🔀 et la section "Extensions possibles".

**Enrichissement des combos (23/08/2026, suite au test)** : `SuggestedCombo` a maintenant
`target_destination_id` (destination réelle vers laquelle le combo pointe — jamais soi-même, garde-
fou appliqué dans `app/voyages/[slug]/page.tsx`) et `transition_logistics` (`transport_mode`,
`recommended_days`, `practical_tip?`), remplaçant les anciens champs `duration`/`transport_type` à
plat. La carte "Extensions possibles" affiche maintenant un bloc "Comment faire la liaison" et un
bouton "Voir la fiche de [destination]" qui navigue vers la vraie fiche cible. `min_duration_required`
conservé (pas dans la dernière demande de Soumia, mais nécessaire au filtre d'affichage déjà validé).

## Transport inter-villes / mobilité régionale (23/08/2026)

Nouveau champ optionnel `regional_transport` sur `Destination` (`recommended_mode`, `pass_or_tip?`,
`summary`) — comment se déplacer ENTRE les étapes d'une même destination multi-villes (JR Pass au
Japon, Frecciarossa en Italie), pas entre deux destinations différentes (ça, c'est déjà le rôle des
combos). Affiché en bloc pratique juste après l'intro sur `/voyages/[slug]`, seulement quand
renseigné. Renseigné pour Japon (Shinkansen) et Italie Nord-Culture (Frecciarossa) — les autres
destinations n'en ont pas besoin.

**Bug trouvé et corrigé au passage** : la résolution de `destination` sur la fiche détail ne
retombait pas sur `slug` en l'absence du paramètre `?id=` (contrairement au bouton like, qui le
faisait déjà) — du coup `regional_transport` et les combos ne s'affichaient jamais en accès direct
sur les 7 destinations à fiche dédiée, seulement en arrivant depuis `/resultat`. Corrigé.

**Dédoublonnage du badge combo sur `/resultat` (23/08/2026)** : quand Montréal ET New York
apparaissent tous les deux dans le même top 3, le badge 🔀 s'affichait sur les deux cartes — effet
de doublon repéré par Soumia. `dedupeComboBadges()` dans `engine.ts` calcule une clé canonique de
paire (ids triés + joints) et ne garde le badge que sur la première destination rencontrée (déjà
triées par score décroissant) ; le miroir garde sa carte mais perd le badge. Appliqué sur le lot
réellement affiché (`results.slice(0, 3)`), pas sur la liste complète — sinon le dédoublonnage ne
correspondrait pas à ce que l'utilisateur voit vraiment. Bouton de la fiche détail renommé
"Découvrir [destination]" (au lieu de "Voir la fiche de...").

## Saisie unique des combos, sens inverse déduit par le code (23/08/2026)

Soumia ne veut plus saisir un combo deux fois (une fois côté A→B, une fois côté B→A) — trop de
doublons à maintenir. Nouveau : `lib/travel-match/combos.ts` (`getCombosFor(destinationId)`)
reconstruit la relation dans les deux sens à partir d'une seule déclaration côté destination
"phare" (celle qui porte `target_destination_id`).

- Montréal n'a plus aucun `suggested_combos` saisi (`[]`) ; New York porte le seul combo
  `target_destination_id: "montreal"`, avec tout le contenu (Vacances Dragon inclus).
- Sur la fiche de la destination phare (New York), le combo s'affiche "authored" : titre rédigé
  tel quel (`combo.title`, écrit dans ce sens précis).
- Sur la fiche de l'autre destination (Montréal), le combo est "reverse" : **le titre rédigé ne
  convient pas** (il est écrit dans l'autre sens — "après l'énergie de New York, direction
  Montréal" n'a pas de sens affiché sur la page Montréal). Titre remplacé par un générique
  `Extension : {otherDestination.title}`. `description`/`vibe_type`/`transition_logistics` sont en
  revanche réutilisés tels quels des deux côtés (compromis accepté pour éviter la double saisie —
  à surveiller si la description finit par sonner à l'envers sur le sens reverse).
- `hasComboOpportunity` (badge sur `/resultat`) et `dedupeComboBadges` utilisent maintenant
  `getCombosFor` au lieu de lire `suggested_combos` directement, donc ça marche pour les deux sens.

**Mise à jour du 23/08/2026** : le titre/description sont maintenant écrits neutres et réversibles
dès la saisie (format `Combo [Thématique] : Ville A x Ville B`, description sans mots de
départ/arrivée) — plus besoin du titre générique de secours côté "reverse", `combo.title` s'affiche
tel quel des deux côtés. Convention documentée dans le skill `combo-voyage` (voir plus bas) pour ne
plus la réexpliquer à chaque combo.

## Skill `combo-voyage` (23/08/2026)

`.claude/skills/combo-voyage/SKILL.md` — skill de ce projet (pas global) qui documente le format
exact pour ajouter un combo/extension entre deux destinations (titre réversible, description
neutre, transition_logistics avec durées, saisie à sens unique). Se déclenche quand Soumia demande
d'ajouter un combo/extension/duo de destinations. Créé pour éviter de lui refaire expliquer la
convention à chaque nouvelle paire.

## Split de la fiche Japon en 2 destinations (23/08/2026)

La fiche unique `japon` (moteur de matching) mélangeait deux vibes opposées — Tokyo/Osaka
(effervescence) et Kyoto/Fuji/ryokans (contemplation) — sur les mêmes scores, ce qui écrasait le
matching pour les deux profils. Scindée à la demande de Soumia en deux destinations distinctes dans
`lib/travel-match/destinations.ts` :

- `japon-urbain` ("Japon : Tokyo & Osaka") — `repos: 2, effervescence_urbaine: 5`, `sport_level:
  ["actif"]`
- `japon-tradition-nature` ("Japon : Kyoto, Fuji & Ryokans") — `repos: 4, nature_plage: 4,
  effervescence_urbaine: 2`, `sport_level: ["tranquille"]`

Testé : sur un profil urbain (repos bas/effervescence haute), `japon-urbain` ressort #1 à 95% ; sur
un profil contemplatif (repos/nature hauts, effervescence basse), `japon-tradition-nature` ressort
#1 à 92%. Les autres axes (`exploration`, `gastronomie`) sont une première passe de Claude, pas
encore validés par Soumia comme le reste des scores migrés.

**Adresses séparées dans la foulée (23/08/2026)** — Soumia a fait remarquer qu'elles ne sont pas au
même endroit : `content/voyages/japon.json` (unique, toutes les adresses mélangées Osaka → Nara →
Kyoto → Shimoda → Tokyo) remplacé par deux fiches avec leur propre `content_slug`, sur le même
principe que le split Montréal/New York — plus de contenu partagé entre les deux comme c'est encore
le cas pour Italie :

- `content/voyages/japon-urbain.json` — hôtels Candeo Osaka + OMO5 Tokyo Gotanda, adresses d'Osaka
  et de Tokyo (15 eats, 3 activités)
- `content/voyages/japon-tradition-nature.json` — hôtels Agora Kyoto + Shimoda Tokyu Hotel,
  adresses de Nara, Kyoto et Shimoda (8 eats, 4 activités)

Répartition faite sans rien inventer, chaque adresse déjà attribuable à une ville précise dans les
échanges de Soumia. Galerie (6 photos) et intro également scindées en 2×3 photos, cohérent avec la
ville évoquée. `content/voyages/index.ts` mis à jour (deux imports au lieu d'un). Aucun lien réel
(`link`) trouvé pour les petites adresses japonaises testées — laissé à `null` partout plutôt que
d'inventer une URL, à compléter par Soumia si elle veut les liens.

## Favoris (❤️) — FONCTIONNEL (22/08/2026)

`/voyages` (catalogue ouvert) est volontairement supprimé — la seule porte d'entrée vers les
destinations est le questionnaire, pour ne pas spoiler la base. Toujours vrai au 03/09/2026 : le
catalogue reconstruit ce jour-là vit sur `/carnets` et n'est lié de nulle part (voir plus bas). En complément, un système de
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

## Ouverture puis fermeture du catalogue, et repositionnement (03/09/2026)

Journée en deux temps, dans cet ordre — l'ordre compte pour comprendre l'état final.

**Objectif posé par Soumia** : le site sert de book de crédibilité pour démarcher des offices de
tourisme et des hôtels (séjour offert contre contenu + affiliation). Ce n'est pas un projet
d'audience : ne jamais mettre des chiffres de trafic ou de followers en avant, ce qui se vend c'est
son regard et sa sélection d'adresses.

**Temps 1 — catalogue ouvert.** `/carnets` (jusque-là un stub "page en cours de rédaction", délié
de la nav le 23/08) est devenu la liste complète des 15 carnets, mise dans la nav et le footer, avec
une section "Récits & destinations à la une" sur l'accueil.

**Temps 2 — catalogue refermé, après que Soumia l'a vu en preview.** Afficher les destinations
révèle la réponse du Travel Match avant que le visiteur ne le passe — même raison qui avait fait
retirer le nom des vraies destinations de la carte teaser du hero le 01/09. État final :

- `/carnets` existe, est complète et servie, mais **rien sur le site n'y renvoie** : pas de nav, pas
  de footer, pas de section accueil, page Favoris repointée sur `/questionnaire`
- elle est en `robots: { index: false, follow: false }`, absente du sitemap, interdite dans
  `robots.txt` — sans ça elle remonterait dans Google et n'importe quel visiteur y tomberait
- `/voyages` et `/destinations` redirigent vers `/questionnaire` et **pas** vers `/carnets` : une
  URL aussi évidente suffirait à la rendre trouvable
- Soumia envoie l'URL `https://levoyagedesemotions.fr/carnets` elle-même aux partenaires

**Ne pas remettre `/carnets` dans la nav ni de vitrine de destinations sur l'accueil sans son
accord explicite.** C'est une décision produit, pas un oubli.

**Composants** : `app/components/CarnetCard.tsx` (carte de carnet) et `lib/carnets.ts`
(`getCarnets()`, tri par badge puis titre) — écrits pour être partagés entre `/carnets` et l'accueil,
seul `/carnets` les utilise depuis la fermeture. La carte n'affiche que le nombre d'adresses : le
compteur de photos a été retiré, les photos étant ce que Soumia **livre** au partenaire et pas ce
qu'elle montre pour décrocher le séjour.

**Les 15 destinations sont toutes en `tested_approved`** (Londres corrigée en base ce jour-là,
Marseille l'était déjà). Le bandeau de `/carnets` affiche donc "tous vécus sur le terrain", et le
libellé "Curatée" n'apparaît nulle part aujourd'hui — il reste prévu pour une future destination
non vécue. `authenticity_badge` ne sert qu'à l'affichage et au tri, jamais au calcul du matching.

**Galeries maigres** : plusieurs carnets n'ont que 2 ou 3 photos, Londres et Marseille zéro (mais
15 et 3 embeds Instagram sur leurs adresses). Signalé à Soumia, elle a tranché que ça n'impacte pas
le démarchage. Ne pas le resoulever.

### SEO — ce qui n'existait pas avant ce jour

`metadataBase` pointait encore sur le sous-domaine Vercel, il n'y avait aucune balise canonique,
aucun sitemap, aucun `robots.txt`. Ajoutés : `lib/site.ts` (`SITE_URL`), `app/sitemap.ts`,
`app/robots.ts`, et une canonique **page par page**.

Piège à connaître : une canonique posée sur le layout racine est héritée par toutes les pages
enfant qui ne la redéfinissent pas — elle déclarerait l'accueil comme URL canonique de tout le
site. C'est pour ça qu'elle est posée page par page et pas une fois pour toutes.

Les 15 fiches `/voyages/[slug]` restent indexées individuellement (elles l'étaient déjà avant).
Question ouverte avec Soumia : faut-il aussi les sortir de Google, puisqu'un visiteur peut y
atterrir en cherchant une destination sans passer par le questionnaire ? Non tranché.

## Envoi de l'itinéraire par email — FONCTIONNEL (09/09/2026)

Le bloc de capture email de `/resultat` (écrit le 30/08, resté masqué depuis) est **actif** :
`SHOW_EMAIL_CAPTURE = true` dans `app/resultat/page.tsx`. L'envoi passe par Resend, domaine
`levoyagedesemotions.fr` vérifié ce jour-là, premier envoi réel confirmé.

**Le mail est un aperçu, pas une copie du site.** Première version écrite avec les 3 carnets
complets (60 adresses, 38 Ko) — refusée par Soumia le jour même : recopier tout le contenu enlève
au visiteur toute raison de revenir sur les fiches. Version retenue : profil, les 3 destinations
avec leur % de match et l'intro du carnet, puis **3 adresses par destination** (une par catégorie
quand c'est possible : dormir / manger / faire), un "+ N autres adresses dans le carnet" et le
bouton vers la fiche. 12 Ko. Ne pas re-proposer d'y remettre les carnets entiers.

- `lib/email/itinerary.ts` — construction du HTML. `pickPreviewAddresses()` prend une adresse par
  catégorie en tour de rôle, puis complète si une catégorie est vide (plusieurs carnets n'ont pas
  d'activité). Le libellé de catégorie ne s'imprime qu'au changement de groupe (sinon Porto, qui
  n'a que des restos, affichait "Où manger" trois fois). Sans images : bloquées par défaut par les
  messageries, et inutiles ici.
- `app/actions/sendTravelMatch.ts` — **le contenu des carnets est relu en base côté serveur** à
  partir des seuls slugs. Le navigateur ne décide que de quelles destinations parler, jamais de ce
  qui est écrit dans le mail. Dédoublonne les `content_slug` partagés (Italie, Amérique du Nord).
- `scripts/preview-itinerary-email.ts` — écrit le rendu dans `~/Downloads/apercu-mail-itineraire.html`
  sans rien envoyer, et affiche la taille (Gmail tronque au-delà de ~102 Ko).
- `scripts/test-send-itinerary.ts` — envoi réel vers une adresse donnée, pour tester la chaîne.

Copie de `/resultat` alignée sur le vouvoiement à cette occasion (le bloc email tutoyait encore,
reste du questionnaire).

**Deuxième bloc, en bas de chaque fiche destination** (même jour, après un test de Soumia qui
cherchait le bloc sur une fiche) : "Recevoir mes adresses de X par email", qui envoie le carnet
**entier** de cette destination — logique inverse de l'aperçu, et volontaire : l'aperçu sert à
ramener vers la fiche, quelqu'un qui EST sur la fiche veut emporter les adresses. Placé juste après
les adresses, avant les extensions et le CTA questionnaire. `CarnetEmailCapture` dans
`app/components/EmailCapture.tsx` (les deux blocs partagent la coquille visuelle
`EmailCaptureShell`), action `sendCarnetEmail`, HTML par `buildCarnetEmailHtml`.

Aperçu du mail de fiche : `npx tsx --env-file=.env.local scripts/preview-itinerary-email.ts
--carnet <slug>` → `~/Downloads/apercu-mail-carnet.html`.

**La clé Resend n'existe que dans l'environnement Production de Vercel** : sur un lien de preview,
le bloc s'affiche mais l'envoi répond "Envoi non configuré". Constaté le 09/09/2026. À ajouter à
l'environnement Preview si un jour on veut tester l'envoi avant mise en ligne.

### Resend / DNS — ce qu'il ne faut plus jamais refaire

La zone DNS OVH porte 4 entrées Resend : TXT `resend._domainkey` (signature DKIM, commence par
`p=`), CNAME `rsend` → `rsend-euw1.forge.rmta.net.`, CNAME `send` → `send.forge.rmta.net.`, TXT
`_dmarc` → `v=DMARC1; p=none;`. **Aucune ne touche les MX ni le SPF de la racine** : la messagerie
OVH de Soumia est indépendante, ne pas y toucher.

**Trois clés API Resend ont été publiées dans le DNS** (`re_GYSpq71d…`, `re_UudfuMph…`,
`re_HeXq5MvJ…`) : la valeur DKIM avait été remplacée par la clé API, par copier-coller. Toutes les
trois ont été révoquées. Règle : une valeur qui commence par `re_` ne va JAMAIS dans le DNS, elle
ne va que dans les variables d'environnement Vercel et dans `.env.local`. Les valeurs du DNS
commencent par `p=`, `rsend-`, `send.` ou `v=DMARC1`.

Le mail part de `contact@levoyagedesemotions.fr` — les réponses des visiteurs atterrissent dans
cette boîte OVH.

## Prix des adresses en gammes, pas en montants (09/09/2026)

Le champ `price` d'une adresse porte une gamme en sigles euro, jamais un montant. Grille validée
par Soumia, sur le prix **par nuit** d'un hébergement :

| Sigle | Par nuit |
|---|---|
| `€` | moins de 100 € |
| `€€` | 100 à 250 € |
| `€€€` | 250 € et plus |

Pourquoi : un montant sec ("~700 € les 4 nuits") vieillit en quelques mois sur une page publique et
ne veut rien dire pour un partenaire qui lit la fiche — la gamme, elle, reste vraie. Les trois
hôtels chinois, saisis en montants le 09/09 à partir de l'itinéraire de Soumia, ont été convertis
le jour même ; aucune autre adresse du site n'a de prix (3 sur 147 avant conversion).

Pour un **restaurant**, la grille porte sur le prix moyen par personne (validée le 09/09/2026) :
`€` = moins de 10 €, `€€` = 10 à 30 €, `€€€` = plus de 30 €.

État au 10/09/2026 : les 37 hébergements et les 82 restaurants du site sont classés (restaurants :
29 en €, 44 en €€, 9 en €€€). Trois hébergements restent sans gamme faute de source — l'appartement
de Montréal (pas un établissement), Trullo Luceri (introuvable en ligne) et l'hôtel de Zhangjiajie
(non identifié). Les gammes des restaurants ont été établies par recherche pour les adresses où le
prix est discriminant, et déduites du type d'établissement pour les cafés, boulangeries et stands de
rue — Soumia les a validées en bloc, elle y a mangé.

Ne pas confondre avec `filters.budget` (eco/confort/premium), qui vit sur la **destination** et sert
au filtrage du questionnaire, jamais à l'affichage d'une carte d'adresse.

## Collecte, consentement et anti-abus (10/09/2026)

Onze décisions prises au grillage du 09/09/2026 au soir, appliquées le lendemain. L'ordre des
décisions compte pour comprendre l'état final.

**Les deux mails sont des aperçus.** Itinéraire et carnet affichent chacun 3 adresses, une par
catégorie (dormir / manger / faire), puis "+ N autres adresses dans le carnet" et le bouton vers la
fiche. Le mail de carnet envoyait initialement le carnet entier (24 adresses) : arbitrage inverse de
Soumia le 10/09 — "c'est trop". Ne pas re-proposer d'y remettre les carnets complets.

**Les mails ne contiennent que ce que le site affiche.** `lib/visible-addresses.ts`
(`withVisibleAddresses`) est la définition unique de ce filtre — une adresse n'apparaît que si son
lien Instagram est vérifié. Avant cette correction, 6 adresses masquées sur les fiches partaient
quand même par mail. Ce module est utilisé par la fiche voyage, les deux mails et le script
d'aperçu. **À ne pas remonter dans `lib/travel-match/data.ts`** (les favoris en dépendent, cf. bug
du 29/08).

**Anti-abus volontairement léger** : un champ piège invisible dans le formulaire (`isBot`) et une
limite de 5 envois par heure et par visiteur (`allowSend`, table `send_throttle`, empreinte IP
purgée au bout d'une heure). Pas de service externe : Turnstile a été envisagé et écarté ("le plus
simple possible"), à ressortir seulement si des envois anormaux apparaissent.

**Consentement** : case facultative, décochée par défaut, sous le champ email. Sans elle, la demande
est comptée anonymement et **aucune adresse n'est conservée** — la contrainte
`email_requests_consent_requires_email` l'impose au niveau de la base, pas seulement dans le code.
Avec elle, l'adresse est gardée 3 ans après la dernière activité, et le mail porte une ligne de
désinscription (`/desinscription?token=…`, effacement immédiat, idempotent).

**Reporting** : `/admin/demandes` — total, 30 derniers jours, inscrits, détail par destination.
Objectif énoncé par Soumia : pouvoir dire à un hôtel combien de personnes ont demandé son carnet,
cinq minutes avant un rendez-vous. `force-dynamic` obligatoire (piège du cache de build).

**Pas d'outil d'envoi à la liste** : on collecte seulement. À construire quand la liste sera
alimentée et qu'il y aura quelque chose à dire.

### Pages légales — le nom de Soumia n'y figure pas

Choix explicite du 09/09/2026. C'est légal pour un site personnel non professionnel : il suffit
d'indiquer l'hébergeur et d'avoir communiqué son identité à celui-ci (LCEN art. 6 III 2).
**À revoir au premier partenariat rémunéré ou lien d'affiliation** : le site devient alors
commercial et l'identité complète devient obligatoire. Soumia le sait, c'est un report assumé, pas
un oubli.

`app/confidentialite/page.tsx` décrit exactement ce que fait le code. Toute modification de
`lib/email/requests.ts`, des actions d'envoi ou de la table `email_requests` doit y être répercutée
— une page qui ment est pire qu'une page absente.

## Refonte du questionnaire — écran d'intentions (11/09/2026)

**Les curseurs ont disparu.** Le questionnaire s'ouvrait sur sept curseurs répartis sur deux écrans,
en fin de parcours. Un curseur demande de NOTER une envie de 1 à 5 : geste d'analyste, pas de
voyageur, pénible sur mobile, et l'émotion arrivait après sept écrans de logistique.

À la place, un premier écran de **six cartes photo**, dont on choisit deux ou trois. Le parcours
passe de 9 à 8 écrans.

**Le moteur n'a pas bougé.** Une carte choisie envoie 5, une carte non choisie envoie 3 — les
valeurs exactes que produisaient les curseurs (dont le défaut était 3). L'adresse transmise à
`/resultat` est identique. Toute la conversion vit dans `QuestionnaireClient.scoresDepuisIntentions`.

**Les six cartes sont des verbes** : Flâner (exploration), Déguster (gastronomie), Respirer
(nature), Lâcher prise (plage), Vibrer (effervescence_urbaine), Bouger (rythme).

"Se régaler" est devenu **"Déguster"** le 12/09/2026 (Soumia : "c'est plus classe, c'est moins
enfantin"). Effet de bord bienvenu : c'était le seul libellé pronominal et en deux mots de la série,
les six cartes sont maintenant six infinitifs d'un seul mot. La clé de score reste `gastronomie` —
le moteur ne connaît pas les libellés.

**"Déconnecter" a été retirée** (axe `repos`). Ce n'était pas un choix de même nature : déconnecter
est le RÉSULTAT de respirer, lâcher prise, vibrer ou bouger. La donnée le confirmait — 14
destinations sur 18 étaient notées 4 ou 5 en repos, l'axe ne séparait presque rien. **L'axe existe
toujours dans le moteur et reste au neutre pour tout le monde** : le retirer aurait décalé le
calibrage, ce qu'on ne fait pas sans trafic pour le vérifier.

Une tentative de séparer les cartes en deux rangées ("Ce que tu viens chercher" / "Ce qui t'y
emmène") a été posée puis retirée le même jour : avec six verbes de même nature, la distinction
n'avait plus lieu d'être.

**Les photos des cartes sont des photos libres de droit, pas celles de Soumia.** Trois itérations :
ses propres photos illustraient des LIEUX et non des envies (deux plages différentes sur deux
intentions), puis des photos de banque de lieux identifiables (sept sujets, sept lumières), puis le
choix final, une image par envie, validée une par une par Soumia. Les crédits photographes sont dans
`lib/travel-match/questionnaire.ts`, comme dans `hero-images.ts`.

Un traitement bichrome terracotta a été essayé pour unifier les sept photos, puis **retiré** :
Soumia le trouvait trop sombre et trop orangé. Les photos sont dans leur rendu naturel, et le voile
de lisibilité a été allégé en conséquence (0,82 → 0,66).

**Les emojis ont disparu du questionnaire.** Les vingt icônes d'options sont des icônes Lucide en
trait fin, en terracotta. Les emojis ne se dessinent pas pareil d'un appareil à l'autre et juraient
à côté des cartes photo. Attention : quatre d'entre eux étaient écrits **dans le libellé même** des
options famille (`FAMILY_PROFILE_OPTIONS`), donc hors de portée de la table d'icônes — et ils
réapparaissaient sur le pavé "Adapté aux familles" des fiches hôtel.

## Le site tutoie (11/09/2026)

Le questionnaire tutoyait, tout le reste vouvoyait. Choix de Soumia : **le tutoiement partout où le
site s'adresse à un visiteur** — accueil, questionnaire, résultats, fiches, mails, philosophie,
désinscription.

**Exceptions volontaires, à ne pas "corriger"** : la page `/pros` et les deux pages légales restent
au vouvoiement. Elles s'adressent à un professionnel ou ont une portée juridique. C'est la même
personne qui ne parle pas pareil à un lecteur et à un directeur d'hôtel.

## Profils voyageur — noms et combinaison (11-12/09/2026)

Deux profils renommés, parce que leur nom ne désignait pas une personne contrairement aux trois
autres : "La Parenthèse Intimiste" → **L'Âme Tranquille**, "La Quête Hédoniste" → **Le Cœur
Gourmand**. Les sous-titres ont perdu leur vocabulaire précieux ("bons flacons" → "le vin qui va
avec"). Les trois autres (L'Âme Curieuse, Le Souffle Sauvage, L'Électron Urbain) sont inchangés,
Soumia y tient.

**Le profil affiché combine les deux axes arrivés au maximum.** C'est une correction de régression :
avec les cartes, chaque intention choisie vaut 5, donc les égalités sont devenues la règle, et le
`>` strict de `topAxis` faisait gagner le premier axe de `SCORE_AXES` à chaque fois. Quelqu'un qui
choisissait "Déguster" et "Vibrer" voyait toujours Le Cœur Gourmand, jamais L'Électron Urbain.

Les pastilles sous le profil décrivent **le visiteur**, pas les destinations — d'où l'intertitre
"Ce que tu as demandé" ajouté le 12/09 : Soumia avait lu "Sport & Aventure" comme une description de
Montréal.

## Le vrai problème du moteur : les notes ne contrastent pas

Constaté plusieurs fois le 11/09, avec les chiffres :

- **14 destinations sur 18** sont notées 4 ou 5 sur `repos`.
- **8 villes sur 10** sont notées 5 sur `exploration`. Florence et New York sont identiques sur
  trois axes sur quatre.
- La Côte Basque était notée **1 sur `rythme`** alors que c'est la destination surf — corrigé à 5 le
  11/09, ce qui la sépare enfin de Marseille (2).
- `rythme` mesure aujourd'hui **le rythme d'une ville**, pas l'effort physique : Chine urbaine, Japon
  urbain et New York sont à 5. La carte s'appelle pourtant "Bouger — se dépenser". Décision en
  attente : soit on assume le rythme, soit on fait redescendre les villes puisque leur agitation est
  déjà captée par "Vibrer".

**Aucune refonte d'interface ne réglera ça.** Tant que tout ce qui vaut le voyage est noté 5, le
moteur ne peut pas trier. La prochaine étape utile est une passe de notation destination par
destination — proposition de Claude, validation de Soumia, comme pour les scores sport.

## Mode brouillon (11/09/2026)

`destinations.published` et `voyages.published`, à `true` par défaut. Une destination non publiée
n'existe pour personne : absente du matching, de `/carnets`, et son adresse directe renvoie une page
introuvable. Permet de créer une destination et de la remplir au fil de l'eau.

**Toute destination créée par le gabarit naît en brouillon** (`ingest.ts` écrit `published = false`),
et un réimport ne touche pas au statut d'une fiche déjà en base.

    npx tsx --env-file=.env.local scripts/publier.ts            → l'état de tout
    npx tsx --env-file=.env.local scripts/publier.ts paris      → publie
    npx tsx --env-file=.env.local scripts/publier.ts paris off  → repasse en brouillon

## Mesure d'audience (11/09/2026)

Vercel Web Analytics, installé au moment où Soumia a envisagé d'acheter de la publicité — sans
chiffres, impossible de juger un euro dépensé. Sans cookie, sans donnée personnelle.

**La page Confidentialité affirmait le contraire** et a été corrigée dans le même commit. Règle :
toute évolution de la mesure ou de la collecte doit être répercutée sur cette page. Une page qui ment
est pire qu'une page absente.

Attention : l'activation se fait aussi **dans le tableau de bord Vercel** (onglet Analytics →
Enable). Le code seul ne collecte rien.

## Étalonnage photo et studio (11/09/2026)

`lib/photo-grade.ts` — une seule définition de l'ambiance "Sable" (réchauffe, désature légèrement,
remonte les noirs vers l'ivoire), appliquée aux couvertures de fiches, aux cartes de résultats, aux
carnets et aux favoris. Ce n'est pas le sujet des photos qui crée une identité visuelle, c'est leur
traitement.

Sur la page Favoris, l'image était posée sur le même bloc que le texte : un filtre l'aurait délavé
avec. L'image vit dans un calque séparé depuis.

**Le studio** (`/studio`) a gagné un sélecteur de format (Instagram carré, Pinterest 2:3, story 9:16)
et un sélecteur d'ambiance photo. La carte citation a été refondue : une seule typographie, texte
ancré en bas, monogramme en haut — la signature manuscrite venait d'un registre étranger au site. Un
modèle "Monogramme Éditorial" a été ajouté. Le compte affiché est `@levoyagedesemotions`, écrit une
seule fois dans le code.

## Vocabulaire du contenu, unifié (11/09/2026)

**Trois étiquettes de statut**, toutes à la première personne : "J'ai testé" (75), "Sur mon radar"
(61), "J'ai dormi ici" (18). Les libellés isolés ("Sur notre radar", "Repéré, pas encore testé",
"Sélection recherchée", "À tester", "Sélectionné", "Testé") ont été fondus dedans. Plus aucune
adresse sans étiquette.

**La couleur dit la même chose que le mot** : vert plein pour le vécu, gris ardoise à trait
discontinu pour le repéré. C'est la distinction centrale du site, elle se lit maintenant sans lire.

**Libellés de liens** : "Voir sur Google Maps", "Voir l'adresse", "Voir le site officiel", "Voir les
disponibilités", et pour les activités "Réservez votre activité" — réservé à celles qui se réservent
vraiment, les trois gratuites (temple Meiji-jingu, aire de jeux Diana, piscine du Shimoda) affichent
"Voir le site".

## Relecture visuelle complète (11-12/09/2026)

Première passe de `@agent-relecteur` (rapport : `.claude/relecteur/rapports/2026-09-11.md`),
tout corrigé à la demande de Soumia ("on modifie tout"). Ce qui est désormais la règle :

- **Mode sombre** : toute carte ou section posée sur une couleur de marque fixe (blanc, ivoire,
  sable, dégradés) porte la classe `surface-claire` (`app/globals.css`), qui remet localement les
  couleurs de texte claires. Sans elle, le texte passait en crème sur fond blanc. `/pros`,
  `/philosophie`, `/carnets` et le questionnaire restent entièrement clairs en mode sombre.
  Les blocs posés directement sur le fond de page utilisent `text-text` et `--accent-text`.
- **Un seul bouton principal** : classe `btn-principal` (terracotta plein, Bricolage demi-gras,
  capitales). Ne plus recréer un bouton à la main.
- **Plus de police machine à écrire** (IBM Plex Mono) sur les pages publiques : Bricolage partout.
  La classe `.mono` ne sert plus qu'au studio et à l'admin.
- **Titres en Cormorant partout**, y compris `/pros` et les pages légales. Cormorant chargé en
  600 et 700 (faux gras avant).
- **Étiquettes** : affichées via `lib/etiquettes.ts` ("GrandesVilles" → "Grandes villes"), la base
  garde la valeur brute. Tout nouveau tag mal écrit se règle dans ce fichier.
- **Typographie** : `lib/typo.ts` (`insecables`) pose les espaces insécables avant ? ! : ; ».
- **Vocabulaire unique** : les destinations disent "J'ai testé / Sur mon radar", comme les
  adresses (fini "Testée / Curatée").
- **Photos sous un titre** (cartes résultat, carnets) : dégradé sombre limité au bas de la photo.
- Accueil : "8 questions", tutoiement ; `/carnets` et Favoris tutoient ; objets des mails tutoient.
- Base : sous-titre de Lagoondy raccourci (il répétait la description).

Suite, tranchée par Soumia le 12/09/2026 :

- **Photo de couverture Côte Basque : le phare de Biarritz reste.** Elle a été remplacée le
  12/09/2026 par un coucher de soleil avec surfeurs (choisi parmi 4 candidates), puis Soumia est
  revenue au phare le jour même. Choix assumé : ne pas reproposer une photo plus chaude sous
  prétexte que la fiche parle de couchers de soleil.
- **Terracotta sombre : on suit la charte.** `--lve-terracotta-dark` vaut désormais `#b55f42`.
  Mais il tombe à 4,2 de contraste sur ivoire, sous le seuil de 4,5 pour du petit texte : les
  surtitres, étiquettes, prix, pastilles et liens utilisent donc `--lve-terracotta-ink` (`#8c4a32`).
  Règle simple : grand titre ou aplat = terracotta-dark ; petite ligne = terracotta-ink.
- **Agent relecteur et ses outils versionnés** (`.claude/agents/`, `.claude/relecteur/`) ; les
  captures restent ignorées (32 Mo, régénérées à chaque relecture).
- **Accents "décollés" : ce n'est pas un bug, c'est Cormorant Garamond.** Comparaison faite à
  toutes les graisses et avec EB Garamond : Cormorant pose ses accents haut et détachés du
  caractère, à toutes les graisses. Changer suppose de changer la police des titres (EB Garamond
  les pose normalement) — décision de Soumia, non prise à ce stade.

## Page de garde du carrousel (12/09/2026)

La première image du carrousel d'un carnet **n'est plus une photo**. Soumia tranche : dans un
carrousel de carnet, les photos se découvrent en défilant — la couverture annonce, elle ne montre
pas. C'est une tuile unie, troisième de la famille après l'ivoire (teaser 1) et le terracotta
(teaser 3), donc la semaine de publication se lit comme une gradation dans la grille.

Nouveau modèle `couverture` du studio, libellé **Page de Garde** : fond sable, surtitre "Nouveau
carnet", destination en Cormorant, villes, promesse chiffrée ("13 adresses testées"), filet,
handle et "Fais défiler →". Ce dernier n'est pas décoratif : sans lui, une tuile unie ressemble à
un post simple et personne ne devine qu'il y a six images derrière.

Deux corrections faites dans la foulée, sans lesquelles le modèle ne servait à rien :

- **Format 4:5 (1080 × 1350)** ajouté au sélecteur. C'est le gabarit des carrousels et il
  n'existait pas — la couverture serait sortie à un cadre différent des slides suivantes.
- **Export à la largeur réelle du gabarit.** `toPng` tournait à `pixelRatio: 2` sur un aperçu de
  420 px, soit des images de 840 px que les réseaux réétiraient. La finesse se calcule maintenant
  à partir de `FORMATS[].largeur`. Vaut pour les cinq modèles.

Détail typographique : la promesse est en Bricolage mono, pas en Cormorant. Cormorant dessine des
chiffres en style ancien, et un "13" plus bas que les capitales qui l'entourent se lit mal dans une
ligne espacée.

## Série des six envies (12/09/2026)

Six posts, un par jour, avant de reprendre les carnets : Soumia veut définir ce qu'est une émotion
ici avant de parler de destinations. Le compte s'appelle Le Voyage des Émotions et rien dans la
grille ne le disait.

**Les six verbes sont ceux du questionnaire, mot pour mot** : Flâner, Déguster, Respirer, Lâcher
prise, Vibrer, Bouger. Pas de liste inventée pour Instagram — quelqu'un qui a vu les six posts et
qui arrive sur Travel Match reconnaît les mots et sait déjà quoi répondre. La série est la
bande-annonce du questionnaire.

**Un post = deux images**, modèle `emotion` du studio (libellé **Émotion**, sélecteur de face) :

- **Face 1, le mot** — fond profond, le verbe en Cormorant très grand, "Une envie par jour · n/6"
  en haut, handle et "Fais défiler →" en bas. Les tuiles sont sombres, délibérément : l'ivoire est
  pris par le teaser 1, le terracotta par le teaser 3, le sable par la page de garde d'un carnet.
  Réutiliser l'un des trois aurait fait passer la série pour un carnet de plus.

  **Une couleur par envie** (Soumia, 12/09/2026 : six tuiles identiques ne contrastent pas dans la
  grille). La charte compte justement six couleurs profondes déjà utilisées ailleurs sur le site,
  donc rien n'a été inventé — et elles sont de valeur équivalente, donc la grille varie en teinte
  et pas en poids : un bloc, pas un arc-en-ciel. Cuivre pour Flâner (la pierre chaude des vieilles
  rues), terracotta pour Déguster (la table), sauge pour Respirer, océan pour Lâcher prise, prune
  pour Vibrer (la nuit), ardoise pour Bouger (l'effort du matin). La liste vit dans `ENVIES`
  (`presets.ts`) : choisir une envie remplit le verbe, la phrase, le rang et la couleur d'un coup —
  douze images à sortir, personne ne retape ça.

  Les petits textes sont en **ivoire à 75 %, pas en sable** : le sable tombe à 4,3 de contraste sur
  la sauge, sous le seuil de 4,5. Une règle unique pour les six fonds vaut mieux qu'une exception.
- **Face 2, la photo** — elle ne se découvre qu'au swipe, comme pour les carnets. Le verbe reste
  écrit en petit en haut pour qu'une capture de la seule deuxième image garde son sens. Deux voiles,
  en haut et en bas : le verbe est posé sur le ciel, la partie la plus claire d'une photo de paysage.

Six posts sur trois colonnes font **deux rangées pleines** — le seul chiffre qui tombe juste, et qui
règle au passage le décalage de rangées qui traînait d'un carnet à l'autre.

**Ce qui fait tenir la famille, c'est l'étalonnage, pas le sujet.** La note du questionnaire parle
de "matières" (sable, pierre, eau, verre) ; les images réellement en place sont des scènes — un étal
de bouquinistes, une table dressée, une montagne, des oyats, une rue en lumière rasante, deux
surfeurs. Elles tiennent ensemble par la chaleur, la désaturation et le cadrage large, pas par
l'abstraction. Conséquence pratique : une vraie scène convient, tant qu'elle passe par le même
filtre.

## L'agent Carnets remplace le skill voyage-ingest (12/09/2026)

Le skill `voyage-ingest` est supprimé. Tout ce qu'il portait — schéma réel, grille de prix en gammes,
gabarits de rédaction par catégorie, profils famille, écriture via `lib/travel-match/ingest.ts`,
import/export CSV, normalisation des liens Instagram, règle de la photo de couverture — vit
désormais dans `.claude/agents/carnets.md`, avec en plus la recherche de doublons
(`scripts/adresses.ts`) que le skill n'avait pas. Même règle qu'avant : Claude propose, Soumia
valide, puis on écrit en base. `combo-voyage` reste un skill à part.

## Les cinq agents du site (12/09/2026)

Tous dans `.claude/agents/`, invocables par leur nom. Un seul écrit dans les contenus : Carnets.

| Agent | Rôle | Écrit où |
|---|---|---|
| `travel-match` | Fait tourner le vrai moteur (scripts/match.ts), rend le profil combiné, la destination et le récit | rien, propose |
| `carnets` | Documentaliste : vrac → fiches, dédoublonnage (scripts/adresses.ts), écriture en base après validation. Remplace le skill voyage-ingest | base de contenu |
| `editorial` | La plume : accroches, introductions, descriptions, articles | rien, propose |
| `instagram` | Le cycle en 4 temps et la série des six envies, branchés sur les gabarits du Studio | rien, propose |
| `veille` | Contrôle qualité : adresses toujours ouvertes, prix, liens, nouvelles pépites | `.claude/veille/rapports/` |

À quoi s%ajoute `agent-relecteur` (design et contraste du site en ligne) et le skill `combo-voyage`.

Deux outils partagés, écrits pour eux : `scripts/match.ts` (le moteur pour de vrai) et
`scripts/adresses.ts` (recherche dans les 155 adresses). Règle commune : proposer, faire valider,
puis seulement écrire — et ne jamais transformer une adresse repérée en adresse vécue.

## Code couleur des tuiles Instagram (12/09/2026)

Une couleur, un seul emploi. **Le terracotta est la couleur de la DESTINATION** (tuile de
révélation d%un carnet), il ne sert plus à une envie — Déguster est passé en prune (le vin, la
table) et Vibrer sur l%obsidienne (la nuit) pour le libérer. Ivoire = la voix (teaser 1, posts de
concept). Sable = page de garde d%un carrousel. Les six envies : cuivre Flâner, prune Déguster,
sauge Respirer, océan Lâcher prise, obsidienne Vibrer, ardoise Bouger. La liste vit dans `ENVIES`
(`app/components/InstaStudio/presets.ts`), la règle dans `.claude/agents/instagram.md`.

Au passage : `lib/design-tokens.ts` avait gardé l%ancien terracotta sombre (#8C4A32) alors que
`app/globals.css` était passé à la valeur de la charte le matin même. Les deux fichiers sont de
nouveau en miroir, avec `terracotta.ink` pour les petits textes (le badge "Hôtel de charme" des
cartes d%adresse, en 10 px, est repassé dessus).

**Cycle révisé le 12/09/2026** : teaser 1 = tuile à la couleur de l%envie (plus l%ivoire) ;
teaser 2 = photo d%ambiance ; teaser 3 = deux images, tuile terracotta puis photo du lieu ;
post 4 = carrousel ouvert par la page de garde sable. L%ivoire sort du cycle et devient la tuile des
posts de concept, où Soumia parle en son nom.

**Tunnel final validé le 12/09/2026 ("feed clean")** : post 1 carte couleur de l%envie ; post 2
photo d%atmosphère SANS texte, pour faire respirer la grille ; post 3 carrousel de 2 (carte
terracotta puis photo du lieu + annonce du carnet) ; post 4 carrousel de 6 (couverture sable, 4
slides d%adresses, carte de conclusion + CTA Travel Match). La couverture du post 4 reste SABLE : le
terracotta est pris par le post 3, et un crème ferait doublon avec l%ivoire des posts de concept.

**Deux outils pour produire un cycle (12/09/2026)** : `scripts/photos-insta.mjs` recadre une photo
au gabarit (1080 carré ou 1080 × 1350, toujours depuis les `hires-`), `scripts/tuiles-insta.mjs`
fabrique les tuiles à partir d%un fichier de spec JSON — six types (`mot`, `definition`,
`terracotta`, `garde`, `adresses`, `fin`), identiques aux modèles du Studio. Exemple complet :
`scripts/exemples/insta-biarritz.json`. Le Studio reste la voie manuelle ; ces scripts existent
parce que son export part d%un clic que personne ne peut déclencher à la place de Soumia. L%agent
Instagram livre donc un dossier `~/Documents/Le Voyage des Émotions/Posts Insta/insta-<destination>/` (depuis le 13/09/2026, plus Téléchargements) avec les images, pas un mode
d%emploi.
