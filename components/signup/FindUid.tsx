'use client';

/**
 * Flow A · A-13 · Step 4/5 · Find your UID.
 * Canvas requirements: annotated screenshot pointing to the UID, per exchange; desktop / mobile tabs;
 * short GIF of the clicks; what a UID looks like. Event: connect_step_viewed {4: find_uid}.
 * Prints: Bitunix and Pionex profile menus (English, Nov 2026). Emails and the Pionex UID digits are blurred.
 */
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StepHeader, PrimaryButton, Lines, Shot, styles as s } from './parts';
import HelpDrawer from './HelpDrawer';
import { exchangeById, type ExchangeId, type Print } from '@/lib/exchanges';
import { track } from '@/lib/track';

const CONNECT_STEPS = 5;

const GUIDE: Record<ExchangeId, { steps: { title: string; text: string }[]; print: Print }> = {
  bitunix: {
    steps: [
      { title: 'Open your profile menu', text: 'Click your profile picture at the top right of Bitunix.' },
      { title: 'Copy your UID', text: 'It’s right under your email. Tap the copy icon next to it. The eye icon shows the number.' }
    ],
    print: { desktop: '/signup/bitunix/uid.jpg', alt: 'Bitunix profile menu with the UID under the email, next to the copy and eye icons', mark: [25, 68, 41, 15], masks: [[26, 57.5, 55, 12]] }
  },
  pionex: {
    steps: [
      { title: 'Open your profile menu', text: 'Click your profile picture at the top right of Pionex.' },
      { title: 'Copy your UID', text: 'It’s right under your email, after “UID:”. Tap the copy icon next to it.' }
    ],
    print: { desktop: '/signup/pionex/uid.jpg', alt: 'Pionex profile menu with the UID under the email, next to the copy icon', mark: [16.5, 68, 31, 16], masks: [[17.5, 54.5, 36, 13], [24.6, 71.5, 17.4, 10]] }
  }
};

export default function FindUid() {
  const router = useRouter();
  const params = useSearchParams();
  const ex = exchangeById(params.get('exchange')) ?? exchangeById('bitunix')!;
  const viewed = useRef(false);
  const guide = GUIDE[ex.id];

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track('connect_step_viewed', { step_number: 4, step_name: 'find_uid', exchange: ex.id });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={s.centerMain}>
        <StepHeader step={4} total={CONNECT_STEPS} onBack={() => router.push(`/connect/kyc?exchange=${ex.id}`)} />

        <div className={`${s.centerContent} ${s.medium}`}>
          <div className={s.intro}>
            <h1 className={s.title}>Find your UID</h1>
            <p className={s.lead}><Lines text={`Your UID is your account number on ${ex.name}. You’ll paste it on the next screen.`} /></p>
          </div>

          <div className={s.subStep}>
            <ol className={s.uidSteps}>
              {guide.steps.map((st, i) => (
                <li key={st.title} className={s.subStepHead}>
                  <span className={s.flowStepNum}>{i + 1}</span>
                  <div>
                    <h2 className={s.welcomeCardTitle}>{st.title}</h2>
                    <p className={s.welcomeCardText}><Lines text={st.text} /></p>
                  </div>
                </li>
              ))}
            </ol>
            <Shot {...guide.print} />
          </div>

          <section className={s.planBlock} aria-labelledby="uid-format">
            <h2 id="uid-format" className={s.questionLabel}>What a UID looks like</h2>
            <div className={s.planCard}>
              <span className={s.refCode}>123456789</span>
              <p className={s.hint}><Lines text="Only numbers. It’s not your email, and not the TradeX code." /></p>
            </div>
          </section>

          <div className={s.choiceActions}>
            <PrimaryButton onClick={() => router.push(`/connect/paste?exchange=${ex.id}`)}>I’ve copied my UID</PrimaryButton>
            <p className={s.hint}>Next: paste it here.</p>
          </div>
        </div>

        <div className={s.spacer} aria-hidden />
      </div>

      <HelpDrawer step="connect_find_uid" exchange={ex.name} exchangeId={ex.id} />
    </main>
  );
}
