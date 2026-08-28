---
name: combo-voyage
description: Ajoute un combo/extension entre deux destinations du site "Le Voyage des Émotions" (ex. "New York x Montréal"), au format neutre et réversible validé par Soumia. Utilise ce skill dès qu'elle demande d'ajouter un combo, une extension, un duo de destinations, ou donne en vrac deux villes à combiner avec des infos de transport/logistique.
---

# Combo voyage — ajout au format neutre et réversible

Depuis la migration du 27/08/2026, ajoute une ligne dans la table `combos` (Neon) via
`upsertCombo()` (`lib/travel-match/ingest.ts`) — plus une entrée `suggested_combos` dans le fichier
statique `lib/travel-match/destinations.ts` (laissé de côté, ne sert plus qu'au script de
seed/resync `scripts/seed.ts`). Même format validé le 23/08/2026, pour que le code puisse déduire
automatiquement le sens inverse (voir `lib/travel-match/combos.ts`, `getCombosFor`) sans que Soumia
ait à saisir la paire deux fois.

## Ce qu'il faut avant de démarrer

Deux destinations existantes (leurs `id` dans `DESTINATIONS`), et les infos de transition entre
elles (mode(s) de transport + durée de trajet pour chacun, éventuellement un bon plan/agence avec
lien). Si Soumia ne donne pas tout, demander plutôt que d'inventer — surtout pour les liens
partenaires (jamais de lien inventé).

## Format obligatoire

### Titre — réversible par construction

`Combo [Thématique] : [Ville A] x [Ville B]`

Exemple : `"Combo Métropole & Nature : New York x Montréal"`. La thématique résume le contraste ou
le point commun des deux lieux (2-4 mots). Les deux villes sont toujours nommées dans le titre, peu
importe l'ordre — c'est ce qui permet de l'afficher tel quel sur les DEUX fiches sans que ça sonne à
l'envers.

### Description — neutre, jamais orientée

Met en avant la **complémentarité** des deux lieux. Interdit : tout mot de départ/arrivée
("après...", "puis...", "pour finir...", "direction...", "une extension à..."). La description doit
pouvoir être lue aussi bien sur la fiche de la destination A que sur celle de B sans paraître à
l'envers.

- ❌ "Après l'énergie de New York, une extension à Montréal pour respirer."
- ✅ "Deux métropoles nord-américaines aux tempéraments complémentaires : l'effervescence électrique
  de Manhattan d'un côté, les grands espaces et la douceur québécoise de l'autre."

### `transition_logistics` — durée + mode combinés

- `transport_mode` : lister chaque mode de transport pertinent avec sa durée entre parenthèses,
  séparés par des virgules/"ou". Exemple : `"Vol direct (1h30), voiture (6h) ou train/bus Amtrak
  (10h)"`.
- `recommended_days` : durée conseillée sur place pour cette extension (pas le temps de trajet).
- `practical_tip` (optionnel) : un bon plan concret.
- `partner_link` / `partner_link_label` (optionnels) : uniquement si Soumia donne une vraie URL —
  ne jamais en inventer une.

### Saisie à sens unique

L'entrée `suggested_combos` ne se déclare **que sur une seule des deux destinations** (celle qui
semble la plus "phare"/connue des deux, au choix de Soumia si ambigu) — jamais sur les deux. L'autre
destination garde `suggested_combos: []` (ou son contenu existant si elle en a déjà pour d'autres
combos). `getCombosFor` reconstruit le sens inverse automatiquement, y compris pour le badge combo
sur `/resultat` (`hasComboOpportunity`, `dedupeComboBadges`).

`target_destination_id` doit être l'`id` réel de l'autre destination dans `DESTINATIONS` — jamais
soi-même.

`min_duration_required` : `"semaine"` ou `"grand_voyage"` selon si l'extension a du sens sur un
séjour d'une semaine ou seulement sur un grand voyage. Les combos ne s'affichent jamais sur un
week-end.

## Exemple complet

```ts
import { upsertCombo } from "@/lib/travel-match/ingest";

await upsertCombo({
  id: "combo-<ville-a>-<ville-b>",
  sourceDestinationId: "<id-de-la-destination-phare>",
  targetDestinationId: "<id-de-l-autre-destination>",
  title: "Combo Métropole & Nature : New York x Montréal",
  vibeType: "Énergie urbaine & grand air",
  description:
    "Deux métropoles nord-américaines aux tempéraments complémentaires : l'effervescence électrique de Manhattan d'un côté, les grands espaces et la douceur québécoise de l'autre.",
  transitionLogistics: {
    transport_mode: "Vol direct (1h30), voiture (6h) ou train/bus Amtrak (10h)",
    recommended_days: "3 à 4 jours sur place",
    practical_tip: "...",
    partner_link: "https://...",
    partner_link_label: "Voir l'offre →",
  },
  minDurationRequired: "semaine",
});
```

## Après l'ajout

1. `npx tsc --noEmit`, `npx eslint app/ lib/ --quiet`, `npm run build` — doivent être propres.
2. Tester en local (`npm run dev`) que le combo s'affiche bien sur les DEUX fiches détail
   (`/voyages/<slug-a>?id=<id-a>&duration=semaine`, idem pour B) avec le même titre, et que le
   badge 🔀 apparaît sur `/resultat` pour un profil qui coche `nature_plage`/`effervescence_urbaine`
   ≥ 4.
3. Commit + push (le CLAUDE.md du projet demande de ne jamais perdre le dossier de vue).
