'use client';

/**
 * Advent Calendar · sidebar event card (Nov 20, 2026). An annual event, so it gets more than a nav row:
 * the first thing under the search bar, with an Event tag, today's prize and the countdown to the draw.
 * Event: advent_nav_clicked {from: sidebar_card}.
 */
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { track } from '@/lib/track';
import { DAYS, adventToday, pad, useDrawCountdown } from './adventData';
import a from './advent.module.css';

export default function AdventSideCard({ active, from }: { active: boolean; from: string }) {
  const router = useRouter();
  const today = adventToday(useSearchParams().get('today'));
  const day = DAYS[today - 1];
  const [h, m, s] = useDrawCountdown();
  return (
    <a href="/advent" className={`${a.side} ${active ? a.sideActive : ''}`} aria-current={active ? 'page' : undefined}
      onClick={(e) => { e.preventDefault(); track('advent_nav_clicked', { from: 'sidebar_card', view: from }); router.push('/advent'); }}>
      <span className={a.sideHead}>
        <span className={a.eventTag}>Event</span>
        <span className={a.sideSponsor}>by <Image src="/advent/kraken-logo-white.svg" alt="Kraken" width={58} height={9} /></span>
      </span>
      <b className={a.sideTitle}>Advent Calendar</b>
      <span className={a.sidePrize}><span>Day {today} prize</span><b>{day.prize}</b></span>
      <span className={a.sideClock} aria-label={`Draw in ${h} hours ${m} minutes`}>
        <span>Draw in</span><b>{pad(h)}:{pad(m)}:{pad(s)}</b>
      </span>
    </a>
  );
}
