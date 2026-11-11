-- Fix Supabase advisor "rls_disabled_in_public": every public table is
-- currently readable/writable by anyone with the anon key. All app code
-- accesses these tables via the service-role client (which bypasses RLS)
-- except `profiles`, which is read via the session-bound anon client for
-- login/admin-role checks and the checkout/account pages.

alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.inquiries enable row level security;
alter table public.order_events enable row level security;
alter table public.inventory enable row level security;
alter table public.order_items enable row level security;
alter table public.orders enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.product_attributes enable row level security;
alter table public.variant_options enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);
