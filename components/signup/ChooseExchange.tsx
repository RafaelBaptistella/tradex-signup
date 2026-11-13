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
 * existing_account_choice {new|other_exchange|leave}.
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepHeader, HelpButton, Lines, PrimaryButton, styles as s } from './parts';
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

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    const r = recommend(readProfile());
    setPick(r); setSelected(r.id);
    track('signup_step_viewed', P);
    // In flows B and C the connect started on the screen that sent people here (B-03 modal, C-03, locks…); A-07 only logs the view.
    const flow = currentFlow();
    if (flow === 'a') track('exchange_connect_started', { ...P, source: 'guided' });
    setInApp(flow === 'a' ? null : flow);
  }, []);

  const current = EXCHANGES.find((e) => e.id === selected)!;
  const other = EXCHANGES.find((e) => e.id !== selected)!;

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

  const choose = (choice: 'new' | 'other_exchange' | 'leave') => {
    track('existing_account_choice', { ...P, exchange: selected, choice });
    if (choice === 'new') router.push(`/connect?exchange=${selected}&fresh=1`);
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
            <p className={s.text}><Lines text="Your trades run on a partner exchange. TradeX follows your trading volume and pays you cashback. We picked one for you; you can change it." /></p>
          </div>

          <button type="button" className={s.video} onClick={playVideo} aria-expanded={videoOpen}>
            <span className={s.videoPlay} aria-hidden>▶</span>
            <span className={s.videoText}><b>What is an exchange, and why does TradeX need one?</b><span>Short video · 0:30</span></span>
          </button>
          {videoOpen && <p className={s.hint} role="status">The video plays here once it is recorded.</p>}

          <div className={s.cards} role="radiogroup" aria-label="Exchange">
            {EXCHANGES.map((ex) => (
              <ExchangeCard key={ex.id} ex={ex} selected={selected === ex.id} badge={ex.id === pick.id ? pick.reason : undefined} onSelect={() => setSelected(ex.id)} />
            ))}
          </div>

          <div className={s.choiceActions}>
            <PrimaryButton onClick={() => confirm(selected)}>Continue with {current.name}</PrimaryButton>
            <button type="button" className={s.inlineLink} onClick={() => confirm(pick.id)}>Not sure? Take our pick ({EXCHANGES.find((e) => e.id === pick.id)!.name})</button>
          </div>

          <p className={s.reassure}><Lines text="Your money stays on the exchange. TradeX never holds your funds or your keys." /></p>
        </div>

        <div className={s.spacer} aria-hidden />
      </div>

      {sheet && (
        <Sheet title={sheet === 'ask' ? `Your ${current.name} account` : 'You’ll need a fresh account'} onClose={() => (sheet === 'fresh' ? choose('leave') : setSheet(null))}>
          {sheet === 'ask' ? (
            <>
              <div className={s.modalLogos} aria-hidden><span className={s.logoRing}><Image src={current.logo.src} alt="" width={current.logo.width} height={current.logo.height} /></span></div>
              <h2 id="sheet-title" className={s.modalTitle}>Do you already have a {current.name} account?</h2>
              <p className={`${s.text} ${s.center}`}>Only accounts opened through TradeX earn cashback, so we need to know.</p>
              <div className={s.optionList}>
                <button type="button" className={s.option} onClick={() => answer(false)}><b>No, I’m new to {current.name}</b><span>We’ll guide you through opening one.</span></button>
                <button type="button" className={s.option} onClick={() => answer(true)}><b>Yes, I already have one</b><span>We’ll show you what to do.</span></button>
              </div>
            </>
          ) : (
            <>
              <h2 id="sheet-title" className={s.modalTitle}>Cashback only tracks accounts opened through TradeX</h2>
              <p className={`${s.text} ${s.center}`}>Your current {current.name} account stays exactly as it is. You can keep using it.</p>
              <div className={s.optionList}>
                <button type="button" className={`${s.option} ${s.optionRecommended}`} onClick={() => choose('other_exchange')}>
                  <span className={s.optionBadge}>Recommended</span>
                  <b>Pick {other.name} instead</b>
                  <span>An exchange you don’t use yet. Nothing to change on your side.</span>
                </button>
                <button type="button" className={s.option} onClick={() => choose('new')}>
                  <b>Open a new {current.name} account</b>
                  <span>Use a different email address. Your ID can be the same: {current.name} runs the check. We show you every step.</span>
                </button>
              </div>
            </>
          )}
        </Sheet>
      )}

      <HelpButton stepKey="exchange_choice">
        <h2>Which exchange should I pick?</h2>
        <p>Most TradeX members use Bitunix. Pick Pionex if you want its free trading bots. Either way, we guide you through opening the account step by step.</p>
      </HelpButton>
    </main>
  );
}

function ExchangeCard({ ex, selected, badge, onSelect }: { ex: Exchange; selected: boolean; badge?: string; onSelect: () => void }) {
  const rows: [string, string][] = [['Best for', ex.compare.bestFor], ['Welcome bonus', ex.compare.welcome], ['Also', ex.compare.extra]];
  return (
    <button type="button" role="radio" aria-checked={selected} className={`${s.card} ${s.cardSelectable} ${selected ? s.cardSelected : ''} ${ex.id === 'pionex' ? s.cardPionex : ''}`} onClick={onSelect}>
      {badge && <span className={s.badge}>{badge}</span>}
      <span className={s.cardBody}>
        <span className={s.cardHead}>
          <span className={s.cardBrand}>
            <span className={s.cardLogo}><Image src={ex.logo.src} alt="" width={ex.logo.width} height={ex.logo.height} /></span>
            {ex.name}
          </span>
          <span className={s.cardPool}><b>{ex.pool}</b><span>Monthly cashback pool</span></span>
        </span>
        <Image className={s.cardDivider} src="/signup/divider.svg" alt="" width={243} height={1} />
        <dl className={s.compare}>
          {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </span>
      <span className={s.radioRow} aria-hidden><span className={s.radioDot} />{selected ? 'Selected' : `Choose ${ex.name}`}</span>
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
