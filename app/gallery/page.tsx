'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { PageFrame } from '@/components/restaurant/site-shell';
import { useRestaurantData } from '@/components/restaurant/data-hooks';

export default function GalleryPage() {
  const { gallery, loading } = useRestaurantData();
  const [selected, setSelected] = useState<{ url: string; caption: string } | null>(null);
  const images = gallery.length ? gallery : [
    { id: 'food', image_url: '/images/food/image.png', caption: 'A BGM table favourite', display_order: 1, is_published: true },
    { id: 'menu', image_url: '/images/menu/image.png', caption: 'The BGM menu', display_order: 2, is_published: true },
  ];
  return <PageFrame><section className="border-b border-gold/15 bg-charcoal/45 px-5 py-12 sm:py-16 lg:px-8 lg:py-20"><div className="mx-auto max-w-7xl"><p className="eyebrow">A taste of THE BGM</p><h1 className="mt-3 font-display text-display-page font-bold leading-none text-warm sm:mt-4 sm:text-7xl">Food worth<br /><span className="text-gold">looking forward to.</span></h1><p className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:mt-7 sm:text-base sm:leading-8">A growing gallery of what comes out of our kitchen. More moments will appear as they are added by the restaurant.</p></div></section><section className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8 lg:py-16">{loading ? <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-2xl bg-charcoal sm:h-80" /><div className="h-64 animate-pulse rounded-2xl bg-charcoal sm:h-80" /></div> : <div className="grid auto-rows-[180px] gap-3 sm:auto-rows-[220px] sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">{images.map((image, index) => <button key={image.id} type="button" onClick={() => setSelected({ url: image.image_url, caption: image.caption })} className={`group relative overflow-hidden rounded-2xl border border-white/10 text-left ${index === 0 ? 'sm:row-span-2 lg:col-span-2' : ''}`}><img src={image.image_url} alt={image.caption || 'THE BGM gallery image'} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-12 text-sm text-white/80 sm:px-5 sm:pb-5">{image.caption || 'The BGM'}</span></button>)}</div>}</section>{selected && <div role="dialog" aria-modal="true" className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 sm:p-5" onClick={() => setSelected(null)}><button type="button" aria-label="Close image" onClick={() => setSelected(null)} className="touch-target absolute right-4 top-4 rounded-full border border-white/20 p-3 text-white sm:right-5 sm:top-5"><X size={20} /></button><div className="max-h-[85vh] max-w-5xl" onClick={(event) => event.stopPropagation()}><img src={selected.url} alt={selected.caption || 'THE BGM gallery image'} className="max-h-[72vh] w-auto max-w-full rounded-xl object-contain sm:max-h-[78vh]" /><p className="mt-4 text-center text-sm text-white/65">{selected.caption}</p></div></div>}</PageFrame>;
}
