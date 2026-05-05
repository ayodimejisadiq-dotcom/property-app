-- Dealscope V1 — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

-- ============================================================
-- users (extends auth.users)
-- ============================================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  is_admin boolean not null default false,
  disclaimer_accepted_at timestamptz,
  disclaimer_version text,
  tier text not null default 'free' check (tier in ('free','investor','pro','portfolio')),
  deals_used_this_month integer not null default 0,
  deals_quota_resets_at timestamptz,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users see own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Admins see all users" on public.users
  for select using (
    exists (select 1 from public.users u2 where u2.id = auth.uid() and u2.is_admin = true)
  );

-- ============================================================
-- deals
-- ============================================================
create table public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  source_url text,
  address text not null,
  postcode text not null,
  price integer not null,
  bedrooms integer not null,
  property_type text not null,
  monthly_rent integer not null,
  deposit_percent numeric(5,2) not null default 25.00,
  mortgage_rate numeric(5,2) not null default 5.25,
  mortgage_term_years integer not null default 25,
  composite_score integer,
  yield_score integer,
  area_growth_score integer,
  demand_score integer,
  refinance_score integer,
  bmv_score integer,
  tenant_profile_score integer,
  licensing_risk_score integer,
  gross_yield_bps integer,
  net_yield_bps integer,
  monthly_cashflow integer,
  stamp_duty integer,
  cash_roi_bps integer,
  total_acquisition_cost integer,
  ai_report_summary text,
  ai_report_strengths text[],
  ai_report_risks text[],
  ai_report_score_band text,
  ai_report_generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.deals enable row level security;

create policy "Users CRUD own deals" on public.deals
  for all using (auth.uid() = user_id);

create policy "Admins read all deals" on public.deals
  for select using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
  );

create index deals_user_id_created_at_idx on public.deals(user_id, created_at desc);
create index deals_postcode_idx on public.deals(postcode);

-- ============================================================
-- disclaimer_versions (public read)
-- ============================================================
create table public.disclaimer_versions (
  version text primary key,
  body text not null,
  effective_from timestamptz not null default now()
);

alter table public.disclaimer_versions enable row level security;

create policy "Disclaimer versions are public" on public.disclaimer_versions
  for select using (true);

insert into public.disclaimer_versions (version, body) values
('1.0', 'Dealscope is an analytical tool, not a financial adviser. Scores and reports are for research only and must not be treated as a recommendation to buy, sell or finance any property. Always commission a survey, valuation and legal review before any property transaction. Consult a qualified mortgage broker. Estimates rely on third-party data that may be incomplete or delayed. Dealscope and Daramola Consulting accept no liability for investment outcomes based on use of this tool.');

-- ============================================================
-- audit_log (admin-only read)
-- ============================================================
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  event_type text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

create policy "Admins read audit log" on public.audit_log
  for select using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
  );

create index audit_log_created_at_idx on public.audit_log(created_at desc);

-- ============================================================
-- Auto-create profile + audit row on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  insert into public.audit_log (user_id, event_type, metadata)
  values (new.id, 'signup', jsonb_build_object('email', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
