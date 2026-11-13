'use client';

/**
 * A-21 · Landing for the resume email links: logs the click and opens the step the person stopped at.
 * Event: email_clicked {email_id, step}.
 */
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CONNECT_ROUTES } from '@/lib/resume';
import { exchangeById } from '@/lib/exchanges';
import { setFlow, track } from '@/lib/track';
import { styles as s } from '@/components/signup/parts';

export default function Resume() {
  const router = useRouter();
  const params = useSearchParams();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    // B-08 emails (flow B, not connected yet) send people into B's connect flow (B-05).
    if (params.get('to') === 'b-connect') {
      setFlow('b');
      track('email_clicked', { email_id: params.get('email') || 'unknown' });
      router.replace('/b/connect');
      return;
    }
    const step = Math.min(5, Math.max(0, Number(params.get('step')) || 0));
    const ex = exchangeById(params.get('exchange')) ?? exchangeById('bitunix')!;
    track('email_clicked', { email_id: params.get('email') || 'unknown', step, exchange: ex.id });
    router.replace(`${CONNECT_ROUTES[step].path}?exchange=${ex.id}`);
  }, [params, router]);

  return (
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.centerMain}><div /><div className={s.centerContent}><div className={s.centerIntro}><span className={s.spinnerLarge} aria-hidden /><p className={s.text}>Taking you back to your step…</p></div></div><div /></div>
    </main>
  );
}
