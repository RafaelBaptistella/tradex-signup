'use client';

/**
 * Flow B · B-07 · Locked feature sheet.
 * Canvas requirements: a contextual ask when the user taps a locked item; sheet tied to the feature tapped
 * (e.g. Cashback); what they'd get + Connect button. Event: locked_feature_clicked {feature}.
 * Same Figma modal style (964:5925) as B-03; a bottom sheet on phones.
 * Flow C · C-05 (canvas: "Reuse B-07 with trial copy"): with trialDay set, the title says the feature isn't part of
 * the free trial, and a note under the list counts the days left. Adds the Advanced courses sheet (locked in C only).
 * Event: locked_feature_clicked {feature, trial_day}.
 */
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { PrimaryButton, Lines, styles as s } from '@/components/signup/parts';
import { EXCHANGES } from '@/lib/exchanges';
import { track } from '@/lib/track';

export type LockedFeature = 'cashback' | 'ranking' | 'courses';

type Copy = { top: string; title: string; text: string; gets: string[]; trialTitle: string; trialText: string };

const CONTENT: Record<LockedFeature, Copy> = {
  cashback: {
    top: 'Cashback',
    title: 'Cashback opens when you connect',
    text: 'Cashback comes from the fees you pay when you trade. TradeX can only pay it on an exchange account opened through TradeX.',
    trialTitle: 'Cashback isn’t part of the free trial',
    trialText: 'It comes from the fees you pay when you trade. TradeX can only pay it on an exchange account opened through TradeX.',
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
    trialTitle: 'Ranks aren’t part of the free trial',
    trialText: 'Ranks move with your trading volume. TradeX needs your exchange account to count it.',
    gets: [
      'Start as a Rekrut and reach Krieger at $1K volume',
      'Your place on the leaderboard',
      'More tools and rewards with every rank'
    ]
  },
  courses: {
    top: 'Advanced courses',
    title: 'Advanced courses open when you connect',
    text: 'Level 3 and up build on the basics with real trades on your own account.',
    trialTitle: 'Advanced courses aren’t part of the free trial',
    trialText: 'Level 1 and 2 are yours during the trial. Level 3 and up open with an exchange.',
    gets: [
      'Every course level, from 3 up',
      'Strategies the coaches use in live trading',
      'New lessons as they come out'
    ]
  }
};

export default function LockedFeatureSheet({ feature, trialDay, onConnect, onClose }: { feature: LockedFeature; trialDay?: number; onConnect: () => void; onClose: () => void }) {
  const c = CONTENT[feature];
  const trial = trialDay !== undefined;
  const daysLeft = trial ? Math.max(1, 8 - trialDay) : 0;
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = () => { track('locked_feature_dismissed', { feature, ...(trial ? { trial_day: trialDay } : {}) }); closeRef.current(); };

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
          <h2 id="locked-title" className={s.modalTitle}>{trial ? c.trialTitle : c.title}</h2>
          <p className={`${s.text} ${s.center}`}>{trial ? <Lines text={c.trialText} /> : c.text}</p>
          <ul className={s.modalList}>
            {c.gets.map((g) => <li key={g}><Image src="/signup/check.svg" alt="" width={16} height={16} />{g}</li>)}
          </ul>
          {trial && (
            <p className={s.trialNote}>
              <Image src="/signup/icons/timer.svg" alt="" width={16} height={16} />
              <span>
                <b>{daysLeft === 1 ? 'Last day of your free trial' : `${daysLeft} days left in your free trial`}</b>
                <span>Connect now and it all stays open.</span>
              </span>
            </p>
          )}
        </div>
        <div className={`${s.modalFooter} ${s.modalFooterStack}`}>
          <PrimaryButton onClick={onConnect}>Connect exchange</PrimaryButton>
          <button type="button" className={s.modalLater} onClick={dismiss}>{trial ? 'Keep exploring' : 'Not now'}</button>
        </div>
      </div>
    </div>
  );
}
