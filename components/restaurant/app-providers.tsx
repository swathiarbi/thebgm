'use client';

import { CartProvider } from './cart-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
