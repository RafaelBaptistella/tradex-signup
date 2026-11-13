'use client';

/**
 * Flow A · A-18 · Welcome to the dashboard (first session).
 * Canvas requirements: first session with a short guided tour (3 steps) and a checklist:
 * first course, join Discord, first trade. Event: app_session_started.
 * Layout and assets from the live dashboard in Figma (Live Pages → Dashboard → "Beginner", 1787:24442),
 * filled with a new member's data: rank 1 Rekrut, $0 volume. Copy in English.
 * Flow B · B-06 · Dashboard · not connected (mode 'b'): app usable; persistent top banner "Connect to start earning
 * cashback"; lock badge on cashback and ranking; rest of the platform open. Event: app_session_started {connected: false}.
 * Flow C · C-04 · Dashboard · trial (mode 'c'): half the app open, countdown chip ("6 days left"), same locks as B-06 plus
 * advanced courses, and a "Your trial so far" panel with what the person has used. Event: app_session_started {trial_day}.
 */
import Image from 'next/image';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeById } from '@/lib/exchanges';
import { track } from '@/lib/track';
import LockedFeatureSheet, { type LockedFeature } from './LockedFeatureSheet';
import TrialLastDayModal from './TrialLastDayModal';
import d from './dashboard.module.css';

const NAV: { icon: string; label: string; active?: boolean; lockedInB?: string }[] = [
  { icon: 'dashboard', label: 'Dashboard', active: true },
  { icon: 'ranks', label: 'Ranks & Rewards', lockedInB: 'ranking' },
  { icon: 'courses', label: 'Courses' },
  { icon: 'journal', label: 'Trading Journal' },
  { icon: 'events', label: 'Events' },
  { icon: 'community', label: 'Community' },
  { icon: 'leaderboards', label: 'Leaderboards', lockedInB: 'ranking' },
  { icon: 'partners', label: 'Partnerships' }
];
const NAV_BOTTOM = [{ icon: 'settings', label: 'Settings' }, { icon: 'feedback', label: 'Feedback' }, { icon: 'logout', label: 'Log out' }];

/** Rank names and volumes from the live Ranks & Rewards card in Figma. */
const RANK = { name: 'Rekrut', tier: 'Beginner I', volume: 0, next: { name: 'Krieger', at: 1000 } };

type Unlockable = { label: string; state: 'open' | 'price' | 'locked'; price?: string; feature?: string };
const UNLOCKABLES: Unlockable[] = [
  { label: 'Beginner course', state: 'open' as const },
  { label: 'Community', state: 'open' as const },
  { label: 'Leaderboard', state: 'price' as const, price: '$15K to unlock' },
  { label: 'Onboarding campaign', state: 'locked' as const }
];

const TILES: { img: string; title: string; link: string; lockedInB?: string }[] = [
  { img: '/dashboard/tile-0.jpg', title: 'Courses', link: 'Go to courses' },
  { img: '/dashboard/tile-1.jpg', title: 'Leaderboard', link: 'Go to leaderboard', lockedInB: 'ranking' },
  { img: '/dashboard/tile-2.jpg', title: 'Analyses', link: 'Go to analyses' },
  { img: '/dashboard/tile-3.jpg', title: 'Community', link: 'Go to Discord' }
];

type TourStep = { target: string; title: string; text: string };
type ChecklistKey = 'first_course' | 'join_discord' | 'first_trade' | 'read_analysis';
const CHECK_KEY = 'tx_checklist';
/** Flow C: what the person has tried during the trial (C-04 progress panel). */
const TRIAL_USED_KEY = 'tx_trial_used';
const DAY_MS = 86400000;

/**
 * mode 'a': A-18, connected member, first session with tour and checklist.
 * mode 'b': flow B, signed up but not connected yet; no tour or checklist, and the page passes its own overlay (B-03 modal).
 * mode 'b-unlocked': B-09, flow B right after connecting: banner and locks gone, a short celebration, cashback unlocked.
 * mode 'c-unlocked': C-13, flow C after connecting (during the trial, from the lock wall or a reactivation email):
 *   trial chip, banner and every lock gone, same short celebration as B-09, plus advanced courses open.
 * mode 'c': C-04, flow C during the 7-day trial: countdown chip, connect banner, locks, "Your trial so far" panel. ?day= sets the trial day for demos.
 */
