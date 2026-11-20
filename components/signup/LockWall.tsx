'use client';

/**
 * Flow C · C-09 · Lock wall. Shown from day 8 when the trial ended without a connected exchange (C-08 decides).
 * Canvas requirements: whole platform locked; only path is connecting an exchange.
 * Paywall-style modal over the locked platform (no close button): what opens when they connect,
 * the two exchanges, Connect CTA, Contact support / Log out links.
 * EU rules: the wall keeps GDPR rights in reach (download data, delete account), not only Connect / Support / Log out.
 * Event: lockwall_viewed; exchange_connect_started {source: lockwall, exchange}.
 */
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Paywall from '@/components/paywall/Paywall';
import p from '@/components/paywall/paywall.module.css';
import { DISCORD_SUPPORT } from '@/lib/help';
import { connectPath } from '@/lib/exchanges';
import { setFlow, track } from '@/lib/track';
import { useEU } from '@/lib/compliance';

const UNLOCKS = [
  { icon: 'education', text: 'Courses, community and tools' },
  { icon: 'trophy', text: 'Monthly leaderboard rewards' },
  { icon: 'skill-level', text: 'Ranks and the rewards they unlock' }
];

export default function LockWall() {
  const router = useRouter();
  const eu = useEU();
  const viewed = useRef(false);

  useEffect(() => {
    let saved: Record<string, boolean> = {};
    try { saved = JSON.parse(sessionStorage.getItem('tx_trial_used') || '{}') || {}; } catch { /* nothing tried */ }
    if (viewed.current) return;
    viewed.current = true;
    setFlow('c');
    track('lockwall_viewed', { items_used: Object.values(saved).filter(Boolean).length });
  }, []);

  return (
    <Paywall
      id="lockwall" label="Free trial ended" labelLocked art="gem" wide tone="warn"
      title="Your free trial has ended"
      lead="Your account is safe and nothing is lost. Connect an exchange to open TradeX again."
      // Nov 20, 2026: one list, so the wall is the same size as every other paywall (the "Your trial" list is dropped; lockwall_viewed still counts it).
      sections={[{ title: 'Opens when you connect', items: UNLOCKS.map((u) => ({ ...u, state: 'locked' as const })) }]}
      exchanges
      primary={{ label: (n) => `Connect ${n}`, onClick: (ex) => { track('exchange_connect_started', { source: 'lockwall', exchange: ex }); router.push(connectPath('c', ex)); } }}
      // Nov 19, 2026: the risk and commission lines already show on every screen before this one, so the lock wall stays light.
      disclosure={false}
      // Nov 20, 2026: the account links sit in the slot under the button, like "Later" on the other paywalls.
      footer={
        <span className={p.links}>
          <a href={DISCORD_SUPPORT} target="_blank" rel="noreferrer" onClick={() => track('lockwall_support_clicked')}>Contact support</a>
          <span aria-hidden>·</span>
          <a href="/c" onClick={() => track('lockwall_logout_clicked')}>Log out</a>
          {/* Placeholder links: the account settings pages for these rights aren't built yet. */}
          {eu && (
            <>
              <span aria-hidden>·</span>
              <a href="#" onClick={(e) => { e.preventDefault(); track('lockwall_data_download_clicked'); }}>Download my data</a>
              <span aria-hidden>·</span>
              <a href="#" onClick={(e) => { e.preventDefault(); track('lockwall_delete_account_clicked'); }}>Delete account</a>
            </>
          )}
        </span>
      }
    />
  );
}
