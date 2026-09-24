-- Add offer urgency controls to existing product tables.
-- This is separate from the initial CREATE TABLE migration so existing databases are updated too.
alter table public.products
  add column if not exists countdown_enabled boolean not null default false,
  add column if not exists countdown_duration_seconds integer not null default 0,
  add column if not exists stock_message text not null default '';

alter table public.products
  drop constraint if exists products_countdown_duration_seconds_check;

alter table public.products
  add constraint products_countdown_duration_seconds_check
  check (countdown_duration_seconds >= 0);

notify pgrst, 'reload schema';
