-- Move existing products from the retired category slugs to the new catalog.
update public.products
set category = case category
  when 'humidifier' then 'home-lifestyle'
  when 'desk-gadget' then 'decorative-lights-lamps'
  when 'lifestyle' then 'mobile-pc-accessories'
  when 'new-arrivals' then 'gadgets-electronics'
  else category
end
where category in ('humidifier', 'desk-gadget', 'lifestyle', 'new-arrivals');
