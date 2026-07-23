-- Therapist recommendations platform: core schema + row level security.
-- Run this once against your Supabase project (SQL editor or `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- therapists
-- ---------------------------------------------------------------------------
create table if not exists public.therapists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  slug text not null unique,
  full_name text not null,
  title text not null default '',
  bio text not null default '',
  city text not null default '',
  specialties text[] not null default '{}',
  phone text not null default '',
  email text not null default '',
  website text not null default '',
  photo_url text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists therapists_status_idx on public.therapists (status);
create index if not exists therapists_city_idx on public.therapists (city);

-- Owners cannot self-approve or spoof another user's id: force these fields
-- server-side regardless of what the client sends.
create or replace function public.therapists_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.user_id := auth.uid();
  new.status := 'pending';
  new.created_at := now();
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists therapists_before_insert on public.therapists;
create trigger therapists_before_insert
  before insert on public.therapists
  for each row execute function public.therapists_before_insert();

create or replace function public.therapists_before_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only the service role (used by admin server actions) may change status.
  if auth.role() <> 'service_role' then
    new.status := old.status;
    new.user_id := old.user_id;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists therapists_before_update on public.therapists;
create trigger therapists_before_update
  before update on public.therapists
  for each row execute function public.therapists_before_update();

alter table public.therapists enable row level security;

drop policy if exists "therapists_public_read_approved" on public.therapists;
create policy "therapists_public_read_approved"
  on public.therapists for select
  to anon, authenticated
  using (status = 'approved');

drop policy if exists "therapists_owner_read_own" on public.therapists;
create policy "therapists_owner_read_own"
  on public.therapists for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "therapists_owner_insert" on public.therapists;
create policy "therapists_owner_insert"
  on public.therapists for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "therapists_owner_update" on public.therapists;
create policy "therapists_owner_update"
  on public.therapists for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- articles
-- ---------------------------------------------------------------------------
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references public.therapists (id) on delete cascade,
  slug text not null,
  title text not null,
  content text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (therapist_id, slug)
);

create index if not exists articles_therapist_idx on public.articles (therapist_id);
create index if not exists articles_published_idx on public.articles (published);

create or replace function public.articles_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists articles_touch_updated_at on public.articles;
create trigger articles_touch_updated_at
  before update on public.articles
  for each row execute function public.articles_touch_updated_at();

alter table public.articles enable row level security;

drop policy if exists "articles_public_read_published" on public.articles;
create policy "articles_public_read_published"
  on public.articles for select
  to anon, authenticated
  using (
    published = true
    and exists (
      select 1 from public.therapists t
      where t.id = articles.therapist_id and t.status = 'approved'
    )
  );

drop policy if exists "articles_owner_read_own" on public.articles;
create policy "articles_owner_read_own"
  on public.articles for select
  to authenticated
  using (
    exists (
      select 1 from public.therapists t
      where t.id = articles.therapist_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "articles_owner_insert" on public.articles;
create policy "articles_owner_insert"
  on public.articles for insert
  to authenticated
  with check (
    exists (
      select 1 from public.therapists t
      where t.id = articles.therapist_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "articles_owner_update" on public.articles;
create policy "articles_owner_update"
  on public.articles for update
  to authenticated
  using (
    exists (
      select 1 from public.therapists t
      where t.id = articles.therapist_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.therapists t
      where t.id = articles.therapist_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "articles_owner_delete" on public.articles;
create policy "articles_owner_delete"
  on public.articles for delete
  to authenticated
  using (
    exists (
      select 1 from public.therapists t
      where t.id = articles.therapist_id and t.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- reviews (fully anonymous: intentionally no reviewer identity column)
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references public.therapists (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 1 and 4000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists reviews_therapist_idx on public.reviews (therapist_id);
create index if not exists reviews_status_idx on public.reviews (status);

-- Force every incoming review to pending status, regardless of client input,
-- and strip any identity a future column might add — reviews stay anonymous.
create or replace function public.reviews_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.status := 'pending';
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists reviews_before_insert on public.reviews;
create trigger reviews_before_insert
  before insert on public.reviews
  for each row execute function public.reviews_before_insert();

alter table public.reviews enable row level security;

drop policy if exists "reviews_public_read_approved" on public.reviews;
create policy "reviews_public_read_approved"
  on public.reviews for select
  to anon, authenticated
  using (status = 'approved');

drop policy if exists "reviews_anyone_insert" on public.reviews;
create policy "reviews_anyone_insert"
  on public.reviews for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.therapists t
      where t.id = reviews.therapist_id and t.status = 'approved'
    )
  );

-- No update/delete policy for anon/authenticated: once submitted, a review
-- can only be moderated by the service role (admin server actions).

-- ---------------------------------------------------------------------------
-- storage: therapist profile photos
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('therapist-photos', 'therapist-photos', true)
on conflict (id) do nothing;

drop policy if exists "therapist_photos_public_read" on storage.objects;
create policy "therapist_photos_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'therapist-photos');

drop policy if exists "therapist_photos_owner_write" on storage.objects;
create policy "therapist_photos_owner_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'therapist-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "therapist_photos_owner_update" on storage.objects;
create policy "therapist_photos_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'therapist-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "therapist_photos_owner_delete" on storage.objects;
create policy "therapist_photos_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'therapist-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
