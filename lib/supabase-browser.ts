'use client';

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';
let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function getBrowserSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Restaurant data is not connected yet.');
  browserClient ??= createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
