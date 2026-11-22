-- Run once after adding the hero background option.
-- Adds one boolean column to photos: true means use this photo behind the homepage heading.

alter table public.photos add column if not exists hero_background boolean not null default false;

-- Keep at most one hero photo selected.
create unique index if not exists photos_single_hero_background
  on public.photos (hero_background)
  where hero_background = true;
