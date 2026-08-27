-- FIX: Run this in Supabase SQL Editor to fix the Orders Dashboard
-- "Orders could not be loaded" error and the missing anonymous INSERT policy.
--
-- What this does:
--   1. Re-creates the admin SELECT, UPDATE, DELETE policies so they accept
--      the admin role from EITHER app_metadata OR user_metadata. This is
--      more robust than the previous version which only checked app_metadata.
--   2. Adds the anonymous INSERT policy that the customer order form needs.
--
-- This does NOT grant SELECT, UPDATE, or DELETE to anonymous or public roles.
-- RLS remains enabled. The orders table and existing data are not touched.

do $$
begin
  -- Drop and recreate the admin SELECT policy (now checks both metadata fields)
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'orders_admin_select'
  ) then
    drop policy orders_admin_select on public.orders;
  end if;
  create policy orders_admin_select
    on public.orders
    for select
    to authenticated
    using (
      coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
      or coalesce((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
    );

  -- Drop and recreate the admin UPDATE policy
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'orders_admin_update'
  ) then
    drop policy orders_admin_update on public.orders;
  end if;
  create policy orders_admin_update
    on public.orders
    for update
    to authenticated
    using (
      coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
      or coalesce((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
    )
    with check (
      coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
      or coalesce((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
    );

  -- Drop and recreate the admin DELETE policy
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'orders_admin_delete'
  ) then
    drop policy orders_admin_delete on public.orders;
  end if;
  create policy orders_admin_delete
    on public.orders
    for delete
    to authenticated
    using (
      coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
      or coalesce((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
    );

  -- Add the anonymous INSERT policy for the customer order form
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'orders_anon_insert'
  ) then
    create policy orders_anon_insert
      on public.orders
      for insert
      to anon
      with check (true);
  end if;
end
$$;

-- IMPORTANT: After running this, the admin must log out and log back in
-- so that Supabase Auth issues a new JWT containing the latest metadata.
-- The new JWT will then satisfy the policy's auth.jwt() check.
