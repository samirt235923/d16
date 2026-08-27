-- DIAGNOSTIC: Run this in Supabase SQL Editor to check the admin user's
-- app_metadata and user_metadata. Share the output so we can confirm the
-- exact field name and value used for the admin role.

select
  u.id,
  u.email,
  u.raw_app_meta_data as app_metadata,
  u.raw_user_meta_data as user_metadata,
  (u.raw_app_meta_data ->> 'role') as app_role,
  (u.raw_user_meta_data ->> 'role') as user_role
from auth.users u
where u.email = 'admin@example.com';
-- Replace 'admin@example.com' with the actual admin email if different.
