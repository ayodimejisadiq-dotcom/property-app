-- Waitlist mode + email capture. When site_settings.waitlist_mode = true the
-- public landing shows an email-capture form instead of the full marketing
-- page. Admin toggles this from /admin/waitlist.

create table if not exists public.site_settings (
  id boolean primary key default true,
  waitlist_mode boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = true)
);

insert into public.site_settings (id, waitlist_mode)
  values (true, true)
  on conflict (id) do nothing;

alter table public.site_settings enable row level security;

create policy "Anyone can read site settings"
  on public.site_settings
  for select
  using (true);

create policy "Admins update site settings"
  on public.site_settings
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  created_at timestamptz not null default now(),
  source text,
  notes text
);

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

alter table public.waitlist_signups enable row level security;

-- Anyone can insert (unauthenticated waitlist form) — no read except admins.
create policy "Anyone can sign up for waitlist"
  on public.waitlist_signups
  for insert
  with check (true);

create policy "Admins read waitlist"
  on public.waitlist_signups
  for select
  using (public.is_admin(auth.uid()));

create policy "Admins delete waitlist"
  on public.waitlist_signups
  for delete
  using (public.is_admin(auth.uid()));
