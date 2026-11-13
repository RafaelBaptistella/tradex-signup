import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { Suspense } from 'react';
import Navigator from '@/components/prototype/Navigator';
import './globals.css';

const geist = Geist({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'TradeX · Sign up',
  description: 'TradeX signup, flow A: guided signup with the exchange connected before entering.'
};

export const viewport: Viewport = { themeColor: '#03060a', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        {children}
        <Suspense fallback={null}><Navigator /></Suspense>
      </body>
    </html>
  );
}
