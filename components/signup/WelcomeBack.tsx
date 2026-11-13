'use client';

/**
 * Flow C · C-11 · Reactivation landing. Where every C-10 email link lands.
 * Canvas requirements: email click lands here, straight into connect. Welcome back + one CTA; login if session expired.
 * Two states: signed in (default) and session expired (?session=expired) with a short login form first.
 * Events: reactivation_landing_viewed {email, session}; reactivation_login_submitted; exchange_connect_started {source: reactivation}.
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PrimaryButton, TextField, Lines, styles as s } from './parts';
import { setFlow, track } from '@/lib/track';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SAVED = ['Your account and settings', 'What you started during the trial', 'Your place in the community'];

export default function WelcomeBack() {
  const router = useRouter();
  const params = useSearchParams();
  const emailId = params.get('email') || 'direct';
  const expired = params.get('session') === 'expired';
  const [signedIn, setSignedIn] = useState(!expired);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);
  const viewed = useRef('');

  // The navigator switches between the two states by query, so follow it.
  useEffect(() => { setSignedIn(!expired); }, [expired]);

  useEffect(() => {
    const key = `${emailId}-${expired}`;
    if (viewed.current === key) return;
    viewed.current = key;
    setFlow('c');
    track('reactivation_landing_viewed', { email: emailId, session: expired ? 'expired' : 'active' });
  }, [emailId, expired]);

  const connect = () => {
    track('exchange_connect_started', { source: 'reactivation', email: emailId });
    router.push('/c/connect');
  };

  const login = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const next: typeof error = {};
    if (!EMAIL.test(email.trim())) next.email = 'Enter the email you signed up with.';
    if (!password) next.password = 'Enter your password.';
    setError(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    track('reactivation_login_submitted', { email: emailId });
    await new Promise((r) => setTimeout(r, 600));
    setBusy(false);
    setSignedIn(true);
  };

  return (
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={s.centerMain}>
        <div aria-hidden />

        <div className={s.centerContent}>
          <div className={s.intro}>
            <Image src="/signup/logo-tradex.svg" alt="TradeX" width={98} height={24} priority />
            <h1 className={`${s.title} ${s.titleTop}`}>Welcome back</h1>
            <p className={s.lead}>
              <Lines text={signedIn
                ? 'Everything you had is still here. Connect an exchange and TradeX opens again.'
                : 'Your session has expired. Log in and we take you straight to the connect step.'} />
            </p>
          </div>

          {signedIn ? (
            <>
              <section className={s.planBlock} aria-labelledby="back-saved">
                <h2 id="back-saved" className={s.questionLabel}>Saved for you</h2>
                <ul className={s.planList}>
                  {SAVED.map((t) => (
                    <li key={t} className={s.welcomeCard}>
                      <Image src="/signup/check.svg" alt="" width={16} height={16} />
                      <p className={s.welcomeCardTitle}>{t}</p>
                    </li>
                  ))}
                </ul>
              </section>
              <div className={s.choiceActions}>
                <PrimaryButton onClick={connect}>Connect an exchange</PrimaryButton>
                <p className={s.hint}><Lines text="Takes about 10 minutes. Cashback and ranks unlock too." /></p>
              </div>
            </>
          ) : (
            <form className={s.form} onSubmit={login} noValidate>
              <TextField id="back-email" label="Email" type="email" inputMode="email" autoComplete="email" placeholder="example@gmail.com"
                value={email} error={error.email} onChange={(e) => { setEmail(e.target.value); setError((x) => ({ ...x, email: undefined })); }} />
              <TextField id="back-password" label="Password" type="password" autoComplete="current-password" placeholder="Your password"
                value={password} error={error.password} onChange={(e) => { setPassword(e.target.value); setError((x) => ({ ...x, password: undefined })); }} />
              <PrimaryButton type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in and continue'}</PrimaryButton>
              <p className={s.linkRow}><span>Forgot your password?</span><a className={s.link} href="#">Reset it</a></p>
            </form>
          )}
        </div>

        <div className={s.spacer} aria-hidden />
      </div>
    </main>
  );
}
