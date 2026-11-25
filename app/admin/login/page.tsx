'use client';

import Link from 'next/link';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { getBrowserSupabase } from '@/lib/supabase-browser';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('bangaloregrillsandmore@gmail.com');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    setLoading(true);
    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = '/admin';
    } catch (error) {
      console.error('admin sign in failed', error);
      setNotice('We could not sign you in. Check your details or ask the owner to complete admin onboarding.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setNotice('');
    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setNotice('If that email is registered, a password reset link has been sent.');
    } catch (error) {
      console.error('password reset failed', error);
      setNotice('If that email is registered, a password reset link has been sent.');
    }
  };

  return <main className="flex min-h-screen items-center justify-center bg-ink px-5 py-12"><div className="w-full max-w-md"><Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold"><ArrowLeft size={15} /> Back to THE BGM</Link><div className="mt-8 rounded-3xl border border-gold/25 bg-charcoal p-7 shadow-2xl shadow-black/30 sm:p-9"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red text-white"><LockKeyhole size={24} /></div><p className="eyebrow mt-8">Owner access</p><h1 className="mt-3 font-display text-4xl font-bold text-warm">Admin login<span className="text-gold">.</span></h1><p className="mt-4 text-sm leading-6 text-white/50">Sign in with the approved restaurant owner account. There is no public admin signup.</p><form onSubmit={signIn} className="mt-8 space-y-4"><label className="block text-sm text-white/70">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-gold" /></label><label className="block text-sm text-white/70">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-gold" /></label><button type="submit" disabled={loading} className="w-full rounded-xl bg-gold px-4 py-4 text-sm font-extrabold uppercase tracking-wider text-ink transition hover:bg-brightGold disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in securely'}</button></form><button type="button" onClick={resetPassword} className="mt-5 w-full text-sm text-white/45 underline decoration-white/20 underline-offset-4 hover:text-gold">Forgot your password?</button>{notice && <p className="mt-5 rounded-xl border border-gold/25 bg-gold/10 px-4 py-3 text-sm leading-6 text-gold">{notice}</p>}</div></div></main>;
}
