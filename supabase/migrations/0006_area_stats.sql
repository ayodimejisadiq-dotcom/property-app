-- Area data cache + per-deal factor details.
--
-- area_stats caches slow public-API lookups (Land Registry HPI + Price
-- Paid, ONS census tenure) per postcode sector + property type, refreshed
-- every 30 days by the analyse route.
--
-- deals.factor_details stores the data snapshot each factor was scored
-- from (growth %, comps median, tenure mix, reasonings) so the deal page
-- can show *why* a factor scored the way it did.

create table if not exists public.area_stats (
  key text primary key, -- "<postcode sector>|<property type>", e.g. "M19 2|terraced"
  payload jsonb not null,
  fetched_at timestamptz not null default now()
);

alter table public.area_stats enable row level security;

-- Shared cache: any signed-in user can read it and contribute to it.
create policy "Authenticated read area stats"
  on public.area_stats
  for select
  to authenticated
  using (true);

create policy "Authenticated insert area stats"
  on public.area_stats
  for insert
  to authenticated
  with check (true);

create policy "Authenticated update area stats"
  on public.area_stats
  for update
  to authenticated
  using (true)
  with check (true);

create index if not exists area_stats_fetched_at_idx
  on public.area_stats (fetched_at);

alter table public.deals
  add column if not exists factor_details jsonb;
