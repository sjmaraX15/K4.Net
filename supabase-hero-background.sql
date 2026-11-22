-- Run once in Supabase Dashboard > SQL Editor.
-- The existing Admin checkbox "Feature this photo in the homepage heading"
-- sets headline=true. The homepage slideshow rotates those selected photos.
-- If no photos are selected, the newest published photos are used instead.

alter table public.photos
  add column if not exists headline boolean not null default false,
  add column if not exists hero_background boolean not null default false;

notify pgrst, 'reload schema';
