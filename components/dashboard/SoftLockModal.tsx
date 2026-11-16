'use client';

/**
 * Flow B · B-03 · Dashboard + connect modal.
 * Canvas requirements: dashboard visible behind a dialog; dialog with a one-line value and the exchange logos;
 * primary "Connect now", secondary "Later". Events: softlock_modal_viewed, softlock_modal_dismissed.
 * Paywall style (shared Paywall): the two exchanges are the selectable cards, with their monthly prize pools.
 */
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Paywall from '@/components/paywall/Paywall';
import { Lines } from '@/components/signup/parts';
import { connectPath } from '@/lib/exchanges';
import { track } from '@/lib/track';

const SEEN_KEY = 'tx_softlock_seen';

export default function SoftLockModal() {
  const router = useRouter();
  const params = useSearchParams();
  // Shown once per session (first entry after signup). After “Later” the person sees B-06; ?modal=0 opens B-06 directly.
  const [open, setOpen] = useState(false);
  const viewed = useRef(false);

  // Prototype navigator: ?modal=0 hides it (B-06), ?modal=1 always opens it; without the param it shows once per session.
  useEffect(() => {
    const m = params.get('modal');
    if (m === '0') { setOpen(false); return; }
    let seen = false;
    try { seen = !!sessionStorage.getItem(SEEN_KEY); } catch { /* show it */ }
    if (seen && m !== '1') return;
    setOpen(true);
    if (viewed.current) return;
    viewed.current = true;
    track('softlock_modal_viewed', { source: 'first_session' });
  }, [params]);

  const later = () => {
    track('softlock_modal_dismissed', { source: 'first_session' });
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* shows again on reload */ }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <Paywall
      id="softlock" label="You’re in TradeX" art="gem"
      title="Connect an exchange to join the leaderboard"
      lead="Your trading volume ranks you. Each month, the top traders share a prize pool."
      sections={[{ items: [
        { icon: 'trophy', text: 'A spot on the monthly leaderboard' },
        { icon: 'skill-level', text: '10 ranks, each with exclusive rewards' },
        { icon: 'education', text: 'Courses and community stay open', state: 'open' }
      ] }]}
      exchanges
      primary={{ label: (n) => `Connect ${n}`, onClick: (ex) => { track('exchange_connect_started', { source: 'softlock_modal', exchange: ex }); router.push(connectPath('b', ex)); } }}
      secondary={{ label: 'Later', onClick: later }}
      onClose={later}
      footer={<span><Lines text="Your money stays on the exchange. TradeX never holds your funds." /></span>}
    />
  );
}
