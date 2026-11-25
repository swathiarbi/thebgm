'use client';

import Link from 'next/link';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageFrame } from '@/components/restaurant/site-shell';
import { useCart } from '@/components/restaurant/cart-context';
import { formatINR } from '@/lib/types';

const SAVED_ADDRESS_KEY = 'the-bgm-saved-address';
type OrderType = 'takeaway' | 'delivery';

type SavedAddress = { address: string; landmark: string; instructions: string };

export default function CartPage() {
  const { lines, subtotal, updateQuantity, removeItem } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('takeaway');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [instructions, setInstructions] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [saved, setSaved] = useState<SavedAddress | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = window.localStorage.getItem(SAVED_ADDRESS_KEY);
    if (stored) {
      try {
        const value = JSON.parse(stored) as SavedAddress;
        setSaved(value);
        setAddress(value.address);
        setLandmark(value.landmark);
        setInstructions(value.instructions);
      } catch {
        window.localStorage.removeItem(SAVED_ADDRESS_KEY);
      }
    }
  }, []);

  const confirmOrder = () => {
    if (!customerName.trim()) { setMessage('Please add your name before continuing.'); return; }
    if (orderType === 'delivery' && !address.trim()) { setMessage('Please add a delivery address for home delivery.'); return; }
    if (saveAddress && orderType === 'delivery') {
      window.localStorage.setItem(SAVED_ADDRESS_KEY, JSON.stringify({ address, landmark, instructions }));
      setSaved({ address, landmark, instructions });
    }
    const orderLines = lines.map((line, index) => `${index + 1}. ${line.item.name}\n   Quantity: ${line.quantity}\n   Price: ${formatINR(line.item.price)} each\n   Total: ${formatINR(line.item.price * line.quantity)}`).join('\n\n');
    const deliveryText = orderType === 'delivery' ? `\n\nDelivery Address: ${address}${landmark ? `\nLandmark: ${landmark}` : ''}` : '';
    const deliveryNote = orderType === 'delivery' ? '\n\nDelivery Charge: To be confirmed by restaurant.' : '';
    const text = `Hello THE BGM!\n\nI would like to place an order.\n\nCustomer Name: ${customerName}\nOrder Type: ${orderType === 'delivery' ? 'Home Delivery' : 'Takeaway / Pickup'}${deliveryText}\n\nOrder Details:\n\n${orderLines}\n\nFood Subtotal: ${formatINR(subtotal)}${deliveryNote}\n\nAdditional Instructions: ${instructions || 'None'}\n\nPlease confirm availability and the final amount.\n\nThank you!`;
    window.open(`https://wa.me/917026358555?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    setMessage('WhatsApp is open with your order. Press Send there, then wait for restaurant confirmation.');
  };

  return <PageFrame><section className="border-b border-gold/15 bg-charcoal/45 px-5 py-12 sm:py-16 lg:px-8"><div className="mx-auto max-w-7xl"><Link href="/menu" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold"><ArrowLeft size={15} /> Back to menu</Link><h1 className="mt-5 font-display text-display-page font-bold text-warm sm:mt-7 sm:text-7xl">Your cart<span className="text-gold">.</span></h1></div></section><section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:py-16 lg:grid-cols-[1fr_.75fr] lg:gap-12 lg:px-8">{lines.length ? <><div><div className="space-y-4">{lines.map((line) => <article key={line.item.id} className="flex gap-4 rounded-2xl border border-white/10 bg-charcoal p-4"><img src={line.item.image_url || '/images/food/image.png'} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><div className="min-w-0"><h2 className="truncate font-display text-lg font-bold text-white sm:text-xl">{line.item.name}</h2><p className="mt-1 text-sm text-white/45">{formatINR(line.item.price)} each</p></div><button type="button" onClick={() => removeItem(line.item.id)} aria-label={`Remove ${line.item.name}`} className="h-fit text-white/35 transition hover:text-red-300"><Trash2 size={17} /></button></div><div className="mt-4 flex items-center justify-between"><div className="flex items-center gap-3 rounded-full border border-white/15 px-2 py-1"><button type="button" onClick={() => updateQuantity(line.item.id, line.quantity - 1)} className="touch-target flex items-center justify-center rounded-full text-white/70 hover:text-gold" aria-label="Decrease quantity"><Minus size={14} /></button><span className="w-5 text-center text-sm">{line.quantity}</span><button type="button" onClick={() => updateQuantity(line.item.id, line.quantity + 1)} className="touch-target flex items-center justify-center rounded-full text-white/70 hover:text-gold" aria-label="Increase quantity"><Plus size={14} /></button></div><span className="font-bold text-gold">{formatINR(line.item.price * line.quantity)}</span></div></div></article>)}</div></div><div className="rounded-2xl border border-gold/25 bg-charcoal p-5 sm:p-6 lg:p-8"><p className="eyebrow">WhatsApp checkout</p><h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">Almost there.</h2><p className="mt-3 text-sm leading-6 text-white/50">We do not take online payments. Your order is confirmed by the restaurant on WhatsApp.</p><div className="mt-6 space-y-4 lg:mt-8"><label className="block text-sm text-white/70">Your name<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Enter your name" className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-gold" /></label><fieldset><legend className="text-sm text-white/70">Order type</legend><div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={() => setOrderType('takeaway')} className={`touch-target rounded-xl border px-3 py-3 text-sm ${orderType === 'takeaway' ? 'border-gold bg-gold/10 text-gold' : 'border-white/15 text-white/55'}`}>Takeaway</button><button type="button" onClick={() => setOrderType('delivery')} className={`touch-target rounded-xl border px-3 py-3 text-sm ${orderType === 'delivery' ? 'border-gold bg-gold/10 text-gold' : 'border-white/15 text-white/55'}`}>Home delivery</button></div></fieldset>{orderType === 'delivery' && <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4"><label className="block text-sm text-white/70">Full address<input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="House, street, area, city" className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-gold" /></label><label className="block text-sm text-white/70">Landmark <span className="text-white/35">(optional)</span><input value={landmark} onChange={(event) => setLandmark(event.target.value)} placeholder="Nearby landmark" className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-gold" /></label><label className="flex gap-3 text-sm text-white/65"><input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} className="mt-1 accent-[#F5BB36]" />Save my delivery address for future orders on this device.</label>{saved && <button type="button" onClick={() => { window.localStorage.removeItem(SAVED_ADDRESS_KEY); setSaved(null); setAddress(''); setLandmark(''); setInstructions(''); }} className="text-xs text-red-300 underline">Remove saved address</button>}<p className="text-xs leading-5 text-white/35">Saved addresses stay on this device and browser only.</p></div>}<label className="block text-sm text-white/70">Additional instructions <span className="text-white/35">(optional)</span><textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} rows={3} placeholder="Anything the restaurant should know?" className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-gold" /></label></div><div className="mt-6 border-t border-white/10 pt-5 lg:mt-8"><div className="flex justify-between text-sm text-white/55"><span>Food subtotal</span><span className="font-bold text-white">{formatINR(subtotal)}</span></div>{orderType === 'delivery' && <p className="mt-3 text-xs leading-5 text-gold/80">Delivery availability and charges will be confirmed by the restaurant on WhatsApp.</p>}<button type="button" onClick={confirmOrder} className="mt-5 w-full rounded-xl bg-gold px-4 py-3.5 text-sm font-extrabold uppercase tracking-wider text-ink transition hover:bg-brightGold">Confirm order on WhatsApp</button>{message && <p className="mt-4 text-sm leading-6 text-gold">{message}</p>}</div></div></> : <div className="rounded-2xl border border-dashed border-white/15 px-6 py-20 text-center lg:col-span-2 lg:py-24"><p className="font-display text-2xl text-white sm:text-3xl">Your cart is waiting for something good.</p><p className="mt-3 text-sm text-white/45">Browse the menu and add your favourites here.</p><Link href="/menu" className="mt-7 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-bold uppercase tracking-wider text-ink">Browse menu</Link></div>}</section></PageFrame>;
}
