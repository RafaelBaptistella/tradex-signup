'use client';

/**
 * Flow A · A-09 · Before you start · checklist (connect step 0 of 5).
 * Canvas requirements: "Takes about 10 minutes"; what you need (ID or passport, phone, an email not used
 * on this exchange); overview of the 5 steps ahead (mini map); "We save your progress, you can stop any time";
 * CTA "I'm ready". Event: connect_step_viewed {0: prepare}.
 * Nov 19, 2026: branded with the chosen exchange ("Connecting Pionex account", exchange colour), one screen, no scroll.
 * Icons from the Figma icon library (12:339): Identification, Mobile--check, Email.
 */
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useEU } from '@/lib/compliance';
import { useRouter, useSearchParams } from 'next/navigation';
import { StepHeader, PrimaryButton, ConnectCta, Lines, styles as s } from './parts';
import HelpDrawer from './HelpDrawer';
import { exchangeById } from '@/lib/exchanges';
import { track } from '@/lib/track';

const CONNECT_STEPS = 5;

export default function BeforeYouStart() {
  const router = useRouter();
  const eu = useEU();
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
    { icon: 'identification', title: 'Your ID card or passport', text: eu ? `${ex.name} checks who you are, as the law requires.` : `${ex.name} checks who you are, as every regulated exchange must.` },
    { icon: 'mobile-check', title: 'Your phone', text: 'To take photos of your ID and to receive codes.' },
    { icon: 'email', title: `An email you haven’t used on ${ex.name}`, text: fresh ? `Your current ${ex.name} account already uses your usual email.` : `${ex.name} sends a code to it.` }
  ];

  const steps = [`Open ${ex.name} through TradeX`, `Sign up on ${ex.name}`, 'Verify your identity', 'Find your UID', 'Paste your UID here'];

  return (
    <>
      <div className={s.centerMain}>
        <StepHeader step={0} total={CONNECT_STEPS} onBack={() => router.push('/exchange')} />

        <div className={s.connectBody}>
          <div className={s.connectIntro}>
            <p className={s.exPill}>
              <span className={s.exPillLogo}><Image src={ex.logo.src} alt="" width={ex.logo.width} height={ex.logo.height} /></span>
              Connecting {ex.name} account
            </p>
            <h1 className={s.title}>Before you start</h1>
            <p className={s.lead}><Lines text={`It takes about 10 minutes. Have these at hand.`} /></p>
          </div>

          <ul className={s.needGrid}>
            {needs.map((n) => (
              <li key={n.icon} className={s.welcomeCard}>
                <span className={s.iconTile}><Image src={`/signup/icons/${n.icon}.svg`} alt="" width={20} height={20} /></span>
                <div>
                  <h2 className={s.welcomeCardTitle}>{n.title}</h2>
                  <p className={s.welcomeCardText}>{n.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <h2 className={s.blockLabel}>The 5 steps ahead</h2>
          <ol className={`${s.stepStrip} ${s.planCard}`} aria-label="The 5 steps ahead">
            {steps.map((t, i) => <li key={t} aria-current={i === 0 ? 'step' : undefined}>{t}</li>)}
          </ol>
        </div>
      </div>

      <ConnectCta note={<Lines text="We save your progress. You can stop at any step." />}>
        <PrimaryButton onClick={() => router.push(`/connect/open?exchange=${ex.id}`)}>I’m ready</PrimaryButton>
      </ConnectCta>

      <HelpDrawer step="connect_prepare" exchange={ex.name} exchangeId={ex.id} />
    </>
  );
}
