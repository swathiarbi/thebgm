import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function getBrowserSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Restaurant data is not connected yet.');
  }

  browserClient ??= createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

export function getServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Server components cannot always write refreshed auth cookies.
        }
      },
      remove(name: string, options: Record<string, unknown>) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Server components cannot always clear refreshed auth cookies.
        }
      },
    },
  });
}

export { supabaseUrl, supabaseAnonKey };
