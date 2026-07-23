-- WhatsApp status feed feature: connections, contacts, statuses.
-- Run this in the Supabase SQL editor (or `supabase db push`) on your project.

create table if not exists public.wa_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default 'וואטסאפ שלי',
  phone_number text,
  status text not null default 'pending'
    check (status in ('pending', 'qr_ready', 'connected', 'disconnected', 'error')),
  qr_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wa_contacts (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.wa_connections (id) on delete cascade,
  wa_jid text not null,
  display_name text,
  is_followed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (connection_id, wa_jid)
);

create table if not exists public.wa_statuses (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.wa_connections (id) on delete cascade,
  contact_id uuid not null references public.wa_contacts (id) on delete cascade,
  wa_message_id text not null,
  media_type text not null check (media_type in ('image', 'video', 'text')),
  media_path text,
  caption text,
  posted_at timestamptz not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (connection_id, wa_message_id)
);

create index if not exists wa_contacts_connection_idx on public.wa_contacts (connection_id);
create index if not exists wa_statuses_connection_idx on public.wa_statuses (connection_id);
create index if not exists wa_statuses_contact_idx on public.wa_statuses (contact_id);
create index if not exists wa_statuses_expires_idx on public.wa_statuses (expires_at);

alter table public.wa_connections enable row level security;
alter table public.wa_contacts enable row level security;
alter table public.wa_statuses enable row level security;

-- wa_connections: only the owner can see/manage their own connection(s).
-- The worker process talks to the database with the service-role key, which
-- bypasses RLS entirely, so it doesn't need explicit policies here.
create policy "select own connections" on public.wa_connections
  for select using (auth.uid() = user_id);

create policy "insert own connections" on public.wa_connections
  for insert with check (auth.uid() = user_id);

create policy "update own connections" on public.wa_connections
  for update using (auth.uid() = user_id);

create policy "delete own connections" on public.wa_connections
  for delete using (auth.uid() = user_id);

-- wa_contacts: visible/editable only through an owned connection.
create policy "select own contacts" on public.wa_contacts
  for select using (
    exists (
      select 1 from public.wa_connections c
      where c.id = connection_id and c.user_id = auth.uid()
    )
  );

create policy "update own contacts" on public.wa_contacts
  for update using (
    exists (
      select 1 from public.wa_connections c
      where c.id = connection_id and c.user_id = auth.uid()
    )
  );

-- wa_statuses: read-only from the client; the worker writes these.
create policy "select own statuses" on public.wa_statuses
  for select using (
    exists (
      select 1 from public.wa_connections c
      where c.id = connection_id and c.user_id = auth.uid()
    )
  );

-- Storage bucket for status media (images/video thumbnails), kept private.
-- Objects must be stored under a `<user_id>/...` path prefix so the RLS
-- policy below can scope reads to their owner.
insert into storage.buckets (id, name, public)
values ('wa-status-media', 'wa-status-media', false)
on conflict (id) do nothing;

create policy "read own status media" on storage.objects
  for select using (
    bucket_id = 'wa-status-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- The connect page listens for QR/status updates via Supabase Realtime.
alter publication supabase_realtime add table public.wa_connections;
