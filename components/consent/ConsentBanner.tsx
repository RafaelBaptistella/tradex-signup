'use client';

/**
 * Analytics consent (TDDDG §25, GDPR art. 6(1)(a)), EU mode only.
 * PostHog stays off until people accept; Accept and Decline carry the same weight, and nothing is pre-selected.
 * The A/B/C flag in sessionStorage is strictly necessary to show one consistent flow, so it doesn't wait for consent.
 * Impact on the test: people who decline aren't measured (see the compliance review).
 */
import { useEffect, useState } from 'react';
import { Lines } from '@/components/signup/parts';
import { consent, setConsent, useEU } from '@/lib/compliance';
import c from './consent.module.css';

export default function ConsentBanner() {
  const eu = useEU();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const read = () => setOpen(consent() === null);
    read();
    window.addEventListener('tx-rules', read);
    window.addEventListener('storage', read);
    return () => { window.removeEventListener('tx-rules', read); window.removeEventListener('storage', read); };
  }, []);

  if (!eu || !open) return null;

  return (
    <section className={c.banner} role="dialog" aria-labelledby="consent-title" aria-describedby="consent-text">
      <div>
        <h2 id="consent-title" className={c.title}>Can we measure how you use TradeX?</h2>
        <p id="consent-text" className={c.text}>
          <Lines text="With your OK, we use analytics to see which steps work and which don’t. You can change this any time in the Privacy Policy." />
        </p>
      </div>
      <div className={c.actions}>
        <button type="button" className={c.btn} onClick={() => setConsent('denied')}>Decline</button>
        <button type="button" className={c.btn} onClick={() => setConsent('granted')}>Accept</button>
      </div>
      <a className={c.link} href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
    </section>
  );
}
