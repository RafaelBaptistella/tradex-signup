'use client';

/**
 * Flow C · C-11 · Reactivation landing. Where every C-10 email link lands.
 * Canvas requirements: email click lands here, straight into connect. Welcome back + one CTA; login if session expired.
 * Paywall-style card on the mountain background (outside the platform), with the two exchanges.
 * Two states: signed in (default) and session expired (?session=expired). TradeX has no passwords:
 * login is email → 6-digit code (2FA), then the same card.
 * Events: reactivation_landing_viewed {email, session}; reactivation_login_submitted; exchange_connect_started {source: reactivation}.
 */
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Paywall from '@/components/paywall/Paywall';
import p from '@/components/paywall/paywall.module.css';
import { TextField, styles as s } from './parts';
import CodeInput from './CodeInput';
import { connectPath } from '@/lib/exchanges';
import { sendCode, verifyCode } from '@/lib/mockApi';
import { setFlow, track } from '@/lib/track';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function WelcomeBack() {
  const router = useRouter();
  const params = useSearchParams();
  const emailId = params.get('email') || 'direct';
  const expired = params.get('session') === 'expired';
  const [signedIn, setSignedIn] = useState(!expired);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const viewed = useRef('');

  // The navigator switches between the two states by query, so follow it.
  useEffect(() => { setSignedIn(!expired); setStep('email'); setCode(''); setError(''); }, [expired]);

  useEffect(() => {
    const key = `${emailId}-${expired}`;
    if (viewed.current === key) return;
    viewed.current = key;
    setFlow('c');
    track('reactivation_landing_viewed', { email: emailId, session: expired ? 'expired' : 'active' });
  }, [emailId, expired]);

  const send = async () => {
    if (!EMAIL.test(email.trim())) { setError('Enter the email you signed up with.'); return; }
    setBusy(true); setError('');
    await sendCode(email);
    setBusy(false); setStep('code');
  };

  const login = async () => {
    if (code.length !== 6) { setError('Enter the 6-digit code from your email.'); return; }
    setBusy(true); setError('');
    const r = await verifyCode(code);
    setBusy(false);
    if (r !== 'ok') { setError(r === 'expired' ? 'This code has expired. Send a new one.' : 'That code isn’t right. Check the email and try again.'); return; }
    track('reactivation_login_submitted', { email: emailId });
    setSignedIn(true);
  };

  return (
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={p.page}>
        {signedIn ? (
          <Paywall
            variant="page" id="back" label="Welcome back" art="gem"
            title="Welcome back"
            lead="Everything you had is still here. Connect an exchange and TradeX opens again."
            sections={[{ title: 'Saved for you', items: [
              { icon: 'data-view', text: 'Your account and settings', state: 'open' },
              { icon: 'education', text: 'What you started during the trial', state: 'open' },
              { icon: 'forum', text: 'Your place in the community', state: 'open' }
            ] }]}
            exchanges
            primary={{ label: (n) => `Connect ${n}`, onClick: (ex) => { track('exchange_connect_started', { source: 'reactivation', email: emailId, exchange: ex }); router.push(connectPath('c', ex)); } }}
            footer={<span>Takes about 10 minutes. The leaderboard and ranks unlock too.</span>}
          />
        ) : (
          <Paywall
            variant="page" id="back-login" label="Welcome back" art="gem"
            title="Log in to pick up where you left off"
            lead={step === 'email'
              ? 'Your session has expired. We email you a code, then take you to the connect step.'
              : `We sent a 6-digit code to ${email}. Enter it to continue.`}
            primary={{ label: busy ? (step === 'email' ? 'Sending…' : 'Logging in…') : (step === 'email' ? 'Email me a code' : 'Log in and continue'), onClick: () => { if (!busy) void (step === 'email' ? send() : login()); } }}
            secondary={step === 'code' ? { label: 'Use another email', onClick: () => { setStep('email'); setCode(''); setError(''); } } : undefined}
            footer={<span>No password needed. You always log in with a code we email you.</span>}
          >
            <form className={p.form} onSubmit={(e) => { e.preventDefault(); void (step === 'email' ? send() : login()); }} noValidate>
              {step === 'email'
                ? <TextField id="back-email" label="Email" type="email" inputMode="email" autoComplete="email" placeholder="example@gmail.com"
                    value={email} error={error || undefined} onChange={(e) => { setEmail(e.target.value); setError(''); }} />
                : <>
                    <CodeInput value={code} onChange={(v) => { setCode(v); setError(''); }} error={Boolean(error)} disabled={busy} />
                    {error && <p className={s.error} role="alert">{error}</p>}
                  </>}
            </form>
          </Paywall>
        )}
      </div>
    </main>
  );
}
