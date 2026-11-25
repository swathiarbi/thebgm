/*
# Create THE BGM restaurant content system

1. New Tables
- `menu_categories` stores public menu sections, ordering, activity state, and optional category artwork.
- `menu_items` stores every dish, price, description, availability, featured state, and optional photograph.
- `promotions` stores owner-managed offers with optional active date windows and banner artwork.
- `gallery_images` stores public gallery photographs, captions, ordering, and publication state.
- `testimonials` stores genuine owner-entered customer reviews and publication state.
- `faqs` stores editable customer questions and answers.
- `restaurant_settings` stores the single public restaurant profile and contact details.
- `admin_users` links approved Supabase Auth accounts to owner permissions.

2. Seed Content
- Adds the ten supplied menu categories and all 53 supplied menu prices.
- Adds initial editable FAQ content and accurate THE BGM contact details.
- Uses the supplied local food image as a starting featured image only where appropriate; other image fields remain editable.

3. Security
- Enables row-level security on every table.
- Public visitors can only read active, published, or currently valid content.
- Only an authenticated account listed in `admin_users` can create, edit, publish, or remove restaurant content.
- Creates a secure `is_admin()` helper with a fixed search path and no anonymous execution.
- Creates a public `restaurant-assets` storage bucket with a 5 MB image limit and owner-only write policies.

4. Important Notes
- Customer reviews are empty until the owner adds and publishes genuine reviews.
- The first owner account must be created in Supabase Auth and then approved in `admin_users`; no public admin signup is enabled.
- Menu items are database-backed and can be edited without changing the website source.
*/

CREATE TABLE IF NOT EXISTS public.menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.menu_categories(id) ON DELETE RESTRICT,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  banner_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
);

CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  review_text text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_date date,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.restaurant_settings (
  id text PRIMARY KEY DEFAULT 'default',
  restaurant_name text NOT NULL DEFAULT 'The Bangalore Grills and More',
  tagline text NOT NULL DEFAULT 'Good Food • Great Mood',
  secondary_tagline text NOT NULL DEFAULT 'Eat Good. Feel Great.',
  phone text NOT NULL DEFAULT '+91 7026358555',
  whatsapp text NOT NULL DEFAULT '917026358555',
  email text NOT NULL DEFAULT 'bangaloregrillsandmore@gmail.com',
  address text NOT NULL DEFAULT 'No. 16 & 17, 100 Feet Ring Road, near Veerabhadra Nagar Signal, Banashankari 3rd Stage, Hosakerehalli, Bengaluru, Karnataka 560085, India.',
  opening_hours text NOT NULL DEFAULT 'Monday – Sunday: 11:00 AM – 10:30 PM',
  description text NOT NULL DEFAULT 'Welcome to The Bangalore Grills and More – your destination for delicious food and authentic flavours in Bangalore! We bring together the best of grilled food, flavourful biryanis and delicious non-vegetarian specialities. Enjoy our juicy grilled chicken, smoky tandoori delights, freshly prepared shawarma, crispy fried chicken, loaded fries and biryani. Come experience the flavours of Bangalore at The Bangalore Grills and More – THE BGM!',
  map_query text NOT NULL DEFAULT 'The Bangalore Grills and More, No. 16 & 17, 100 Feet Ring Road, Hosakerehalli, Bengaluru, Karnataka 560085',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS menu_items_category_order_idx ON public.menu_items(category_id, display_order);
CREATE INDEX IF NOT EXISTS menu_items_featured_idx ON public.menu_items(is_featured, is_available);
CREATE INDEX IF NOT EXISTS promotions_active_dates_idx ON public.promotions(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS gallery_images_order_idx ON public.gallery_images(is_published, display_order);
CREATE INDEX IF NOT EXISTS testimonials_published_idx ON public.testimonials(is_published, review_date);
CREATE INDEX IF NOT EXISTS faqs_order_idx ON public.faqs(is_active, display_order);

CREATE OR REPLACE FUNCTION public.is_admin()
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

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.menu_categories, public.menu_items, public.promotions, public.gallery_images, public.testimonials, public.faqs, public.restaurant_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_categories, public.menu_items, public.promotions, public.gallery_images, public.testimonials, public.faqs, public.restaurant_settings TO authenticated;
GRANT SELECT ON public.admin_users TO authenticated;

DROP POLICY IF EXISTS "Public can view active categories" ON public.menu_categories;
CREATE POLICY "Public can view active categories" ON public.menu_categories FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "Admins can create categories" ON public.menu_categories;
CREATE POLICY "Admins can create categories" ON public.menu_categories FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can update categories" ON public.menu_categories;
CREATE POLICY "Admins can update categories" ON public.menu_categories FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete categories" ON public.menu_categories;
CREATE POLICY "Admins can delete categories" ON public.menu_categories FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view menu items" ON public.menu_items;
CREATE POLICY "Public can view menu items" ON public.menu_items FOR SELECT TO anon, authenticated USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.menu_categories c WHERE c.id = category_id AND c.is_active = true));
DROP POLICY IF EXISTS "Admins can create menu items" ON public.menu_items;
CREATE POLICY "Admins can create menu items" ON public.menu_items FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can update menu items" ON public.menu_items;
CREATE POLICY "Admins can update menu items" ON public.menu_items FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete menu items" ON public.menu_items;
CREATE POLICY "Admins can delete menu items" ON public.menu_items FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view current promotions" ON public.promotions;
CREATE POLICY "Public can view current promotions" ON public.promotions FOR SELECT TO anon, authenticated USING (public.is_admin() OR (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now())));
DROP POLICY IF EXISTS "Admins can create promotions" ON public.promotions;
CREATE POLICY "Admins can create promotions" ON public.promotions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can update promotions" ON public.promotions;
CREATE POLICY "Admins can update promotions" ON public.promotions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete promotions" ON public.promotions;
CREATE POLICY "Admins can delete promotions" ON public.promotions FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view gallery" ON public.gallery_images;
CREATE POLICY "Public can view gallery" ON public.gallery_images FOR SELECT TO anon, authenticated USING (is_published = true OR public.is_admin());
DROP POLICY IF EXISTS "Admins can create gallery images" ON public.gallery_images;
CREATE POLICY "Admins can create gallery images" ON public.gallery_images FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can update gallery images" ON public.gallery_images;
CREATE POLICY "Admins can update gallery images" ON public.gallery_images FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete gallery images" ON public.gallery_images;
CREATE POLICY "Admins can delete gallery images" ON public.gallery_images FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view published testimonials" ON public.testimonials;
CREATE POLICY "Public can view published testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (is_published = true OR public.is_admin());
DROP POLICY IF EXISTS "Admins can create testimonials" ON public.testimonials;
CREATE POLICY "Admins can create testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
CREATE POLICY "Admins can update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;
CREATE POLICY "Admins can delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view active FAQs" ON public.faqs;
CREATE POLICY "Public can view active FAQs" ON public.faqs FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "Admins can create FAQs" ON public.faqs;
CREATE POLICY "Admins can create FAQs" ON public.faqs FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can update FAQs" ON public.faqs;
CREATE POLICY "Admins can update FAQs" ON public.faqs FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete FAQs" ON public.faqs;
CREATE POLICY "Admins can delete FAQs" ON public.faqs FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view restaurant settings" ON public.restaurant_settings;
CREATE POLICY "Public can view restaurant settings" ON public.restaurant_settings FOR SELECT TO anon, authenticated USING (id = 'default' OR public.is_admin());
DROP POLICY IF EXISTS "Admins can create restaurant settings" ON public.restaurant_settings;
CREATE POLICY "Admins can create restaurant settings" ON public.restaurant_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can update restaurant settings" ON public.restaurant_settings;
CREATE POLICY "Admins can update restaurant settings" ON public.restaurant_settings FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete restaurant settings" ON public.restaurant_settings;
CREATE POLICY "Admins can delete restaurant settings" ON public.restaurant_settings FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view own admin record" ON public.admin_users;
CREATE POLICY "Admins can view own admin record" ON public.admin_users FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "No direct admin inserts" ON public.admin_users;
CREATE POLICY "No direct admin inserts" ON public.admin_users FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "No direct admin updates" ON public.admin_users;
CREATE POLICY "No direct admin updates" ON public.admin_users FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "No direct admin deletes" ON public.admin_users;
CREATE POLICY "No direct admin deletes" ON public.admin_users FOR DELETE TO authenticated USING (false);

INSERT INTO public.restaurant_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.menu_categories (name, slug, image_url, display_order)
VALUES
  ('Biryani Specials', 'biryani-specials', '/images/food/image.png', 1),
  ('Tandoori Delights', 'tandoori-delights', '/images/food/image.png', 2),
  ('Loaded Chicken Fries', 'loaded-chicken-fries', '/images/food/image.png', 3),
  ('Chicken Specials', 'chicken-specials', '/images/food/image.png', 4),
  ('Kebabs & Kebabs', 'kebabs-kebabs', '/images/food/image.png', 5),
  ('Mutton Specials', 'mutton-specials', '/images/food/image.png', 6),
  ('Shawarma', 'shawarma', '/images/food/image.png', 7),
  ('Shawarma Options', 'shawarma-options', '/images/food/image.png', 8),
  ('Indian Non-Veg', 'indian-non-veg', '/images/food/image.png', 9),
  ('Beverages', 'beverages', '/images/food/image.png', 10)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.menu_items (category_id, name, slug, description, price, display_order)
