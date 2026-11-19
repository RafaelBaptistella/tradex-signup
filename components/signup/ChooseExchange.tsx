'use client';

/**
 * Flow A · A-07 · Choose your exchange · guided (step 6 of 6), with A-08 and A-08b as a sheet.
 * Based on Figma "Connect Exchange" (962:5371 desktop, 979:2893 mobile) and its modal (964:5925).
 * Canvas requirements (A-07): recommended exchange pre-selected from the A-04 answers, a side-by-side
 * comparison in plain words, a "Not sure? Take our pick" button, a short 30 s explainer video.
 * A-08: "Already have an account on that exchange?" A-08b: why a fresh account, option 1 (new account,
 * different email), option 2 (an exchange they don't use yet, recommended), old account stays untouched.
 * Events: exchange_connect_started {source: guided}, exchange_selected {exchange, recommended},
 * explainer_video_played {screen}, exchange_has_account {yes|no}, existing_account_notice_viewed {exchange},
 * existing_account_choice {new|other_exchange|leave|explore}.
 * EU rules: Bitunix shows as unavailable (MiCA), Pionex is the pick, and the "new account with another email" option is gone.
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepHeader, HelpButton, Lines, PrimaryButton, Disclosure, styles as s } from './parts';
import { available, rules, useEU } from '@/lib/compliance';
import { EXCHANGES, readProfile, recommend, type Exchange, type ExchangeId } from '@/lib/exchanges';
import { SIGNUP_STEPS } from '@/lib/flow';
import { currentFlow, stepProps, track } from '@/lib/track';

const P = stepProps('exchange_choice');

export default function ChooseExchange() {
  const router = useRouter();
  const [pick, setPick] = useState<{ id: ExchangeId; reason: string }>({ id: 'bitunix', reason: 'Best for beginners' });
  const [selected, setSelected] = useState<ExchangeId>('bitunix');
  const [sheet, setSheet] = useState<null | 'ask' | 'fresh'>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const viewed = useRef(false);
  // In flows B and C people are already inside TradeX: no 6-step signup header, and Back returns to where they came from.
  const [inApp, setInApp] = useState<null | 'b' | 'c'>(null);
  const eu = useEU();

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    const r = recommend(readProfile(), rules() === 'eu');
    setPick(r);
    // A paywall (B-03, B-07, C-04, C-09, C-11) may have picked the exchange already.
    const chosen = new URLSearchParams(window.location.search).get('pick');
    setSelected((chosen === 'bitunix' || chosen === 'pionex') && available(chosen, rules() === 'eu') ? chosen : r.id);
    track('signup_step_viewed', P);
    // In flows B and C the connect started on the screen that sent people here (B-03 modal, C-03, locks…); A-07 only logs the view.
    const flow = currentFlow();
    if (flow === 'a') track('exchange_connect_started', { ...P, source: 'guided' });
    setInApp(flow === 'a' ? null : flow);
  }, []);

  // The EU switch can flip while this screen is open: keep the pick and selection on an exchange people can open.
  useEffect(() => {
    const r = recommend(readProfile(), eu);
    setPick(r);
    setSelected((sel) => (available(sel, eu) ? sel : r.id));
  }, [eu]);

  const current = EXCHANGES.find((e) => e.id === selected)!;
  const other = EXCHANGES.find((e) => e.id !== selected)!;
  const otherOpen = available(other.id, eu);

  const confirm = (id: ExchangeId) => {
    setSelected(id);
    track('exchange_selected', { ...P, exchange: id, recommended: id === pick.id });
    setSheet('ask');
  };

  const answer = (has: boolean) => {
    track('exchange_has_account', { ...P, exchange: selected, has_existing_account: has });
    if (!has) { router.push(`/connect?exchange=${selected}`); return; }
    track('existing_account_notice_viewed', { ...P, exchange: selected });
    setSheet('fresh');
  };

  const choose = (choice: 'new' | 'other_exchange' | 'leave' | 'explore') => {
    track('existing_account_choice', { ...P, exchange: selected, choice });
    if (choice === 'explore') router.push('/explore');
    else if (choice === 'new') router.push(`/connect?exchange=${selected}&fresh=1`);
    else if (choice === 'other_exchange') { setSelected(other.id); setSheet(null); }
    else setSheet(null);
  };

  const playVideo = () => {
    track('explainer_video_played', { ...P, screen: 'exchange_choice' });
    setVideoOpen(true);
  };

  return (
    <main className={s.centerPage}>
      <div className={s.mountains} aria-hidden><div className={s.noise} /></div>
      <div className={s.grid} aria-hidden />

      <div className={s.centerMain}>
        {inApp ? <StepHeader step={0} total={0} onBack={() => (inApp === 'b' ? router.push('/b/dashboard') : router.back())} /> : <StepHeader step={6} total={SIGNUP_STEPS} onBack={() => router.push('/why-connect')} />}

        <div className={`${s.centerContent} ${s.wide}`}>
          <div className={s.centerIntro}>
            <h1 className={s.title}>Choose your exchange</h1>
            <p className={s.text}><Lines text={eu ? 'Your trades run on a partner exchange. TradeX counts your volume to rank you and unlock rewards.' : 'Your trades run on a partner exchange. TradeX counts your volume to rank you and unlock rewards. We picked one for you; you can change it.'} /></p>
          </div>

          <button type="button" className={s.video} onClick={playVideo} aria-expanded={videoOpen}>
            <span className={s.videoPlay} aria-hidden>▶</span>
            <span className={s.videoText}><b>What is an exchange, and why does TradeX need one?</b><span>Short video · 0:30</span></span>
          </button>
          {videoOpen && <p className={s.hint} role="status">The video plays here once it is recorded.</p>}

          <div className={s.cards} role="radiogroup" aria-label="Exchange">
            {EXCHANGES.map((ex) => (
              <ExchangeCard key={ex.id} ex={ex} eu={eu} off={!available(ex.id, eu)} selected={selected === ex.id} badge={ex.id === pick.id ? pick.reason : undefined} onSelect={() => setSelected(ex.id)} />
            ))}
          </div>

          <div className={s.choiceActions}>
            <PrimaryButton onClick={() => confirm(selected)}>Continue with {current.name}</PrimaryButton>
            {(!eu || otherOpen) && <button type="button" className={s.inlineLink} onClick={() => confirm(pick.id)}>Not sure? Take our pick ({EXCHANGES.find((e) => e.id === pick.id)!.name})</button>}
          </div>

          <p className={s.reassure}><Lines text="Your money stays on the exchange. TradeX never holds your funds or your keys." /></p>
          {eu && <Disclosure />}
        </div>

        <div className={s.spacer} aria-hidden />
      </div>

      {sheet && (
        <Sheet title={sheet === 'ask' || (eu && !otherOpen) ? `Your ${current.name} account` : 'You’ll need a fresh account'} onClose={() => (sheet === 'fresh' ? choose('leave') : setSheet(null))}>
          {sheet === 'ask' ? (
            <>
              <div className={s.modalLogos} aria-hidden><span className={s.logoRing}><Image src={current.logo.src} alt="" width={current.logo.width} height={current.logo.height} /></span></div>
              <h2 id="sheet-title" className={s.modalTitle}>Do you already have a {current.name} account?</h2>
              <p className={`${s.text} ${s.center}`}>Only accounts opened through TradeX count for the leaderboard, so we need to know.</p>
              <div className={s.optionList}>
                <button type="button" className={s.option} onClick={() => answer(false)}><b>No, I’m new to {current.name}</b><span>We’ll guide you through opening one.</span></button>
                <button type="button" className={s.option} onClick={() => answer(true)}><b>Yes, I already have one</b><span>We’ll show you what to do.</span></button>
              </div>
            </>
          ) : (
            <>
              <h2 id="sheet-title" className={s.modalTitle}>The leaderboard only counts accounts opened through TradeX</h2>
              <p className={`${s.text} ${s.center}`}>Your current {current.name} account stays exactly as it is. You can keep using it.</p>
              {eu && !otherOpen ? (
                <div className={s.optionList}>
                  <button type="button" className={`${s.option} ${s.optionRecommended}`} onClick={() => choose('explore')}>
                    <b>Explore TradeX first</b>
                    <span>Courses and community are open to you. We’ll tell you when another exchange is available in the EU.</span>
                  </button>
                </div>
              ) : (
              <div className={s.optionList}>
                <button type="button" className={`${s.option} ${s.optionRecommended}`} onClick={() => choose('other_exchange')}>
                  <span className={s.optionBadge}>Recommended</span>
                  <b>Pick {other.name} instead</b>
                  <span>An exchange you don’t use yet. Nothing to change on your side.</span>
                </button>
                {!eu && (
                  <button type="button" className={s.option} onClick={() => choose('new')}>
                    <b>Open a new {current.name} account</b>
                    <span>Use a different email address. Your ID can be the same: {current.name} runs the check. We show you every step.</span>
                  </button>
                )}
              </div>
              )}
            </>
          )}
        </Sheet>
      )}

      <HelpButton stepKey="exchange_choice">
        <h2>Which exchange should I pick?</h2>
        <p>{eu && !available('bitunix', eu) ? 'In the EU, you can open Pionex through TradeX. Bitunix isn’t available in the EU yet. We guide you through opening the account step by step.' : 'Most TradeX members use Bitunix. Pick Pionex if you want its free trading bots. Either way, we guide you through opening the account step by step.'}</p>
      </HelpButton>
    </main>
  );
}

function ExchangeCard({ ex, eu, off, selected, badge, onSelect }: { ex: Exchange; eu: boolean; off: boolean; selected: boolean; badge?: string; onSelect: () => void }) {
  const c = eu ? ex.compareEU : ex.compare;
  const rows: [string, string][] = [['Best for', c.bestFor], [eu ? 'Welcome offer' : 'Welcome bonus', c.welcome], ['Also', c.extra]];
  // EU rules: the card stays quiet; the bonus amounts show only on hover or keyboard focus (on touch screens, inside the selected card).
  const tipId = `bonus-${ex.id}`;
  return (
    <button type="button" role="radio" aria-checked={selected} disabled={off} aria-describedby={eu && !off ? tipId : undefined} className={`${s.card} ${s.cardSelectable} ${selected ? s.cardSelected : ''} ${s.cardEx} ${ex.id === 'pionex' ? s.exPionex : s.exBitunix} ${off ? s.cardOff : ''}`} onClick={onSelect}>
      {badge && <span className={s.badge}>{badge}</span>}
      <span className={s.cardBody}>
        <span className={s.cardHead}>
          <span className={s.cardBrand}>
            <span className={s.cardLogo}><Image src={ex.logo.src} alt="" width={ex.logo.width} height={ex.logo.height} /></span>
            {ex.name}
          </span>
          <span className={s.cardPool}><b>{ex.pool}</b><span>Monthly prize pool</span></span>
        </span>
        <Image className={s.cardDivider} src="/signup/divider.svg" alt="" width={243} height={1} />
        <dl className={s.compare}>
          {rows.map(([k, v], i) => <div key={k}><dt>{k}</dt><dd className={eu && !off && i === 1 ? s.bonusHint : undefined}>{v}</dd></div>)}
        </dl>
      </span>
      {eu && !off && (
        <span id={tipId} role="tooltip" className={s.bonusTip}>
          <span className={s.bonusTipTitle}>{ex.name} welcome bonus</span>
          <span className={s.line}>{ex.compare.welcome}.</span>
          {ex.compare.extra !== ex.compareEU.extra && <span className={s.line}>{ex.compare.extra}.</span>}
          <span className={s.bonusTipNote}>Set by {ex.name}, on {ex.name}’s terms.</span>
        </span>
      )}
      {off
        ? <span className={s.cardOffNote}>Not available in the EU yet</span>
        : <span className={s.radioRow} aria-hidden><span className={s.radioDot} />{selected ? 'Selected' : `Choose ${ex.name}`}</span>}
    </button>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => { closeRef.current?.focus(); }, [title]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div className={s.modalNoise} />
        <div className={s.modalTop}>
          {title}
          <button ref={closeRef} type="button" className={s.modalBack} onClick={onClose} aria-label="Back">
            <Image src="/signup/arrow-left-small.svg" alt="" width={16} height={16} />
          </button>
        </div>
        <div className={s.modalBody}>{children}</div>
      </div>
    </div>
  );
}
