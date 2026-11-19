'use client';

/**
 * Flow A · A-12 · Step 3/5 · Verify your identity (KYC).
 * Canvas requirements: plain explanation of KYC and why it's safe; annotated screenshots of the KYC flow per
 * exchange; time estimate plus "Pending is fine, continue"; common problems (photo rejected, wrong document)
 * with fixes. Events: connect_step_viewed {3: kyc}, kyc_help_opened {problem}.
 * Prints: Bitunix and Pionex identity verification pages (English, Nov 2026), cropped with some of the page around them.
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StepHeader, PrimaryButton, Callout, Lines, Shot, styles as s } from './parts';
import HelpDrawer from './HelpDrawer';
import { exchangeById, type ExchangeId, type Print } from '@/lib/exchanges';
import { track } from '@/lib/track';

const CONNECT_STEPS = 5;

/** check: the tick under each card (Nov 19, 2026), same pattern as A-11. Ticks don't block Continue: a pending check is fine. */
type KycStep = { title: string; text: string; check: string; shot?: Print };

const STEPS: Record<ExchangeId, KycStep[]> = {
  bitunix: [
    { title: 'Open Identity Verification', text: 'Open your account menu and choose Verification. Then tap “Check now”.', check: 'Verification page open', shot: { desktop: '/signup/bitunix/kyc-start.jpg', alt: 'Bitunix identity verification page with the Check now button', mark: [27.3, 70.3, 15.3, 6.1] } },
    { title: 'Accept and start', text: 'Tick both boxes, then tap “Check now”. Bitunix asks for a photo of your ID and a quick face check.', check: 'Boxes ticked and check started', shot: { desktop: '/signup/bitunix/kyc-consent.jpg', alt: 'Bitunix screen with the two consent boxes and the Check now button', mark: [23.1, 51.4, 53.8, 21.2] } },
    { title: 'Choose the country of your ID', text: 'Pick the country that issued your document. Then follow the photo and face check on screen.', check: 'ID photo and face check sent', shot: { desktop: '/signup/bitunix/kyc-country.jpg', alt: 'Bitunix screen asking for the issuing country of the identity document', mark: [11.9, 40.9, 76.2, 13.1] } }
  ],
  pionex: [
    { title: 'Open KYC and tap Verify', text: 'Open your profile menu and choose KYC. Then tap “Verify”.', check: 'Verification page open', shot: { desktop: '/signup/pionex/kyc-start.jpg', alt: 'Pionex identity verification page with the Verify button', mark: [57.6, 27.2, 11.2, 7.7] } },
    { title: 'Level 1: country and full name', text: 'Pick the country you live in, add your full name and submit.', check: 'Level 1 submitted', shot: { desktop: '/signup/pionex/kyc-lv1.jpg', alt: 'Pionex LV.1 verification asking for the residential country', mark: [19, 25.8, 62, 25.8] } },
    { title: 'Level 2: ID and face check', text: 'For higher limits, Pionex asks for a government-issued ID and a face check. Use “Click here to start LV.2 verification”.', check: 'Level 2 sent, or skipped for now' }
  ]
};

const PROBLEMS = (ex: ExchangeId, name: string): { key: string; q: string; a: string }[] => [
  { key: 'photo_rejected', q: 'My photo was rejected', a: 'Take it again in good light, with all four corners of the ID in the frame and no glare or fingers on it.' },
  { key: 'wrong_document', q: 'It says my document is wrong', a: 'Use a valid ID card or passport, and pick the country that issued it, not the one you live in.' },
  { key: 'face_check', q: 'The face check failed', a: 'Look straight at the camera, remove glasses or a hat, and make sure your face is well lit.' },
  // Bitunix states on its verification page that one identity can verify only one account. Not confirmed for Pionex.
  ...(ex === 'bitunix' ? [{ key: 'identity_used', q: `My ID is already verified on another ${name} account`, a: `${name} verifies one account per identity. Contact TradeX support before you continue, so we can help you with the next step.` }] : [])
];

