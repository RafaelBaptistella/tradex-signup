'use client';

/**
 * Flow A · A-18 · Welcome to the dashboard (first session).
 * Canvas requirements: first session with a short guided tour (3 steps) and a checklist:
 * first course, join Discord, first trade. Event: app_session_started.
 * Layout and assets from the live dashboard in Figma (Live Pages → Dashboard → "Beginner", 1787:24442),
 * filled with a new member's data: rank 1 Rekrut, $0 volume. Copy in English.
 * Flow B · B-06 · Dashboard · not connected (mode 'b'): app usable; persistent top banner "Connect to start earning
 * cashback"; lock badge on cashback and ranking; rest of the platform open. Event: app_session_started {connected: false}.
 */
import Image from 'next/image';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeById } from '@/lib/exchanges';
import { track } from '@/lib/track';
import LockedFeatureSheet, { type LockedFeature } from './LockedFeatureSheet';
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
type ChecklistKey = 'first_course' | 'join_discord' | 'first_trade';
const CHECK_KEY = 'tx_checklist';

/**
 * mode 'a': A-18, connected member, first session with tour and checklist.
 * mode 'b': flow B, signed up but not connected yet; no tour or checklist, and the page passes its own overlay (B-03 modal).
 * mode 'b-unlocked': B-09, flow B right after connecting: banner and locks gone, a short celebration, cashback unlocked.
 */
export default function Dashboard({ mode = 'a', overlay }: { mode?: 'a' | 'b' | 'b-unlocked'; overlay?: ReactNode }) {
  const connected = mode !== 'b';
  const firstTour = mode === 'a';
  const justUnlocked = mode === 'b-unlocked';
  const [celebrate, setCelebrate] = useState(justUnlocked);
  const router = useRouter();
  /** B-06: cashback first, ranking locked until an exchange is connected. */
  const unlockables: Unlockable[] = justUnlocked ? [{ label: 'Cashback', state: 'open' }, ...UNLOCKABLES] : connected ? UNLOCKABLES : [
    { label: 'Cashback', state: 'locked', feature: 'cashback' },
    UNLOCKABLES[0], UNLOCKABLES[1],
    { label: 'Leaderboard', state: 'locked', feature: 'ranking' },
    UNLOCKABLES[3]
  ];
  const connectFrom = (source: string) => {
    track('exchange_connect_started', { source });
    router.push('/b/connect');
  };
  /** B-07: a locked item opens a sheet about that feature, with the connect button. */
  const [sheet, setSheet] = useState<LockedFeature | null>(null);
  const locked = (feature: string) => {
    track('locked_feature_clicked', { feature });
    setSheet(feature as LockedFeature);
  };
  const params = useSearchParams();
  const ex = exchangeById(params.get('exchange')) ?? exchangeById('bitunix')!;
  const [name, setName] = useState('');
  const [tourStep, setTourStep] = useState<number | null>(firstTour ? 0 : null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [done, setDone] = useState<Record<ChecklistKey, boolean>>({ first_course: false, join_discord: false, first_trade: false });
  const [listOpen, setListOpen] = useState(true);
  const started = useRef(false);

  const tour: TourStep[] = [
    { target: 'rank', title: 'This is your rank', text: `You start as a Rekrut with $0 volume. Trade on ${ex.name} and you reach Krieger at $1K.` },
    { target: 'unlockables', title: 'What you unlock', text: 'Some rewards are yours already. The rest open as you climb the ranks.' },
    { target: 'tiles', title: 'Where to start', text: 'Courses, the leaderboard, analyses and the community are one click away.' }
  ];

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    try {
      const email = sessionStorage.getItem('tx_email_verified') || '';
      if (email) setName(email.split('@')[0].split(/[._-]/)[0].replace(/^\w/, (c) => c.toUpperCase()));
      const saved = JSON.parse(sessionStorage.getItem(CHECK_KEY) || 'null');
      if (saved) setDone(saved);
      if (sessionStorage.getItem('tx_tour_done')) setTourStep(null);
    } catch { /* first session */ }
    if (window.matchMedia('(max-width: 1023px)').matches) setListOpen(false);
    track('app_session_started', connected ? { connected: true, exchange: ex.id, first_session: firstTour } : { connected: false, first_session: true });
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
    track('checklist_item_clicked', { item: key });
    setDone((c) => { const n = { ...c, [key]: true }; try { sessionStorage.setItem(CHECK_KEY, JSON.stringify(n)); } catch { /* not saved */ } return n; });
  };

  const items: { key: ChecklistKey; label: string; hint: string }[] = [
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
            <p><b>{ex.name} connected. Cashback and ranking are unlocked</b><span>Your trades now count. Make your first trade to start earning and climbing.</span></p>
            <button type="button" className={d.bannerGhost} onClick={() => { track('unlock_celebration_dismissed', { exchange: ex.id }); setCelebrate(false); }}>Got it</button>
          </div>
        )}
        {!connected && (
          <div className={d.banner} role="region" aria-label="Connect your exchange">
            <span className={d.bannerIcon} aria-hidden><Image src="/dashboard/icons/lock.svg" alt="" width={16} height={16} /></span>
            <p><b>Connect to start earning cashback</b><span>Open Bitunix or Pionex through TradeX to unlock cashback and your ranking.</span></p>
            <button type="button" onClick={() => connectFrom('banner')}>Connect exchange</button>
          </div>
        )}
        <header className={d.head}>
          <h1>{name ? `Welcome ${name}!` : 'Welcome to TradeX!'}</h1>
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

      {firstTour && tourStep === null && (
        <aside className={d.checklist} aria-labelledby="checklist-title">
          <button type="button" className={d.checklistHead} onClick={() => setListOpen((o) => !o)} aria-expanded={listOpen} aria-controls="checklist-items">
            <p id="checklist-title">Get started</p>
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
      {sheet && <LockedFeatureSheet feature={sheet} onConnect={() => connectFrom('locked_feature')} onClose={() => setSheet(null)} />}
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
