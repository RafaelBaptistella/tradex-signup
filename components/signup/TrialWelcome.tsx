'use client';

/**
 * Flow C · C-03 · Trial welcome. First screen after the email is confirmed (C-02 starts the trial).
 * Canvas requirements: explain the deal: 7 days free, 50% unlocked, connect to unlock everything forever.
 * Two columns (included now / unlocks with exchange), 7-day timeline, CTA "Start exploring", secondary "Connect now".
 * Free/locked split follows the canvas proposal (open question in C): courses Level 1-2, community, tools free;
 * cashback, ranking and advanced courses locked.
 * Events: trial_welcome_viewed; exchange_connect_started {source: trial} on "Connect now".
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton, HelpButton, Lines, styles as s } from './parts';
import { TRIAL_DAYS, TRIAL_KEY } from './VerifyEmail';
import { setFlow, track } from '@/lib/track';

const INCLUDED = [
  { title: 'Courses · Level 1 and 2', text: 'The basics of trading, step by step.' },
  { title: 'Community and Discord', text: 'Ask questions and follow other traders.' },
  { title: 'Analyses, events and journal', text: 'Market analyses, live events and your trading journal.' }
];

const UNLOCKS = [
  { title: 'Cashback on every trade', text: 'Part of your trading fees comes back every month.' },
  { title: 'Ranks and leaderboards', text: 'Climb from Rekrut with your trading volume.' },
  { title: 'Advanced courses', text: 'Level 3 and up, after the basics.' }
];

/** Trial days shown on the timeline, with the real date for each. Day 1 is today. */
const TIMELINE = [
  { day: 1, text: 'Explore the free half of TradeX.' },
  { day: 5, text: 'We remind you: two days left.' },
  { day: TRIAL_DAYS, text: 'Last day of your free trial.' },
  { day: TRIAL_DAYS + 1, text: 'Free access pauses until you connect.' }
];

const DAY_MS = 86400000;
const fmt = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export default function TrialWelcome() {
  const router = useRouter();
  const viewed = useRef(false);
  const [start, setStart] = useState<number | null>(null);

  useEffect(() => {
    let t = Date.now();
    try { const v = Number(sessionStorage.getItem(TRIAL_KEY)); if (v) t = v; } catch { /* trial starts today */ }
    setStart(t);
    if (viewed.current) return;
    viewed.current = true;
    setFlow('c');
    track('trial_welcome_viewed', { trial_day: Math.floor((Date.now() - t) / DAY_MS) + 1 });
  }, []);

  const connect = () => {
    track('exchange_connect_started', { source: 'trial' });
    router.push('/exchange');
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
            <h1 className={`${s.title} ${s.titleTop}`}>Your 7 free days start now</h1>
            <p className={s.lead}><Lines text="Half of TradeX is open to you today. Connect an exchange to unlock it all." /></p>
          </div>

          <div className={s.trialCols}>
            <section className={s.planBlock} aria-labelledby="trial-now">
              <h2 id="trial-now" className={s.questionLabel}>Open during your trial</h2>
              <ul className={s.planList}>
                {INCLUDED.map((it) => (
                  <li key={it.title} className={s.welcomeCard}>
                    <Image src="/signup/check.svg" alt="" width={16} height={16} />
                    <div>
                      <h3 className={s.welcomeCardTitle}>{it.title}</h3>
                      <p className={s.welcomeCardText}>{it.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className={s.planBlock} aria-labelledby="trial-unlocks">
              <h2 id="trial-unlocks" className={s.questionLabel}>Unlocks with an exchange</h2>
              <ul className={s.planList}>
                {UNLOCKS.map((it) => (
                  <li key={it.title} className={`${s.welcomeCard} ${s.trialLocked}`}>
                    <Image src="/dashboard/icons/lock.svg" alt="" width={16} height={16} />
                    <div>
                      <h3 className={s.welcomeCardTitle}>{it.title}</h3>
                      <p className={s.welcomeCardText}>{it.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className={s.planBlock} aria-labelledby="trial-time">
            <h2 id="trial-time" className={s.questionLabel}>Your 7 days</h2>
            <div className={s.planCard}>
              <ol className={s.path}>
                {TIMELINE.map((t, i) => (
                  <li key={t.day} className={i === 0 ? s.pathOn : ''} aria-current={i === 0 ? 'step' : undefined}>
                    <span className={s.pathMark} aria-hidden />
                    <span className={s.trialDay}>
                      {i === 0 ? 'Today' : `Day ${t.day}`}
                      {start !== null && <small>{fmt(new Date(start + (t.day - 1) * DAY_MS))}</small>}
                    </span>
                    <span className={s.pathText}>{t.text}</span>
                  </li>
                ))}
              </ol>
              <p className={s.hint}><Lines text="Connect any time during the trial. Everything unlocks at once, and nothing is lost." /></p>
            </div>
          </section>

          <div className={s.choiceActions}>
            <PrimaryButton onClick={() => router.push('/c/dashboard')}>Start exploring</PrimaryButton>
            <button type="button" className={s.inlineLink} onClick={connect}>Connect an exchange now</button>
          </div>
        </div>

        <div className={s.spacer} aria-hidden />
      </div>

      <HelpButton stepKey="trial_welcome">
        <h2>How the trial works</h2>
        <p>For 7 days, courses Level 1 and 2, the community and the tools are free.</p>
        <p>Cashback and ranks need an exchange account opened through TradeX on Bitunix or Pionex.</p>
        <p>Connect it during the trial or after: everything unlocks for good.</p>
      </HelpButton>
    </main>
  );
}
