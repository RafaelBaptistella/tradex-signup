'use client';

/**
 * Flow A · A-12 · Step 3/5 · Verify your identity (KYC).
 * Canvas requirements: plain explanation of KYC and why it's safe; annotated screenshots of the KYC flow per
 * exchange; time estimate plus "Pending is fine, continue"; common problems (photo rejected, wrong document)
 * with fixes (Nov 19, 2026: in the Help drawer, opened from a link under the steps, so the CTA stays alone at the bottom).
 * Events: connect_step_viewed {3: kyc}, connect_substep_checked {item}, connect_help_faq_opened {question}.
 * Prints: Bitunix and Pionex identity verification pages (English, Nov 2026), cropped with some of the page around them.
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StepHeader, PrimaryButton, Lines, Shot, ConnectCta, styles as s } from './parts';
import HelpDrawer, { OPEN_HELP } from './HelpDrawer';
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

export default function VerifyIdentity() {
  const router = useRouter();
  const params = useSearchParams();
  const ex = exchangeById(params.get('exchange')) ?? exchangeById('bitunix')!;
  const [done, setDone] = useState<Record<number, boolean>>({});
  const viewed = useRef(false);
  const P = { step_number: 3, step_name: 'kyc', exchange: ex.id };

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track('connect_step_viewed', P);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const steps = STEPS[ex.id];
  const tick = (i: number) => {
    setDone((d) => {
      const next = { ...d, [i]: !d[i] };
      if (next[i]) track('connect_substep_checked', { ...P, item: `kyc_${i + 1}` });
      return next;
    });
  };

  return (
    <>
      <div className={s.centerMain}>
        <StepHeader step={3} total={CONNECT_STEPS} onBack={() => router.push(`/connect/signup?exchange=${ex.id}`)} />

        <div className={`${s.connectBody} ${s.connectWide}`}>
          <div className={s.connectIntro}>
            <h1 className={s.title}>Verify your identity</h1>
            <p className={s.lead}><Lines text={`Exchanges must check who their users are. ${ex.name} does it with your ID and a quick face check, usually in a few minutes.`} /></p>
            <p className={s.safetyLine}><Image src="/signup/check.svg" alt="" width={14} height={14} />Your documents go to {ex.name}. TradeX never sees your ID.</p>
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

          <button type="button" className={s.linkButton} onClick={() => window.dispatchEvent(new Event(OPEN_HELP))}>Photo rejected or face check failed? See common problems</button>
        </div>
      </div>

      <ConnectCta note={<Lines text={`Pending is fine: if ${ex.name} is still reviewing, continue. Your UID is ready already.`} />}>
        <PrimaryButton onClick={() => router.push(`/connect/uid?exchange=${ex.id}`)}>Continue</PrimaryButton>
      </ConnectCta>

      <HelpDrawer step="connect_kyc" exchange={ex.name} exchangeId={ex.id} />
    </>
  );
}
