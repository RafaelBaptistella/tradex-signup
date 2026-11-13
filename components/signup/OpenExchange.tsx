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
import { StepHeader, PrimaryButton, Lines, Callout, Shot, styles as s } from './parts';
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
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={s.centerMain}>
        <StepHeader step={1} total={CONNECT_STEPS} onBack={() => router.push(`/connect?exchange=${ex.id}`)} />

        <div className={`${s.centerContent} ${s.medium}`}>
          <div className={s.intro}>
            <h1 className={s.title}>Open {ex.name} through TradeX</h1>
            <p className={s.lead}><Lines text={`Use our button, so ${ex.name} knows you came from TradeX. That’s what makes your cashback work.`} /></p>
          </div>

          <section className={s.planBlock} aria-labelledby="code-title">
            <h2 id="code-title" className={s.questionLabel}>Your TradeX code</h2>
            <div className={s.planCard}>
              <div className={s.codeRow}>
                <span className={s.refCode}>{code}</span>
                <button type="button" className={`${s.volumeChip} ${s.copyBtn}`} onClick={copy} aria-live="polite">
                  <Image src="/signup/icons/copy.svg" alt="" width={16} height={16} />{copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className={s.hint}><Lines text={`It should already be filled in on the ${ex.name} sign-up form. If the field is empty, paste it there.`} /></p>
            </div>
          </section>

          <section className={s.planBlock} aria-labelledby="preview-title">
            <h2 id="preview-title" className={s.questionLabel}>What you’ll see on {ex.name}</h2>
            <figure className={s.preview}>
              <Shot {...REGISTER_PRINT[ex.id].print} />
              <figcaption className={s.hint}>
                {ex.id === 'bitunix' ? 'Open' : 'Look at'} “{REGISTER_PRINT[ex.id].field}” and check it shows <b>{code}</b>.
              </figcaption>
            </figure>
          </section>

          {phase === 'before' && (
            <div className={s.choiceActions}>
              <PrimaryButton onClick={open}>Open {ex.name}</PrimaryButton>
              <p className={s.hint}><Lines text="Opens in a new tab. Keep this one open: we guide you after each step." /></p>
            </div>
          )}

          {phase !== 'before' && (
            <>
              {phase === 'returned'
                ? <Callout title={`Back already? No problem`}>If the {ex.name} page didn’t open, or the code field was empty, open it again. Once you have signed up, continue.</Callout>
                : <Callout title={`${ex.name} is open in a new tab`}>Fill in the sign-up form there, then come back to this tab.</Callout>}
              <div className={s.choiceActions}>
                <PrimaryButton onClick={next}>I’ve opened the sign-up form</PrimaryButton>
                <button type="button" className={s.inlineLink} onClick={open}>Open {ex.name} again</button>
              </div>
            </>
          )}
        </div>

        <div className={s.spacer} aria-hidden />
      </div>

      <HelpDrawer step="connect_open" exchange={ex.name} exchangeId={ex.id} />
    </main>
  );
}
