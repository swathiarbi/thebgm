'use client';

import { FormEvent, useEffect, useState } from 'react';
import { BadgePercent, HelpCircle, Images, LayoutDashboard, LogOut, Save, Settings, Star, Tags, Trash2, UtensilsCrossed } from 'lucide-react';
import { getBrowserSupabase } from '@/lib/supabase-browser';
import type { FAQ, GalleryImage, MenuCategory, MenuItem, Promotion, RestaurantSettings, Testimonial } from '@/lib/types';
import { allCategories as categories, allItems as items } from '@/lib/menu';
import { menuEditor } from '@/lib/menu-editor';

type Tab = 'overview' | 'menu' | 'categories' | 'offers' | 'gallery' | 'reviews' | 'faqs' | 'settings';
type Notice = { tone: 'success' | 'error'; text: string } | null;

type OfferForm = { title: string; description: string; banner_url: string };
type GalleryForm = { image_url: string; caption: string };
type ReviewForm = { customer_name: string; review_text: string; rating: string; review_date: string };
type FAQForm = { question: string; answer: string };

const emptyOffer: OfferForm = { title: '', description: '', banner_url: '' };
const emptyGallery: GalleryForm = { image_url: '', caption: '' };
const emptyReview: ReviewForm = { customer_name: '', review_text: '', rating: '5', review_date: '' };
const emptyFAQ: FAQForm = { question: '', answer: '' };

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'menu', label: 'Menu items', icon: UtensilsCrossed },
  { id: 'categories', label: 'Categories', icon: Tags },
  { id: 'offers', label: 'Offers', icon: BadgePercent },
  { id: 'gallery', label: 'Gallery', icon: Images },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  { id: 'settings', label: 'Restaurant settings', icon: Settings },
];

