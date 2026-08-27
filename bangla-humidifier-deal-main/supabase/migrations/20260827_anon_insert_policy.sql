-- Run this in Supabase SQL Editor to restore the anonymous INSERT policy
-- that the customer order form requires. This does NOT grant SELECT, UPDATE,
-- or DELETE to anonymous or public roles.

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'orders_anon_insert'
  ) then
    create policy orders_anon_insert
      on public.orders
      for insert
      to anon
      with check (true);
  end if;
end
$$;
