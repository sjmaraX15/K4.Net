-- KaMoRaLe photo social features for the Gallery only.
-- Run once in Supabase Dashboard > SQL Editor. Views count unique browser visitors per photo.
create table if not exists public.photo_reactions (
  id uuid primary key default gen_random_uuid(),
  photo_id text not null,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  unique (photo_id, visitor_id)
);

create table if not exists public.photo_views (
  id uuid primary key default gen_random_uuid(),
  photo_id text not null,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  unique (photo_id, visitor_id)
);

alter table public.photo_reactions enable row level security;
alter table public.photo_views enable row level security;

drop policy if exists "Public can read photo reactions" on public.photo_reactions;
create policy "Public can read photo reactions" on public.photo_reactions for select to anon, authenticated using (true);
drop policy if exists "Public can add photo reactions" on public.photo_reactions;
create policy "Public can add photo reactions" on public.photo_reactions for insert to anon, authenticated with check (true);
drop policy if exists "Public can remove photo reactions" on public.photo_reactions;
create policy "Public can remove photo reactions" on public.photo_reactions for delete to anon, authenticated using (true);

drop policy if exists "Public can read photo views" on public.photo_views;
create policy "Public can read photo views" on public.photo_views for select to anon, authenticated using (true);
drop policy if exists "Public can record photo views" on public.photo_views;
create policy "Public can record photo views" on public.photo_views for insert to anon, authenticated with check (true);
