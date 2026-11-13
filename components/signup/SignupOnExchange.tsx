'use client';

/**
 * Flow A · A-11 · Step 2/5 · Sign up on the exchange.
 * Canvas requirements: annotated screenshots of each exchange sign-up screen; callout to confirm the referral
 * code field shows the TradeX code; a tick-list the user checks off (email, password, code confirmed);
 * desktop / mobile tabs. Events: connect_step_viewed {2: signup}, connect_substep_checked {item}.
 * Prints: Bitunix English sign-up pages (Nov 2026), cropped to the form.
 */
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StepHeader, PrimaryButton, Callout, Lines, Shot, styles as s } from './parts';
import HelpDrawer from './HelpDrawer';
import { AFFILIATE, REGISTER_PRINT, exchangeById, type ExchangeId, type Print } from '@/lib/exchanges';
import { brand, track } from '@/lib/track';

const CONNECT_STEPS = 5;

type SubStep = { key: string; title: string; text: string; check: string; shot?: Print };

/** The partners' sign-up flows differ: Bitunix asks email → code → password; Pionex asks email, password and code on one form → email code → done. */
function subSteps(ex: ExchangeId, code: string): SubStep[] {
  if (ex === 'pionex') {
    return [
      {
        key: 'form', title: 'Fill in email, password and the code',
        text: `All on one form. Paste ${code} in “Referral code (optional)”, then tap Register.`,
        check: `Email, password and ${code} entered`,
        shot: REGISTER_PRINT.pionex.print
      },
      {
        key: 'email_verified', title: 'Type the code from Pionex',
        text: 'Pionex emails you a verification code. It’s not the same code TradeX sent you earlier.',
        check: 'Code entered and confirmed',
        shot: { desktop: '/signup/pionex/code-desktop.jpg', alt: 'Pionex verification code window', mark: [6, 37, 88, 18] }
      },
      {
        key: 'done', title: 'Look for “Signed up successfully!”',
        text: 'That’s the sign your Pionex account is open.',
        check: 'I see “Signed up successfully!”',
        shot: { desktop: '/signup/pionex/success-desktop.jpg', alt: 'Pionex page saying Signed up successfully', mark: [19, 4.5, 60, 12] }
      }
    ];
  }
  return [
    {
      key: 'email_code', title: 'Enter your email and check the code',
      text: `Use the email you picked for Bitunix. Open “Invitation code (optional)”: it should show ${code}.`,
      check: `Email entered, and ${code} is in the code field`,
      shot: REGISTER_PRINT.bitunix.print
    },
    {
      key: 'email_verified', title: 'Type the 6-digit code from Bitunix',
      text: 'Bitunix emails you a code. It’s not the same code TradeX sent you earlier.',
      check: 'Code entered',
      shot: { desktop: '/signup/bitunix/code-desktop.jpg', alt: 'Bitunix verification code screen with six boxes', mark: [13, 48, 74, 15], masks: [[13.5, 31.5, 37.5, 5.5]] }
    },
    {
      key: 'password', title: 'Set your password',
      text: 'Use 8 to 40 characters, with numbers, upper and lower case letters and a symbol. Then complete the registration.',
      check: 'Password set and registration completed',
      shot: { desktop: '/signup/bitunix/password-desktop.jpg', alt: 'Bitunix set password screen with the password rules', mark: [13, 45, 74, 30] }
    }
  ];
}

export default function SignupOnExchange() {
  const router = useRouter();
  const params = useSearchParams();
  const ex = exchangeById(params.get('exchange')) ?? exchangeById('bitunix')!;
  const [code, setCode] = useState('TRADEXTIM');
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [device, setDevice] = useState<'desktop' | 'phone'>('desktop');
  const viewed = useRef(false);
  const P = { step_number: 2, step_name: 'signup', exchange: ex.id };

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    setCode(AFFILIATE[ex.id].codes[brand()] ?? AFFILIATE[ex.id].codes.tim);
    if (window.matchMedia('(max-width: 1023px)').matches) setDevice('phone');
    track('connect_step_viewed', P);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const steps = subSteps(ex.id, code);
  const allDone = steps.every((st) => done[st.key]);

  const toggle = (key: string) => {
    setDone((d) => {
      const next = { ...d, [key]: !d[key] };
      if (next[key]) track('connect_substep_checked', { ...P, item: key });
      return next;
    });
  };

  return (
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={s.centerMain}>
        <StepHeader step={2} total={CONNECT_STEPS} onBack={() => router.push(`/connect/open?exchange=${ex.id}`)} />

        <div className={`${s.centerContent} ${s.medium}`}>
          <div className={s.intro}>
            <h1 className={s.title}>Sign up on {ex.name}</h1>
            <p className={s.lead}><Lines text={`Three short screens on ${ex.name}. Tick each one here when you’re done.`} /></p>
          </div>

          <div className={s.segmented} role="tablist" aria-label="Device">
            {(['desktop', 'phone'] as const).map((d) => (
              <button key={d} type="button" role="tab" aria-selected={device === d} className={s.segment2} onClick={() => setDevice(d)}>
                {d === 'desktop' ? 'On a computer' : 'On a phone'}
              </button>
            ))}
          </div>

          <ol className={s.subSteps}>
            {steps.map((st, i) => (
              <li key={st.key} className={`${s.subStep} ${done[st.key] ? s.subStepDone : ''}`}>
                <div className={s.subStepHead}>
                  <span className={s.flowStepNum}>{i + 1}</span>
                  <div>
                    <h2 className={s.welcomeCardTitle}>{st.title}</h2>
                    <p className={s.welcomeCardText}><Lines text={st.text} /></p>
                  </div>
                </div>
                {st.shot && (
                  device === 'phone' && st.shot.mobile
                    ? <Shot desktop={st.shot.mobile} alt={st.shot.alt} mark={st.shot.mobileMark} masks={st.shot.mobileMasks} />
                    : <Shot desktop={st.shot.desktop} alt={st.shot.alt} mark={st.shot.mark} masks={st.shot.masks} />
                )}
                {st.shot && device === 'phone' && !st.shot.mobile && <p className={s.hint}>It looks the same on your phone.</p>}
                <label className={s.checkRow}>
                  <input type="checkbox" checked={!!done[st.key]} onChange={() => toggle(st.key)} />
                  <span>{st.check}</span>
                </label>
              </li>
            ))}
          </ol>

          <Callout title={`Check the code before you finish`}>{`If “${REGISTER_PRINT[ex.id].field}” was empty, the account isn’t linked to TradeX. Go back to ${ex.name}’s first screen and paste ${code}.`}</Callout>

          <div className={s.choiceActions}>
            <PrimaryButton onClick={() => router.push(`/connect/kyc?exchange=${ex.id}`)} disabled={!allDone}>I’ve signed up on {ex.name}</PrimaryButton>
            <p className={s.hint}>{allDone ? 'Next: verify your identity.' : `Tick the ${steps.filter((st) => !done[st.key]).length} remaining step${steps.filter((st) => !done[st.key]).length === 1 ? '' : 's'} to continue.`}</p>
          </div>
        </div>

        <div className={s.spacer} aria-hidden />
      </div>

      <HelpDrawer step="connect_signup" exchange={ex.name} exchangeId={ex.id} />
    </main>
  );
}
