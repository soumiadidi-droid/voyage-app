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

## Pages à reconstruire

- `/` — accueil : hero, à propos, aperçu "Mes voyages", bloc questionnaire
- `/voyages` — liste des 9 voyages (grille photo + titre + accroche)
- `/voyages/[slug]` — fiche voyage : galerie photo, "Mes adresses" (Où dormir / Où manger),
  Activités. Slugs connus : `amerique-du-nord-hiver`, `cote-basque`, `crete`, `dubai`, `italie`,
  `japon`, `lisbonne`, `mykonos`, `porto`
- `/photos` — page photos
- `/questionnaire` — "Trouver mon voyage", 10 questions (9 existantes + nouvelle question sport)
  → redirige vers `/resultat?{réponses}`
- `/resultat` — moteur de matching : profil voyageur nommé + destinations classées par % de match
- `/partenariats` — page "Notre offre"
- `/guides` — guides gratuits + formulaire d'inscription email (`/api/signup`)

## Contenu récupéré (dossier `.recovery/`, à parser puis à supprimer une fois intégré)

- `.recovery/questionnaire_source.js` — code exact des 9 questions du questionnaire (id, question,
  options, attributs de scoring) + logique du composant `QuestionnaireClient`
- `.recovery/voyages_content/*.html` — HTML complet de chaque fiche voyage (galerie, hôtels,
  restos, activités) tel que servi par le site en ligne, à parser en contenu structuré
- `.recovery/voyages_liste.html`, `.recovery/photos.html`, `.recovery/partenariats.html`,
  `.recovery/guides.html` — pages annexes

## Question sport (tâche en cours)

Ajouter une 10ᵉ question au questionnaire sur le rapport au sport en vacances, avec un nouvel
attribut `sport` (0-100) intégré au moteur de matching. Scores `sport` par destination : première
passe proposée par Claude à partir des indices dans le contenu récupéré (ex. surf mentionné à
Côte Basque), à valider par Soumia avant intégration définitive — elle tranche, pas de score
inventé sans validation.

Voir le plan détaillé : `/Users/soumiadidi/.claude/plans/rosy-swimming-magpie.md`
