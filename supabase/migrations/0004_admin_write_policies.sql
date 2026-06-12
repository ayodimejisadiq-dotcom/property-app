-- Admin write policies so the owner can manage users + delete deals from
-- the /admin/users page. Reads via SECURITY DEFINER public.is_admin to
-- avoid the recursive policy lookup that bit us earlier.

create policy "Admins update users"
  on public.users
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Admins delete deals"
  on public.deals
  for delete
  using (public.is_admin(auth.uid()));