export default function AdminDashboard({ email }: { email: string }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [notice, setNotice] = useState<Notice>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [offers, setOffers] = useState<Promotion[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [offerForm, setOfferForm] = useState<OfferForm>(emptyOffer);
  const [galleryForm, setGalleryForm] = useState<GalleryForm>(emptyGallery);
  const [reviewForm, setReviewForm] = useState<ReviewForm>(emptyReview);
  const [faqForm, setFaqForm] = useState<FAQForm>(emptyFAQ);

  const loadData = async () => {
    setLoading(true);
    try {
      const supabase = getBrowserSupabase();
      const [offersResult, galleryResult, reviewsResult, faqsResult, settingsResult] = await Promise.all([
        supabase.from('promotions').select('*').order('display_order'),
        supabase.from('gallery_images').select('*').order('display_order'),
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
        supabase.from('faqs').select('*').order('display_order'),
        supabase.from('restaurant_settings').select('*').eq('id', 'default').maybeSingle(),
      ]);
      const failed = [offersResult, galleryResult, reviewsResult, faqsResult, settingsResult].find((result) => result.error);
      if (failed?.error) throw failed.error;
      setOffers((offersResult.data ?? []) as Promotion[]);
      setGallery((galleryResult.data ?? []) as GalleryImage[]);
      setReviews((reviewsResult.data ?? []) as Testimonial[]);
      setFaqs((faqsResult.data ?? []) as FAQ[]);
      setSettings((settingsResult.data as RestaurantSettings | null) ?? null);
    } catch (error) {
      console.error('admin data load failed', error);
      setNotice({ tone: 'error', text: 'Could not load the dashboard data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const runMutation = async (action: () => Promise<{ error: unknown }>, success: string) => {
    setSaving(true);
    setNotice(null);
    try {
      const result = await action();
      if (result.error) throw result.error;
      setNotice({ tone: 'success', text: success });
      await loadData();
    } catch (error) {
      console.error('admin mutation failed', error);
      setNotice({ tone: 'error', text: 'Could not save that change. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const saveOffer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!offerForm.title.trim()) return setNotice({ tone: 'error', text: 'Add an offer title first.' });
    const supabase = getBrowserSupabase();
    await runMutation(() => supabase.from('promotions').insert({ title: offerForm.title.trim(), description: offerForm.description.trim(), banner_url: offerForm.banner_url.trim() || null, display_order: offers.length + 1, is_active: false }), 'Offer saved as inactive.');
    setOfferForm(emptyOffer);
  };

  const saveGallery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!galleryForm.image_url.trim()) return setNotice({ tone: 'error', text: 'Add an image URL or upload an image first.' });
    const supabase = getBrowserSupabase();
    await runMutation(() => supabase.from('gallery_images').insert({ image_url: galleryForm.image_url.trim(), caption: galleryForm.caption.trim(), display_order: gallery.length + 1, is_published: true }), 'Gallery image added.');
    setGalleryForm(emptyGallery);
  };

  const saveReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reviewForm.customer_name.trim() || !reviewForm.review_text.trim()) return setNotice({ tone: 'error', text: 'Add the customer name and review text first.' });
    const supabase = getBrowserSupabase();
    await runMutation(() => supabase.from('testimonials').insert({ customer_name: reviewForm.customer_name.trim(), review_text: reviewForm.review_text.trim(), rating: Number(reviewForm.rating), review_date: reviewForm.review_date || null, is_published: false }), 'Review saved as unpublished.');
    setReviewForm(emptyReview);
  };

  const saveFAQ = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return setNotice({ tone: 'error', text: 'Add both the question and answer first.' });
    const supabase = getBrowserSupabase();
    await runMutation(() => supabase.from('faqs').insert({ question: faqForm.question.trim(), answer: faqForm.answer.trim(), display_order: faqs.length + 1, is_active: true }), 'FAQ added.');
    setFaqForm(emptyFAQ);
  };

  const updateSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settings) return;
    const supabase = getBrowserSupabase();
    await runMutation(() => supabase.from('restaurant_settings').update({ restaurant_name: settings.restaurant_name, tagline: settings.tagline, secondary_tagline: settings.secondary_tagline, phone: settings.phone, whatsapp: settings.whatsapp, email: settings.email, address: settings.address, opening_hours: settings.opening_hours, description: settings.description, map_query: settings.map_query, updated_at: new Date().toISOString() }).eq('id', 'default'), 'Restaurant settings updated.');
  };

  const toggle = async (table: string, id: string, field: string, value: boolean, success: string) => {
    const supabase = getBrowserSupabase();
    await runMutation(() => supabase.from(table).update({ [field]: value }).eq('id', id), success);
  };

  const remove = async (table: string, id: string, success: string) => {
    if (!window.confirm('Delete this item?')) return;
    const supabase = getBrowserSupabase();
    await runMutation(() => supabase.from(table).delete().eq('id', id), success);
  };

  const uploadImage = async (file: File | undefined) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setNotice({ tone: 'error', text: 'Use a JPG, PNG, or WebP image under 5 MB.' });
      return;
    }
    setSaving(true);
    try {
      const supabase = getBrowserSupabase();
      const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `gallery/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from('restaurant-assets').upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('restaurant-assets').getPublicUrl(path);
      setGalleryForm((current) => ({ ...current, image_url: data.publicUrl }));
      setNotice({ tone: 'success', text: 'Image uploaded. Save the gallery entry to publish it.' });
    } catch (error) {
      console.error('image upload failed', error);
      setNotice({ tone: 'error', text: 'Could not upload that image.' });
    } finally {
      setSaving(false);
    }
  };


  return <main className="min-h-screen bg-ink text-warm"><div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row"><aside className="border-b border-white/10 bg-charcoal lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r"><div className="flex items-center justify-between px-5 py-5 lg:block lg:px-7 lg:py-8"><a href="/" className="flex items-center gap-3"><img src="/images/logo/Untitled_Design_(2).png" alt="THE BGM logo" className="h-11 w-11 object-contain" /><span><span className="block font-display text-xl font-bold text-gold">THE BGM</span><span className="block text-[9px] uppercase tracking-[.18em] text-white/40">Owner dashboard</span></span></a><span className="text-xs text-white/35 lg:hidden">{email}</span></div><nav className="flex gap-1 overflow-x-auto px-4 pb-4 lg:block lg:px-4 lg:pb-0">{tabs.map(({ id, label, icon: Icon }) => id === 'menu' || id === 'categories' ? <a key={id} href={id === 'menu' ? `${menuEditor}/file/menu` : `${menuEditor}/collection/categories`} className="flex min-w-max items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/55 hover:text-white"><Icon size={17} />{label} ↗</a> : <button key={id} type="button" onClick={() => setTab(id)} className={`flex min-w-max items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition lg:mb-1 lg:w-full ${tab === id ? 'bg-gold text-ink' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}><Icon size={17} />{label}</button>)}</nav><div className="hidden border-t border-white/10 px-7 py-6 lg:block"><p className="truncate text-xs text-white/40">{email}</p><button type="button" onClick={async () => { await getBrowserSupabase().auth.signOut(); window.location.href = '/admin/login'; }} className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/55 hover:text-red-300"><LogOut size={15} /> Sign out</button></div></aside><section className="flex-1 px-5 py-7 sm:px-8 lg:px-12 lg:py-10"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">The BGM control room</p><h1 className="mt-3 font-display text-4xl font-bold text-warm sm:text-5xl">{tabs.find((entry) => entry.id === tab)?.label}<span className="text-gold">.</span></h1></div><button type="button" onClick={async () => { await getBrowserSupabase().auth.signOut(); window.location.href = '/admin/login'; }} className="rounded-full border border-white/15 p-3 text-white/60 transition hover:border-red-300 hover:text-red-300 lg:hidden"><LogOut size={17} /></button></div>{notice && <div className={`mt-7 rounded-xl border px-4 py-3 text-sm ${notice.tone === 'success' ? 'border-green-400/30 bg-green-400/10 text-green-200' : 'border-red-300/30 bg-red/10 text-red-200'}`}>{notice.text}</div>}{loading ? <div className="mt-10 h-96 animate-pulse rounded-2xl bg-charcoal" /> : <div className="mt-10">{tab === 'overview' && <Overview items={items} categories={categories} offers={offers} gallery={gallery} reviews={reviews} />}{tab === 'offers' && <OfferManager offers={offers} form={offerForm} setForm={setOfferForm} onSave={saveOffer} onToggle={(offer) => toggle('promotions', offer.id, 'is_active', !offer.is_active, 'Offer visibility updated.')} onDelete={(offer) => remove('promotions', offer.id, 'Offer deleted.')} />}{tab === 'gallery' && <GalleryManager gallery={gallery} form={galleryForm} setForm={setGalleryForm} onSave={saveGallery} onUpload={uploadImage} onToggle={(image) => toggle('gallery_images', image.id, 'is_published', !image.is_published, 'Gallery visibility updated.')} onDelete={(image) => remove('gallery_images', image.id, 'Gallery image deleted.')} saving={saving} />}{tab === 'reviews' && <ReviewManager reviews={reviews} form={reviewForm} setForm={setReviewForm} onSave={saveReview} onToggle={(review) => toggle('testimonials', review.id, 'is_published', !review.is_published, 'Review visibility updated.')} onDelete={(review) => remove('testimonials', review.id, 'Review deleted.')} />}{tab === 'faqs' && <FAQManager faqs={faqs} form={faqForm} setForm={setFaqForm} onSave={saveFAQ} onToggle={(faq) => toggle('faqs', faq.id, 'is_active', !faq.is_active, 'FAQ visibility updated.')} onDelete={(faq) => remove('faqs', faq.id, 'FAQ deleted.')} />}{tab === 'settings' && settings && <SettingsManager settings={settings} setSettings={setSettings} onSave={updateSettings} saving={saving} />}</div>}</section></div></main>;
}

