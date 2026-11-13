'use client';

/**
 * Flow B · B-07 · Locked feature sheet.
 * Canvas requirements: a contextual ask when the user taps a locked item; sheet tied to the feature tapped
 * (e.g. Cashback); what they'd get + Connect button. Event: locked_feature_clicked {feature}.
 * Same Figma modal style (964:5925) as B-03; a bottom sheet on phones.
 */
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { PrimaryButton, styles as s } from '@/components/signup/parts';
import { EXCHANGES } from '@/lib/exchanges';
import { track } from '@/lib/track';

export type LockedFeature = 'cashback' | 'ranking';

const CONTENT: Record<LockedFeature, { top: string; title: string; text: string; gets: string[] }> = {
  cashback: {
    top: 'Cashback',
    title: 'Cashback opens when you connect',
    text: 'Cashback comes from the fees you pay when you trade. TradeX can only pay it on an exchange account opened through TradeX.',
    gets: [
      'Part of your trading fees back, every month',
      `Monthly pools: Bitunix ${EXCHANGES[0].pool}, Pionex ${EXCHANGES[1].pool}`,
      'The exchange’s welcome bonuses when you open the account'
    ]
  },
  ranking: {
    top: 'Ranking',
    title: 'Your ranking opens when you connect',
    text: 'Ranks move with your trading volume, so TradeX needs your exchange account to count it.',
    gets: [
      'Start as a Rekrut and reach Krieger at $1K volume',
      'Your place on the leaderboard',
      'More tools and rewards with every rank'
    ]
  }
};

export default function LockedFeatureSheet({ feature, onConnect, onClose }: { feature: LockedFeature; onConnect: () => void; onClose: () => void }) {
  const c = CONTENT[feature];
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = () => { track('locked_feature_dismissed', { feature }); closeRef.current(); };

  return (
    <div className={`${s.overlay} ${s.sheetOverlay}`} onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}>
      <div ref={ref} tabIndex={-1} className={`${s.modal} ${s.noOutline} ${s.sheetModal}`} role="dialog" aria-modal="true" aria-labelledby="locked-title">
        <div className={s.modalNoise} />
        <div className={s.modalTop}>
          <span className={s.lockTitle}><Image src="/dashboard/icons/lock.svg" alt="" width={14} height={14} />{c.top}</span>
          <button type="button" className={s.modalBack} onClick={dismiss} aria-label="Close">
            <Image src="/signup/arrow-left-small.svg" alt="" width={16} height={16} />
          </button>
        </div>
        <div className={s.modalBody}>
          <h2 id="locked-title" className={s.modalTitle}>{c.title}</h2>
          <p className={`${s.text} ${s.center}`}>{c.text}</p>
          <ul className={s.modalList}>
            {c.gets.map((g) => <li key={g}><Image src="/signup/check.svg" alt="" width={16} height={16} />{g}</li>)}
          </ul>
        </div>
        <div className={`${s.modalFooter} ${s.modalFooterStack}`}>
          <PrimaryButton onClick={onConnect}>Connect exchange</PrimaryButton>
          <button type="button" className={s.modalLater} onClick={dismiss}>Not now</button>
        </div>
      </div>
    </div>
  );
}
