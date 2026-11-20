'use client';

/**
 * Advent Calendar data shared by the page and the sidebar event card (Nov 20, 2026).
 * Prizes aren't decided yet: every prize below is a wireframe placeholder by type, to be replaced by the real list.
 */
import { useEffect, useState } from 'react';

export type Kind = 'crypto' | 'merch' | 'voucher' | 'course' | 'mystery' | 'grand';
type Tone = 'violet' | 'ink' | 'light' | 'blue';
/** area = [row, column, rows, columns] in the 8 × 5 bento. */
export type Day = { day: number; area: [number, number, number, number]; kind: Kind; tone: Tone; prize: string; word?: string };

export const DAYS: Day[] = [
  { day: 1, area: [1, 1, 2, 2], kind: 'crypto', tone: 'violet', prize: '0.25 ETH' },
  { day: 2, area: [1, 3, 1, 1], kind: 'merch', tone: 'light', prize: 'TradeX hoodie' },
  { day: 3, area: [1, 4, 2, 1], kind: 'voucher', tone: 'ink', prize: '$50 fee voucher' },
  { day: 4, area: [1, 5, 1, 2], kind: 'crypto', tone: 'blue', prize: '$100 in BTC' },
  { day: 5, area: [1, 7, 1, 1], kind: 'course', tone: 'ink', prize: 'Pro course pass' },
  { day: 6, area: [1, 8, 2, 1], kind: 'mystery', tone: 'violet', prize: 'Nikolaus surprise', word: 'Nikolaus' },
  { day: 7, area: [2, 3, 1, 1], kind: 'voucher', tone: 'violet', prize: '$75 fee voucher' },
  { day: 8, area: [2, 5, 2, 1], kind: 'merch', tone: 'light', prize: 'Kraken merch pack' },
  { day: 9, area: [2, 6, 1, 2], kind: 'crypto', tone: 'ink', prize: '$150 in SOL' },
  { day: 10, area: [3, 1, 2, 1], kind: 'course', tone: 'blue', prize: '1:1 session with a coach' },
  { day: 11, area: [3, 2, 1, 2], kind: 'mystery', tone: 'ink', prize: 'Lucky draw', word: 'Lucky draw' },
  { day: 12, area: [3, 4, 1, 1], kind: 'crypto', tone: 'light', prize: '0.5 ETH', word: 'Halfway' },
  { day: 13, area: [3, 6, 1, 1], kind: 'voucher', tone: 'violet', prize: '$100 fee voucher' },
  { day: 14, area: [3, 7, 1, 2], kind: 'merch', tone: 'blue', prize: 'TradeX cap and mug' },
  { day: 15, area: [4, 2, 1, 1], kind: 'course', tone: 'ink', prize: 'Pro course pass' },
  { day: 16, area: [4, 3, 1, 2], kind: 'crypto', tone: 'violet', prize: '$250 in BTC' },
  { day: 17, area: [4, 5, 1, 1], kind: 'mystery', tone: 'light', prize: 'Surprise prize' },
  { day: 18, area: [4, 6, 1, 2], kind: 'voucher', tone: 'ink', prize: '$50 fee voucher' },
  { day: 19, area: [4, 8, 1, 1], kind: 'merch', tone: 'violet', prize: 'Hardware wallet' },
  { day: 20, area: [5, 1, 1, 1], kind: 'course', tone: 'light', prize: 'Trading journal Pro, 1 year' },
  { day: 21, area: [5, 2, 1, 1], kind: 'crypto', tone: 'blue', prize: '$200 in ETH' },
  { day: 22, area: [5, 3, 1, 2], kind: 'mystery', tone: 'ink', prize: 'Surprise prize' },
  { day: 23, area: [5, 5, 1, 1], kind: 'voucher', tone: 'violet', prize: '$150 fee voucher' },
  { day: 24, area: [5, 6, 1, 3], kind: 'grand', tone: 'violet', prize: '1 BTC', word: 'Grand prize' }
];

export const KIND_LABEL: Record<Kind, string> = { crypto: 'Crypto', merch: 'Merch', voucher: 'Fee voucher', course: 'Course', mystery: 'Surprise', grand: 'Grand prize' };
/** Drawn days: the winner (masked). */
export const WINNERS: Record<number, string> = { 1: 'alex_k***', 2: 'mara***', 3: 'jonas_t***' };

export const DRAW_HOUR = 18; // daily draw, announced live by Tim
export const pad = (n: number) => String(n).padStart(2, '0');

/** Prototype: ?today=1–24 sets the current day (default 4). */
export const adventToday = (v: string | null) => Math.min(24, Math.max(1, Number(v) || 4));

/** Seconds to the next draw at DRAW_HOUR, ticking every second. */
export function useDrawCountdown() {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const tick = () => {
      const now = new Date(); const next = new Date(now); next.setHours(DRAW_HOUR, 0, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      setLeft(Math.floor((next.getTime() - now.getTime()) / 1000));
    };
    tick(); const t = window.setInterval(tick, 1000); return () => window.clearInterval(t);
  }, []);
  return [Math.floor(left / 3600), Math.floor((left % 3600) / 60), left % 60] as const;
}
