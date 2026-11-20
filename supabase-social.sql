-- KaMoRaLe social features for Supabase
-- Run this once in Supabase Dashboard > SQL Editor. Existing article publishing continues to use the articles table.
create table if not exists public.article_reactions (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  unique (article_slug, visitor_id)
);
create table if not exists public.article_comments (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null,
  display_name text not null check (char_length(display_name) between 1 and 60),
  body text not null check (char_length(body) between 1 and 1000),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.article_reactions enable row level security;
alter table public.article_comments enable row level security;
drop policy if exists "Public can read reactions" on public.article_reactions;
create policy "Public can read reactions" on public.article_reactions for select to anon, authenticated using (true);
drop policy if exists "Public can add reactions" on public.article_reactions;
create policy "Public can add reactions" on public.article_reactions for insert to anon, authenticated with check (true);
drop policy if exists "Public can remove reactions" on public.article_reactions;
create policy "Public can remove reactions" on public.article_reactions for delete to anon, authenticated using (true);
drop policy if exists "Public can read approved comments" on public.article_comments;
create policy "Public can read approved comments" on public.article_comments for select to anon, authenticated using (approved = true);
drop policy if exists "Public can submit comments for review" on public.article_comments;
create policy "Public can submit comments for review" on public.article_comments for insert to anon, authenticated with check (approved = false);
-- Review comments in the Supabase table editor by setting approved=true. Anonymous users cannot approve or edit comments.
