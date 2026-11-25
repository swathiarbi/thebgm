/*
# Split THE BGM public and admin read policies

1. Modified Policies
- Replaces combined anonymous/authenticated SELECT policies on restaurant content tables with separate policies.
- Anonymous visitors now read only public rows without calling the admin helper.
- Authenticated approved admins can additionally read inactive, unpublished, or draft rows.

2. Storage Security
- Keeps the restaurant asset bucket publicly readable without requiring a protected helper function.
- Upload, update, and delete operations remain restricted to approved admins.

3. Important Notes
- The `is_admin()` helper remains unavailable to anonymous callers.
- This fixes public page reads while preserving server-enforced admin access.
*/

DROP POLICY IF EXISTS "Public can view active categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON public.menu_categories;
CREATE POLICY "Public can view active categories" ON public.menu_categories FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Admins can view all categories" ON public.menu_categories FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Public can view active menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Admins can view all menu items" ON public.menu_items;
CREATE POLICY "Public can view active menu items" ON public.menu_items FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.menu_categories c WHERE c.id = category_id AND c.is_active = true));
CREATE POLICY "Admins can view all menu items" ON public.menu_items FOR SELECT TO authenticated USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.menu_categories c WHERE c.id = category_id AND c.is_active = true));

DROP POLICY IF EXISTS "Public can view current promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admins can view all promotions" ON public.promotions;
CREATE POLICY "Public can view current promotions" ON public.promotions FOR SELECT TO anon USING (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now()));
CREATE POLICY "Admins can view all promotions" ON public.promotions FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view gallery" ON public.gallery_images;
DROP POLICY IF EXISTS "Admins can view all gallery images" ON public.gallery_images;
CREATE POLICY "Public can view gallery" ON public.gallery_images FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "Admins can view all gallery images" ON public.gallery_images FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view published testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can view all testimonials" ON public.testimonials;
CREATE POLICY "Public can view published testimonials" ON public.testimonials FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "Admins can view all testimonials" ON public.testimonials FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view active FAQs" ON public.faqs;
DROP POLICY IF EXISTS "Admins can view all FAQs" ON public.faqs;
CREATE POLICY "Public can view active FAQs" ON public.faqs FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Admins can view all FAQs" ON public.faqs FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view restaurant settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Admins can view all restaurant settings" ON public.restaurant_settings;
CREATE POLICY "Public can view restaurant settings" ON public.restaurant_settings FOR SELECT TO anon USING (id = 'default');
CREATE POLICY "Admins can view all restaurant settings" ON public.restaurant_settings FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view restaurant assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view restaurant assets" ON storage.objects;
CREATE POLICY "Public can view restaurant assets" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'restaurant-assets');
CREATE POLICY "Authenticated can view restaurant assets" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'restaurant-assets');
