'use client';

/**
 * Flow A · A-02 · Create account (step 1 of 6). Reused by flow B · B-01 (step 1 of 2, entry screen).
 * Based on Figma "1. Sign Up" (645:22523 desktop, 645:22577 mobile).
 * Canvas requirements: email, password and terms checkbox in one step; side panel repeating
 * the main benefit; progress bar. States: default, email taken, weak password.
 * Events: signup_step_viewed {account}, register_submitted {method}, signup_field_error.
 * B-01 (canvas): same as control minus the exchange step; email, password, terms; progress of 2 steps.
 * B-01 is the first screen of flow B, so it also fires register_page_viewed and reads ?brand=.
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StepHeader, TextField, PrimaryButton, HelpButton, SignupVisual, styles as s } from './parts';
import { SIGNUP_STEPS } from '@/lib/flow';
import { setFlow, rememberBrand, stepProps, track } from '@/lib/track';
import { register } from '@/lib/mockApi';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RULES = [
  { key: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { key: 'number', label: 'A number', test: (p: string) => /\d/.test(p) },
  { key: 'case', label: 'Upper and lower case letters', test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) }
];

/**
 * What changes per flow. A starts after the A-01 welcome; B and C have no welcome, so B-01 and C-01 are the entry.
 * C-01 (canvas): same as B-01; only the lead and "What happens next" talk about the 7-day free trial.
 */
const FLOW = {
  a: { step: 1, total: SIGNUP_STEPS, back: '/', next: '/verify', entry: false, lead: 'Free, and it takes less than a minute.', after: null },
  b: { step: 1, total: 2, back: 'https://www.trade-x.de', next: '/b/verify', entry: true, lead: 'Free. Two short steps, then you’re in TradeX.',
    after: ['You’re in.', 'Connect an exchange account opened through TradeX to unlock cashback.'] },
  c: { step: 1, total: 2, back: 'https://www.trade-x.de', next: '/c/verify', entry: true, lead: 'Two short steps, then 7 free days.',
    after: ['Explore TradeX free for 7 days.', 'Connect an exchange account opened through TradeX to keep it all unlocked.'] }
} as const;

type Errors = { email?: string; password?: string; terms?: string };