export default function VerifyIdentity() {
  const router = useRouter();
  const params = useSearchParams();
  const ex = exchangeById(params.get('exchange')) ?? exchangeById('bitunix')!;
  const [open, setOpen] = useState<number | null>(null);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const viewed = useRef(false);
  const P = { step_number: 3, step_name: 'kyc', exchange: ex.id };

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track('connect_step_viewed', P);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const problems = PROBLEMS(ex.id, ex.name);
  const steps = STEPS[ex.id];
  const tick = (i: number) => {
    setDone((d) => {
      const next = { ...d, [i]: !d[i] };
      if (next[i]) track('connect_substep_checked', { ...P, item: `kyc_${i + 1}` });
      return next;
    });
  };
  const toggle = (i: number) => {
    if (open !== i) track('kyc_help_opened', { ...P, problem: problems[i].key });
    setOpen(open === i ? null : i);
  };

  return (
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={s.centerMain}>
        <StepHeader step={3} total={CONNECT_STEPS} onBack={() => router.push(`/connect/signup?exchange=${ex.id}`)} />

        <div className={`${s.centerContent} ${s.stepsPage}`}>
          <div className={`${s.stepsHeader} ${s.stepsHeaderWide}`}>
            <div className={s.intro}>
              <p className={s.timeBadge}><Image src="/signup/icons/timer.svg" alt="" width={16} height={16} />Usually a few minutes</p>
              <h1 className={s.title}>Verify your identity</h1>
              <p className={s.lead}><Lines text={`Exchanges must check who their users are. ${ex.name} does it with your ID and a quick face check.`} /></p>
            </div>
            <Callout title="Your documents stay with the exchange">{`You send them to ${ex.name}, not to TradeX. TradeX never sees your ID. If ${ex.name} says your check is being reviewed, you can continue.`}</Callout>
          </div>

          <ol className={`${s.subSteps} ${s.stepCols}`} style={{ '--cols': steps.length } as React.CSSProperties}>
            {steps.map((st, i) => (
              <li key={st.title} className={`${s.subStep} ${done[i] ? s.subStepDone : ''}`}>
                <div className={s.subStepHead}>
                  <span className={s.flowStepNum}>{i + 1}</span>
                  <div>
                    <h2 className={s.welcomeCardTitle}>{st.title}</h2>
                    <p className={s.welcomeCardText}><Lines text={st.text} /></p>
                  </div>
                </div>
                <div className={s.stepBody}>
                  {st.shot && <div className={s.stepShot}><Shot {...st.shot} /></div>}
                  <label className={s.checkRow}>
                    <input type="checkbox" checked={!!done[i]} onChange={() => tick(i)} />
                    <span>{st.check}</span>
                  </label>
                </div>
              </li>
            ))}
          </ol>

          <div className={`${s.stepsFooter} ${s.stepsFooterTop}`}>
            <section className={`${s.faq} ${s.faqCard}`} aria-labelledby="problems-title">
              <h2 id="problems-title" className={s.faqCardTitle}>Common problems</h2>
              <div className={s.faqCardItems}>
                {problems.map((p, i) => (
                  <div key={p.key} className={s.faqItem}>
                    <button type="button" className={s.faqQ} aria-expanded={open === i} aria-controls={`kyc-${i}`} onClick={() => toggle(i)}>
                      {p.q}<span aria-hidden className={s.faqIcon}>{open === i ? '−' : '+'}</span>
                    </button>
                    {open === i && <p id={`kyc-${i}`} className={s.faqA}>{p.a}</p>}
                  </div>
                ))}
              </div>
            </section>

            <div className={s.choiceActions}>
              <PrimaryButton onClick={() => router.push(`/connect/uid?exchange=${ex.id}`)}>Continue</PrimaryButton>
              <p className={s.hint}>Next: find your UID.</p>
            </div>
          </div>
        </div>

        <div className={s.spacer} aria-hidden />
      </div>

      <HelpDrawer step="connect_kyc" exchange={ex.name} exchangeId={ex.id} />
    </main>
  );
}
