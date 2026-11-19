'use client';

/**
 * Shared frame for the connect flow (A-09 to A-15, A-19), Nov 19, 2026.
 * It lives in app/connect/layout.tsx, so the background (mountains, noise, dot grid) and the exchange colour stay
 * mounted between steps: no flash and no image reload. Each step only swaps its content, with a short fade.
 */
import type { ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { styles as s } from './parts';

export default function ConnectFrame({ children }: { children: ReactNode }) {
  const ex = useSearchParams().get('exchange') === 'pionex' ? 'pionex' : 'bitunix';
  return (
    <main className={`${s.centerPage} ${s.exAccent} ${s.connectFrame} ${ex === 'pionex' ? s.exPionex : s.exBitunix}`}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />
      {children}
    </main>
  );
}
