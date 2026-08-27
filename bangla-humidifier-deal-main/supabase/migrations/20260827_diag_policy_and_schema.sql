-- DIAGNOSTIC: Run this in Supabase SQL Editor to see the exact
-- WITH CHECK condition of the existing INSERT policy, the orders
-- table schema, and the status column default.

-- 1. Full policy definition
select
  polname as policy_name,
  polcmd as command,
  polroles::regrole[] as roles,
  pg_get_expr(polqual, polrelid) as using_expression,
  pg_get_expr(polwithcheck, polrelid) as with_check_expression
from pg_policy
where polrelid = 'public.orders'::regclass
  and polname = 'Publis can create orders';

-- 2. orders table schema (all columns, types, defaults, nullable)
select
  column_name,
  data_type,
  column_default,
  is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'orders'
order by ordinal_position;
