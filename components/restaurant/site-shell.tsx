'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Clock3, Mail, MapPin, Menu, MessageCircle, Phone, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from './cart-context';
import { fallbackSettings } from '@/lib/types';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About Us' },
  { href: '/gallery', label: 'Gallery' },
];

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="The BGM home">
      <img src="/images/logo/Untitled_Design_(2).png" alt="THE BGM logo" className={compact ? 'h-11 w-11 object-contain' : 'h-14 w-14 object-contain'} />
      {!compact && <span className="hidden sm:block">
        <span className="block font-display text-[1.25rem] font-bold leading-none tracking-wide text-gold">THE BGM</span>
        <span className="mt-1 block text-[0.58rem] uppercase tracking-[0.28em] text-white/60">The Bangalore Grills & More</span>
      </span>}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const whatsappUrl = `https://wa.me/${fallbackSettings.whatsapp}`;
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-5 lg:px-8 lg:py-3">
        <BrandMark />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => <Link key={item.href} href={item.href} className={`text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:text-gold ${pathname === item.href ? 'text-gold' : 'text-white/70'}`}>{item.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold transition hover:bg-gold hover:text-ink sm:flex"><MessageCircle size={15} /> WhatsApp</a>
          <Link href="/cart" aria-label={`Cart with ${itemCount} items`} className="touch-target relative flex items-center justify-center rounded-full border border-white/15 text-white transition hover:border-gold hover:text-gold"><ShoppingBag size={18} />{itemCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red px-1 text-[10px] font-bold text-white">{itemCount}</span>}</Link>
          <button type="button" onClick={() => setOpen(!open)} className="touch-target flex items-center justify-center rounded-full border border-white/15 text-white lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
      </div>
      {open && <nav className="border-t border-white/10 bg-charcoal px-5 py-4 lg:hidden" aria-label="Mobile navigation">{navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="block border-b border-white/10 py-3 text-sm font-semibold uppercase tracking-wider text-white/80 last:border-0">{item.label}</Link>)}<a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-red px-4 py-3 text-sm font-bold uppercase tracking-wider text-white"><MessageCircle size={17} /> Order on WhatsApp</a></nav>}
    </header>
  );
}

export function SiteFooter() {
  const settings = fallbackSettings;
  return <footer className="border-t border-gold/20 bg-black px-5 pb-8 pt-12 sm:pt-16 lg:px-8 lg:pt-16"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.7fr_1fr] md:gap-12"><div><BrandMark /><p className="mt-6 max-w-sm text-sm leading-7 text-white/55">Good food, bold grills and a great mood — made fresh for Bengaluru.</p><p className="mt-6 font-display text-xl italic text-gold">{settings.secondary_tagline}</p></div><div><p className="eyebrow">Explore</p><div className="mt-5 space-y-3">{navItems.slice(1).map((item) => <Link key={item.href} href={item.href} className="block text-sm text-white/65 transition hover:text-gold">{item.label}</Link>)}<Link href="/cart" className="block text-sm text-white/65 transition hover:text-gold">Your cart</Link></div></div><div><p className="eyebrow">Find us</p><div className="mt-5 space-y-4 text-sm text-white/65"><a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="flex gap-3 transition hover:text-gold"><Phone size={16} className="mt-0.5 shrink-0 text-gold" />{settings.phone}</a><a href={`mailto:${settings.email}`} className="flex gap-3 break-all transition hover:text-gold"><Mail size={16} className="mt-0.5 shrink-0 text-gold" />{settings.email}</a><p className="flex gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-gold" />{settings.address}</p><p className="flex gap-3"><Clock3 size={16} className="mt-0.5 shrink-0 text-gold" />{settings.opening_hours}</p></div></div></div><div className="mx-auto mt-10 flex max-w-7xl flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row lg:mt-12"><span>© {new Date().getFullYear()} The Bangalore Grills and More.</span><span>Orders are confirmed directly on WhatsApp.</span></div><div className="h-4 lg:hidden" aria-hidden="true" /></footer>;
}

export function WhatsAppFloat() {
  return <a href={`https://wa.me/${fallbackSettings.whatsapp}`} target="_blank" rel="noreferrer" aria-label="Contact THE BGM on WhatsApp" className="fixed bottom-4 right-4 z-40 flex touch-target items-center justify-center rounded-full bg-[#1fa855] p-3.5 text-white shadow-2xl shadow-black/40 transition hover:-translate-y-1 hover:bg-[#188d47]" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}><MessageCircle size={20} /> <span className="sr-only">WhatsApp us</span></a>;
}

export function PageFrame({ children }: { children: React.ReactNode }) {
  return <><SiteHeader /><main>{children}</main><SiteFooter /><WhatsAppFloat /></>;
}
