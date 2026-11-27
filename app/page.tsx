'use client';

import Link from 'next/link';
import { ArrowUpRight, Flame, MapPin, Sparkles, UtensilsCrossed } from 'lucide-react';
import { PageFrame } from '@/components/restaurant/site-shell';
import { SectionHeading } from '@/components/restaurant/section-heading';
import { CategoryTile, MenuCard } from '@/components/restaurant/menu-card';
import { useRestaurantData } from '@/components/restaurant/data-hooks';
import { categories, items } from '@/lib/menu';
import { fallbackSettings } from '@/lib/types';

const highlights = [
  { icon: Flame, title: 'Grill-first flavour', copy: 'Bold, smoky favourites made for serious cravings.' },
  { icon: UtensilsCrossed, title: 'Biryani & more', copy: 'Comforting plates with the warmth of Bengaluru.' },
  { icon: Sparkles, title: 'Freshly prepared', copy: 'A family restaurant mood in every order.' },
];

const guestReviews = [
  {
    id: 'guest-nati-biryani',
    rating: 5,
    review_text: 'The Nati-style chicken biryani is what caught my eye at BGM. I love having that option alongside Hyderabadi biryani. The mutton version is next on my list!',
    customer_name: null,
  },
  {
    id: 'guest-tandoori-milkshake',
    rating: 5,
    review_text: 'Tandoori chicken and a chilled chocolate milkshake in the same order? That’s my kind of dinner! BGM has a fun mix of spicy dishes and sweet treats.',
    customer_name: null,
  },
  {
    id: 'guest-group-order',
    rating: 5,
    review_text: 'BGM is an easy pick when we’re ordering as a group. The biryani lovers can choose between chicken and mutton, and anyone in the mood for grills has options too.',
    customer_name: null,
  },
];

