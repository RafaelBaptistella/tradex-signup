'use client';

/**
 * Flow A · A-17 · Connected · what's next.
 * Canvas requirements: success state with the exchange logo; unlocked: cashback, ranking, all courses;
 * next steps: first course, join Discord, first trade. Event: exchange_connected {exchange, source: guided}.
 * Built on the Figma "Welcome to TradeX!" modal (Live Pages → Welcome Screens 1413:9899) over the
 * "Beginner" dashboard (1787:24442), with the Rekrut rank card (first rank, $0 volume).
 */
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PrimaryButton, Lines, styles as s } from './parts';
import { exchangeById } from '@/lib/exchanges';
import { currentFlow, track } from '@/lib/track';

export default function Connected() {
  const router = useRouter();
  const params = useSearchParams();
  const ex = exchangeById(params.get('exchange')) ?? exchangeById('bitunix')!;
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track('exchange_connected', { exchange: ex.id, source: { a: 'guided', b: 'softlock', c: 'trial' }[currentFlow()] });
  }, [ex.id]);

  const unlocked = ['Cashback on every trade', 'Ranking: you start as a Rekrut', 'All courses, community and live trading'];
  const next = [
    { text: 'Start your first course', hint: 'Beginners start with the basics.' },
    { text: 'Join the Discord', hint: 'Daily live trading with the coaches.' },
    { text: `Make your first trade on ${ex.name}`, hint: 'Your cashback and ranking start counting.' }
  ];

  return (
    <main className={s.connectedPage}>
      <div className={s.dashBackdrop} aria-hidden />

      <div className={s.welcomeModal} role="dialog" aria-modal="true" aria-labelledby="connected-title">
        <div className={s.modalNoise} />
        <div className={s.modalTop}>Welcome to TradeX!</div>

        <div className={s.welcomeBody}>
          <div className={s.rankCard} aria-hidden>
            <div className={s.rankWords}>{[0, 1, 2, 3].map((i) => <span key={i}>Rekrut</span>)}</div>
            <div className={s.noise} />
            <Image className={s.rankGem} src="/signup/rank/gem-rekrut.png" alt="" width={276} height={276} priority />
            <p className={s.rankKicker}>Your new rank!</p>
          </div>

          <div className={s.intro}>
            <p className={s.connectedBadge}>
              <span className={s.cardLogo}><Image src={ex.logo.src} alt="" width={ex.logo.width * 0.75} height={ex.logo.height * 0.75} /></span>
              {ex.name} connected
            </p>
            <h1 id="connected-title" className={s.welcomeTitle}>You’re in. Welcome, Rekrut!</h1>
            <p className={s.welcomeLead}><Lines text="Your account is linked to TradeX. Here’s what you get, and where to start." /></p>
          </div>

          <section className={s.welcomeSection} aria-labelledby="unlocked-title">
            <h2 id="unlocked-title" className={s.welcomeSectionTitle}>Unlocked now</h2>
            <ul className={s.welcomeRows}>
              {unlocked.map((u) => (
                <li key={u} className={s.welcomeRow}>
                  <span className={s.welcomeRowNum}><Image src="/signup/check.svg" alt="" width={16} height={16} /></span>
                  <span className={s.welcomeRowText}>{u}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={s.welcomeSection} aria-labelledby="next-title">
            <h2 id="next-title" className={s.welcomeSectionTitle}>What’s next</h2>
            <ol className={s.welcomeRows}>
              {next.map((n, i) => (
                <li key={n.text} className={s.welcomeRow}>
                  <span className={s.welcomeRowNum}>{i + 1}</span>
                  <span className={s.welcomeRowText}>{n.text}<small>{n.hint}</small></span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className={s.welcomeFooter}>
          <PrimaryButton onClick={() => router.push(`${{ a: '/dashboard', b: '/b/unlocked', c: '/c/unlocked' }[currentFlow()]}?exchange=${ex.id}`)}>Open TradeX</PrimaryButton>
        </div>
      </div>
    </main>
  );
}
