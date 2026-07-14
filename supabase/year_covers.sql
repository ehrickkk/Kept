-- Year cover images for the By Year view.
-- Run this in the Supabase SQL editor.

create table if not exists public.year_covers (
  year integer primary key,
  image_url text not null,
  updated_at timestamptz not null default now()
);

alter table public.year_covers enable row level security;

-- Public read (covers are shown on the scrapbook)
create policy "year_covers_select_public"
  on public.year_covers
  for select
  using (true);

-- Authenticated admin write
create policy "year_covers_insert_authenticated"
  on public.year_covers
  for insert
  to authenticated
  with check (true);

create policy "year_covers_update_authenticated"
  on public.year_covers
  for update
  to authenticated
  using (true)
  with check (true);

create policy "year_covers_delete_authenticated"
  on public.year_covers
  for delete
  to authenticated
  using (true);

-- Optional: ensure storage allows year-covers/* under the existing photos bucket.
-- If your bucket policies are path-scoped, add an authenticated write rule for
-- objects whose name starts with 'year-covers/'.
