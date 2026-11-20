'use client';

/**
 * C-04 day modals (Nov 20, 2026): the left side shows the product behind each day's message, not floating art.
 * Built to the stageshow rules: a believable screen simplified to what the message needs, real words only on the
 * focal content, and motion with a cause (people can click; the cycles restart when they do).
 * Images are the Figma exports already in the project (dashboard tiles and hero), standing in for real course thumbnails.
 */
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { EXCHANGES } from '@/lib/exchanges';
import v from './trialVisuals.module.css';

const DAY_MS = 86400000;
const fmt = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

/** Cycles 0..n-1 every `ms`; picking an item restarts the cycle from there. */
function useCycle(n: number, ms: number) {
  const [i, setI] = useState(0);
  const [seed, setSeed] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((x) => (x + 1) % n), ms);
    return () => window.clearInterval(t);
  }, [n, ms, seed]);
  return [i, (k: number) => { setI(k); setSeed((s) => s + 1); }] as const;
}

export default function TrialVisual({ day, start }: { day: number; start: number | null }) {
  if (day === 1) return <HalfOpen />;
  if (day === 2) return <CoursePlayer />;
  if (day === 3) return <LiveRoom />;
  if (day === 4) return <Leaderboard />;
  if (day === 5) return <PrizePools />;
  if (day === 6) return <DaysLeft start={start} />;
  return <LastDay />;
}

