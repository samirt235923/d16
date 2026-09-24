-- Allow public review submissions to upload only into the reviews prefix.
drop policy if exists product_review_images_public_insert on storage.objects;
create policy product_review_images_public_insert on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'product-media' and name like 'reviews/%');

-- Seed initial customer-style reviews for the D16 product.
-- Replace these entries with consented customer submissions before presenting them as verified reviews.
insert into public.product_reviews (
  product_slug,
  customer_name,
  rating,
  review_text,
  status,
  created_at,
  approved_at
)
select
  seeded.product_slug,
  seeded.customer_name,
  seeded.rating,
  seeded.review_text,
  'approved',
  seeded.created_at,
  seeded.approved_at
from (
  values
    ('d16-air-humidifier', 'সুমাইয়া রহমান', 5, 'ছোট রুমের জন্য বেশ ভালো কাজ করছে। লাইটটা রাতে সুন্দর লাগে আর শব্দও খুব কম।', '2026-09-14 09:15:00+06'::timestamptz, '2026-09-14 12:00:00+06'::timestamptz),
    ('d16-air-humidifier', 'রাফি আহমেদ', 5, 'অফিসের ডেস্কে ব্যবহার করছি। USB দিয়ে চালানো সহজ এবং মিস্ট মোড বদলানো যায়।', '2026-09-13 18:20:00+06'::timestamptz, '2026-09-14 10:00:00+06'::timestamptz),
    ('d16-air-humidifier', 'তানজিলা ইসলাম', 4, 'সাইজে ছোট, দেখতে সুন্দর। ১৮০ML ট্যাংকটা আমার বেডসাইড টেবিলের জন্য যথেষ্ট।', '2026-09-12 14:40:00+06'::timestamptz, '2026-09-13 09:30:00+06'::timestamptz),
    ('d16-air-humidifier', 'মেহেদী হাসান', 5, 'প্যাকেট ভালো ছিল এবং সময়মতো পেয়েছি। কালো কালারটা ছবির মতোই এসেছে।', '2026-09-11 20:05:00+06'::timestamptz, '2026-09-12 11:00:00+06'::timestamptz),
    ('d16-air-humidifier', 'নুসরাত জাহান', 4, 'Night light-এর রং পরিবর্তন হয়, বাচ্চার ঘরে হালকা আলো হিসেবে ভালো লাগে।', '2026-09-10 16:10:00+06'::timestamptz, '2026-09-11 10:15:00+06'::timestamptz),
    ('d16-air-humidifier', 'আরমান কবির', 5, 'ল্যাপটপের USB পোর্টে লাগিয়ে চালাই। Intermittent mode-টা বেশ সুবিধার।', '2026-09-09 11:25:00+06'::timestamptz, '2026-09-10 08:45:00+06'::timestamptz),
    ('d16-air-humidifier', 'ফারহানা নওশীন', 4, 'কমপ্যাক্ট এবং ব্যবহার করা সহজ। পানি ভরার পর বেশ কিছুক্ষণ চলে।', '2026-09-08 13:50:00+06'::timestamptz, '2026-09-09 09:00:00+06'::timestamptz),
    ('d16-air-humidifier', 'সাকিবুল ইসলাম', 5, 'দাম অনুযায়ী ভালো পণ্য। ডেস্কে বেশি জায়গা নেয় না এবং মিস্ট দেখা যায়।', '2026-09-07 19:35:00+06'::timestamptz, '2026-09-08 10:30:00+06'::timestamptz)
) as seeded(product_slug, customer_name, rating, review_text, created_at, approved_at)
where not exists (
  select 1
  from public.product_reviews existing
  where existing.product_slug = seeded.product_slug
    and existing.customer_name = seeded.customer_name
    and existing.review_text = seeded.review_text
);