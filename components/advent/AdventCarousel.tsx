'use client';

/**
 * Advent Calendar · V3 (Nov 20, 2026): the 24 days as a carousel, after the prize-pool widget in Figma
 * (TradeX Platform, node 5332:23887). Left: the prize art (one per prize later; the Kraken art from Figma for now) with
 * the selected day's prize. Right: the days, today a little larger in a minimal card, centred on load.
 * The countdown lives in the stream widget above, not on the art.
 * Click and drag (or swipe, scroll, the arrows, a click on a day): on release the carousel keeps its momentum and eases
 * into the day nearest the centre, like a roulette settling. The day in the centre is the selected one.
 * Card states: drawn days a subtle card with the Drawn tag; today the purple card; coming days only become a card when
 * selected.
 * Events: advent_carousel_scrolled {method}, advent_carousel_day_selected {day}.
 */
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { track } from '@/lib/track';
import { DAYS, KIND_LABEL, WINNERS } from './adventData';
import a from './advent.module.css';

const ease = (t: number) => 1 - Math.pow(1 - t, 4); // fast start, long soft landing

export default function AdventCarousel({ today, ticket, onJoin }: { today: number; ticket: boolean; onJoin: () => void }) {
  const ref = useRef<HTMLOListElement>(null);
  const [selected, setSelected] = useState(today);
  const [dragging, setDragging] = useState(false);
  const anim = useRef(0);
  const justDragged = useRef(false);
  const drag = useRef<{ x: number; left: number; t: number; v: number; moved: boolean } | null>(null);
  const day = DAYS[selected - 1];

  const items = () => [...(ref.current?.querySelectorAll<HTMLElement>('[data-day]') ?? [])];
  /** scrollLeft that puts this item in the middle of the track. */
  const centreOf = (el: HTMLElement) => el.offsetLeft + el.offsetWidth / 2 - (ref.current!.clientWidth / 2);
  const nearest = (left: number) => {
    let best = items()[0]; let gap = Infinity;
    for (const el of items()) { const g = Math.abs(centreOf(el) - left); if (g < gap) { gap = g; best = el; } }
    return best;
  };

  /** Eases the track to an item: the roulette settle. */
  const settle = useCallback((el: HTMLElement, ms?: number) => {
    const track_ = ref.current; if (!track_) return;
    cancelAnimationFrame(anim.current);
    const from = track_.scrollLeft; const to = Math.max(0, Math.min(centreOf(el), track_.scrollWidth - track_.clientWidth));
    const dur = ms ?? Math.min(900, 380 + Math.abs(to - from) * 0.6);
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      track_.scrollLeft = from + (to - from) * ease(t);
      if (t < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
    const d = Number(el.dataset.day); setSelected(d);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Today in the middle on load.
  useEffect(() => {
    const el = items().find((x) => Number(x.dataset.day) === today);
    if (el && ref.current) { ref.current.scrollLeft = centreOf(el); setSelected(today); }
  }, [today]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wheel and trackpad: native scroll, then settle on the nearest day once it stops.
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let timer = 0;
    const onWheel = () => {
      if (drag.current) return;
      cancelAnimationFrame(anim.current);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { settle(nearest(el.scrollLeft)); track('advent_carousel_scrolled', { method: 'wheel' }); }, 140);
    };
    el.addEventListener('wheel', onWheel, { passive: true });
    return () => { el.removeEventListener('wheel', onWheel); window.clearTimeout(timer); };
  }, [settle]); // eslint-disable-line react-hooks/exhaustive-deps

  const down = (e: PointerEvent<HTMLOListElement>) => {
    if (e.button !== 0) return;
    cancelAnimationFrame(anim.current);
    drag.current = { x: e.clientX, left: ref.current!.scrollLeft, t: performance.now(), v: 0, moved: false };
  };
  const move = (e: PointerEvent<HTMLOListElement>) => {
    const d = drag.current; const el = ref.current; if (!d || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) { d.moved = true; setDragging(true); el.setPointerCapture(e.pointerId); }
    if (!d.moved) return;
    const now = performance.now(); const prev = el.scrollLeft;
    el.scrollLeft = d.left - dx;
    const dt = Math.max(1, now - d.t);
    d.v = 0.8 * ((el.scrollLeft - prev) / dt) + 0.2 * d.v; // px per ms, smoothed
    d.t = now;
  };
  const up = () => {
    const d = drag.current; const el = ref.current; drag.current = null;
    if (!d || !el || !d.moved) return;
    setDragging(false);
    justDragged.current = true; window.setTimeout(() => { justDragged.current = false; }, 0);
    // Keep the throw: project where it would coast to, then settle on the day nearest that point.
    const target = nearest(el.scrollLeft + d.v * 260);
    settle(target);
    track('advent_carousel_scrolled', { method: 'drag' });
  };
  // A drag shouldn't also click what's under the pointer.
  const swallow = (e: MouseEvent) => { if (justDragged.current) { e.preventDefault(); e.stopPropagation(); } };

  const stepBy = (dir: -1 | 1) => {
    const next = Math.min(24, Math.max(1, selected + dir));
    const el = items().find((x) => Number(x.dataset.day) === next);
    if (el) { settle(el); track('advent_carousel_scrolled', { method: 'arrow' }); }
  };
  const pick = (el: HTMLElement) => {
    settle(el); track('advent_carousel_day_selected', { day: Number(el.dataset.day) });
  };

  return (
    <section className={a.car} aria-label="24 days of draws">
      <div className={a.carArtWrap}>
        <div className={a.carArt}>
          <div className={a.carWords} aria-hidden>
            {[0.4, 0.6, 0.8, 1].map((o) => <span key={o} style={{ opacity: o }}>Kraken</span>)}
          </div>
          <div className={a.carNoise} aria-hidden />
          <span className={a.carIcon} aria-hidden><Image src="/advent/v3/kraken-glass.svg" alt="" width={315} height={294} /></span>
          <div className={a.carStats} aria-live="polite">
            <span><b>{day.prize}</b><small>Day {selected} prize</small></span>
            <span><b>{selected < today ? 'Drawn' : selected === today ? '1,284' : `${selected} Dec`}</b><small>{selected < today ? `Won by ${WINNERS[selected] ?? '***'}` : selected === today ? 'Tickets today' : 'Draw date'}</small></span>
          </div>
        </div>
      </div>

      <div className={a.carRight}>
        <div className={a.carHead}>
          <span className={a.carHint}>Browse the 24 daily prizes</span>
          <span className={a.carNav}>
            <button type="button" aria-label="Previous day" disabled={selected === 1} onClick={() => stepBy(-1)}><Image src="/advent/v3/chevron-left.svg" alt="" width={20} height={20} /></button>
            <button type="button" aria-label="Next day" disabled={selected === 24} onClick={() => stepBy(1)}><Image src="/advent/v3/chevron-right.svg" alt="" width={20} height={20} /></button>
          </span>
        </div>
        <ol ref={ref} className={`${a.carTrack} ${dragging ? a.carDragging : ''}`}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClickCapture={swallow}>
          {DAYS.map((d) => {
            const state = d.day < today ? 'past' : d.day === today ? 'today' : 'future';
            const sel = d.day === selected;
            const cls = state === 'today' ? a.carToday : `${a.carDay} ${state === 'past' ? a.carPast : ''} ${sel ? a.carSel : ''}`;
            return (
              <li key={d.day} data-day={d.day} className={`${cls} ${sel ? a.carIsSel : ''}`} aria-current={sel ? 'true' : undefined}
                onClick={(e) => pick(e.currentTarget)}>
                <span className={a.carTop}>
                  <span className={a.carLabel}>{d.day} Dec</span>
                  {state === 'today' && <span className={a.todayTag}>Today</span>}
                  {state === 'past' && <span className={a.drawnTag}><svg viewBox="0 0 16 16" width="10" height="10" aria-hidden><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Drawn</span>}
                </span>
                {/* Nov 20, 2026: one thing per corner, every card the same size: day and tag on top, the prize in the middle
                    (one or two lines), the winner or the prize type bottom-left; today adds its action bottom-right. */}
                <b className={a.carValue}>{d.prize}</b>
                <span className={a.carFoot}>
                  <span className={a.carSub}>{state === 'past' ? `Won by ${WINNERS[d.day] ?? 'a member'}` : KIND_LABEL[d.kind]}</span>
                  {state === 'today' && (ticket
                    ? <span className={a.carIn}>You’re in</span>
                    : <button type="button" className={a.cellBtn} onClick={(e) => { e.stopPropagation(); onJoin(); }}>Join now</button>)}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
