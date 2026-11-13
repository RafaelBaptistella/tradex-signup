'use client';

/**
 * Flow A · A-14 · Step 5/5 · Paste your UID.
 * Canvas requirements: UID input with a live format check; every error says what's wrong and how to fix it,
 * with a link back to the right step; reminder of what unlocks once confirmed.
 * States: empty, typing / valid format, invalid format, UID already used, submitting.
 * Events: connect_step_viewed {5: uid}, uid_submitted {exchange}, uid_error {reason}.
 */
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StepHeader, PrimaryButton, Lines, styles as s } from './parts';
import HelpDrawer from './HelpDrawer';
import { AFFILIATE, exchangeById } from '@/lib/exchanges';
import { brand, track } from '@/lib/track';
import { submitUid } from '@/lib/mockApi';

const CONNECT_STEPS = 5;
/** Our test UIDs were 9 digits (Bitunix) and 8 (Pionex); until the exchanges confirm a fixed length, accept 6–12 digits. */
const MIN = 6, MAX = 12;

type Problem = { reason: string; text: string; fix?: { label: string; href: string } };

function checkFormat(raw: string, codes: string[], exId: string): Problem | null {
  const v = raw.trim();
  if (!v) return null;
  const uidStep = { label: 'See where to find your UID', href: `/connect/uid?exchange=${exId}` };
  if (v.includes('@')) return { reason: 'email', text: 'That looks like an email. Your UID is a number in the same menu, right under your email.', fix: uidStep };
  if (codes.includes(v.toUpperCase())) return { reason: 'tradex_code', text: 'That’s the TradeX code you used to sign up. Your UID is a different number.', fix: uidStep };
  if (/\D/.test(v)) return { reason: 'invalid_format', text: 'A UID has only numbers. Remove letters, spaces or symbols, or copy it again.', fix: uidStep };
  if (v.length < MIN) return { reason: 'too_short', text: `That’s too short for a UID. Check you copied the whole number.`, fix: uidStep };
  if (v.length > MAX) return { reason: 'too_long', text: `That’s too long for a UID. Check you copied only the UID.`, fix: uidStep };
  return null;
}

const UNLOCKS = ['Cashback on every trade, paid monthly', 'Your rank path starts at rank 1', 'Courses, community and live trading'];

export default function PasteUid() {
  const router = useRouter();
  const params = useSearchParams();
  const ex = exchangeById(params.get('exchange')) ?? exchangeById('bitunix')!;
  const [uid, setUid] = useState('');
  const [touched, setTouched] = useState(false);
  const [serverError, setServerError] = useState<Problem | null>(null);
  const [busy, setBusy] = useState(false);
  const viewed = useRef(false);
  const P = { step_number: 5, step_name: 'uid', exchange: ex.id };
  const codes = Object.values(AFFILIATE[ex.id].codes);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track('connect_step_viewed', P);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = uid.trim();
  const formatProblem = checkFormat(uid, codes, ex.id);
  const problem = serverError ?? (touched || value.length >= MIN ? formatProblem : null);
  const valid = !!value && !formatProblem;

  const paste = async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      setUid(text); setTouched(true); setServerError(null);
    } catch { document.getElementById('uid')?.focus(); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!value) { track('uid_error', { ...P, reason: 'empty' }); return; }
    if (formatProblem) { track('uid_error', { ...P, reason: formatProblem.reason }); return; }
    setBusy(true);
    track('uid_submitted', { ...P, link_brand: brand() });
    const result = await submitUid(value);
    if (result === 'already_used') {
      setBusy(false);
      track('uid_error', { ...P, reason: 'already_used' });
      setServerError({ reason: 'already_used', text: 'This UID is already connected to another TradeX account. If that account is yours, log in there. If not, contact TradeX support.', fix: { label: 'Log in instead', href: '/login' } });
      return;
    }
    try { sessionStorage.setItem('tx_uid', value); } catch { /* checking screen falls back to a demo UID */ }
    router.push(`/connect/checking?exchange=${ex.id}`);
  };

  return (
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={s.centerMain}>
        <StepHeader step={5} total={CONNECT_STEPS} onBack={() => router.push(`/connect/uid?exchange=${ex.id}`)} />

        <form className={`${s.centerContent} ${s.medium}`} onSubmit={submit} noValidate>
          <div className={s.intro}>
            <h1 className={s.title}>Paste your UID</h1>
            <p className={s.lead}><Lines text={`The UID you copied from ${ex.name}. We use it to link your account to TradeX.`} /></p>
          </div>

          <div className={s.field}>
            <label htmlFor="uid" className={s.label}>{ex.name} UID</label>
            <div className={s.passwordWrap}>
              <input
                id="uid" className={`${s.input} ${s.uidInput} ${problem ? s.inputError : valid ? s.inputOk : ''}`}
                inputMode="numeric" autoComplete="off" placeholder="123456789" value={uid} disabled={busy}
                aria-invalid={Boolean(problem)} aria-describedby="uid-status"
                onChange={(e) => { setUid(e.target.value); setServerError(null); }}
                onBlur={() => { setTouched(true); if (formatProblem) track('uid_error', { ...P, reason: formatProblem.reason, on: 'blur' }); }}
              />
              <button type="button" className={`${s.passwordToggle} ${s.copyBtn}`} onClick={paste} disabled={busy}>
                <Image src="/signup/icons/copy.svg" alt="" width={14} height={14} />Paste
              </button>
            </div>
            <div id="uid-status" aria-live="polite">
              {problem ? (
                <p className={s.error} role="alert">
                  <Lines text={problem.text} />
                  {problem.fix && <Link className={s.errorLink} href={problem.fix.href}>{problem.fix.label}</Link>}
                </p>
              ) : valid ? (
                <p className={`${s.hint} ${s.hintOk}`}>Looks like a UID.</p>
              ) : (
                <p className={s.hint}>Only numbers, like 123456789.</p>
              )}
            </div>
          </div>

          <section className={s.planBlock} aria-labelledby="unlocks-title">
            <h2 id="unlocks-title" className={s.questionLabel}>Once it’s confirmed</h2>
            <ul className={s.planList}>
              {UNLOCKS.map((u) => (
                <li key={u} className={`${s.welcomeCard} ${s.iconRow}`}>
                  <Image src="/signup/check.svg" alt="" width={16} height={16} />
                  <span className={s.welcomeCardTitle}>{u}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className={s.choiceActions}>
            <PrimaryButton type="submit" disabled={busy}>{busy ? 'Connecting…' : `Connect my ${ex.name} account`}</PrimaryButton>
            <p className={s.hint}>Last step. Then TradeX opens.</p>
          </div>
        </form>

        <div className={s.spacer} aria-hidden />
      </div>

      <HelpDrawer step="connect_uid" exchange={ex.name} exchangeId={ex.id} />
    </main>
  );
}
