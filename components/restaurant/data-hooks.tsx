'use client';

import { useEffect, useState } from 'react';
import { getBrowserSupabase } from '@/lib/supabase-browser';
import type { FAQ, GalleryImage, MenuCategory, MenuItem, Promotion, RestaurantSettings, Testimonial } from '@/lib/types';
import { fallbackSettings } from '@/lib/types';

type RestaurantData = {
  settings: RestaurantSettings;
  categories: MenuCategory[];
  items: MenuItem[];
  promotions: Promotion[];
  gallery: GalleryImage[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useRestaurantData(): RestaurantData {
  const [data, setData] = useState<Omit<RestaurantData, 'refresh'>>({
    settings: fallbackSettings,
    categories: [],
    items: [],
    promotions: [],
    gallery: [],
    testimonials: [],
    faqs: [],
    loading: true,
    error: null,
  });
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const supabase = getBrowserSupabase();
        const [settingsResult, categoriesResult, itemsResult, promotionsResult, galleryResult, testimonialsResult, faqsResult] = await Promise.all([
          supabase.from('restaurant_settings').select('*').eq('id', 'default').maybeSingle(),
          supabase.from('menu_categories').select('*').order('display_order'),
          supabase.from('menu_items').select('*').order('display_order'),
          supabase.from('promotions').select('*').order('display_order'),
          supabase.from('gallery_images').select('*').order('display_order'),
          supabase.from('testimonials').select('*').order('review_date', { ascending: false }),
          supabase.from('faqs').select('*').order('display_order'),
        ]);
        const firstError = [settingsResult, categoriesResult, itemsResult, promotionsResult, galleryResult, testimonialsResult, faqsResult].find((result) => result.error);
        if (firstError?.error) throw firstError.error;
        if (!mounted) return;
        const categories = (categoriesResult.data ?? []) as MenuCategory[];
        const categoryMap = new Map(categories.map((category) => [category.id, category]));
        const items = ((itemsResult.data ?? []) as MenuItem[]).map((item) => ({ ...item, category: categoryMap.get(item.category_id) }));
        setData({
          settings: (settingsResult.data as RestaurantSettings | null) ?? fallbackSettings,
          categories,
          items,
          promotions: (promotionsResult.data ?? []) as Promotion[],
          gallery: (galleryResult.data ?? []) as GalleryImage[],
          testimonials: (testimonialsResult.data ?? []) as Testimonial[],
          faqs: (faqsResult.data ?? []) as FAQ[],
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('restaurant data load failed', error);
        if (mounted) setData((current) => ({ ...current, loading: false, error: 'We could not load the latest restaurant information.' }));
      }
    };
    load();
    return () => { mounted = false; };
  }, [refreshToken]);

  return { ...data, refresh: () => setRefreshToken((token) => token + 1) };
}