export default function Home() {
  const { settings, promotions, gallery, testimonials } = useRestaurantData();
  const featured = items.filter((item) => item.is_featured).slice(0, 6);
  const visibleFeatured = featured.length ? featured : items.slice(0, 6);
  const reviewPreview = [...guestReviews, ...testimonials.filter((review) => review.is_published).slice(0, 3)];
  const galleryPreview = gallery.slice(0, 4);
  const whatsapp = `https://wa.me/${settings.whatsapp || fallbackSettings.whatsapp}`;

  return <PageFrame>
    {/* Hero: full-bleed food photo on the right, gradient-protected copy on the left. No 100vh on mobile. */}
    <section className="relative isolate overflow-hidden border-b border-gold/15 bg-ink lg:bg-ink">
      {/* Background photo layer */}
      <div className="absolute inset-0 hero-bg" role="img" aria-label="Charcoal-grilled tandoori chicken from THE BGM kitchen" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,9,.96)_0%,rgba(9,9,9,.9)_38%,rgba(9,9,9,.55)_62%,rgba(9,9,9,.2)_100%),linear-gradient(0deg,rgba(9,9,9,.9),rgba(9,9,9,.1)_55%,transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_25%,rgba(181,18,27,.18),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-10 pt-8 sm:pt-12 lg:grid lg:min-h-[calc(100vh-72px)] lg:grid-cols-[1fr_.9fr] lg:items-center lg:gap-12 lg:px-8 lg:py-20">
        <div className="max-w-xl lg:max-w-2xl">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-gold">
            <span className="h-px w-8 bg-gold" /> Bengaluru&rsquo;s grill house
          </div>
          <h1 className="mt-4 whitespace-nowrap font-display font-bold text-display-hero text-warm sm:mt-6 sm:text-7xl lg:text-[clamp(4rem,6.5vw,6.1rem)] lg:leading-[.95]">
            Good food.<br /><span className="text-gold">Great mood.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:mt-7 sm:text-base sm:leading-7">
            Welcome to The Bangalore Grills and More &mdash; your destination for grilled specialities, flavourful biryanis, smoky tandoori delights and more.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <Link href="/menu" className="inline-flex touch-target items-center justify-center gap-3 rounded-full bg-gold px-6 py-3.5 text-sm font-extrabold uppercase tracking-wider text-ink transition hover:bg-brightGold">Explore menu <ArrowUpRight size={17} /></Link>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex touch-target items-center justify-center gap-3 rounded-full border border-white/25 px-6 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white transition hover:border-gold hover:text-gold">Order on WhatsApp</a>
          </div>
          <div className="mt-7 grid max-w-lg grid-cols-2 gap-4 border-t border-white/10 pt-5 text-sm text-white/55">
            <span><strong className="block text-white">Open every day</strong>11:00 AM &ndash; 10:30 PM</span>
            <span><strong className="block text-white">Find us in</strong>Hosakerehalli, Bengaluru</span>
          </div>
        </div>
      </div>
    </section>

    <section className="border-b border-white/10 bg-charcoal/45"><div className="mx-auto grid max-w-7xl gap-px bg-white/10 sm:grid-cols-3">{highlights.map(({ icon: Icon, title, copy }) => <div key={title} className="bg-charcoal px-5 py-7 sm:px-8 sm:py-8"><Icon size={22} className="text-gold" /><h2 className="mt-3 font-display text-xl font-bold text-white sm:mt-4">{title}</h2><p className="mt-2 text-sm leading-6 text-white/50">{copy}</p></div>)}</div></section>

    <section className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8 lg:py-24"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end sm:gap-8"><SectionHeading eyebrow="From the grill" title="BGM favourites" copy="Start with the dishes our kitchen is proud to put on your table." /><Link href="/menu" className="inline-flex items-center gap-2 pb-1 text-sm font-bold uppercase tracking-wider text-gold transition hover:text-brightGold">View full menu <ArrowUpRight size={16} /></Link></div>{visibleFeatured.length ? <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleFeatured.map((item) => <MenuCard key={item.id} item={item} category={item.category} />)}</div> : <div className="mt-10 rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center text-white/45">The menu is being prepared. Please check back shortly.</div>}</section>

    <section className="border-y border-white/10 bg-charcoal/35"><div className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8 lg:py-24"><SectionHeading eyebrow="Find your flavour" title="Explore the menu" copy="From smoky tandoori plates to cold coffee, choose your kind of craving." /><div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">{categories.map((category) => <CategoryTile key={category.id} category={category} itemCount={items.filter((item) => item.category_id === category.id).length} />)}</div></div></section>

    {promotions.length > 0 && <section className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8 lg:py-24"><SectionHeading eyebrow="Only at THE BGM" title="Good things are cooking" /><div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2">{promotions.slice(0, 2).map((promotion) => <article key={promotion.id} className="relative overflow-hidden rounded-2xl border border-gold/30 bg-deepRed p-6 sm:p-8"><div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border border-gold/25" /><p className="eyebrow">Limited time</p><h3 className="mt-3 max-w-sm font-display text-2xl font-bold text-warm sm:mt-4 sm:text-3xl">{promotion.title}</h3><p className="mt-2 max-w-md leading-7 text-white/65 sm:mt-3">{promotion.description}</p></article>)}</div></section>}

    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[.8fr_1.2fr] lg:gap-12 lg:px-8 lg:py-24"><div><SectionHeading eyebrow="Our story" title="A little more than a meal." copy={settings.description} /><Link href="/about" className="mt-7 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold hover:text-brightGold lg:mt-8">About THE BGM <ArrowUpRight size={16} /></Link></div><div className="grid grid-cols-2 gap-4 sm:gap-6"><div className="col-span-2 overflow-hidden rounded-2xl border border-white/10 bg-charcoal"><img src="/images/menu/image.png" alt="THE BGM menu poster" className="max-h-[420px] w-full object-cover object-top" loading="lazy" /></div><div className="rounded-2xl border border-gold/25 bg-deepRed p-5 sm:p-6"><MapPin size={22} className="text-gold" /><p className="mt-8 text-sm leading-6 text-white/70">No. 16 &amp; 17, 100 Feet Ring Road, Hosakerehalli</p></div><div className="rounded-2xl border border-white/10 bg-charcoal p-5 sm:p-6"><p className="font-display text-3xl text-gold sm:text-4xl">11:00</p><p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/50">Open daily till 10:30 PM</p></div></div></section>

    <section className="border-y border-white/10 bg-charcoal/40"><div className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8 lg:py-24"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end sm:gap-8"><SectionHeading eyebrow="A taste of THE BGM" title="Straight from our table" /><Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold">See all images <ArrowUpRight size={16} /></Link></div>{galleryPreview.length ? <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4">{galleryPreview.map((image) => <Link href="/gallery" key={image.id} className="group aspect-square overflow-hidden rounded-2xl border border-white/10"><img src={image.image_url} alt={image.caption || 'THE BGM food and restaurant gallery'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /></Link>)}</div> : <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4"><div className="col-span-2 row-span-2 overflow-hidden rounded-2xl border border-white/10"><img src="/images/food/image.png" alt="THE BGM signature food" className="h-full w-full object-cover" /></div><div className="overflow-hidden rounded-2xl border border-white/10"><img src="/images/menu/image.png" alt="THE BGM menu" className="h-full w-full object-cover" /></div><div className="flex items-center justify-center rounded-2xl border border-gold/25 bg-deepRed p-6 text-center"><p className="font-display text-2xl italic text-gold">Good food.<br />Great mood.</p></div></div>}</div></section>

    <section className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8 lg:py-24">
      <SectionHeading eyebrow="Your experience matters" title="What our guests say" copy="Kind words from guests who have shared their experience." />
      <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-3">
        {reviewPreview.map((review) => (
          <article key={review.id} className="rounded-2xl border border-white/10 bg-charcoal p-5 sm:p-6">
            <div role="img" aria-label={`${review.rating} out of 5 stars`} className="flex gap-1 text-gold">
              {Array.from({ length: review.rating }, (_, index) => <span key={index} aria-hidden="true">★</span>)}
            </div>
            <p className="mt-4 leading-7 text-white/70 sm:mt-5">&ldquo;{review.review_text}&rdquo;</p>
            {review.customer_name && <p className="mt-5 text-sm font-bold text-white sm:mt-6">{review.customer_name}</p>}
          </article>
        ))}
      </div>
    </section>

    <section className="relative overflow-hidden bg-red px-5 py-14 text-center sm:py-20"><div className="absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,transparent_0,transparent_48%,rgba(255,209,90,.5)_49%,transparent_50%)] [background-size:28px_28px]" /><div className="relative mx-auto max-w-3xl"><p className="eyebrow text-white/80">The table is waiting</p><h2 className="mt-3 font-display text-3xl font-bold text-white sm:mt-4 sm:text-6xl">Craving something delicious?</h2><p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/80 sm:mt-5">Visit THE BGM or order your favourites on WhatsApp.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row"><Link href="/menu" className="rounded-full bg-gold px-7 py-3.5 text-sm font-extrabold uppercase tracking-wider text-ink transition hover:bg-brightGold">Order now</Link><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.map_query)}`} target="_blank" rel="noreferrer" className="rounded-full border border-white/40 px-7 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-white hover:text-red">Get directions</a></div></div></section>
  </PageFrame>;
}
