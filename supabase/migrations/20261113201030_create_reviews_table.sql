create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_name text not null,
  role text not null,
  quote text not null,
  rating smallint not null check (rating between 1 and 5),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- No public policies: accessed only via the service-role client, same as
-- every other table besides `profiles` (see 20261111120000_enable_rls_on_all_tables.sql).
alter table public.reviews enable row level security;
