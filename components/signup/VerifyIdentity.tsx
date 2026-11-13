'use client';

/**
 * Flow A · A-12 · Step 3/5 · Verify your identity (KYC).
 * Canvas requirements: plain explanation of KYC and why it's safe; annotated screenshots of the KYC flow per
 * exchange; time estimate plus "Pending is fine, continue"; common problems (photo rejected, wrong document)
 * with fixes. Events: connect_step_viewed {3: kyc}, kyc_help_opened {problem}.
 * Prints: Bitunix and Pionex identity verification pages (English, Nov 2026), cropped.
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StepHeader, PrimaryButton, Callout, Lines, Shot, styles as s } from './parts';
import HelpDrawer from './HelpDrawer';
import { exchangeById, type ExchangeId, type Print } from '@/lib/exchanges';
import { track } from '@/lib/track';

const CONNECT_STEPS = 5;

type KycStep = { title: string; text: string; shot?: Print };

const STEPS: Record<ExchangeId, KycStep[]> = {
  bitunix: [
    { title: 'Open Identity Verification', text: 'Open your account menu and choose Verification. Then tap “Check now”.', shot: { desktop: '/signup/bitunix/kyc-start.jpg', alt: 'Bitunix identity verification page with the Check now button', mark: [3, 86.5, 19, 8.5] } },
    { title: 'Accept and start', text: 'Tick both boxes, then tap “Check now”. Bitunix asks for a photo of your ID and a quick face check.', shot: { desktop: '/signup/bitunix/kyc-consent.jpg', alt: 'Bitunix screen with the two consent boxes and the Check now button', mark: [7, 66.5, 86, 26] } },
    { title: 'Choose the country of your ID', text: 'Pick the country that issued your document. Then follow the photo and face check on screen.', shot: { desktop: '/signup/bitunix/kyc-country.jpg', alt: 'Bitunix screen asking for the issuing country of the identity document', mark: [0.5, 46.5, 99, 23] } }
  ],
  pionex: [
    { title: 'Open KYC and tap Verify', text: 'Open your profile menu and choose KYC. Then tap “Verify”.', shot: { desktop: '/signup/pionex/kyc-start.jpg', alt: 'Pionex identity verification page with the Verify button', mark: [77, 15.8, 14.5, 6.8] } },
    { title: 'Level 1: country and full name', text: 'Pick the country you live in, add your full name and submit.', shot: { desktop: '/signup/pionex/kyc-lv1.jpg', alt: 'Pionex LV.1 verification asking for the residential country', mark: [3.5, 25.5, 93, 55] } },
    { title: 'Level 2: ID and face check', text: 'For higher limits, Pionex asks for a government-issued ID and a face check. Use “Click here to start LV.2 verification”.' }
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
  const viewed = useRef(false);
  const P = { step_number: 3, step_name: 'kyc', exchange: ex.id };

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track('connect_step_viewed', P);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const problems = PROBLEMS(ex.id, ex.name);
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

        <div className={`${s.centerContent} ${s.medium}`}>
          <div className={s.intro}>
            <p className={s.timeBadge}><Image src="/signup/icons/timer.svg" alt="" width={16} height={16} />Usually a few minutes</p>
            <h1 className={s.title}>Verify your identity</h1>
            <p className={s.lead}><Lines text={`Exchanges must check who their users are. ${ex.name} does it with your ID and a quick face check.`} /></p>
          </div>

          <Callout title="Your documents stay with the exchange">{`You send them to ${ex.name}, not to TradeX. TradeX never sees your ID.`}</Callout>

          <ol className={s.subSteps}>
            {STEPS[ex.id].map((st, i) => (
              <li key={st.title} className={s.subStep}>
                <div className={s.subStepHead}>
                  <span className={s.flowStepNum}>{i + 1}</span>
                  <div>
                    <h2 className={s.welcomeCardTitle}>{st.title}</h2>
                    <p className={s.welcomeCardText}><Lines text={st.text} /></p>
                  </div>
                </div>
                {st.shot && <Shot {...st.shot} />}
              </li>
            ))}
          </ol>

          <Callout title="Pending is fine">{`If ${ex.name} says your verification is being reviewed, you can continue. Your UID is ready already.`}</Callout>

          <section className={s.planBlock} aria-labelledby="problems-title">
            <h2 id="problems-title" className={s.questionLabel}>Common problems</h2>
            <div className={s.faq}>
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

        <div className={s.spacer} aria-hidden />
      </div>

      <HelpDrawer step="connect_kyc" exchange={ex.name} exchangeId={ex.id} />
    </main>
  );
}