/* Day 1: half of TradeX is open. Six areas, three lit, three locked. */
function HalfOpen() {
  const areas = [
    { label: 'Courses 1–2', icon: 'courses', open: true },
    { label: 'Community', icon: 'community', open: true },
    { label: 'Analyses', icon: 'journal', open: true },
    { label: 'Leaderboard', icon: 'leaderboards', open: false },
    { label: 'Rewards', icon: 'ranks', open: false },
    { label: 'Courses 3+', icon: 'courses', open: false }
  ];
  return (
    <div className={v.panel}>
      <div className={v.grid3}>
        {areas.map((a) => (
          <div key={a.label} className={`${v.area} ${a.open ? v.areaOpen : ''}`}>
            <Image src={a.open ? `/dashboard/icons/${a.icon}.svg` : '/dashboard/icons/lock.svg'} alt="" width={18} height={18} />
            <span>{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Day 2: the beginner course. A player and three lessons; picking a lesson swaps the thumbnail. */
const LESSONS = [
  { title: 'What moves a price', time: '6:12', img: '/dashboard/tile-0.jpg', pos: '70% 30%' },
  { title: 'Reading a chart', time: '8:40', img: '/dashboard/tile-2.jpg', pos: '50% 40%' },
  { title: 'Your first order', time: '5:05', img: '/dashboard/hero.jpg', pos: '30% 40%' }
];
function CoursePlayer() {
  const [i, pick] = useCycle(LESSONS.length, 4000);
  return (
    <div className={v.player}>
      <div className={v.screen}>
        {LESSONS.map((l, k) => (
          <Image key={l.title} className={`${v.thumb} ${k === i ? v.thumbOn : ''}`} src={l.img} alt="" fill sizes="400px" style={{ objectPosition: l.pos }} />
        ))}
        <div className={v.screenShade} />
        <span className={v.play} aria-hidden><svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg></span>
        <div className={v.screenMeta}><span className={v.levelTag}>Level 1 · Lesson {i + 1}</span><b>{LESSONS[i].title}</b></div>
        <div className={v.progress}><span style={{ width: `${18 + i * 26}%` }} /></div>
      </div>
      <div className={v.lessons} role="tablist" aria-label="Lessons">
        {LESSONS.map((l, k) => (
          <button key={l.title} type="button" role="tab" aria-selected={k === i} className={`${v.lesson} ${k === i ? v.lessonOn : ''}`} onClick={() => pick(k)}>
            <span className={v.lessonThumb}><Image src={l.img} alt="" fill sizes="96px" style={{ objectPosition: l.pos }} /></span>
            <span className={v.lessonText}><b>{l.title}</b><small>{l.time}</small></span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* Day 3: live trading with the coaches. A stream and its chat; a new message arrives every few seconds. */
const CHAT = [
  { name: 'Coach Tim', text: 'Watching the 4h close on BTC.', coach: true },
  { name: 'mara_k', text: 'Entry around 96.2k?' },
  { name: 'Coach Tim', text: 'Wait for the retest first.', coach: true },
  { name: 'jonas', text: 'Got it, alert set 👍' },
  { name: 'lea.trades', text: 'First live session, hi all' }
];
function LiveRoom() {
  const [n, setN] = useState(3);
  useEffect(() => {
    const t = window.setInterval(() => setN((x) => (x >= CHAT.length ? 3 : x + 1)), 2600);
    return () => window.clearInterval(t);
  }, []);
  const shown = CHAT.slice(Math.max(0, n - 3), n);
  return (
    <div className={v.room}>
      <div className={v.stream}>
        <Image src="/dashboard/tile-0.jpg" alt="" fill sizes="260px" style={{ objectPosition: '75% 30%' }} />
        <div className={v.screenShade} />
        <span className={v.live}><i />Live</span>
        <span className={v.viewers}>1.2k watching</span>
        <svg className={v.spark} viewBox="0 0 120 36" aria-hidden><polyline points="0,28 14,24 26,26 40,16 52,19 66,10 80,14 94,6 108,9 120,4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
      </div>
      <div className={v.chat}>
        <span className={v.channel}># live-trading</span>
        <ul className={v.messages} aria-live="polite">
          {shown.map((m, k) => (
            <li key={`${n}-${k}`} className={k === shown.length - 1 ? v.msgNew : ''}>
              <b className={m.coach ? v.coach : ''}>{m.name}</b>
              <span>{m.text}</span>
            </li>
          ))}
        </ul>
        <div className={v.composer}>Message #live-trading</div>
      </div>
    </div>
  );
}

/* Day 4: halfway. This month's leaderboard, with the place they'd take once connected. */
function Leaderboard() {
  const rows = [
    { r: 1, name: 'kryp***', vol: '$1.24M', prize: '$8,000' },
    { r: 2, name: 'alex_k***', vol: '$980K', prize: '$6,000' },
    { r: 3, name: 'mara***', vol: '$760K', prize: '$4,500' }
  ];
  return (
    <div className={v.panel}>
      <div className={v.boardHead}><b>November leaderboard</b><span>Bitunix</span></div>
      <ol className={v.board}>
        {rows.map((x) => (
          <li key={x.r}><span className={v.rank}>{x.r}</span><span className={v.boardName}>{x.name}</span><span className={v.vol}>{x.vol}</span><span className={v.prize}>{x.prize}</span></li>
        ))}
        <li className={v.gap} aria-hidden>···</li>
        <li className={v.you}><span className={v.rank}>?</span><span className={v.boardName}>You</span><span className={v.youNote}>Connect to appear here</span></li>
      </ol>
    </div>
  );
}

/* Day 5: what the top traders share. Each exchange's pool and how it splits by place. */
const SPLITS = [32, 20, 14, 9, 7, 5, 4, 3, 3, 3];
function PrizePools() {
  const [i, pick] = useCycle(EXCHANGES.length, 4000);
  const ex = EXCHANGES[i];
  const pool = Number(ex.pool.replace(/\D/g, ''));
  return (
    <div className={`${v.panel} ${ex.id === 'pionex' ? v.exPionex : v.exBitunix}`}>
      <div className={v.poolHead}>
        <div className={v.seg} role="tablist" aria-label="Exchange">
          {EXCHANGES.map((x, k) => (
            <button key={x.id} type="button" role="tab" aria-selected={k === i} className={k === i ? v.segOn : ''} onClick={() => pick(k)}>{x.name}</button>
          ))}
        </div>
        <span className={v.poolLabel}>This month</span>
      </div>
      <b className={v.poolAmount}>{ex.pool}</b>
      <div className={v.bars} aria-label="Prize by place, top 10">
        {SPLITS.map((s, k) => (
          <div key={k} className={v.barCol}>
            <span className={v.barVal}>{k < 3 ? `$${Math.round((pool * s) / 100 / 100) / 10}K` : ''}</span>
            <span className={v.bar} style={{ height: `${s * 2.4}px` }} />
            <span className={v.barPlace}>{k + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Day 6: two days left. The seven days, and what pauses after the last one. */
function DaysLeft({ start }: { start: number | null }) {
  const pause = start !== null ? fmt(new Date(start + 7 * DAY_MS)) : 'day 8';
  return (
    <div className={v.panel}>
      <div className={v.track}>
        {Array.from({ length: 7 }, (_, k) => (
          <span key={k} className={k < 5 ? v.dayDone : k === 5 ? v.dayNow : v.dayLeft}>{k + 1}</span>
        ))}
      </div>
      <p className={v.trackNote}><b>2 days left</b> · pauses {pause}</p>
      <ul className={v.pauseList}>
        {[['courses', 'Courses 1 and 2'], ['community', 'Community and Discord'], ['journal', 'Analyses and journal']].map(([ic, t]) => (
          <li key={t}><Image src={`/dashboard/icons/${ic}.svg`} alt="" width={16} height={16} />{t}<span>Pauses</span></li>
        ))}
      </ul>
    </div>
  );
}

/* Day 7: the last day. A countdown to midnight and the two outcomes side by side. */
function LastDay() {
  const [mode, pick] = useCycle(2, 3500);
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const tick = () => { const n = new Date(); const m = new Date(n); m.setHours(24, 0, 0, 0); setLeft(Math.floor((m.getTime() - n.getTime()) / 1000)); };
    tick(); const t = window.setInterval(tick, 1000); return () => window.clearInterval(t);
  }, []);
  const p = (x: number) => String(x).padStart(2, '0');
  const items = [
    { t: 'Courses 1 and 2', on: 'Stays open', off: 'Paused' },
    { t: 'Community and Discord', on: 'Stays open', off: 'Paused' },
    { t: 'Leaderboard and ranks', on: 'Unlocks', off: 'Locked' }
  ];
  return (
    <div className={v.panel}>
      <div className={v.clock}><span>Pauses in</span><b>{p(Math.floor(left / 3600))}:{p(Math.floor((left % 3600) / 60))}:{p(left % 60)}</b></div>
      <div className={v.seg} role="tablist" aria-label="Outcome">
        {['Connect today', 'Do nothing'].map((x, k) => (
          <button key={x} type="button" role="tab" aria-selected={mode === k} className={mode === k ? v.segOn : ''} onClick={() => pick(k)}>{x}</button>
        ))}
      </div>
      <ul className={v.outcomes}>
        {items.map((x) => (
          <li key={x.t}>{x.t}<span className={mode === 0 ? v.good : v.bad}>{mode === 0 ? x.on : x.off}</span></li>
        ))}
      </ul>
    </div>
  );
}
