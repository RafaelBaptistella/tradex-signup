'use client';

/**
 * Flow A · A-17 · Connected · what's next.
 * Canvas requirements: success state with the exchange logo; unlocked: monthly rewards (leaderboard), ranking, all courses;
 * next steps: first course, join Discord, first trade. Event: exchange_connected {exchange, source: guided}.
 * Nov 19, 2026: same treatment as the paywalls (shared Paywall, horizontal, no scroll, shorter copy), over the dashboard.
 */
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Paywall from '@/components/paywall/Paywall';
import { styles as s } from './parts';
import { exchangeById } from '@/lib/exchanges';
import { currentFlow, track } from '@/lib/track';

export default function Connected() {
  const router = useRouter();
  const params = useSearchParams();
  const ex = exchangeById(params.get('exchange')) ?? exchangeById('bitunix')!;
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track('exchange_connected', { exchange: ex.id, source: { a: 'guided', b: 'softlock', c: 'trial' }[currentFlow()] });
  }, [ex.id]);

  const open = () => router.push(`${{ a: '/dashboard', b: '/b/unlocked', c: '/c/unlocked' }[currentFlow()]}?exchange=${ex.id}`);

  return (
    <main className={s.connectedPage}>
      <div className={s.dashBackdrop} aria-hidden />
      <Paywall
        id="connected" label="Welcome to TradeX!" art="gem"
        title="You’re in. Welcome, Rekrut!"
        lead="Rekrut is your first rank. The leaderboard, ranks and all courses are open now."
        aside={
          <p className={s.connectedBadge}>
            <span className={s.cardLogo}><Image src={ex.logo.src} alt="" width={ex.logo.width * 0.75} height={ex.logo.height * 0.75} /></span>
            {ex.name} connected
          </p>
        }
        sections={[
          { title: 'Start here', items: [
            { icon: 'education', text: 'Your first course' },
            { icon: 'forum', text: 'Daily live trading on Discord' },
            { icon: 'chart-candlestick', text: `Your first trade on ${ex.name}` }
          ] }
        ]}
        primary={{ label: 'Open TradeX', onClick: open }}
      />
    </main>
  );
}
