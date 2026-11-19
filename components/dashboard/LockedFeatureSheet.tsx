'use client';

/**
 * Flow B · B-07 · Locked feature sheet.
 * Canvas requirements: a contextual ask when the user taps a locked item; sheet tied to the feature tapped
 * (e.g. Monthly rewards); what they'd get + Connect button. Event: locked_feature_clicked {feature}.
 * Paywall style (shared Paywall), with the two exchanges and their prize pools as the selectable cards.
 * Flow C · C-05 (canvas: "Reuse B-07 with trial copy"): with trialDay set, the title says the feature isn't part of
 * the free trial and the corner chip counts the days left. Adds the Advanced courses sheet (locked in C only).
 * Event: locked_feature_clicked {feature, trial_day}; locked_feature_dismissed.
 */
import Paywall, { type PaywallItem } from '@/components/paywall/Paywall';
import type { ExchangeId } from '@/lib/exchanges';
import { track } from '@/lib/track';
import { useEU } from '@/lib/compliance';

/**
 * cashback, ranking: B and C. courses: C only (advanced courses during the trial).
 * journal, events, community, partners, analyses: B only (soft lock, Nov 19, 2026: B keeps the dashboard, Ranks & Rewards and Courses open).
 */
export const LOCKED_FEATURES = ['cashback', 'ranking', 'courses', 'journal', 'events', 'community', 'partners', 'analyses'] as const;
export type LockedFeature = (typeof LOCKED_FEATURES)[number];

type Copy = { top: string; art: 'gem' | 'forma'; title: string; text: string; trialTitle: string; trialText: string; gets: PaywallItem[] };

const OPENS: PaywallItem[] = [
  { icon: 'forum', text: 'Community, Discord and daily live trading' },
  { icon: 'chart-candlestick', text: 'Analyses, events and your trading journal' },
  { icon: 'trophy', text: 'The leaderboard and monthly rewards' }
];
const soft = (top: string, title: string, text: string): Copy => ({ top, art: 'forma', title, text, trialTitle: title, trialText: text, gets: OPENS });

const CONTENT: Record<LockedFeature, Copy> = {
  journal: soft('Trading Journal', 'Your trading journal opens when you connect', 'Log every trade from your exchange and see what works. Courses and your rank path are already open.'),
  events: soft('Events', 'Events open when you connect', 'Live sessions, workshops and Q&As with the coaches. Courses and your rank path are already open.'),
  community: soft('Community', 'The community opens when you connect', 'Trade alongside members and coaches on Discord every day. Courses and your rank path are already open.'),
  partners: soft('Partnerships', 'Partner deals open when you connect', 'Discounts and offers from TradeX partners. Courses and your rank path are already open.'),
  analyses: soft('Analyses', 'Market analyses open when you connect', 'Daily and weekly reads of the market from the coaches. Courses and your rank path are already open.'),
  cashback: {
    top: 'Monthly rewards', art: 'gem',
    title: 'Monthly rewards open when you connect',
    text: 'The top traders by volume share a prize pool each month. TradeX counts volume on accounts opened through TradeX.',
    trialTitle: 'Monthly rewards aren’t part of the free trial',
    trialText: 'The top traders by volume share a prize pool each month. TradeX counts volume on accounts opened through TradeX.',
    gets: [
      { icon: 'trophy', text: 'A spot on the monthly leaderboard' },
      { icon: 'chart-candlestick', text: 'Every trade adds to your volume' },
      { icon: 'money', text: 'The exchange’s welcome bonus when you open the account' }
    ]
  },
  ranking: {
    top: 'Ranking', art: 'gem',
    title: 'Your ranking opens when you connect',
    text: 'Ranks move with your trading volume, so TradeX needs your exchange account to count it.',
    trialTitle: 'Ranks aren’t part of the free trial',
    trialText: 'Ranks move with your trading volume. TradeX needs your exchange account to count it.',
    gets: [
      { icon: 'skill-level', text: 'Start as a Rekrut and reach Krieger at $1K volume' },
      { icon: 'trophy', text: 'Your place on the leaderboard' },
      { icon: 'education', text: 'More tools, classes and rewards with every rank' }
    ]
  },
  courses: {
    top: 'Advanced courses', art: 'forma',
    title: 'Advanced courses open when you connect',
    text: 'Level 3 and up build on the basics with real trades on your own account.',
    trialTitle: 'Advanced courses aren’t part of the free trial',
    trialText: 'Level 1 and 2 are yours during the trial. Level 3 and up open with an exchange.',
    gets: [
      { icon: 'education', text: 'Every course level, from 3 up' },
      { icon: 'chart-candlestick', text: 'Strategies the coaches use in live trading' },
      { icon: 'forum', text: 'New lessons as they come out' }
    ]
  }
};

export default function LockedFeatureSheet({ feature, trialDay, onConnect, onClose }: { feature: LockedFeature; trialDay?: number; onConnect: (exchange: ExchangeId) => void; onClose: () => void }) {
  const eu = useEU();
  // EU rules: the exchange's welcome offer is mentioned more quietly (no amounts).
  const c = eu && feature === 'cashback'
    ? { ...CONTENT[feature], gets: CONTENT[feature].gets.map((g) => (g.icon === 'money' ? { ...g, text: 'A welcome offer from the exchange for new accounts' } : g)) }
    : CONTENT[feature];
  const trial = trialDay !== undefined;
  const daysLeft = trial ? Math.max(1, 8 - trialDay) : 0;
  const dismiss = () => { track('locked_feature_dismissed', { feature, ...(trial ? { trial_day: trialDay } : {}) }); onClose(); };

  return (
    <Paywall
      id="locked" label={c.top} labelLocked art={c.art}
      chip={trial ? (daysLeft === 1 ? 'Last day' : `${daysLeft} days left`) : undefined}
      tone={trial && daysLeft <= 2 ? 'warn' : 'accent'}
      title={trial ? c.trialTitle : c.title}
      lead={trial ? c.trialText : c.text}
      sections={[{ items: c.gets }]}
      exchanges
      primary={{ label: (n) => `Connect ${n}`, onClick: onConnect }}
      secondary={{ label: trial ? 'Keep exploring' : 'Not now', onClick: dismiss }}
      onClose={dismiss}
    />
  );
}