function Overview({ items, categories, offers, gallery, reviews }: { items: MenuItem[]; categories: MenuCategory[]; offers: Promotion[]; gallery: GalleryImage[]; reviews: Testimonial[] }) {
  const cards = [{ label: 'Menu items', value: items.length, detail: `${items.filter((item) => item.is_available).length} available` }, { label: 'Categories', value: categories.length, detail: `${categories.filter((category) => category.is_active).length} visible` }, { label: 'Offers', value: offers.length, detail: `${offers.filter((offer) => offer.is_active).length} active` }, { label: 'Reviews', value: reviews.length, detail: `${reviews.filter((review) => review.is_published).length} published` }];
  return <div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <div key={card.label} className="rounded-2xl border border-white/10 bg-charcoal p-6"><p className="text-sm text-white/45">{card.label}</p><p className="mt-4 font-display text-4xl font-bold text-gold">{card.value}</p><p className="mt-2 text-xs text-white/35">{card.detail}</p></div>)}</div><div className="mt-8 grid gap-5 lg:grid-cols-2"><div className="rounded-2xl border border-gold/25 bg-deepRed p-7"><p className="eyebrow">Keep it honest</p><h2 className="mt-3 font-display text-3xl font-bold">WhatsApp is the order desk.</h2><p className="mt-4 max-w-md text-sm leading-6 text-white/60">Orders are sent directly to the restaurant. This dashboard does not pretend to receive or process customer orders.</p></div><div className="rounded-2xl border border-white/10 bg-charcoal p-7"><p className="eyebrow">Content health</p><h2 className="mt-3 font-display text-3xl font-bold">Gallery ready.</h2><p className="mt-4 text-sm leading-6 text-white/55">{gallery.length} gallery images are currently stored. Add more kitchen moments whenever you are ready.</p></div></div></div>;
}

function Field({ label, value, onChange, type = 'text', multiline = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; multiline?: boolean }) {
  return <label className="block text-sm text-white/65">{label}{multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-gold" /> : <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-gold" />}</label>;
}

