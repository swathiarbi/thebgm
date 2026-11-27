import catalog from '@/content/menu.json';
import type { MenuCategory, MenuItem } from './types';

// Next's webpack build includes every category created by the CMS.
declare const require: {
  context(path: string, recursive: boolean, pattern: RegExp): {
    (key: string): MenuCategory;
    keys(): string[];
  };
};

const categoryFiles = require.context('../content/categories', false, /^\.\/[^/]+\.json$/);
const byDisplayOrder = (a: { display_order: number }, b: { display_order: number }) =>
  a.display_order - b.display_order;

export const allCategories = categoryFiles.keys().map(key => categoryFiles(key)).sort(byDisplayOrder);
const byId = new Map(allCategories.map(category => [category.id, category]));
type CatalogItem = Omit<MenuItem, 'image_url' | 'description' | 'category'> & {
  description?: string;
  image_url?: string | null;
};
const sourceItems: CatalogItem[] = catalog.items;
export const allItems: MenuItem[] = sourceItems.map(item => ({
  ...item,
  description: item.description ?? '',
  image_url: item.image_url || null,
  category: byId.get(item.category_id),
})).sort(byDisplayOrder);

export const categories = allCategories.filter(category => category.is_active);
export const items = allItems.filter(item => item.category?.is_active);
export const sharedMenuPhoto = '/images/menu/shared-biryani.webp';

export function menuPhoto(item: MenuItem) {
  return item.image_url || item.category?.image_url || sharedMenuPhoto;
}