export default function CreateAccount({ flow = 'a' }: { flow?: keyof typeof FLOW }) {
  const F = FLOW[flow];
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(() => params.get('email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const viewed = useRef(false);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    if (F.entry) {
      setFlow(flow);
      rememberBrand(params.get('brand'));
      track('register_page_viewed', { ...stepProps('account'), utm_source: params.get('utm_source') || undefined, utm_campaign: params.get('utm_campaign') || undefined, ref_link: params.get('ref') || undefined });
    }
    track('signup_step_viewed', stepProps('account'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fieldError = (field: string, error_code: string) => track('signup_field_error', { ...stepProps('account'), field, error_code });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!EMAIL.test(email.trim())) { next.email = 'Enter an email address like name@example.com.'; fieldError('email', email ? 'invalid_format' : 'missing'); }
    if (!RULES.every((r) => r.test(password))) { next.password = 'Choose a stronger password: it needs everything in the list below.'; fieldError('password', password ? 'weak' : 'missing'); }
    if (!terms) { next.terms = 'Please accept the terms to continue.'; fieldError('terms', 'not_accepted'); }
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    track('register_submitted', { ...stepProps('account'), method: 'email' });
    const result = await register(email, password);
    if (result === 'email_taken') {
      setBusy(false);
      setErrors({ email: 'This email already has a TradeX account.' });
      fieldError('email', 'taken');
      return;
    }
    // A new account starts fresh: forget what earlier test runs in this tab marked as seen or done
    // (confirmed email, B-03 modal, A-18 tour and checklist, profile, UID).
    try { ['tx_email_verified', 'tx_softlock_seen', 'tx_tour_done', 'tx_checklist', 'tx_profile', 'tx_uid', 'tx_trial_start', 'tx_lastday_seen', 'tx_trial_used'].forEach((k) => sessionStorage.removeItem(k)); } catch { /* nothing saved */ }
    router.push(F.next + '?email=' + encodeURIComponent(email.trim()));
  };

  return (
    <main className={s.page}>
      <div className={s.main}>
        {F.back.startsWith('http') ? <StepHeader step={F.step} total={F.total} backHref={F.back} /> : <StepHeader step={F.step} total={F.total} onBack={() => router.push(F.back)} />}

        <form className={s.content} onSubmit={submit} noValidate>
          <Image src="/signup/logo-tradex.svg" alt="TradeX" width={98} height={24} priority />

          <div className={s.block40}>
            <div className={s.intro}>
              <h1 className={s.title}>Create your account</h1>
              <p className={s.lead}>{F.lead}</p>
            </div>
            <div className={s.form}>
              <TextField
                id="email" label="Email" type="email" inputMode="email" autoComplete="email" placeholder="example@gmail.com"
                value={email} error={errors.email} onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined })); }}
              />
              {errors.email === 'This email already has a TradeX account.' && (
                <p className={s.fieldNote}><a className={s.link} href="/login">Log in instead</a></p>
              )}

              <div className={s.field}>
                <label htmlFor="password" className={s.label}>Password</label>
                <div className={s.passwordWrap}>
                  <input
                    id="password" className={`${s.input} ${errors.password ? s.inputError : ''}`} type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password" placeholder="Create a password" value={password}
                    aria-invalid={Boolean(errors.password)} aria-describedby="password-rules"
                    onChange={(e) => { setPassword(e.target.value); setErrors((x) => ({ ...x, password: undefined })); }}
                  />
                  <button type="button" className={s.passwordToggle} onClick={() => setShowPassword((v) => !v)} aria-pressed={showPassword}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <p className={s.error} role="alert">{errors.password}</p>}
                <ul id="password-rules" className={s.rules}>
                  {RULES.map((r) => {
                    const ok = r.test(password);
                    return <li key={r.key} className={ok ? s.ruleOk : ''}><span aria-hidden>{ok ? '✓' : '·'}</span>{r.label}<span className="sr-only">{ok ? ' (done)' : ' (missing)'}</span></li>;
                  })}
                </ul>
              </div>

              <div>
                <label className={s.checkRow}>
                  <input type="checkbox" checked={terms} onChange={(e) => { setTerms(e.target.checked); setErrors((x) => ({ ...x, terms: undefined })); }} aria-invalid={Boolean(errors.terms)} />
                  <span>I agree to the <a className={s.link} href="/terms" target="_blank" rel="noreferrer">Terms</a> and the <a className={s.link} href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</span>
                </label>
                {errors.terms && <p className={s.error} role="alert">{errors.terms}</p>}
              </div>

              <PrimaryButton type="submit" disabled={busy}>{busy ? 'Creating your account…' : 'Create account'}</PrimaryButton>
            </div>
          </div>

          <p className={s.linkRow}><span>Already have an account?</span><a className={s.link} href="/login">Log in</a></p>

          {F.after && (
            <section className={s.process} aria-labelledby="next-steps">
              <h2 id="next-steps" className={s.processLabel}>What happens next</h2>
              <ol className={s.processList}>
                <li className={s.processItem}><b>1</b><span>Create your account <em>· now</em></span></li>
                <li className={s.processItem}><b>2</b><span>Confirm your email with a 6‑digit code</span></li>
                <li className={s.processItem}><b>3</b><span>{F.after.map((line, i) => <span key={i} style={{ display: 'block' }}>{line}</span>)}</span></li>
              </ol>
            </section>
          )}
        </form>

        <div className={s.spacer} aria-hidden />
      </div>

      <SignupVisual>
        <aside className={s.sideBenefit} aria-label="Main benefit">
          <p className={s.sideBenefitKicker}>Cashback on every trade</p>
          <p className={s.sideBenefitText}>Trade on Bitunix or Pionex through TradeX and part of your fees comes back to you every month.</p>
        </aside>
      </SignupVisual>

      <HelpButton stepKey="account">
        <h2>Need a hand?</h2>
        <p>Use an email you can open now: we send a 6-digit code to it in the next step.</p>
        <p>If this email already has an account, log in instead.</p>
        {/* Support contact: add the real address or chat link here. */}
        <p>Still stuck? Contact the TradeX support team.</p>
      </HelpButton>
    </main>
  );
}