function ManagerCard({ title, children, onSubmit, action = 'Save' }: { title: string; children: React.ReactNode; onSubmit: (event: FormEvent<HTMLFormElement>) => void; action?: string }) {
  return <form onSubmit={onSubmit} className="rounded-2xl border border-gold/25 bg-charcoal p-6 sm:p-7"><div className="flex items-center justify-between"><h2 className="font-display text-2xl font-bold text-white">{title}</h2><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-ink"><Save size={15} /> {action}</button></div><div className="mt-6 grid gap-4">{children}</div></form>;
}

function OfferManager({ offers, form, setForm, onSave, onToggle, onDelete }: { offers: Promotion[]; form: OfferForm; setForm: React.Dispatch<React.SetStateAction<OfferForm>>; onSave: (event: FormEvent<HTMLFormElement>) => void; onToggle: (offer: Promotion) => void; onDelete: (offer: Promotion) => void }) {
  return <div className="grid gap-8 lg:grid-cols-[360px_1fr]"><ManagerCard title="Create an offer" onSubmit={onSave} action="Save offer"><Field label="Title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} /><Field label="Description" multiline value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} /><Field label="Banner URL (optional)" value={form.banner_url} onChange={(value) => setForm((current) => ({ ...current, banner_url: value }))} /></ManagerCard><div className="space-y-3">{offers.length ? offers.map((offer) => <div key={offer.id} className="rounded-2xl border border-white/10 bg-charcoal p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-display text-xl font-bold text-white">{offer.title}</h3><p className="mt-2 text-sm leading-6 text-white/50">{offer.description}</p></div><button type="button" onClick={() => onDelete(offer)} className="text-red-300/70"><Trash2 size={16} /></button></div><button type="button" onClick={() => onToggle(offer)} className={`mt-5 rounded-lg border px-3 py-2 text-xs ${offer.is_active ? 'border-green-300/40 text-green-200' : 'border-white/15 text-white/45'}`}>{offer.is_active ? 'Active on website' : 'Inactive — click to activate'}</button></div>) : <Empty text="No offers yet. Add one when the restaurant has something to announce." />}</div></div>;
}

