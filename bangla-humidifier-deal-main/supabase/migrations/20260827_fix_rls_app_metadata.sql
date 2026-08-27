-- ============================================================
-- FIX: Orders Dashboard RLS + Anonymous INSERT
-- ============================================================
-- Run this in Supabase SQL Editor.
-- 
-- This migration:
--   1. Re-creates the admin SELECT, UPDATE, DELETE policies using
--      app_metadata ONLY for authorization (as per Supabase security
--      best practices — user_metadata is user-mutable and must NOT
--      be used in RLS policies).
--   2. Adds the missing anonymous INSERT policy that the customer
--      order form requires.
--
-- IMPORTANT: After running this, the admin must log out and log
-- back in so Supabase Auth issues a new JWT containing the latest
-- app_metadata.role = 'admin' claim. The new JWT will then satisfy
-- the policy's auth.jwt() check.
-- ============================================================

do $$
begin
  -- ---- ADMIN: SELECT ----
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders'
      and policyname = 'orders_admin_select'
  ) then
    drop policy orders_admin_select on public.orders;
  end if;
  create policy orders_admin_select
    on public.orders
    for select
    to authenticated
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

  -- ---- ADMIN: UPDATE ----
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders'
      and policyname = 'orders_admin_update'
  ) then
    drop policy orders_admin_update on public.orders;
  end if;
  create policy orders_admin_update
    on public.orders
    for update
    to authenticated
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

  -- ---- ADMIN: DELETE ----
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders'
      and policyname = 'orders_admin_delete'
  ) then
    drop policy orders_admin_delete on public.orders;
  end if;
  create policy orders_admin_delete
    on public.orders
    for delete
    to authenticated
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

  -- ---- ANONYMOUS: INSERT ONLY ----
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders'
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
