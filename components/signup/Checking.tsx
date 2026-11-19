'use client';

/**
 * Flow A · A-15 · Verify affiliate attribution (system step, shown as a live status screen).
 * Canvas requirements: "Checking…" status with the expected time. Nov 19, 2026: no "Email me when it’s done", it just loads.
 * Then A-16 decides: verified → A-17 Connected, not verified → A-19 Didn't work.
 * Event: exchange_verification_result {ok | pending | failed}.
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HelpButton, Lines, styles as s } from './parts';
import { exchangeById } from '@/lib/exchanges';
import { track } from '@/lib/track';
import { checkAttribution } from '@/lib/mockApi';

type Row = { label: string; state: 'done' | 'active' | 'waiting' };

export default function Checking() {
  const router = useRouter();
  const params = useSearchParams();
  const ex = exchangeById(params.get('exchange')) ?? exchangeById('bitunix')!;
  const [phase, setPhase] = useState<'checking' | 'linking'>('checking');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let uid = '';
    try { uid = sessionStorage.getItem('tx_uid') || ''; } catch { /* demo continues */ }
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

  return (
    <>
      <div className={s.centerMain}>
        <div aria-hidden />
        <div className={`${s.connectBody} ${s.connectNarrow} ${s.connectMiddle}`}>
          <div className={s.connectIntro}>
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
        </div>
      </div>

      <HelpButton stepKey="connect_checking">
        <h2>Taking long?</h2>
        <p>{ex.name} confirms new accounts to TradeX. Sometimes it takes a few minutes. Keep this page open and it moves on by itself.</p>
      </HelpButton>
    </>
  );
}
