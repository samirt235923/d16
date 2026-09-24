-- Product management data model for the existing storefront.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_title text not null,
  category text not null default 'uncategorized',
  tags text[] not null default '{}',
  short_description text not null default '',
  description text not null default '',
  regular_price numeric(12,2) not null check (regular_price >= 0),
  offer_price numeric(12,2) not null check (offer_price >= 0 and offer_price <= regular_price),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  countdown_enabled boolean not null default false,
  countdown_duration_seconds integer not null default 0 check (countdown_duration_seconds >= 0),
  stock_message text not null default '',
  delivery_dhaka numeric(12,2) not null default 70 check (delivery_dhaka >= 0),
  delivery_outside_dhaka numeric(12,2) not null default 130 check (delivery_outside_dhaka >= 0),
  offer_start_date timestamptz,
  offer_end_date timestamptz,
  status text not null default 'draft' check (status in ('published', 'draft', 'unpublished')),
  active boolean not null default true,
  video_url text,
  key_features jsonb not null default '[]',
  benefits jsonb not null default '[]',
  specifications jsonb not null default '[]',
  how_to_use jsonb not null default '[]',
  whats_included text not null default '',
  customer_information text not null default '',
  delivery_information text not null default '',
  return_information text not null default '',
  seo_title text not null default '',
  meta_description text not null default '',
  focus_keyword text not null default '',
  canonical_url text not null default '',
  og_title text not null default '',
  og_description text not null default '',
  og_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  value text not null,
  price numeric(12,2),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  product_slug text not null,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  review_text text not null check (char_length(review_text) >= 10),
  customer_image text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists products_status_active_idx on public.products (status, active);
create index if not exists product_images_product_sort_idx on public.product_images (product_id, sort_order);
create index if not exists product_reviews_product_slug_status_idx on public.product_reviews (product_slug, status, created_at desc);
create index if not exists product_reviews_status_created_idx on public.product_reviews (status, created_at desc);

alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variations enable row level security;
alter table public.product_reviews enable row level security;

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select to anon, authenticated
  using (status = 'published' and active = true);
drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products for all to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin')
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');

drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read on public.product_images for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published' and p.active = true));
drop policy if exists product_images_admin_all on public.product_images;
create policy product_images_admin_all on public.product_images for all to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin')
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');

drop policy if exists product_variations_public_read on public.product_variations;
create policy product_variations_public_read on public.product_variations for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published' and p.active = true));
drop policy if exists product_variations_admin_all on public.product_variations;
create policy product_variations_admin_all on public.product_variations for all to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin')
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');

drop policy if exists product_reviews_public_read on public.product_reviews;
create policy product_reviews_public_read on public.product_reviews for select to anon, authenticated
  using (status = 'approved');
drop policy if exists product_reviews_customer_insert on public.product_reviews;
create policy product_reviews_customer_insert on public.product_reviews for insert to anon, authenticated
  with check (status = 'pending' and customer_name <> '' and char_length(review_text) >= 10);
drop policy if exists product_reviews_admin_all on public.product_reviews;
create policy product_reviews_admin_all on public.product_reviews for all to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin')
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');

insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

drop policy if exists product_media_public_read on storage.objects;
create policy product_media_public_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-media');
drop policy if exists product_media_admin_insert on storage.objects;
create policy product_media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'product-media' and (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'));
drop policy if exists product_media_admin_update on storage.objects;
create policy product_media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'product-media' and (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'));
drop policy if exists product_media_admin_delete on storage.objects;
create policy product_media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'product-media' and (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'));