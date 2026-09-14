-- Schéma de migration du contenu statique voyage-app vers Postgres (Neon), 27/08/2026.
-- JSONB 1:1 avec les types TS existants (lib/travel-match/types.ts, content/voyages/index.ts)
-- pour ne rien changer à la logique de lib/travel-match/engine.ts — voir le plan de migration.

create table if not exists voyages (
  slug        text primary key,
  hero        jsonb not null,
  intro       text  not null,
  gallery     jsonb not null default '[]',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists destinations (
  id                  text primary key,
  title               text not null,
  authenticity_badge  text not null
                       check (authenticity_badge in ('tested_approved','bucket_list','discovery')),
  content_slug        text not null references voyages(slug) on delete restrict,
  summary             text not null,
  hero_image          text not null,
  filters             jsonb not null,
  scores              jsonb not null,
  logistics           jsonb not null,
  tags                text[] not null default '{}',
  regional_transport  jsonb,
  practical_info      jsonb,
  when_to_go          jsonb, -- 29/08/2026 : conseil "quand y aller" conditionné au climat choisi
                             -- au questionnaire, voir WhenToGo dans lib/travel-match/types.ts
  travel_from_paris   jsonb, -- 30/08/2026 : trajet réel depuis Paris, voir TravelFromParis
  seasonality         jsonb, -- 30/08/2026 : météo/saisonnalité réelle, voir Seasonality
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists destinations_content_slug_idx on destinations(content_slug);

-- Idempotent pour la base déjà en place (create table if not exists ne touche pas les colonnes
-- d'une table existante) — même principe que le reste du schéma, relançable sans risque.
alter table destinations add column if not exists travel_from_paris jsonb;
alter table destinations add column if not exists seasonality jsonb;

create type address_category as enum ('stay','eat','activity');

create table if not exists voyage_addresses (
  id           uuid primary key default gen_random_uuid(),
  voyage_slug  text not null references voyages(slug) on delete cascade,
  category     address_category not null,
  position     int not null,
  name         text not null,
  status       text not null default '',
  location     text not null default '',
  review       text not null default '',
  tags         text[] not null default '{}',
  link         text,
  link_label   text,
  is_partner   boolean not null default false,
  image        text,
  price        text,
  instagram_url text,
  family_fit   jsonb,
  moment       text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (voyage_slug, category, position)
);
create index if not exists voyage_addresses_voyage_slug_idx on voyage_addresses(voyage_slug);

create table if not exists combos (
  id                     text primary key,
  source_destination_id  text not null references destinations(id) on delete cascade,
  target_destination_id  text not null references destinations(id) on delete cascade,
  title                  text not null,
  vibe_type              text not null,
  description            text not null,
  transition_logistics   jsonb not null,
  min_duration_required  text not null check (min_duration_required in ('semaine','grand_voyage')),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint combos_no_self_reference check (source_destination_id <> target_destination_id),
  constraint combos_source_target_unique unique (source_destination_id, target_destination_id)
);
create index if not exists combos_source_idx on combos(source_destination_id);
create index if not exists combos_target_idx on combos(target_destination_id);

-- Demandes d'envoi par email (10/09/2026) — une ligne par carnet/itinéraire demandé.
--
-- Deux usages dans une seule table, décidés au grillage du 09/09 :
--   1. Compter. Toute demande crée une ligne, y compris quand la personne ne laisse pas son
--      adresse : `email` est alors NULL et rien de personnel n'est conservé. C'est ce qui permet
--      de dire à un hôtel "38 personnes ont demandé mon carnet sur ta destination".
--   2. La liste. Uniquement si la personne a coché la case (`consent` = true) : son adresse est
--      conservée, avec un jeton de désinscription à usage unique dans les mails.
--
-- Durée de conservation retenue : 3 ans après la dernière activité (`last_activity_at`), remise à
-- zéro à chaque nouvelle demande de la même adresse.
create table if not exists email_requests (
  id                uuid primary key default gen_random_uuid(),
  kind              text not null check (kind in ('itinerary','carnet')),
  destination_slugs text[] not null default '{}',
  email             text,
  consent           boolean not null default false,
  unsubscribe_token text unique,
  unsubscribed_at   timestamptz,
  created_at        timestamptz not null default now(),
  last_activity_at  timestamptz not null default now(),
  -- Une adresse n'est conservée QUE si la personne a coché : sans consentement, pas d'email en base.
  constraint email_requests_consent_requires_email check (
    (consent = false and email is null) or (consent = true and email is not null)
  )
);
create index if not exists email_requests_email_idx on email_requests(email) where email is not null;
create index if not exists email_requests_created_idx on email_requests(created_at);

-- Limitation d'envois (10/09/2026) — table volontairement séparée d'email_requests : elle contient
-- une empreinte d'adresse IP, donnée bien plus sensible que le reste, et ses lignes sont éphémères.
-- Purgées à chaque insertion (au-delà d'une heure), donc aucune rétention et aucun travail planifié
-- à mettre en place.
create table if not exists send_throttle (
  id         uuid primary key default gen_random_uuid(),
  ip_hash    text not null,
  created_at timestamptz not null default now()
);
create index if not exists send_throttle_ip_idx on send_throttle(ip_hash, created_at);

-- Mode brouillon (11/09/2026) — permet d'ajouter une destination et de la remplir au fil de l'eau
-- sans qu'elle soit visible, ni dans le questionnaire, ni sur /carnets, ni via son URL directe.
-- Demande de Soumia : avoir une base à compléter progressivement plutôt que de tout saisir d'un
-- coup. Par défaut à true pour que les 18 destinations existantes restent publiées.
alter table destinations add column if not exists published boolean not null default true;
alter table voyages add column if not exists published boolean not null default true;

-- 14/09/2026 : moment d'un resto (Café, Déjeuner, Dîner, Déjeuner & dîner, Pour un verre), badge de la carte.
alter table voyage_addresses add column if not exists moment text;
