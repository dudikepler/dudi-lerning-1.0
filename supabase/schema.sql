-- הרצה חד-פעמית ב-SQL Editor של Supabase כדי להקים את טבלת ההזמנות.

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text,
  service text not null,
  message text,
  slot_date date not null,
  slot_time text not null
);

alter table bookings enable row level security;

-- מאפשר לטופס הציבורי (מפתח anon) להכניס הזמנה חדשה, אך לא לקרוא/לערוך/למחוק.
create policy "public can insert bookings"
  on bookings for insert
  to anon
  with check (true);
