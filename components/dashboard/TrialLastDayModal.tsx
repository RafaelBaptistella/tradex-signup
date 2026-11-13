'use client';

/**
 * Flow C · C-07 · In-app nudges · last-day modal (canvas D6 = trial day 7).
 * Shown on the first visit of the last trial day, once per session; ?modal=0 skips it.
 * Same Figma modal style (964:5925) as B-03. Events: trial_nudge_viewed {day: 6, kind: modal}, trial_nudge_dismissed.
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PrimaryButton, Lines, styles as s } from '@/components/signup/parts';
import { track } from '@/lib/track';

export const LASTDAY_SEEN_KEY = 'tx_lastday_seen';

const KEEPS = ['Courses Level 1 and 2 stay open', 'The community and Discord stay open', 'Cashback and ranks unlock'];

export default function TrialLastDayModal({ onConnect }: { onConnect: () => void }) {
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const viewed = useRef(false);

  useEffect(() => {
    // Prototype navigator: ?modal=0 hides it (“D6 · day 7 banner”), ?modal=1 always opens it (“D6 · last-day modal”).
    // Without the param it shows once per session, as in production.
    const m = params.get('modal');
    if (m === '0') { setOpen(false); return; }
    let seen = false;
    try { seen = !!sessionStorage.getItem(LASTDAY_SEEN_KEY); } catch { /* show it */ }
    if (seen && m !== '1') return;
    setOpen(true);
    if (viewed.current) return;
    viewed.current = true;
    track('trial_nudge_viewed', { day: 6, trial_day: 7, kind: 'modal' });
  }, [params]);

  useEffect(() => {
    if (!open) return;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') later(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const later = () => {
    track('trial_nudge_dismissed', { day: 6, trial_day: 7, kind: 'modal' });
    try { sessionStorage.setItem(LASTDAY_SEEN_KEY, '1'); } catch { /* shows again on reload */ }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className={s.overlay}>
      <div ref={ref} tabIndex={-1} className={`${s.modal} ${s.noOutline}`} role="dialog" aria-modal="true" aria-labelledby="lastday-title">
        <div className={s.modalNoise} />
        <div className={s.modalTop}>Last day of your free trial</div>
        <div className={s.modalBody}>
          <div className={s.modalLogos} aria-hidden>
            <span className={s.logoRing}><Image src="/signup/icons/timer.svg" alt="" width={28} height={28} /></span>
          </div>
          <h2 id="lastday-title" className={s.modalTitle}>Your access pauses tomorrow</h2>
          <p className={`${s.text} ${s.center}`}><Lines text="Connect an exchange today and nothing pauses. It takes about 10 minutes." /></p>
          <ul className={s.modalList}>
            {KEEPS.map((k) => <li key={k}><Image src="/signup/check.svg" alt="" width={16} height={16} />{k}</li>)}
          </ul>
        </div>
        <div className={`${s.modalFooter} ${s.modalFooterStack}`}>
          <PrimaryButton onClick={onConnect}>Connect now</PrimaryButton>
          <button type="button" className={s.modalLater} onClick={later}>Remind me later</button>
        </div>
      </div>
    </div>
  );
}
