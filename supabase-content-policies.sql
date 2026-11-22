-- Run once in Supabase Dashboard > SQL Editor to allow public pages to read published content
-- and authenticated users listed in public.admins to manage articles and photos.
-- This does not alter category values; Island Life and Other remain ordinary topic text values.

alter table public.articles enable row level security;
alter table public.photos enable row level security;

drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles" on public.articles
  for select to anon, authenticated using (published = true);
drop policy if exists "Approved admins can manage articles" on public.articles;
create policy "Approved admins can manage articles" on public.articles
  for all to authenticated
  using (exists (select 1 from public.admins a where a.id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.id = auth.uid()));

drop policy if exists "Public can read published photos" on public.photos;
create policy "Public can read published photos" on public.photos
  for select to anon, authenticated using (published = true);
drop policy if exists "Approved admins can manage photos" on public.photos;
create policy "Approved admins can manage photos" on public.photos
  for all to authenticated
  using (exists (select 1 from public.admins a where a.id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.id = auth.uid()));

-- Photo uploads use the signed-in admin's user ID as the first storage folder.
drop policy if exists "Approved admins can upload site media" on storage.objects;
create policy "Approved admins can upload site media" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'site-media'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (select 1 from public.admins a where a.id = auth.uid())
  );
drop policy if exists "Approved admins can update site media" on storage.objects;
create policy "Approved admins can update site media" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-media' and exists (select 1 from public.admins a where a.id = auth.uid()))
  with check (bucket_id = 'site-media' and exists (select 1 from public.admins a where a.id = auth.uid()));
drop policy if exists "Approved admins can delete site media" on storage.objects;
create policy "Approved admins can delete site media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-media' and exists (select 1 from public.admins a where a.id = auth.uid()));
drop policy if exists "Public can read site media" on storage.objects;
create policy "Public can read site media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'site-media');
