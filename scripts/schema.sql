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