export default function Dashboard({ mode = 'a', overlay }: { mode?: 'a' | 'b' | 'b-unlocked' | 'c' | 'c-unlocked'; overlay?: ReactNode }) {
  const connected = mode === 'a' || mode === 'b-unlocked' || mode === 'c-unlocked';
  const trial = mode === 'c';
  const firstTour = mode === 'a';
  const justUnlocked = mode === 'b-unlocked' || mode === 'c-unlocked';
  const [celebrate, setCelebrate] = useState(justUnlocked);
  const router = useRouter();
  /** B-06: cashback first, ranking locked until an exchange is connected. */
  const unlockables: Unlockable[] = justUnlocked ? [{ label: 'Cashback', state: 'open' }, ...(mode === 'c-unlocked' ? [UNLOCKABLES[0], UNLOCKABLES[1], { label: 'Advanced courses', state: 'open' as const }, UNLOCKABLES[2]] : UNLOCKABLES)] : connected ? UNLOCKABLES : [
    { label: 'Cashback', state: 'locked', feature: 'cashback' },
    UNLOCKABLES[0], UNLOCKABLES[1],
    { label: 'Leaderboard', state: 'locked', feature: 'ranking' },
    // C-04: advanced courses are locked during the trial too (C-03 lists them under “Unlocks with an exchange”).
    trial ? { label: 'Advanced courses', state: 'locked', feature: 'courses' } : UNLOCKABLES[3]
  ];
  const connectFrom = (source: string) => {
    track('exchange_connect_started', { source, ...(trial ? { trial_day: trialDay } : {}) });
    router.push(trial ? '/c/connect' : '/b/connect');
  };
  /** B-07: a locked item opens a sheet about that feature, with the connect button. */
  const [sheet, setSheet] = useState<LockedFeature | null>(null);
  const locked = (feature: string) => {
    track('locked_feature_clicked', { feature, ...(trial ? { trial_day: trialDay } : {}) });
    setSheet(feature as LockedFeature);
  };
  const params = useSearchParams();
  /** C-04: trial day 1–7, counted from when the email was confirmed (C-02). ?day= overrides it for demos. */
  const [trialDay, setTrialDay] = useState(1);
  const daysLeft = Math.max(1, 8 - trialDay);
  /**
   * C-07 in-app nudges. The canvas counts days since signup (D0 = signup day), so D3 = trial day 4,
   * D5 = trial day 6 and D6 = trial day 7, the last day (which also opens the last-day modal).
   */
  const nudge = !trial ? null : ({
    4: { d: 3, soon: false, title: 'You’re halfway through your free trial', text: '4 days left. Connect now and it all stays open after day 7.' },
    6: { d: 5, soon: true, title: 'Two days left in your free trial', text: 'After day 7, courses and community pause until you connect.' },
    7: { d: 6, soon: true, title: 'Last day of your free trial', text: 'Connect today and nothing pauses tomorrow.' }
  } as Record<number, { d: number; soon: boolean; title: string; text: string }>)[trialDay] ?? null;
  // Prototype navigator: its pills change only the query (?day=, ?sheet=), so the dashboard stays mounted.
  // Re-read them on every query change: ?day= sets the trial day, ?sheet= opens that locked feature sheet (B-07 / C-05).
  useEffect(() => {
    if (trial) {
      const forced = Number(params.get('day'));
      if (forced >= 1 && forced <= 7) setTrialDay(forced);
      if (forced === 8) { track('trial_ended', { connected: false }); router.replace('/c/locked'); return; }
    }
    const k = params.get('sheet');
    if (connected) return;
    setSheet(k === 'cashback' || k === 'ranking' || (k === 'courses' && trial) ? k : null);
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps
  const nudged = useRef<number | null>(null);
  useEffect(() => {
    if (!nudge || nudged.current === trialDay) return;
    nudged.current = trialDay;
    track('trial_nudge_viewed', { day: nudge.d, trial_day: trialDay, kind: 'banner' });
  }, [trialDay]); // eslint-disable-line react-hooks/exhaustive-deps
  const ex = exchangeById(params.get('exchange')) ?? exchangeById('bitunix')!;
  const [name, setName] = useState('');
  const [tourStep, setTourStep] = useState<number | null>(firstTour ? 0 : null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [done, setDone] = useState<Partial<Record<ChecklistKey, boolean>>>({});
  const [listOpen, setListOpen] = useState(true);
  const started = useRef(false);

  const tour: TourStep[] = [
    { target: 'rank', title: 'This is your rank', text: `You start as a Rekrut with $0 volume. Trade on ${ex.name} and you reach Krieger at $1K.` },
    { target: 'unlockables', title: 'What you unlock', text: 'Some rewards are yours already. The rest open as you climb the ranks.' },
    { target: 'tiles', title: 'Where to start', text: 'Courses, the leaderboard, analyses and the community are one click away.' }
  ];

  // Reads the session every time the effect runs (React's dev double mount resets state), but sends the event only once.
  useEffect(() => {
    const once = !started.current;
    started.current = true;
    try {
      const email = sessionStorage.getItem('tx_email_verified') || '';
      if (email) setName(email.split('@')[0].split(/[._-]/)[0].replace(/^\w/, (c) => c.toUpperCase()));
      const saved = JSON.parse(sessionStorage.getItem(trial ? TRIAL_USED_KEY : CHECK_KEY) || 'null');
      if (saved) setDone(saved);
      if (sessionStorage.getItem('tx_tour_done')) setTourStep(null);
    } catch { /* first session */ }
    if (window.matchMedia('(max-width: 1023px)').matches) setListOpen(false);
    if (trial) {
      let day = 1;
      try { const t = Number(sessionStorage.getItem('tx_trial_start')); if (t) day = Math.floor((Date.now() - t) / DAY_MS) + 1; } catch { /* day 1 */ }
      const forced = Number(params.get('day'));
      if (forced >= 1 && forced <= 8) day = forced;
      // C-08: the trial ended without a connected exchange → the whole platform locks (C-09 lock wall).
      if (day > 7) { if (once) track('trial_ended', { connected: false }); router.replace('/c/locked'); return; }
      day = Math.max(1, day);
      setTrialDay(day);
      if (once) track('app_session_started', { connected: false, trial_day: day });
      return;
    }
    if (once) track('app_session_started', connected ? { connected: true, exchange: ex.id, first_session: firstTour } : { connected: false, first_session: true });
  }, [ex.id]);

  const measure = useCallback(() => {
    if (tourStep === null) { setRect(null); return; }
    const el = document.querySelector(`[data-tour="${tour[tourStep].target}"]`);
    if (!el) return;
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    setRect(el.getBoundingClientRect());
  }, [tourStep]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    measure();
    if (tourStep !== null) track('product_tour_step_viewed', { step: tourStep + 1, target: tour[tourStep].target });
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); };
  }, [tourStep, measure]); // eslint-disable-line react-hooks/exhaustive-deps

  const endTour = (how: 'completed' | 'skipped') => {
    track(how === 'completed' ? 'product_tour_completed' : 'product_tour_skipped', { at_step: (tourStep ?? 0) + 1 });
    try { sessionStorage.setItem('tx_tour_done', '1'); } catch { /* shows again next time */ }
    setTourStep(null);
  };

  const check = (key: ChecklistKey) => {
    track(trial ? 'trial_item_clicked' : 'checklist_item_clicked', { item: key, ...(trial ? { trial_day: trialDay } : {}) });
    setDone((c) => { const n = { ...c, [key]: true }; try { sessionStorage.setItem(trial ? TRIAL_USED_KEY : CHECK_KEY, JSON.stringify(n)); } catch { /* not saved */ } return n; });
  };

  const items: { key: ChecklistKey; label: string; hint: string }[] = trial ? [
    { key: 'first_course', label: 'Start the beginner course', hint: 'Level 1, step by step' },
    { key: 'join_discord', label: 'Join the Discord', hint: 'Daily live trading with the coaches' },
    { key: 'read_analysis', label: 'Read a market analysis', hint: 'What the coaches watch this week' }
  ] : [
    { key: 'first_course', label: 'Start your first course', hint: 'The beginner course, step by step' },
    { key: 'join_discord', label: 'Join the Discord', hint: 'Daily live trading with the coaches' },
    { key: 'first_trade', label: `Make your first trade on ${ex.name}`, hint: 'Your cashback and rank start counting' }
  ];
  const doneCount = items.filter((i) => done[i.key]).length;
  const progress = Math.min(100, (RANK.volume / RANK.next.at) * 100);

  return (
    <div className={d.page}>
      <div className={d.bg} aria-hidden><div className={d.noise} /><div className={d.grid} /></div>

      <aside className={d.sidebar}>
        <div className={d.sideTop}>
          <div className={d.brandRow}>
            <Image src="/signup/logo-tradex.svg" alt="TradeX" width={98} height={24} />
            <Image src="/dashboard/icons/bell.svg" alt="Notifications" width={32} height={32} />
          </div>
          <div className={d.search}><Image src="/dashboard/icons/search.svg" alt="" width={20} height={20} />Search</div>
          <div className={d.navLabel}>Platform</div>
          <nav className={d.nav} aria-label="Main">
            {NAV.map((n) => (
              <a key={n.label} href="#" className={`${d.navItem} ${n.active ? d.navActive : ''}`} aria-current={n.active ? 'page' : undefined}
                onClick={(e) => { e.preventDefault(); if (!connected && n.lockedInB) locked(n.lockedInB); }}>
                <Image src={`/dashboard/icons/${n.icon}.svg`} alt="" width={20} height={20} />{n.label}
                {!connected && n.lockedInB && <span className={d.navLock} aria-label="Locked"><Image src="/dashboard/icons/lock.svg" alt="" width={12} height={12} /></span>}
              </a>
            ))}
          </nav>
        </div>
        <div className={d.sideBottom}>
          <nav className={d.nav} aria-label="Account">
            {NAV_BOTTOM.map((n) => (
              <a key={n.label} href="#" className={d.navItem} onClick={(e) => e.preventDefault()}>
                <Image src={`/dashboard/icons/${n.icon}.svg`} alt="" width={20} height={20} />{n.label}
              </a>
            ))}
          </nav>
          <div className={d.user}>
            <span className={d.avatar} aria-hidden>{name ? name.charAt(0) : '·'}</span>
            <div><b>{name || 'New member'}</b><span className={d.userTag}>{RANK.name}</span></div>
          </div>
          <div className={d.sideRank} aria-label={`Rank ${RANK.name}`}>
            <span className={d.sideRankWord} aria-hidden>{RANK.name}</span>
            <Image className={d.sideRankGem} src="/signup/rank/gem-rekrut.png" alt="" width={150} height={150} />
          </div>
        </div>
      </aside>

      <main className={d.main}>
        {celebrate && (
          <div className={`${d.banner} ${d.celebrate}`} role="status">
            <span className={d.bannerIcon} aria-hidden><Image src="/signup/check.svg" alt="" width={16} height={16} /></span>
            <p>{mode === 'c-unlocked'
              ? <><b>{ex.name} connected. Everything is unlocked for good</b><span>No more trial: courses, community, cashback and ranks stay open.</span></>
              : <><b>{ex.name} connected. Cashback and ranking are unlocked</b><span>Your trades now count. Make your first trade to start earning and climbing.</span></>}</p>
            <button type="button" className={d.bannerGhost} onClick={() => { track('unlock_celebration_dismissed', { exchange: ex.id }); setCelebrate(false); }}>Got it</button>
          </div>
        )}
        {trial && (
          <div className={`${d.banner} ${nudge?.soon ? d.bannerSoon : ''}`} role="region" aria-label="Your free trial">
            <span className={d.bannerIcon} aria-hidden><Image src={nudge ? '/signup/icons/timer.svg' : '/dashboard/icons/lock.svg'} alt="" width={16} height={16} /></span>
            <p><b>{nudge ? nudge.title : 'Keep it all after your trial'}</b><span>{nudge ? nudge.text : 'Connect an exchange to unlock cashback and ranks, for good.'}</span></p>
            <button type="button" onClick={() => connectFrom(nudge ? 'trial_nudge' : 'trial_banner')}>Connect exchange</button>
          </div>
        )}
        {!connected && !trial && (
          <div className={d.banner} role="region" aria-label="Connect your exchange">
            <span className={d.bannerIcon} aria-hidden><Image src="/dashboard/icons/lock.svg" alt="" width={16} height={16} /></span>
            <p><b>Connect to start earning cashback</b><span>Open Bitunix or Pionex through TradeX to unlock cashback and your ranking.</span></p>
            <button type="button" onClick={() => connectFrom('banner')}>Connect exchange</button>
          </div>
        )}
        <header className={d.head}>
          <div className={d.headRow}>
            <h1>{name ? `Welcome ${name}!` : 'Welcome to TradeX!'}</h1>
            {trial && (
              <span className={`${d.trialChip} ${daysLeft <= 2 ? d.trialChipSoon : ''}`} aria-label={`Free trial: ${daysLeft === 1 ? 'last day' : `${daysLeft} days left`}`}>
                <Image src="/signup/icons/timer.svg" alt="" width={16} height={16} />
                {daysLeft === 1 ? 'Last day of your trial' : `${daysLeft} days left`}
              </span>
            )}
          </div>
          <p>Track your ranking, claim your rewards and explore community, streams and analyses in one place.</p>
        </header>

        <section className={d.hero} data-tour="rank" aria-label="Your rank">
          <div className={d.heroImg} aria-hidden />
          <div className={d.heroRank}>
            <span className={d.badge}><Image src="/signup/rank/gem-rekrut.png" alt="" width={65} height={65} /></span>
            {!connected && <button type="button" className={d.heroLock} onClick={() => locked('ranking')}><Image src="/dashboard/icons/lock.svg" alt="" width={12} height={12} />Ranking locked</button>}
            <div className={d.rankInfo}>
              <div className={d.rankRow}>
                <div>
                  <p className={d.rankName}>{RANK.name} <span>[{RANK.tier}]</span></p>
                  <p className={d.rankVol}>${RANK.volume.toLocaleString('en-US')}</p>
                </div>
                <p className={d.rankNext}>{connected ? <>Next: <b>{RANK.next.name}</b> at $1K</> : <>Connect an exchange to start climbing</>}</p>
              </div>
              <div className={d.bar}>
                <span className={d.barLabel}>$0</span>
                <div className={d.barTrack}><div className={d.barFill} style={{ width: `${progress}%` }} /></div>
                <span className={d.barLabel}>$1K</span>
              </div>
            </div>
          </div>
          <div className={d.unlock} data-tour="unlockables">
            <div className={d.unlockHead}><p>Unlockables</p><span>See all <Image src="/dashboard/icons/arrow-right.svg" alt="" width={16} height={16} /></span></div>
            <ul className={d.unlockList}>
              {unlockables.map((u) => (
                <li key={u.label} className={`${d.unlockItem} ${u.state === 'locked' ? d.unlockLocked : ''} ${u.feature ? d.unlockFeature : ''} ${celebrate && u.label === 'Cashback' ? d.justOpened : ''}`} onClick={u.feature ? () => locked(u.feature!) : undefined}>
                  <span className={d.unlockIcon}><Image src="/dashboard/unlock.png" alt="" width={63} height={56} /></span>
                  <span className={d.unlockLabel}>{u.label}</span>
                  {u.state === 'open' && <span className={d.pillRound} aria-label="Unlocked"><Image src="/dashboard/icons/check.svg" alt="" width={16} height={16} /></span>}
                  {u.state === 'price' && <span className={d.pill}><Image src="/dashboard/icons/lock.svg" alt="" width={12} height={12} />{u.price}</span>}
                  {u.state === 'locked' && <span className={d.pillRound} aria-label="Locked"><Image src="/dashboard/icons/lock.svg" alt="" width={16} height={16} /></span>}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={d.tiles} data-tour="tiles" aria-label="Explore">
          {TILES.map((t) => (
            <a key={t.title} href="#" className={d.tile} onClick={(e) => { e.preventDefault(); if (!connected && t.lockedInB) locked(t.lockedInB); }}>
              <span className={d.tileImg} style={{ backgroundImage: `url(${t.img})` }} aria-hidden />
              {!connected && t.lockedInB && <span className={d.tileLock}><Image src="/dashboard/icons/lock.svg" alt="" width={12} height={12} />Locked</span>}
              <span className={d.tileText}><b>{t.title}</b><span>{t.link} →</span></span>
            </a>
          ))}
        </section>
      </main>

      {((firstTour && tourStep === null) || trial) && (
        <aside className={d.checklist} aria-labelledby="checklist-title">
          <button type="button" className={d.checklistHead} onClick={() => setListOpen((o) => !o)} aria-expanded={listOpen} aria-controls="checklist-items">
            <p id="checklist-title">{trial ? 'Your trial so far' : 'Get started'}</p>
            <span>{doneCount}/3 <i className={listOpen ? d.chevUp : d.chevDown} aria-hidden /></span>
          </button>
          <div className={d.checklistBar}><div style={{ width: `${(doneCount / 3) * 100}%` }} /></div>
          <ul id="checklist-items" hidden={!listOpen}>
            {items.map((it) => (
              <li key={it.key}>
                <button type="button" className={`${d.checkItem} ${done[it.key] ? d.checkDone : ''}`} onClick={() => check(it.key)} aria-pressed={done[it.key]}>
                  <span className={d.checkBox} aria-hidden>{done[it.key] && <Image src="/signup/check.svg" alt="" width={12} height={12} />}</span>
                  <span><b>{it.label}</b><small>{it.hint}</small></span>
                </button>
              </li>
            ))}
          </ul>
          {trial && !listOpen ? null : trial && <p className={d.trialFoot}><span>Day {trialDay} of 7.</span><span>What you try now stays yours when you connect.</span></p>}
        </aside>
      )}

      {tourStep !== null && rect && (
        <div className={d.tourLayer} role="dialog" aria-modal="true" aria-labelledby="tour-title">
          <div className={d.spot} style={{ left: rect.left - 6, top: rect.top - 6, width: rect.width + 12, height: rect.height + 12 }} aria-hidden />
          <div className={d.pop} style={popStyle(rect)}>
            <p className={d.popStep}>Step {tourStep + 1} of {tour.length}</p>
            <h2 id="tour-title">{tour[tourStep].title}</h2>
            <p>{tour[tourStep].text}</p>
            <div className={d.popActions}>
              <button type="button" className={d.popSkip} onClick={() => endTour('skipped')}>Skip tour</button>
              {tourStep < tour.length - 1
                ? <button type="button" className={d.popNext} onClick={() => setTourStep(tourStep + 1)}>Next</button>
                : <button type="button" className={d.popNext} onClick={() => endTour('completed')}>Got it</button>}
            </div>
          </div>
        </div>
      )}
      {overlay}
      {trial && trialDay === 7 && <TrialLastDayModal onConnect={() => connectFrom('trial_last_day_modal')} />}
      {sheet && <LockedFeatureSheet feature={sheet} trialDay={trial ? trialDay : undefined} onConnect={() => connectFrom('locked_feature')} onClose={() => setSheet(null)} />}
    </div>
  );
}

/** Places the tour card below the highlighted area, or above it when there's no room. On phones it docks to the bottom. */
function popStyle(r: DOMRect): React.CSSProperties {
  if (typeof window === 'undefined' || window.innerWidth < 1024) return {};
  const W = 360, below = r.bottom + 16, fitsBelow = below + 200 < window.innerHeight;
  const left = Math.min(Math.max(16, r.left + r.width / 2 - W / 2), window.innerWidth - W - 16);
  return fitsBelow ? { left, top: below } : { left, top: Math.max(16, r.top - 216) };
}
