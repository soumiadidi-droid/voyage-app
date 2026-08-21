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

Le dossier local a été perdu (aucun repo Git retrouvé sur la machine, pas de remote GitHub relié
au projet Vercel — déploiement fait en CLI). Le dernier déploiement (dpl_BZaofsby9zewAL84H39QK6KreaZa,
commit 45118fb, "Nouvelle section 'Activités' sur les fiches voyage") a été construit avec Claude
Code. On repart d'un dossier vide et on reconstruit en s'appuyant sur le site en ligne comme
référence visuelle/fonctionnelle tant qu'on n'a pas récupéré le code exact.

## Stack

- Next.js (App Router), Turbopack
- Déploiement Vercel via CLI (pas de lien GitHub configuré à ce jour — à faire pour ne plus jamais
  perdre le code : `vercel git connect` ou push manuel vers un repo GitHub)
- Polices : Cormorant Garamond (titres/logo), + une police body via Google Fonts (Bricolage
  Grotesque / Source Serif 4 / IBM Plex Mono repérées dans les imports)
- Images stockées sur Vercel Blob storage (`*.public.blob.vercel-storage.com`)

## Pages connues (via le site en ligne)

- `/` — accueil : hero, à propos, aperçu "Mes voyages" (Crète, Japon vus), bloc questionnaire
- `/voyages` — liste complète des voyages, grille avec photo + titre + accroche
- `/voyages/[slug]` — fiche voyage détaillée (ex. `/voyages/crete`, `/voyages/japon`) — contient
  une section "Activités" (type Activity, prix optionnel + lien) ajoutée au dernier commit connu
- `/photos` — page photos (contenu non exploré)
- `/questionnaire` — "Trouver mon voyage", 9 questions / 2 minutes, matche un profil voyageur à
  une destination + des adresses. Rendu client (React), donc pas capturable par simple fetch HTML —
  seule la question 1 est visible en SSR :
  - Q1 "L'esprit du voyage" : Luxe/Lifestyle, Tendance/Resort Famille, Backpacker/Petit budget,
    Adventure/Immersion
  - Q2 à Q9 : **inconnues, à réexplorer en naviguant le site avec un navigateur/browser tool**
    avant de toucher à la logique de l'algo
- `/guides` — guides gratuits (contenu non exploré)

## Tâche en cours

Ajouter une nouvelle question à l'algo du questionnaire, sur le thème du **sport** (profil
voyageur actif / sportif). Prérequis avant d'écrire cette question : retrouver les 8 questions
manquantes (Q2-Q9) et comprendre la logique de scoring qui mène à la destination recommandée,
pour l'insérer dans le même esprit plutôt que de la deviner dans le vide.
