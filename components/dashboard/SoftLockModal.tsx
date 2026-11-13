'use client';

/**
 * Flow B · B-03 · Dashboard + connect modal.
 * Canvas requirements: dashboard visible behind a dialog; dialog with a one-line value and the exchange logos;
 * primary "Connect now", secondary "Later". Events: softlock_modal_viewed, softlock_modal_dismissed.
 * Dialog in the Figma modal style (964:5925), the same one A-07/A-08 use.
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PrimaryButton, styles as s } from '@/components/signup/parts';
import { EXCHANGES } from '@/lib/exchanges';
import { track } from '@/lib/track';

const SEEN_KEY = 'tx_softlock_seen';

export default function SoftLockModal() {
  const router = useRouter();
  const params = useSearchParams();
  // Shown once per session (first entry after signup). After “Later” the person sees B-06; ?modal=0 opens B-06 directly.
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const viewed = useRef(false);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    let seen = params.get('modal') === '0';
    try { seen = seen || !!sessionStorage.getItem(SEEN_KEY); } catch { /* show it */ }
    if (seen) return;
    setOpen(true);
    track('softlock_modal_viewed', { source: 'first_session' });
  }, [params]);

  useEffect(() => {
    if (!open) return;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') later(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const connect = () => {
    track('exchange_connect_started', { source: 'softlock_modal' });
    router.push('/b/connect');
  };
  const later = () => {
    track('softlock_modal_dismissed', { source: 'first_session' });
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* shows again on reload */ }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className={s.overlay}>
      <div ref={ref} tabIndex={-1} className={`${s.modal} ${s.noOutline}`} role="dialog" aria-modal="true" aria-labelledby="softlock-title">
        <div className={s.modalNoise} />
        <div className={s.modalTop}>You’re in TradeX</div>
        <div className={s.modalBody}>
          <div className={s.modalLogos} aria-hidden>
            {EXCHANGES.map((ex) => (
              <span key={ex.id} className={s.logoRing}><Image src={ex.logo.src} alt="" width={ex.logo.width} height={ex.logo.height} /></span>
            ))}
          </div>
          <h2 id="softlock-title" className={s.modalTitle}>Connect an exchange to earn cashback</h2>
          <p className={`${s.text} ${s.center}`}>Open Bitunix or Pionex through TradeX and part of your trading fees comes back to you every month.</p>
        </div>
        <div className={`${s.modalFooter} ${s.modalFooterStack}`}>
          <PrimaryButton onClick={connect}>Connect now</PrimaryButton>
          <button type="button" className={s.modalLater} onClick={later}>Later</button>
        </div>
      </div>
    </div>
  );
}
