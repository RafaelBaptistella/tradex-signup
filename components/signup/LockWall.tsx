'use client';

/**
 * Flow C · C-09 · Lock wall. Shown from day 8 when the trial ended without a connected exchange (C-08 decides).
 * Canvas requirements: whole platform locked; only path is connecting an exchange.
 * Full-screen wall with what they used during the trial, Connect CTA, Logout / support links.
 * Event: lockwall_viewed; exchange_connect_started {source: lockwall}.
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton, Lines, styles as s } from './parts';
import { DISCORD_SUPPORT } from '@/lib/help';
import { setFlow, track } from '@/lib/track';

/** Same three things as the C-04 “Your trial so far” panel. */
const TRIED = [
  { key: 'first_course', done: 'You started the beginner course', todo: 'The beginner course is waiting' },
  { key: 'join_discord', done: 'You joined the Discord', todo: 'The Discord live trading is waiting' },
  { key: 'read_analysis', done: 'You read a market analysis', todo: 'This week’s market analysis is waiting' }
];

const UNLOCKS = ['Courses, community and tools', 'Cashback on every trade', 'Ranks and leaderboards', 'Advanced courses'];

export default function LockWall() {
  const router = useRouter();
  const [used, setUsed] = useState<Record<string, boolean>>({});
  const viewed = useRef(false);

  useEffect(() => {
    let saved: Record<string, boolean> = {};
    try { saved = JSON.parse(sessionStorage.getItem('tx_trial_used') || '{}') || {}; } catch { /* nothing tried */ }
    setUsed(saved);
    if (viewed.current) return;
    viewed.current = true;
    setFlow('c');
    track('lockwall_viewed', { items_used: Object.values(saved).filter(Boolean).length });
  }, []);

  const connect = () => {
    track('exchange_connect_started', { source: 'lockwall' });
    router.push('/c/connect');
  };

  return (
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={s.centerMain}>
        <div aria-hidden />

        <div className={`${s.centerContent} ${s.medium}`}>
          <div className={s.intro}>
            <Image src="/signup/logo-tradex.svg" alt="TradeX" width={98} height={24} priority />
            <h1 className={`${s.title} ${s.titleTop}`}>Your free trial has ended</h1>
            <p className={s.lead}><Lines text="Your account is safe and nothing is lost. Connect an exchange to open TradeX again." /></p>
          </div>

          <div className={s.trialCols}>
            <section className={s.planBlock} aria-labelledby="wall-tried">
              <h2 id="wall-tried" className={s.questionLabel}>Your trial</h2>
              <ul className={s.planList}>
                {TRIED.map((t) => (
                  <li key={t.key} className={`${s.welcomeCard} ${used[t.key] ? '' : s.trialLocked}`}>
                    {used[t.key]
                      ? <Image src="/signup/check.svg" alt="Done" width={16} height={16} />
                      : <span className={s.wallTodo} aria-label="Not yet" />}
                    <p className={s.welcomeCardTitle}>{used[t.key] ? t.done : t.todo}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className={s.planBlock} aria-labelledby="wall-unlocks">
              <h2 id="wall-unlocks" className={s.questionLabel}>Opens when you connect</h2>
              <ul className={s.planList}>
                {UNLOCKS.map((u) => (
                  <li key={u} className={`${s.welcomeCard} ${s.trialLocked}`}>
                    <Image src="/dashboard/icons/lock.svg" alt="" width={16} height={16} />
                    <p className={s.welcomeCardTitle}>{u}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className={s.choiceActions}>
            <PrimaryButton onClick={connect}>Connect an exchange</PrimaryButton>
            <p className={s.hint}><Lines text="Takes about 10 minutes. We guide every step." /></p>
            <p className={s.wallLinks}>
              <a href={DISCORD_SUPPORT} target="_blank" rel="noreferrer" onClick={() => track('lockwall_support_clicked')}>Contact support</a>
              <span aria-hidden>·</span>
              <a href="/c" onClick={() => track('lockwall_logout_clicked')}>Log out</a>
            </p>
          </div>
        </div>

        <div className={s.spacer} aria-hidden />
      </div>
    </main>
  );
}