SELECT c.id, v.name, v.slug, v.description, v.price, v.display_order
FROM (VALUES
  ('biryani-specials','Hyderabadi Chicken Biryani','hyderabadi-chicken-biryani','A fragrant biryani favourite from our kitchen.',199,1),
  ('biryani-specials','Hyderabadi Mutton Biryani','hyderabadi-mutton-biryani','A hearty biryani selection for a rich, satisfying meal.',249,2),
  ('biryani-specials','Nati Style Chicken Biryani','nati-style-chicken-biryani','A homestyle chicken biryani with bold local character.',199,3),
  ('biryani-specials','Nati Style Mutton Biryani','nati-style-mutton-biryani','A generous mutton biryani made for a full-flavoured feast.',249,4),
  ('tandoori-delights','Tandoori Chicken (Half)','tandoori-chicken-half','A classic tandoori favourite for sharing or savouring solo.',229,1),
  ('tandoori-delights','Tandoori Chicken (Full)','tandoori-chicken-full','A generous tandoori centrepiece for the table.',399,2),
  ('tandoori-delights','Chicken Tikka','chicken-tikka','Juicy chicken tikka with a charred, comforting finish.',199,3),
  ('tandoori-delights','Achari Chicken Tikka','achari-chicken-tikka','Chicken tikka with a bright, tangy achari profile.',219,4),
  ('tandoori-delights','Hariyali Chicken Tikka','hariyali-chicken-tikka','A fresh-looking green-hued tikka favourite.',219,5),
  ('tandoori-delights','Malai Tikka','malai-tikka','A mellow, indulgent tikka choice for creamy flavour lovers.',229,6),
  ('tandoori-delights','Tandoori Kebabs (2 pcs)','tandoori-kebabs-2-pcs','Two smoky kebabs for a quick grilled bite.',149,7),
  ('tandoori-delights','Chicken Seekh Kebab (4 pcs)','chicken-seekh-kebab-4-pcs','Four hearty seekh kebabs with classic grilled appeal.',249,8),
  ('loaded-chicken-fries','Classic Cheese Fries','classic-cheese-fries','Golden fries with a rich, comforting cheese finish.',129,1),
  ('loaded-chicken-fries','Peri Peri Fries','peri-peri-fries','Crispy fries with a lively peri peri kick.',129,2),
  ('loaded-chicken-fries','BBQ Fries','bbq-fries','A smoky-sweet loaded fries favourite.',129,3),
  ('loaded-chicken-fries','Mexican Loaded Fries','mexican-loaded-fries','A bold, loaded fries pick with a Mexican-inspired mood.',149,4),
  ('loaded-chicken-fries','Chatpata Masala Fries','chatpata-masala-fries','Crispy fries with a chatpata masala finish.',149,5),
  ('loaded-chicken-fries','Tandoori Mayo Fries','tandoori-mayo-fries','Loaded fries with a creamy tandoori-style finish.',149,6),
  ('chicken-specials','Chicken Fry','chicken-fry','A timeless crispy chicken favourite.',179,1),
  ('chicken-specials','Chicken Sukka','chicken-sukka','A bold chicken special with a homestyle feel.',179,2),
  ('chicken-specials','Chicken 65','chicken-65','A crowd-pleasing chicken classic with plenty of flavour.',199,3),
  ('chicken-specials','Chicken Lollipop (8 pcs)','chicken-lollipop-8-pcs','Eight pieces of a fun, shareable chicken favourite.',199,4),
  ('chicken-specials','Chicken Manchurian','chicken-manchurian','A saucy chicken special with a familiar Indo-Chinese mood.',199,5),
  ('kebabs-kebabs','Reshmi Kabab','reshmi-kabab','A tender-looking kabab choice for a classic starter plate.',199,1),
  ('kebabs-kebabs','Kabab Platter','kabab-platter','A generous platter made for sharing and exploring.',399,2),
  ('kebabs-kebabs','Beef Kabab','beef-kabab','A hearty kabab pick with a satisfying grilled character.',219,3),
  ('kebabs-kebabs','Fish Fry','fish-fry','A crispy seafood favourite for a bright, savoury bite.',199,4),
  ('kebabs-kebabs','Prawns Fry','prawns-fry','A flavourful prawns selection for seafood cravings.',299,5),
  ('mutton-specials','Mutton Fry','mutton-fry','A rich mutton favourite with a satisfying finish.',249,1),
  ('mutton-specials','Mutton Sukka','mutton-sukka','A homestyle mutton special with bold character.',249,2),
  ('mutton-specials','Mutton Chukka','mutton-chukka','A hearty mutton dish for a deeply savoury meal.',249,3),
  ('mutton-specials','Mutton Pepper Fry','mutton-pepper-fry','A warming mutton special with peppery appeal.',249,4),
  ('mutton-specials','Mutton Masala','mutton-masala','A comforting mutton favourite for a full-flavoured plate.',249,5),
  ('mutton-specials','Mutton Keema Ball','mutton-keema-ball','A distinctive mutton keema selection in a shareable format.',229,6),
  ('mutton-specials','Mutton Keema Fry','mutton-keema-fry','A rich keema favourite for a satisfying meal.',249,7),
  ('shawarma','Classic Shawarma','classic-shawarma','A familiar shawarma favourite for a quick, filling bite.',119,1),
  ('shawarma','Peri Peri Shawarma','peri-peri-shawarma','A lively shawarma choice with peri peri energy.',129,2),
  ('shawarma','BBQ Shawarma','bbq-shawarma','A smoky BBQ-inspired shawarma favourite.',129,3),
  ('shawarma','Garlic Mayo Shawarma','garlic-mayo-shawarma','A creamy, comforting shawarma choice.',129,4),
  ('shawarma','Spicy Schezwan Shawarma','spicy-schezwan-shawarma','A bold shawarma pick with a spicy Schezwan mood.',139,5),
  ('shawarma-options','Roll','shawarma-roll','A simple shawarma option for easy takeaway.',99,1),
  ('shawarma-options','Plate','shawarma-plate','A plate-style shawarma option for a more relaxed meal.',129,2),
  ('indian-non-veg','Chicken Curry','chicken-curry','A comforting curry choice for a satisfying meal.',139,1),
  ('indian-non-veg','Mutton Curry','mutton-curry','A hearty curry pick with rich, familiar appeal.',179,2),
  ('indian-non-veg','Egg Curry','egg-curry','A classic curry favourite for an easy, comforting plate.',99,3),
  ('indian-non-veg','Chicken Masala','chicken-masala','A versatile chicken special with a rich masala mood.',149,4),
  ('indian-non-veg','Mutton Masala','mutton-masala','A warming mutton masala for a full-flavoured meal.',179,5),
  ('beverages','Masala Soda','masala-soda','A refreshing pick-me-up to pair with your meal.',39,1),
  ('beverages','Fresh Lime Soda','fresh-lime-soda','A bright, refreshing classic.',39,2),
  ('beverages','Cold Coffee','cold-coffee','A chilled coffee break for your BGM meal.',59,3),
  ('beverages','Milkshake','milkshake','A cool, comforting shake selection.',69,4),
  ('beverages','Soft Drinks','soft-drinks','A familiar chilled refreshment.',39,5),
  ('beverages','Water Bottle','water-bottle','A simple essential for the table.',20,6)
) AS v(category_slug, name, slug, description, price, display_order)
JOIN public.menu_categories c ON c.slug = v.category_slug
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faqs (question, answer, display_order)
VALUES
  ('What are the restaurant''s opening hours?', 'We are open every day from 11:00 AM to 10:30 PM.', 1),
  ('Where is THE BGM located?', 'You can find us at No. 16 & 17, 100 Feet Ring Road, near Veerabhadra Nagar Signal, Banashankari 3rd Stage, Hosakerehalli, Bengaluru, Karnataka 560085.', 2),
  ('Do you offer takeaway?', 'Yes. Takeaway and pickup are available every day during opening hours.', 3),
  ('Is home delivery available?', 'Home delivery depends on your location. Availability and charges are confirmed by the restaurant on WhatsApp.', 4),
  ('How can I place an order?', 'Add your favourites to the cart, choose takeaway or home delivery, and send the prepared order through WhatsApp.', 5),
  ('Can I order through WhatsApp?', 'Yes. WhatsApp is our ordering channel. Please wait for the restaurant to confirm availability and the final amount.', 6),
  ('Are delivery charges fixed?', 'No. Delivery availability and charges depend on your location and will be confirmed by the restaurant on WhatsApp.', 7)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('restaurant-assets', 'restaurant-assets', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp'];

DROP POLICY IF EXISTS "Public can view restaurant assets" ON storage.objects;
CREATE POLICY "Public can view restaurant assets" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'restaurant-assets');
DROP POLICY IF EXISTS "Admins can upload restaurant assets" ON storage.objects;
CREATE POLICY "Admins can upload restaurant assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'restaurant-assets' AND public.is_admin());
DROP POLICY IF EXISTS "Admins can update restaurant assets" ON storage.objects;
CREATE POLICY "Admins can update restaurant assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'restaurant-assets' AND public.is_admin()) WITH CHECK (bucket_id = 'restaurant-assets' AND public.is_admin());
DROP POLICY IF EXISTS "Admins can delete restaurant assets" ON storage.objects;
CREATE POLICY "Admins can delete restaurant assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'restaurant-assets' AND public.is_admin());