function GalleryManager({ gallery, form, setForm, onSave, onUpload, onToggle, onDelete, saving }: { gallery: GalleryImage[]; form: GalleryForm; setForm: React.Dispatch<React.SetStateAction<GalleryForm>>; onSave: (event: FormEvent<HTMLFormElement>) => void; onUpload: (file: File | undefined) => void; onToggle: (image: GalleryImage) => void; onDelete: (image: GalleryImage) => void; saving: boolean }) {
  return <div className="grid gap-8 lg:grid-cols-[360px_1fr]"><ManagerCard title="Add a gallery image" onSubmit={onSave} action="Save image"><Field label="Image URL" value={form.image_url} onChange={(value) => setForm((current) => ({ ...current, image_url: value }))} /><label className="block text-sm text-white/65">Or upload an image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={saving} onChange={(event) => onUpload(event.target.files?.[0])} className="mt-2 block w-full text-xs text-white/50 file:mr-3 file:rounded-lg file:border-0 file:bg-gold file:px-3 file:py-2 file:font-bold file:text-ink" /></label><Field label="Caption" value={form.caption} onChange={(value) => setForm((current) => ({ ...current, caption: value }))} /></ManagerCard><div className="grid gap-4 sm:grid-cols-2">{gallery.map((image) => <div key={image.id} className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal"><img src={image.image_url} alt={image.caption || 'Gallery image'} className="aspect-[4/3] w-full object-cover" /><div className="p-4"><p className="text-sm text-white/70">{image.caption || 'No caption'}</p><div className="mt-4 flex justify-between gap-2"><button type="button" onClick={() => onToggle(image)} className="text-xs text-gold">{image.is_published ? 'Unpublish' : 'Publish'}</button><button type="button" onClick={() => onDelete(image)} className="text-red-300/70"><Trash2 size={15} /></button></div></div></div>)}</div></div>;
}

function ReviewManager({ reviews, form, setForm, onSave, onToggle, onDelete }: { reviews: Testimonial[]; form: ReviewForm; setForm: React.Dispatch<React.SetStateAction<ReviewForm>>; onSave: (event: FormEvent<HTMLFormElement>) => void; onToggle: (review: Testimonial) => void; onDelete: (review: Testimonial) => void }) {
  return <div className="grid gap-8 lg:grid-cols-[360px_1fr]"><ManagerCard title="Add a genuine review" onSubmit={onSave} action="Save review"><Field label="Customer name" value={form.customer_name} onChange={(value) => setForm((current) => ({ ...current, customer_name: value }))} /><Field label="Review text" multiline value={form.review_text} onChange={(value) => setForm((current) => ({ ...current, review_text: value }))} /><Field label="Rating (1–5)" type="number" value={form.rating} onChange={(value) => setForm((current) => ({ ...current, rating: value }))} /><Field label="Review date (optional)" type="date" value={form.review_date} onChange={(value) => setForm((current) => ({ ...current, review_date: value }))} /></ManagerCard><div className="space-y-3">{reviews.length ? reviews.map((review) => <div key={review.id} className="rounded-2xl border border-white/10 bg-charcoal p-5"><div className="flex items-start justify-between gap-4"><div><div className="text-gold">{'★'.repeat(review.rating)}</div><p className="mt-3 leading-6 text-white/65">{review.review_text}</p><p className="mt-3 text-sm font-bold text-white">{review.customer_name}</p></div><button type="button" onClick={() => onDelete(review)} className="text-red-300/70"><Trash2 size={16} /></button></div><button type="button" onClick={() => onToggle(review)} className={`mt-4 rounded-lg border px-3 py-2 text-xs ${review.is_published ? 'border-green-300/40 text-green-200' : 'border-white/15 text-white/45'}`}>{review.is_published ? 'Published' : 'Unpublished — click to publish'}</button></div>) : <Empty text="No reviews yet. Add only genuine customer feedback." />}</div></div>;
}

function FAQManager({ faqs, form, setForm, onSave, onToggle, onDelete }: { faqs: FAQ[]; form: FAQForm; setForm: React.Dispatch<React.SetStateAction<FAQForm>>; onSave: (event: FormEvent<HTMLFormElement>) => void; onToggle: (faq: FAQ) => void; onDelete: (faq: FAQ) => void }) {
  return <div className="grid gap-8 lg:grid-cols-[360px_1fr]"><ManagerCard title="Add an FAQ" onSubmit={onSave} action="Save FAQ"><Field label="Question" value={form.question} onChange={(value) => setForm((current) => ({ ...current, question: value }))} /><Field label="Answer" multiline value={form.answer} onChange={(value) => setForm((current) => ({ ...current, answer: value }))} /></ManagerCard><div className="space-y-3">{faqs.map((faq) => <div key={faq.id} className="rounded-2xl border border-white/10 bg-charcoal p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold text-white">{faq.question}</h3><p className="mt-2 text-sm leading-6 text-white/50">{faq.answer}</p></div><button type="button" onClick={() => onDelete(faq)} className="text-red-300/70"><Trash2 size={16} /></button></div><button type="button" onClick={() => onToggle(faq)} className="mt-4 text-xs text-gold">{faq.is_active ? 'Visible on website' : 'Hidden — click to show'}</button></div>)}</div></div>;
}

function SettingsManager({ settings, setSettings, onSave, saving }: { settings: RestaurantSettings; setSettings: React.Dispatch<React.SetStateAction<RestaurantSettings | null>>; onSave: (event: FormEvent<HTMLFormElement>) => void; saving: boolean }) {
  const update = (key: keyof RestaurantSettings, value: string) => setSettings((current) => current ? { ...current, [key]: value } : current);
  return <ManagerCard title="Restaurant settings" onSubmit={onSave} action={saving ? 'Saving…' : 'Save settings'}><div className="grid gap-4 sm:grid-cols-2"><Field label="Restaurant name" value={settings.restaurant_name} onChange={(value) => update('restaurant_name', value)} /><Field label="Phone" value={settings.phone} onChange={(value) => update('phone', value)} /><Field label="WhatsApp number" value={settings.whatsapp} onChange={(value) => update('whatsapp', value)} /><Field label="Email" value={settings.email} onChange={(value) => update('email', value)} /><Field label="Primary tagline" value={settings.tagline} onChange={(value) => update('tagline', value)} /><Field label="Secondary tagline" value={settings.secondary_tagline} onChange={(value) => update('secondary_tagline', value)} /><Field label="Opening hours" value={settings.opening_hours} onChange={(value) => update('opening_hours', value)} /><Field label="Map search text" value={settings.map_query} onChange={(value) => update('map_query', value)} /></div><Field label="Address" multiline value={settings.address} onChange={(value) => update('address', value)} /><Field label="Business description" multiline value={settings.description} onChange={(value) => update('description', value)} /></ManagerCard>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center text-sm text-white/45">{text}</div>;
}
