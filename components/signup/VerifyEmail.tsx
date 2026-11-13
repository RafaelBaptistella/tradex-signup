'use client';

/**
 * Flow A · A-03 · Verify email (step 2 of 6). Reused by flow B · B-02 (step 2 of 2; canvas: "Same component as A-03").
 * Based on Figma "2. 2FA" (645:22899 desktop, 645:22608 mobile).
 * Canvas requirements: code input, resend + change email, a tip shown while waiting.
 * Events (tracking brief): signup_step_viewed, email_verification_sent {channel, attempt},
 * twofa_failed {reason}, email_verified {minutes_since_register}, email_change_clicked.
 */
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StepHeader, HelpButton, Lines, PrimaryButton, styles as s } from './parts';
import CodeInput from './CodeInput';
import { SIGNUP_STEPS } from '@/lib/flow';
import { stepProps, track } from '@/lib/track';
import { sendCode, verifyCode } from '@/lib/mockApi';

const RESEND_AFTER = 30;
export const VERIFIED_KEY = 'tx_email_verified';

/** What changes per flow. B-02 is the last signup step: confirming the email opens TradeX (B-03). */
const FLOW = {
  a: { step: 2, total: SIGNUP_STEPS, next: '/about', account: '/account', tip: 'Next we ask three quick questions about your trading, so TradeX shows you the courses and rewards that fit you first.' },
  b: { step: 2, total: 2, next: '/b/dashboard', account: '/b', tip: 'This is the last step. Right after it, TradeX opens and you can look around.' }
} as const;

export default function VerifyEmail({ flow = 'a' }: { flow?: keyof typeof FLOW }) {
  const F = FLOW[flow];
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') || '';
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'wrong' | 'expired' | 'ok'>('idle');
  const [attempt, setAttempt] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_AFTER);
  const openedAt = useRef(Date.now());
  const started = useRef(false);
  // Coming back from A-04 with Back: the email is already confirmed, so no new code is sent.
  const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    track('signup_step_viewed', stepProps('verify_email'));
    let confirmed = false;
    try { confirmed = !!email && sessionStorage.getItem(VERIFIED_KEY) === email; } catch { /* treat as not confirmed */ }
    if (confirmed) { setAlreadyConfirmed(true); return; }
    sendCode(email);
    track('email_verification_sent', { ...stepProps('verify_email'), channel: 'code', attempt: 1 });
  }, [email]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setTimeout(() => setSecondsLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  // After a wrong or expired code the boxes are cleared; put the cursor back in the first one once they are enabled again.
  useEffect(() => {
    if (status === 'wrong' || status === 'expired') document.getElementById('code-0')?.focus();
  }, [status]);

  const check = async (value: string) => {
    setStatus('checking');
    const result = await verifyCode(value);
    if (result === 'ok') {
      setStatus('ok');
      try { sessionStorage.setItem(VERIFIED_KEY, email); } catch { /* Back from A-04 then asks for a code again */ }
      track('email_verified', { ...stepProps('verify_email'), minutes_since_register: Math.round((Date.now() - openedAt.current) / 60000) });
      router.push(F.next);
      return;
    }
    track('twofa_failed', { ...stepProps('verify_email'), reason: result === 'wrong' ? 'wrong_code' : 'expired', attempt });
    setStatus(result);
    setCode('');
    if (result === 'expired') setSecondsLeft(0);
  };

  const resend = () => {
    const next = attempt + 1;
    setAttempt(next); setCode(''); setStatus('idle'); setSecondsLeft(RESEND_AFTER);
    sendCode(email);
    track('email_verification_sent', { ...stepProps('verify_email'), channel: 'code', attempt: next });
    document.getElementById('code-0')?.focus();
  };

  const changeEmail = () => {
    track('email_change_clicked', stepProps('verify_email'));
    router.push(F.account + '?email=' + encodeURIComponent(email));
  };

  const message =
    status === 'wrong' ? 'That code doesn’t match. Check the latest email from TradeX and try again.'
    : status === 'expired' ? 'This code has expired. Send a new one below.'
    : status === 'checking' ? 'Checking your code…'
    : status === 'ok' ? 'Email confirmed.'
    : 'Type the code or paste it. Keep this page open while you check your inbox.';

  if (alreadyConfirmed) {
    return (
      <main className={s.centerPage}>
        <div className={s.glow} aria-hidden><div className={s.noise} /></div>
        <div className={s.grid} aria-hidden />
        <div className={s.centerMain}>
          <StepHeader step={F.step} total={F.total} onBack={changeEmail} />
          <div className={s.centerContent}>
            <div className={s.intro}>
              <h1 className={s.title}>Email confirmed</h1>
              <p className={s.text}><strong>{email}</strong> is confirmed. Nothing to do here.</p>
            </div>
            <div className={s.choiceActions}>
              <PrimaryButton onClick={() => router.push(F.next)}>Continue</PrimaryButton>
              <button type="button" className={s.inlineLink} onClick={changeEmail}>Use a different email</button>
            </div>
          </div>
          <div className={s.spacer} aria-hidden />
        </div>
      </main>
    );
  }

  return (
    <main className={s.centerPage}>
      <div className={s.glow} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={s.centerMain}>
        <StepHeader step={F.step} total={F.total} onBack={changeEmail} />

        <div className={s.centerContent}>
          <div className={s.intro}>
            <h1 className={s.title}>Confirm your email</h1>
          </div>
          <div className={s.centerStack}>
            <div className={s.codeWrap}>
              <p className={s.text}>
                Enter the 6-digit code we sent to {email ? <strong>{email}</strong> : 'your email'}.{' '}
                <button type="button" className={s.inlineLink} onClick={changeEmail}>Change email</button>
              </p>
              <CodeInput
                value={code} error={status === 'wrong' || status === 'expired'} disabled={status === 'checking' || status === 'ok'} describedBy="code-hint"
                onChange={(v) => { setCode(v); if (v && (status === 'wrong' || status === 'expired')) setStatus('idle'); if (v.length === 6) check(v); }}
              />
              <p id="code-hint" className={`${status === 'wrong' || status === 'expired' ? s.error : s.hint} ${status === 'ok' ? s.hintOk : ''}`} role={status === 'wrong' || status === 'expired' ? 'alert' : undefined} aria-live="polite">
                <Lines text={message} />
              </p>
            </div>
            <p className={s.linkRow}>
              <span>Didn’t get it? Check your spam folder, or</span>
              <button type="button" className={s.inlineLink} onClick={resend} disabled={secondsLeft > 0}>
                {secondsLeft > 0 ? `send a new code in ${secondsLeft}s` : 'send a new code'}
              </button>
            </p>
          </div>

          <aside className={s.tip} aria-label="While you wait">
            <p className={s.tipLabel}>While you wait</p>
            <p>{F.tip}</p>
          </aside>
        </div>

        <div className={s.spacer} aria-hidden />
      </div>

      <HelpButton stepKey="verify_email">
        <h2>No code yet?</h2>
        <p>The email comes from TradeX and can take a minute. Check your spam and promotions folders.</p>
        <p>If the address is wrong, use “Change email”. You can ask for a new code every 30 seconds.</p>
      </HelpButton>
    </main>
  );
}
