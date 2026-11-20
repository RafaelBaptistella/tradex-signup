'use client';

/**
 * Flow A · A-10 · Step 1/5 · Open the exchange via TradeX.
 * Canvas requirements: big button "Open Bitunix" (new tab); the brand's own affiliate link; referral code with
 * a copy button and "check it's filled in"; tip to keep this tab open; a short preview of what they'll see next.
 * States: before click, tab opened and waiting, user returns without progress.
 * Events: connect_step_viewed {1: open}, exchange_signup_link_clicked {exchange}.
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StepHeader, PrimaryButton, Lines, Shot, ConnectCta, styles as s } from './parts';
import HelpDrawer from './HelpDrawer';
import { AFFILIATE, REGISTER_PRINT, exchangeById } from '@/lib/exchanges';
import { brand, track } from '@/lib/track';

const CONNECT_STEPS = 5;
type Phase = 'before' | 'waiting' | 'returned';

export default function OpenExchange() {
  const router = useRouter();
  const params = useSearchParams();
  const ex = exchangeById(params.get('exchange')) ?? exchangeById('bitunix')!;
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<Phase>('before');
  const [copied, setCopied] = useState(false);
  const viewed = useRef(false);
  const P = { step_number: 1, step_name: 'open', exchange: ex.id };

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    setCode(AFFILIATE[ex.id].codes[brand()] ?? AFFILIATE[ex.id].codes.tim);
    track('connect_step_viewed', P);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Coming back to this tab after opening the exchange, without moving on: offer help instead of waiting silently.
  useEffect(() => {
    if (phase !== 'waiting') return;
    const onVisible = () => { if (document.visibilityState === 'visible') setPhase('returned'); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [phase]);

  const open = () => {
    track('exchange_signup_link_clicked', { ...P, link_brand: brand(), attempt: phase === 'before' ? 1 : 2 });
    window.open(AFFILIATE[ex.id].url, '_blank', 'noopener');
    setPhase('waiting');
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* the code stays visible to type */ }
  };

  const next = () => router.push(`/connect/signup?exchange=${ex.id}`);

  return (
    <>
      <div className={s.centerMain}>
        <StepHeader step={1} total={CONNECT_STEPS} onBack={() => router.push(`/connect?exchange=${ex.id}`)} />

        <div className={s.connectBody}>
          <div className={s.connectIntro}>
            <h1 className={s.title}>Open {ex.name} through TradeX</h1>
            <p className={s.lead}><Lines text={`Use our button, so ${ex.name} knows you came from TradeX. That’s what makes your volume count.`} /></p>
          </div>

          <div className={s.connectSplit}>
            <section className={s.planCard} aria-labelledby="code-title">
              <h2 id="code-title" className={s.questionLabel}>Your TradeX code</h2>
              <div className={s.codeRow}>
                <span className={s.refCode}>{code}</span>
                <button type="button" className={`${s.volumeChip} ${s.copyBtn}`} onClick={copy} aria-live="polite">
                  <Image src="/signup/icons/copy.svg" alt="" width={16} height={16} />{copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className={s.hint}><Lines text={`It should already be filled in on the ${ex.name} sign-up form. If “${REGISTER_PRINT[ex.id].field}” is empty, paste it there.`} /></p>
              {phase !== 'before' && (
                <p className={`${s.hint} ${s.hintOk}`} role="status">
                  <Lines text={phase === 'returned' ? `Back already? If ${ex.name} didn’t open, open it again.` : `${ex.name} is open in a new tab. Sign up there, then come back.`} />
                </p>
              )}
            </section>

            <figure className={`${s.preview} ${s.splitMedia}`} aria-label={`What you’ll see on ${ex.name}`}>
              <Shot {...REGISTER_PRINT[ex.id].print} />
            </figure>
          </div>
        </div>
      </div>

      {phase === 'before' ? (
        <ConnectCta note={<Lines text="Opens in a new tab. Keep this one open: we guide you after each step." />}>
          <PrimaryButton onClick={open}>Open {ex.name}</PrimaryButton>
        </ConnectCta>
      ) : (
        <ConnectCta note={<button type="button" className={s.inlineLink} onClick={open}>Open {ex.name} again</button>}>
          <PrimaryButton onClick={next}>I’ve opened the sign-up form</PrimaryButton>
        </ConnectCta>
      )}

      <HelpDrawer step="connect_open" exchange={ex.name} exchangeId={ex.id} />
    </>
  );
}
