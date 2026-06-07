-- Add per-user scrape counter. Read by /api/scrape to cap free-tier usage.
-- Reset on the same monthly window as deals_used_this_month (handled in code).

alter table public.users
  add column if not exists scrapes_used_this_month integer not null default 0;
