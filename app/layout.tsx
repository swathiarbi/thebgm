import './globals.css';
import type { Metadata } from 'next';
import { AppProviders } from '@/components/restaurant/app-providers';

export const metadata: Metadata = {
  title: 'THE BGM | The Bangalore Grills and More',
  description: 'Grilled favourites, biryanis, tandoori delights and more in Hosakerehalli, Bengaluru.',
  openGraph: {
    title: 'THE BGM | The Bangalore Grills and More',
    description: 'Good Food • Great Mood in Bengaluru.',
    images: ['/images/food/image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><AppProviders>{children}</AppProviders></body></html>;
}
