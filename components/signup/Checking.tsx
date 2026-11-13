'use client';

/**
 * Flow A · A-15 · Verify affiliate attribution (system step, shown as a live status screen).
 * Canvas requirements: "Checking…" status with the expected time; email when verified if it takes longer.
 * Then A-16 decides: verified → A-17 Connected, not verified → A-19 Didn't work.
 * Event: exchange_verification_result {ok | pending | failed}.
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PrimaryButton, HelpButton, Lines, styles as s } from './parts';
import { exchangeById } from '@/lib/exchanges';
import { track } from '@/lib/track';
import { checkAttribution } from '@/lib/mockApi';
import { VERIFIED_KEY } from './VerifyEmail';

type Row = { label: string; state: 'done' | 'active' | 'waiting' };

export default function Checking() {
  const router = useRouter();
  const params = useSearchParams();
  const ex = exchangeById(params.get('exchange')) ?? exchangeById('bitunix')!;
  const [phase, setPhase] = useState<'checking' | 'linking'>('checking');
  const [emailMe, setEmailMe] = useState(false);
  const [email, setEmail] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let uid = '';
    try { uid = sessionStorage.getItem('tx_uid') || ''; setEmail(sessionStorage.getItem(VERIFIED_KEY) || ''); } catch { /* demo continues */ }
    const t = window.setTimeout(() => setPhase('linking'), 1800);
    checkAttribution(uid).then((r) => {
      window.clearTimeout(t);
      track('exchange_verification_result', { exchange: ex.id, result: r === 'ok' ? 'ok' : 'failed' });
      router.push(r === 'ok' ? `/connected?exchange=${ex.id}` : `/connect/failed?exchange=${ex.id}&reason=not_linked`);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rows: Row[] = [
    { label: 'UID received', state: 'done' },
    { label: `Checking it was opened through TradeX`, state: phase === 'checking' ? 'active' : 'done' },
    { label: 'Linking it to your TradeX account', state: phase === 'linking' ? 'active' : 'waiting' }
  ];

  const askEmail = () => {
    track('exchange_verification_result', { exchange: ex.id, result: 'pending', email_requested: true });
    setEmailMe(true);
  };

  return (
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={s.centerMain}>
        <div aria-hidden />
        <div className={`${s.centerContent} ${s.medium}`}>
          <div className={s.centerIntro}>
            <span className={s.spinnerLarge} aria-hidden />
            <h1 className={s.title} aria-live="polite">Checking your {ex.name} account</h1>
            <p className={s.text}><Lines text="This usually takes a moment. Keep this page open." /></p>
          </div>

          <ol className={s.checkList} aria-label="Progress">
            {rows.map((r) => (
              <li key={r.label} className={`${s.checkItem} ${s['check_' + r.state]}`}>
                <span className={s.checkMark} aria-hidden>
                  {r.state === 'done' ? <Image src="/signup/check.svg" alt="" width={14} height={14} /> : r.state === 'active' ? <span className={s.spinnerSmall} /> : null}
                </span>
                <span>{r.label}</span>
                <span className="sr-only">{r.state === 'done' ? ' (done)' : r.state === 'active' ? ' (in progress)' : ' (waiting)'}</span>
              </li>
            ))}
          </ol>

          <div className={s.choiceActions}>
            {emailMe
              ? <p className={`${s.hint} ${s.hintOk}`} role="status">{email ? `We’ll email ${email} as soon as it’s done.` : 'We’ll email you as soon as it’s done.'}</p>
              : <PrimaryButton onClick={askEmail}>Email me when it’s done</PrimaryButton>}
            <p className={s.hint}>You can close this page. Your progress is saved.</p>
          </div>
        </div>
        <div className={s.spacer} aria-hidden />
      </div>

      <HelpButton stepKey="connect_checking">
        <h2>Taking long?</h2>
        <p>{ex.name} confirms new accounts to TradeX. Sometimes it takes a few minutes. We email you when it’s done, and you can pick up from there.</p>
      </HelpButton>
    </main>
  );
}
