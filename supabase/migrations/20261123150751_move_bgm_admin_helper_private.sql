/*
# Move THE BGM admin helper out of the public API

1. Modified Security Function
- Adds `private.is_admin()` for server-enforced owner checks.
- The helper keeps a fixed search path and checks the authenticated user against `public.admin_users`.
- Removes the old `public.is_admin()` API function after policies are updated.

2. Modified Policies
- Updates every admin-only content and storage policy to call the private helper.
- Keeps anonymous public reads on public predicates only.
- Keeps authenticated writes limited to approved admin accounts.

3. Important Notes
- The helper is no longer callable through the public REST RPC surface.
- No public content access or admin write permission is broadened by this change.
*/

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
      AND is_active = true
  );
$$;

REVOKE EXECUTE ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

DROP POLICY IF EXISTS "Admins can view all categories" ON public.menu_categories;
CREATE POLICY "Admins can view all categories" ON public.menu_categories FOR SELECT TO authenticated USING (private.is_admin());
DROP POLICY IF EXISTS "Admins can create categories" ON public.menu_categories;
CREATE POLICY "Admins can create categories" ON public.menu_categories FOR INSERT TO authenticated WITH CHECK (private.is_admin());
DROP POLICY IF EXISTS "Admins can update categories" ON public.menu_categories;
CREATE POLICY "Admins can update categories" ON public.menu_categories FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
DROP POLICY IF EXISTS "Admins can delete categories" ON public.menu_categories;
CREATE POLICY "Admins can delete categories" ON public.menu_categories FOR DELETE TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "Admins can view all menu items" ON public.menu_items;
CREATE POLICY "Admins can view all menu items" ON public.menu_items FOR SELECT TO authenticated USING (private.is_admin() OR EXISTS (SELECT 1 FROM public.menu_categories c WHERE c.id = category_id AND c.is_active = true));
DROP POLICY IF EXISTS "Admins can create menu items" ON public.menu_items;
CREATE POLICY "Admins can create menu items" ON public.menu_items FOR INSERT TO authenticated WITH CHECK (private.is_admin());
DROP POLICY IF EXISTS "Admins can update menu items" ON public.menu_items;
CREATE POLICY "Admins can update menu items" ON public.menu_items FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
DROP POLICY IF EXISTS "Admins can delete menu items" ON public.menu_items;
CREATE POLICY "Admins can delete menu items" ON public.menu_items FOR DELETE TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "Admins can view all promotions" ON public.promotions;
CREATE POLICY "Admins can view all promotions" ON public.promotions FOR SELECT TO authenticated USING (private.is_admin());
DROP POLICY IF EXISTS "Admins can create promotions" ON public.promotions;
CREATE POLICY "Admins can create promotions" ON public.promotions FOR INSERT TO authenticated WITH CHECK (private.is_admin());
DROP POLICY IF EXISTS "Admins can update promotions" ON public.promotions;
CREATE POLICY "Admins can update promotions" ON public.promotions FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
DROP POLICY IF EXISTS "Admins can delete promotions" ON public.promotions;
CREATE POLICY "Admins can delete promotions" ON public.promotions FOR DELETE TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "Admins can view all gallery images" ON public.gallery_images;
CREATE POLICY "Admins can view all gallery images" ON public.gallery_images FOR SELECT TO authenticated USING (private.is_admin());
DROP POLICY IF EXISTS "Admins can create gallery images" ON public.gallery_images;
CREATE POLICY "Admins can create gallery images" ON public.gallery_images FOR INSERT TO authenticated WITH CHECK (private.is_admin());
DROP POLICY IF EXISTS "Admins can update gallery images" ON public.gallery_images;
CREATE POLICY "Admins can update gallery images" ON public.gallery_images FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
DROP POLICY IF EXISTS "Admins can delete gallery images" ON public.gallery_images;
CREATE POLICY "Admins can delete gallery images" ON public.gallery_images FOR DELETE TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "Admins can view all testimonials" ON public.testimonials;
CREATE POLICY "Admins can view all testimonials" ON public.testimonials FOR SELECT TO authenticated USING (private.is_admin());
DROP POLICY IF EXISTS "Admins can create testimonials" ON public.testimonials;
CREATE POLICY "Admins can create testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (private.is_admin());
DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
CREATE POLICY "Admins can update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;
CREATE POLICY "Admins can delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "Admins can view all FAQs" ON public.faqs;
CREATE POLICY "Admins can view all FAQs" ON public.faqs FOR SELECT TO authenticated USING (private.is_admin());
DROP POLICY IF EXISTS "Admins can create FAQs" ON public.faqs;
CREATE POLICY "Admins can create FAQs" ON public.faqs FOR INSERT TO authenticated WITH CHECK (private.is_admin());
DROP POLICY IF EXISTS "Admins can update FAQs" ON public.faqs;
CREATE POLICY "Admins can update FAQs" ON public.faqs FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
DROP POLICY IF EXISTS "Admins can delete FAQs" ON public.faqs;
CREATE POLICY "Admins can delete FAQs" ON public.faqs FOR DELETE TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "Admins can view all restaurant settings" ON public.restaurant_settings;
CREATE POLICY "Admins can view all restaurant settings" ON public.restaurant_settings FOR SELECT TO authenticated USING (private.is_admin());
DROP POLICY IF EXISTS "Admins can create restaurant settings" ON public.restaurant_settings;
CREATE POLICY "Admins can create restaurant settings" ON public.restaurant_settings FOR INSERT TO authenticated WITH CHECK (private.is_admin());
DROP POLICY IF EXISTS "Admins can update restaurant settings" ON public.restaurant_settings;
CREATE POLICY "Admins can update restaurant settings" ON public.restaurant_settings FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
DROP POLICY IF EXISTS "Admins can delete restaurant settings" ON public.restaurant_settings;
CREATE POLICY "Admins can delete restaurant settings" ON public.restaurant_settings FOR DELETE TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "Admins can upload restaurant assets" ON storage.objects;
CREATE POLICY "Admins can upload restaurant assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'restaurant-assets' AND private.is_admin());
DROP POLICY IF EXISTS "Admins can update restaurant assets" ON storage.objects;
CREATE POLICY "Admins can update restaurant assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'restaurant-assets' AND private.is_admin()) WITH CHECK (bucket_id = 'restaurant-assets' AND private.is_admin());
DROP POLICY IF EXISTS "Admins can delete restaurant assets" ON storage.objects;
CREATE POLICY "Admins can delete restaurant assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'restaurant-assets' AND private.is_admin());

DROP FUNCTION IF EXISTS public.is_admin();
