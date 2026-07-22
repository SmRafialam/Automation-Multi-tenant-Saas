-- =====================================================================
--  AutoFlow — Multi-tenant SaaS schema
--  Run this in Supabase: SQL Editor > New query > paste > Run
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- businesses (one per client/shop) ----------
create table if not exists public.businesses (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name          text not null default 'My Business',
  plan          text not null default 'business',
  created_at    timestamptz not null default now()
);

-- ---------- connections (linked accounts; tokens live here) ----------
create table if not exists public.connections (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses(id) on delete cascade,
  type          text not null check (type in ('facebook','sheet','steadfast','whatsapp')),
  fb_page_id    text,
  access_token  text,
  extra_json    jsonb not null default '{}'::jsonb,
  status        text not null default 'connected',
  created_at    timestamptz not null default now(),
  unique (business_id, type)
);

-- ---------- posts (social scheduling + log) ----------
create table if not exists public.posts (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references public.businesses(id) on delete cascade,
  caption        text,
  ai_caption     text,
  media_url      text,
  media_type     text not null default 'image' check (media_type in ('image','video','multi')),
  scheduled_time timestamptz,
  status         text not null default 'pending' check (status in ('pending','processing','posted','failed')),
  fb_post_id     text,
  error_message  text,
  created_at     timestamptz not null default now()
);

-- ---------- customers ----------
create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name        text,
  phone       text,
  address     text,
  created_at  timestamptz not null default now()
);

-- ---------- orders ----------
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  business_id         uuid not null references public.businesses(id) on delete cascade,
  customer_id         uuid references public.customers(id) on delete set null,
  customer_name       text,
  customer_phone      text,
  address             text,
  items               text,
  amount              numeric not null default 0,
  status              text not null default 'pending' check (status in ('pending','processing','shipped','delivered','returned')),
  courier             text not null default 'steadfast' check (courier in ('steadfast','pathao','redx')),
  courier_tracking_id text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_posts_business  on public.posts(business_id);
create index if not exists idx_orders_business on public.orders(business_id);
create index if not exists idx_posts_due       on public.posts(status, scheduled_time);

-- =====================================================================
--  Row Level Security — a user only ever sees their own business rows
-- =====================================================================
alter table public.businesses  enable row level security;
alter table public.connections enable row level security;
alter table public.posts       enable row level security;
alter table public.customers   enable row level security;
alter table public.orders      enable row level security;

-- businesses: the owner has full access
drop policy if exists "own_business" on public.businesses;
create policy "own_business" on public.businesses
  for all using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- helper predicate reused by child tables
--   business_id in (select id from businesses where owner_user_id = auth.uid())
drop policy if exists "own_connections" on public.connections;
create policy "own_connections" on public.connections
  for all using (business_id in (select id from public.businesses where owner_user_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_user_id = auth.uid()));

drop policy if exists "own_posts" on public.posts;
create policy "own_posts" on public.posts
  for all using (business_id in (select id from public.businesses where owner_user_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_user_id = auth.uid()));

drop policy if exists "own_customers" on public.customers;
create policy "own_customers" on public.customers
  for all using (business_id in (select id from public.businesses where owner_user_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_user_id = auth.uid()));

drop policy if exists "own_orders" on public.orders;
create policy "own_orders" on public.orders
  for all using (business_id in (select id from public.businesses where owner_user_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_user_id = auth.uid()));

-- =====================================================================
--  Auto-create a business when a new user signs up
--  (reads business_name from the signup metadata)
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.businesses (owner_user_id, name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'business_name', ''), 'My Business')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
