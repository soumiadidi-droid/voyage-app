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

## Pages — état au 21/08/2026

Faites et poussées sur GitHub :
- `/` — accueil : hero, à propos, bloc questionnaire (fait, fidèle à l'original)
- `/voyages` — liste des 9 voyages (fait)
- `/voyages/[slug]` — fiche voyage complète : galerie photo, "Mes adresses" (Où dormir / Où
  manger), Activités (fait pour les 9 : `amerique-du-nord-hiver`, `cote-basque`, `crete`, `dubai`,
  `italie`, `japon`, `lisbonne`, `mykonos`, `porto` — contenu texte/liens exact, récupéré du site
  en ligne via `.recovery/parse_voyages.py` → `content/voyages/*.json`)
- `/questionnaire` — 10 questions (9 originales + nouvelle question sport), fait, testé bout en
  bout (`app/questionnaire/`)
- `/resultat` — moteur de matching reconstruit (pas identique à l'original, équivalent — voir
  `lib/matching.ts`, `lib/destinations.ts`), fait, testé

**Reste à faire (prochaine session)** :
- `/photos` — page photos transverse (contenu déjà en cache : `.recovery/photos.html`)
- `/partenariats` — page "Notre offre" (cache : `.recovery/partenariats.html`)
- `/guides` — guides gratuits + formulaire d'inscription email `/api/signup` (cache :
  `.recovery/guides.html`)
- Une fois ces 3 pages faites : déploiement **preview** (jamais direct en prod), comparaison avec
  https://voyage-app-sage.vercel.app, puis reconnexion du projet Vercel au repo GitHub
  (`create_git_project`) — voir Phase 0.4 et Phase 4 du plan

## Contenu récupéré (dossier `.recovery/`)

- `.recovery/questionnaire_source.js` — code exact des 9 questions originales (intégré dans
  `lib/questionnaire.ts`)
- `.recovery/voyages_content/*.html` + `.recovery/parse_voyages.py` — déjà parsés dans
  `content/voyages/*.json`, intégrés. Peut être supprimé si l'espace dérange, sinon inoffensif.
- `.recovery/photos.html`, `.recovery/partenariats.html`, `.recovery/guides.html` — **pas encore
  parsés**, à utiliser pour les 3 pages restantes ci-dessus

## Question sport — RÉSOLU

10ᵉ question ajoutée (`lib/questionnaire.ts`, id `sport`), attribut `sport` (0-100) intégré au
moteur de matching (`lib/destinations.ts`, `lib/matching.ts`). Scores `sport` par destination
validés par Soumia le 21/08/2026 (ex. Côte Basque 80 pour le surf, Mykonos 30 farniente). Ne pas
re-proposer de nouveaux scores sans qu'elle le demande.

Voir le plan détaillé : `/Users/soumiadidi/.claude/plans/rosy-swimming-magpie.md`
