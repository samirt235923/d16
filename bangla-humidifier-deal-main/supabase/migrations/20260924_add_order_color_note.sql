-- Store checkout variant color and customer notes on orders.
alter table public.orders
  add column if not exists note text not null default '';

notify pgrst, 'reload schema';
