'use client';

/**
 * Flow A · A-19 · Didn't work · guided fix.
 * Canvas requirements: the reason in plain words; not created via the TradeX link → back to Step 1 with a
 * fresh account; UID typo → back to Step 4; talk to a person: Discord support.
 * Events: exchange_connect_failed {error_code}, fix_path_chosen {path}.
 */
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HelpButton, Callout, Lines, styles as s } from './parts';
import { exchangeById } from '@/lib/exchanges';
import { track } from '@/lib/track';

/** Placeholder until we have the real support channel link. */
const DISCORD_SUPPORT = 'https://discord.com';

type Reason = 'not_linked' | 'not_found';

export default function ConnectFailed() {
  const router = useRouter();
  const params = useSearchParams();
  const ex = exchangeById(params.get('exchange')) ?? exchangeById('bitunix')!;
  const reason: Reason = params.get('reason') === 'not_found' ? 'not_found' : 'not_linked';
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track('exchange_connect_failed', { exchange: ex.id, error_code: reason });
  }, [ex.id, reason]);

  const go = (path: 'fresh_account' | 'check_uid' | 'support', href: string) => {
    track('fix_path_chosen', { exchange: ex.id, error_code: reason, path });
    if (path === 'support') window.open(href, '_blank', 'noopener');
    else router.push(href);
  };

  const copy = reason === 'not_linked'
    ? { title: 'We couldn’t link this account', text: `This ${ex.name} account wasn’t opened with the TradeX link, so ${ex.name} doesn’t count it for TradeX.` }
    : { title: 'We couldn’t find this UID', text: `${ex.name} doesn’t know this UID. It may be a typo, or a number from another place in the menu.` };

  const fresh = (
    <button key="fresh" type="button" className={`${s.option} ${reason === 'not_linked' ? s.optionRecommended : ''}`} onClick={() => go('fresh_account', `/connect/open?exchange=${ex.id}`)}>
      {reason === 'not_linked' && <span className={s.optionBadge}>Recommended</span>}
      <b>Open a new account through TradeX</b>
      <span>Back to step 1. Use a different email; your ID can be the same.</span>
    </button>
  );
  const checkUid = (
    <button key="uid" type="button" className={`${s.option} ${reason === 'not_found' ? s.optionRecommended : ''}`} onClick={() => go('check_uid', `/connect/uid?exchange=${ex.id}`)}>
      {reason === 'not_found' && <span className={s.optionBadge}>Recommended</span>}
      <b>Check the UID</b>
      <span>Back to step 4. See where the UID is and paste it again.</span>
    </button>
  );

  return (
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={s.centerMain}>
        <div aria-hidden />
        <div className={`${s.centerContent} ${s.medium}`}>
          <div className={s.intro}>
            <p className={s.warnBadge}>Not connected yet</p>
            <h1 className={s.title}>{copy.title}</h1>
            <p className={s.lead}><Lines text={copy.text} /></p>
          </div>

          <section className={s.planBlock} aria-labelledby="fix-title">
            <h2 id="fix-title" className={s.questionLabel}>How to fix it</h2>
            <div className={s.optionList}>
              {reason === 'not_linked' ? [fresh, checkUid] : [checkUid, fresh]}
              <button type="button" className={s.option} onClick={() => go('support', DISCORD_SUPPORT)}>
                <b>Talk to a person</b>
                <span>Our support team on Discord helps you finish the connection.</span>
              </button>
            </div>
          </section>

          {ex.id === 'bitunix' && reason === 'not_linked' && (
            <Callout title="Already verified your ID on another Bitunix account?">Bitunix verifies one account per identity. Talk to us before you open a new one.</Callout>
          )}
        </div>
        <div className={s.spacer} aria-hidden />
      </div>

      <HelpButton stepKey="connect_failed">
        <h2>Why does this happen?</h2>
        <p>Cashback only works for accounts opened with the TradeX link. If the link wasn’t used, or the code field was empty, {ex.name} can’t tell the account came from TradeX.</p>
      </HelpButton>
    </main>
  );
}
