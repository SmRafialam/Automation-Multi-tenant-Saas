-- =====================================================================
--  AutoFlow — Multi-tenant SaaS schema (with role-based access)
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

-- ---------- business_members (RBAC: who can access a business) ----------
create table if not exists public.business_members (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  email       text,
  role        text not null default 'staff' check (role in ('owner','manager','staff')),
  created_at  timestamptz not null default now(),
  unique (business_id, user_id)
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

create index if not exists idx_members_user   on public.business_members(user_id);
create index if not exists idx_posts_business  on public.posts(business_id);
create index if not exists idx_orders_business on public.orders(business_id);
create index if not exists idx_posts_due       on public.posts(status, scheduled_time);

-- =====================================================================
--  Helper functions (SECURITY DEFINER -> avoid RLS recursion on members)
-- =====================================================================
create or replace function public.is_member(bid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.business_members
    where business_id = bid and user_id = auth.uid()
  );
$$;

create or replace function public.is_owner(bid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.business_members
    where business_id = bid and user_id = auth.uid() and role = 'owner'
  );
$$;

create or replace function public.my_role(bid uuid)
returns text language sql security definer stable set search_path = public as $$
  select role from public.business_members
  where business_id = bid and user_id = auth.uid() limit 1;
$$;

-- =====================================================================
--  Row Level Security — access is by MEMBERSHIP, not just ownership
-- =====================================================================
alter table public.businesses       enable row level security;
alter table public.business_members enable row level security;
alter table public.connections      enable row level security;
alter table public.posts            enable row level security;
alter table public.customers        enable row level security;
alter table public.orders           enable row level security;

-- businesses: any member can read; owner can update; creator can insert
drop policy if exists "biz_select" on public.businesses;
create policy "biz_select" on public.businesses
  for select using (public.is_member(id));
drop policy if exists "biz_insert" on public.businesses;
create policy "biz_insert" on public.businesses
  for insert with check (owner_user_id = auth.uid());
drop policy if exists "biz_update" on public.businesses;
create policy "biz_update" on public.businesses
  for update using (public.is_owner(id));

-- business_members: members can read the roster; owner manages it
drop policy if exists "mem_select" on public.business_members;
create policy "mem_select" on public.business_members
  for select using (public.is_member(business_id));
drop policy if exists "mem_insert" on public.business_members;
create policy "mem_insert" on public.business_members
  for insert with check (public.is_owner(business_id) or user_id = auth.uid());
drop policy if exists "mem_update" on public.business_members;
create policy "mem_update" on public.business_members
  for update using (public.is_owner(business_id));
drop policy if exists "mem_delete" on public.business_members;
create policy "mem_delete" on public.business_members
  for delete using (public.is_owner(business_id));

-- child tables: any member of the business has full access
do $$
declare t text;
begin
  foreach t in array array['connections','posts','customers','orders'] loop
    execute format('drop policy if exists %I on public.%I', t || '_all', t);
    execute format(
      'create policy %I on public.%I for all using (public.is_member(business_id)) with check (public.is_member(business_id))',
      t || '_all', t
    );
  end loop;
end $$;

-- =====================================================================
--  Auto-create a business + owner membership when a new user signs up
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare bid uuid;
begin
  insert into public.businesses (owner_user_id, name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'business_name', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      'My Business'
    )
  )
  returning id into bid;

  insert into public.business_members (business_id, user_id, email, role)
  values (bid, new.id, new.email, 'owner');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
