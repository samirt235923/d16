-- Allow customers to upload review images without opening product media uploads.
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do update set public = true;

drop policy if exists product_media_public_read on storage.objects;
create policy product_media_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-media');

drop policy if exists product_review_images_public_insert on storage.objects;
create policy product_review_images_public_insert on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'product-media'
    and name like 'reviews/%'
  );

drop policy if exists product_reviews_customer_insert on public.product_reviews;
create policy product_reviews_customer_insert on public.product_reviews
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and customer_name <> ''
    and char_length(review_text) >= 10
  );