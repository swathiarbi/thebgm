import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const read = path => JSON.parse(readFileSync(path, 'utf8'));
const categories = readdirSync('content/categories').filter(name => name.endsWith('.json'))
  .map(name => read(`content/categories/${name}`));
const { items } = read('content/menu.json');
const categoryIds = new Set(categories.map(category => category.id));

for (const entries of [categories, items]) {
  for (const key of ['id', 'slug']) {
    assert.equal(new Set(entries.map(entry => entry[key])).size, entries.length, `Duplicate ${key}`);
  }
  for (const entry of entries) {
    assert(entry.id && entry.name?.trim() && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry.slug), `Invalid entry: ${entry.name}`);
    assert(Number.isInteger(entry.display_order), `Invalid order for ${entry.name}`);
    if (entry.image_url) {
      assert(entry.image_url.startsWith('/images/menu/') && !entry.image_url.split('/').includes('..')
        && /\.(png|jpe?g|webp|avif)$/i.test(entry.image_url),
        `Choose a local menu photo for ${entry.name}`);
      assert(statSync(`public${entry.image_url}`).isFile(), `Missing photo for ${entry.name}`);
    }
  }
}

for (const category of categories) {
  assert.equal(typeof category.is_active, 'boolean', `Visibility for ${category.name}`);
}
for (const item of items) {
  assert(categoryIds.has(item.category_id), `Choose an existing category for ${item.name}`);
  assert(Number.isFinite(item.price) && item.price >= 0, `Invalid price for ${item.name}`);
  assert.equal(typeof item.is_available, 'boolean', `Availability for ${item.name}`);
  assert.equal(typeof item.is_featured, 'boolean', `Featured status for ${item.name}`);
}
console.log(`Checked ${items.length} dishes and ${categories.length} categories.`);
