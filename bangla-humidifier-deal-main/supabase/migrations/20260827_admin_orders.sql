-- REVIEW ONLY: run this in Supabase SQL Editor after creating the admin user
-- and assigning app_metadata.role = 'admin'. This migration does not alter
-- the existing anonymous INSERT policy.

alter table public.orders
  add column if not exists status text;

update public.orders
set status = 'pending'
where status is null;

alter table public.orders
  alter column status set default 'pending',
  alter column status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_status_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_status_check
      check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));
  end if;
end
$$;

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_phone_idx on public.orders (phone);

alter table public.orders enable row level security;

-- Do not add SELECT, UPDATE, or DELETE policies for anon or public.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'orders_admin_select'
  ) then
    create policy orders_admin_select
      on public.orders
      for select
      to authenticated
      using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'orders_admin_update'
  ) then
    create policy orders_admin_update
      on public.orders
      for update
      to authenticated
      using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
      with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'orders_admin_delete'
  ) then
    create policy orders_admin_delete
      on public.orders
      for delete
      to authenticated
      using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
  end if;
end
$$;

-- To use the optional real-time refresh in the dashboard, enable the orders
-- table in Database > Replication > supabase_realtime from the Supabase UI.
