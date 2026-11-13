'use client';

/**
 * Flow A · A-09 · Before you start · checklist (connect step 0 of 5).
 * Canvas requirements: "Takes about 10 minutes"; what you need (ID or passport, phone, an email not used
 * on this exchange); overview of the 5 steps ahead (mini map); "We save your progress, you can stop any time";
 * CTA "I'm ready". Event: connect_step_viewed {0: prepare}.
 * Icons from the Figma icon library (12:339): Timer, Identification, Mobile--check, Email.
 */
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StepHeader, PrimaryButton, Callout, styles as s } from './parts';
import HelpDrawer from './HelpDrawer';
import { exchangeById } from '@/lib/exchanges';
import { track } from '@/lib/track';

const CONNECT_STEPS = 5;

export default function BeforeYouStart() {
  const router = useRouter();
  const params = useSearchParams();
  const ex = exchangeById(params.get('exchange')) ?? exchangeById('bitunix')!;
  const fresh = params.get('fresh') === '1';
  const viewed = useRef(false);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track('connect_step_viewed', { step_number: 0, step_name: 'prepare', exchange: ex.id, fresh_account: fresh });
  }, [ex.id, fresh]);

  const needs = [
    { icon: 'identification', title: 'Your ID card or passport', text: `${ex.name} checks who you are, as every regulated exchange must.` },
    { icon: 'mobile-check', title: 'Your phone', text: 'To take photos of your ID and to receive codes.' },
    { icon: 'email', title: `An email you haven’t used on ${ex.name}`, text: fresh ? `Your current ${ex.name} account already uses your usual email, so pick another one.` : 'Any address you can open now: the exchange sends a code to it.' }
  ];

  const steps = [
    `Open ${ex.name} through TradeX`,
    `Sign up on ${ex.name}`,
    'Verify your identity',
    'Find your UID',
    'Paste your UID here'
  ];

  return (
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={s.centerMain}>
        <StepHeader step={0} total={CONNECT_STEPS} onBack={() => router.push('/exchange')} />

        <div className={`${s.centerContent} ${s.medium}`}>
          <div className={s.intro}>
            <p className={s.timeBadge}><Image src="/signup/icons/timer.svg" alt="" width={16} height={16} />About 10 minutes</p>
            <h1 className={s.title}>Before you start</h1>
            <p className={s.lead}>Opening your {ex.name} account goes smoothly when you have these at hand.</p>
          </div>

          <section className={s.planBlock} aria-labelledby="needs-title">
            <h2 id="needs-title" className={s.questionLabel}>What you need</h2>
            <ul className={s.planList}>
              {needs.map((n) => (
                <li key={n.icon} className={`${s.welcomeCard} ${s.iconRow}`}>
                  <span className={s.iconTile}><Image src={`/signup/icons/${n.icon}.svg`} alt="" width={20} height={20} /></span>
                  <div>
                    <h3 className={s.welcomeCardTitle}>{n.title}</h3>
                    <p className={s.welcomeCardText}>{n.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className={s.planBlock} aria-labelledby="steps-title">
            <h2 id="steps-title" className={s.questionLabel}>The 5 steps ahead</h2>
            <div className={s.planCard}>
              <ol className={s.path}>
                {steps.map((t, i) => (
                  <li key={t} className={i === 0 ? s.pathOn : ''} aria-current={i === 0 ? 'step' : undefined}>
                    <span className={s.pathMark} aria-hidden />
                    <span className={s.unlockAt}>Step {i + 1}</span>
                    <span className={s.pathText}>{t}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <Callout title="We save your progress">You can stop at any step and pick up right where you left off.</Callout>

          <div className={s.choiceActions}>
            <PrimaryButton onClick={() => router.push(`/connect/open?exchange=${ex.id}`)}>I’m ready</PrimaryButton>
          </div>
        </div>

        <div className={s.spacer} aria-hidden />
      </div>

      <HelpDrawer step="connect_prepare" exchange={ex.name} exchangeId={ex.id} />
    </main>
  );
}
