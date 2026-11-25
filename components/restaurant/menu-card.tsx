'use client';

import { Check, MessageCircle, Plus, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import type { MenuCategory, MenuItem } from '@/lib/types';
import { formatINR } from '@/lib/types';
import { useCart } from './cart-context';

const fallbackImage = '/images/food/image.png';

export function MenuCard({ item, category }: { item: MenuItem; category?: MenuCategory }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const quickOrder = `https://wa.me/917026358555?text=${encodeURIComponent(`Hello THE BGM! I would like to quick order:\n\n${item.name}\nPrice: ${formatINR(item.price)}\n\nPlease confirm availability. Thank you!`)}`;
  const handleAdd = () => {
    if (!item.is_available) return;
    addItem(item, category);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };
  return <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-charcoal shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-gold/50"><div className="relative aspect-[4/3] overflow-hidden bg-black"><img src={item.image_url || category?.image_url || fallbackImage} alt={item.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />{!item.is_available && <span className="absolute right-2.5 top-2.5 rounded-full bg-red px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white sm:right-3 sm:top-3 sm:px-3">Sold out</span>}<span className="absolute bottom-2.5 left-2.5 rounded-full border border-gold/60 bg-black/70 px-2.5 py-1 text-xs font-bold text-gold sm:bottom-3 sm:left-3 sm:px-3 sm:text-sm">{formatINR(item.price)}</span></div><div className="flex flex-1 flex-col p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-display text-lg font-bold leading-tight text-warm sm:text-xl">{item.name}</h3><p className="mt-1.5 text-xs leading-5 text-white/55 sm:mt-2 sm:text-sm">{item.description}</p></div></div><div className="mt-4 flex gap-2 sm:mt-5"><button type="button" onClick={handleAdd} disabled={!item.is_available} className={`touch-target flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition sm:py-3 ${item.is_available ? 'bg-gold text-ink hover:bg-brightGold' : 'cursor-not-allowed bg-white/10 text-white/40'}`}>{added ? <Check size={16} /> : <ShoppingBag size={16} />}<span className="truncate">{added ? 'Added' : item.is_available ? 'Add to cart' : 'Unavailable'}</span></button><a href={quickOrder} target="_blank" rel="noreferrer" aria-label={`Quick order ${item.name} on WhatsApp`} className="touch-target flex items-center justify-center rounded-xl border border-white/15 px-3 text-white/70 transition hover:border-green-400 hover:text-green-400"><MessageCircle size={17} /></a></div></div></article>;
}

export function CategoryTile({ category, itemCount }: { category: MenuCategory; itemCount: number }) {
  return <a href={`/menu?category=${category.slug}`} className="group relative min-h-40 overflow-hidden rounded-2xl border border-white/10 bg-charcoal sm:min-h-44"><img src={category.image_url || fallbackImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-105 group-hover:opacity-75" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" /><div className="relative flex h-full flex-col justify-end p-4 sm:p-5"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">{String(itemCount).padStart(2, '0')} dishes</p><h3 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">{category.name}</h3><span className="mt-3 text-xs font-bold uppercase tracking-wider text-white/65 transition group-hover:text-gold">Explore menu →</span></div></a>;
}
