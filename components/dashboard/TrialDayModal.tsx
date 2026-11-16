'use client';

/**
 * Flow C · C-04 · one modal per trial day, shown on the first visit of that day (once per session per day).
 * Day 1 is the C-03 trial welcome; days 2–3 push the free half (course, Discord); days 4–7 ask for the connect
 * (canvas nudges D3 = day 4, D5 = day 6, D6 = day 7, the last day). All in the shared Paywall style, over the dashboard.
 * Prototype: ?modal=0 hides it, ?modal=1 always opens it.
 * Events: trial_welcome_viewed (day 1); trial_nudge_viewed {day, trial_day, kind: modal}; trial_nudge_dismissed;
 * trial_item_clicked {item} when a day-2/3 modal starts the course or opens the Discord.
 */
import Paywall, { type PaywallSection } from '@/components/paywall/Paywall';
import type { ExchangeId } from '@/lib/exchanges';
import { TRIAL_DAYS } from '@/components/signup/VerifyEmail';
import p from '@/components/paywall/paywall.module.css';

export const DAY_MODAL_KEY = 'tx_daymodal_seen_';

type Day = {
  canvas?: number; label: string; art: 'gem' | 'forma'; title: string; lead: string; sections: PaywallSection[];
  exchanges?: boolean; primary: string | ((n: string) => string); action: 'close' | 'connect' | 'first_course' | 'join_discord';
  secondary?: { label: string; action: 'close' | 'connect' }; wide?: boolean;
};

const OPEN: PaywallSection = { title: 'Open during your trial', items: [
  { icon: 'education', text: 'Courses · Level 1 and 2', state: 'open' },
  { icon: 'forum', text: 'Community and Discord', state: 'open' },
  { icon: 'chart-candlestick', text: 'Analyses, events and journal', state: 'open' }
] };
const UNLOCKS: PaywallSection = { title: 'Unlocks with an exchange', items: [
  { icon: 'trophy', text: 'Monthly rewards for top traders', state: 'locked' },
  { icon: 'skill-level', text: 'Ranks and leaderboards', state: 'locked' },
  { icon: 'education', text: 'Advanced courses, Level 3 and up', state: 'locked' }
] };
const CONNECT_GETS: PaywallSection = { items: [
  { icon: 'trophy', text: 'A spot on the monthly leaderboard' },
  { icon: 'skill-level', text: 'Ranks from Rekrut up, with rewards at each rank' },
  { icon: 'education', text: 'Advanced courses, Level 3 and up' }
] };

export const DAYS: Record<number, Day> = {
  1: { label: 'Free trial', art: 'gem', wide: true, title: 'Your 7 free days start now',
    lead: 'Half of TradeX is open to you today. Connect an exchange to unlock it all.',
    sections: [OPEN, UNLOCKS], primary: 'Start exploring', action: 'close', secondary: { label: 'Connect an exchange now', action: 'connect' } },
  2: { label: 'Free trial', art: 'forma', title: 'Start with the beginner course',
    lead: 'Level 1 covers the basics of trading, step by step. What you learn now stays yours.',
    sections: [{ items: [
      { icon: 'education', text: 'Level 1 and 2 are open during your trial' },
      { icon: 'timer', text: 'Short lessons you can pause any time' },
      { icon: 'forum', text: 'Questions? The coaches answer on Discord' }
    ] }], primary: 'Start the beginner course', action: 'first_course', secondary: { label: 'Later', action: 'close' } },
  3: { label: 'Free trial', art: 'forma', title: 'Trade live with the community today',
    lead: 'The coaches trade live on Discord every day. Join and follow along.',
    sections: [{ items: [
      { icon: 'forum', text: 'Daily live trading with the coaches' },
      { icon: 'data-view', text: 'See how other members read the market' },
      { icon: 'chart-candlestick', text: 'This week’s market analysis is open too' }
    ] }], primary: 'Join the Discord', action: 'join_discord', secondary: { label: 'Later', action: 'close' } },
  4: { canvas: 3, label: 'Free trial', art: 'gem', title: 'You’re halfway through your free trial',
    lead: 'Connect now and everything stays open after day 7.',
    sections: [CONNECT_GETS], exchanges: true, primary: (n) => `Connect ${n}`, action: 'connect', secondary: { label: 'Keep exploring', action: 'close' } },
  5: { label: 'Free trial', art: 'gem', title: 'See what this month’s top traders share',
    lead: 'Each month, the traders with the most volume share these prize pools. Connect to join them.',
    sections: [{ items: [
      { icon: 'chart-candlestick', text: 'Every trade on your exchange adds to your volume' },
      { icon: 'trophy', text: 'The top traders of the month share the pool' },
      { icon: 'currency-euro', text: 'TradeX stays free. No extra fees.' }
    ] }], exchanges: true, primary: (n) => `Connect ${n}`, action: 'connect', secondary: { label: 'Keep exploring', action: 'close' } },
  6: { canvas: 5, label: 'Free trial', art: 'gem', title: 'Two days left in your free trial',
    lead: 'After day 7, courses and community pause until you connect.',
    sections: [CONNECT_GETS], exchanges: true, primary: (n) => `Connect ${n}`, action: 'connect', secondary: { label: 'Remind me later', action: 'close' } },
  7: { canvas: 6, label: 'Last day of your free trial', art: 'gem', title: 'Your access pauses tomorrow',
    lead: 'Connect an exchange today and nothing pauses. It takes about 10 minutes.',
    sections: [{ items: [
      { icon: 'education', text: 'Courses Level 1 and 2 stay open' },
      { icon: 'forum', text: 'The community and Discord stay open' },
      { icon: 'trophy', text: 'The leaderboard and ranks unlock' }
    ] }], exchanges: true, primary: (n) => `Connect ${n}`, action: 'connect', secondary: { label: 'Remind me later', action: 'close' } }
};

const DAY_MS = 86400000;
const fmt = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export default function TrialDayModal({ day, start, onConnect, onItem, onClose }: {
  day: number; start: number | null;
  onConnect: (exchange?: ExchangeId) => void; onItem: (item: 'first_course' | 'join_discord') => void; onClose: () => void;
}) {
  const c = DAYS[day];
  if (!c) return null;
  const left = Math.max(1, TRIAL_DAYS + 1 - day);
  const run = (a: Day['action'], ex?: ExchangeId) => {
    if (a === 'connect') onConnect(ex);
    else if (a === 'close') onClose();
    else onItem(a);
  };

  return (
    <Paywall
      id={`day${day}`} label={c.label} art={c.art} wide={c.wide}
      chip={day === 7 ? 'Last day' : `${left} days left`} tone={left <= 2 ? 'warn' : 'accent'}
      title={c.title} lead={c.lead} sections={c.sections} exchanges={c.exchanges}
      primary={{ label: c.primary, onClick: (ex) => run(c.action, ex) }}
      secondary={c.secondary && { label: c.secondary.label, onClick: () => run(c.secondary!.action) }}
      onClose={onClose}
    >
      {day === 1 && start !== null && (
        <ol className={`${p.timeline} ${p.timelineList}`} aria-label="Your 7 days">
          <li><b>Today</b>{fmt(new Date(start))} · Explore the free half</li>
          <li><b>Day {TRIAL_DAYS}</b>{fmt(new Date(start + (TRIAL_DAYS - 1) * DAY_MS))} · Last free day</li>
          <li><b>Day {TRIAL_DAYS + 1}</b>{fmt(new Date(start + TRIAL_DAYS * DAY_MS))} · Pauses until you connect</li>
        </ol>
      )}
    </Paywall>
  );
}
